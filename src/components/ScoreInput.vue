<template>
  <div class="score-search">
    <label class="score-search__label">查询秘钥</label>
    <div class="score-search__row">
      <div class="score-search__input">
        <o-field :message="errorMsg">
          <o-input
            v-model="keyword"
            placeholder="请输入学生分数查询秘钥"
            maxlength="32"
            icon-pack="fas"
            icon-right="times"
            icon-right-clickable
            @icon-right-click="clearKeyword"
            @keyup.enter="startSearch"
          />
        </o-field>
      </div>
      <o-button variant="success" :loading="loading" @click="startSearch">搜索</o-button>
    </div>

    <div v-show="showHistory" class="score-search__history">
      <button
        v-for="(item, index) in historyItems"
        :key="index"
        type="button"
        class="history-chip"
        @mousedown.prevent="selectHistory(item)"
      >
        <i class="fas fa-clock"></i>
        {{ item }}
      </button>
    </div>
  </div>
</template>

<script>
const HISTORY_KEY = 'doniaiNavScoreHistory'

export default {
  name: 'ScoreInput',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    initialKey: {
      type: String,
      default: '',
    },
  },
  emits: ['search'],
  data() {
    return {
      keyword: '',
      errorMsg: '',
      showHistory: false,
      historyItems: this.readHistory(),
    }
  },
  methods: {
    readHistory() {
      try {
        const raw = localStorage.getItem(HISTORY_KEY)
        const list = raw ? JSON.parse(raw) : []
        return Array.isArray(list) ? list : []
      } catch {
        return []
      }
    },
    saveHistory(key) {
      const list = [key, ...this.historyItems.filter((item) => item !== key)].slice(0, 8)
      this.historyItems = list
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
    },
    clearKeyword() {
      this.keyword = ''
      this.errorMsg = ''
    },
    selectHistory(item) {
      this.keyword = item
      this.showHistory = false
      this.startSearch()
    },
    startSearch() {
      const text = (this.keyword || '').trim()
      if (!text) {
        this.errorMsg = '请输入查询秘钥'
        this.$notify({
          duration: 3000,
          message: '输入框内容不能为空！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
        return
      }
      this.errorMsg = ''
      this.saveHistory(text)
      this.showHistory = false
      this.$emit('search', text)
    },
    onFocus() {
      this.showHistory = true
    },
    onBlur() {
      setTimeout(() => {
        this.showHistory = false
      }, 200)
    },
  },
  mounted() {
    const preset = (this.initialKey || '').trim()
    if (preset) {
      this.keyword = preset
    }
    const input = this.$el.querySelector('input')
    if (input) {
      input.addEventListener('focus', this.onFocus)
      input.addEventListener('blur', this.onBlur)
    }
  },
  beforeUnmount() {
    const input = this.$el.querySelector('input')
    if (input) {
      input.removeEventListener('focus', this.onFocus)
      input.removeEventListener('blur', this.onBlur)
    }
  },
}
</script>

<style lang="less" scoped>
.score-search {
  margin-bottom: 16px;
}

.score-search__label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #363636;
}

.score-search__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.score-search__input {
  flex: 1;
  min-width: 0;

  :deep(.field) {
    margin-bottom: 0;
    width: 100%;
  }

  :deep(.control) {
    width: 100%;
  }

  :deep(.input) {
    width: 100%;
    height: 40px;
    min-height: 40px;
    box-sizing: border-box;
  }

  :deep(.help) {
    margin-top: 4px;
  }
}

.score-search__row > :deep(.button) {
  height: 40px;
  min-height: 40px;
  margin-top: 0;
  white-space: nowrap;
}

.score-search__history {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.history-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff;
  color: #555;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    border-color: #6943d0;
    color: #6943d0;
  }
}

@media screen and (max-width: 768px) {
  .score-search__row {
    gap: 8px;
  }

  .score-search__row > :deep(.button) {
    min-width: 72px;
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
