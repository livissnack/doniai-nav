import { ref } from 'vue'

const visible = ref(false)
const percent = ref(0)

let trickleTimer = null
let hideTimer = null
let safetyTimer = null

function clearTimers() {
  if (trickleTimer) {
    clearInterval(trickleTimer)
    trickleTimer = null
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  if (safetyTimer) {
    clearTimeout(safetyTimer)
    safetyTimer = null
  }
}

function setPercent(value) {
  percent.value = Math.max(0, Math.min(100, value))
}

export function startPageProgress() {
  clearTimers()
  visible.value = true
  setPercent(12)

  trickleTimer = setInterval(() => {
    if (percent.value < 88) {
      const step = (90 - percent.value) * 0.08 + Math.random() * 4
      setPercent(percent.value + step)
    }
  }, 180)

  // 路由重定向等异常流程未触发 finish 时自动收尾
  safetyTimer = setTimeout(() => {
    finishPageProgress()
  }, 10000)
}

export function finishPageProgress() {
  clearTimers()
  setPercent(100)
  hideTimer = setTimeout(() => {
    visible.value = false
    setPercent(0)
  }, 320)
}

export function failPageProgress() {
  finishPageProgress()
}

export function usePageProgress() {
  return { visible, percent }
}
