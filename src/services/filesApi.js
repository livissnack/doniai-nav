import request from '@/utils/request'

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
  return request('post', '/files/upload', fd, { timeout: 120000 })
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
  return request('get', '/files/raw', { path }, {
    responseType: 'arraybuffer',
    timeout: 60000,
  })
}

/** Markdown / preview friendly authenticated raw URL (header still preferred for XHR). */
export function downloadFileUrl(path) {
  const base = import.meta.env.VITE_SERVER_URL || ''
  const q = new URLSearchParams({ path: String(path || '') })
  return `${base}files/raw?${q.toString()}`
}

export function isImageFileName(name = '') {
  return /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(name)
}

export function notesUploadDir() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `notes/${y}${m}${day}`
}
