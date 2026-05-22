/**
 * JSON 解析与格式化工具
 */

export function parseJson(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) {
    throw new Error('请输入 JSON 内容')
  }
  return JSON.parse(trimmed)
}

export function validateJson(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) {
    return { valid: false, message: '请输入 JSON 内容' }
  }
  try {
    JSON.parse(trimmed)
    return { valid: true, message: 'JSON 格式正确' }
  } catch (e) {
    return { valid: false, message: e.message || '解析失败' }
  }
}

function indentChar(type) {
  if (type === 'tab') return '\t'
  return ' '.repeat(Number(type) || 2)
}

export function formatJson(text, indentType = 2, keepUnicode = true) {
  const data = parseJson(text)
  const indent = indentChar(indentType)
  let result = JSON.stringify(data, null, indent)
  if (!keepUnicode) {
    result = escapeUnicode(result)
  }
  return result
}

export function minifyJson(text, keepUnicode = true) {
  const data = parseJson(text)
  let result = JSON.stringify(data)
  if (!keepUnicode) {
    result = escapeUnicode(result)
  }
  return result
}

function escapeUnicode(str) {
  return str.replace(/[\u0080-\uFFFF]/g, (ch) => {
    return '\\u' + ('0000' + ch.charCodeAt(0).toString(16)).slice(-4)
  })
}

/** 将 \\uXXXX 转为可读中文（用于展示已格式化的字符串） */
export function decodeUnicodeInText(text) {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  )
}

export function getJsonStats(text) {
  const s = String(text || '')
  return {
    chars: s.length,
    lines: s ? s.split(/\r?\n/).length : 0,
  }
}

export const DEMO_JSON = {
  name: 'Doniai',
  version: 2.1,
  features: ['导航', '工具', 'JSON'],
  meta: {
    site: 'https://www.doniai.com',
    active: true,
  },
  tags: null,
}
