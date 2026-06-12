<template>
  <div
    class="sidebar-panel-state"
    :class="[`is-${status}`, { 'is-compact': compact }]"
    :style="boxStyle"
  >
    <i v-if="status === 'loading'" class="fas fa-spinner fa-spin sidebar-panel-state__icon"></i>
    <i v-else-if="status === 'error'" class="fas fa-exclamation-circle sidebar-panel-state__icon is-error"></i>
    <i v-else class="fas fa-inbox sidebar-panel-state__icon is-empty"></i>
    <p class="sidebar-panel-state__text">{{ message }}</p>
    <button
      v-if="status === 'error' && retryable"
      type="button"
      class="sidebar-panel-state__retry"
      @click="$emit('retry')"
    >
      重试
    </button>
  </div>
</template>

<script>
export default {
  name: 'SidebarPanelState',
  props: {
    status: {
      type: String,
      default: 'empty',
      validator: (v) => ['loading', 'empty', 'error'].includes(v),
    },
    message: {
      type: String,
      default: '暂无数据',
    },
    retryable: {
      type: Boolean,
      default: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    minHeight: {
      type: [Number, String],
      default: 100,
    },
  },
  emits: ['retry'],
  computed: {
    boxStyle() {
      const h = this.minHeight
      return { minHeight: typeof h === 'number' ? `${h}px` : h }
    },
  },
}
</script>

<style lang="less" scoped>
.sidebar-panel-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  text-align: center;
  box-sizing: border-box;
}

.sidebar-panel-state__icon {
  font-size: 18px;
  color: #9ca3af;

  &.is-error {
    color: #f59e0b;
  }

  &.is-empty {
    color: #d1d5db;
    font-size: 16px;
  }
}

.sidebar-panel-state__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #9ca3af;
}

.is-error .sidebar-panel-state__text {
  color: #6b7280;
}

.is-loading .sidebar-panel-state__text {
  color: #8c8c8c;
}

.sidebar-panel-state__retry {
  margin-top: 2px;
  padding: 4px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  color: #20bc56;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: #20bc56;
    background: #f0fdf4;
  }
}

.is-compact {
  padding: 12px 8px;
  gap: 6px;

  .sidebar-panel-state__icon {
    font-size: 15px;
  }

  .sidebar-panel-state__text {
    font-size: 12px;
  }
}
</style>
