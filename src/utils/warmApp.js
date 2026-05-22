import { warmBingCover, getCachedCover, preloadCover, DEFAULT_COVER } from '@/utils/bingCover'
import { readCache, writeCache } from '@/utils/apiCache'
import { getHotNews, getWeather } from '@/services/api'

const NEWS_KEY = 'doniaiNavCacheNews'
const WEATHER_KEY = 'doniaiNavCacheWeather'
const NEWS_TTL = 5 * 60 * 1000
const WEATHER_TTL = 10 * 60 * 1000

function idle(fn) {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(fn, { timeout: 2000 })
  } else {
    setTimeout(fn, 1)
  }
}

function warmSidebarApis() {
  if (!readCache(NEWS_KEY, NEWS_TTL)) {
    getHotNews()
      .then(({ data }) => writeCache(NEWS_KEY, data))
      .catch(() => {})
  }
  if (!readCache(WEATHER_KEY, WEATHER_TTL)) {
    getWeather()
      .then(({ data }) => writeCache(WEATHER_KEY, data))
      .catch(() => {})
  }
}

function prefetchHomeChunks() {
  idle(() => {
    import(/* webpackPrefetch: true */ '@/views/Home.vue').catch(() => {})
    import(/* webpackPrefetch: true */ '@/services/data.json').catch(() => {})
  })
}

function preloadBingFromCache() {
  const url = getCachedCover() || DEFAULT_COVER
  preloadCover(url).catch(() => {})
}

/** 应用启动预热：背景图、侧栏 API、首页分包 */
export function warmApp() {
  preloadBingFromCache()
  warmBingCover()
  warmSidebarApis()
  prefetchHomeChunks()
}
