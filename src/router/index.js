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
