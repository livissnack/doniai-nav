<template>
  <div class="media-box">
    <div class="media-title">
      <div><h3>媒体资源导航</h3></div>
      <div class="tv-title"><h3 @click="goMore">更多</h3></div>
    </div>
    <div class="media-nav">
      <div class="media-nav-item" v-for="(item, index) in list" :key="index" @click="handleJumpPage(item)">
        <marquee class="txt">{{ item.name }}</marquee>
      </div>
      <div class="media-nav-item"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MediaResource',
  props: {
    resourceUrl: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      list: [
        {
          name: '量子资源网',
          url: 'http://lzizy.com/',
          isParse: false,
          routeType: 'out',
        },
        {
          name: '虾米解析',
          url: '/xiami',
          isParse: true,
          routeType: 'in',
        }
      ],
    }
  },
  methods: {
    handleJumpPage(item) {
      let url = item.isParse ? `${item.url}${this.resourceUrl}` : item.url
      if (item.routeType === 'in') {
        this.$router.push({ path: `${item.url}` })
      } else {
        window.open(`${url}`, 'target')
      }
    },
    goMore() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: '更多功能尚未开放！',
        type: 'is-info',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
      // this.$router.push({ path: '/player' })
    }
  }
}
</script>

<style lang="less" scoped>
.media-box {
  background: #ffffff;
  padding: 10px 10px 10px 10px;
  .media-title {
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
    .tv-title {
      h3 {
        &:hover {
          cursor: pointer;
          text-decoration: underline;
          color: #f4645f;
        }
      }
    }
  }

  .media-nav {
    .media-nav-item {
      font-size: 12px;
      color: #666;
      .txt {
        cursor: pointer;
        &:hover {
          color: #f4645f;
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
