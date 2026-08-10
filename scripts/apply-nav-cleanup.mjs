import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const navDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/services/nav')

const REMOVE_ITEMS = [
  ['homeData.json', '互联网资讯', '泡在网上的日子'],
  ['homeData.json', '学习平台', '极客学院'],
  ['workData.json', '我的业务', '短视频解析'],
  ['workData.json', '自有网站管理', 'Minio存储'],
  ['workData.json', '相关应用', '茂业禅道'],
  ['workData.json', '相关应用', '平安云收款'],
  ['toolsData.json', '常用工具', '电子书下载'],
  ['toolsData.json', '激活授权', 'Editor授权'],
  ['toolsData.json', 'IPTV', '直播源搜索引擎'],
  ['toolsData.json', 'IPTV', 'IPTV搜索'],
]

const REMOVE_CATEGORIES = [
  ['workData.json', '茂业本地项目'],
  ['workData.json', '小虎外网项目'],
]

const UPDATE_HREF = [
  ['homeData.json', '常用网站', '掘金', 'https://juejin.cn'],
  ['designData.json', '图标库', 'Material Icon', 'https://fonts.google.com/icons'],
]

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(navDir, file), 'utf8'))
}

function save(file, data) {
  const text = file === 'workData.json'
    ? JSON.stringify(data, null, 4) + '\n'
    : JSON.stringify(data)
  fs.writeFileSync(path.join(navDir, file), text, 'utf8')
}

function applyFile(file) {
  let data = load(file)
  let changed = false

  for (const [f, catTitle] of REMOVE_CATEGORIES) {
    if (f !== file) continue
    const next = data.filter((c) => c.title !== catTitle)
    if (next.length !== data.length) {
      data = next
      changed = true
      console.log(`- category: ${file} / ${catTitle}`)
    }
  }

  for (const [f, cat, name] of REMOVE_ITEMS) {
    if (f !== file) continue
    for (const category of data) {
      if (category.title !== cat) continue
      const before = category.items.length
      category.items = category.items.filter((i) => i.name !== name)
      if (category.items.length !== before) {
        changed = true
        console.log(`- item: ${file} / ${cat} / ${name}`)
      }
    }
  }

  for (const [f, cat, name, href] of UPDATE_HREF) {
    if (f !== file) continue
    for (const category of data) {
      if (category.title !== cat) continue
      for (const item of category.items) {
        if (item.name === name && item.href !== href) {
          item.href = href
          changed = true
          console.log(`~ href: ${file} / ${name} -> ${href}`)
        }
      }
    }
  }

  const pruned = data.filter((c) => (c.items || []).length > 0)
  if (pruned.length !== data.length) changed = true

  if (changed) {
    save(file, pruned)
  }
}

const files = new Set([
  ...REMOVE_ITEMS.map((r) => r[0]),
  ...REMOVE_CATEGORIES.map((r) => r[0]),
  ...UPDATE_HREF.map((r) => r[0]),
])

for (const file of files) applyFile(file)
console.log('done')
