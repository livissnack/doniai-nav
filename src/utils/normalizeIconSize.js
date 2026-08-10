const SIZE_MAP = {
  small: '0.875em',
  medium: '1em',
  large: '1.25em',
  'fa-sm': '0.875em',
  'fa-lg': '1.25em',
  'fa-xl': '1.5em',
  'mdi-18px': '18px',
  'mdi-24px': '24px',
  'mdi-36px': '36px',
  'mdi-48px': '48px',
}

/** Oruga Icon 的 size/customSize 需转成 Iconify 可用的 CSS 长度 */
export function normalizeIconSize(size) {
  if (size == null || size === '') return '1em'
  const key = String(size).trim()
  if (SIZE_MAP[key]) return SIZE_MAP[key]
  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(key)) return key
  if (/^\d+(\.\d+)?$/.test(key)) return `${key}px`
  return '1em'
}
