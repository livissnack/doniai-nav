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
