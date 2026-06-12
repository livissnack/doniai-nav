import { shallowRef } from 'vue'

/** 当前页面侧栏挂载点，全局 Sidebar 通过 Teleport 渲染到此节点 */
export const sidebarHost = shallowRef(null)

export function registerSidebarHost(el) {
  if (el) sidebarHost.value = el
}

export function unregisterSidebarHost(el) {
  if (sidebarHost.value === el) sidebarHost.value = null
}
