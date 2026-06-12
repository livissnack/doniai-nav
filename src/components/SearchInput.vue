<template>
  <div class="input-group">
    <div class="search-wrap custom-input-width">
      <div class="search-bar">
        <label class="search-field" for="doniai-search-input">
          <span class="visually-hidden">搜索内容</span>
          <AppIcon name="search" class="search-icon" aria-hidden="true" />
          <input
            id="doniai-search-input"
            ref="searchInput"
            class="search-input"
            v-model="filter.search_text"
            name="q"
            confirm-type="search"
            placeholder="请输入搜索内容"
            autocomplete="off"
            enterkeyhint="search"
            @input="handleChangeKeyword"
            @focus="handleFocusDsug"
            @blur="handleBlurDsug"
            @keyup.enter="handleKeyEnter"
            @keyup.up="handleKeyUp"
            @keyup.down="handleKeyDown"
            type="search"
          />
        </label>
        <button type="button" class="search-btn" @click="startSearch">
          <AppIcon name="search" aria-hidden="true" />
          <span>搜索</span>
        </button>
      </div>

      <div class="dsug-panel" v-show="historyShow">
        <div class="history-header">
          <span class="history-title">搜索历史</span>
          <button type="button" class="history-clear" @mousedown.prevent @click="handleClearHistory">
            清空
          </button>
        </div>
        <ul class="recommend-list">
          <li v-for="(history, index) in historyList" :key="'h-' + index">
            <button
              type="button"
              class="recommend-item"
              @mousedown.prevent="handleSelectedSearch(history)"
            >
              <AppIcon name="history"  />
              <span>{{ history }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="dsug-panel" v-show="suggestShow">
        <ul class="recommend-list">
          <li v-for="(item, index) in suggestList" :key="'s-' + index">
            <button
              type="button"
              class="recommend-item"
              :class="{ 'is-active': currentItemIndex === index }"
              @mousedown.prevent="handleSelectedSearch(item)"
            >
              <AppIcon name="paper-plane"  />
              <span>{{ item }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
    <div class="engine-list custom-input-width">
      <button
        v-for="search in searchs"
        :key="search.id"
        type="button"
        class="engine-chip"
        :class="{ 'is-active': filter.search_type === search.id }"
        @click="selectEngine(search.id)"
      >
        {{ search.name }}
      </button>
    </div>
  </div>
</template>

<script>
import jsonSearchs from '@/services/search.json'
import fetchJsonp from 'fetch-jsonp'
import {isEmpty} from "@/utils/helper"
export default {
  name: 'home',
  data() {
    return {
      filter: {
        search_text: '',
        search_type: 1
      },
      searchs: jsonSearchs['searchs'],
      suggestShow: false,
      suggestList: [],
      historyShow: false,
      historyList: [],
      currentItemIndex: -1,
    }
  },
  watch: {
    'filter.search_text': {
      handler(val) {
        this.filter.search_text = val
      },
      deep: true
    }
  },
  mounted() {
    window.addEventListener('keydown', this.keyDown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.keyDown)
  },
  methods: {
    selectEngine(id) {
      this.filter.search_type = id
    },
    startSearch() {
      let id = this.filter.search_type
      let text = this.filter.search_text
      if (text === '' || text == null || undefined) {
        this.$notify({
          duration: 3000,
          message: '输入框内容不能为空！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
        return
      }
      this.handleLocalStorageSave(text)
      let searchObj = this.searchs.find(el => el.id === id)
      this.filter.search_text = ''
      this.$refs.searchInput.blur()
      window.open(`${searchObj.url}${text}`)
    },
    handleLocalStorageSave(keyword) {
      let currentSearchHistory = this.historyList
      if (currentSearchHistory.length < 6) {
        this.historyList = [keyword].concat(currentSearchHistory)
      } else {
        currentSearchHistory.pop()
        this.historyList = [keyword].concat(currentSearchHistory)
      }
      this.historyList = Array.from(new Set(this.historyList))
      localStorage.setItem('doniaiNavHistoryHomePageList', JSON.stringify(this.historyList))
    },
    handleClearHistory() {
      this.historyList = []
      localStorage.removeItem('doniaiNavHistoryHomePageList')
    },
    handleSelectedSearch(item) {
      this.filter.search_text = item
      this.startSearch()
    },
    handleFocusDsug() {
      let res = localStorage.getItem('doniaiNavHistoryHomePageList')
      this.historyList = res ? JSON.parse(res) : []
      this.historyShow = true
    },
    handleBlurDsug() {
      setTimeout(() => {
        this.historyShow = false
        this.suggestShow = false
      }, 100)
    },
    async handleChangeKeyword() {
      let keyword = this.filter.search_text
      await this.setShowContent(keyword)
      if(keyword === '') {
        return
      }
      let response = await fetchJsonp(`https://suggestion.baidu.com/su?wd=${keyword}`, {
        jsonpCallback: 'cb',
      })
      response = await response.json()
      this.suggestList = response.s
    },
    setShowContent(searchValue) {
      if (!isEmpty(searchValue)) {
        this.historyShow = false
        this.suggestShow = true
      } else {
        this.historyShow = true
        this.suggestShow = false
      }
    },
    handleKeyEnter() {
      if (this.currentItemIndex >= 0 && this.currentItemIndex < this.suggestList.length) {
        this.filter.search_text = this.suggestList[this.currentItemIndex]
      }
      this.startSearch()
    },
    handleKeyUp() {
      if (this.historyShow) {
        return
      }
      if (this.currentItemIndex <= 0) {
        this.currentItemIndex = -1
      } else {
        this.currentItemIndex -= 1
      }
    },
    handleKeyDown() {
      if (this.historyShow) {
        return
      }
      if (this.currentItemIndex >= this.suggestList.length - 1) {
        this.currentItemIndex = 0
      } else {
        this.currentItemIndex += 1
      }
    },
    keyDown(event) {
      const e = event || window.event
      let key = e.keyCode
      if (key === 37) {
        if (this.filter.search_type <= 1) {
          this.filter.search_type = 1
        } else {
          this.filter.search_type -= 1
        }
      } else if (key === 39) {
        if (this.filter.search_type >= this.searchs.length) {
          this.filter.search_type = 1
        } else {
          this.filter.search_type += 1
        }
      }
    },
  }
}
</script>

<style lang="less" scoped>
.input-group {
  width: 100%;
}

.custom-input-width {
  width: 560px;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.search-wrap {
  position: relative;
}

.search-bar {
  display: flex;
  align-items: stretch;
  width: 100%;
  min-height: 44px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 22px;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.18);
  overflow: hidden;
  transition: box-shadow 0.2s, border-color 0.2s;

  &:focus-within {
    border-color: #20bc56;
    box-shadow: 0 4px 22px rgba(32, 188, 86, 0.28);
  }
}

.search-field {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  margin: 0;
  padding: 0;
  cursor: text;
}

.search-icon {
  flex-shrink: 0;
  margin-left: 14px;
  font-size: 14px;
  color: #6b7280;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 12px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1f2937;

  &::placeholder {
    color: #6b7280;
  }

  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
}

.search-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  padding: 0 20px;
  border: none;
  background: linear-gradient(135deg, #22c65b, #20bc56);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;

  i {
    font-size: 13px;
  }

  &:hover {
    background: linear-gradient(135deg, #2dd36f, #22c65b);
  }

  &:active {
    transform: scale(0.98);
  }
}

.dsug-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
  overflow: hidden;
}

.engine-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 0 4px;
}

.engine-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255, 255, 255, 0.32);
    border-color: rgba(255, 255, 255, 0.7);
  }

  &.is-active {
    background: #20bc56;
    border-color: #20bc56;
    color: #fff;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(32, 188, 86, 0.45);
  }

  &:active {
    transform: scale(0.97);
  }
}

.recommend-list {
  margin: 0;
  padding: 4px 0;
  list-style: none;
  max-height: 220px;
  overflow-y: auto;

  li {
    margin: 0;
    padding: 0;
  }
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 14px;
  border: none;
  background: transparent;
  color: #4b5563;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  i {
    flex-shrink: 0;
    width: 14px;
    color: #9ca3af;
    font-size: 12px;
  }

  span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &:hover,
  &.is-active {
    background: #f0f7f4;
    color: #20bc56;

    i {
      color: #20bc56;
    }
  }
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  font-size: 12px;
  border-bottom: 1px solid #eef0f3;
  background: #fafbfc;
}

.history-title {
  color: #8a919f;
}

.history-clear {
  border: none;
  background: none;
  padding: 0;
  color: #1e80ff;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

@media screen and (max-width: 768px) {
  .input-group {
    padding: 0 4px;
    box-sizing: border-box;
  }

  .custom-input-width {
    width: 100%;
  }

  .search-bar {
    min-height: 40px;
    border-radius: 20px;
  }

  .search-input {
    height: 40px;
    font-size: 14px;
  }

  .search-btn {
    height: 40px;
    padding: 0 14px;
    font-size: 14px;

    span {
      display: none;
    }
  }

  .engine-list {
    gap: 6px;
    margin-top: 10px;
  }

  .engine-chip {
    min-width: 48px;
    height: 26px;
    padding: 0 10px;
    font-size: 12px;
  }
}
</style>
