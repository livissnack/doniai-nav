<template>
  <div class="section" :style="bacImage">
    <form action="">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">登录</p>
        </header>
        <section class="modal-card-body">
          <b-field label="邮箱">
            <b-input
                type="email"
                v-model="form.email"
                size="is-small"
                placeholder="请输入邮箱地址"
                required
            >
            </b-input>
          </b-field>

          <b-field label="密码">
            <b-input
                type="password"
                v-model="form.password"
                size="is-small"
                password-reveal
                placeholder="请输入密码"
                required
            >
            </b-input>
          </b-field>

          <b-checkbox size="is-small">记住密码?</b-checkbox>
        </section>
        <footer class="modal-card-foot">
          <div class="buttons">
            <b-button size="is-small" type="is-primary">取消</b-button>
            <b-button
                size="is-small"
                type="is-success"
                @click="handleLoginSubmit"
            >登录
            </b-button
            >
          </div>
        </footer>
      </div>
    </form>
  </div>
</template>

<script>
import { getBgImage } from '@/services/api'

export default {
  name: 'Login',
  data() {
    return {
      bacImage: {},
      form: {
        email: 'test@you.com',
        password: 'test'
      }
    }
  },
  mounted() {
    this.getBgImageUrl()
  },
  methods: {
    async getBgImageUrl() {
      const {data} = await getBgImage()
      if (data.code === 500) {
        this.setLoginBgStyle()
      } else {
        this.setLoginBgStyle(data.data)
      }
    },
    setLoginBgStyle(img_url = '') {
      let routeName = this.$route.name
      if (img_url !== '' && ['login', 'register'].includes(routeName)) {
        this.bacImage = {
          background: `url(${img_url})`
        }
      }

      if (img_url === '' && ['login', 'register'].includes(routeName)) {
        this.bacImage = {
          background:
              'url(https://hiphup.oss-cn-hangzhou.aliyuncs.com/uploads/images/swiper6.jpg)'
        }
      }
    },
    handleLoginSubmit() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: '登录功能尚未开放！',
        type: 'is-info',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
    }
  }
}
</script>

<style lang="less" scoped>
.section {
  height: 100vh;
  background: url('../assets/bg.jpg');
  background-size: 100% 100%;
}

form {
  margin-top: 8%;

  .modal-card {
    margin: 0 auto !important;
    opacity: 0.85;
  }
}
</style>
