<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="Clash工具助手"/>
    </div>
    <div class="content-box">
      <div class="container">
        <UtilPageColumns>
        <div class="columns">
          <div class="column is-three-quarters">
            <div class="play-input">
              <div class="input-box">
                <o-field label="节点数据" :message="validClashMsg">
                  <o-input
                    v-model="nodeList"
                    type="textarea"
                    rows="10"
                    placeholder="请输入节点数据，每行一条链接（支持 vmess / vless / hysteria / ss / trojan）"
                    maxlength="2000"
                    icon-pack="fas"
                    icon-right="times"
                    icon-right-clickable
                    @input="handleValidClashMsg"
                    @icon-right-click="clearIconClick"
                  />
                </o-field>
              </div>
            </div>

            <div class="operate-btn">
              <o-button variant="success" :disabled="!!validClashMsg" @click="handleParse">解析</o-button>
              <o-button variant="danger" :disabled="disableDownload" :loading="loadingDownload" @click="handleDownloadClash">
                下载 Clash
              </o-button>
            </div>

            <div class="parse-content">
              <div class="parse-header">
                <o-icon icon="code" size="small" pack="fas"></o-icon>
                <span>YAML 配置预览</span>
              </div>

              <Codemirror
                v-model="parseConfig"
                :style="{ height: '1260px' }"
                :extensions="cmExtensions"
              />
            </div>
          </div>
          <SidebarColumn root-class="column" />
        </div>
        </UtilPageColumns>
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
import Navbar from '@/components/Navbar.vue'
import SidebarColumn from '@/components/SidebarColumn.vue'
import UtilPageColumns from '@/components/UtilPageColumns.vue'
import Footer from '@/components/Footer.vue'
import { Codemirror } from 'vue-codemirror'
import { yaml } from '@codemirror/lang-yaml'
import { isEmpty } from '@/utils/helper'
import { getNodeParse } from '@/services/api'

export default {
  name: 'Clash',
  components: {
    Navbar,
    SidebarColumn,
    UtilPageColumns,
    Footer,
    Codemirror,
  },
  data() {
    return {
      validClashMsg: '',
      nodeList: 'vless://06a0a567-4e14-4b19-9bf8-70eccbba1ddb@80.75.218.223:47833?encryption=none&security=reality&flow=xtls-rprx-vision&type=tcp&sni=www.amazon.com&pbk=QWbn09eWFDcBnck72-kcdLMWchaZ9zLGNpUlwz1BGQE&fp=chrome#[自建] 德国 01\n' +
          'hysteria://1.2.3.4:12854?protocol=udp&auth=pekopeko&peer=wechat.com&insecure=1&upmbps=50&downmbps=250&alpn=h3#hysteria\n' +
          'ss://YWVzLTI1Ni1nY206cjROQndqczFxOWRWenJ0cWxNZUpzcDdlWnlDaTY4bEVyVms1dURzbw==@151.242.189.239:33560#[自建] 台湾 01\n' +
          'hysteria2://P%40ssw0rd1234@example.com:443/?protocol=udp&obfs=salamander&obfs-password=obfs_pwd&sni=www.example.com&insecure=0&pinSHA256=BA%3A88%3A45%3A17%3AA1%3A&up=100Mbps&down=200Mbps#MyHysteria',
      parseConfig: '暂无解析数据~',
      disableDownload: true,
      loadingDownload: false,
      cmExtensions: [yaml()],
    }
  },
  methods: {
    clearIconClick() {
      this.nodeList = ''
    },
    handleValidClashMsg(value) {
      const val = (typeof value === 'string' ? value : this.nodeList || '').trim()

      if (!val) {
        this.validClashMsg = '节点信息不能为空哦~'
        return
      }

      const supportedProtocols = ['vmess://', 'vless://', 'hysteria', 'ss://', 'trojan://']

      const lines = val.split('\n')
      const isValid = lines.some((line) =>
        supportedProtocols.some((proto) => line.trim().toLowerCase().startsWith(proto))
      )

      if (!isValid) {
        this.validClashMsg = '未能识别有效的节点链接 (支持 vmess/vless/hysteria)~'
      } else {
        this.validClashMsg = ''
      }
    },
    async handleParse() {
      if (isEmpty(this.nodeList)) {
        this.$notify({
          message: '节点数据不能为空！',
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Msg',
        })
        return
      }
      const { data } = await getNodeParse(this.nodeList)
      this.parseConfig = data
      if (!isEmpty(data)) {
        this.disableDownload = false
      }
    },
    async handleDownloadClash() {
      if (!this.parseConfig || this.parseConfig === '暂无解析数据~') {
        return
      }

      this.loadingDownload = true
      try {
        const filenamePrefix = this.randomFileName()
        const filename = `${filenamePrefix}.yaml`

        const blob = new Blob([this.parseConfig], { type: 'text/yaml;charset=utf-8' })
        const objectUrl = URL.createObjectURL(blob)

        const eleLink = document.createElement('a')
        eleLink.style.display = 'none'
        eleLink.href = objectUrl
        eleLink.download = filename

        document.body.appendChild(eleLink)
        eleLink.click()

        document.body.removeChild(eleLink)
        URL.revokeObjectURL(objectUrl)
      } catch (error) {
        this.$notify({
          message: '下载配置失败！',
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Msg',
        })
      } finally {
        this.loadingDownload = false
      }
    },
    randomFileName() {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    },
  },
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
  width: 100%;
  margin-bottom: 16px;

  .input-box {
    width: 100%;

    :deep(.field) {
      width: 100%;
      margin-bottom: 0;
    }

    :deep(.label) {
      font-weight: 600;
      color: #363636;
      margin-bottom: 6px;
    }

    :deep(.control) {
      width: 100%;
    }

    :deep(.textarea),
    :deep(textarea.input) {
      width: 100%;
      min-height: 220px;
      max-height: 420px;
      padding: 12px 14px;
      font-size: 13px;
      line-height: 1.65;
      font-family: Consolas, Monaco, 'Courier New', monospace;
      color: #363636;
      background: #fafafa;
      border: 1px solid #dbdbdb;
      border-radius: 6px;
      resize: vertical;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;

      &:hover {
        border-color: #b5b5b5;
      }

      &:focus {
        background: #fff;
        border-color: #20bc56;
        box-shadow: 0 0 0 3px rgba(32, 188, 86, 0.15);
        outline: none;
      }
    }

    :deep(.help) {
      margin-top: 6px;
    }
  }
}

.operate-btn {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.parse-content {
  margin-bottom: 40px;
  background: #ffffff;
  border: 1px solid #e1e1e1;
  overflow: hidden;

  .parse-header {
    padding: 10px 15px;
    background: #f9f9f9;
    border-bottom: 1px solid #e1e1e1;
    font-size: 0.9rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :deep(.cm-editor) {
    min-height: 1260px;
    font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 14px;
  }
}

</style>
