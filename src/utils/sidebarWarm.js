import { getAllAggregated } from '@/services/api'
import { readCache, writeCache } from '@/utils/apiCache'
import { pickCoverUrl, setCachedCover, preloadCover } from '@/utils/bingCover'

const NEWS_KEY = 'doniaiNavCacheNews'
const WEATHER_KEY = 'doniaiNavCacheWeather'
const MUSIC_KEY = 'doniaiNavCacheMusic'
const RATE_KEY = 'doniaiNavCacheRate'
const FUEL_KEY = 'doniaiNavCacheFuel'

const NEWS_TTL = 5 * 60 * 1000
const WEATHER_TTL = 10 * 60 * 1000
const MUSIC_TTL = 30 * 60 * 1000
const PRICE_TTL = 10 * 60 * 1000

let bundleInflight = null

function normalizeMusicList(list) {
  if (!Array.isArray(list)) return []
  return list.map((item) => ({
    name: item.name,
    artist: item.artist,
    url: item.url,
    cover: item.pic,
    lrc: item.lrc,
  }))
}

export function hydrateSidebarCaches(bundle) {
  if (!bundle || typeof bundle !== 'object') return

  if (bundle.news) writeCache(NEWS_KEY, bundle.news)
  if (bundle.weather) writeCache(WEATHER_KEY, bundle.weather)
  if (bundle.exchange_rate) writeCache(RATE_KEY, bundle.exchange_rate)
  if (bundle.fuel_price) writeCache(FUEL_KEY, bundle.fuel_price)

  const music = normalizeMusicList(bundle.music)
  if (music.length) writeCache(MUSIC_KEY, music)

  if (bundle.bing) {
    const url = pickCoverUrl(bundle.bing)
    if (url) {
      setCachedCover(url)
      preloadCover(url).catch(() => {})
    }
  }
}

function sidebarCachesFresh() {
  return (
    readCache(NEWS_KEY, NEWS_TTL) &&
    readCache(WEATHER_KEY, WEATHER_TTL) &&
    readCache(MUSIC_KEY, MUSIC_TTL) &&
    readCache(RATE_KEY, PRICE_TTL) &&
    readCache(FUEL_KEY, PRICE_TTL)
  )
}

/** 一次请求 /all 预热侧栏各模块缓存，减少首页 5~6 次往返 */
export function warmSidebarBundle() {
  if (sidebarCachesFresh()) return Promise.resolve()

  if (bundleInflight) return bundleInflight

  bundleInflight = getAllAggregated()
    .then(({ data }) => {
      hydrateSidebarCaches(data)
    })
    .catch(() => {})
    .finally(() => {
      bundleInflight = null
    })

  return bundleInflight
}
