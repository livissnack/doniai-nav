import request from '@/utils/request'

export function fetchMonitorSites() {
  return request('get', '/monitor/sites')
}

export function fetchManageSites() {
  return request('get', '/monitor/sites/manage')
}

export function createMonitorSite(payload) {
  return request('post', '/monitor/sites', payload)
}

export function updateMonitorSite(id, payload) {
  return request('put', `/monitor/sites/${id}`, payload)
}

export function deleteMonitorSite(id) {
  return request('delete', `/monitor/sites/${id}`)
}

export function checkMonitorSite(id) {
  return request('post', `/monitor/sites/${id}/check`)
}

export function checkAllMonitorSites() {
  return request('post', '/monitor/check-all')
}
