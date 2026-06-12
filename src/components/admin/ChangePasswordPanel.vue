<template>
  <section class="admin-card">
    <h2 class="card-title">修改密码</h2>
    <p class="card-desc">
      修改当前登录账号的登录密码。修改成功后请使用新密码重新登录。
    </p>

    <div v-if="userEmail" class="account-hint">
      <AppIcon name="user-circle"  />
      <span>{{ userEmail }}</span>
    </div>

    <form class="password-form" novalidate @submit.prevent="handleSubmit">
      <o-field label="当前密码">
        <o-input
          v-model="form.currentPassword"
          type="password"
          password-reveal
          placeholder="请输入当前密码"
          autocomplete="current-password"
        />
      </o-field>
      <o-field label="新密码">
        <o-input
          v-model="form.newPassword"
          type="password"
          password-reveal
          placeholder="至少 6 位"
          autocomplete="new-password"
        />
      </o-field>
      <o-field label="确认新密码">
        <o-input
          v-model="form.confirmPassword"
          type="password"
          password-reveal
          placeholder="再次输入新密码"
          autocomplete="new-password"
        />
      </o-field>
      <div class="form-foot">
        <button type="submit" class="btn-primary" :disabled="saving">
          <AppIcon v-if="saving" name="spinner" spin />
          {{ saving ? '保存中…' : '保存新密码' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script>
import { authStore, authActions } from '@/store/auth'

const emptyForm = () => ({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

export default {
  name: 'ChangePasswordPanel',
  data() {
    return {
      form: emptyForm(),
      saving: false,
    }
  },
  computed: {
    userEmail() {
      return authStore.user?.email || ''
    },
  },
  methods: {
    async handleSubmit() {
      const currentPassword = this.form.currentPassword.trim()
      const newPassword = this.form.newPassword.trim()
      const confirmPassword = this.form.confirmPassword.trim()

      if (!currentPassword || !newPassword || !confirmPassword) {
        this.$toast.open({ message: '请填写完整', type: 'is-warning' })
        return
      }
      if (newPassword.length < 6) {
        this.$toast.open({ message: '新密码至少 6 位', type: 'is-warning' })
        return
      }
      if (newPassword !== confirmPassword) {
        this.$toast.open({ message: '两次输入的新密码不一致', type: 'is-warning' })
        return
      }
      if (currentPassword === newPassword) {
        this.$toast.open({ message: '新密码不能与当前密码相同', type: 'is-warning' })
        return
      }

      this.saving = true
      try {
        const res = await authActions.changePassword({ currentPassword, newPassword })
        if (res.ok) {
          this.form = emptyForm()
          this.$toast.open({ message: res.message, type: 'is-success' })
        } else {
          this.$toast.open({ message: res.message, type: 'is-danger' })
        }
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.card-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
}

.card-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #6b7280;
}

.account-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  font-size: 13px;
  color: #166534;

  i {
    font-size: 16px;
  }
}

.password-form {
  max-width: 420px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;

  :deep(.label) {
    color: #374151;
    font-weight: 600;
  }

  :deep(.field:not(:last-child)) {
    margin-bottom: 14px;
  }
}

.form-foot {
  margin-top: 8px;
}

.btn-primary {
  height: 36px;
  padding: 0 18px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #22c65b, #20bc56);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  i {
    margin-right: 6px;
  }
}
</style>
