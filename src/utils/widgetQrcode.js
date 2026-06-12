const WIDGET_QRCODE_SRC =
  'https://passer-by.com/widget-qrcode/dist/widget-qrcode.min.js'

let loadPromise = null

export function loadWidgetQrcode() {
  if (typeof customElements !== 'undefined' && customElements.get('widget-qrcode')) {
    return Promise.resolve()
  }

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-widget-qrcode="true"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('widget-qrcode load failed')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = WIDGET_QRCODE_SRC
    script.async = true
    script.dataset.widgetQrcode = 'true'
    script.onload = () => resolve()
    script.onerror = () => {
      loadPromise = null
      reject(new Error('widget-qrcode load failed'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
