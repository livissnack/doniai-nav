import { prefetchNavMenus } from '@/services/navData'
import { warmBingCover, getCachedCover, preloadCover } from '@/utils/bingCover'
import { runWhenIdle } from '@/utils/defer'
import { warmSidebarBundle } from '@/utils/sidebarWarm'

function prefetchHomeNav() {
  prefetchNavMenus([1, 3, 4, 6])
}

function isHomePath(path) {
  return path === '/' || path === ''
}

/** 应用启动预热：首页延后执行，避免阻塞首屏 */
export function warmApp(options = {}) {
  const path = options.path ?? (typeof window !== 'undefined' ? window.location.pathname : '')
  const onHome = isHomePath(path)

  const coverUrl = getCachedCover()
  if (onHome && coverUrl) {
    preloadCover(coverUrl).catch(() => {})
  }

  if (!onHome) return

  runWhenIdle(() => {
    warmBingCover()
    prefetchHomeNav()
    warmSidebarBundle()
  }, 2000)
}
