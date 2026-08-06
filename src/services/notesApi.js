import request from '@/utils/request'

export function fetchProjects() {
  return request('get', '/notes/projects')
}

export function createProject(payload) {
  return request('post', '/notes/projects', payload)
}

export function updateProject(id, payload) {
  return request('put', `/notes/projects/${id}`, payload)
}

export function deleteProject(id) {
  return request('delete', `/notes/projects/${id}`)
}

export function fetchPages(projectId) {
  return request('get', `/notes/projects/${projectId}/pages`)
}

export function createPage(payload) {
  return request('post', '/notes/pages', payload)
}

export function fetchPage(id) {
  return request('get', `/notes/pages/${id}`)
}

export function updatePage(id, payload) {
  return request('put', `/notes/pages/${id}`, payload)
}

export function deletePage(id) {
  return request('delete', `/notes/pages/${id}`)
}

export function createShare(pageId, payload) {
  return request('post', `/notes/pages/${pageId}/shares`, payload)
}

export function fetchSharedPage(token) {
  return request('get', `/notes/shares/${token}`)
}

export function revokeShare(token) {
  return request('delete', `/notes/shares/${token}`)
}

export function exportProject(projectId) {
  return request('get', `/notes/projects/${projectId}/export`)
}

export function exportAllNotes() {
  return request('get', '/notes/export')
}

export function importNotes(payload) {
  return request('post', '/notes/import', payload)
}

/** @deprecated use importNotes */
export function importProject(payload) {
  return importNotes(payload)
}

export function fetchNotesSettings() {
  return request('get', '/notes/settings')
}

export function updateNotesSettings(payload) {
  return request('put', '/notes/settings', payload)
}

export function deepseekComplete(payload) {
  return request('post', '/ai/deepseek/complete', payload)
}
