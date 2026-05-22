import marked from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}

const renderer = new marked.Renderer()
renderer.heading = function (text, level) {
  const id = slugify(text)
  return `<h${level} id="${id}">${text}</h${level}>`
}

marked.setOptions({
  renderer,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
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
      const text = m[2].trim()
      items.push({
        level: m[1].length,
        text,
        id: slugify(text),
      })
    }
  }
  return items
}
