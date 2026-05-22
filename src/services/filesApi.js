import axios from 'axios'
import request from '@/utils/request'

function authHeaders() {
  const headers = {}
  const token = process.env.VUE_APP_SECRET_KEY
  if (token) headers.Authorization = `Bearer ${token}`
  const session = localStorage.getItem('doniaiNavAuthToken')
  if (session) headers['X-Session-Token'] = session
  return headers
}

export function fetchFileList(path = '') {
  return request('get', '/files/list', { path })
}

export function createFolder(path, name) {
  return request('post', '/files/folder', { path, name })
}

export function uploadFile(file, path = '') {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('path', path)
  return request('post', '/files/upload', fd)
}

export function uploadBinary(file, path) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('path', path)
  return request('put', '/files/binary', fd)
}

export function renameFile(path, newName) {
  return request('put', '/files/rename', { path, newName })
}

export function deleteFile(path) {
  return request('delete', '/files/item', { path })
}

export function fetchFileText(path) {
  return request('get', '/files/text', { path })
}

export function saveFileText(path, content) {
  return request('put', '/files/text', { path, content })
}

export function fetchFileBlob(path) {
  return axios.get(`${process.env.VUE_APP_SERVER_URL}files/raw`, {
    params: { path },
    responseType: 'arraybuffer',
    headers: authHeaders(),
    timeout: 60000,
  })
}

export function downloadFileUrl(path) {
  const base = process.env.VUE_APP_SERVER_URL || ''
  const token = localStorage.getItem('doniaiNavAuthToken') || ''
  const q = new URLSearchParams({ path })
  return `${base}files/raw?${q.toString()}&_t=${Date.now()}`
}
