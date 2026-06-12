import path from 'path'
import { fileURLToPath } from 'url'
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss'

const root = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('purgecss').UserDefinedOptions} */
export const purgeCssOptions = {
  content: [
    path.join(root, 'index.html'),
    path.join(root, 'public/m.css'),
    path.join(root, 'src/**/*.{vue,js,ts,jsx,tsx}'),
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
    greedy: [/data-oruga/],
  },
  keyframes: true,
  fontFace: true,
  variables: true,
}

export function createPurgeCssPlugin() {
  return purgeCSSPlugin(purgeCssOptions)
}

createPurgeCssPlugin.postcss = true
