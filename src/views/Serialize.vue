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
            <textarea
              class="json-box"
              cols="150"
              :placeholder="placeholder_text"
              v-model="in_json"
            ></textarea>
            <button class="button" @click="formatJsonData">转换</button>
            <div
              id="json-loader"
              cols="150"
              class="json-box mt20 auto-json-box"
              contenteditable="true"
            ></div>
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
import Weather from '@/components/Weather.vue'
import Todo from '@/components/Todo.vue'
import Music from '@/components/Music.vue'
import UtilDesk from '@/components/UtilDesk.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import jsonNavs from '@/services/data.json'
// import { isJSON } from '@/utils/helper.js'
import jsonMenus from '@/services/menu.json'
import JSONFormatter from 'json-formatter-js'
Vue.use(BackTop)
export default {
  name: 'home',
  mixins: [Mixins],
  components: {
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
      navData: [],
      in_json: '',
      placeholder_text: '在此输入json字符串'
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
    },
    formatJsonData() {
      this.deleteChildNode()
      let format_str = this.in_json
      if (
        format_str === '' ||
        format_str === {} ||
        format_str === null ||
        format_str === undefined
      ) {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: '输入的内容不能为空！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      }

      const myJSON = JSON.parse(this.in_json)
      const formatter = new JSONFormatter(myJSON, {
        hoverPreviewEnabled: true,
        hoverPreviewArrayCount: 100,
        hoverPreviewFieldCount: 5,
        animateOpen: true,
        animateClose: true,
        useToJSON: true
      })
      document.getElementById('json-loader').appendChild(formatter.render())
    },
    deleteChildNode() {
      let parent = document.getElementById('json-loader')
      let child = document.getElementById('json-loader').nextSibling
      if (child !== null) {
        parent.removeChild(child)
      }
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

.json-box {
  border: 1px solid #e567d8;
  height: 40%;
  padding: 20px;
  background-color: #ffffff;
}

.auto-json-box {
  min-height: 120px;
  max-height: 300px;
  margin-left: auto;
  margin-right: auto;
  padding: 3px;
  outline: 0;
  border: 1px solid #a0b3d6;
  font-size: 14px;
  word-wrap: break-word;
  overflow-x: hidden;
  overflow-y: auto;
}

.mt20 {
  margin-top: 20px;
}
</style>
