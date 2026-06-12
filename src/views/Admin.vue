<template>
  <div class="admin-page">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="管理面板" :newUrl="`/admin`" />
    </div>

    <div class="admin-main">
      <header class="admin-header">
        <h1>管理面板</h1>
        <p>{{ activeMenuDesc }}</p>
      </header>

      <div class="admin-layout">
        <aside class="admin-aside">
          <nav class="admin-menu">
            <button
              v-for="item in menuItems"
              :key="item.id"
              type="button"
              class="menu-item"
              :class="{ 'is-active': activeTab === item.id }"
              @click="switchTab(item.id)"
            >
              <AppIcon :name="item.icon" />
              <span class="menu-label">{{ item.label }}</span>
            </button>
          </nav>
          <div class="aside-foot">
            <router-link to="/utils/monitor" class="aside-link">
              <AppIcon name="chart-line"  /> 监控大屏
            </router-link>
            <router-link to="/" class="aside-link muted">
              <AppIcon name="home"  /> 返回首页
            </router-link>
          </div>
        </aside>

        <div class="admin-content">
          <!-- 侧栏卡片 -->
          <section v-show="activeTab === 'sidebar'" class="admin-card">
            <h2 class="card-title">侧栏卡片</h2>
            <p class="card-desc">控制首页及各工具页右侧 Sidebar 模块的显示与隐藏</p>
            <div class="panel-list">
              <div v-for="item in panelDefs" :key="item.id" class="panel-row">
                <div class="panel-info">
                  <span class="panel-title">{{ item.title }}</span>
                  <span class="panel-id">{{ item.id }}</span>
                </div>
                <o-switch
                  :value="panelState[item.id] !== false"
                  variant="success"
                  @input="(v) => setPanel(item.id, v)"
                />
              </div>
            </div>
            <div class="admin-actions">
              <button type="button" class="btn-outline" @click="resetAll">恢复默认（全部显示）</button>
            </div>
          </section>

          <PrivateNavManager v-show="activeTab === 'private'" />

          <ChangePasswordPanel v-show="activeTab === 'password'" />

          <AdminUsersPanel v-show="activeTab === 'users'" />

          <!-- 监控站点 -->
          <section v-show="activeTab === 'monitor'" class="admin-card">
            <div class="card-title-row">
              <div>
                <h2 class="card-title">监控站点</h2>
                <p class="card-desc">
                  添加 HTTP/HTTPS 地址，服务端定时探测并在
                  <router-link to="/utils/monitor">监控页</router-link> 展示
                </p>
              </div>
              <router-link to="/utils/monitor" class="btn-outline">查看监控</router-link>
            </div>

            <form class="site-form" novalidate @submit.prevent="submitSite">
              <div class="form-grid">
                <o-field
                  label="站点名称"
                  :type="fieldErrors.name ? 'is-danger' : null"
                  :message="fieldErrors.name"
                >
                  <o-input
                    v-model="siteForm.name"
                    placeholder="例如：主站 API"
                    maxlength="40"
                    @input="fieldErrors.name = ''"
                  />
                </o-field>
                <o-field
                  label="监控 URL"
                  :type="fieldErrors.url ? 'is-danger' : null"
                  :message="fieldErrors.url"
                >
                  <o-input
                    v-model="siteForm.url"
                    type="url"
                    placeholder="https://example.com"
                    @input="fieldErrors.url = ''"
                  />
                </o-field>
                <o-field label="请求方式">
                  <o-select v-model="siteForm.method" expanded>
                    <option value="GET">GET</option>
                    <option value="HEAD">HEAD</option>
                  </o-select>
                </o-field>
                <o-field label="检测间隔">
                  <o-select v-model="siteForm.intervalSec" expanded>
                    <option :value="60">1 分钟</option>
                    <option :value="300">5 分钟</option>
                    <option :value="600">10 分钟</option>
                    <option :value="1800">30 分钟</option>
                  </o-select>
                </o-field>
              </div>
              <div class="form-foot">
                <o-switch v-model="siteForm.enabled" variant="success">启用监控</o-switch>
                <div class="form-btns">
                  <button v-if="editingId" type="button" class="btn-outline" @click="cancelEdit">取消编辑</button>
                  <button type="submit" class="btn-primary" :disabled="siteSaving">
                    {{ siteSaving ? '保存中…' : editingId ? '保存修改' : '添加站点' }}
                  </button>
                </div>
              </div>
            </form>

            <div v-if="sitesLoading" class="sites-loading">
              <AppIcon name="spinner" spin  /> 加载中…
            </div>
            <div v-else-if="!manageSites.length" class="sites-empty">暂无站点，请在上方添加</div>
            <div v-else class="sites-table-wrap">
              <table class="sites-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th class="col-url">URL</th>
                    <th>状态</th>
                    <th class="col-uptime">可用率</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="site in manageSites" :key="site.id">
                    <td class="td-name-cell">
                      <span class="td-name">{{ site.name }}</span>
                      <span v-if="!site.enabled" class="tag-paused">已暂停</span>
                      <span class="td-url-mobile">{{ site.url }}</span>
                    </td>
                    <td class="td-url col-url">{{ site.url }}</td>
                    <td>
                      <span class="status-pill" :class="site.status">{{ statusLabel(site.status) }}</span>
                    </td>
                    <td class="col-uptime">{{ site.uptimePercent }}%</td>
                    <td class="td-actions">
                      <button type="button" class="link-btn" @click="editSite(site)">编辑</button>
                      <button type="button" class="link-btn danger" @click="removeSite(site)">删除</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>

    <div id="footer">
      <Footer />
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import PrivateNavManager from '@/components/admin/PrivateNavManager.vue'
import ChangePasswordPanel from '@/components/admin/ChangePasswordPanel.vue'
import AdminUsersPanel from '@/components/admin/AdminUsersPanel.vue'
import { SIDEBAR_PANELS, authStore, authActions, isAdmin } from '@/store/auth'
import {
  fetchManageSites,
  createMonitorSite,
  updateMonitorSite,
  deleteMonitorSite,
} from '@/services/monitorApi'

const MENU_ITEMS = [
  {
    id: 'sidebar',
    label: '侧栏卡片',
    icon: 'columns',
    desc: '控制首页与工具页右侧 Sidebar 各模块的显示与隐藏',
  },
  {
    id: 'private',
    label: '私人导航',
    icon: 'th-large',
    desc: '管理「私人」栏目下的分类与导航链接',
  },
  {
    id: 'password',
    label: '修改密码',
    icon: 'key',
    desc: '修改当前账号的登录密码',
  },
  {
    id: 'monitor',
    label: '监控站点',
    icon: 'heartbeat',
    desc: '配置 HTTP/HTTPS 监控目标，在站点监控页查看运行状态',
  },
]

const ADMIN_MENU_ITEM = {
  id: 'users',
  label: '用户管理',
  icon: 'users-cog',
  desc: '查看注册用户、启用/禁用账号、开关注册功能',
}

const emptyForm = () => ({
  name: '',
  url: '',
  method: 'GET',
  intervalSec: 300,
  enabled: true,
})

export default {
  name: 'Admin',
  components: {
    Navbar,
    Footer,
    PrivateNavManager,
    ChangePasswordPanel,
    AdminUsersPanel,
  },
  data() {
    const items = this.buildMenuItems()
    const tab = this.$route?.query?.tab
    const validTab = items.some((m) => m.id === tab) ? tab : 'sidebar'
    return {
      activeTab: validTab,
      panelDefs: SIDEBAR_PANELS,
      manageSites: [],
      sitesLoading: false,
      siteSaving: false,
      editingId: '',
      siteForm: emptyForm(),
      fieldErrors: { name: '', url: '' },
    }
  },
  computed: {
    menuItems() {
      return this.buildMenuItems()
    },
    panelState() {
      return authStore.sidebarPanels
    },
    activeMenuDesc() {
      const item = this.menuItems.find((m) => m.id === this.activeTab)
      return item ? item.desc : ''
    },
  },
  mounted() {
    if (this.$route?.query?.tab === 'users' && !isAdmin()) {
      this.activeTab = 'sidebar'
      this.switchTab('sidebar')
    }
    this.loadSites()
  },
  watch: {
    activeTab(tab) {
      if (tab === 'monitor') this.loadSites()
    },
  },
  methods: {
    buildMenuItems() {
      if (isAdmin()) {
        return [...MENU_ITEMS, ADMIN_MENU_ITEM]
      }
      return MENU_ITEMS
    },
    switchTab(id) {
      this.activeTab = id
      const query = { ...this.$route.query, tab: id }
      this.$router.replace({ path: '/admin', query }).catch(() => {})
    },
    statusLabel(status) {
      const map = { up: '正常', down: '故障', pending: '待检测', paused: '已暂停' }
      return map[status] || status
    },
    setPanel(id, visible) {
      authActions.setPanelVisible(id, visible)
    },
    async resetAll() {
      await authActions.resetPanels()
      this.$toast.open({ message: '已恢复默认显示', type: 'is-success' })
    },
    async loadSites() {
      this.sitesLoading = true
      try {
        const { data } = await fetchManageSites()
        if (data?.ok) {
          this.manageSites = data.sites || []
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '加载站点失败', type: 'is-danger' })
      } finally {
        this.sitesLoading = false
      }
    },
    editSite(site) {
      this.activeTab = 'monitor'
      this.switchTab('monitor')
      this.editingId = site.id
      this.siteForm = {
        name: site.name,
        url: site.url,
        method: site.method || 'GET',
        intervalSec: site.intervalSec || 300,
        enabled: site.enabled !== false,
      }
      this.fieldErrors = { name: '', url: '' }
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    },
    cancelEdit() {
      this.editingId = ''
      this.siteForm = emptyForm()
      this.fieldErrors = { name: '', url: '' }
    },
    validateSiteForm() {
      const name = this.siteForm.name.trim()
      const url = this.siteForm.url.trim()
      const errors = { name: '', url: '' }
      if (!name) errors.name = '请填写站点名称'
      if (!url) errors.url = '请填写监控 URL'
      else if (!/^https?:\/\//i.test(url)) errors.url = 'URL 需以 http:// 或 https:// 开头'
      this.fieldErrors = errors
      return !errors.name && !errors.url
    },
    async submitSite() {
      if (!this.validateSiteForm()) return

      const payload = {
        name: this.siteForm.name.trim(),
        url: this.siteForm.url.trim(),
        method: this.siteForm.method,
        intervalSec: Number(this.siteForm.intervalSec),
        enabled: this.siteForm.enabled,
      }

      this.siteSaving = true
      try {
        const req = this.editingId
          ? updateMonitorSite(this.editingId, payload)
          : createMonitorSite(payload)
        const { data } = await req
        if (data?.ok) {
          this.$toast.open({
            message: data.message || '已保存',
            type: 'is-success',
          })
          this.cancelEdit()
          await this.loadSites()
        } else {
          this.$toast.open({ message: data?.message || '保存失败', type: 'is-danger' })
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '保存失败', type: 'is-danger' })
      } finally {
        this.siteSaving = false
      }
    },
    removeSite(site) {
      this.$dialog.confirm({
        title: '删除站点',
        message: `确定删除「${site.name}」？历史探测记录将一并清除。`,
        confirmText: '删除',
        type: 'is-danger',
        onConfirm: async () => {
          try {
            const { data } = await deleteMonitorSite(site.id)
            if (data?.ok) {
              this.$toast.open({ message: '已删除', type: 'is-success' })
              if (this.editingId === site.id) this.cancelEdit()
              await this.loadSites()
            }
          } catch (e) {
            this.$toast.open({ message: e?.msg || '删除失败', type: 'is-danger' })
          }
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.admin-page {
  min-height: 100vh;
  background: #f0f2f5;
  overflow-x: hidden;
}

.nav-box {
  background: #fff;
  border-bottom: 1px solid #e8ecea;
}

.admin-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.admin-header {
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

.admin-layout {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.admin-aside {
  flex-shrink: 0;
  width: 200px;
  position: sticky;
  top: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  border: 1px solid #f0f0f0;
}

.admin-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  i {
    width: 18px;
    text-align: center;
    font-size: 15px;
    color: #9ca3af;
  }

  &:hover {
    background: #f9fafb;
    color: #1f2937;

    i {
      color: #20bc56;
    }
  }

  &.is-active {
    background: #ecfdf3;
    color: #20bc56;
    font-weight: 600;
    box-shadow: inset 0 0 0 1px rgba(32, 188, 86, 0.2);

    i {
      color: #20bc56;
    }
  }
}

.menu-label {
  flex: 1;
}

.aside-foot {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.aside-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #20bc56;
  text-decoration: none;

  &:hover {
    background: #f0fdf4;
  }

  &.muted {
    color: #6b7280;

    &:hover {
      color: #374151;
      background: #f9fafb;
    }
  }
}

.admin-content {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}

.admin-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.card-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.card-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #6b7280;

  a {
    color: #20bc56;
  }
}

.card-title-row .card-desc {
  margin-bottom: 0;
}

.panel-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.panel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px;
  border-radius: 8px;

  &:hover {
    background: #f9fafb;
  }
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.panel-id {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.site-form {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;

  :deep(.label) {
    color: #374151;
    font-weight: 600;
  }

  :deep(.help.is-danger) {
    margin-top: 4px;
    font-size: 12px;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.form-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.form-btns {
  display: flex;
  gap: 8px;
}

.sites-loading,
.sites-empty {
  text-align: center;
  padding: 24px;
  color: #9ca3af;
  font-size: 14px;
}

.sites-table-wrap {
  overflow-x: auto;
}

.sites-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }

  th {
    font-weight: 600;
    color: #6b7280;
    font-size: 12px;
  }
}

.td-url {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #6b7280;
  font-size: 13px;
}

.td-name {
  font-weight: 600;
  color: #374151;
}

.tag-paused {
  margin-left: 6px;
  font-size: 11px;
  color: #9ca3af;
}

.status-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;

  &.up {
    background: #ecfdf3;
    color: #20bc56;
  }

  &.down {
    background: #fef2f2;
    color: #ef4444;
  }

  &.pending,
  &.paused {
    background: #f3f4f6;
    color: #6b7280;
  }
}

.td-actions {
  white-space: nowrap;
}

.link-btn {
  border: none;
  background: none;
  color: #20bc56;
  font-size: 13px;
  cursor: pointer;
  margin-right: 8px;

  &.danger {
    color: #ef4444;
  }
}

.admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn-outline {
  height: 36px;
  padding: 0 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;

  &:hover {
    border-color: #20bc56;
    color: #20bc56;
  }
}

.btn-primary {
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #22c65b, #20bc56);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
  }
}

.td-url-mobile {
  display: none;
}

@media screen and (max-width: 768px) {
  .admin-main {
    padding: 12px 10px calc(32px + env(safe-area-inset-bottom, 0px));
  }

  .admin-header {
    margin-bottom: 14px;

    h1 {
      font-size: 20px;
    }

    p {
      font-size: 13px;
      line-height: 1.5;
    }
  }

  .admin-layout {
    flex-direction: column;
    gap: 12px;
  }

  .admin-aside {
    width: 100%;
    max-width: 100%;
    position: static;
    border-radius: 0;
    padding: 8px 10px;
    overflow: hidden;
    box-sizing: border-box;
  }

  .admin-menu {
    flex-direction: column;
    flex-wrap: nowrap;
    overflow: visible;
    gap: 4px;
    margin: 0;
    padding: 0;
  }

  .menu-item {
    width: 100%;
    flex: none;
    min-width: 0;
    padding: 10px 12px;
    font-size: 14px;
    border-radius: 0;
    white-space: normal;
    justify-content: flex-start;
  }

  .aside-foot {
    flex-direction: column;
    gap: 2px;
  }

  .aside-link {
    border-radius: 0;
    padding: 8px 10px;
  }

  .admin-card {
    padding: 14px 12px;
    border-radius: 0;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  .card-title-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .card-title-row .btn-outline {
    width: 100%;
    justify-content: center;
    height: 38px;
  }

  .site-form {
    padding: 12px;
    border-radius: 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .form-foot {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .form-btns {
    flex-direction: column-reverse;
    width: 100%;
    gap: 8px;
  }

  .form-btns .btn-primary,
  .form-btns .btn-outline {
    width: 100%;
    justify-content: center;
    height: 40px;
  }

  .sites-table-wrap {
    width: 100%;
    max-width: 100%;
    margin: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .sites-table {
    min-width: 100%;
    font-size: 12px;

    th,
    td {
      padding: 10px 8px;
    }
  }

  .sites-table .col-url,
  .sites-table .col-uptime {
    display: none;
  }

  .td-name-cell {
    min-width: 0;
  }

  .td-url-mobile {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #9ca3af;
    word-break: break-all;
    line-height: 1.4;
    font-weight: 400;
  }

  .td-actions {
    white-space: normal;

    .link-btn {
      display: inline-block;
      margin: 0 8px 0 0;
      font-size: 12px;
    }
  }

  .admin-actions .btn-outline {
    width: 100%;
    justify-content: center;
  }
}
</style>
