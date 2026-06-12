<template>
  <div class="auth-page" :style="bgStyle">
    <router-link to="/" class="auth-back">
      <AppIcon name="arrow-left"  />
      返回首页
    </router-link>
    <div class="auth-card auth-card--register">
      <header class="auth-card-head">
        <div class="auth-icon">
          <AppIcon name="user-plus"  />
        </div>
        <h1>注册账号</h1>
        <p>创建账号后可访问「私人」导航与管理侧栏面板</p>
      </header>
      <div v-if="!registrationEnabled" class="register-closed">
        <AppIcon name="lock"  />
        <span>注册功能已关闭，请联系管理员</span>
      </div>
      <form v-else class="auth-form" @submit.prevent="handleSubmit">
        <section class="auth-card-body">
          <o-field label="用户名">
            <o-input
              v-model="form.username"
              placeholder="2–20 个字符"
              icon="user"
              icon-pack="fas"
              maxlength="20"
            />
          </o-field>
          <o-field label="邮箱">
            <o-input
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              icon="envelope"
              icon-pack="fas"
            />
          </o-field>
          <o-field label="密码">
            <o-input
              v-model="form.password"
              type="password"
              password-reveal
              placeholder="至少 6 位"
              icon="lock"
              icon-pack="fas"
            />
          </o-field>
          <o-field label="确认密码">
            <o-input
              v-model="form.confirm"
              type="password"
              password-reveal
              placeholder="再次输入密码"
              icon="lock"
              icon-pack="fas"
            />
          </o-field>
          <o-field label="验证码">
            <o-input
              v-model="form.captchaCode"
              placeholder="请输入图中字符"
              icon="shield-alt"
              icon-pack="fas"
              maxlength="6"
              autocomplete="off"
              @keyup.enter="handleSubmit"
            />
          </o-field>
          <div class="captcha-box">
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
                width="140"
                height="48"
                decoding="async"
              />
              <span v-else class="captcha-placeholder">{{ captchaLoading ? '加载中…' : '点击加载验证码' }}</span>
            </button>
            <span class="captcha-tip">看不清？点击图片刷新</span>
          </div>
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
import { coverStyleFromUrl, pickCoverUrl } from '@/utils/bingCover'
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
    async loadCaptcha(showError = true) {
      this.captchaLoading = true
      try {
        const { data } = await fetchCaptchaApi()
        if (data?.ok && data.captchaId && data.captchaImage) {
          this.captchaId = data.captchaId
          this.captchaImage = data.captchaImage
          this.form.captchaCode = ''
          return
        }
        if (showError) {
          this.$toast.open({
            message: data?.message || '获取验证码失败',
            type: 'is-danger',
          })
        }
      } catch (e) {
        if (showError) {
          this.$toast.open({
            message: e?.msg || '获取验证码失败',
            type: 'is-danger',
          })
        }
      } finally {
        this.captchaLoading = false
      }
    },
    async handleSubmit() {
      if (this.form.password !== this.form.confirm) {
        this.$toast.open({ message: '两次密码不一致', type: 'is-danger' })
        return
      }
      if (!this.captchaId) {
        this.$toast.open({ message: '请等待验证码加载', type: 'is-warning' })
        return
      }
      if (!this.form.captchaCode.trim()) {
        this.$toast.open({ message: '请填写验证码', type: 'is-warning' })
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
        this.$toast.open({ message: res.message, type: 'is-success' })
        this.$router.replace({ path: '/' })
      } else {
        this.$toast.open({ message: res.message, type: 'is-danger' })
        this.loadCaptcha()
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '@/styles/auth-page.less';

.auth-card--register {
  max-width: 400px;
}

.register-closed {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 8px 28px 28px;
  padding: 14px 16px;
  text-align: center;
  font-size: 14px;
  color: #b45309;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 10px;

  i {
    flex-shrink: 0;
  }
}

.captcha-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin-top: -8px;
  margin-bottom: 16px;
}

.captcha-img-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 68px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    border-color: #6943d0;
    box-shadow: 0 0 0 3px rgba(105, 67, 208, 0.1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
}

.captcha-tip {
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
}

.captcha-img {
  display: block;
  width: 140px;
  height: 48px;
  flex-shrink: 0;
  object-fit: contain;
  image-rendering: crisp-edges;
}

@media screen and (min-width: 400px) {
  .captcha-img-btn {
    min-height: 116px;
  }

  .captcha-img {
    width: 280px;
    height: 96px;
    image-rendering: pixelated;
  }
}

.captcha-placeholder {
  font-size: 13px;
  color: #6b7280;
}

@media screen and (max-width: 480px) {
  .register-closed {
    margin: 8px 20px 22px;
  }
}
</style>
