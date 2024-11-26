<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="Clash工具助手"/>
    </div>
    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters">
            <div class="mt-4 play-input">
              <div class="input-box">
                <b-field :message="validIpMsg">
                <b-input @input="handleValidIpMsg" v-model="ip" placeholder="请输入酒店IP地址" maxlength="400" icon-pack="fas"
                         icon-right="times"
                         icon-right-clickable
                         @icon-right-click="clearIconClick"></b-input>
                </b-field>
              </div>
              <div class="start-play-btn">
                <b-button type="is-success" :disabled="validIpMsg !== ''" @click="handleParse">解析</b-button>
              </div>
            </div>

            <div class="operate-btn">
              <div class="btn-box">
                <b-button type="is-danger" :disabled="disableDownload" :loading="loadingDownload" @click="handleDownloadM3u">下载m3u</b-button>
              </div>
            </div>

            <div class="parse-content">
              <div class="html" v-html="m3u"></div>
            </div>
          </div>
          <div class="column">
            <div class="section-box">
              <MediaResource />
            </div>
            <Sidebar/>
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
import Sidebar from '@/components/Sidebar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import MediaResource from "@/components/MediaResource.vue"
import {isEmpty} from "@/utils/helper"

Vue.use(BackTop)
export default {
  name: 'json',
  components: {
    MediaResource,
    Navbar,
    Sidebar,
    Footer
  },
  data() {
    return {
      validIpMsg: '',
      ip: '61.136.172.236:9901',
      m3u: '暂无解析数据~',
      disableDownload: true,
      loadingDownload: false,
    }
  },
  created() {

  },
  methods: {
    clearIconClick() {
      this.ip = ''
    },
    handleValidIpMsg(value) {
      let reg = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d):([1-9]|[1-9]\d{1,3}|[1-6][0-5][0-5][0-3][0-5])$/
      if (!reg.test(value)) {
        this.validIpMsg = '请输入正确的IP地址~'
      } else {
        this.validIpMsg = ''
      }
    },
    async handleParse() {
      if (isEmpty(this.ip)) {
        this.$buefy.snackbar.open({
          message: '酒店IP地址不能为空！',
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Msg'
        })
        return
      }
      const baseUrl = process.env.VUE_APP_SERVER_URL
      let url = `${baseUrl}/api/hotel?ip=${this.ip}`
      let response = await fetch(url)
      let m3u = await response.text()
      this.m3u = m3u
      if (!isEmpty(m3u)) {
        this.disableDownload = false
      }
    },
    async handleDownloadM3u() {
      this.loadingDownload = true
      let eleLink = document.createElement('a')
      let wait_str = this.m3u
      let filenamePrefix = this.randomFileName()
      let filename = `${filenamePrefix}.m3u`
      let blob = new Blob([wait_str], {type: 'text/plain'})
      eleLink.href = URL.createObjectURL(blob)
      eleLink.download = filename
      document.body.appendChild(eleLink)
      eleLink.click()
      this.loadingDownload = false
    },
    randomFileName() {
      return Math.random().toString(36).slice(-8)
    }
  }
}
</script>

<style lang="less" scoped>
.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
  margin-bottom: 35px;
  border-bottom: 2px solid #e1e1e1;
}

.play-input {
  display: flex;
  justify-content: flex-start;

  .input-box {
    flex: 1;
  }
}

.section-box {
  margin-bottom: 20px;
}

.operate-btn {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  .btn-box {
    display: flex;
    justify-content: flex-start;
    gap: 20px;
  }
}

.parse-content {
  margin-bottom: 40px;
  background: #FFFFFF;
  border-radius: 8px;
  .html {
    min-height: 800px;
    color: #000000;
    font-size: 14px;
    font-weight: 500;
    white-space: pre-line;
    padding: 20px;
  }
}
</style>
