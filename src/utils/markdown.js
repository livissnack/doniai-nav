import { marked, Renderer } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import markdownLang from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'
import plaintext from 'highlight.js/lib/languages/plaintext'
import 'highlight.js/styles/github.css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('markdown', markdownLang)
hljs.registerLanguage('md', markdownLang)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('plaintext', plaintext)
hljs.registerLanguage('text', plaintext)

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}

const renderer = new Renderer()
renderer.heading = function (text, level) {
  const id = slugify(text)
  return `<h${level} id="${id}">${text}</h${level}>`
}

marked.setOptions({
  renderer,
  highlight(code, lang) {
    const language = lang && hljs.getLanguage(lang) ? lang : null
    if (language) {
      return hljs.highlight(code, { language }).value
    }
    return hljs.highlight(code, { language: 'plaintext', ignoreIllegals: true }).value
  },
  breaks: true,
  gfm: true,
})

export function renderMarkdown(text) {
  return marked.parse(text || '')
}

export function extractHeadings(text) {
  const items = []
  const lines = (text || '').split('\n')
  for (const line of lines) {
    const m = /^(#{1,3})\s+(.+)$/.exec(line.trim())
    if (m) {
      const headingText = m[2].trim()
      items.push({
        level: m[1].length,
        text: headingText,
        id: slugify(headingText),
      })
    }
  }
  return items
}
