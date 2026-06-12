const MENU_NAV_KEY = {
  1: 'homeData',
  2: 'workData',
  3: 'iosData',
  4: 'toolsData',
  5: 'frontendData',
  6: 'shopData',
  7: 'designData',
  8: 'blogData',
  9: 'foreignData',
  10: 'studyData',
}

const PRIVATE_MENU_ID = 2

const LOADERS = {
  homeData: () => import('./nav/homeData.json'),
  workData: () => import('./nav/workData.json'),
  iosData: () => import('./nav/iosData.json'),
  toolsData: () => import('./nav/toolsData.json'),
  frontendData: () => import('./nav/frontendData.json'),
  shopData: () => import('./nav/shopData.json'),
  designData: () => import('./nav/designData.json'),
  blogData: () => import('./nav/blogData.json'),
  foreignData: () => import('./nav/foreignData.json'),
  studyData: () => import('./nav/studyData.json'),
}

const navCache = new Map()
const loadingPromises = new Map()
let privateNavCache = null

export function peekNavData(menuId) {
  if (menuId === PRIVATE_MENU_ID) return privateNavCache
  return navCache.get(menuId) ?? null
}

export function setPrivateNavCache(categories) {
  privateNavCache = Array.isArray(categories) ? categories : null
}

export function invalidatePrivateNavCache() {
  privateNavCache = null
}

export async function loadNavData(menuId) {
  if (menuId === PRIVATE_MENU_ID) {
    return privateNavCache || []
  }

  const cached = navCache.get(menuId)
  if (cached) return cached

  const pending = loadingPromises.get(menuId)
  if (pending) return pending

  const promise = (async () => {
    const key = MENU_NAV_KEY[menuId] || 'homeData'
    const loader = LOADERS[key] || LOADERS.homeData
    const mod = await loader()
    const data = mod.default || []
    navCache.set(menuId, data)
    loadingPromises.delete(menuId)
    return data
  })()

  loadingPromises.set(menuId, promise)
  return promise
}

const DEFAULT_PREFETCH_IDS = [1, 3, 4, 6]

/** 空闲时预加载常用栏目 JSON，加快顶部菜单切换 */
export function prefetchNavMenus(menuIds) {
  const ids = menuIds || DEFAULT_PREFETCH_IDS
  ids.forEach((id) => {
    if (id !== PRIVATE_MENU_ID) {
      loadNavData(id).catch(() => {})
    }
  })
}
