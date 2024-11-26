<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="节点数据解析"/>
    </div>
    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters">
            <div class="mt-4 play-input">
              <div class="input-box">
                <b-field :message="validUrlMsg">
                <b-input @input="handleValidUrlMsg" v-model="url" placeholder="请输入待解密的url地址" maxlength="1400" icon-pack="fas"
                         icon-right="times"
                         icon-right-clickable
                         @icon-right-click="clearIconClick"></b-input>
                </b-field>
              </div>
              <div class="start-play-btn">
                <b-button type="is-success" @click="handleParse">解析</b-button>
              </div>
            </div>

            <div class="operate-btn">
              <div class="btn-box">
                <b-button icon-pack="fas" icon-left="feather"  type="is-danger" @click="handleToClash">转化Clash配置</b-button>
              </div>

              <div class="btn-box">
                <b-button icon-pack="fas" icon-left="download"  type="is-info" :disabled="disableDownload" :loading="loadingDownload" @click="handleDownloadYaml">下载Clash配置</b-button>
              </div>
            </div>

            <div class="parse-content">
              <div class="html" v-html="content"></div>
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
import {fetchSsSubscribe, generateClashConfig, isEmpty} from "@/utils/helper"
import {getNodeSubscribe} from "@/services/api";

const yaml = require('js-yaml')

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
      validUrlMsg: '',
      url: '',
      content: '暂无解析数据~',
      disableDownload: true,
      loadingDownload: false,
      nodes: [],
    }
  },
  created() {
    this.initNodes()
  },
  methods: {
    clearIconClick() {
      this.url = ''
    },
    handleValidUrlMsg(value) {
      const regex = /^(http|https):\/\/[a-zA-Z0-9.-]+(\:[0-9]+)?(\/[^ ]*)?$/
      if (!regex.test(value)) {
        this.validUrlMsg = '请输入正确的Url地址~'
      } else {
        this.validUrlMsg = ''
      }
    },
    async handleParse() {
      if (isEmpty(this.url)) {
        this.$buefy.snackbar.open({
          message: 'Url地址不能为空！',
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Msg'
        })
        return
      }
      let res = await getNodeSubscribe(this.url)
      if (res.status === 200) {
        this.nodes = fetchSsSubscribe(res.data)
        this.content = JSON.stringify(this.nodes, null, 4)
      } else {
        this.$buefy.snackbar.open({
          message: '节点数据获取失败！',
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Msg'
        })
      }
    },
    handleToClash() {
      if (Array.isArray(this.nodes) && this.nodes.length > 0) {
        const clashConfig = generateClashConfig(this.nodes)
        this.content = yaml.dump(clashConfig)
        this.disableDownload = false
      } else {
        this.$buefy.snackbar.open({
          message: '节点内容为空不能转化！',
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Msg'
        })
      }
    },
    async handleDownloadYaml() {
      this.loadingDownload = true
      let eleLink = document.createElement('a')
      let wait_str = this.content
      let filenamePrefix = this.randomFileName()
      let filename = `${filenamePrefix}.yaml`
      let blob = new Blob([wait_str], {type: 'text/plain'})
      eleLink.href = URL.createObjectURL(blob)
      eleLink.download = filename
      document.body.appendChild(eleLink)
      eleLink.click()
      this.loadingDownload = false
    },
    randomFileName() {
      return Math.random().toString(36).slice(-8)
    },
    async initNodes() {
      let url = this.$route.query.url
      let res = await getNodeSubscribe(url)
      if (res.status === 200) {
        this.nodes = fetchSsSubscribe(res.data)
        this.content = JSON.stringify(this.nodes, null, 4)
        await this.handleToClash()
        await this.handleDownloadYaml()
      } else {
        this.$buefy.snackbar.open({
          message: '节点数据获取失败！',
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Msg'
        })
      }
    },
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
  gap: 20px;
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
    word-wrap: break-word;
  }
}
</style>
