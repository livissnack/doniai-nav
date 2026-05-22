/**
 * 接口结果本地缓存（stale-while-revalidate）
 */

export function readCache(key, ttlMs) {
  try {
    const raw = localStorage.getItem(key)
    const at = parseInt(localStorage.getItem(`${key}_at`), 10)
    if (!raw || !Number.isFinite(at) || Date.now() - at > ttlMs) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(`${key}_at`, String(Date.now()))
  } catch (e) {
    console.warn('api cache write failed', key, e)
  }
}

/** 先返回缓存，后台刷新并回调 onFresh */
export function staleWhileRevalidate(key, ttlMs, fetcher, onFresh) {
  const cached = readCache(key, ttlMs)
  const task = fetcher()
    .then((data) => {
      writeCache(key, data)
      if (onFresh) onFresh(data)
      return data
    })
    .catch(() => null)

  if (cached != null) {
    task.catch(() => {})
    return Promise.resolve(cached)
  }
  return task
}
