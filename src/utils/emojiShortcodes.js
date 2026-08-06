import * as emoji from 'node-emoji'

/** Popular shortcodes pinned at the top of the picker */
export const EMOJI_PICKER_FEATURED = [
  'tada', 'sparkles', 'fire', 'rocket', 'star', 'star2', 'boom', 'zap',
  'heart', 'hearts', 'yellow_heart', 'green_heart', 'blue_heart', 'purple_heart', 'broken_heart',
  'thumbsup', 'thumbsdown', 'ok_hand', 'clap', 'wave', 'pray', 'muscle', 'eyes',
  'smile', 'smiley', 'grinning', 'joy', 'rofl', 'wink', 'blush', 'thinking',
  'sunglasses', 'nerd_face', 'slightly_smiling_face', 'neutral_face', 'confused', 'cry', 'sob', 'scream',
  '100', 'heavy_check_mark', 'x', 'warning', 'exclamation', 'question', 'bulb', 'speech_balloon',
  'memo', 'pencil2', 'book', 'books', 'link', 'lock', 'key',
  'computer', 'iphone', 'gear', 'wrench', 'hammer', 'calendar', 'alarm_clock',
  'sunny', 'cloud', 'umbrella', 'snowflake', 'rainbow', 'earth_asia', 'coffee', 'pizza',
  'apple', 'banana', 'cake', 'beer', 'wine_glass', 'gift', 'balloon', 'trophy',
  'soccer', 'basketball', 'video_game', 'musical_note', 'headphones', 'camera', 'movie_camera', 'art',
  'house', 'office', 'car', 'airplane', 'ship', 'bike', 'runner', 'walking',
  'dog', 'cat', 'unicorn', 'panda_face', 'fox_face', 'lion', 'tiger', 'monkey_face',
  '+1', '-1', 'white_check_mark', 'negative_squared_cross_mark', 'soon', 'new', 'free', 'cool',
]

const keepShortcode = (name) => `:${name}:`

function toItem(name, ch) {
  return { name, emoji: ch, shortcode: `:${name}:` }
}

let cachedAll = null
let cachedFeatured = null

function buildFeatured() {
  if (cachedFeatured) return cachedFeatured
  const seen = new Set()
  const list = []
  for (const name of EMOJI_PICKER_FEATURED) {
    const ch = emoji.get(name)
    if (!ch || seen.has(name)) continue
    seen.add(name)
    list.push(toItem(name, ch))
  }
  cachedFeatured = { list, seen }
  return cachedFeatured
}

/** Lazy-built full catalog: featured first, then the rest */
export function listAllEmojis() {
  if (cachedAll) return cachedAll
  const { list: featured, seen } = buildFeatured()
  const rest = []
  for (const item of emoji.search('')) {
    if (seen.has(item.name)) continue
    rest.push(toItem(item.name, item.emoji))
  }
  rest.sort((a, b) => a.name.localeCompare(b.name))
  cachedAll = [...featured, ...rest]
  return cachedAll
}

export function listFeaturedEmojis() {
  return buildFeatured().list
}

export function emojiCatalogSize() {
  return listAllEmojis().length
}

/**
 * Convert :shortcode: to unicode emoji, leaving fenced / inline code untouched.
 */
export function emojifyShortcodes(src) {
  const text = String(src || '')
  if (!text.includes(':')) return text
  const re = /(```[\s\S]*?```|`[^`\n]+`)/g
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(text))) {
    out += emoji.emojify(text.slice(last, m.index), { fallback: keepShortcode })
    out += m[0]
    last = m.index + m[0].length
  }
  out += emoji.emojify(text.slice(last), { fallback: keepShortcode })
  return out
}

export function getEmojiByShortcode(nameOrCode) {
  const raw = String(nameOrCode || '').trim()
  const name = raw.replace(/^:|:$/g, '')
  if (!name) return null
  const ch = emoji.get(name)
  if (!ch) return null
  return toItem(name, ch)
}

export function searchEmojiShortcodes(keyword = '', limit = 400) {
  const q = String(keyword || '').trim().replace(/^:|:$/g, '').toLowerCase()
  if (!q) return listAllEmojis()

  const hits = emoji.search(q).slice(0, Math.max(limit, 400))
  return hits.map((item) => toItem(item.name, item.emoji))
}
