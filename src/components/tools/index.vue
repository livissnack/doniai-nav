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
        <span class="util-list-item-name">
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
          name: 'JSON格式化',
          icon: 'fas fa-fire-alt',
          path: '/json'
        },
        {
          name: '密码生成器',
          icon: 'fas fa-fire-alt',
          path: '/utils/password'
        },
        {
          name: 'TV一下',
          icon: 'fas fa-fire-alt',
          path: '/player'
        },
        {
          name: 'Base64加解密',
          icon: 'fas fa-fire-alt',
          path: '/utils/base64'
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
    .util-list-item {
      padding: 6px 6px;
      &:not(:last-child) {
        border-bottom: 1px solid #e5e5e5;
      }
      .util-list-item-name {
        font-size: 14px;
        cursor: pointer;
        color: #D33D3D;
        .util-list-item-icon {
          color: #D33D3D;
        }
        &:hover {
          color: #333333;
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
