<template>
  <div class="util-box">
    <div class="util-title">
      <div><h3>热门新闻</h3></div>
      <div class="json-title"><h3 @click="goJson">Json工具</h3></div>
    </div>
    <div class="hot-news">
      <div class="marquee">
        <div class="marquee_box" ref="marquee_box">
          <ul class="marquee_list" :class="{ marquee_top: animate }">
            <li v-for="(item, index) in list" :key="index">
              <a :href="item.url" :title="item.title">{{ item.title }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getHotNews } from '../services/api'
export default {
  name: 'UtilDesk',
  data() {
    return {
      news_type: 'baidu',
      animate: false,
      showNum: 4,
      list: [
        { url: '#', title: '1111111111111111111' },
        { url: '#', title: '22222222222222222222' },
        { url: '#', title: '333333333333333333333' },
        { url: '#', title: '4444444444444444444' },
        { url: '#', title: '5555555555555555555' },
        { url: '#', title: '666666666666666666' },
        { url: '#', title: '777777777777777' },
        { url: '#', title: '888888888888888888' }
      ]
    }
  },
  created() {
    // 页面显示
    setInterval(this.showMarquee, 2000)
  },
  mounted() {
    this.getShowHotNews()
    // 可见数据高度
    this.$refs.marquee_box.style.height = this.showNum * 30 + 'px'
  },
  methods: {
    goJson() {
      this.$router.push({ path: '/json' })
    },
    showMarquee() {
      this.animate = true
      this.list.push(this.list[0])
      setTimeout(() => {
        this.list.shift()
        this.animate = false
      }, 1000)
    },
    async getShowHotNews() {
      let type = this.news_type
      const { data } = await getHotNews(type)
      if (data.code == 200) {
        this.list = data.data
      }
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

.marquee {
  width: 100%;
  align-items: center;
  color: #3a3a3a;
  background-color: white;
  display: flex;
  box-sizing: border-box;
  overflow: hidden;
}
.marquee_title {
  padding: 0 20px;
  height: 21px;
  font-size: 14px;
  border-right: 1px solid #d8d8d8;
  align-items: center;
}
.marquee_box {
  display: block;
  position: relative;
  width: 100%;
  overflow: hidden;
  margin: 0 auto;
}
.marquee_list {
  display: block;
  position: absolute;
  top: 0px;
  left: 0;
}
.marquee_top {
  transition: all 1s;
  margin-top: -30px;
}
.marquee_list li {
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  color: #666;
  padding-left: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  a {
    color: #666;
    font-size: 14px;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover {
      text-decoration: underline;
    }
  }
}
.marquee_list li span {
  padding: 0 2px;
}
</style>
