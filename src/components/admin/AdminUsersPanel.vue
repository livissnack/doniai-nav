<template>
  <section class="admin-card">
    <h2 class="card-title">用户管理</h2>
    <p class="card-desc">查看所有注册用户，启用或禁用账号；关闭注册后新用户将无法注册</p>

    <div class="settings-row">
      <div class="settings-info">
        <span class="settings-label">开放注册</span>
        <span class="settings-hint">关闭后注册页将不可用</span>
      </div>
      <b-switch
        :value="registrationEnabled"
        type="is-success"
        :disabled="settingsSaving"
        @input="onRegistrationToggle"
      />
    </div>

    <div v-if="loading" class="loading-hint">加载中…</div>
    <div v-else-if="!users.length" class="loading-hint">暂无用户</div>
    <div v-else class="user-table-wrap">
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>显示名</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.displayName }}</td>
            <td>
              <span v-if="u.isAdmin" class="tag admin">管理员</span>
              <span v-else class="tag">用户</span>
            </td>
            <td>
              <span :class="['tag', u.enabled ? 'on' : 'off']">
                {{ u.enabled ? '正常' : '已禁用' }}
              </span>
            </td>
            <td>
              <button
                v-if="!u.isAdmin"
                type="button"
                class="btn-mini"
                :class="u.enabled ? 'danger' : 'success'"
                :disabled="togglingId === u.id"
                @click="toggleUser(u)"
              >
                {{ togglingId === u.id ? '…' : u.enabled ? '禁用' : '启用' }}
              </button>
              <span v-else class="muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import {
  fetchAdminUsersApi,
  fetchAdminSettingsApi,
  updateAdminSettingsApi,
  setUserEnabledApi,
} from '@/services/authApi'
import { authStore } from '@/store/auth'

export default {
  name: 'AdminUsersPanel',
  data() {
    return {
      loading: false,
      settingsSaving: false,
      togglingId: null,
      users: [],
      registrationEnabled: true,
    }
  },
  mounted() {
    this.loadAll()
  },
  methods: {
    async loadAll() {
      this.loading = true
      try {
        const [usersRes, settingsRes] = await Promise.all([
          fetchAdminUsersApi(),
          fetchAdminSettingsApi(),
        ])
        if (usersRes.data?.ok) {
          this.users = usersRes.data.users || []
        }
        if (settingsRes.data?.ok) {
          this.registrationEnabled = settingsRes.data.registrationEnabled !== false
        }
      } catch (e) {
        this.$buefy.toast.open({
          message: e?.msg || '加载用户列表失败',
          type: 'is-danger',
        })
      } finally {
        this.loading = false
      }
    },
    async onRegistrationToggle(enabled) {
      this.settingsSaving = true
      try {
        const { data } = await updateAdminSettingsApi({ registrationEnabled: enabled })
        if (data?.ok) {
          this.registrationEnabled = data.registrationEnabled !== false
          authStore.registrationEnabled = this.registrationEnabled
          this.$buefy.toast.open({
            message: data.message || (enabled ? '已开放注册' : '已关闭注册'),
            type: 'is-success',
          })
        } else {
          this.$buefy.toast.open({
            message: data?.message || '保存失败',
            type: 'is-danger',
          })
        }
      } catch (e) {
        this.$buefy.toast.open({
          message: e?.msg || '保存失败',
          type: 'is-danger',
        })
      } finally {
        this.settingsSaving = false
      }
    },
    async toggleUser(user) {
      const next = !user.enabled
      this.togglingId = user.id
      try {
        const { data } = await setUserEnabledApi(user.id, { enabled: next })
        if (data?.ok) {
          user.enabled = next
          this.$buefy.toast.open({
            message: data.message || (next ? '已启用' : '已禁用'),
            type: 'is-success',
          })
        } else {
          this.$buefy.toast.open({
            message: data?.message || '操作失败',
            type: 'is-danger',
          })
        }
      } catch (e) {
        this.$buefy.toast.open({
          message: e?.msg || '操作失败',
          type: 'is-danger',
        })
      } finally {
        this.togglingId = null
      }
    },
  },
}
</script>

<style lang="less" scoped>
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  margin-bottom: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.settings-label {
  display: block;
  font-weight: 600;
  color: #1f2937;
}

.settings-hint {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.loading-hint {
  padding: 24px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.user-table-wrap {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    font-weight: 600;
    color: #374151;
    background: #f9fafb;
  }
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #e5e7eb;
  color: #374151;

  &.admin {
    background: #dbeafe;
    color: #1d4ed8;
  }

  &.on {
    background: #d1fae5;
    color: #047857;
  }

  &.off {
    background: #fee2e2;
    color: #b91c1c;
  }
}

.btn-mini {
  padding: 4px 10px;
  border-radius: 4px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  color: #fff;

  &.danger {
    background: #ef4444;
  }

  &.success {
    background: #22c55e;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.muted {
  color: #9ca3af;
}
</style>
