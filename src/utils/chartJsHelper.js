import { Chart, registerables } from 'chart.js'

let registered = false

function ensureRegistered() {
  if (registered) return
  Chart.register(...registerables)
  registered = true
}

export function createChart(canvas, config) {
  if (!canvas) return null
  ensureRegistered()
  return new Chart(canvas, config)
}

export function destroyChart(chart) {
  if (chart) {
    chart.destroy()
  }
}

/** 销毁旧实例并创建新图表，避免更新时状态错乱 */
export function replaceChart(chart, canvas, config) {
  destroyChart(chart)
  return createChart(canvas, config)
}

export function resizeChart(chart) {
  if (chart) chart.resize()
}
