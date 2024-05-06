<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/password`" pageTitle="Base64加解密"></Navbar>
    </div>

    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column bg-white is-three-quarters">
            <div class="pass-result">
              <div class="pass-length">
                <b-field label="待处理内容：" type="is-primary" :message="remark">
                  <b-input maxlength="2000000" type="is-success" v-model="content" placeholder="QmFRaVdMQGdtYWlsLmNvbQ==" @input="handleChangeBase64" icon-pack="fas" icon-right="close-circle"
                  icon-right-clickable
                  @icon-right-click="handleClearBase64"></b-input>
                </b-field>
              </div>
            </div>

            <div class="pass-result mt20">
              <b-field label="处理后结果：">
                <b-input maxlength="2000000" type="textarea" v-model="result"></b-input>
              </b-field>
            </div>

            <div class="pass-operate">
              <div class="btns">
                <b-button :disabled="isDisabled" :type="isType" icon-pack="fas" :icon-left="icon" @click="handleBase64">{{ title }}</b-button>
                <b-button :disabled="isDisabled" type="is-warning" icon-pack="fas" icon-left="copy" v-clipboard:copy="result" v-clipboard:success="onCopySuccess"
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
import { getBase64 } from '@/services/api'
import { isBase64 } from '@/utils/helper'

Vue.use(BackTop)
export default {
  name: 'Base64',
  components: {
    Navbar,
    Sidebar,
    Footer
  },
  data() {
    return {
      title: 'Base64解密',
      icon: 'unlock',
      content: '',
      result: '',
      isType: 'is-success',
      remark: '自动识别是否是编码后的base64字符串，识别为base64字符串时，自动解密，反之加密'
    }
  },
  computed: {
    isDisabled() {
      return this.content.length === 0
    }
  },
  methods: {
    handleChangeBase64(res) {
      let isBase64Res = isBase64(res)
      if(isBase64Res) {
        this.title = 'Base64解密'
        this.icon = 'unlock'
        this.isType = 'is-success'
      } else {
        this.title = 'Base64加密'
        this.icon = 'lock'
        this.isType = 'is-danger'
      }
    },
    handleClearBase64() {
      this.content = ''
    },
    async handleBase64() {
      const { data } = await getBase64(this.content)
      if (data.code === 200) {
        this.result = data.data
      }
    },
    onCopySuccess() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `复制成功：${this.result}`,
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
  width: 100%;
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
.mt20 {
  margin-top: 20px;
}

/deep/ .is-primary {
  background-color: transparent;
}
/deep/ .field {
  .control {
    .input {
      color: #363636;
      border-color: #7957d5;
    }
  }
  .help {
    &:hover {
      color: #7957d5;
    }
  }
}
</style>
  