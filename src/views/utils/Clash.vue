<template>
  <div class="home clash-page">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="Clash 节点工具" />
    </div>
    <div class="content-box">
      <div class="container">
        <UtilPageColumns>
          <div class="columns">
            <div class="column is-three-quarters">
              <div class="mode-tabs" role="tablist" aria-label="输入方式">
                <button
                  type="button"
                  role="tab"
                  class="mode-tab"
                  :class="{ active: inputMode === 'nodes' }"
                  :aria-selected="inputMode === 'nodes'"
                  @click="inputMode = 'nodes'"
                >
                  节点链接
                </button>
                <button
                  type="button"
                  role="tab"
                  class="mode-tab"
                  :class="{ active: inputMode === 'subscribe' }"
                  :aria-selected="inputMode === 'subscribe'"
                  @click="inputMode = 'subscribe'"
                >
                  订阅地址
                </button>
              </div>

              <div v-show="inputMode === 'nodes'" class="play-input">
                <div class="input-box">
                  <o-field label="节点数据" :message="validClashMsg">
                    <o-input
                      v-model="nodeList"
                      type="textarea"
                      rows="10"
                      placeholder="粘贴节点链接（每行一条），或直接粘贴完整 Clash YAML；订阅返回 YAML 时也会自动直用"
                      maxlength="50000"
                      icon-pack="fas"
                      icon-right="times"
                      icon-right-clickable
                      @input="handleValidClashMsg"
                      @icon-right-click="clearNodes"
                    />
                  </o-field>
                </div>
              </div>

              <div v-show="inputMode === 'subscribe'" class="subscribe-form">
                <o-field label="订阅地址" :message="validUrlMsg" expanded>
                  <o-input
                    v-model="subscribeUrl"
                    expanded
                    placeholder="请输入订阅 URL（http/https），例如 https://example.com/subscribe"
                    maxlength="1400"
                    icon-pack="fas"
                    icon-right="times"
                    icon-right-clickable
                    @input="handleValidUrlMsg"
                    @icon-right-click="clearSubscribe"
                    @keyup.enter="handleParse"
                  />
                </o-field>
                <p class="subscribe-hint">
                  智能识别：若机场返回完整 Clash YAML 将直接使用（无需再转换）；若为 base64
                  节点列表则自动转为配置。
                </p>
              </div>

              <div class="operate-btn">
                <o-button
                  variant="success"
                  :loading="parsing"
                  :disabled="parseDisabled"
                  @click="handleParse"
                >
                  解析
                </o-button>
                <o-button
                  variant="danger"
                  :disabled="disableDownload"
                  :loading="loadingDownload"
                  @click="handleDownloadClash"
                >
                  下载 Clash
                </o-button>
              </div>

              <div class="parse-content">
                <div class="parse-header">
                  <o-icon icon="code" size="small" pack="fas" />
                  <span>YAML 配置预览</span>
                  <span v-if="configSource" class="source-tag">{{ configSource }}</span>
                  <span v-if="nodeCount" class="node-count">共 {{ nodeCount }} 条节点</span>
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
      <Footer />
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
import {
  countProxiesInClashYaml,
  extractSubscribePayload,
  fetchSsSubscribe,
  isClashYamlSubscribe,
  isEmpty,
} from '@/utils/helper'
import { getNodeParse, getNodeSubscribe } from '@/services/api'

const SAMPLE_NODES =
  'vless://06a0a567-4e14-4b19-9bf8-70eccbba1ddb@80.75.218.223:47833?encryption=none&security=reality&flow=xtls-rprx-vision&type=tcp&sni=www.amazon.com&pbk=QWbn09eWFDcBnck72-kcdLMWchaZ9zLGNpUlwz1BGQE&fp=chrome#[自建] 德国 01\n' +
  'hysteria://1.2.3.4:12854?protocol=udp&auth=pekopeko&peer=wechat.com&insecure=1&upmbps=50&downmbps=250&alpn=h3#hysteria\n' +
  'ss://YWVzLTI1Ni1nY206cjROQndqczFxOWRWenJ0cWxNZUpzcDdlWnlDaTY4bEVyVms1dURzbw==@151.242.189.239:33560#[自建] 台湾 01\n' +
  'hysteria2://P%40ssw0rd1234@example.com:443/?protocol=udp&obfs=salamander&obfs-password=obfs_pwd&sni=www.example.com&insecure=0&pinSHA256=BA%3A88%3A45%3A17%3AA1%3A&up=100Mbps&down=200Mbps#MyHysteria\n' +
  'anytls://P%40ssw0rd@1.2.3.4:443?sni=www.example.com&fp=chrome&insecure=1&alpn=h2,http/1.1&idle_session_check_interval=30&idle_session_timeout=30&min_idle_session=0#AnyTLS-Demo'

const SUPPORTED_PROTOCOLS = [
  'vmess://',
  'vless://',
  'hysteria',
  'ss://',
  'trojan://',
  'anytls://',
]

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
      inputMode: 'nodes',
      validClashMsg: '',
      validUrlMsg: '',
      nodeList: SAMPLE_NODES,
      subscribeUrl: '',
      parseConfig: '暂无解析数据~',
      disableDownload: true,
      loadingDownload: false,
      parsing: false,
      nodeCount: 0,
      /** 预览来源说明：直出 YAML / 节点转换 */
      configSource: '',
      cmExtensions: [yaml()],
    }
  },
  computed: {
    parseDisabled() {
      if (this.parsing) return true
      if (this.inputMode === 'subscribe') return !!this.validUrlMsg || !this.subscribeUrl.trim()
      return !!this.validClashMsg || !this.nodeList.trim()
    },
  },
  created() {
    this.initFromQuery()
  },
  methods: {
    applyYamlDirect(yamlText, sourceLabel) {
      const text = String(yamlText || '').trim()
      this.parseConfig = text
      this.nodeCount = countProxiesInClashYaml(text)
      this.disableDownload = this.nodeCount <= 0
      this.configSource = sourceLabel || '完整 Clash YAML（无需转换）'
      return this.nodeCount > 0
    },
    clearNodes() {
      this.nodeList = ''
      this.handleValidClashMsg('')
    },
    clearSubscribe() {
      this.subscribeUrl = ''
      this.validUrlMsg = ''
    },
    handleValidClashMsg(value) {
      const val = (typeof value === 'string' ? value : this.nodeList || '').trim()
      if (!val) {
        this.validClashMsg = '节点信息不能为空哦~'
        return
      }
      // 粘贴完整 YAML 也合法
      if (isClashYamlSubscribe(val)) {
        this.validClashMsg = ''
        return
      }
      const isValid = val.split('\n').some((line) =>
        SUPPORTED_PROTOCOLS.some((proto) => line.trim().toLowerCase().startsWith(proto)),
      )
      this.validClashMsg = isValid
        ? ''
        : '未能识别有效内容（节点链接或完整 Clash YAML）'
    },
    handleValidUrlMsg(value) {
      const text = (typeof value === 'string' ? value : this.subscribeUrl || '').trim()
      if (!text) {
        this.validUrlMsg = ''
        return
      }
      this.validUrlMsg = /^https?:\/\/[^\s]+$/i.test(text) ? '' : '请输入正确的 URL 地址'
    },
    async handleParse() {
      if (this.inputMode === 'subscribe') {
        await this.parseFromSubscribe()
      } else {
        await this.parseFromNodes(this.nodeList)
      }
    },
    async parseFromSubscribe() {
      const url = this.subscribeUrl.trim()
      if (isEmpty(url)) {
        this.notify('订阅地址不能为空！', 'is-danger')
        return
      }
      if (this.validUrlMsg) return

      this.parsing = true
      this.disableDownload = true
      this.nodeCount = 0
      this.configSource = ''
      try {
        const res = await getNodeSubscribe(url)
        const payload = extractSubscribePayload(res)
        if (!payload || payload === 'OK') {
          throw new Error('订阅内容为空')
        }

        // 机场已返回完整 Clash YAML → 直接用，跳过 /convert
        if (isClashYamlSubscribe(payload)) {
          if (!this.applyYamlDirect(payload, '订阅直出 YAML（无需转换）')) {
            throw new Error('订阅是 Clash 配置，但未识别到 proxies 节点')
          }
          this.notify(`已直接使用订阅 YAML，共 ${this.nodeCount} 条节点`, 'is-success')
          return
        }

        const nodes = fetchSsSubscribe(payload)
        if (!nodes.length) {
          throw new Error('未识别到可用节点（支持 base64 节点列表 / Clash YAML）')
        }

        this.nodeList = nodes.join('\n')
        this.handleValidClashMsg(this.nodeList)
        this.inputMode = 'nodes'
        await this.parseFromNodes(this.nodeList, {
          successMessage: '订阅节点已转换',
        })
      } catch (e) {
        console.error('parseFromSubscribe failed:', e)
        const serverMsg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === 'object' ? e?.response?.data?.message : null) ||
          e?.msg ||
          e?.message
        this.parseConfig =
          serverMsg || '节点数据获取失败，请检查 URL 是否有效，或稍后重试'
        this.disableDownload = true
        this.nodeCount = 0
        this.configSource = ''
        this.notify(serverMsg || '节点数据获取失败！', 'is-danger')
      } finally {
        this.parsing = false
      }
    },
    async parseFromNodes(raw, { successMessage } = {}) {
      const text = String(raw || '').trim()
      if (isEmpty(text)) {
        this.notify('节点数据不能为空！', 'is-danger')
        return
      }
      if (this.validClashMsg) return

      // 文本框里直接贴了完整 YAML → 同样不转换
      if (isClashYamlSubscribe(text)) {
        if (!this.applyYamlDirect(text, '粘贴 YAML（无需转换）')) {
          this.notify('YAML 中未识别到 proxies 节点', 'is-warning')
          return
        }
        this.notify(`已直接使用 YAML，共 ${this.nodeCount} 条节点`, 'is-success')
        return
      }

      this.parsing = true
      this.configSource = ''
      try {
        const { data } = await getNodeParse(text)
        const yamlText = typeof data === 'string' ? data : ''
        this.parseConfig = yamlText || '暂无解析数据~'
        this.nodeCount = countProxiesInClashYaml(yamlText)
        const hasProxy = this.nodeCount > 0
        this.disableDownload = !hasProxy
        this.configSource = hasProxy ? '节点链接转换' : ''
        if (!hasProxy) {
          this.notify('未能解析出有效节点，请检查链接格式', 'is-warning')
        } else if (successMessage) {
          this.notify(`${successMessage}，共 ${this.nodeCount} 条节点`, 'is-success')
        }
      } catch (e) {
        this.disableDownload = true
        this.nodeCount = 0
        this.configSource = ''
        this.notify(e?.msg || e?.message || '解析失败，请检查后端服务', 'is-danger')
      } finally {
        this.parsing = false
      }
    },
    async handleDownloadClash() {
      if (!this.parseConfig || this.parseConfig === '暂无解析数据~' || this.disableDownload) {
        return
      }
      this.loadingDownload = true
      try {
        const filename = `clash-${this.randomFileName()}.yaml`
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
        this.notify('Clash 配置下载成功', 'is-success')
      } catch (error) {
        this.notify('下载配置失败！', 'is-danger')
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
    notify(message, type) {
      this.$notify({
        message,
        type,
        position: 'is-top',
        actionText: 'Msg',
      })
    },
    async initFromQuery() {
      const queryUrl = this.$route.query?.url
      if (!queryUrl || typeof queryUrl !== 'string') return
      this.inputMode = 'subscribe'
      this.subscribeUrl = queryUrl
      this.handleValidUrlMsg(queryUrl)
      await this.parseFromSubscribe()
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

.mode-tabs {
  display: inline-flex;
  gap: 2px;
  margin-bottom: 14px;
  padding: 3px;
  background: #eef2f6;
  border: 1px solid #e1e8ef;
}

.mode-tab {
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 16px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;

  &:hover {
    color: #0f172a;
  }

  &.active {
    background: #fff;
    color: #166534;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  }
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

.subscribe-form {
  width: 100%;
  margin-bottom: 16px;

  :deep(.field) {
    width: 100%;
  }

  :deep(.label) {
    font-weight: 600;
    color: #363636;
    margin-bottom: 6px;
  }

  :deep(.control) {
    width: 100%;
    display: block;
  }

  :deep(.input) {
    width: 100%;
    height: 42px;
    min-height: 42px;
    box-sizing: border-box;
  }
}

.subscribe-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
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

  .node-count {
    margin-left: auto;
    font-size: 12px;
    color: #20bc56;
    font-weight: 600;
  }

  .source-tag {
    font-size: 11px;
    font-weight: 600;
    color: #166534;
    background: #ecfdf3;
    border: 1px solid #bbf7d0;
    padding: 2px 8px;
  }

  :deep(.cm-editor) {
    min-height: 1260px;
    font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 14px;
  }
}
</style>
