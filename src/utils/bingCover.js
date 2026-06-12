import { getBgImage } from '@/services/api'

const CACHE_KEY = 'doniaiNavBingCoverV4'
const CACHE_TIME_KEY = 'doniaiNavBingCoverAtV4'
/** 缓存 12 小时（Bing 每日一图，不必每次打 API） */
const CACHE_TTL_MS = 12 * 60 * 60 * 1000

/** 无 Bing 图时的纯色底（与首页 .cover-layer 一致） */
export const COVER_FALLBACK_STYLE = {
  backgroundColor: '#1a2332',
  backgroundImage: 'none',
}

export function coverStyleFromUrl(url) {
  return url ? { backgroundImage: `url(${url})` } : { ...COVER_FALLBACK_STYLE }
}

let inflight = null
let preloadLinkEl = null

/**
 * 仅使用 cover_4k（UHD）。
 * apiData 可为 /all?type=bing 或 /all 聚合里的 bing 字段。
 */
export function pickCoverUrl(apiData) {
  const body = apiData?.data ?? apiData
  if (!body) return null
  if (apiData?.code != null && apiData.code !== 200) return null
  const d = body.data || body
  return d.cover_4k || null
}

/** 新 URL 是否与当前不同（用于后台更新缓存） */
export function isSharperCover(nextUrl, prevUrl) {
  if (!nextUrl) return false
  if (!prevUrl) return true
  return nextUrl !== prevUrl
}

export function getCachedCover() {
  try {
    const at = parseInt(localStorage.getItem(CACHE_TIME_KEY), 10)
    const url = localStorage.getItem(CACHE_KEY)
    if (!url) return null
    if (!Number.isFinite(at) || Date.now() - at > CACHE_TTL_MS) return null
    return url
  } catch {
    return null
  }
}

export function setCachedCover(url) {
  if (!url) return
  try {
    localStorage.setItem(CACHE_KEY, url)
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
  } catch (e) {
    console.warn('bing cover cache failed', e)
  }
}

export function preloadCover(url) {
  if (!url) return Promise.reject(new Error('empty url'))
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(url)
    img.onerror = () => reject(new Error('preload failed'))
    img.src = url
  })
}

function syncStaticCoverImg(url) {
  if (!url || typeof document === 'undefined') return
  const img = document.getElementById('lcp-cover')
  if (img && img.getAttribute('src') !== url) {
    img.setAttribute('src', url)
  }
}

function injectPreloadLink(url) {
  if (!url || typeof document === 'undefined') return
  syncStaticCoverImg(url)
  if (preloadLinkEl) {
    preloadLinkEl.href = url
    return
  }
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = url
  link.fetchPriority = 'high'
  document.head.appendChild(link)
  preloadLinkEl = link
}

/** 应用启动时调用：读缓存 + 预加载 + 后台刷新 cover_4k */
export function warmBingCover() {
  const cached = getCachedCover()
  if (cached) {
    injectPreloadLink(cached)
    preloadCover(cached).catch(() => {})
  }
  return refreshBingCover({ silent: true })
}

export function refreshBingCover({ silent = false } = {}) {
  if (inflight) return inflight
  const prev = getCachedCover()

  inflight = getBgImage()
    .then(({ data }) => {
      const url = pickCoverUrl(data)
      if (!url) return prev || null
      if (!prev || url !== prev) {
        setCachedCover(url)
        injectPreloadLink(url)
        return preloadCover(url).then(() => url)
      }
      return prev
    })
    .catch((e) => {
      if (!silent) console.warn('fetch bing cover failed', e)
      return prev || null
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}
