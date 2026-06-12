export function confirmDialog(options = {}) {
  const ok = window.confirm(
    [options.title, options.message].filter(Boolean).join('\n\n')
  )
  if (ok) {
    options.onConfirm && options.onConfirm()
  } else {
    options.onCancel && options.onCancel()
  }
}

export function installDialog(app) {
  const dialog = {
    confirm: confirmDialog,
  }
  app.config.globalProperties.$dialog = dialog
  app.provide('dialog', dialog)
}
