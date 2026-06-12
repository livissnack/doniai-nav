export function runWhenIdle(fn, timeout = 2000) {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(fn, { timeout })
  } else {
    setTimeout(fn, 1)
  }
}
