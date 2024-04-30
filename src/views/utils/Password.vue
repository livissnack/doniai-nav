<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/password`" pageTitle="密码生成器"></Navbar>
    </div>

    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column bg-white is-three-quarters">
            <div class="block">
              <b-field>
                <b-checkbox type="is-success" v-model="checkList" native-value="number">
                  普通数字：【0123456789】
                </b-checkbox>
              </b-field>
              <b-field>
                <b-checkbox type="is-success" v-model="checkList" native-value="lower">
                  小写字母：【abcdefghijklmnopqrstuvwxyz】
                </b-checkbox>
              </b-field>
              <b-field>
                <b-checkbox type="is-success" v-model="checkList" native-value="upper">
                  大写字母：【ABCDEFGHIJKLMNOPQRSTUVWXYZ】
                </b-checkbox>
              </b-field>
              <b-field>
                <b-checkbox type="is-success" v-model="checkList" native-value="special">
                  特殊符号：【~!@#$%^&*()[{]}-_=+|;:'",./?`】
                </b-checkbox>
              </b-field>

              <div class="pass-length">
                <b-field label="密码长度：">
                  <b-numberinput icon-pack="fas" v-model="num" type="is-success"></b-numberinput>
                </b-field>
              </div>
            </div>

            <div class="pass-result">
              <b-field label="密码结果：">
                <b-input maxlength="200" type="textarea" v-model="password"></b-input>
              </b-field>
            </div>

            <div class="pass-operate">
              <div class="btns">
                <b-button type="is-success" icon-pack="fas" icon-left="lock" @click="handleGeneratePassword">生成随机密码</b-button>
                <b-button type="is-success" icon-pack="fas" icon-left="copy" v-clipboard:copy="password" v-clipboard:success="onCopySuccess"
                          v-clipboard:error="onCopyError">复制</b-button>
              </div>
            </div>

          </div>
          <div class="column">
            <Sidebar/>
          </div>
        </div>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"></back-top>
    </div>
    <div id="footer">
      <Footer/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import {randomPass} from "@/utils/helper"

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
      checkList: ['number', 'lower', 'upper'],
      num: 16,
      password: '',
    }
  },
  methods: {
     handleGeneratePassword() {
      this.password = randomPass(this.num, this.checkList)
    },
    onCopySuccess() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `复制成功：${this.password}`,
        type: 'is-success',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
    },
    onCopyError(err) {
      if (err.text === undefined) {
        err.text = '复制失败'
      }
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `${err.text}`,
        type: 'is-danger',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
    },
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

.bg-white {
  margin-top: 12px;
  background-color: #FFFFFF;
  margin-bottom: 200px;
}

.pass-length {
  width: 20%;
}
.pass-operate {
  display: flex;
  justify-content: flex-end;
  .btns {
    .button {
      margin-left: 20px;
    }
  }
}
.mt14 {
  margin-top: 14px;
}

.mt20 {
  margin-top: 20px;
}
</style>
  