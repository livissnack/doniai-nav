<template>
  <div class="input-group">
    <b-field class="custom-input-width">
      <div class="field">
        <div class="control custom-input-width has-icons-left has-icons-right">
          <input
            class="input is-small"
            v-model="filter.search_text"
            size="is-small"
            placeholder="请输入搜索内容"
            @keyup.enter="startSearch"
            @mouseenter="handleDeleteTextEnetr"
            @mouseleave="handleDeleteTextLeave"
            type="text"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-search"></i>
          </span>
          <span
            class="icon pointer-events is-small is-right"
            v-show="isshow_delete_icon"
            @click="clearSearchText"
          >
            <i class="fas fa-times"></i>
          </span>
        </div>
      </div>
      <b-button type="is-success" size="is-small" @click="startSearch"
        >搜索</b-button
      >
    </b-field>
    <div class="block custom-input-width">
      <b-radio
        v-for="search in searchs"
        :key="search.id"
        v-model="filter.search_type"
        size="is-small"
        :name="search.id.toString()"
        :native-value="search.id"
        >{{ search.name }}</b-radio
      >
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
      isshow_delete_icon: false,
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
    clearSearchText() {
      this.filter.search_text = ''
    },
    handleDeleteTextEnetr() {
      this.isshow_delete_icon = true
    },
    handleDeleteTextLeave() {
      this.isshow_delete_icon = false
    }
  }
}
</script>

<style lang="less" scope>
.custom-input-width {
  width: 400px;
  margin: 0 auto;
  .control {
    width: 400px;
  }
}

.pointer-events {
  pointer-events: auto;
}
</style>
