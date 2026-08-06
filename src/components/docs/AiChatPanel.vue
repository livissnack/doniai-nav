<template>
  <teleport to="body">
    <transition name="ai-chat-pop">
      <aside
        v-if="open"
        ref="panelEl"
        class="ai-chat"
        :class="{ 'is-dragging': dragging }"
        :style="panelStyle"
        role="dialog"
        aria-label="DeepSeek 助手"
      >
        <header
          class="ai-chat__head"
          @pointerdown="onDragStart"
        >
          <div class="ai-chat__brand">
            <span class="ai-chat__logo"><AppIcon name="magic" /></span>
            <div>
              <div class="ai-chat__title">DeepSeek</div>
              <div class="ai-chat__sub">拖动标题栏可移动窗口</div>
            </div>
          </div>
          <div class="ai-chat__head-actions" @pointerdown.stop>
            <button type="button" class="ai-chat__icon-btn" title="清空对话" @click="clearChat">
              <AppIcon name="trash-alt" />
            </button>
            <button type="button" class="ai-chat__icon-btn" title="秘钥设置" @click="$emit('open-settings')">
              <AppIcon name="cog" />
            </button>
            <button type="button" class="ai-chat__icon-btn" title="关闭" @click="$emit('close')">
              <AppIcon name="times" />
            </button>
          </div>
        </header>

        <div ref="listEl" class="ai-chat__list">
          <div v-if="!messages.length" class="ai-chat__welcome">
            <p class="ai-chat__welcome-title">你好，我是 DeepSeek</p>
            <p class="ai-chat__welcome-desc">可以续写、润色、纠错，或直接告诉我要怎么改这篇笔记。</p>
            <div class="ai-chat__suggestions">
              <button
                v-for="s in suggestions"
                :key="s.id"
                type="button"
                class="ai-chat__suggest"
                :disabled="busy"
                @click="sendQuick(s)"
              >
                {{ s.label }}
              </button>
            </div>
          </div>

          <div
            v-for="msg in messages"
            :key="msg.id"
            class="ai-chat__msg"
            :class="`ai-chat__msg--${msg.role}`"
          >
            <div class="ai-chat__bubble">
              <div class="ai-chat__bubble-text" v-html="msg.html" />
              <div v-if="msg.blocks?.length" class="ai-chat__applies">
                <button
                  v-for="(block, i) in msg.blocks"
                  :key="i"
                  type="button"
                  class="ai-chat__apply"
                  @click="$emit('apply', block)"
                >
                  {{ applyLabel(block.mode) }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="busy" class="ai-chat__msg ai-chat__msg--assistant">
            <div class="ai-chat__bubble ai-chat__bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <div v-if="messages.length" class="ai-chat__quick">
          <button
            v-for="s in suggestions"
            :key="s.id"
            type="button"
            class="ai-chat__chip"
            :disabled="busy"
            @click="sendQuick(s)"
          >
            {{ s.label }}
          </button>
        </div>

        <footer class="ai-chat__foot">
          <textarea
            ref="inputEl"
            v-model="draft"
            class="ai-chat__input"
            rows="2"
            placeholder="输入消息，Enter 发送，Shift+Enter 换行"
            :disabled="busy"
            @keydown="onKeydown"
          />
          <button
            type="button"
            class="ai-chat__send"
            :disabled="busy || !draft.trim()"
            @click="sendDraft"
          >
            <AppIcon name="paper-plane" />
          </button>
        </footer>

        <p v-if="error" class="ai-chat__error" role="alert">
          {{ error }}
          <button v-if="needsKey" type="button" class="ai-chat__error-link" @click="$emit('open-settings')">
            去配置
          </button>
        </p>
      </aside>
    </transition>
  </teleport>
</template>

<script>
import { deepseekComplete } from '@/services/notesApi'
import { parseAiApplyBlocks, renderMarkdown } from '@/utils/markdown'

const SUGGESTIONS = [
  { id: 'continue', label: '续写下文', prompt: '请基于当前正文自然续写，把续写内容用 APPLY insert 输出。' },
  { id: 'polish', label: '润色全文', prompt: '请润色当前全文，用 APPLY replace 输出润色后的完整 Markdown。' },
  { id: 'fix', label: '纠错', prompt: '请修正错别字与语病，用 APPLY replace 输出修正后的全文。' },
  { id: 'summarize', label: '总结要点', prompt: '请总结当前笔记为要点列表，用 APPLY append 追加到文末。' },
  { id: 'expand', label: '扩写选区', prompt: '若有选区则扩写选区，否则扩写全文；用 APPLY replace 输出结果。' },
]

const POS_KEY = 'doniaiNavAiChatPos'
let msgSeq = 1

function defaultPos() {
  const width = Math.min(400, window.innerWidth - 24)
  const height = Math.min(680, window.innerHeight - 48)
  return {
    left: Math.max(12, window.innerWidth - width - 24),
    top: Math.max(12, Math.round((window.innerHeight - height) / 2)),
  }
}

function loadPos() {
  try {
    const raw = localStorage.getItem(POS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.left === 'number' && typeof parsed?.top === 'number') {
      return parsed
    }
  } catch {
    /* ignore */
  }
  return null
}

function clampPos(left, top, el) {
  const w = el?.offsetWidth || 400
  const h = el?.offsetHeight || 560
  const maxL = Math.max(8, window.innerWidth - w - 8)
  const maxT = Math.max(8, window.innerHeight - h - 8)
  return {
    left: Math.min(Math.max(8, left), maxL),
    top: Math.min(Math.max(8, top), maxT),
  }
}

export default {
  name: 'AiChatPanel',
  props: {
    open: { type: Boolean, default: false },
    pageTitle: { type: String, default: '' },
    documentText: { type: String, default: '' },
    selectionText: { type: String, default: '' },
  },
  emits: ['close', 'open-settings', 'apply'],
  data() {
    return {
      suggestions: SUGGESTIONS,
      messages: [],
      draft: '',
      busy: false,
      error: '',
      needsKey: false,
      pos: { left: 0, top: 0 },
      dragging: false,
      dragOffset: { x: 0, y: 0 },
    }
  },
  computed: {
    panelStyle() {
      return {
        left: `${this.pos.left}px`,
        top: `${this.pos.top}px`,
      }
    },
  },
  watch: {
    open(val) {
      if (val) {
        this.initPosition()
        this.$nextTick(() => {
          this.ensureInViewport()
          this.$refs.inputEl?.focus()
          this.scrollBottom()
        })
      } else {
        this.stopDrag()
      }
    },
  },
  mounted() {
    window.addEventListener('resize', this.ensureInViewport)
  },
  beforeUnmount() {
    this.stopDrag()
    window.removeEventListener('resize', this.ensureInViewport)
  },
  methods: {
    initPosition() {
      this.pos = loadPos() || defaultPos()
    },
    ensureInViewport() {
      if (!this.open) return
      this.$nextTick(() => {
        this.pos = clampPos(this.pos.left, this.pos.top, this.$refs.panelEl)
      })
    },
    persistPos() {
      try {
        localStorage.setItem(POS_KEY, JSON.stringify(this.pos))
      } catch {
        /* ignore */
      }
    },
    onDragStart(e) {
      if (e.button !== 0) return
      if (e.target.closest('button, a, input, textarea')) return
      const panel = this.$refs.panelEl
      if (!panel) return
      this.dragging = true
      this.dragOffset = {
        x: e.clientX - this.pos.left,
        y: e.clientY - this.pos.top,
      }
      panel.setPointerCapture?.(e.pointerId)
      window.addEventListener('pointermove', this.onDragMove)
      window.addEventListener('pointerup', this.onDragEnd)
      window.addEventListener('pointercancel', this.onDragEnd)
      e.preventDefault()
    },
    onDragMove(e) {
      if (!this.dragging) return
      this.pos = clampPos(
        e.clientX - this.dragOffset.x,
        e.clientY - this.dragOffset.y,
        this.$refs.panelEl,
      )
    },
    onDragEnd() {
      if (!this.dragging) return
      this.stopDrag()
      this.persistPos()
    },
    stopDrag() {
      this.dragging = false
      window.removeEventListener('pointermove', this.onDragMove)
      window.removeEventListener('pointerup', this.onDragEnd)
      window.removeEventListener('pointercancel', this.onDragEnd)
    },
    applyLabel(mode) {
      if (mode === 'insert') return '插入到光标'
      if (mode === 'append') return '追加到文末'
      return this.selectionText?.trim() ? '替换选区' : '替换全文'
    },
    clearChat() {
      if (this.busy) return
      this.messages = []
      this.error = ''
      this.needsKey = false
    },
    onKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendDraft()
      }
    },
    scrollBottom() {
      const el = this.$refs.listEl
      if (!el) return
      el.scrollTop = el.scrollHeight
    },
    pushMessage(role, content, blocks = []) {
      const display = role === 'assistant' ? (parseAiApplyBlocks(content).display || content) : content
      const html = renderMarkdown(display)
      this.messages.push({
        id: msgSeq++,
        role,
        content,
        html,
        blocks,
      })
      this.$nextTick(() => this.scrollBottom())
    },
    sendQuick(s) {
      this.sendUser(s.prompt)
    },
    sendDraft() {
      const text = this.draft.trim()
      if (!text) return
      this.draft = ''
      this.sendUser(text)
    },
    async sendUser(text) {
      if (this.busy || !text.trim()) return
      this.error = ''
      this.needsKey = false
      this.pushMessage('user', text.trim())
      this.busy = true
      this.$nextTick(() => this.scrollBottom())
      try {
        const history = this.messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => ({ role: m.role, content: m.content }))
        const { data } = await deepseekComplete({
          action: 'chat',
          title: this.pageTitle || '',
          text: this.documentText || '',
          selection: this.selectionText || '',
          messages: history,
        })
        if (!data?.ok || !data.content) {
          const msg = data?.message || 'AI 请求失败'
          this.error = msg
          this.needsKey = /秘钥|API_KEY|未配置/i.test(msg)
          if (this.needsKey) this.$emit('open-settings')
          return
        }
        const parsed = parseAiApplyBlocks(data.content)
        this.pushMessage('assistant', data.content, parsed.blocks)
      } catch (e) {
        const msg = e?.msg || e?.message || 'AI 请求失败'
        this.error = msg
        this.needsKey = /秘钥|API_KEY|未配置/i.test(msg)
        if (this.needsKey) this.$emit('open-settings')
      } finally {
        this.busy = false
        this.$nextTick(() => {
          this.scrollBottom()
          this.$refs.inputEl?.focus()
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.ai-chat {
  position: fixed;
  z-index: 10080;
  display: flex;
  flex-direction: column;
  width: min(400px, calc(100vw - 24px));
  height: min(680px, calc(100vh - 48px));
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  background: #fff;
  box-shadow:
    0 18px 50px rgba(15, 23, 42, 0.16),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  overflow: hidden;
  touch-action: none;

  &.is-dragging {
    box-shadow:
      0 24px 60px rgba(15, 23, 42, 0.22),
      0 0 0 1px rgba(34, 197, 94, 0.25);
    user-select: none;
  }
}

.ai-chat-pop-enter-active,
.ai-chat-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.22s ease;
}

.ai-chat-pop-enter-from,
.ai-chat-pop-leave-to {
  opacity: 0;
  transform: translateX(12px) scale(0.98);
}

.ai-chat__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 12px 10px 14px;
  border-bottom: 1px solid #eef2f7;
  background: linear-gradient(180deg, #f8fffb 0%, #fff 100%);
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}

.ai-chat.is-dragging .ai-chat__head {
  cursor: grabbing;
}

.ai-chat__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  pointer-events: none;
}

.ai-chat__logo {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #22c55e, #059669);
  color: #fff;
  font-size: 14px;
}

.ai-chat__title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.ai-chat__sub {
  font-size: 11px;
  color: #94a3b8;
}

.ai-chat__head-actions {
  display: flex;
  gap: 2px;
  cursor: default;
}

.ai-chat__icon-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: background 0.14s, color 0.14s;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
}

.ai-chat__list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px 14px 8px;
  background:
    radial-gradient(420px 160px at 100% 0%, rgba(34, 197, 94, 0.06), transparent 60%),
    #f8fafc;
  scrollbar-width: thin;
  touch-action: auto;
}

.ai-chat__welcome {
  padding: 18px 8px 8px;
  text-align: center;
}

.ai-chat__welcome-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.ai-chat__welcome-desc {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.55;
  color: #64748b;
}

.ai-chat__suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.ai-chat__suggest {
  padding: 8px 12px;
  border: 1px solid #dbe4ee;
  border-radius: 999px;
  background: #fff;
  color: #334155;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.14s, box-shadow 0.14s, transform 0.12s;

  &:hover:not(:disabled) {
    border-color: #86efac;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.ai-chat__msg {
  display: flex;
  margin-bottom: 12px;

  &--user {
    justify-content: flex-end;
  }

  &--assistant {
    justify-content: flex-start;
  }
}

.ai-chat__bubble {
  max-width: 92%;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.ai-chat__msg--user .ai-chat__bubble {
  background: linear-gradient(135deg, #16a34a, #059669);
  color: #fff;
  border-bottom-right-radius: 6px;
}

.ai-chat__msg--assistant .ai-chat__bubble {
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.ai-chat__bubble-text {
  :deep(p) {
    margin: 0.35em 0;
  }

  :deep(p:first-child) {
    margin-top: 0;
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0.4em 0;
    padding-left: 1.2em;
  }

  :deep(pre) {
    margin: 8px 0;
    padding: 8px 10px;
    border-radius: 8px;
    background: #f1f5f9;
    overflow: auto;
  }

  :deep(code) {
    font-family: Consolas, monospace;
    font-size: 0.92em;
  }
}

.ai-chat__msg--user .ai-chat__bubble-text {
  :deep(a) {
    color: #dcfce7;
  }

  :deep(code) {
    background: rgba(255, 255, 255, 0.18);
    padding: 1px 4px;
    border-radius: 4px;
  }
}

.ai-chat__applies {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
}

.ai-chat__apply {
  height: 28px;
  padding: 0 10px;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  background: #f0fdf4;
  color: #166534;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.14s, transform 0.12s;

  &:hover {
    background: #dcfce7;
    transform: translateY(-1px);
  }
}

.ai-chat__bubble--typing {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 18px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #94a3b8;
    animation: ai-dot 1.1s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }
    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

.ai-chat__quick {
  flex-shrink: 0;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 0 12px 8px;
  background: #f8fafc;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.ai-chat__chip {
  flex-shrink: 0;
  height: 26px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #475569;
  font-size: 11px;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: #86efac;
    color: #166534;
  }

  &:disabled {
    opacity: 0.5;
  }
}

.ai-chat__foot {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px 12px;
  border-top: 1px solid #eef2f7;
  background: #fff;
  touch-action: auto;
}

.ai-chat__input {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  resize: none;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.45;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;

  &:focus {
    background: #fff;
    border-color: #86efac;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.14);
  }
}

.ai-chat__send {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #16a34a, #059669);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
  transition: transform 0.12s, filter 0.15s;

  &:hover:not(:disabled) {
    filter: brightness(1.05);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.ai-chat__error {
  margin: 0;
  padding: 0 14px 10px;
  font-size: 12px;
  color: #dc2626;
  background: #fff;
}

.ai-chat__error-link {
  margin-left: 8px;
  border: none;
  background: none;
  color: #15803d;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

@keyframes ai-dot {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@media (max-width: 768px) {
  .ai-chat {
    width: calc(100vw - 24px);
    height: min(70vh, 560px);
  }
}
</style>
