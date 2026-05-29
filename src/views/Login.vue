<template>
  <div class="auth-page" :style="bgStyle">
    <div class="auth-card">
      <header class="auth-card-head">
        <h1>登录</h1>
        <p>登录后可访问「私人」导航与侧栏管理</p>
      </header>
      <form class="auth-form" @submit.prevent="handleSubmit">
      <section class="auth-card-body">
        <b-field label="邮箱">
          <b-input
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
            @keyup.native.enter="handleSubmit"
          />
        </b-field>
        <b-field label="密码">
          <div class="password-field">
            <input
              v-model="form.password"
              class="input"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              autocomplete="current-password"
              @keyup.enter="handleSubmit"
            />
            <button
              type="button"
              class="password-toggle"
              tabindex="-1"
              :title="showPassword ? '隐藏密码' : '显示密码'"
              :aria-pressed="showPassword"
              @click.prevent="showPassword = !showPassword"
            >
              <i :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
            </button>
          </div>
        </b-field>
        <p class="auth-hint">演示账号：admin@doniai.com / admin123</p>
      </section>
      <footer class="auth-card-foot">
        <button type="submit" class="auth-btn primary" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
        </button>
        <router-link v-if="registrationEnabled" to="/register" class="auth-link">没有账号？去注册</router-link>
      </footer>
      </form>
    </div>
  </div>
</template>

<script>
import { getBgImage } from '@/services/api'
import { authActions, authStore } from '@/store/auth'

export default {
  name: 'Login',
  data() {
    return {
      bgStyle: {},
      loading: false,
      showPassword: false,
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
        const url = data?.code === 200 ? data.data?.cover_4k : ''
        this.bgStyle = url
          ? { backgroundImage: `url(${url})` }
          : { backgroundImage: 'url(https://hiphup.oss-cn-hangzhou.aliyuncs.com/uploads/images/swiper6.jpg)' }
      } catch {
        this.bgStyle = {
          backgroundImage: 'url(https://hiphup.oss-cn-hangzhou.aliyuncs.com/uploads/images/swiper6.jpg)',
        }
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
        this.$buefy.toast.open({ message: res.message, type: 'is-success' })
        const redirect = this.$route.query.redirect || '/'
        this.$router.replace(redirect)
      } else {
        this.$buefy.toast.open({ message: res.message, type: 'is-danger' })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background-size: cover;
  background-position: center;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.auth-card-head {
  padding: 24px 24px 8px;
  text-align: center;

  h1 {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
  }
}

.auth-form {
  margin: 0;
}

.auth-card-body {
  padding: 16px 24px;
}

.password-field {
  position: relative;
  width: 100%;

  .input {
    width: 100%;
    height: 2.5em;
    padding-right: 42px;
    box-sizing: border-box;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
      border-color: #20bc56;
      box-shadow: 0 0 0 0.125em rgba(32, 188, 86, 0.25);
    }
  }
}

.password-toggle {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;

  &:hover {
    color: #20bc56;
    background: rgba(32, 188, 86, 0.08);
  }
}

.auth-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.auth-card-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 24px 24px;
}

.auth-btn {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &.primary {
    background: linear-gradient(135deg, #22c65b, #20bc56);
    color: #fff;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #2dd36f, #22c65b);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.auth-link {
  font-size: 13px;
  color: #20bc56;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
