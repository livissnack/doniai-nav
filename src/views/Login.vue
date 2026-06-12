<template>
  <div class="auth-page" :style="bgStyle">
    <router-link to="/" class="auth-back">
      <AppIcon name="arrow-left"  />
      返回首页
    </router-link>
    <div class="auth-card">
      <header class="auth-card-head">
        <div class="auth-icon">
          <AppIcon name="sign-in-alt"  />
        </div>
        <h1>登录</h1>
        <p>登录后可访问「私人」导航与侧栏管理</p>
      </header>
      <form class="auth-form" @submit.prevent="handleSubmit">
        <section class="auth-card-body">
          <o-field label="邮箱">
            <o-input
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              icon="envelope"
              icon-pack="fas"
              @keyup.enter="handleSubmit"
            />
          </o-field>
          <o-field label="密码">
            <o-input
              v-model="form.password"
              type="password"
              password-reveal
              placeholder="请输入密码"
              icon="lock"
              icon-pack="fas"
              autocomplete="current-password"
              @keyup.enter="handleSubmit"
            />
          </o-field>
          <p class="auth-hint">
            <AppIcon name="info-circle"  />
            <span>演示账号：admin@doniai.com / admin123</span>
          </p>
        </section>
        <footer class="auth-card-foot">
          <button type="submit" class="auth-btn primary" :disabled="loading">
            {{ loading ? '登录中…' : '登录' }}
          </button>
          <router-link v-if="registrationEnabled" to="/register" class="auth-link">
            没有账号？去注册
          </router-link>
        </footer>
      </form>
    </div>
  </div>
</template>

<script>
import { getBgImage } from '@/services/api'
import { authActions, authStore } from '@/store/auth'
import { coverStyleFromUrl, pickCoverUrl } from '@/utils/bingCover'

export default {
  name: 'Login',
  data() {
    return {
      bgStyle: {},
      loading: false,
      form: {
        email: '',
        password: '',
      },
    }
  },
  computed: {
    registrationEnabled() {
      return authStore.registrationEnabled !== false
    },
  },
  mounted() {
    this.loadBg()
  },
  methods: {
    async loadBg() {
      try {
        const { data } = await getBgImage()
        this.bgStyle = coverStyleFromUrl(pickCoverUrl(data))
      } catch {
        this.bgStyle = coverStyleFromUrl()
      }
    },
    async handleSubmit() {
      if (this.loading) return
      this.loading = true
      const res = await authActions.login({
        email: this.form.email,
        password: this.form.password,
      })
      this.loading = false
      if (res.ok) {
        this.$toast.open({ message: res.message, type: 'is-success' })
        const redirect = this.$route.query.redirect || '/'
        this.$router.replace(redirect)
      } else {
        this.$toast.open({ message: res.message, type: 'is-danger' })
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '@/styles/auth-page.less';
</style>
