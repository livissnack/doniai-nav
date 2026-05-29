import Vue from 'vue'

/**
 * 统一使用 Buefy Snackbar 提示（替代 Toast）
 * @param {Vue|{ $buefy?: object }|null} vm
 * @param {string|{ message?: string, type?: string, duration?: number, position?: string, actionText?: string, queue?: boolean }} options
 */
export function notify(vm, options) {
  const buefy = (vm && vm.$buefy) || Vue.prototype.$buefy
  if (!buefy || !buefy.snackbar) {
    console.warn('[notify] Buefy snackbar 不可用', options)
    return
  }

  const opts = typeof options === 'string' ? { message: options } : options || {}

  return buefy.snackbar.open({
    message: opts.message || '',
    type: opts.type || 'is-info',
    position: opts.position || 'is-bottom-right',
    duration: opts.duration !== undefined ? opts.duration : 3500,
    actionText: opts.actionText !== undefined ? opts.actionText : '关闭',
    queue: opts.queue !== false,
  })
}

/** 安装后：this.$notify() 可用，且 this.$buefy.toast.open 自动走 Snackbar */
export function installNotify(Vue) {
  Vue.prototype.$notify = function (options) {
    return notify(this, options)
  }

  if (Vue.prototype.$buefy) {
    Vue.prototype.$buefy.toast.open = (options) => notify(null, options)
  }
}
