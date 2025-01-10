import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/json',
    name: 'json',
    component: () => import('@/views/Json.vue')
  },
  {
    path: '/score',
    name: 'score',
    component: () => import('@/views/Score.vue')
  },
  {
    path: '/player',
    name: 'player',
    component: () => import('@/views/Player.vue')
  },
  {
    path: '/xiami',
    name: 'xiami',
    component: () => import('@/views/Xiami.vue')
  },
  {
    path: '/pc-book',
    name: 'pcBook',
    component: () => import('@/views/ebook/Pc.vue')
  },
  {
    path: '/h5-book',
    name: 'h5Book',
    component: () => import('@/views/ebook/H5.vue')
  },
  {
    path: '/foreign',
    name: 'foreign',
    component: () => import('@/views/foreign/Index.vue')
  },
  {
    path: '/utils/software',
    name: 'softwareList',
    component: () => import('@/views/utils/SoftList.vue')
  },
  {
    path: '/utils/software/:id',
    name: 'softwareDetail',
    component: () => import('@/views/utils/SoftDetail.vue')
  },
  {
    path: '/utils/color',
    name: 'colorMatch',
    component: () => import('@/views/utils/Color.vue')
  },
  {
    path: '/utils/design-card',
    name: 'cardDesign',
    component: () => import('@/views/utils/CardDesign.vue')
  },
  {
    path: '/utils/design-btn',
    name: 'BtnDesign',
    component: () => import('@/views/utils/BtnDesign.vue')
  },
  {
    path: '/utils/project',
    name: 'projectManage',
    component: () => import('@/views/utils/Project.vue')
  },
  {
    path: '/utils/white',
    name: 'projectWhite',
    component: () => import('@/views/utils/White.vue')
  },
  {
    path: '/utils/iptv',
    name: 'projectIptv',
    component: () => import('@/views/utils/Iptv.vue')
  },
  {
    path: '/utils/node_parse',
    name: 'projectNodeParse',
    component: () => import('@/views/utils/NodeParse.vue')
  },
  {
    path: '/utils/clash',
    name: 'projectClash',
    component: () => import('@/views/utils/Clash.vue')
  },
  {
    path: '/utils/password',
    name: 'projectPassword',
    component: () => import('@/views/utils/Password.vue')
  },
  {
    path: '/utils/base64',
    name: 'projectBase64',
    component: () => import('@/views/utils/Base64.vue')
  },
  {
    path: '/utils/loan-rate',
    name: 'projectLoanRate',
    component: () => import('@/views/utils/LoanRate.vue')
  },
  {
    path: '/utils/cover',
    name: 'projectCover',
    component: () => import('@/views/utils/Cover.vue')
  },
  {
    path: '/utils/qrcode',
    name: 'projectQrcode',
    component: () => import('@/views/utils/Qrcode.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
