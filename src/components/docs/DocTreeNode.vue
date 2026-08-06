<template>
  <li
    class="tree-node"
    :class="{
      'is-dragging': draggingId === node.id,
      'is-renaming': isRenaming,
      'drop-before': dropHint?.id === node.id && dropHint?.position === 'before',
      'drop-after': dropHint?.id === node.id && dropHint?.position === 'after',
      'drop-inside': dropHint?.id === node.id && dropHint?.position === 'inside',
    }"
  >
    <div
      class="tree-row"
      :class="{ active: Number(node.id) === Number(activeId), 'is-folder': node.kind === 'folder' }"
      :draggable="!isRenaming"
      @click="onRowClick"
      @contextmenu.prevent="$emit('contextmenu', node, $event)"
      @dragstart="onDragStart"
      @dragend="$emit('drag-end')"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop"
    >
      <span class="tree-grip" title="拖动" @click.stop>
        <AppIcon name="grip-vertical" />
      </span>

      <button
        v-if="node.kind === 'folder'"
        type="button"
        class="tree-caret"
        :aria-label="expanded ? '收起' : '展开'"
        @click.stop="$emit('toggle', node.id)"
      >
        <AppIcon :name="expanded ? 'chevron-down' : 'chevron-right'" />
      </button>
      <span v-else class="tree-caret tree-caret--spacer" aria-hidden="true" />

      <AppIcon
        class="tree-type"
        :name="node.kind === 'folder' ? (expanded ? 'folder-open' : 'folder') : 'file-alt'"
      />

      <input
        v-if="isRenaming"
        ref="renameInput"
        class="tree-rename"
        :value="renameDraft"
        maxlength="60"
        @click.stop
        @mousedown.stop
        @input="$emit('rename-input', $event.target.value)"
        @keydown.enter.prevent="$emit('rename-commit')"
        @keydown.esc.prevent="$emit('rename-cancel')"
        @blur="$emit('rename-commit')"
      />
      <span
        v-else
        class="tree-label"
        :title="node.title"
        v-html="highlightedTitle"
      />
    </div>

    <ul v-if="node.kind === 'folder' && expanded && node.children?.length" class="tree-children">
      <DocTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :active-id="activeId"
        :expanded-ids="expandedIds"
        :dragging-id="draggingId"
        :drop-hint="dropHint"
        :renaming-id="renamingId"
        :rename-draft="renameDraft"
        :keyword="keyword"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
        @contextmenu="(n, e) => $emit('contextmenu', n, e)"
        @drag-start="$emit('drag-start', $event)"
        @drag-end="$emit('drag-end')"
        @drag-over="$emit('drag-over', $event)"
        @drop-node="$emit('drop-node', $event)"
        @rename-input="$emit('rename-input', $event)"
        @rename-commit="$emit('rename-commit')"
        @rename-cancel="$emit('rename-cancel')"
      />
    </ul>
  </li>
</template>

<script>
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlightTitle(title, keyword) {
  const text = String(title || '')
  const key = String(keyword || '').trim()
  if (!key) return escapeHtml(text)
  const lower = text.toLowerCase()
  const needle = key.toLowerCase()
  let html = ''
  let cursor = 0
  while (cursor < text.length) {
    const idx = lower.indexOf(needle, cursor)
    if (idx < 0) {
      html += escapeHtml(text.slice(cursor))
      break
    }
    html += escapeHtml(text.slice(cursor, idx))
    html += `<mark class="tree-hl">${escapeHtml(text.slice(idx, idx + needle.length))}</mark>`
    cursor = idx + needle.length
  }
  return html
}

export default {
  name: 'DocTreeNode',
  props: {
    node: { type: Object, required: true },
    activeId: { type: [Number, String], default: null },
    expandedIds: { type: Object, default: () => ({}) },
    draggingId: { type: [Number, String], default: null },
    dropHint: { type: Object, default: null },
    renamingId: { type: [Number, String], default: null },
    renameDraft: { type: String, default: '' },
    keyword: { type: String, default: '' },
  },
  emits: [
    'select',
    'toggle',
    'contextmenu',
    'drag-start',
    'drag-end',
    'drag-over',
    'drop-node',
    'rename-input',
    'rename-commit',
    'rename-cancel',
  ],
  computed: {
    expanded() {
      return this.node.kind !== 'folder' || !!this.expandedIds[this.node.id]
    },
    isRenaming() {
      return Number(this.renamingId) === Number(this.node.id)
    },
    highlightedTitle() {
      return highlightTitle(this.node.title, this.keyword)
    },
  },
  watch: {
    isRenaming(val) {
      if (val) {
        this.$nextTick(() => {
          const el = this.$refs.renameInput
          if (!el) return
          el.focus()
          el.select()
        })
      }
    },
  },
  mounted() {
    if (this.isRenaming) {
      this.$nextTick(() => {
        const el = this.$refs.renameInput
        if (!el) return
        el.focus()
        el.select()
      })
    }
  },
  methods: {
    onRowClick() {
      if (this.isRenaming) return
      this.$emit('select', this.node)
    },
    onDragStart(e) {
      if (this.isRenaming) {
        e.preventDefault()
        return
      }
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(this.node.id))
      this.$emit('drag-start', this.node.id)
    },
    resolvePosition(e) {
      const rect = e.currentTarget.getBoundingClientRect()
      const y = e.clientY - rect.top
      const ratio = y / rect.height
      if (this.node.kind === 'folder') {
        if (ratio < 0.28) return 'before'
        if (ratio > 0.72) return 'after'
        return 'inside'
      }
      return ratio < 0.5 ? 'before' : 'after'
    },
    onDragOver(e) {
      if (!this.draggingId || Number(this.draggingId) === Number(this.node.id)) return
      const position = this.resolvePosition(e)
      this.$emit('drag-over', { id: this.node.id, position })
    },
    onDragLeave(e) {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        this.$emit('drag-over', null)
      }
    },
    onDrop(e) {
      const dragId = Number(e.dataTransfer.getData('text/plain') || this.draggingId)
      if (!dragId || dragId === Number(this.node.id)) return
      this.$emit('drop-node', {
        dragId,
        targetId: Number(this.node.id),
        position: this.resolvePosition(e),
      })
    },
  },
}
</script>

<style lang="less" scoped>
.tree-node {
  list-style: none;
  position: relative;
}

.tree-children {
  list-style: none;
  margin: 0;
  padding: 0 0 0 12px;
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 34px;
  padding: 4px 8px 4px 4px;
  margin-bottom: 1px;
  cursor: pointer;
  font-size: 13px;
  color: #475569;
  border-left: 3px solid transparent;
  transition: background 0.12s, border-color 0.12s, color 0.12s;

  &:hover {
    background: #fff;

    .tree-grip {
      opacity: 0.65;
    }
  }

  &.active {
    background: #f0fdf4;
    border-left-color: #20bc56;
    color: #166534;
    font-weight: 600;

    .tree-type {
      color: #20bc56;
    }
  }

  &.is-folder .tree-type {
    color: #f59e0b;
  }
}

.tree-grip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 20px;
  color: #94a3b8;
  opacity: 0;
  cursor: grab;
  flex-shrink: 0;
  transition: opacity 0.12s;

  &:active {
    cursor: grabbing;
  }
}

.tree-caret {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  background: transparent;
  color: #94a3b8;
  font-size: 10px;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    color: #475569;
  }

  &--spacer {
    pointer-events: none;
  }
}

.tree-type {
  width: 14px;
  font-size: 12px;
  color: #64748b;
  flex-shrink: 0;
}

.tree-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 4px;

  :deep(.tree-hl) {
    padding: 0 1px;
    background: #fef08a;
    color: #854d0e;
    font-weight: 700;
  }
}

.tree-rename {
  flex: 1;
  min-width: 0;
  height: 26px;
  margin-right: 4px;
  padding: 0 8px;
  border: 1px solid #20bc56;
  background: #fff;
  color: #1e293b;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  box-shadow: 0 0 0 2px rgba(32, 188, 86, 0.15);
}

.is-renaming > .tree-row {
  background: #f0fdf4;
  border-left-color: #20bc56;
}

.is-dragging > .tree-row {
  opacity: 0.45;
}

.drop-before > .tree-row::before,
.drop-after > .tree-row::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  height: 2px;
  background: #20bc56;
  pointer-events: none;
}

.drop-before > .tree-row {
  position: relative;

  &::before {
    top: 0;
  }
}

.drop-after > .tree-row {
  position: relative;

  &::after {
    bottom: 0;
  }
}

.drop-inside > .tree-row {
  background: rgba(32, 188, 86, 0.12);
  outline: 1px dashed rgba(32, 188, 86, 0.55);
}
</style>
