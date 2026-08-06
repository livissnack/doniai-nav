/** Pure helpers for FilesPanel list UX */

export function collapseBreadcrumb(segments, maxVisible = 4) {
  const segs = Array.isArray(segments) ? segments : []
  if (segs.length <= maxVisible) {
    return { head: [], middle: [], tail: segs.map((name, i) => ({ name, index: i })) }
  }
  const keepTail = 2
  const head = [{ name: segs[0], index: 0 }]
  const tailStart = segs.length - keepTail
  const middle = segs.slice(1, tailStart).map((name, i) => ({ name, index: i + 1 }))
  const tail = segs.slice(tailStart).map((name, i) => ({ name, index: tailStart + i }))
  return { head, middle, tail }
}

export function filterAndSortItems(items, { keyword = '', sortKey = 'name', sortDir = 'asc' } = {}) {
  const kw = String(keyword || '').trim().toLowerCase()
  let list = Array.isArray(items) ? [...items] : []
  if (kw) {
    list = list.filter((i) => String(i.name || '').toLowerCase().includes(kw))
  }
  const dir = sortDir === 'desc' ? -1 : 1
  list.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
    let cmp = 0
    if (sortKey === 'size') {
      cmp = (Number(a.size) || 0) - (Number(b.size) || 0)
    } else if (sortKey === 'mtime') {
      cmp = (Number(a.updatedAt) || 0) - (Number(b.updatedAt) || 0)
    } else {
      cmp = String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN', { sensitivity: 'base' })
    }
    return cmp * dir
  })
  return list
}

export function formatQuota(bytes) {
  const n = Number(bytes) || 0
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}
