<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="外贸工具"/>
    </div>

    <div class="content-box">
      <div class="container">
        <div class="left-box">
          <aside class="menu">
            <ul class="menu-list">
              <li v-for="(util, index) in utils" :key="index" @click="currentUtil = util">
                <a :class="currentUtil.name === util.name ? 'is-active' : ''">{{ util.name }}</a>
              </li>
            </ul>
          </aside>
        </div>
        <div class="right-box">
          <div class="util-box0" v-if="currentUtil.index === 1">
            <div class="play-input">
              <div class="input-box">
                <div class="field">
                  <p class="control has-icons-right">
                    <input class="input" type="number" v-model.number="money" placeholder="请输入金额数字">
                    <span class="icon is-small is-right" @click="clearMoneyClick">
                    <i class="fas fa-times"></i>
                  </span>
                  </p>
                </div>
              </div>
              <div class="start-play-btn">
                <b-button type="is-success" @click="startConverter">转换</b-button>
              </div>
            </div>

            <div class="mt-4 play-input">
              <div class="input-box">
                <input class="input" v-model="showMoney" type="text" placeholder="转换后金额数字">
              </div>
              <div class="start-play-btn">
                <b-button type="is-danger" v-clipboard:copy="showMoney" v-clipboard:success="onCopySuccess"
                          v-clipboard:error="onCopyError">复制</b-button>
              </div>
            </div>
          </div>

          <div class="util-box2" v-if="currentUtil.index === 2">
            <div class="clock-list">
              <div class="clock-item" v-for="(clock, index) in clockList" :key="index">
                <div class="clock-item-title">
                  <div class="clock-title">{{ clock.title }}</div>
                  <div class="clock-item-time">
                    <Clock :canvasId="index"/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="util-box1" v-if="currentUtil.index === 4">
            <iframe class="shui-fei" :src="currentUtil.url" :allowfullscreen="true" security="restricted" referrerpolicy="no-referrer" sandbox="allow-same-origin allow-forms allow-scripts"></iframe>
          </div>
        </div>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"></back-top>
    </div>
    <div id="footer">
      <Footer/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Navbar from '@/components/Navbar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import Clock from "@/components/Clock.vue"
import number2chinesenumber from 'number2chinesenumber'

Vue.use(BackTop)
export default {
  name: 'foreign',
  components: {
    Navbar,
    Clock,
    Footer
  },
  data() {
    return {
      currentUtil: {
        index: 1,
        name: '数字转中文数字',
        url: ''
      },
      utils: [
        {
          index: 1,
          name: '数字转中文数字',
          url: ''
        },
        {
          index: 2,
          name: '世界时钟',
          url: ''
        },
        {
          index: 3,
          name: '邮箱有效性检测',
          url: ''
        },
        {
          index: 4,
          name: '税费查询',
          url: 'https://wmsw.mofcom.gov.cn/wmsw/sfcxSearch',
        },
      ],
      clockList: [
        {
          title: '北京时间',
          url: ''
        }
      ],
      money: '',
      showMoney: '',
    }
  },
  methods: {
    clearMoneyClick() {
      console.log('ppp--')
      this.money = ''
    },
    startConverter() {
      let money = parseFloat(this.money)
      this.showMoney = number2chinesenumber(money, 'maxAmount')
    },
    onCopySuccess() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `${this.showMoney}`,
        type: 'is-success',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
    },
    onCopyError(err) {
      if (err.text === undefined) {
        err.text = '复制失败'
      }
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `${err.text}`,
        type: 'is-danger',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
    },
  }
}
</script>

<style lang="less" scoped>
.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
}

.content-box {
  background: #EEEEF4;
  display: flex;
  justify-content: center;
  height: 1000px;
  .container {
    display: flex;
    justify-content: flex-start;
    background: #FFFFFF;
    border-radius: 6px;
    margin: 40px 0;
    .left-box {
      border-right: 1px solid #ebebeb;
      width: 300px;
      padding: 20px 20px;
    }
    .right-box {
      flex: 1;
      padding: 20px;
      .mt-4 {
        margin-top: 40px;
      }
      .play-input {
        display: flex;
        justify-content: flex-start;
        .input-box {
          flex: 1;
        }
      }

      .shui-fei {
        width: 100%;
        height: 70vh;
      }

      .util-box0 {
        height: 800px;
      }

      .util-box2 {
        .clock-list {
          display: flex;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 40px;
          .clock-item {
            .clock-item-title {
              .clock-title {
                text-align: center;
                font-size: 20px;
                color: #333333;
                margin-bottom: 16px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
