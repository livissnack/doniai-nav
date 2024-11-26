<template>
  <div class="util-box">
    <div class="util-title">
      <div><h3>热门新闻</h3></div>
      <div class="json-title"><h3 @click="goJson">Json工具</h3></div>
    </div>
    <div class="hot-news">
      <div class="news-carousel">
        <div class="news-group" v-for="(group, index) in groupedNews" :key="index" :class="{ active: currentIndex === index }">
          <div class="news-item" v-for="item in group" :key="item.id" @click="handleOpenLink(item)" :title="item.title">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getHotNews } from '@/services/api'
export default {
  name: 'News',
  data() {
    return {
      news_type: 'baidu',
      list: [],
      currentIndex: 0,
      intervalId: null
    }
  },
  computed: {
    groupedNews() {
      const result = [];
      for (let i = 0; i < this.list.length; i += 5) {
        result.push(this.list.slice(i, i + 5));
      }
      return result;
    }
  },
  async created() {
    await this.getShowHotNews()
  },
  mounted() {
    this.swipeNews()
  },
  beforeDestroy() {
    this.stopCarousel();
  },
  methods: {
    goJson() {
      this.$router.push({ path: '/json' })
    },
    swipeNews() {
      this.intervalId = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.groupedNews.length;
      }, 20000)
    },
    stopCarousel() {
      clearInterval(this.intervalId);
    },
    async getShowHotNews() {
      let type = this.news_type
      const { data } = await getHotNews(type)
      if (data.code === 200) {
        this.list = data.data
      }
    },
    handleOpenLink(item) {
      let url = item.url
      this.$OPENLINK(url)
    }
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
    .json-title {
      h3 {
        &:hover {
          cursor: pointer;
          text-decoration: underline;
          color: #f4645f;
        }
      }
    }
  }
}

.hot-news {
  width: 100%;
  height: 180px;
  .news-carousel {
    width: 100%;
    height: 180px;
    position: relative;
    .news-group {
      position: absolute;
      top: 10px;
      left: 6px;
      width: 100%;
      height: 100%;
      display: none;
      transition: 0.5s ease-in-out;
      &.active {
        display: block;
      }
      .news-item {
        &:not(:first-child) {
          margin-top: 15px;
        }
        height: 22px;
        width: 290px;
        color: #666;
        font-size: 14px;
        font-weight: 400;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        &:link {
          color: #666;
        }
        &:visited {
          text-decoration: underline;
          color: #f4645f;
        }
        &:active {
          text-decoration: underline;
          color: #333;
        }
        &:hover {
          text-decoration: underline;
          color: #FF4500;
          cursor: pointer;
        }
      }

    }
  }
}
</style>
