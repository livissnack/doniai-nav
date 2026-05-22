<template>
  <div class="monitor-page">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="站点监控" :newUrl="`/utils/monitor`" />
    </div>

    <div class="monitor-main">
      <header class="monitor-header">
        <div class="header-text">
          <h1>站点运行监控</h1>
          <p>参考 Uptime 风格，实时查看站点可用率、响应时间与近期探测记录</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-tool" :disabled="loading" @click="refreshAll">
            <i :class="['fas', loading ? 'fa-spinner fa-spin' : 'fa-sync-alt']"></i>
            立即检测
          </button>
          <label class="auto-refresh">
            <input v-model="autoRefresh" type="checkbox" />
            <span>每 60 秒自动刷新</span>
          </label>
          <router-link v-if="isLoggedIn" to="/admin" class="btn-tool outline">
            <i class="fas fa-cog"></i> 管理站点
          </router-link>
          <router-link v-else to="/login" class="btn-tool outline">
            <i class="fas fa-sign-in-alt"></i> 登录后配置
          </router-link>
        </div>
      </header>

      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-icon total"><i class="fas fa-globe"></i></span>
          <div class="stat-body">
            <span class="stat-label">监控站点</span>
            <span class="stat-value">{{ sites.length }}</span>
          </div>
        </div>
        <div class="stat-card up">
          <span class="stat-icon up"><i class="fas fa-check-circle"></i></span>
          <div class="stat-body">
            <span class="stat-label">正常运行</span>
            <span class="stat-value">{{ upCount }}</span>
          </div>
        </div>
        <div class="stat-card down">
          <span class="stat-icon down"><i class="fas fa-exclamation-circle"></i></span>
          <div class="stat-body">
            <span class="stat-label">异常</span>
            <span class="stat-value">{{ downCount }}</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon latency"><i class="fas fa-tachometer-alt"></i></span>
          <div class="stat-body">
            <span class="stat-label">平均响应</span>
            <span class="stat-value">{{ avgResponse }}</span>
          </div>
        </div>
      </div>

      <div v-if="loading && !sites.length" class="state-box">
        <i class="fas fa-spinner fa-spin"></i>
        <p>加载监控数据…</p>
      </div>

      <div v-else-if="!sites.length" class="state-box empty">
        <i class="fas fa-satellite-dish"></i>
        <p>暂无监控站点</p>
        <span v-if="isLoggedIn">请前往 <router-link to="/admin">管理面板</router-link> 添加要监控的 URL</span>
        <span v-else>登录后可在管理面板配置监控站点</span>
      </div>

      <div v-else class="site-grid">
        <article
          v-for="site in sites"
          :key="site.id"
          class="site-card"
          :class="`is-${site.status}`"
        >
          <div class="card-accent" :class="site.status"></div>
          <div class="site-card-body">
            <header class="site-card-head">
              <div class="site-identity">
                <div class="site-avatar" :class="site.status">
                  <i class="fas fa-server"></i>
                </div>
                <div class="site-meta">
                  <h3 class="site-name">{{ site.name }}</h3>
                  <a
                    class="site-url"
                    :href="site.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    @click.stop
                  >
                    <i class="fas fa-external-link-alt"></i>
                    {{ site.url }}
                  </a>
                </div>
              </div>
              <span class="status-badge" :class="site.status">
                <span class="status-pulse" :class="site.status"></span>
                {{ statusText(site.status) }}
              </span>
            </header>

            <div class="site-hero">
              <div class="uptime-ring" :class="uptimeLevel(site.uptimePercent)">
                <svg viewBox="0 0 36 36" class="ring-svg">
                  <path
                    class="ring-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="ring-fill"
                    :stroke-dasharray="`${site.uptimePercent}, 100`"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span class="ring-text">{{ site.uptimePercent }}<small>%</small></span>
              </div>
              <div class="hero-metrics">
                <div class="metric-tile">
                  <i class="fas fa-bolt"></i>
                  <span class="metric-label">响应</span>
                  <span class="metric-value">{{ formatMs(site.responseMs) }}</span>
                </div>
                <div class="metric-tile">
                  <i class="fas fa-code"></i>
                  <span class="metric-label">状态码</span>
                  <span class="metric-value">{{ site.statusCode || '—' }}</span>
                </div>
                <div class="metric-tile">
                  <i class="fas fa-redo"></i>
                  <span class="metric-label">间隔</span>
                  <span class="metric-value">{{ formatInterval(site.intervalSec) }}</span>
                </div>
                <div class="metric-tile">
                  <i class="fas fa-exchange-alt"></i>
                  <span class="metric-label">方式</span>
                  <span class="metric-value">{{ site.method || 'GET' }}</span>
                </div>
              </div>
            </div>

            <div class="uptime-section">
              <div class="uptime-section-head">
                <span class="section-title">近期探测</span>
                <span class="section-meta">{{ site.history.length }} 次记录</span>
              </div>
              <div class="uptime-bar" :title="`最近 ${site.history.length} 次探测`">
                <span
                  v-for="(h, idx) in site.history"
                  :key="idx"
                  class="uptime-seg"
                  :class="{ up: h.up, down: !h.up }"
                  :title="`${h.up ? '正常' : '异常'} · ${h.ms}ms`"
                />
                <span v-if="!site.history.length" class="uptime-empty">等待首次探测…</span>
              </div>
              <div class="uptime-legend">
                <span><i class="legend-dot up"></i>正常</span>
                <span><i class="legend-dot down"></i>异常</span>
              </div>
            </div>

            <footer class="site-card-foot">
              <span class="last-check">
                <i class="far fa-clock"></i>
                {{ formatLastCheck(site.lastCheckAt) }}
              </span>
              <span v-if="site.lastError" class="last-error" :title="site.lastError">
                {{ site.lastError }}
              </span>
              <button
                type="button"
                class="btn-check"
                :disabled="checkingId === site.id"
                @click="checkOne(site)"
              >
                <i :class="['fas', checkingId === site.id ? 'fa-spinner fa-spin' : 'fa-sync-alt']"></i>
                检测
              </button>
            </footer>
          </div>
        </article>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#20bc56" :size="1.1" :slow="10"></back-top>
    </div>
    <div id="footer">
      <Footer />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import BackTop from '@mlqt/vue-back-top'
import { authStore } from '@/store/auth'
import {
  fetchMonitorSites,
  checkAllMonitorSites,
  checkMonitorSite,
} from '@/services/monitorApi'

Vue.use(BackTop)

export default {
  name: 'Monitor',
  components: { Navbar, Footer },
  data() {
    return {
      sites: [],
      loading: false,
      checkingId: '',
      autoRefresh: true,
      timer: null,
    }
  },
  computed: {
    isLoggedIn() {
      return !!authStore.user
    },
    upCount() {
      return this.sites.filter((s) => s.status === 'up').length
    },
    downCount() {
      return this.sites.filter((s) => s.status === 'down').length
    },
    avgResponse() {
      const ms = this.sites
        .map((s) => s.responseMs)
        .filter((v) => v != null)
      if (!ms.length) return '—'
      const avg = Math.round(ms.reduce((a, b) => a + b, 0) / ms.length)
      return `${avg} ms`
    },
  },
  mounted() {
    this.loadSites()
    this.timer = setInterval(() => {
      if (this.autoRefresh) this.loadSites(true)
    }, 60000)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    statusText(status) {
      const map = {
        up: '正常',
        down: '故障',
        pending: '待检测',
        paused: '已暂停',
      }
      return map[status] || status
    },
    formatMs(ms) {
      if (ms == null) return '—'
      if (ms < 1000) return `${ms} ms`
      return `${(ms / 1000).toFixed(2)} s`
    },
    formatInterval(sec) {
      if (sec < 60) return `${sec}s`
      if (sec < 3600) return `${Math.round(sec / 60)} 分钟`
      return `${Math.round(sec / 3600)} 小时`
    },
    uptimeLevel(percent) {
      if (percent >= 99) return 'excellent'
      if (percent >= 95) return 'good'
      if (percent >= 80) return 'warn'
      return 'poor'
    },
    formatLastCheck(ts) {
      if (!ts) return '尚未检测'
      const diff = Math.floor(Date.now() / 1000) - ts
      if (diff < 60) return '刚刚'
      if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
      if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
      return new Date(ts * 1000).toLocaleString()
    },
    async loadSites(silent = false) {
      if (!silent) this.loading = true
      try {
        const { data } = await fetchMonitorSites()
        if (data?.ok) {
          this.sites = data.sites || []
        }
      } catch (e) {
        if (!silent) {
          this.$buefy.toast.open({
            message: e?.msg || '加载监控数据失败',
            type: 'is-danger',
          })
        }
      } finally {
        if (!silent) this.loading = false
      }
    },
    async refreshAll() {
      this.loading = true
      try {
        const { data } = await checkAllMonitorSites()
        if (data?.ok) {
          this.sites = data.sites || []
          this.$buefy.toast.open({ message: '全量检测完成', type: 'is-success' })
        } else {
          this.$buefy.toast.open({ message: data?.message || '检测失败', type: 'is-danger' })
        }
      } catch (e) {
        this.$buefy.toast.open({ message: e?.msg || '检测失败', type: 'is-danger' })
      } finally {
        this.loading = false
      }
    },
    async checkOne(site) {
      this.checkingId = site.id
      try {
        const { data } = await checkMonitorSite(site.id)
        if (data?.ok && data.site) {
          const idx = this.sites.findIndex((s) => s.id === site.id)
          if (idx >= 0) {
            this.$set(this.sites, idx, data.site)
          }
        }
      } catch (e) {
        this.$buefy.toast.open({ message: e?.msg || '检测失败', type: 'is-danger' })
      } finally {
        this.checkingId = ''
      }
    },
  },
}
</script>

<style lang="less" scoped>
.monitor-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef2f7 0%, #f5f7fa 40%, #f0f2f5 100%);
}

.nav-box {
  background: #fff;
  border-bottom: 1px solid #e8ecea;
}

.monitor-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.monitor-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  h1 {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.btn-tool {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #22c65b, #20bc56);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.outline {
    background: #fff;
    border: 1px solid #d1d5db;
    color: #374151;

    &:hover {
      border-color: #20bc56;
      color: #20bc56;
    }
  }
}

.auto-refresh {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  }

  &.up .stat-value {
    color: #20bc56;
  }

  &.down .stat-value {
    color: #ef4444;
  }
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 18px;

  &.total {
    background: #eff6ff;
    color: #3b82f6;
  }

  &.up {
    background: #ecfdf3;
    color: #20bc56;
  }

  &.down {
    background: #fef2f2;
    color: #ef4444;
  }

  &.latency {
    background: #f5f3ff;
    color: #8b5cf6;
  }
}

.stat-body {
  min-width: 0;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.state-box {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fff;
  border-radius: 12px;

  i {
    font-size: 36px;
    margin-bottom: 12px;
  }

  a {
    color: #20bc56;
  }
}

.site-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.site-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.07);
  border: 1px solid #e8ecef;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  }

  &.is-down {
    border-color: rgba(239, 68, 68, 0.25);
  }

  &.is-up .card-accent {
    opacity: 1;
  }
}

.card-accent {
  height: 4px;
  opacity: 0.6;

  &.up {
    background: linear-gradient(90deg, #22c65b, #20bc56);
  }

  &.down {
    background: linear-gradient(90deg, #f87171, #ef4444);
  }

  &.pending,
  &.paused {
    background: linear-gradient(90deg, #9ca3af, #d1d5db);
  }
}

.site-card-body {
  padding: 18px 20px 16px;
}

.site-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.site-identity {
  display: flex;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.site-avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: #f3f4f6;
  color: #9ca3af;

  &.up {
    background: linear-gradient(135deg, #ecfdf3, #d1fae5);
    color: #20bc56;
  }

  &.down {
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    color: #ef4444;
  }

  &.pending,
  &.paused {
    background: #f9fafb;
    color: #6b7280;
  }
}

.site-meta {
  min-width: 0;
}

.site-name {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
}

.site-url {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  font-size: 12px;
  color: #6b7280;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  i {
    flex-shrink: 0;
    font-size: 10px;
    opacity: 0.6;
  }

  &:hover {
    color: #20bc56;
  }
}

.status-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;

  &.up {
    background: #ecfdf3;
    color: #15803d;
  }

  &.down {
    background: #fef2f2;
    color: #b91c1c;
  }

  &.pending,
  &.paused {
    background: #f3f4f6;
    color: #6b7280;
  }
}

.status-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;

  &.up {
    background: #20bc56;
    box-shadow: 0 0 0 0 rgba(32, 188, 86, 0.5);
    animation: pulse-up 2s infinite;
  }

  &.down {
    background: #ef4444;
  }
}

@keyframes pulse-up {
  0% {
    box-shadow: 0 0 0 0 rgba(32, 188, 86, 0.45);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(32, 188, 86, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(32, 188, 86, 0);
  }
}

.site-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #fafbfc 0%, #f4f6f8 100%);
  border-radius: 12px;
  border: 1px solid #f0f1f3;
}

.uptime-ring {
  position: relative;
  flex-shrink: 0;
  width: 72px;
  height: 72px;

  .ring-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .ring-bg {
    fill: none;
    stroke: #e5e7eb;
    stroke-width: 3;
  }

  .ring-fill {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dasharray 0.4s ease;
  }

  &.excellent .ring-fill {
    stroke: #20bc56;
  }

  &.good .ring-fill {
    stroke: #34d399;
  }

  &.warn .ring-fill {
    stroke: #f59e0b;
  }

  &.poor .ring-fill {
    stroke: #ef4444;
  }
}

.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: #1f2937;

  small {
    font-size: 10px;
    font-weight: 600;
    margin-left: 1px;
  }
}

.hero-metrics {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  min-width: 0;
}

.metric-tile {
  padding: 8px 10px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eef0f2;

  i {
    font-size: 11px;
    color: #9ca3af;
    margin-bottom: 2px;
  }

  .metric-label {
    display: block;
    font-size: 10px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .metric-value {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #374151;
  }
}

.uptime-section {
  margin-bottom: 14px;
}

.uptime-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.section-meta {
  font-size: 11px;
  color: #9ca3af;
}

.uptime-bar {
  display: flex;
  align-items: stretch;
  gap: 3px;
  height: 32px;
  padding: 5px 6px;
  background: #1f2937;
  border-radius: 8px;
}

.uptime-seg {
  flex: 1;
  min-width: 3px;
  border-radius: 3px;
  transition: transform 0.15s ease;

  &:hover {
    transform: scaleY(1.15);
  }

  &.up {
    background: linear-gradient(180deg, #4ade80, #20bc56);
  }

  &.down {
    background: linear-gradient(180deg, #f87171, #dc2626);
  }
}

.uptime-empty {
  flex: 1;
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  line-height: 22px;
}

.uptime-legend {
  display: flex;
  gap: 14px;
  margin-top: 6px;
  font-size: 11px;
  color: #9ca3af;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;

  &.up {
    background: #20bc56;
  }

  &.down {
    background: #ef4444;
  }
}

.site-card-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  font-size: 12px;
  color: #9ca3af;
}

.last-check {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.last-error {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #ef4444;
  font-size: 11px;
}

.btn-check {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #20bc56;
    background: #f0fdf4;
    color: #20bc56;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@media screen and (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .site-grid {
    grid-template-columns: 1fr;
  }

  .site-hero {
    flex-direction: column;
    align-items: stretch;
  }

  .uptime-ring {
    margin: 0 auto;
  }
}
</style>
