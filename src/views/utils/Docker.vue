<template>

  <div class="docker-page home">

    <div class="nav-box">

      <Navbar :newPage="true" :newUrl="`/utils/docker`" pageTitle="Docker镜像加速监控"></Navbar>

    </div>



    <div class="content-box">

      <div class="container">

        <UtilPageColumns>

          <div class="columns">

            <div class="column bg-white is-three-quarters">

              <header class="docker-header">

                <div class="header-text">

                  <h2>镜像加速源状态</h2>

                  <p>通过服务端批量探测 Registry API（/v2/），页面加载与手动刷新时更新</p>

                </div>

                <button

                  type="button"

                  class="btn-refresh"

                  :disabled="checkingAll"

                  @click="probeAll"

                >

                  <AppIcon :name="checkingAll ? 'spinner fa-spin' : 'sync-alt'" />

                  {{ checkingAll ? '检测中…' : '立即检测' }}

                </button>

              </header>



              <div class="mirror-table-wrap">

                <table class="table is-fullwidth mirror-table">

                  <thead>

                    <tr>

                      <th>状态</th>

                      <th>站点名称</th>

                      <th>URL</th>

                      <th>响应</th>

                      <th>标签</th>

                      <th>最后检测</th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr v-for="(item, index) in list" :key="item.url">

                      <td>

                        <span

                          class="status-indicator"

                          :class="statusClass(item)"

                          :title="statusTitle(item)"

                        ></span>

                      </td>

                      <td class="title-txt">{{ item.title }}</td>

                      <td

                        class="url-txt"

                        @click="handleCopyText(item.url)"

                        title="点击复制"

                      >

                        {{ item.url }}

                      </td>

                      <td class="latency-txt" :class="{ 'is-down': item.status === false }">

                        {{ formatLatency(item) }}

                      </td>

                      <td class="tag-box">

                        <span

                          v-for="(tag, key) in item.coloredTags"

                          :key="key"

                          class="tag"

                          :class="tag.color"

                        >

                          {{ tag.name }}

                        </span>

                      </td>

                      <td class="time-txt">{{ item.lastTime || '—' }}</td>

                    </tr>

                  </tbody>

                </table>

              </div>



              <div class="mirror-cards">

                <article

                  v-for="(item, index) in list"

                  :key="`card-${item.url}`"

                  class="mirror-card"

                  :class="{ 'is-up': item.status === true, 'is-down': item.status === false }"

                >

                  <div class="mirror-card-head">

                    <span class="status-indicator" :class="statusClass(item)"></span>

                    <div class="mirror-card-meta">

                      <h3>{{ item.title }}</h3>

                      <button

                        type="button"

                        class="url-txt url-btn"

                        @click="handleCopyText(item.url)"

                      >

                        {{ item.url }}

                      </button>

                    </div>

                    <span

                      class="latency-badge"

                      :class="{ 'is-down': item.status === false }"

                    >

                      {{ formatLatency(item) }}

                    </span>

                  </div>

                  <div class="tag-box">

                    <span

                      v-for="(tag, key) in item.coloredTags"

                      :key="key"

                      class="tag"

                      :class="tag.color"

                    >

                      {{ tag.name }}

                    </span>

                  </div>

                  <footer class="mirror-card-foot">

                    <span class="time-txt">{{ item.lastTime || '尚未检测' }}</span>

                    <button

                      type="button"

                      class="btn-check-one"

                      :disabled="item.checking"

                      @click="probeOne(index)"

                    >

                      <AppIcon :name="item.checking ? 'spinner fa-spin' : 'sync-alt'" />

                      重测

                    </button>

                  </footer>

                </article>

              </div>



              <section class="config-section">

                <div class="title-box">

                  <div class="title">创建或编辑 Docker 配置文件：</div>

                </div>

                <div class="code-block-wrap">

                  <button

                    type="button"

                    class="code-copy-btn"

                    title="复制配置"

                    @click="handleCopyConfig"

                  >

                    <AppIcon name="copy" />

                    复制

                  </button>

                  <pre class="code-block"><code>{{ configSnippet }}</code></pre>

                </div>

              </section>

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

import { timeNow } from '@/utils/helper.js'

import { probeDockerMirrors } from '@/services/dockerApi'



const TAG_COLORS = [

  'is-black',

  'is-dark',

  'is-light',

  'is-primary',

  'is-link',

  'is-info',

  'is-success',

  'is-warning',

  'is-danger',

]



const MIRROR_SOURCES = [

  {

    title: '自建镜像仓库',

    url: 'https://docker.livissnack.com',

    tags: ['WG', 'Nginx'],

  },

  {

    title: '腾讯云镜像仓库',

    url: 'https://mirror.ccs.tencentyun.com',

    tags: ['腾讯云', '仅限腾讯云内网'],

  },

  {

    title: '毫秒镜像（免费版）',

    url: 'https://docker.1ms.run',

    tags: ['木雷坞', 'CloudFlare'],

  },

  {

    title: '1Panel',

    url: 'https://docker.1panel.live',

    tags: ['1Panel', 'CloudFlare'],

  },

  {

    title: '轩辕镜像（免费版）',

    url: 'https://docker.xuanyuan.me',

    tags: ['轩辕镜像', 'CloudFlare'],

  },

  {

    title: 'Fast360',

    url: 'https://hub.fast360.xyz',

    tags: ['Fast360', 'Nginx'],

  },

  {

    title: '奶昔论坛',

    url: 'https://docker-registry.nmqu.com',

    tags: ['奶昔论坛', 'CloudFlare'],

  },

  {

    title: 'mxjia',

    url: 'https://proxy.vvvv.ee',

    tags: ['NodeSeek大佬', 'Nginx'],

  },

]



function tagColor(name) {

  let hash = 0

  for (let i = 0; i < name.length; i++) {

    hash = (hash + name.charCodeAt(i)) % TAG_COLORS.length

  }

  return TAG_COLORS[hash]

}



function createMirrorItem(source) {

  return {

    ...source,

    status: null,

    checking: false,

    responseMs: null,

    statusCode: null,

    error: '',

    coloredTags: source.tags.map((tag) => ({

      name: tag,

      color: tagColor(tag),

    })),

    lastTime: '',

  }

}



export default {

  name: 'docker',

  components: {

    Navbar,

    SidebarColumn,

    UtilPageColumns,

    Footer,

  },

  data() {

    return {

      list: MIRROR_SOURCES.map(createMirrorItem),

      checkingAll: false,

    }

  },

  computed: {

    configSnippet() {

      const mirrors = this.list

        .filter((item) => item.status === true)

        .map((item) => `    "${item.url}"`)

      const lines = mirrors.length ? mirrors : MIRROR_SOURCES.map((item) => `    "${item.url}"`)

      return `sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.json <<-'EOF'

{

  "registry-mirrors": [

${lines.join(',\n')}

  ]

}

EOF

sudo systemctl daemon-reload

sudo systemctl restart docker`

    },

  },

  mounted() {

    this.probeAll()

  },

  methods: {

    statusClass(item) {

      if (item.checking) return 'status-checking'

      if (item.status === true) return 'status-online'

      if (item.status === false) return 'status-offline'

      return 'status-pending'

    },

    statusTitle(item) {

      if (item.checking) return '检测中'

      if (item.status === true) {

        return `可用${item.statusCode ? ` · HTTP ${item.statusCode}` : ''}${item.responseMs != null ? ` · ${item.responseMs}ms` : ''}`

      }

      if (item.status === false) return item.error || '挂了'

      return '待检测'

    },

    formatLatency(item) {

      if (item.checking) return '…'

      if (item.status === false) return '挂了'

      if (item.responseMs == null) return '—'

      if (item.responseMs < 1000) return `${item.responseMs} ms`

      return `${(item.responseMs / 1000).toFixed(2)} s`

    },

    applyProbeResult(item, result) {

      item.status = result.ok

      item.responseMs = result.ms

      item.statusCode = result.statusCode

      item.error = result.ok ? '' : result.error || '挂了'

      item.lastTime = timeNow()

    },

    async fetchProbeResults(urls) {

      const { data } = await probeDockerMirrors(urls)

      if (!data?.ok || !Array.isArray(data.results)) {

        throw new Error(data?.message || '探测失败')

      }

      return data.results

    },

    async probeOne(index) {

      const item = this.list[index]

      if (!item || item.checking) return



      item.checking = true

      try {

        const results = await this.fetchProbeResults([item.url])

        const matched = results.find((r) => r.url === item.url.replace(/\/$/, '')) || results[0]

        if (matched) {

          this.applyProbeResult(item, {

            ok: matched.ok,

            ms: matched.ms,

            statusCode: matched.statusCode,

            error: matched.error,

          })

        }

      } catch (e) {

        item.status = false

        item.error = e?.msg || e?.message || '探测失败'

        item.lastTime = timeNow()

        this.$notify({

          duration: 3000,

          message: item.error,

          type: 'is-danger',

          position: 'is-bottom-right',

          actionText: 'Msg',

        })

      } finally {

        item.checking = false

      }

    },

    async probeAll() {

      if (this.checkingAll) return

      this.checkingAll = true

      this.list.forEach((item) => {

        item.checking = true

      })



      try {

        const urls = this.list.map((item) => item.url)

        const results = await this.fetchProbeResults(urls)

        const resultMap = new Map(results.map((r) => [r.url, r]))



        this.list.forEach((item) => {

          const key = item.url.replace(/\/$/, '')

          const matched = resultMap.get(key)

          if (matched) {

            this.applyProbeResult(item, {

              ok: matched.ok,

              ms: matched.ms,

              statusCode: matched.statusCode,

              error: matched.error,

            })

          } else {

            item.status = false

            item.error = '无探测结果'

            item.lastTime = timeNow()

          }

          item.checking = false

        })

      } catch (e) {

        this.list.forEach((item) => {

          item.checking = false

        })

        this.$notify({

          duration: 3000,

          message: e?.msg || e?.message || '批量探测失败',

          type: 'is-danger',

          position: 'is-bottom-right',

          actionText: 'Msg',

        })

      } finally {

        this.checkingAll = false

      }

    },

    handleCopyConfig() {
      this.$copyText(this.configSnippet).then(
        () => {
          this.$notify({
            duration: 3000,
            message: 'Docker 配置已复制',
            type: 'is-success',
            position: 'is-bottom-right',
            actionText: 'Msg',
          })
        },
        (e) => {
          this.$notify({
            duration: 3000,
            message: `复制失败：${e.message}`,
            type: 'is-danger',
            position: 'is-bottom-right',
            actionText: 'Msg',
          })
        }
      )
    },

    handleCopyText(str) {

      this.$copyText(str).then(

        () => {

          const tmpStr = str.length > 40 ? `${str.substring(0, 40)}…` : str

          this.$notify({

            duration: 3000,

            message: `复制成功：${tmpStr}`,

            type: 'is-success',

            position: 'is-bottom-right',

            actionText: 'Msg',

          })

        },

        (e) => {

          this.$notify({

            duration: 3000,

            message: `复制失败：${e.message}`,

            type: 'is-danger',

            position: 'is-bottom-right',

            actionText: 'Msg',

          })

        }

      )

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



.bg-white {

  background-color: #ffffff;

  margin-bottom: 200px;

  padding: 20px 24px 32px;

}



.docker-header {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 16px;

  padding-top: 16px;

  margin-bottom: 20px;



  .header-text {

    min-width: 0;



    h2 {

      margin: 0 0 6px;

      font-size: 20px;

      font-weight: 700;

      color: #1f2937;

    }



    p {

      margin: 0;

      font-size: 13px;

      color: #6b7280;

      line-height: 1.5;

    }

  }

}



.btn-refresh {

  flex-shrink: 0;

  display: inline-flex;

  align-items: center;

  gap: 6px;

  min-height: 40px;

  padding: 8px 16px;

  border: 1px solid #20bc56;

  border-radius: 8px;

  background: #ecfdf3;

  color: #15803d;

  font-size: 14px;

  font-weight: 600;

  cursor: pointer;

  transition: background 0.2s, border-color 0.2s;



  &:hover:not(:disabled) {

    background: #d1fae5;

  }



  &:disabled {

    opacity: 0.65;

    cursor: not-allowed;

  }

}



.mirror-table-wrap {

  overflow-x: auto;

  -webkit-overflow-scrolling: touch;

  margin-bottom: 28px;

}



.mirror-table {

  min-width: 720px;



  th,

  td {

    vertical-align: middle;

  }



  .title-txt {

    white-space: nowrap;

    font-weight: 600;

  }

}



.mirror-cards {

  display: none;

  flex-direction: column;

  gap: 12px;

  margin-bottom: 28px;

}



.mirror-card {

  border: 1px solid #e5e7eb;

  border-radius: 10px;

  padding: 14px;

  background: #fafafa;



  &.is-up {

    border-color: #bbf7d0;

    background: #f9fefb;

  }



  &.is-down {

    border-color: #fecaca;

    background: #fffafa;

  }

}



.mirror-card-head {

  display: flex;

  align-items: flex-start;

  gap: 10px;

  margin-bottom: 10px;

}



.mirror-card-meta {

  flex: 1;

  min-width: 0;



  h3 {

    margin: 0 0 4px;

    font-size: 15px;

    font-weight: 700;

    color: #1f2937;

  }

}



.latency-badge {

  flex-shrink: 0;

  font-size: 12px;

  font-weight: 600;

  color: #4b5563;

  background: #fff;

  border: 1px solid #e5e7eb;

  border-radius: 6px;

  padding: 4px 8px;



  &.is-down {

    color: #dc2626;

    border-color: #fecaca;

    background: #fef2f2;

  }

}



.mirror-card-foot {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 8px;

  margin-top: 10px;

  padding-top: 10px;

  border-top: 1px solid #e5e7eb;

}



.btn-check-one {

  display: inline-flex;

  align-items: center;

  gap: 4px;

  min-height: 36px;

  padding: 6px 12px;

  border: 1px solid #d1d5db;

  border-radius: 6px;

  background: #fff;

  color: #374151;

  font-size: 13px;

  cursor: pointer;



  &:disabled {

    opacity: 0.6;

    cursor: not-allowed;

  }

}



.tag-box {

  display: flex;

  justify-content: flex-start;

  flex-wrap: wrap;

  gap: 4px;

}



.url-txt {

  cursor: pointer;

  word-break: break-all;



  &:hover {

    text-decoration: underline;

    color: #409eff;

  }

}



.url-btn {

  display: block;

  width: 100%;

  padding: 0;

  border: 0;

  background: transparent;

  text-align: left;

  font-size: 13px;

  color: #2563eb;

}



.latency-txt.is-down {

  color: #dc2626;

  font-weight: 600;

}



.status-indicator {

  display: inline-block;

  width: 10px;

  height: 10px;

  border-radius: 50%;

  flex-shrink: 0;



  &.status-online {

    background-color: #4caf50;

    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);

    animation: pulse-online 2s infinite;

  }



  &.status-offline {

    background-color: #f44336;

    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);

    animation: pulse-offline 2s infinite;

  }



  &.status-checking {

    background-color: #f59e0b;

    animation: pulse-checking 1s ease-in-out infinite;

  }



  &.status-pending {

    background-color: #9ca3af;

  }

}



@keyframes pulse-online {

  0% {

    transform: scale(0.95);

    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);

  }



  70% {

    transform: scale(1);

    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);

  }



  100% {

    transform: scale(0.95);

    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);

  }

}



@keyframes pulse-offline {

  0% {

    transform: scale(0.95);

    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);

  }



  70% {

    transform: scale(1);

    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);

  }



  100% {

    transform: scale(0.95);

    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);

  }

}



@keyframes pulse-checking {

  0%,

  100% {

    opacity: 0.45;

  }



  50% {

    opacity: 1;

  }

}



.title-box {

  margin-bottom: 12px;



  .title {

    font-size: 16px;

    color: #000000;

  }

}



.config-section {

  margin-top: 8px;

}



.code-block-wrap {

  position: relative;

  border-radius: 8px;

  overflow: hidden;

  background-color: rgba(30, 34, 42, 1);

}



.code-copy-btn {

  position: absolute;

  top: 10px;

  right: 10px;

  z-index: 1;

  display: inline-flex;

  align-items: center;

  gap: 4px;

  min-height: 32px;

  padding: 6px 10px;

  border: 1px solid rgba(255, 255, 255, 0.22);

  border-radius: 6px;

  background: rgba(255, 255, 255, 0.1);

  color: #f3f4f6;

  font-size: 12px;

  cursor: pointer;

  transition: background 0.2s, border-color 0.2s;



  &:hover {

    background: rgba(255, 255, 255, 0.18);

    border-color: rgba(255, 255, 255, 0.35);

  }

}



.code-block {

  margin: 0;

  padding: 44px 16px 16px;

  overflow-x: auto;

  -webkit-overflow-scrolling: touch;

  background-color: transparent;



  code {

    display: block;

    color: #ffffff;

    font-size: 13px;

    line-height: 1.55;

    white-space: pre;

  }

}



.time-txt,

.latency-txt {

  font-size: 14px;

  white-space: nowrap;

}



@media screen and (max-width: 768px) {

  .nav-box {

    margin-bottom: 0;

  }



  .content-box .container {

    padding: 0;

  }



  .bg-white {

    margin-bottom: 120px;

    padding: 16px 12px calc(20px + env(safe-area-inset-bottom, 0px));

  }



  .docker-header {

    flex-direction: column;

    align-items: stretch;

    gap: 12px;

    margin-bottom: 16px;



    .header-text h2 {

      font-size: 18px;

    }

  }



  .btn-refresh {

    width: 100%;

    justify-content: center;

    min-height: 44px;

  }



  .mirror-table-wrap {

    display: none;

  }



  .mirror-cards {

    display: flex;

  }



  .code-block code {

    font-size: 11px;

  }

}

</style>


