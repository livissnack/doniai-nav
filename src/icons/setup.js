import { addCollection } from '@iconify/vue'
import fa6Solid from '@iconify-json/fa6-solid/icons.json'
import fa6Regular from '@iconify-json/fa6-regular/icons.json'
import fa6Brands from '@iconify-json/fa6-brands/icons.json'

let ready = false

/** 离线注册 FA6 图标集（SVG，无 webfont） */
export function setupIconify() {
  if (ready) return
  addCollection(fa6Solid)
  addCollection(fa6Regular)
  addCollection(fa6Brands)
  ready = true
}
