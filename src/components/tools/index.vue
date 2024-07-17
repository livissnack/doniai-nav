<template>
  <div class="util-box">
    <div class="util-title">
      <div><h3>常用工具</h3></div>
      <div class="json-title">
        <b-switch v-model="showTools" @input="handleShowTools">
          开关
        </b-switch>
      </div>
    </div>
    <div class="util-list" v-if="showTools">
      <a :href="item.path" class="util-list-item" v-for="(item, index) in list" :key="index">
        <span class="util-list-item-name" :class="item.recommend ? 'is-recommend' : ''">
          <i class="util-list-item-icon fas" :class="item.icon"></i>
          {{ item.name }}
        </span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickTools',
  data() {
    return {
      list: [
        {
          name: '中国教育在线-掌上高考',
          icon: 'fas fa-fire-alt',
          path: 'https://gaokao.cn/',
          recommend: true,
        },
        {
          name: 'JSON格式化',
          icon: 'fas fa-feather',
          path: '/json',
          recommend: true,
        },
        {
          name: '密码生成器',
          icon: 'fas fa-key',
          path: '/utils/password',
          recommend: false,
        },
        {
          name: 'TV一下',
          icon: 'fas fa-tv',
          path: '/player',
          recommend: false,
        },
        {
          name: 'Base64加解密',
          icon: 'fas fa-bold',
          path: '/utils/base64',
          recommend: false,
        },
        {
          name: '贷款利率计算器',
          icon: 'fas fa-money-bill',
          path: '/utils/loan-rate',
          recommend: false,
        },
        {
          name: '封面生成器',
          icon: 'fas fa-images',
          path: '/utils/cover',
          recommend: false,
        },
        {
          name: '豆瓣租房',
          icon: 'fas fa-home',
          path: 'https://dbzz.house/search?city=%E6%AD%A6%E6%B1%89',
          recommend: false,
        }
      ],
      showTools: true,
    }
  },
  async created() {
    this.getShowTools()
  },
  methods: {
    getShowTools() {
      let status = localStorage.getItem('doniaiNavDayToolsShowStatus')
      this.showTools = status === 'true'
    },
    handleShowTools(value) {
      this.showTools = value
      localStorage.setItem('doniaiNavDayToolsShowStatus', value)
    },
  }
}
</script>

<style lang="less" scoped>
.util-box {
  background: #ffffff;
  padding: 10px 10px 10px 10px;
  .util-title {
    display: flex;
    justify-content: space-between;
    padding: 0 4px;
    div {
      h3 {
        font-size: 1em;
        font-weight: 700;
        color: #363636;
      }
    }
  }
  .util-list {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    max-height: 160px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: block;
      width: 10px;
      height: 100%;
    }

    &::-webkit-scrollbar-track {
      background: #FFFFFF;
    }

    &::-webkit-scrollbar-thumb {
      background: #1E1F24;
      border-radius: 29px;
      height: 10px;
    }

    .util-list-item {
      padding: 6px 6px;
      &:not(:last-child) {
        border-bottom: 1px solid #e5e5e5;
      }
      .util-list-item-name {
        font-size: 14px;
        cursor: pointer;
        color: #000000;
        .util-list-item-icon {
          color: #000000;
        }
        &:hover {
          color: #333333;
          text-decoration: underline;
        }
      }
      .is-recommend {
        color: #D33D3D;
        .util-list-item-icon {
          color: #D33D3D;
        }
      }
    }
  }
}
</style>
