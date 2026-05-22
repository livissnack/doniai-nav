import request from '@/utils/request'

export function fetchPrivateNav() {
  return request('get', '/nav/private')
}

export function resetPrivateNav() {
  return request('post', '/nav/private/reset')
}

export function createNavCategory(title) {
  return request('post', '/nav/private/categories', { title })
}

export function updateNavCategory(id, title) {
  return request('put', `/nav/private/categories/${id}`, { title })
}

export function deleteNavCategory(id) {
  return request('delete', `/nav/private/categories/${id}`)
}

export function createNavItem(categoryId, payload) {
  return request('post', `/nav/private/categories/${categoryId}/items`, payload)
}

export function updateNavItem(itemId, payload) {
  return request('put', `/nav/private/items/${itemId}`, payload)
}

export function deleteNavItem(itemId) {
  return request('delete', `/nav/private/items/${itemId}`)
}
