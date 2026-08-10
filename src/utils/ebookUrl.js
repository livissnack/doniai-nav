/** 远程 EPUB 默认 OSS 前缀（可被 VITE_OSS_CDN 覆盖） */
const DEFAULT_EBOOK_CDN = 'https://doniai.oss-cn-shenzhen.aliyuncs.com/'

export function getEbookCdnBase() {
  const raw = import.meta.env.VITE_OSS_CDN || DEFAULT_EBOOK_CDN
  const base = String(raw || '').trim()
  if (!base) return ''
  return base.endsWith('/') ? base : `${base}/`
}

export function resolveRemoteEbookUrl(path) {
  const raw = String(path || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  const file = raw.replace(/^\/+/, '')
  return `${getEbookCdnBase()}${file}`
}

export function resolveEbookSource(path, isLocal = false) {
  if (isLocal) {
    if (path instanceof File || path instanceof Blob) {
      return URL.createObjectURL(path)
    }
    return path
  }
  return resolveRemoteEbookUrl(path)
}
