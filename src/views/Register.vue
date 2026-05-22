<template>
  <div class="auth-page" :style="bgStyle">
    <div class="auth-card">
      <header class="auth-card-head">
        <h1>注册账号</h1>
        <p>创建账号后可访问「私人」导航与管理侧栏面板</p>
      </header>
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
      </section>
      <footer class="auth-card-foot">
        <button type="button" class="auth-btn primary" :disabled="loading" @click="handleSubmit">
          {{ loading ? '注册中…' : '注册' }}
        </button>
        <router-link to="/login" class="auth-link">已有账号？去登录</router-link>
      </footer>
    </div>
  </div>
</template>

<script>
import { getBgImage } from '@/services/api'
import { authActions } from '@/store/auth'

export default {
  name: 'Register',
  data() {
    return {
      bgStyle: {},
      loading: false,
      form: {
        username: '',
        email: '',
        password: '',
        confirm: '',
      },
    }
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
      if (this.form.password !== this.form.confirm) {
        this.$buefy.toast.open({ message: '两次密码不一致', type: 'is-danger' })
        return
      }
      this.loading = true
      const res = await authActions.register({
        username: this.form.username,
        email: this.form.email,
        password: this.form.password,
      })
      this.loading = false
      if (res.ok) {
        this.$buefy.toast.open({ message: res.message, type: 'is-success' })
        this.$router.replace({ path: '/' })
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
  max-width: 420px;
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
