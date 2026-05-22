import request from '@/utils/request'

export function loginApi(payload) {
  return request('post', '/auth/login', payload)
}

export function registerApi(payload) {
  return request('post', '/auth/register', payload)
}

export function fetchMeApi() {
  return request('get', '/auth/me')
}

export function fetchPanelsApi() {
  return request('get', '/auth/panels')
}

export function updatePanelsApi(panels) {
  return request('put', '/auth/panels', { panels })
}

export function logoutApi() {
  return request('post', '/auth/logout')
}

export function changePasswordApi(payload) {
  return request('put', '/auth/password', payload)
}
