<template>
  <div class="input-group">
    <b-field class="custom-input-width">
      <div class="field">
        <div class="control has-icons-left">
          <input
            class="input is-small"
            v-model="filter.search_text"
            size="is-small"
            placeholder="请输入学生分数查询秘钥"
            @input="handleChangeKeyword"
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
            <li v-for="(item, index) in items" :key="index">
              <div
                class="recommend-box"
                @mousedown="handleSelectedSearch(item)"
              >
                <div>
                  <span class="icon is-small">
                    <i class="fas fa-clock"></i>
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
  </div>
</template>

<script>
import jsonSearchs from '@/services/search.json'
import fetchJsonp from 'fetch-jsonp'
export default {
  name: 'home',
  data() {
    return {
      filter: {
        search_text: '',
        search_type: 1
      },
      is_show_dsug: false,
      searchs: jsonSearchs['searchs'],
      items: [
        '2024121233',
        '2024121234',
        '2024121235',
        '2024121236',
        '2024121237',
        '2024121238',
      ]
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
      this.filter.search_text = ''
      window.open(`${searchObj.url}${text}`)
    },
    handleSelectedSearch(item) {
      this.filter.search_text = item
      this.startSearch()
      this.is_show_dsug = false
    },
    handleFocusDsug() {
      this.is_show_dsug = true
    },
    handleBlurDsug() {
      setTimeout(() => {
        this.is_show_dsug = false
      }, 300)
    },
    async handleChangeKeyword() {
      let keyword = this.filter.search_text
      if(keyword === '') {
        return
      }
      let response = await fetchJsonp(`https://suggestion.baidu.com/su?wd=${keyword}`, {
        jsonpCallback: 'cb',
      })
      response = await response.json()
      this.items = response.s
    }
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
    &:hover {
      background: #d3d5d8;
      text-decoration: underline;
    }
  }
}
</style>
