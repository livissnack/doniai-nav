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
import { emojifyShortcodes } from '@/utils/emojiShortcodes'

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

export const DONIAI_FILE_SCHEME = 'doniai-file:'

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;')
}

function plainHeadingText(token) {
  if (token?.text != null) return String(token.text)
  if (!token?.tokens?.length) return ''
  return token.tokens.map((t) => t.text || t.raw || '').join('')
}

function highlightCode(code, lang) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  return hljs.highlight(code, { language, ignoreIllegals: true }).value
}

export function isDoniaiFileHref(href) {
  return String(href || '').startsWith(DONIAI_FILE_SCHEME)
}

export function doniaiFilePath(href) {
  return String(href || '').slice(DONIAI_FILE_SCHEME.length)
}

export function toDoniaiFileHref(path) {
  return `${DONIAI_FILE_SCHEME}${String(path || '').replace(/^\/+/, '')}`
}

const renderer = new Renderer()

renderer.heading = function ({ tokens, depth }) {
  const text = this.parser.parseInline(tokens)
  const id = slugify(plainHeadingText({ tokens }))
  return `<h${depth} id="${id}">${text}</h${depth}>\n`
}

renderer.code = function ({ text, lang }) {
  const langString = (lang || '').match(/^\S*/)?.[0] || ''
  const highlighted = highlightCode(text, langString)
  const className = langString
    ? ` class="hljs language-${escapeAttr(langString)}"`
    : ' class="hljs"'
  return `<pre><code${className}>${highlighted}</code></pre>\n`
}

renderer.image = function ({ href, title, text }) {
  const alt = escapeAttr(text)
  const titleAttr = title ? ` title="${escapeAttr(title)}"` : ''
  if (isDoniaiFileHref(href)) {
    const path = escapeAttr(doniaiFilePath(href))
    return `<img data-doniai-file="${path}" alt="${alt}"${titleAttr} class="doniai-file-img" loading="lazy" />`
  }
  return `<img src="${escapeAttr(href)}" alt="${alt}"${titleAttr} />`
}

renderer.link = function ({ href, title, tokens }) {
  const text = this.parser.parseInline(tokens)
  const titleAttr = title ? ` title="${escapeAttr(title)}"` : ''
  if (isDoniaiFileHref(href)) {
    const path = escapeAttr(doniaiFilePath(href))
    return `<a href="#" data-doniai-file="${path}" class="doniai-file-link"${titleAttr}>${text}</a>`
  }
  return `<a href="${escapeAttr(href)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
}

marked.use({
  renderer,
  breaks: true,
  gfm: true,
})

export function renderMarkdown(text) {
  return marked.parse(emojifyShortcodes(text || ''))
}

export function extractHeadings(text) {
  const items = []
  const lines = (text || '').split('\n')
  for (const line of lines) {
    const m = /^(#{1,3})\s+(.+)$/.exec(line.trim())
    if (m) {
      const headingText = m[2].trim()
      const display = emojifyShortcodes(headingText)
      items.push({
        level: m[1].length,
        text: display,
        id: slugify(headingText),
      })
    }
  }
  return items
}

/** Parse APPLY blocks from AI chat replies */
export function parseAiApplyBlocks(raw) {
  const text = String(raw || '')
  const re = /<<<APPLY\s+mode="(replace|insert|append)">>>\s*([\s\S]*?)<<<END>>>/gi
  const blocks = []
  let m
  while ((m = re.exec(text))) {
    blocks.push({
      mode: m[1].toLowerCase(),
      content: m[2].replace(/^\n+|\n+$/g, ''),
    })
  }
  const display = text
    .replace(/<<<APPLY\s+mode="(replace|insert|append)">>>\s*([\s\S]*?)<<<END>>>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return {
    display: display || (blocks.length ? '已生成可应用到编辑器的内容' : text),
    blocks,
  }
}
