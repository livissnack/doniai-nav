<template>
  <div class="auth-page" :style="bgStyle">
    <div class="auth-card">
      <header class="auth-card-head">
        <h1>注册账号</h1>
        <p>创建账号后可访问「私人」导航与管理侧栏面板</p>
      </header>
      <div v-if="!registrationEnabled" class="register-closed">
        注册功能已关闭，请联系管理员
      </div>
      <form v-else class="auth-form" @submit.prevent="handleSubmit">
        <section class="auth-card-body">
          <b-field label="用户名">
            <b-input v-model="form.username" placeholder="2–20 个字符" maxlength="20" />
          </b-field>
          <b-field label="邮箱">
            <b-input v-model="form.email" type="email" placeholder="your@email.com" />
          </b-field>
          <b-field label="密码">
            <b-input v-model="form.password" type="password" password-reveal placeholder="至少 6 位" />
          </b-field>
          <b-field label="确认密码">
            <b-input v-model="form.confirm" type="password" password-reveal placeholder="再次输入密码" />
          </b-field>
          <b-field label="验证码">
            <div class="captcha-row">
              <b-input
                v-model="form.captchaCode"
                placeholder="请输入图中字符"
                maxlength="6"
                autocomplete="off"
                @keyup.native.enter="handleSubmit"
              />
              <button
                type="button"
                class="captcha-img-btn"
                title="点击刷新验证码"
                :disabled="captchaLoading"
                @click="loadCaptcha"
              >
                <img
                  v-if="captchaImage"
                  :src="captchaImage"
                  alt="验证码"
                  class="captcha-img"
                />
                <span v-else class="captcha-placeholder">{{ captchaLoading ? '加载中' : '刷新' }}</span>
              </button>
            </div>
          </b-field>
        </section>
        <footer class="auth-card-foot">
          <button type="submit" class="auth-btn primary" :disabled="loading">
            {{ loading ? '注册中…' : '注册' }}
          </button>
          <router-link to="/login" class="auth-link">已有账号？去登录</router-link>
        </footer>
      </form>
    </div>
  </div>
</template>

<script>
import { getBgImage } from '@/services/api'
import { fetchCaptchaApi } from '@/services/authApi'
import { authActions, authStore } from '@/store/auth'

export default {
  name: 'Register',
  data() {
    return {
      bgStyle: {},
      loading: false,
      captchaLoading: false,
      captchaId: '',
      captchaImage: '',
      form: {
        username: '',
        email: '',
        password: '',
        confirm: '',
        captchaCode: '',
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
    if (this.registrationEnabled) {
      this.loadCaptcha()
    }
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
    async loadCaptcha() {
      this.captchaLoading = true
      try {
        const { data } = await fetchCaptchaApi()
        if (data?.ok && data.captchaId && data.captchaImage) {
          this.captchaId = data.captchaId
          this.captchaImage = data.captchaImage
          this.form.captchaCode = ''
          return
        }
        this.$buefy.toast.open({
          message: data?.message || '获取验证码失败',
          type: 'is-danger',
        })
      } catch (e) {
        this.$buefy.toast.open({
          message: e?.msg || '获取验证码失败',
          type: 'is-danger',
        })
      } finally {
        this.captchaLoading = false
      }
    },
    async handleSubmit() {
      if (this.form.password !== this.form.confirm) {
        this.$buefy.toast.open({ message: '两次密码不一致', type: 'is-danger' })
        return
      }
      if (!this.captchaId) {
        this.$buefy.toast.open({ message: '请等待验证码加载', type: 'is-warning' })
        return
      }
      if (!this.form.captchaCode.trim()) {
        this.$buefy.toast.open({ message: '请填写验证码', type: 'is-warning' })
        return
      }
      this.loading = true
      const res = await authActions.register({
        username: this.form.username,
        email: this.form.email,
        password: this.form.password,
        captchaId: this.captchaId,
        captchaCode: this.form.captchaCode,
      })
      this.loading = false
      if (res.ok) {
        this.$buefy.toast.open({ message: res.message, type: 'is-success' })
        this.$router.replace({ path: '/' })
      } else {
        this.$buefy.toast.open({ message: res.message, type: 'is-danger' })
        this.loadCaptcha()
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
  max-width: 420px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.register-closed {
  margin: 16px 24px 24px;
  padding: 16px;
  text-align: center;
  font-size: 14px;
  color: #b45309;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
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

.auth-card-body {
  padding: 16px 24px;
}

.auth-card-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 24px 24px;
}

.captcha-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
  width: 100%;

  .control {
    flex: 1;
    min-width: 0;
  }
}

.captcha-img-btn {
  flex-shrink: 0;
  width: 140px;
  height: 40px;
  padding: 0;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  background: #f9fafb;
  cursor: pointer;
  overflow: hidden;

  &:hover:not(:disabled) {
    border-color: #20bc56;
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
}

.captcha-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  font-size: 13px;
  color: #6b7280;
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
