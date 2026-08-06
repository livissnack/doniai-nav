import request from '@/utils/request'

/** Download unified notes+files backup as tar.gz (ArrayBuffer). */
export function exportBackup() {
  return request('get', '/backup/export', null, {
    responseType: 'arraybuffer',
    timeout: 600000,
  })
}

/** Upload a tar.gz backup to restore notes + files. */
export function importBackup(file) {
  const fd = new FormData()
  fd.append('file', file)
  return request('post', '/backup/import', fd, { timeout: 600000 })
}
