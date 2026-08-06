/**
 * Build empty file blobs for “新建文件” in the file manager.
 */

export const NEW_FILE_TYPES = [
  {
    kind: 'docx',
    label: 'Word 文档',
    ext: '.docx',
    defaultBase: '未命名文档',
    icon: 'file-word',
  },
  {
    kind: 'xlsx',
    label: 'Excel 表格',
    ext: '.xlsx',
    defaultBase: '未命名表格',
    icon: 'file-excel',
  },
  {
    kind: 'pptx',
    label: 'PPT 演示',
    ext: '.pptx',
    defaultBase: '未命名演示',
    icon: 'file-powerpoint',
  },
  {
    kind: 'txt',
    label: '文本文件',
    ext: '.txt',
    defaultBase: '未命名文本',
    icon: 'file-alt',
  },
  {
    kind: 'md',
    label: 'Markdown',
    ext: '.md',
    defaultBase: '未命名笔记',
    icon: 'file-alt',
  },
]

function mimeFor(kind) {
  if (kind === 'docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  if (kind === 'xlsx') {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }
  if (kind === 'pptx') {
    return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
  if (kind === 'md') return 'text/markdown'
  return 'text/plain'
}

export async function buildEmptyFileBlob(kind) {
  if (kind === 'txt') {
    return new Blob([''], { type: mimeFor(kind) })
  }
  if (kind === 'md') {
    return new Blob(['# \n\n'], { type: mimeFor(kind) })
  }
  if (kind === 'docx') {
    const { documentSnapshotToDocxBlob, textToDocumentData } = await import('./univerDoc.js')
    return documentSnapshotToDocxBlob(textToDocumentData(''), 'document.docx')
  }
  if (kind === 'xlsx') {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([[]])
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    return new Blob([buf], { type: mimeFor(kind) })
  }
  if (kind === 'pptx') {
    const { createBlankSlideData, slideSnapshotToPptxBlob } = await import('./univerSlide.js')
    return slideSnapshotToPptxBlob(createBlankSlideData('未命名演示'), 'presentation.pptx')
  }
  throw new Error(`不支持的文件类型: ${kind}`)
}

export function normalizeNewFileName(raw, ext) {
  let name = String(raw || '').trim()
  if (!name) return ''
  name = name.replace(/[\\/:*?"<>|]/g, '_')
  const lower = name.toLowerCase()
  if (!lower.endsWith(ext.toLowerCase())) {
    name += ext
  }
  return name
}

export function uniqueFileName(baseName, existingNames = []) {
  const set = new Set((existingNames || []).map((n) => String(n).toLowerCase()))
  if (!set.has(baseName.toLowerCase())) return baseName
  const dot = baseName.lastIndexOf('.')
  const stem = dot > 0 ? baseName.slice(0, dot) : baseName
  const ext = dot > 0 ? baseName.slice(dot) : ''
  let i = 1
  let candidate = `${stem} (${i})${ext}`
  while (set.has(candidate.toLowerCase())) {
    i += 1
    candidate = `${stem} (${i})${ext}`
  }
  return candidate
}

export function joinFilePath(dir, name) {
  const d = String(dir || '').replace(/^\/+|\/+$/g, '')
  return d ? `${d}/${name}` : name
}
