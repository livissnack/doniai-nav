import Epub from '@likecoin/epub-ts'
import { resolveEbookSource } from '@/utils/ebookUrl'

let objectUrl = null

function releaseObjectUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

export async function openEbookReader({
  path,
  isLocal = false,
  containerId = 'bookDom',
  fontSizeVal,
  themeList,
  currentBookIndex = 0,
  renditionOptions = {},
  onCover,
}) {
  releaseObjectUrl()

  const bookUrl = resolveEbookSource(path, isLocal)
  if (isLocal && (path instanceof File || path instanceof Blob)) {
    objectUrl = bookUrl
  }

  const book = Epub(bookUrl)
  const rendition = book.renderTo(containerId, {
    method: 'default',
    manager: 'default',
    width: '100%',
    height: '100%',
    view: 'iframe',
    flow: 'scrolled',
    snap: true,
    allowScriptedContent: true,
    ...renditionOptions,
  })

  rendition.themes.fontSize(fontSizeVal)
  themeList.forEach((theme) => {
    rendition.themes.register(theme.name, theme.style)
  })

  await book.ready
  const navigation = await book.loaded.navigation
  const directory = navigation?.toc || []
  const index = Math.min(Math.max(currentBookIndex, 0), Math.max(directory.length - 1, 0))
  const curNav = directory[index]

  if (curNav?.href) {
    await rendition.display(curNav.href)
  }

  if (onCover) {
    book.coverUrl()
      .then((url) => onCover(url))
      .catch(() => onCover(''))
  }

  return { book, rendition, directory, currentNav: curNav, currentBookIndex: index }
}

export function destroyEbookReader(rendition) {
  releaseObjectUrl()
  if (!rendition) return
  try {
    rendition.destroy()
  } catch {
    // ignore teardown errors
  }
}
