<template>
  <div class="home">
    <div class="nav-box">
      <Navbar @updateCurrentNavs="updateCurrentNavs" :currentActiveMenuId="current_active_menu_id" :newPage="true" pageTitle="JSON工具"/>
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
            <button class="button mt14" @click="formatJsonData">转换</button>
            <div
              id="json-loader"
              cols="150"
              class="json-box mt20"
              contenteditable="true"
            ></div>
          </div>
          <div class="column">
            <Sidebar />
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
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import JSONFormatter from 'json-formatter-js'
Vue.use(BackTop)
export default {
  name: 'json',
  components: {
    Navbar,
    Sidebar,
    Footer
  },
  data() {
    return {
      current_active_menu_id: 1,
      navData: [],
      in_json: '',
      placeholder_text: '在此输入json字符串'
    }
  },
  methods: {
    formatJsonData() {
      this.deleteChildNode()
      let format_str = this.in_json
      if (
        format_str === '' ||
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

.is-active {
  color: #7957d5 !important;
  font-weight: bold;
}

.json-box {
  border: 1px solid #e567d8;
  height: 40%;
  padding: 20px;
  background-color: #ffffff !important;
  &::-webkit-scrollbar {
    display: block;
    width: 8px;
    height: 100%;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 29px;
    height: 100px;
  }
}

#json-loader {
  width: 977px;
  height: 320px;
  min-height: 120px;
  max-height: 300px;
  outline: 0;
  border: 1px solid #a0b3d6;
  font-size: 14px;
  word-wrap: break-word;
  overflow-x: hidden;
  overflow-y: auto;
}

.mt14 {
  margin-top: 14px;
}

.mt20 {
  margin-top: 20px;
}
</style>
