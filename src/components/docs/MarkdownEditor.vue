<template>
  <div
    class="md-editor"
    :class="{
      'md-editor--ai-open': aiOpen,
      'md-editor--focused': focused,
      'md-editor--dragging': dragging,
      'md-editor--uploading': uploading,
    }"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div class="md-toolbar" role="toolbar" aria-label="Markdown 工具栏">
      <div class="md-toolbar__scroll">
        <div
          v-for="(group, gi) in toolGroups"
          :key="gi"
          class="md-toolbar__group"
        >
          <button
            v-for="btn in group"
            :key="btn.id"
            type="button"
            class="md-tool"
            :title="btn.title"
            :aria-label="btn.title"
            @mousedown.prevent
            @click="runTool(btn)"
          >
            <AppIcon v-if="btn.icon" :name="btn.icon" />
            <span v-else class="md-tool__text">{{ btn.label }}</span>
          </button>
        </div>
      </div>
      <button
        type="button"
        class="md-ai-toggle"
        :class="{ active: aiOpen }"
        :aria-pressed="aiOpen"
        title="DeepSeek AI"
        @mousedown.prevent
        @click="toggleAi"
      >
        <span class="md-ai-toggle__glow" aria-hidden="true" />
        <AppIcon name="magic" />
        <span>AI</span>
      </button>
    </div>

    <div class="md-body">
      <Codemirror
        :model-value="modelValue"
        class="md-codemirror"
        :extensions="extensions"
        :autofocus="autofocus"
        :indent-with-tab="true"
        :tab-size="2"
        placeholder="在此编写 Markdown… 可拖入图片/文件"
        @update="onUpdate"
        @ready="onReady"
      />
      <div v-if="uploading" class="md-busy-bar" aria-hidden="true" />
      <div v-if="dragging" class="md-drop-mask">
        <div class="md-drop-card">
          <AppIcon name="cloud-upload-alt" />
          <p>松开以上传到文件管理并插入笔记</p>
        </div>
      </div>
    </div>

    <footer class="md-statusbar">
      <span class="md-stat">{{ lineCount }} 行</span>
      <span class="md-stat-sep" />
      <span class="md-stat">{{ charCount }} 字</span>
      <span v-if="selectionLen > 0" class="md-stat md-stat--accent">已选 {{ selectionLen }}</span>
      <span v-if="uploadHint" class="md-stat md-stat--accent">{{ uploadHint }}</span>
      <span class="md-statusbar__spacer" />
      <span class="md-stat md-stat--muted">拖放文件 · Ctrl+B / I / K</span>
    </footer>

    <input
      ref="fileInput"
      type="file"
      class="md-file-input"
      multiple
      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.md,.txt,.json"
      @change="onPickFiles"
    />

    <EmojiPicker
      :open="emojiOpen"
      @close="closeEmojiPicker"
      @select="insertEmoji"
    />

    <AiChatPanel
      :open="aiOpen"
      :page-title="pageTitle"
      :document-text="modelValue"
      :selection-text="selectionText"
      @close="aiOpen = false"
      @open-settings="$emit('open-settings')"
      @apply="applyAiBlock"
    />
  </div>
</template>

<script>
import { Codemirror } from 'vue-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { uploadFile, isImageFileName, notesUploadDir } from '@/services/filesApi'
import { toDoniaiFileHref } from '@/utils/markdown'
import AiChatPanel from '@/components/docs/AiChatPanel.vue'
import EmojiPicker from '@/components/docs/EmojiPicker.vue'

const TOOL_GROUPS = [
  [
    { id: 'h1', label: 'H1', title: '一级标题', action: 'heading', level: 1 },
    { id: 'h2', label: 'H2', title: '二级标题', action: 'heading', level: 2 },
    { id: 'h3', label: 'H3', title: '三级标题', action: 'heading', level: 3 },
  ],
  [
    { id: 'bold', icon: 'bold', title: '粗体 Ctrl+B', action: 'wrap', before: '**', after: '**', placeholder: '粗体' },
    { id: 'italic', icon: 'italic', title: '斜体 Ctrl+I', action: 'wrap', before: '*', after: '*', placeholder: '斜体' },
    { id: 'strike', label: 'S', title: '删除线', action: 'wrap', before: '~~', after: '~~', placeholder: '删除线' },
    { id: 'code', icon: 'code', title: '行内代码', action: 'wrap', before: '`', after: '`', placeholder: 'code' },
  ],
  [
    { id: 'codeblock', label: '</>', title: '代码块', action: 'block', before: '```\n', after: '\n```', placeholder: 'code' },
    { id: 'link', icon: 'link', title: '链接 Ctrl+K', action: 'link' },
    { id: 'image', icon: 'image', title: '插入图片/文件', action: 'pickFile' },
    { id: 'emoji', icon: 'smile', title: '插入表情短代码', action: 'emoji' },
    { id: 'quote', icon: 'quote-left', title: '引用', action: 'linePrefix', prefix: '> ' },
    { id: 'ul', icon: 'list-ul', title: '无序列表', action: 'linePrefix', prefix: '- ' },
    { id: 'ol', icon: 'list-ol', title: '有序列表', action: 'linePrefix', prefix: '1. ' },
    { id: 'hr', label: '—', title: '分隔线', action: 'insert', text: '\n\n---\n\n' },
  ],
]

const mdHighlight = HighlightStyle.define([
  { tag: tags.heading1, color: '#0f172a', fontWeight: '700', fontSize: '1.15em' },
  { tag: tags.heading2, color: '#1e293b', fontWeight: '700', fontSize: '1.08em' },
  { tag: tags.heading3, color: '#334155', fontWeight: '700' },
  { tag: tags.heading4, color: '#475569', fontWeight: '600' },
  { tag: tags.strong, color: '#0f172a', fontWeight: '700' },
  { tag: tags.emphasis, color: '#334155', fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: '#94a3b8' },
  { tag: tags.link, color: '#15803d', textDecoration: 'underline' },
  { tag: tags.url, color: '#16a34a' },
  { tag: tags.monospace, color: '#0f766e', backgroundColor: 'rgba(15, 118, 110, 0.08)' },
  { tag: tags.quote, color: '#64748b', fontStyle: 'italic' },
  { tag: tags.meta, color: '#94a3b8' },
  { tag: tags.processingInstruction, color: '#94a3b8' },
  { tag: tags.contentSeparator, color: '#cbd5e1' },
])

function wrapSelection(view, before, after, placeholder = '') {
  const { state } = view
  const changes = []
  const selections = []
  for (const range of state.selection.ranges) {
    const selected = state.sliceDoc(range.from, range.to)
    const text = selected || placeholder
    const insert = `${before}${text}${after}`
    changes.push({ from: range.from, to: range.to, insert })
    const anchor = range.from + before.length
    const head = anchor + text.length
    selections.push({ anchor, head })
  }
  view.dispatch({
    changes,
    selection: selections.length === 1 ? selections[0] : { ranges: selections },
    scrollIntoView: true,
  })
  view.focus()
  return true
}

function prefixLines(view, prefix) {
  const { state } = view
  const changes = []
  for (const range of state.selection.ranges) {
    const fromLine = state.doc.lineAt(range.from)
    const toLine = state.doc.lineAt(range.to)
    for (let n = fromLine.number; n <= toLine.number; n++) {
      const line = state.doc.line(n)
      if (line.text.startsWith(prefix)) {
        changes.push({ from: line.from, to: line.from + prefix.length, insert: '' })
      } else {
        changes.push({ from: line.from, insert: prefix })
      }
    }
  }
  view.dispatch({ changes, scrollIntoView: true })
  view.focus()
  return true
}

function setHeading(view, level) {
  const marks = '#'.repeat(level) + ' '
  const { state } = view
  const changes = []
  for (const range of state.selection.ranges) {
    const line = state.doc.lineAt(range.from)
    const cleaned = line.text.replace(/^#{1,6}\s+/, '')
    changes.push({ from: line.from, to: line.to, insert: marks + cleaned })
  }
  view.dispatch({ changes, scrollIntoView: true })
  view.focus()
  return true
}

function insertLink(view) {
  const { state } = view
  const range = state.selection.main
  const selected = state.sliceDoc(range.from, range.to) || '链接文字'
  const insert = `[${selected}](https://)`
  view.dispatch({
    changes: { from: range.from, to: range.to, insert },
    selection: {
      anchor: range.from + selected.length + 3,
      head: range.from + selected.length + 3 + 8,
    },
    scrollIntoView: true,
  })
  view.focus()
  return true
}

function insertText(view, text, from, to) {
  const { state } = view
  const range = state.selection.main
  const start = from ?? range.from
  const end = to ?? range.to
  view.dispatch({
    changes: { from: start, to: end, insert: text },
    selection: { anchor: start + text.length },
    scrollIntoView: true,
  })
  view.focus()
  return true
}

function markdownForUploaded(name, path) {
  const href = toDoniaiFileHref(path)
  const safeName = String(name || 'file').replace(/[[\]]/g, '')
  if (isImageFileName(name)) {
    return `![${safeName}](${href})`
  }
  return `[${safeName}](${href})`
}

export default {
  name: 'MarkdownEditor',
  components: { Codemirror, AiChatPanel, EmojiPicker },
  props: {
    modelValue: { type: String, default: '' },
    autofocus: { type: Boolean, default: false },
    pageTitle: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'open-settings'],
  data() {
    return {
      toolGroups: TOOL_GROUPS,
      view: null,
      focused: false,
      aiOpen: false,
      selectionLen: 0,
      selectionText: '',
      dragging: false,
      dragDepth: 0,
      uploading: false,
      uploadHint: '',
      emojiOpen: false,
      extensions: null,
    }
  },
  created() {
    const self = this
    this.extensions = [
      markdown(),
      syntaxHighlighting(mdHighlight),
      EditorView.lineWrapping,
      cmPlaceholder('在此编写 Markdown… 可拖入图片/文件'),
      EditorView.domEventHandlers({
        paste(event, view) {
          const files = [...(event.clipboardData?.files || [])]
          if (!files.length) return false
          event.preventDefault()
          self.handleFiles(files, view)
          return true
        },
        drop(event, view) {
          const files = [...(event.dataTransfer?.files || [])]
          if (!files.length) return false
          event.preventDefault()
          self.dragging = false
          self.dragDepth = 0
          self.handleFiles(files, view)
          return true
        },
        dragover(event) {
          if (event.dataTransfer?.types?.includes('Files')) {
            event.preventDefault()
            return true
          }
          return false
        },
      }),
      EditorView.updateListener.of((update) => {
        if (update.focusChanged) {
          self.focused = update.view.hasFocus
        }
        if (update.selectionSet || update.docChanged || update.focusChanged) {
          const range = update.state.selection.main
          self.selectionLen = Math.abs(range.to - range.from)
          self.selectionText = range.from === range.to
            ? ''
            : update.state.sliceDoc(range.from, range.to)
        }
      }),
      Prec.high(
        keymap.of([
          {
            key: 'Mod-b',
            run: (view) => wrapSelection(view, '**', '**', '粗体'),
          },
          {
            key: 'Mod-i',
            run: (view) => wrapSelection(view, '*', '*', '斜体'),
          },
          {
            key: 'Mod-k',
            run: (view) => insertLink(view),
          },
          {
            key: 'Mod-Shift-c',
            run: (view) => wrapSelection(view, '`', '`', 'code'),
          },
        ]),
      ),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '14.5px',
          color: '#1e293b',
        },
        '.cm-scroller': {
          fontFamily: "Consolas, 'Cascadia Code', 'JetBrains Mono', 'Microsoft YaHei', monospace",
          lineHeight: '1.75',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(148, 163, 184, 0.55) transparent',
        },
        '.cm-content': {
          padding: '18px 22px 36px',
          caretColor: '#16a34a',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-gutters': {
          backgroundColor: 'transparent',
          border: 'none',
          color: '#94a3b8',
        },
        '.cm-activeLine': {
          backgroundColor: 'rgba(34, 197, 94, 0.055)',
        },
        '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
          backgroundColor: 'rgba(34, 197, 94, 0.22) !important',
        },
        '&.cm-focused .cm-cursor': {
          borderLeftWidth: '2px',
          borderLeftColor: '#16a34a',
        },
        '.cm-placeholder': {
          color: '#94a3b8',
          fontStyle: 'italic',
          opacity: '0.85',
        },
      }),
    ]
  },
  computed: {
    lineCount() {
      const text = this.modelValue || ''
      if (!text) return 1
      return text.split('\n').length
    },
    charCount() {
      return (this.modelValue || '').length
    },
  },
  methods: {
    onReady(payload) {
      this.view = payload.view
      this.focused = payload.view.hasFocus
      const range = payload.view.state.selection.main
      this.selectionLen = Math.abs(range.to - range.from)
      this.selectionText = range.from === range.to
        ? ''
        : payload.view.state.sliceDoc(range.from, range.to)
    },
    onUpdate(payload) {
      const doc = payload.state.doc.toString()
      if (doc !== this.modelValue) {
        this.$emit('update:modelValue', doc)
      }
    },
    toggleAi() {
      this.aiOpen = !this.aiOpen
    },
    onDragEnter(e) {
      if (![...e.dataTransfer.types].includes('Files')) return
      this.dragDepth += 1
      this.dragging = true
    },
    onDragOver(e) {
      if ([...e.dataTransfer.types].includes('Files')) {
        e.dataTransfer.dropEffect = 'copy'
      }
    },
    onDragLeave() {
      this.dragDepth = Math.max(0, this.dragDepth - 1)
      if (this.dragDepth === 0) this.dragging = false
    },
    onDrop(e) {
      this.dragging = false
      this.dragDepth = 0
      const files = [...(e.dataTransfer?.files || [])]
      if (files.length) this.handleFiles(files, this.view)
    },
    runTool(btn) {
      const view = this.view
      if (!view && btn.action !== 'pickFile' && btn.action !== 'emoji') return
      if (btn.action === 'pickFile') {
        this.$refs.fileInput?.click()
        return
      }
      if (btn.action === 'emoji') {
        this.openEmojiPicker()
        return
      }
      if (btn.action === 'wrap') {
        wrapSelection(view, btn.before, btn.after, btn.placeholder || '')
      } else if (btn.action === 'block') {
        wrapSelection(view, btn.before, btn.after, btn.placeholder || '')
      } else if (btn.action === 'heading') {
        setHeading(view, btn.level)
      } else if (btn.action === 'linePrefix') {
        prefixLines(view, btn.prefix)
      } else if (btn.action === 'link') {
        insertLink(view)
      } else if (btn.action === 'insert') {
        insertText(view, btn.text)
      }
    },
    openEmojiPicker() {
      this.emojiOpen = true
    },
    closeEmojiPicker() {
      this.emojiOpen = false
    },
    insertEmoji(item) {
      if (!item?.shortcode) return
      const view = this.view
      if (view) {
        insertText(view, item.shortcode)
      } else {
        this.$emit('update:modelValue', `${this.modelValue || ''}${item.shortcode}`)
      }
      this.closeEmojiPicker()
    },
    onPickFiles(e) {
      const files = [...(e.target.files || [])]
      e.target.value = ''
      if (files.length) this.handleFiles(files, this.view)
    },
    async handleFiles(fileList, view) {
      const files = [...fileList].filter(Boolean)
      if (!files.length || this.uploading) return
      this.uploading = true
      this.uploadHint = `上传中 0/${files.length}`
      const dir = notesUploadDir()
      const snippets = []
      let ok = 0
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          this.uploadHint = `上传中 ${i + 1}/${files.length}：${file.name}`
          const { data } = await uploadFile(file, dir)
          if (!data?.ok) {
            this.$toast?.open?.({ message: data?.message || `${file.name} 上传失败`, type: 'is-danger' })
            continue
          }
          const path = data.item?.path || `${dir}/${file.name}`.replace(/\\/g, '/')
          const name = data.item?.name || file.name
          snippets.push(markdownForUploaded(name, path))
          ok += 1
        }
        if (snippets.length) {
          const block = snippets.join('\n\n')
          const prefix = '\n\n'
          if (view) {
            const pos = view.state.selection.main.head
            const needPad = pos > 0 && !/\n\n$/.test(view.state.sliceDoc(Math.max(0, pos - 2), pos))
            insertText(view, `${needPad ? prefix : ''}${block}\n`)
          } else {
            const base = this.modelValue || ''
            this.$emit('update:modelValue', `${base}${base && !base.endsWith('\n') ? '\n\n' : ''}${block}\n`)
          }
          this.$toast?.open?.({
            message: ok === files.length ? `已上传并插入 ${ok} 个文件` : `已插入 ${ok}/${files.length} 个文件`,
            type: 'is-success',
          })
        }
      } catch (err) {
        this.$toast?.open?.({ message: err?.msg || '上传失败', type: 'is-danger' })
      } finally {
        this.uploading = false
        this.uploadHint = ''
      }
    },
    applyAiBlock(block) {
      if (!block?.content) return
      const text = String(block.content).replace(/\r\n/g, '\n')
      const mode = block.mode || 'replace'
      const view = this.view
      if (!view) {
        if (mode === 'append') {
          const base = this.modelValue || ''
          this.$emit('update:modelValue', `${base}${base ? '\n\n' : ''}${text}`)
        } else {
          this.$emit('update:modelValue', text)
        }
        return
      }
      if (mode === 'append') {
        const end = view.state.doc.length
        const prefix = end > 0 && !/\n\n$/.test(view.state.sliceDoc(Math.max(0, end - 2), end)) ? '\n\n' : ''
        insertText(view, `${prefix}${text}`, end, end)
        return
      }
      if (mode === 'insert') {
        insertText(view, text)
        return
      }
      // replace: selection if any, else whole doc
      const range = view.state.selection.main
      if (range.from !== range.to) {
        insertText(view, text, range.from, range.to)
      } else {
        insertText(view, text, 0, view.state.doc.length)
      }
    },
  },
}
</script>

<style lang="less" scoped>
@accent: #16a34a;
@line: rgba(148, 163, 184, 0.32);
@ink: #1e293b;
@muted: #64748b;

.md-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  position: relative;
  background:
    radial-gradient(900px 240px at 8% -10%, rgba(34, 197, 94, 0.07), transparent 58%),
    linear-gradient(180deg, #fcfdfd 0%, #f4f7fa 100%);
  transition: box-shadow 0.22s ease, background 0.22s ease;

  &--focused {
    background:
      radial-gradient(900px 240px at 8% -10%, rgba(34, 197, 94, 0.1), transparent 58%),
      linear-gradient(180deg, #ffffff 0%, #f7faf8 100%);
    box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.12);
  }

  &--dragging {
    box-shadow: inset 0 0 0 2px rgba(34, 197, 94, 0.45);
  }
}

.md-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px 8px 8px;
  border-bottom: 1px solid @line;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(10px);
  z-index: 2;
}

.md-toolbar__scroll {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.md-toolbar__group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: 10px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.md-tool {
  width: 30px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: @muted;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease, transform 0.12s ease;

  &:hover {
    background: #fff;
    border-color: #dbe4ee;
    color: @accent;
  }

  &:active {
    transform: translateY(1px) scale(0.96);
    background: #ecfdf5;
    border-color: #bbf7d0;
  }

  :deep(.app-icon) {
    font-size: 12px;
  }
}

.md-tool__text {
  font-size: 11px;
  letter-spacing: 0.02em;
}

.md-ai-toggle {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(22, 163, 74, 0.28);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.14), rgba(16, 185, 129, 0.08));
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;

  &:hover,
  &.active {
    border-color: rgba(22, 163, 74, 0.55);
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.24), rgba(16, 185, 129, 0.16));
    box-shadow: 0 4px 16px rgba(22, 163, 74, 0.16);
  }

  &.active {
    transform: translateY(-1px);
  }

  :deep(.app-icon),
  span {
    position: relative;
    z-index: 1;
  }
}

.md-ai-toggle__glow {
  position: absolute;
  inset: -40% auto auto -20%;
  width: 60%;
  height: 180%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  transform: translateX(-120%) rotate(18deg);
  pointer-events: none;
}

.md-ai-toggle:hover .md-ai-toggle__glow,
.md-ai-toggle.active .md-ai-toggle__glow {
  animation: md-shine 1.4s ease;
}

@keyframes md-shine {
  to {
    transform: translateX(280%) rotate(18deg);
  }
}

.md-body {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.md-busy-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  overflow: hidden;
  background: rgba(34, 197, 94, 0.12);
  z-index: 3;

  &::after {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 40%;
    background: linear-gradient(90deg, transparent, #22c55e, transparent);
    animation: md-indeterminate 1.1s ease-in-out infinite;
  }
}

.md-drop-mask {
  position: absolute;
  inset: 8px;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(34, 197, 94, 0.55);
  border-radius: 14px;
  background: rgba(240, 253, 244, 0.78);
  backdrop-filter: blur(2px);
  pointer-events: none;
}

.md-drop-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #15803d;
  font-size: 13px;
  font-weight: 600;

  :deep(.app-icon) {
    font-size: 28px;
  }

  p {
    margin: 0;
  }
}

.md-codemirror {
  flex: 1;
  min-height: 0;
  height: 100%;

  :deep(.cm-editor) {
    height: 100%;
    background: transparent;
  }

  :deep(.cm-editor.cm-focused) {
    outline: none;
  }

  :deep(.cm-scroller::-webkit-scrollbar) {
    width: 8px;
  }

  :deep(.cm-scroller::-webkit-scrollbar-thumb) {
    background: rgba(148, 163, 184, 0.45);
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
}

.md-statusbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 0 14px;
  border-top: 1px solid @line;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  color: #94a3b8;
  font-size: 11px;
  user-select: none;
}

.md-stat {
  white-space: nowrap;

  &--accent {
    color: #15803d;
    font-weight: 600;
  }

  &--muted {
    opacity: 0.75;
  }
}

.md-stat-sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #cbd5e1;
}

.md-statusbar__spacer {
  flex: 1;
}

.md-file-input {
  display: none;
}

@keyframes md-indeterminate {
  0% {
    left: -40%;
  }
  100% {
    left: 100%;
  }
}

@media (max-width: 768px) {
  .md-stat--muted {
    display: none;
  }
}
</style>
