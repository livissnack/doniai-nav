/** Media helpers for file manager preview */

export function isVideoExt(ext = '') {
  return ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.m4v', '.mkv', '.avi', '.3gp', '.flv'].includes(
    String(ext).toLowerCase(),
  )
}

export function isAudioExt(ext = '') {
  return ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.oga', '.opus'].includes(
    String(ext).toLowerCase(),
  )
}

export function mediaMime(ext = '') {
  const e = String(ext).toLowerCase()
  const map = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.ogv': 'video/ogg',
    '.mov': 'video/quicktime',
    '.m4v': 'video/x-m4v',
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
    '.3gp': 'video/3gpp',
    '.flv': 'video/x-flv',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.m4a': 'audio/mp4',
    '.oga': 'audio/ogg',
    '.opus': 'audio/opus',
  }
  return map[e] || ''
}
