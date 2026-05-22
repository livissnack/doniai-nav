import { getBgImage } from '@/services/api'

const CACHE_KEY = 'doniaiNavBingCover'
const CACHE_TIME_KEY = 'doniaiNavBingCoverAt'
/** 缓存 12 小时（Bing 每日一图，不必每次打 API） */
const CACHE_TTL_MS = 12 * 60 * 60 * 1000

export const DEFAULT_COVER =
  'https://hiphup.oss-cn-hangzhou.aliyuncs.com/uploads/images/swiper6.jpg'

let inflight = null
let preloadLinkEl = null

/** 优先用体积更小的图，加快首屏 */
export function pickCoverUrl(apiData) {
  const body = apiData?.data ?? apiData
  if (!body) return null
  if (apiData?.code != null && apiData.code !== 200) return null
  const d = body.data || body
  return d.cover_1080 || d.cover || d.cover_4k || d.url || null
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

function injectPreloadLink(url) {
  if (!url || typeof document === 'undefined') return
  if (preloadLinkEl) {
    preloadLinkEl.href = url
    return
  }
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = url
  document.head.appendChild(link)
  preloadLinkEl = link
}

/** 应用启动时调用：读缓存 + 预加载 + 后台刷新 */
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
  inflight = getBgImage()
    .then(({ data }) => {
      const url = pickCoverUrl(data)
      if (url) {
        setCachedCover(url)
        injectPreloadLink(url)
        return preloadCover(url).then(() => url)
      }
      return null
    })
    .catch((e) => {
      if (!silent) console.warn('fetch bing cover failed', e)
      return null
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}
