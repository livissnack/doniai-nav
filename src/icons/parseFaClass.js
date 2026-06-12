import { resolveFaIconName } from '@/icons/fa5Aliases'

const PACK_MAP = {
  fas: 'solid',
  fa: 'solid',
  far: 'regular',
  fab: 'brands',
}

export function parseFaClass(value) {
  const result = { pack: 'solid', name: '', spin: false }
  if (!value) return result

  for (const token of String(value).trim().split(/\s+/)) {
    if (token === 'fa-spin') {
      result.spin = true
      continue
    }
    if (PACK_MAP[token]) {
      result.pack = PACK_MAP[token]
      continue
    }
    if (token.startsWith('fa-')) {
      result.name = token.slice(3)
    }
  }

  result.name = resolveFaIconName(result.name)
  return result
}
