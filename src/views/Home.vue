<template>
  <div class="home">
    <div class="nav-box">
      <div class="container">
        <b-navbar>
          <template slot="brand">
            <b-navbar-item tag="router-link" :to="{ path: '/' }">
              <h3 class="nav-brand text-primary">Doniai导航</h3>
            </b-navbar-item>
          </template>
          <template slot="start">
            <b-navbar-item
              :active="menu.id === current_active_menu_id"
              @click="handleChangeData(menu)"
              href="#"
              v-for="menu in menus"
              :key="menu.id"
              >{{ menu.name }}</b-navbar-item
            >
          </template>

          <template slot="end">
            <b-navbar-item @click="handleLogin">
              <span class="text-primary">登录</span>
            </b-navbar-item>
            <b-navbar-item @click="handleRegister">
              <span class="text-primary">注册</span>
            </b-navbar-item>
          </template>
        </b-navbar>
      </div>
    </div>
    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters">
            <SearchInput />
          </div>
        </div>

        <div class="columns">
          <div class="column is-three-quarters">
            <div class="post" v-for="navItems in navData" :key="navItems.id">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  {{ navItems.title }}
                </a>
              </div>
              <div class="tab-item">
                <a
                  :href="navItem.href"
                  @click="handleSubmit(navItem)"
                  class="box-item"
                  :class="navItem.color"
                  v-for="navItem in navItems.items"
                  :key="navItem.index"
                  target="_blank"
                  >{{ navItem.name }}</a
                >
              </div>
            </div>
          </div>
          <div class="column">
            <div class="section-box">
              <UtilDesk />
            </div>
            <div class="section-box">
              <Music />
            </div>
            <div class="section-box">
              <Weather />
            </div>
            <div class="section-box">
              <Todo />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"> </back-top>
    </div>
    <div id="footer">
      <Footer />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Mixins from '@/utils/mixin.js'
import SearchInput from '@/components/SearchInput.vue'
import Weather from '@/components/Weather.vue'
import Todo from '@/components/Todo.vue'
import UtilDesk from '@/components/UtilDesk.vue'
import Music from '@/components/Music.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import jsonNavs from '@/services/data.json'
import jsonMenus from '@/services/menu.json'
Vue.use(BackTop)
export default {
  name: 'home',
  mixins: [Mixins],
  components: {
    SearchInput,
    Weather,
    Music,
    UtilDesk,
    Todo,
    Footer
  },
  data() {
    return {
      current_active_menu_id: 1,
      menus: jsonMenus['menus'],
      navData: []
    }
  },
  created() {
    this.getCurrentNavs()
  },
  methods: {
    getCurrentNavs() {
      const dataMap = new Map([
        [1, 'homeData'],
        [2, 'workData'],
        [3, 'iosData'],
        [4, 'toolsData'],
        [5, 'frontendData'],
        [6, 'shopData'],
        [7, 'designData'],
        [8, 'blogData']
      ])
      this.navData = jsonNavs[dataMap.get(this.current_active_menu_id)]
    },
    handleChangeData(menu) {
      this.current_active_menu_id = menu.id
      this.getCurrentNavs()
    }
  }
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

.nav-brand {
  font-size: 18px;
}

.text-primary {
  color: #15b982;
}

.post {
  background: #ffffff;
  padding: 35px;
  margin-bottom: 35px;
}

.widget {
  margin-bottom: 20px;
}

.title-underline {
  text-decoration: none;
  border-bottom: 1px solid #e67e22;
}

.tab-item {
  a {
    color: #ffffff;
    font-size: 14px;
    display: inline-block;
    width: 15%;
    height: 35px;
    line-height: 35px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin: 10px 34px 10px 0;
    text-align: center;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
    text-decoration: none;
  }
  .box-item {
    box-shadow: 1px 1px 5px #ccc5c5;
  }
}

.is-active {
  color: #7957d5 !important;
  font-weight: bold;
}

.section-box {
  margin-bottom: 20px;
}
</style>
