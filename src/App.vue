<template>
  <div id="app">
    <PageProgressBar />
    <router-view v-slot="{ Component, route }">
      <keep-alive :max="8">
        <component
          :is="Component"
          v-if="Component && route.meta.keepAlive"
          :key="route.name"
        />
      </keep-alive>
      <component
        :is="Component"
        v-if="Component && !route.meta.keepAlive"
        :key="route.path"
      />
    </router-view>

    <Teleport :to="sidebarHost" :disabled="!sidebarHost">
      <div v-show="sidebarHost" class="global-sidebar-host">
        <Sidebar />
      </div>
    </Teleport>
  </div>
</template>

<script>
import { warmApp } from '@/utils/warmApp'
import { defineAsyncComponent } from 'vue'
import PageProgressBar from '@/components/PageProgressBar.vue'
import { sidebarHost } from '@/utils/sidebarPortal'

export default {
  name: 'app',
  components: {
    Sidebar: defineAsyncComponent(() => import('@/components/Sidebar.vue')),
    PageProgressBar,
  },
  setup() {
    return { sidebarHost }
  },
  watch: {
    '$route.path'(path) {
      warmApp({ path })
    },
  },
  mounted() {
    warmApp({ path: this.$route.path })
  },
}
</script>

<style lang="less">
#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, 'Hiragino Sans GB',
  'Hiragino Sans GB W3', 'WenQuanYi Micro Hei', 'Microsoft YaHei UI',
  'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #ebebeb;
}

/* 仅作用于按钮、通知、首页导航卡片，避免污染 switch/checkbox 等表单控件 */
.button.is-primary,
.notification.is-primary,
.tab-item a.is-primary,
a.box-item.is-primary {
  background-color: #6943d0;
  border-color: transparent;
  color: white;

  &:hover {
    background-color: #714dd2;
    border-color: transparent;
    color: white;
  }
}

.button.is-success,
.notification.is-success,
.tab-item a.is-success,
a.box-item.is-success {
  background-color: #20bc56;
  border-color: transparent;
  color: #fff;

  &:hover {
    background-color: #22c65b;
    border-color: transparent;
    color: #fff;
  }
}

.button.is-danger,
.notification.is-danger,
.tab-item a.is-danger,
a.box-item.is-danger {
  background-color: #ff3860;
  border-color: transparent;
  color: #fff;

  &:hover {
    background-color: #ff3860;
    border-color: transparent;
    color: #fff;
  }
}

/* 表单校验：红框 + 可读文字，避免整块红底盖住输入内容 */
.input.is-danger,
.textarea.is-danger,
.select.is-danger select {
  background-color: #fff;
  border-color: #ef4444;
  color: #1f2937;
}

.help.is-danger {
  background: transparent;
  color: #ef4444;
}

.button.is-warning,
.notification.is-warning,
.tab-item a.is-warning,
a.box-item.is-warning {
  background-color: #ffd83d;
  border-color: transparent;
  color: #fff;

  &:hover {
    background-color: #ffdb4a;
    border-color: transparent;
    color: #fff;
  }
}

.button.is-info,
.notification.is-info,
.tab-item a.is-info,
a.box-item.is-info {
  background-color: #0e71de;
  border-color: transparent;
  color: #fff;

  &:hover {
    background-color: #0f77ea;
    border-color: transparent;
    color: #fff;
  }
}

/* 导航栏：全局统一高度，避免各页 scoped 样式或主题覆盖导致压扁 */
.nav-box {
  flex-shrink: 0;
  background: #fff;
}

.nav-box > nav.site-nav,
.nav-box .site-nav {
  display: block;
  width: 100%;
  min-height: 52px;
  box-sizing: border-box;
}

.nav-box .site-nav-inner {
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: 8px 16px;
  box-sizing: border-box;
}

.global-sidebar-host {
  width: 100%;
}

/* 内容容器统一直角：主卡片、侧栏面板、工具页白底区块 */
#app .bg-white,
#app .home .post,
#app .util-box,
#app .news-panel,
#app .music-box,
#app .sidebar-panel,
#app .weather-card,
#app .todo-panel,
#app .info-card,
#app .tools-panel,
#app .parse-content,
#app .loan-panel,
#app .json-main,
#app .json-toolbar,
#app .json-panel,
#app .json-workspace,
#app .rollcall-card,
#app .side-card,
#app .post,
#app .cover-panel,
#app .preview-panel,
#app .json-toolbar,
#app .json-status,
#app .docs-card,
#app .admin-card,
#app .admin-aside {
  border-radius: 0 !important;
}

</style>
