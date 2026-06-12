<template>
  <div class="home node-parse-page">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="节点数据解析" />
    </div>
    <div class="content-box">
      <div class="container">
        <UtilPageColumns>
          <div class="columns">
            <div class="column is-three-quarters">
              <div class="subscribe-form">
                <label class="subscribe-label">订阅地址</label>
                <div class="play-input">
                  <div class="input-box">
                    <o-field :message="validUrlMsg">
                      <o-input
                        v-model="url"
                        placeholder="请输入待解密的订阅 URL 地址"
                        maxlength="1400"
                        icon-pack="fas"
                        icon-right="times"
                        icon-right-clickable
                        @input="handleValidUrlMsg"
                        @icon-right-click="clearIconClick"
                        @keyup.enter="handleParse"
                      />
                    </o-field>
                  </div>
                  <div class="start-play-btn">
                    <o-button variant="success" :loading="parsing" :disabled="!!validUrlMsg" @click="handleParse">
                      解析
                    </o-button>
                  </div>
                </div>
              </div>

              <div class="operate-btn">
                <o-button
                  icon-pack="fas"
                  icon-left="feather"
                  variant="danger"
                  :disabled="!nodes.length"
                  @click="handleToClash"
                >
                  转化 Clash 配置
                </o-button>
                <o-button
                  icon-pack="fas"
                  icon-left="download"
                  variant="info"
                  :disabled="disableDownload"
                  :loading="loadingDownload"
                  @click="handleDownloadYaml"
                >
                  下载 Clash 配置
                </o-button>
              </div>

              <div class="parse-content">
                <div class="parse-header">
                  <AppIcon name="code"  />
                  <span>解析结果</span>
                  <span v-if="nodes.length" class="node-count">共 {{ nodes.length }} 条节点</span>
                </div>
                <pre class="parse-output">{{ content }}</pre>
              </div>
            </div>
            <SidebarColumn />
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
import {
  extractSubscribePayload,
  fetchSsSubscribe,
  generateClashConfig,
  isEmpty,
} from '@/utils/helper'
import { getNodeSubscribe } from '@/services/api'
import yaml from 'js-yaml'
import { saveAs } from 'file-saver'

const SS_NODE_RE = /^ss:\/\//i

export default {
  name: 'NodeParse',
  components: {
    Navbar,
    SidebarColumn,
    UtilPageColumns,
    Footer,
  },
  data() {
    return {
      validUrlMsg: '',
      url: '',
      content: '暂无解析数据~',
      disableDownload: true,
      loadingDownload: false,
      parsing: false,
      nodes: [],
    }
  },
  created() {
    this.initFromQuery()
  },
  methods: {
    clearIconClick() {
      this.url = ''
      this.validUrlMsg = ''
    },
    handleValidUrlMsg(value) {
      const text = (typeof value === 'string' ? value : this.url || '').trim()
      if (!text) {
        this.validUrlMsg = ''
        return
      }
      const regex = /^https?:\/\/[^\s]+$/i
      this.validUrlMsg = regex.test(text) ? '' : '请输入正确的 URL 地址'
    },
    async handleParse() {
      if (isEmpty(this.url)) {
        this.$notify({
          message: 'URL 地址不能为空！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
        return
      }
      if (this.validUrlMsg) return

      this.parsing = true
      this.disableDownload = true
      try {
        const res = await getNodeSubscribe(this.url.trim())
        const payload = extractSubscribePayload(res)
        if (!payload) {
          throw new Error('empty subscribe payload')
        }

        const nodes = fetchSsSubscribe(payload)
        if (!nodes.length) {
          throw new Error('no valid nodes')
        }

        this.nodes = nodes
        this.content = JSON.stringify(nodes, null, 2)
        this.$notify({
          message: `解析成功，共 ${nodes.length} 条节点`,
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      } catch (e) {
        console.error('handleParse failed:', e)
        this.nodes = []
        this.content = '节点数据获取失败，请检查 URL 是否有效，或稍后重试'
        this.$notify({
          message: '节点数据获取失败！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      } finally {
        this.parsing = false
      }
    },
    getSsNodes() {
      return this.nodes.filter((line) => SS_NODE_RE.test(line))
    },
    handleToClash() {
      const ssNodes = this.getSsNodes()
      if (!ssNodes.length) {
        this.$notify({
          message: '当前节点中没有可转化的 SS 链接，请先解析含 ss:// 的订阅',
          type: 'is-warning',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
        return
      }
      try {
        const clashConfig = generateClashConfig(ssNodes)
        this.content = yaml.dump(clashConfig)
        this.disableDownload = false
        this.$notify({
          message: `已转化 ${ssNodes.length} 条 SS 节点为 Clash 配置`,
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      } catch (e) {
        console.error('handleToClash failed:', e)
        this.$notify({
          message: 'Clash 配置转化失败，请检查节点格式',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      }
    },
    handleDownloadYaml() {
      if (this.disableDownload || !this.content) return
      this.loadingDownload = true
      try {
        const blob = new Blob([this.content], { type: 'text/yaml;charset=utf-8' })
        saveAs(blob, `clash-${this.randomFileName()}.yaml`)
        this.$notify({
          message: 'Clash 配置下载成功',
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      } catch (e) {
        console.error('handleDownloadYaml failed:', e)
        this.$notify({
          message: '下载失败，请稍后重试',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      } finally {
        this.loadingDownload = false
      }
    },
    randomFileName() {
      return Math.random().toString(36).slice(-8)
    },
    async initFromQuery() {
      const queryUrl = this.$route.query?.url
      if (!queryUrl || typeof queryUrl !== 'string') return
      this.url = queryUrl
      this.handleValidUrlMsg(queryUrl)
      await this.handleParse()
      if (this.getSsNodes().length) {
        this.handleToClash()
      }
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

.content-box {
  min-height: 60vh;
  padding-bottom: 24px;
}

.subscribe-form {
  margin-bottom: 16px;
}

.subscribe-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #363636;
}

.play-input {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 12px;
  width: 100%;

  .input-box {
    flex: 1;
    min-width: 0;

    :deep(.field) {
      margin-bottom: 0;
      width: 100%;
    }

    :deep(.control) {
      width: 100%;
    }

    :deep(.input) {
      width: 100%;
      height: 40px;
      min-height: 40px;
      box-sizing: border-box;
    }

    :deep(.help) {
      margin-top: 4px;
    }
  }

  .start-play-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    height: 40px;

    :deep(.button) {
      height: 40px;
      min-height: 40px;
      min-width: 88px;
      margin: 0;
      white-space: nowrap;
    }
  }
}

.sidebar-column {
  min-width: 0;
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
  border: 1px solid #e8e8e8;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
}

.parse-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #363636;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;

  i {
    color: #2095f2;
  }

  .node-count {
    margin-left: auto;
    font-size: 12px;
    font-weight: 500;
    color: #888;
  }
}

.parse-output {
  min-height: 400px;
  max-height: 720px;
  overflow: auto;
  margin: 0;
  padding: 20px;
  font-size: 13px;
  line-height: 1.65;
  color: #363636;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
  background: #fafafa;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c8c8c8;
    border-radius: 4px;
  }
}

@media screen and (max-width: 768px) {
  .nav-box {
    margin-bottom: 16px;
  }

  .content-box > .container {
    padding: 0 12px;
  }

  .play-input {
    gap: 8px;

    .start-play-btn :deep(.button) {
      min-width: 72px;
      padding-left: 12px;
      padding-right: 12px;
    }
  }

  .operate-btn {
    justify-content: stretch;

    :deep(.button) {
      flex: 1;
      min-width: 0;
    }
  }

  .parse-output {
    min-height: 280px;
    max-height: 50vh;
    padding: 14px;
    font-size: 12px;
  }
}
</style>
