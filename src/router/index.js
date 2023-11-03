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
    path: '/book',
    name: 'book',
    component: () => import('@/views/Ebook.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
