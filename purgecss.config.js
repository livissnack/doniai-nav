import path from 'path'
import { fileURLToPath } from 'url'
import purgeCSSPlugin from '@fullhuman/postcss-purgecss'

const root = path.dirname(fileURLToPath(import.meta.url))

/** Windows 下 path.join 的反斜杠会导致 fast-glob 匹配不到文件 */
function posixPath(...segments) {
  return path.join(...segments).split(path.sep).join('/')
}

/** @type {import('purgecss').UserDefinedOptions} */
export const purgeCssOptions = {
  content: [
    posixPath(root, 'index.html'),
    posixPath(root, 'public/m.css'),
    // glob 必须用正斜杠，不能 path.join 整个 pattern
    `${posixPath(root, 'src')}/**/*.{vue,js,ts,jsx,tsx}`,
  ],
  // 提取模板 / :class 中的类名
  defaultExtractor: (content) => {
    const matches = content.match(/[A-Za-z0-9_-][A-Za-z0-9_:/-]*/g) || []
    return matches
  },
  safelist: {
    standard: [
      'html',
      'body',
      'active',
      'disabled',
      'open',
      'is-visible',
      'is-done',
      'is-empty',
      'page-progress',
      'page-progress-bar',
      'page-progress-glow',
      'router-link-active',
      'router-link-exact-active',
    ],
    keyframes: ['page-progress-shine'],
    deep: [
      // Vue scoped：选择器上的 data-v-* 不会出现在模板源码里
      /^data-v-/,
      // Oruga 运行时生成的根类名
      /^o-/,
      // Bulma / Oruga 变体（variant="success" → is-success）
      /^is-/,
      /^has-/,
      /^app-icon/,
      // highlight.js / CodeMirror / APlayer / JSON 查看器（运行时注入类名）
      /^hljs-/,
      /^cm-/,
      /^ͼ/,
      /^aplayer/,
      /^json-formatter/,
      // Univer Sheets（运行时生成大量 class / CSS 变量）
      /^univer-/,
      /^-univer-/,
      /^\!univer-/,
      // 站内自定义通知与进度条
      /^doniai-notify/,
      /^notify-/,
      /^page-progress/,
      // Oruga 组件对应的 Bulma 结构类
      /^button/,
      /^input$/,
      /^textarea/,
      /^select/,
      /^field/,
      /^control/,
      /^help/,
      /^label/,
      /^dropdown/,
      /^checkbox/,
      /^radio/,
      /^switch/,
      /^tag/,
      /^carousel/,
      /^slider/,
      /^datepicker/,
      /^upload/,
      /^file-/,
      /^icon/,
      /^collapse/,
      /^tooltip/,
      /^box$/,
      /^container/,
      /^columns/,
      /^column/,
      /^content/,
      /^title/,
      /^subtitle/,
    ],
    greedy: [/data-v-/, /data-oruga/, /univer/, /radix/],
  },
  keyframes: true,
  fontFace: true,
  variables: true,
}

export function createPurgeCssPlugin() {
  return purgeCSSPlugin(purgeCssOptions)
}

createPurgeCssPlugin.postcss = true
