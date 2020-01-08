<template>
  <div class="input-group">
    <b-field class="custom-input-width">
      <div class="field">
        <div class="control has-icons-left">
          <input
            class="input is-small"
            v-model="filter.search_text"
            size="is-small"
            placeholder="请输入搜索内容"
            @focus="handleFocusDsug"
            @blur="handleBlurDsug"
            @keyup.enter="startSearch"
            type="search"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-search"></i>
          </span>
        </div>
        <div class="control dsug" v-show="is_show_dsug">
          <ul class="recommend-list">
            <li v-for="item in items" :key="item.index">
              <div
                class="recommend-box"
                @mousedown="handleSelectedSearch(item)"
              >
                <div>
                  <span class="icon is-small">
                    <i class="fas fa-clock"></i>
                  </span>
                  <span> {{ item.text }}</span>
                </div>
                <div class="remove">
                  <span>Remove</span>
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
export default {
  name: 'home',
  data() {
    return {
      filter: {
        search_text: '',
        search_type: 1
      },
      is_show_dsug: false,
      searchs: [
        {
          id: 1,
          name: '百度',
          url: 'https://www.baidu.com/s?wd=',
          is_default: true
        },
        {
          id: 2,
          name: '谷歌',
          url: 'https://www.google.com.hk/search?q=',
          is_default: false
        },
        {
          id: 3,
          name: '必应',
          url: 'https://cn.bing.com/search?q=',
          is_default: false
        },
        {
          id: 4,
          name: '多尼爱',
          url: 'https://www.doniai.com/search?q=',
          is_default: false
        },
        {
          id: 5,
          name: 'githup',
          url: 'https://github.com/search?q=',
          is_default: false
        },
        {
          id: 6,
          name: '图片',
          url:
            'http://image.baidu.com/search/index?tn=baiduimage&ps=1&ct=201326592&lm=-1&cl=2&nc=1&ie=utf-8&word=',
          is_default: false
        },
        {
          id: 7,
          name: '图标',
          url: 'https://www.iconfont.cn/search/index?searchType=icon&q=',
          is_default: false
        }
      ],
      items: [
        {
          id: 1,
          text: 'dayjs'
        },
        {
          id: 2,
          text: 'dallas cowboys'
        },
        {
          id: 3,
          text: 'david i moss'
        },
        {
          id: 4,
          text: 'daily mail'
        },
        {
          id: 5,
          text: 'daylight donuts'
        },
        {
          id: 6,
          text: 'daniel fast'
        }
      ]
    }
  },
  methods: {
    startSearch() {
      let id = this.filter.search_type
      let text = this.filter.search_text
      if (text == '' || text == null || undefined) {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: '输入框内容不能为空！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
        return
      }
      let searchObj = this.searchs.find(el => el.id === id)
      window.open(`${searchObj.url}${text}`)
    },
    handleSelectedSearch(item) {
      this.filter.search_text = item.text
      this.startSearch()
    },
    handleFocusDsug() {
      this.is_show_dsug = true
    },
    handleBlurDsug() {
      setTimeout(() => {
        this.is_show_dsug = false
      }, 300)
    }
  }
}
</script>

<style lang="less" scoped>
.custom-input-width {
  width: 400px;
  margin: 0 auto;
  .control {
    width: 400px;
  }
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
    &:hover {
      background: #d3d5d8;
    }
  }
}
</style>
