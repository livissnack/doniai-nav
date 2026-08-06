/**
 * Minimal Univer slide data + pptx text round-trip (OSS, no Pro exchange server).
 */

const PAGE_TYPE_SLIDE = 0
const ELEMENT_TEXT = 2

function makeTextElement(id, text, opts = {}) {
  return {
    id,
    zIndex: opts.zIndex || 1,
    left: opts.left ?? 60,
    top: opts.top ?? 80,
    width: opts.width ?? 840,
    height: opts.height ?? 120,
    title: '',
    description: '',
    type: ELEMENT_TEXT,
    richText: {
      text: String(text || ''),
    },
  }
}

export function createBlankSlideData(title = '演示文稿') {
  const pageId = 'page_1'
  const elId = 'text_1'
  return {
    id: `slide_${Date.now()}`,
    title,
    pageSize: { width: 960, height: 540 },
    body: {
      pageOrder: [pageId],
      pages: {
        [pageId]: {
          id: pageId,
          pageType: PAGE_TYPE_SLIDE,
          zIndex: 1,
          title: '幻灯片 1',
          description: '',
          pageBackgroundFill: { rgb: '#FFFFFF' },
          pageElements: {
            [elId]: makeTextElement(elId, '点击编辑内容', { top: 200, height: 80 }),
          },
        },
      },
    },
  }
}

export function textsToSlideData(slideTexts, title = '演示文稿') {
  const texts = (slideTexts || []).filter((t) => String(t || '').trim())
  if (!texts.length) return createBlankSlideData(title)

  const pageOrder = []
  const pages = {}
  texts.forEach((raw, i) => {
    const pageId = `page_${i + 1}`
    pageOrder.push(pageId)
    const lines = String(raw).split(/\n+/).map((s) => s.trim()).filter(Boolean)
    const heading = lines[0] || `幻灯片 ${i + 1}`
    const body = lines.slice(1).join('\n')
    const elements = {
      title: makeTextElement('title', heading, {
        top: 80,
        height: 70,
        zIndex: 2,
      }),
    }
    if (body) {
      elements.body = makeTextElement('body', body, {
        top: 180,
        height: 280,
        zIndex: 1,
      })
    }
    pages[pageId] = {
      id: pageId,
      pageType: PAGE_TYPE_SLIDE,
      zIndex: i + 1,
      title: heading.slice(0, 40),
      description: '',
      pageBackgroundFill: { rgb: '#FFFFFF' },
      pageElements: elements,
    }
  })

  return {
    id: `slide_${Date.now()}`,
    title,
    pageSize: { width: 960, height: 540 },
    body: { pageOrder, pages },
  }
}

/** Extract text blocks per slide from a pptx ArrayBuffer via OOXML. */
export async function arrayBufferToSlideData(buf, fileName = 'presentation.pptx') {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(buf)
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
    .sort((a, b) => {
      const na = Number((a.match(/slide(\d+)/i) || [])[1] || 0)
      const nb = Number((b.match(/slide(\d+)/i) || [])[1] || 0)
      return na - nb
    })

  const texts = []
  for (const path of slideFiles) {
    const xml = await zip.files[path].async('string')
    const parts = []
    const re = /<a:t(?![^>]*\/>)[^>]*>([\s\S]*?)<\/a:t>/g
    let m
    while ((m = re.exec(xml))) {
      const t = m[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim()
      if (t) parts.push(t)
    }
    texts.push(parts.join('\n') || `幻灯片 ${texts.length + 1}`)
  }

  const title = String(fileName || '演示文稿').replace(/\.[^.]+$/, '') || '演示文稿'
  return textsToSlideData(texts, title)
}

function collectSlideTexts(snapshot) {
  const order = snapshot?.body?.pageOrder || []
  const pages = snapshot?.body?.pages || {}
  return order.map((id, idx) => {
    const page = pages[id]
    if (!page) return `幻灯片 ${idx + 1}`
    const els = Object.values(page.pageElements || {})
    const chunks = els
      .sort((a, b) => (a.top || 0) - (b.top || 0))
      .map((el) => el.richText?.text || el.shape?.text || '')
      .filter(Boolean)
    return chunks.join('\n') || page.title || `幻灯片 ${idx + 1}`
  })
}

export async function slideSnapshotToPptxBlob(snapshot, fileName = 'presentation.pptx') {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  pptx.author = 'doniai-nav'
  pptx.title = snapshot?.title || fileName
  const texts = collectSlideTexts(snapshot)
  if (!texts.length) texts.push('空演示文稿')

  for (const raw of texts) {
    const lines = String(raw).split(/\n/).map((s) => s.trim()).filter(Boolean)
    const slide = pptx.addSlide()
    if (lines[0]) {
      slide.addText(lines[0], {
        x: 0.5,
        y: 0.6,
        w: 9,
        h: 1,
        fontSize: 28,
        bold: true,
        color: '1E293B',
      })
    }
    if (lines.length > 1) {
      slide.addText(lines.slice(1).join('\n'), {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 4,
        fontSize: 16,
        color: '334155',
      })
    }
  }

  const out = await pptx.write({ outputType: 'blob' })
  return out instanceof Blob
    ? out
    : new Blob([out], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })
}
