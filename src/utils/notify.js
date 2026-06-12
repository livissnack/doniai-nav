import { getCurrentInstance } from 'vue'

function mapVariant(type) {
  if (!type) return 'is-info'
  const t = String(type)
  return t.startsWith('is-') ? t : `is-${t.replace(/^is-/, '')}`
}

function mapPosition(position) {
  const map = {
    'is-top': 'notify-top',
    'is-bottom': 'notify-bottom',
    'is-top-right': 'notify-top-right',
    'is-top-left': 'notify-top-left',
    'is-bottom-right': 'notify-bottom-right',
    'is-bottom-left': 'notify-bottom-left',
  }
  return map[position] || 'notify-bottom-right'
}

let styleInjected = false

function ensureStyles() {
  if (styleInjected) return
  styleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    .doniai-notify {
      position: fixed;
      z-index: 9999;
      min-width: 220px;
      max-width: 420px;
      padding: 12px 16px;
      border-radius: 8px;
      color: #fff;
      box-shadow: 0 8px 24px rgba(15,23,42,.18);
      font-size: 14px;
      line-height: 1.5;
      animation: doniai-notify-in .2s ease;
    }
    .doniai-notify.notify-top { top: 16px; left: 50%; transform: translateX(-50%); }
    .doniai-notify.notify-bottom { bottom: 16px; left: 50%; transform: translateX(-50%); }
    .doniai-notify.notify-top-right { top: 16px; right: 16px; }
    .doniai-notify.notify-top-left { top: 16px; left: 16px; }
    .doniai-notify.notify-bottom-right { bottom: 16px; right: 16px; }
    .doniai-notify.notify-bottom-left { bottom: 16px; left: 16px; }
    .doniai-notify.is-success { background: #20bc56; }
    .doniai-notify.is-danger { background: #ff3860; }
    .doniai-notify.is-warning { background: #ffd83d; color: #1f2937; }
    .doniai-notify.is-info { background: #0e71de; }
    @keyframes doniai-notify-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
  document.head.appendChild(style)
}

export function notify(vm, options) {
  const opts = typeof options === 'string' ? { message: options } : options || {}
  ensureStyles()

  const el = document.createElement('div')
  el.className = `doniai-notify ${mapVariant(opts.type)} ${mapPosition(opts.position)}`
  el.textContent = opts.message || ''

  document.body.appendChild(el)
  const duration = opts.duration !== undefined ? opts.duration : 3500
  const timer = setTimeout(() => {
    el.remove()
  }, duration)

  return {
    close() {
      clearTimeout(timer)
      el.remove()
    },
  }
}

export function installNotify(app) {
  const open = (options) => notify(null, options)

  app.config.globalProperties.$notify = function (options) {
    return notify(this, options)
  }
  app.config.globalProperties.$toast = { open }
}

export function useNotify() {
  const inst = getCurrentInstance()
  return (options) => notify(inst?.proxy, options)
}
