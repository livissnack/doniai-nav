export function runWhenIdle(fn, timeout = 2000) {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(fn, { timeout })
  } else {
    setTimeout(fn, 1)
  }
}

/** 等两帧并完成一次空闲调度，再执行会触发布局的第三方初始化（如 APlayer） */
export function yieldToMain(timeout = 2500) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof window !== 'undefined' && window.requestIdleCallback) {
          window.requestIdleCallback(() => resolve(), { timeout })
        } else {
          setTimeout(resolve, 50)
        }
      })
    })
  })
}
