<template>
  <teleport to="body">
    <div v-if="open" class="emoji-mask" @click.self="$emit('close')">
      <div class="emoji-modal" role="dialog" aria-label="插入表情短代码">
        <header class="emoji-modal__head">
          <div>
            <h3>表情短代码</h3>
            <p>
              共 {{ total }} 个
              <template v-if="!query.trim()">（虚拟滚动，常用优先）</template>
              · 点击插入如 <code>:tada:</code>
            </p>
          </div>
          <button type="button" class="emoji-modal__close" title="关闭" @click="$emit('close')">
            <AppIcon name="times" />
          </button>
        </header>

        <div class="emoji-modal__search">
          <AppIcon name="search" />
          <input
            ref="searchEl"
            v-model="query"
            type="search"
            placeholder="搜索，例如 tada / heart / fire"
            autocomplete="off"
            @keydown.esc.prevent="$emit('close')"
          />
        </div>

        <div
          ref="scrollerEl"
          class="emoji-modal__scroller"
          @scroll.passive="onScroll"
        >
          <p v-if="!total" class="emoji-empty">没有匹配的表情</p>
          <div
            v-else
            class="emoji-virtual"
            :style="{ height: `${totalHeight}px` }"
          >
            <div
              class="emoji-virtual__window"
              :style="{ transform: `translateY(${offsetY}px)` }"
            >
              <div
                v-for="row in visibleRows"
                :key="row.index"
                class="emoji-row"
                :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
              >
                <button
                  v-for="item in row.items"
                  :key="item.shortcode"
                  type="button"
                  class="emoji-item"
                  :title="item.shortcode"
                  @click="$emit('select', item)"
                >
                  <span class="emoji-item__char">{{ item.emoji }}</span>
                  <span class="emoji-item__code">{{ item.shortcode }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { listAllEmojis, listFeaturedEmojis, searchEmojiShortcodes } from '@/utils/emojiShortcodes'

const CELL_MIN = 92
const ROW_H = 64
const GAP = 6
const PAD = 12
const OVERSCAN = 3

export default {
  name: 'EmojiPicker',
  props: {
    open: { type: Boolean, default: false },
  },
  emits: ['close', 'select'],
  data() {
    return {
      query: '',
      scrollTop: 0,
      viewportH: 360,
      viewportW: 600,
      items: [],
      cols: 6,
    }
  },
  computed: {
    total() {
      return this.items.length
    },
    rowCount() {
      return Math.ceil(this.total / Math.max(1, this.cols)) || 0
    },
    totalHeight() {
      if (!this.rowCount) return 0
      return this.rowCount * (ROW_H + GAP) - GAP + PAD * 2
    },
    startRow() {
      const y = Math.max(0, this.scrollTop - PAD)
      return Math.max(0, Math.floor(y / (ROW_H + GAP)) - OVERSCAN)
    },
    endRow() {
      const visible = Math.ceil(this.viewportH / (ROW_H + GAP)) + OVERSCAN * 2
      return Math.min(this.rowCount, this.startRow + visible)
    },
    offsetY() {
      return PAD + this.startRow * (ROW_H + GAP)
    },
    visibleRows() {
      const rows = []
      const cols = Math.max(1, this.cols)
      for (let r = this.startRow; r < this.endRow; r++) {
        const start = r * cols
        rows.push({
          index: r,
          items: this.items.slice(start, start + cols),
        })
      }
      return rows
    },
  },
  watch: {
    open(val) {
      if (val) {
        this.query = ''
        this.scrollTop = 0
        this.$nextTick(() => {
          this.measure()
          this.loadList()
          this.$refs.searchEl?.focus()
          this.$refs.scrollerEl && (this.$refs.scrollerEl.scrollTop = 0)
        })
      }
    },
    query() {
      clearTimeout(this._qTimer)
      this._qTimer = setTimeout(() => {
        this.loadList()
        if (this.$refs.scrollerEl) this.$refs.scrollerEl.scrollTop = 0
        this.scrollTop = 0
      }, 120)
    },
  },
  mounted() {
    this._onResize = () => {
      if (this.open) this.measure()
    }
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this._onResize)
    clearTimeout(this._qTimer)
  },
  methods: {
    measure() {
      const el = this.$refs.scrollerEl
      if (!el) return
      this.viewportH = el.clientHeight || 360
      this.viewportW = el.clientWidth || 600
      const inner = Math.max(0, this.viewportW - PAD * 2)
      this.cols = Math.max(3, Math.floor((inner + GAP) / (CELL_MIN + GAP)))
    },
    loadList() {
      // Keep first paint light: featured only, then expand to full catalog.
      const q = this.query.trim()
      if (q) {
        requestAnimationFrame(() => {
          this.items = searchEmojiShortcodes(q)
          this.$nextTick(() => this.measure())
        })
        return
      }
      this.items = listFeaturedEmojis()
      this.$nextTick(() => this.measure())
      requestAnimationFrame(() => {
        // Expand in idle time so open feels instant
        const expand = () => {
          if (this.query.trim() || !this.open) return
          this.items = listAllEmojis()
          this.$nextTick(() => this.measure())
        }
        if (typeof requestIdleCallback === 'function') {
          requestIdleCallback(expand, { timeout: 400 })
        } else {
          setTimeout(expand, 50)
        }
      })
    },
    onScroll(e) {
      this.scrollTop = e.target.scrollTop
    },
  },
}
</script>

<style lang="less" scoped>
.emoji-mask {
  position: fixed;
  inset: 0;
  z-index: 10090;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(2px);
}

.emoji-modal {
  width: min(640px, 100%);
  height: min(80vh, 720px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.emoji-modal__head {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #eef2f7;

  h3 {
    margin: 0;
    font-size: 15px;
    color: #0f172a;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
  }

  code {
    font-size: 11px;
    color: #15803d;
    background: #f0fdf4;
    padding: 1px 5px;
    border-radius: 4px;
  }
}

.emoji-modal__close {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
}

.emoji-modal__search {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 12px 0;
  padding: 0 10px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #94a3b8;

  input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    outline: none;
    color: #0f172a;
    font-size: 13px;
  }

  &:focus-within {
    border-color: #86efac;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
    background: #fff;
  }
}

.emoji-modal__scroller {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin-top: 8px;
  scrollbar-width: thin;
}

.emoji-virtual {
  position: relative;
  width: 100%;
}

.emoji-virtual__window {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  will-change: transform;
  padding: 0 12px;
}

.emoji-row {
  display: grid;
  gap: 6px;
  height: 64px;
  margin-bottom: 6px;
}

.emoji-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 64px;
  padding: 4px;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  background: #fafbfc;
  cursor: pointer;
  transition: border-color 0.14s, background 0.14s;

  &:hover {
    border-color: #86efac;
    background: #f0fdf4;
  }
}

.emoji-item__char {
  font-size: 22px;
  line-height: 1.15;
}

.emoji-item__code {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  color: #64748b;
}

.emoji-empty {
  margin: 40px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}
</style>
