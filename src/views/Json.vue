<template>
  <div class="json-page">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="JSON工具" :newUrl="`/json`" />
    </div>

    <div class="json-main">
      <header class="json-header">
        <h1>JSON 在线解析</h1>
        <p>格式化、压缩、校验 — 参考 json.cn 常用能力</p>
      </header>

      <div class="json-toolbar">
        <div class="toolbar-group">
          <button type="button" class="tool-btn primary" @click="handleFormat">
            <i class="fas fa-align-left"></i> 格式化
          </button>
          <button type="button" class="tool-btn" @click="handleMinify">
            <i class="fas fa-compress-alt"></i> 压缩
          </button>
          <button type="button" class="tool-btn" @click="handleValidate">
            <i class="fas fa-check-circle"></i> 校验
          </button>
          <button type="button" class="tool-btn" @click="handleClear">
            <i class="fas fa-trash-alt"></i> 清空
          </button>
          <button type="button" class="tool-btn" @click="loadDemo">
            <i class="fas fa-file-code"></i> 示例
          </button>
        </div>
        <div class="toolbar-group toolbar-options">
          <label class="option-chip">
            <input v-model="keepUnicode" type="checkbox" />
            <span>保留转义</span>
          </label>
          <label class="option-label">缩进</label>
          <select v-model="indentType" class="indent-select">
            <option :value="2">2 空格</option>
            <option :value="4">4 空格</option>
            <option value="tab">Tab</option>
          </select>
        </div>
      </div>

      <div v-if="statusMessage" class="json-status" :class="statusType">
        <i :class="statusIcon"></i>
        <span>{{ statusMessage }}</span>
        <span v-if="parseMs >= 0" class="status-meta">耗时 {{ parseMs }}ms</span>
      </div>

      <div class="json-workspace">
        <div class="json-columns">
          <section class="json-panel input-panel">
            <div class="panel-head">
              <span class="panel-title">输入 JSON</span>
              <div class="panel-actions">
                <span class="panel-meta">{{ inputStats.chars }} 字符 · {{ inputStats.lines }} 行</span>
                <button type="button" class="icon-btn" title="复制输入" @click="copyText(inputJson)">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <textarea
              ref="inputArea"
              v-model="inputJson"
              class="json-textarea"
              spellcheck="false"
              placeholder='在此粘贴 JSON，例如 {"name":"Tom"}'
              @input="onInputChange"
            />
          </section>

          <section class="json-panel output-panel">
            <div class="panel-head">
              <div class="view-tabs">
                <button
                  type="button"
                  class="view-tab"
                  :class="{ 'is-active': viewMode === 'tree' }"
                  @click="viewMode = 'tree'"
                >
                  树视图
                </button>
                <button
                  type="button"
                  class="view-tab"
                  :class="{ 'is-active': viewMode === 'code' }"
                  @click="viewMode = 'code'"
                >
                  代码视图
                </button>
              </div>
              <div class="panel-actions">
                <button
                  v-if="viewMode === 'code'"
                  type="button"
                  class="icon-btn"
                  title="复制输出"
                  @click="copyText(outputCode)"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>

            <div v-show="viewMode === 'tree'" ref="treeView" class="json-tree-view"></div>
            <pre
              v-show="viewMode === 'code'"
              class="json-code-view"
            ><code>{{ outputCode }}</code></pre>

            <div v-if="!hasOutput && !errorMessage" class="json-empty-hint">
              点击「格式化」或「校验」查看结果
            </div>
          </section>
        </div>

        <SidebarColumn tag="aside" root-class="json-sidebar-wrap" />
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10" />
    </div>
    <div id="footer">
      <Footer />
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import SidebarColumn from '@/components/SidebarColumn.vue'
import BackTop from '@/components/BackTop.vue'
import Footer from '@/components/Footer.vue'
import JSONFormatter from 'json-formatter-js'
import {
  parseJson,
  validateJson,
  formatJson,
  minifyJson,
  getJsonStats,
  DEMO_JSON,
} from '@/utils/jsonTool'
export default {
  name: 'JsonTool',
  components: {
    Navbar,
    SidebarColumn,
    Footer,
  },
  data() {
    return {
      inputJson: '',
      outputCode: '',
      viewMode: 'tree',
      keepUnicode: true,
      indentType: 2,
      statusMessage: '',
      statusType: 'info',
      errorMessage: '',
      parseMs: -1,
      hasOutput: false,
      parsedData: null,
      inputStats: { chars: 0, lines: 0 },
    }
  },
  computed: {
    statusIcon() {
      if (this.statusType === 'success') return 'fas fa-check-circle'
      if (this.statusType === 'danger') return 'fas fa-exclamation-circle'
      return 'fas fa-info-circle'
    },
  },
  watch: {
    viewMode(mode) {
      if (mode === 'tree' && this.hasOutput && this.parsedData !== undefined) {
        this.$nextTick(() => this.renderTree(this.parsedData))
      }
    },
  },
  mounted() {
    this.loadFromHash()
    this.updateInputStats()
  },
  beforeUnmount() {
    this.clearTree()
  },
  methods: {
    updateInputStats() {
      this.inputStats = getJsonStats(this.inputJson)
    },
    onInputChange() {
      this.updateInputStats()
      this.errorMessage = ''
    },
    setStatus(message, type = 'info', ms = -1) {
      this.statusMessage = message
      this.statusType = type
      this.parseMs = ms
    },
    clearTree() {
      const el = this.$refs.treeView
      if (el) el.innerHTML = ''
    },
    renderTree(data) {
      this.clearTree()
      const el = this.$refs.treeView
      if (!el) return
      const formatter = new JSONFormatter(data, 2, {
        hoverPreviewEnabled: true,
        hoverPreviewArrayCount: 100,
        hoverPreviewFieldCount: 5,
        animateOpen: true,
        animateClose: true,
        theme: '',
      })
      el.appendChild(formatter.render())
      this.formatterInstance = formatter
    },
    runParse(action) {
      const start = performance.now()
      try {
        const data = parseJson(this.inputJson)
        this.parsedData = data
        this.errorMessage = ''
        const ms = Math.round(performance.now() - start)
        action(data, ms)
        return true
      } catch (e) {
        this.parsedData = undefined
        this.hasOutput = false
        this.outputCode = ''
        this.clearTree()
        this.errorMessage = e.message
        this.setStatus(`解析失败：${e.message}`, 'danger')
        return false
      }
    },
    handleFormat() {
      if (!this.runParse((data, ms) => {
        const formatted = formatJson(this.inputJson, this.indentType, this.keepUnicode)
        this.outputCode = formatted
        this.hasOutput = true
        this.setStatus('格式化成功', 'success', ms)
        this.$nextTick(() => {
          if (this.viewMode === 'tree') this.renderTree(data)
        })
      })) return
    },
    handleMinify() {
      if (!this.runParse((data, ms) => {
        const minified = minifyJson(this.inputJson, this.keepUnicode)
        this.outputCode = minified
        this.inputJson = minified
        this.updateInputStats()
        this.hasOutput = true
        this.setStatus('压缩成功（已同步到输入区）', 'success', ms)
        this.$nextTick(() => {
          if (this.viewMode === 'tree') this.renderTree(data)
        })
      })) return
    },
    handleValidate() {
      const start = performance.now()
      const result = validateJson(this.inputJson)
      const ms = Math.round(performance.now() - start)
      if (result.valid) {
        this.setStatus(result.message, 'success', ms)
        this.handleFormat()
      } else {
        this.setStatus(result.message, 'danger', ms)
        this.hasOutput = false
        this.clearTree()
        this.outputCode = ''
      }
    },
    handleClear() {
      this.inputJson = ''
      this.outputCode = ''
      this.hasOutput = false
      this.errorMessage = ''
      this.parsedData = undefined
      this.clearTree()
      this.setStatus('已清空', 'info')
      this.updateInputStats()
    },
    loadDemo() {
      this.inputJson = JSON.stringify(DEMO_JSON, null, 2)
      this.updateInputStats()
      this.handleFormat()
    },
    loadFromHash() {
      const hash = window.location.hash || ''
      if (hash.startsWith('#data=')) {
        try {
          this.inputJson = decodeURIComponent(hash.slice(6))
          this.updateInputStats()
          this.$nextTick(() => this.handleFormat())
        } catch (e) {
          this.setStatus('URL 参数 data 解码失败', 'danger')
        }
        window.location.hash = ''
      }
    },
    copyText(text) {
      if (!text) {
        this.$notify({
          message: '没有可复制的内容',
          type: 'is-warning',
          position: 'is-bottom-right',
          duration: 2000,
        })
        return
      }
      this.$copyText(text).then(
        () => {
          this.$notify({
            message: '已复制到剪贴板',
            type: 'is-success',
            position: 'is-bottom-right',
            duration: 2000,
          })
        },
        () => {
          this.$notify({
            message: '复制失败',
            type: 'is-danger',
            position: 'is-bottom-right',
            duration: 2000,
          })
        }
      )
    },
  },
}
</script>

<style lang="less" scoped>
.json-page {
  min-height: 100vh;
  background: #f0f2f5;
}

.nav-box {
  background: #fff;
  border-bottom: 1px solid #e8ecea;
  margin-bottom: 0;
}

.json-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 16px 40px;
  box-sizing: border-box;
}

.json-header {
  text-align: center;
  margin-bottom: 16px;

  h1 {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
  }
}

.json-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px 14px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
}

.toolbar-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #20bc56;
    color: #20bc56;
  }

  &.primary {
    background: linear-gradient(135deg, #22c65b, #20bc56);
    border-color: #20bc56;
    color: #fff;

    &:hover {
      background: linear-gradient(135deg, #2dd36f, #22c65b);
      color: #fff;
    }
  }
}

.toolbar-options {
  gap: 12px;
}

.option-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;

  input {
    accent-color: #20bc56;
  }
}

.option-label {
  font-size: 13px;
  color: #6b7280;
}

.indent-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
}

.json-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 0;
  font-size: 13px;

  &.success {
    background: #ecfdf3;
    color: #15803d;
  }

  &.danger {
    background: #fef2f2;
    color: #b91c1c;
  }

  &.info {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .status-meta {
    margin-left: auto;
    opacity: 0.8;
    font-size: 12px;
  }
}

.json-workspace {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.json-columns {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.json-sidebar-wrap {
  flex: 0 0 300px;
  max-width: 300px;
  min-width: 0;
}

.json-panel {
  background: #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 360px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-meta {
  font-size: 12px;
  color: #9ca3af;
}

.icon-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;

  &:hover {
    background: #ecfdf3;
    color: #20bc56;
  }
}

.view-tabs {
  display: flex;
  gap: 4px;
}

.view-tab {
  height: 28px;
  padding: 0 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;

  &.is-active {
    background: #ecfdf3;
    color: #20bc56;
    font-weight: 600;
  }
}

.json-textarea {
  flex: 1;
  width: 100%;
  min-height: 320px;
  padding: 14px;
  border: none;
  outline: none;
  resize: vertical;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #1f2937;
  background: #fff;
  box-sizing: border-box;

  &::placeholder {
    color: #9ca3af;
  }
}

.json-tree-view {
  flex: 1;
  min-height: 320px;
  max-height: 520px;
  overflow: auto;
  padding: 12px 14px;
  font-size: 13px;

  :deep(.json-formatter-row) {
    font-family: 'Consolas', 'Monaco', monospace;
  }
}

.json-code-view {
  flex: 1;
  min-height: 320px;
  max-height: 520px;
  margin: 0;
  padding: 14px;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #1f2937;
  background: #f8fafc;
  white-space: pre-wrap;
  word-break: break-all;

  code {
    font-family: inherit;
  }
}

.json-empty-hint {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #9ca3af;
  font-size: 14px;
}

@media screen and (min-width: 901px) {
  .json-columns {
    flex-direction: row;
  }

  .input-panel,
  .output-panel {
    flex: 1;
    min-width: 0;
  }
}

@media screen and (max-width: 1100px) {
  .json-workspace {
    flex-direction: column;
  }

  .json-sidebar-wrap {
    flex: none;
    width: 100%;
    max-width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .json-page {
    overflow-x: hidden;
    max-width: 100vw;
  }

  .json-main {
    padding: 12px 10px calc(20px + env(safe-area-inset-bottom, 0px));
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  .json-header {
    margin-bottom: 10px;

    h1 {
      font-size: 18px;
    }

    p {
      font-size: 12px;
      line-height: 1.5;
    }
  }

  .json-toolbar {
    position: sticky;
    top: 0;
    z-index: 25;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 0;
  }

  .toolbar-group {
    width: 100%;
    min-width: 0;
  }

  .toolbar-group:first-child {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .tool-btn {
    justify-content: center;
    height: 38px;
    padding: 0 8px;
    font-size: 12px;
    min-width: 0;
    border-radius: 0;
    touch-action: manipulation;

    i {
      font-size: 12px;
    }

    &.primary {
      grid-column: 1 / -1;
      height: 40px;
      font-size: 13px;
    }
  }

  .toolbar-options {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 8px 10px;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
  }

  .option-chip {
    grid-column: 1 / -1;
    font-size: 12px;
  }

  .option-label {
    font-size: 12px;
    white-space: nowrap;
  }

  .indent-select {
    width: 100%;
    max-width: none;
    height: 36px;
    border-radius: 0;
  }

  .json-status {
    padding: 8px 10px;
    font-size: 12px;
    border-radius: 0;

    .status-meta {
      margin-left: 0;
      width: 100%;
    }
  }

  .json-workspace {
    gap: 12px;
    max-width: 100%;
    overflow-x: hidden;
  }

  .json-columns {
    gap: 12px;
    width: 100%;
    min-width: 0;
  }

  .json-panel {
    min-height: 0;
    border-radius: 0;
    max-width: 100%;
    overflow: hidden;
  }

  .panel-head {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 10px;
  }

  .output-panel .panel-head {
    flex-direction: column;
    align-items: stretch;
  }

  .panel-actions {
    margin-left: auto;
  }

  .panel-meta {
    display: none;
  }

  .view-tabs {
    width: 100%;
    gap: 6px;
  }

  .view-tab {
    flex: 1;
    height: 34px;
    text-align: center;
    border-radius: 0;
  }

  .json-textarea {
    min-height: min(38vh, 300px);
    max-height: 42vh;
    padding: 10px 12px;
    font-size: 13px;
    resize: none;
    -webkit-overflow-scrolling: touch;
  }

  .json-tree-view,
  .json-code-view {
    min-height: min(34vh, 260px);
    max-height: 42vh;
    padding: 10px 12px;
    font-size: 12px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    word-break: break-word;
  }

  .json-tree-view {
    overflow-x: auto;

    :deep(.json-formatter-row) {
      word-break: break-all;
    }
  }

  .json-empty-hint {
    min-height: 140px;
    font-size: 13px;
    padding: 0 12px;
    text-align: center;
  }

  .json-sidebar-wrap {
    margin-top: 4px;
    width: 100%;
    max-width: 100%;
  }
}
</style>
