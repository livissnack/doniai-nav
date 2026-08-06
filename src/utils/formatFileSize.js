/** Format byte size for display (IEC binary units). */
export function formatFileSize(bytes) {
  const n = typeof bytes === 'bigint' ? Number(bytes) : Number(bytes)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let v = n
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i += 1
  }
  const digits = i === 0 ? 0 : v >= 100 ? 0 : v >= 10 ? 1 : 2
  return `${v.toFixed(digits)} ${units[i]}`
}

export function normalizeFileItem(raw) {
  if (!raw || typeof raw !== 'object') return null
  const name = String(raw.name || '')
  const path = String(raw.path || name).replace(/\\/g, '/')
  const isDir = !!(raw.isDir ?? raw.is_dir ?? raw.isdir)
  const sizeRaw = raw.size ?? raw.Size ?? raw.fileSize ?? raw.length
  const size = Number(sizeRaw)
  const updatedAt = Number(raw.updatedAt ?? raw.updated_at ?? raw.mtime ?? 0)
  let ext = String(raw.ext || '')
  if (!ext && !isDir && name.includes('.')) {
    const i = name.lastIndexOf('.')
    ext = i >= 0 ? name.slice(i).toLowerCase() : ''
  }
  return {
    ...raw,
    name,
    path,
    isDir,
    size: Number.isFinite(size) ? size : 0,
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
    ext: ext.toLowerCase(),
  }
}
