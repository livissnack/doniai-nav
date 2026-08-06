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

/**
 * Upload with XHR so we can report progress (0–100).
 * @param {File} file
 * @param {string} path
 * @param {{ onProgress?: (pct: number) => void, timeout?: number, conflict?: 'rename'|'overwrite'|'error', signal?: AbortSignal }} [options]
 */
export function uploadFileWithProgress(file, path = '', options = {}) {
  const { onProgress, timeout = 300000, conflict = 'rename', signal } = options
  const baseURL = import.meta.env.VITE_SERVER_URL || ''
  const base = String(baseURL || '').replace(/\/+$/, '')
  const url = `${base}/files/upload`.replace(/([^:]\/)\/+/g, '$1')
  const fd = new FormData()
  fd.append('file', file)
  fd.append('path', path)
  fd.append('conflict', conflict)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.timeout = timeout
    const token = localStorage.getItem('doniaiNavAuthToken')
    if (token) xhr.setRequestHeader('X-Session-Token', token)

    const onAbort = () => {
      try {
        xhr.abort()
      } catch {
        /* ignore */
      }
      reject({ code: 0, msg: '已取消' })
    }
    if (signal) {
      if (signal.aborted) {
        onAbort()
        return
      }
      signal.addEventListener('abort', onAbort, { once: true })
    }

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || typeof onProgress !== 'function') return
      onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)))
    }

    xhr.onload = () => {
      let data = null
      try {
        data = JSON.parse(xhr.responseText || 'null')
      } catch {
        data = null
      }
      if (xhr.status === 200) {
        if (typeof onProgress === 'function') onProgress(100)
        resolve({ data, status: xhr.status })
        return
      }
      reject({
        code: xhr.status,
        msg: data?.message || data?.msg || '上传失败',
      })
    }
    xhr.onerror = () => reject({ code: 0, msg: '网络错误' })
    xhr.ontimeout = () => reject({ code: 408, msg: '上传超时' })
    xhr.send(fd)
  })
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

export function moveFile(path, targetDir = '') {
  return request('put', '/files/move', { path, targetDir })
}

export function copyFile(path, targetDir = '', newName) {
  return request('put', '/files/copy', {
    path,
    targetDir,
    ...(newName ? { newName } : {}),
  })
}

export function batchFiles(action, paths, targetDir = '') {
  return request('post', '/files/batch', { action, paths, targetDir })
}

export function deleteFile(path, permanent = false) {
  return request(
    'delete',
    '/files/item',
    { path },
    permanent ? { headers: { 'X-Permanent-Delete': '1' } } : undefined,
  )
}

export function fetchTrash() {
  return request('get', '/files/trash')
}

export function fetchQuota() {
  return request('get', '/files/quota')
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
    timeout: 120000,
  })
}

/** Authenticated streaming URL for media (supports Range via browser). */
export function streamFileUrl(path) {
  const base = import.meta.env.VITE_SERVER_URL || ''
  const q = new URLSearchParams({ path: String(path || '') })
  const token = localStorage.getItem('doniaiNavAuthToken') || ''
  if (token) q.set('token', token)
  return `${String(base).replace(/\/+$/, '')}/files/raw?${q.toString()}`
}

export async function downloadZipFolder(path, name = 'folder.zip') {
  const baseURL = import.meta.env.VITE_SERVER_URL || ''
  const base = String(baseURL || '').replace(/\/+$/, '')
  const q = new URLSearchParams({ path: String(path || '') })
  const url = `${base}/files/zip?${q.toString()}`
  const headers = {}
  const token = localStorage.getItem('doniaiNavAuthToken')
  if (token) headers['X-Session-Token'] = token
  const res = await fetch(url, { headers })
  if (!res.ok) {
    let msg = '打包下载失败'
    try {
      const data = await res.json()
      msg = data?.message || msg
    } catch {
      /* ignore */
    }
    throw { msg, code: res.status }
  }
  const blob = await res.blob()
  const a = document.createElement('a')
  const obj = URL.createObjectURL(blob)
  a.href = obj
  a.download = name.endsWith('.zip') ? name : `${name}.zip`
  a.click()
  URL.revokeObjectURL(obj)
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
