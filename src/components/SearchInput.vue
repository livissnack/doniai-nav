<template>
  <div class="input-group">
    <b-field class="custom-input-width">
      <div class="field">
        <div class="control has-icons-left">
          <input
              ref="searchInput"
            class="input search-input-placeholder-default-color is-small"
            v-model="filter.search_text"
            size="is-small"
            confirm-type="search"
            placeholder="请输入搜索内容"
            @input="handleChangeKeyword"
            @focus="handleFocusDsug"
            @blur="handleBlurDsug"
            @keyup.enter="handleKeyEnter"
            @keyup.up="handleKeyUp"
            @keyup.down="handleKeyDown"
            type="search"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-search"></i>
          </span>
        </div>

        <div class="control dsug" v-show="historyShow">
          <div class="history-header">
            <div class="history-title">
              <span>搜索历史</span>
            </div>
            <div class="history-clear" @click="handleClearHistory" @mousedown.prevent>
              <span>清空</span>
            </div>
          </div>
          <ul class="recommend-list pd6">
            <li v-for="(history, index) in historyList" :key="index">
              <div
                  class="recommend-box"
                  @mousedown="handleSelectedSearch(history)"
              >
                <div>
                  <span class="icon is-small">
                    <i class="fas fa-history"></i>
                  </span>
                  <span> {{ history }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div class="control dsug" v-show="suggestShow">
          <ul class="recommend-list">
            <li v-for="(item, index) in suggestList" :key="index">
              <div
                class="recommend-box"
                :class="currentItemIndex === index ? 'is-active' : ''"
                @mousedown="handleSelectedSearch(item)"
              >
                <div>
                  <span class="icon is-small">
                    <i class="fas fa-paper-plane"></i>
                  </span>
                  <span> {{ item }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <b-button type="is-success" size="is-small" @click="startSearch">
        搜索
      </b-button>
    </b-field>
    <div class="block custom-input-width">
      <b-radio
        v-for="search in searchs"
        :key="search.id"
        type="is-white"
        v-model="filter.search_type"
        size="is-small"
        :name="search.id.toString()"
        :native-value="search.id"
      >
        {{ search.name }}
      </b-radio>
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
  methods: {
    startSearch() {
      let id = this.filter.search_type
      let text = this.filter.search_text
      if (text === '' || text == null || undefined) {
        this.$buefy.snackbar.open({
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
      console.log('clearHistorySearch')
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
      console.log(this.historyShow, 3)
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
@media screen and (min-width: 375px) and (max-width: 768px){
  .custom-input-width {
    width: 280px !important;
    .control {
      width: 280px !important;
    }
  }
}


.custom-input-width {
  width: 500px;
  margin: 0 auto;
  .control {
    width: 500px;
  }
  /deep/ .radio {
    .control-label {
      color: #FFFFFF;
    }
  }
  /deep/ .check{
    border-color: #333 !important;
  }
}

.has-icons-left {
  .icon {
    color: #666;
  }
}

.input::placeholder {
  color: #000;
}

.dsug {
  z-index: 1;
  position: absolute;
}

.recommend-list {
  display: flex;
  background: #ffffff;
  flex-direction: column;
  list-style-type: none;
  box-shadow: 0 4px 6px 0 rgba(32, 33, 36, 0.28);
  li {
    font-size: 12px;
    padding: 2px 5px;
    .recommend-box {
      display: flex;
      justify-content: space-between;
      .remove {
        &:hover {
          text-decoration: underline;
          cursor: pointer;
          color: #1a73e8;
        }
      }
    }
    .is-active {
      background: #d3d5d8;
      text-decoration: underline;
    }
    &:hover {
      background: #d3d5d8;
      text-decoration: underline;
    }
  }
}

.history-header {
  background: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  font-size: 12px;
  border-bottom: 1px solid #d3d5d8;
  .history-title {
    color: #8a919f;
  }
  .history-clear {
    color: #1e80ff;
    cursor: pointer;
    text-decoration: underline;
  }
}

.pd6 {
  padding-top: 6px;
}

.search-input-placeholder-default-color {
  &::-webkit-input-placeholder {
    color: #8a919f;
  }
  &::-moz-input-placeholder {
    color: #8a919f;
  }
  &::-ms-input-placeholder {
    color: #8a919f;
  }
}
</style>
