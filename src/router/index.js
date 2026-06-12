import { createRouter, createWebHistory } from 'vue-router'
import {
  initAuth,
  authReady,
  isLoggedIn,
  isRegistrationEnabled,
  hasStoredToken,
} from '@/store/auth'
import {
  startPageProgress,
  finishPageProgress,
  failPageProgress,
} from '@/utils/pageProgress'
import { ensureOruga } from '@/plugins/oruga'

const ORUGA_DEFERRED_ROUTES = new Set(['home'])

let authInitPromise = null

function ensureAuthInit() {
  if (!authInitPromise) {
    authInitPromise = initAuth()
  }
  return authInitPromise
}

const keepAlive = { keepAlive: true }

const routes = [
  {
    path: '/',
    name: 'home',
    meta: keepAlive,
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    meta: { requiresAuth: true },
    component: () => import('@/views/Admin.vue'),
  },
  {
    path: '/json',
    name: 'json',
    component: () => import('@/views/Json.vue'),
  },
  {
    path: '/score',
    name: 'score',
    component: () => import('@/views/Score.vue'),
  },
  {
    path: '/rollcall',
    name: 'rollcall',
    component: () => import('@/views/Rollcall.vue'),
  },
  {
    path: '/player',
    name: 'player',
    component: () => import('@/views/Player.vue'),
  },
  {
    path: '/xiami',
    name: 'xiami',
    meta: keepAlive,
    component: () => import('@/views/Xiami.vue'),
  },
  {
    path: '/pc-book',
    name: 'pcBook',
    component: () => import('@/views/ebook/Pc.vue'),
  },
  {
    path: '/h5-book',
    name: 'h5Book',
    component: () => import('@/views/ebook/H5.vue'),
  },
  {
    path: '/foreign',
    name: 'foreign',
    component: () => import('@/views/foreign/Index.vue'),
  },
  {
    path: '/utils/software',
    name: 'softwareList',
    component: () => import('@/views/utils/SoftList.vue'),
  },
  {
    path: '/utils/software/:id',
    name: 'softwareDetail',
    component: () => import('@/views/utils/SoftDetail.vue'),
  },
  {
    path: '/utils/color',
    name: 'colorMatch',
    component: () => import('@/views/utils/Color.vue'),
  },
  {
    path: '/utils/docker',
    name: 'dockerMirrors',
    meta: keepAlive,
    component: () => import('@/views/utils/Docker.vue'),
  },
  {
    path: '/utils/design-card',
    name: 'cardDesign',
    component: () => import('@/views/utils/CardDesign.vue'),
  },
  {
    path: '/utils/design-btn',
    name: 'BtnDesign',
    component: () => import('@/views/utils/BtnDesign.vue'),
  },
  {
    path: '/utils/iptv',
    name: 'projectIptv',
    meta: keepAlive,
    component: () => import('@/views/utils/Iptv.vue'),
  },
  {
    path: '/utils/node_parse',
    name: 'projectNodeParse',
    meta: keepAlive,
    component: () => import('@/views/utils/NodeParse.vue'),
  },
  {
    path: '/utils/clash',
    name: 'projectClash',
    meta: keepAlive,
    component: () => import('@/views/utils/Clash.vue'),
  },
  {
    path: '/utils/password',
    name: 'projectPassword',
    meta: keepAlive,
    component: () => import('@/views/utils/Password.vue'),
  },
  {
    path: '/utils/base64',
    name: 'projectBase64',
    meta: keepAlive,
    component: () => import('@/views/utils/Base64.vue'),
  },
  {
    path: '/utils/loan-rate',
    name: 'projectLoanRate',
    component: () => import('@/views/utils/LoanRate.vue'),
  },
  {
    path: '/utils/cover',
    name: 'projectCover',
    component: () => import('@/views/utils/Cover.vue'),
  },
  {
    path: '/utils/qrcode',
    name: 'projectQrcode',
    component: () => import('@/views/utils/Qrcode.vue'),
  },
  {
    path: '/utils/monitor',
    name: 'projectMonitor',
    component: () => import('@/views/utils/Monitor.vue'),
  },
  {
    path: '/docs',
    name: 'docs',
    meta: { requiresAuth: true },
    component: () => import('@/views/docs/Docs.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.fullPath !== from.fullPath) {
    startPageProgress()
  }

  const needsProtectedRoute = to.matched.some((r) => r.meta.requiresAuth)
  const needsAuthPage = to.name === 'login' || to.name === 'register'
  // 本地有 token 时任意页面刷新/切换都要恢复登录态
  const shouldBootstrapAuth = hasStoredToken() || needsProtectedRoute || needsAuthPage

  if (shouldBootstrapAuth) {
    await ensureAuthInit()
    await authReady
  }

  if (to.matched.some((r) => r.meta.requiresAuth) && !isLoggedIn()) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if ((to.name === 'login' || to.name === 'register') && isLoggedIn()) {
    next({ path: '/' })
    return
  }

  if (to.name === 'register' && !isRegistrationEnabled()) {
    next({ path: '/login' })
    return
  }

  if (!ORUGA_DEFERRED_ROUTES.has(to.name)) {
    await ensureOruga()
  }

  next()
})

router.afterEach(() => {
  finishPageProgress()
})

router.onError(() => {
  failPageProgress()
})

export default router
