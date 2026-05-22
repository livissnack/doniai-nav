<template>
  <section class="admin-card">
    <div class="card-title-row">
      <div>
        <h2 class="card-title">私人导航</h2>
        <p class="card-desc">
          管理顶部「私人」栏目下的分类与导航链接，保存后对应当前登录账号
        </p>
      </div>
      <div class="title-actions">
        <button type="button" class="btn-outline" :disabled="loading" @click="loadNav">
          <i :class="['fas', loading ? 'fa-spinner fa-spin' : 'fa-sync-alt']"></i>
        </button>
        <button type="button" class="btn-outline" @click="confirmReset">恢复默认</button>
      </div>
    </div>

    <form class="inline-form" @submit.prevent="submitCategory">
      <label class="inline-form-label">新增分类</label>
      <div class="inline-form-row">
        <b-input
          v-model="categoryForm.title"
          placeholder="分类名称"
          maxlength="30"
          expanded
        />
        <button type="submit" class="btn-primary" :disabled="saving">添加分类</button>
      </div>
    </form>

    <div v-if="loading" class="state-hint"><i class="fas fa-spinner fa-spin"></i> 加载中…</div>
    <div v-else-if="!categories.length" class="state-hint">暂无分类，请先添加</div>

    <div v-else class="category-list">
      <div v-for="cat in categories" :key="cat.id" class="category-block">
        <div class="category-head">
          <template v-if="editingCategoryId === cat.id">
            <b-input v-model="categoryEditTitle" size="is-small" class="cat-edit-input" />
            <button type="button" class="link-btn" @click="saveCategoryEdit(cat)">保存</button>
            <button type="button" class="link-btn muted" @click="editingCategoryId = null">取消</button>
          </template>
          <template v-else>
            <h3 class="category-title">{{ cat.title }}</h3>
            <span class="cat-count">{{ (cat.items || []).length }} 个链接</span>
            <div class="cat-actions">
              <button type="button" class="link-btn" @click="startCategoryEdit(cat)">编辑</button>
              <button type="button" class="link-btn danger" @click="removeCategory(cat)">删除</button>
            </div>
          </template>
        </div>

        <table v-if="cat.items && cat.items.length" class="nav-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>链接</th>
              <th>样式</th>
              <th>本页打开</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cat.items" :key="item.id">
              <td>{{ item.name }}</td>
              <td class="td-href">{{ item.href }}</td>
              <td><span class="color-tag" :class="item.color">{{ colorLabel(item.color) }}</span></td>
              <td>{{ item.isNotNewBlack ? '是' : '否' }}</td>
              <td class="td-actions">
                <button type="button" class="link-btn" @click="editItem(cat, item)">编辑</button>
                <button type="button" class="link-btn danger" @click="removeItem(item)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-items">该分类下暂无导航</p>

        <button type="button" class="btn-add-item" @click="openItemForm(cat)">
          <i class="fas fa-plus"></i> 添加导航
        </button>
      </div>
    </div>

    <div v-if="itemFormVisible" class="modal-mask" @click.self="closeItemForm">
      <div class="modal-card">
        <h3 class="modal-title">{{ editingItemId ? '编辑导航' : '添加导航' }}</h3>
        <form @submit.prevent="submitItem">
          <b-field label="名称">
            <b-input v-model="itemForm.name" maxlength="40" />
          </b-field>
          <b-field label="链接">
            <b-input v-model="itemForm.href" placeholder="https:// 或 /utils/xxx" />
          </b-field>
          <b-field label="按钮颜色">
            <b-select v-model="itemForm.color" expanded>
              <option v-for="c in colorOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
            </b-select>
          </b-field>
          <b-field label="本页打开（站内路径）">
            <b-switch v-model="itemForm.isNotNewBlack" type="is-success">不新开标签页</b-switch>
          </b-field>
          <div class="modal-foot">
            <button type="button" class="btn-outline" @click="closeItemForm">取消</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? '保存中…' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import {
  fetchPrivateNav,
  resetPrivateNav,
  createNavCategory,
  updateNavCategory,
  deleteNavCategory,
  createNavItem,
  updateNavItem,
  deleteNavItem,
} from '@/services/navApi'

const COLOR_OPTIONS = [
  { value: 'is-primary', label: '紫色' },
  { value: 'is-success', label: '绿色' },
  { value: 'is-danger', label: '红色' },
  { value: 'is-warning', label: '黄色' },
  { value: 'is-info', label: '蓝色' },
]

const emptyItemForm = () => ({
  name: '',
  href: '',
  color: 'is-primary',
  isNotNewBlack: false,
})

export default {
  name: 'PrivateNavManager',
  data() {
    return {
      categories: [],
      loading: false,
      saving: false,
      categoryForm: { title: '' },
      editingCategoryId: null,
      categoryEditTitle: '',
      itemFormVisible: false,
      itemFormCategoryId: null,
      editingItemId: null,
      itemForm: emptyItemForm(),
      colorOptions: COLOR_OPTIONS,
    }
  },
  mounted() {
    this.loadNav()
  },
  methods: {
    colorLabel(color) {
      const found = COLOR_OPTIONS.find((c) => c.value === color)
      return found ? found.label : color
    },
    async loadNav() {
      this.loading = true
      try {
        const { data } = await fetchPrivateNav()
        if (data?.ok) {
          this.categories = data.categories || []
        }
      } catch (e) {
        this.$buefy.toast.open({ message: e?.msg || '加载失败', type: 'is-danger' })
      } finally {
        this.loading = false
      }
    },
    async submitCategory() {
      const title = this.categoryForm.title.trim()
      if (!title) {
        this.$buefy.toast.open({ message: '请填写分类名称', type: 'is-warning' })
        return
      }
      this.saving = true
      try {
        const { data } = await createNavCategory(title)
        if (data?.ok) {
          this.categoryForm.title = ''
          if (data.categories) this.categories = data.categories
          else await this.loadNav()
          this.$buefy.toast.open({ message: '分类已添加', type: 'is-success' })
        }
      } catch (e) {
        this.$buefy.toast.open({ message: e?.msg || '添加失败', type: 'is-danger' })
      } finally {
        this.saving = false
      }
    },
    startCategoryEdit(cat) {
      this.editingCategoryId = cat.id
      this.categoryEditTitle = cat.title
    },
    async saveCategoryEdit(cat) {
      const title = this.categoryEditTitle.trim()
      if (!title) return
      try {
        const { data } = await updateNavCategory(cat.id, title)
        if (data?.ok) {
          this.editingCategoryId = null
          await this.loadNav()
          this.$buefy.toast.open({ message: '已更新', type: 'is-success' })
        }
      } catch (e) {
        this.$buefy.toast.open({ message: e?.msg || '更新失败', type: 'is-danger' })
      }
    },
    removeCategory(cat) {
      this.$buefy.dialog.confirm({
        title: '删除分类',
        message: `确定删除「${cat.title}」及其下所有导航？`,
        type: 'is-danger',
        confirmText: '删除',
        onConfirm: async () => {
          try {
            const { data } = await deleteNavCategory(cat.id)
            if (data?.ok) {
              this.categories = data.categories || []
              this.$buefy.toast.open({ message: '已删除', type: 'is-success' })
            }
          } catch (e) {
            this.$buefy.toast.open({ message: e?.msg || '删除失败', type: 'is-danger' })
          }
        },
      })
    },
    openItemForm(cat, item = null) {
      this.itemFormCategoryId = cat.id
      this.editingItemId = item ? item.id : null
      if (item) {
        this.itemForm = {
          name: item.name,
          href: item.href,
          color: item.color || 'is-primary',
          isNotNewBlack: !!item.isNotNewBlack,
        }
      } else {
        this.itemForm = emptyItemForm()
      }
      this.itemFormVisible = true
    },
    editItem(cat, item) {
      this.openItemForm(cat, item)
    },
    closeItemForm() {
      this.itemFormVisible = false
      this.editingItemId = null
      this.itemFormCategoryId = null
    },
    async submitItem() {
      const payload = {
        name: this.itemForm.name.trim(),
        href: this.itemForm.href.trim(),
        color: this.itemForm.color,
        isNotNewBlack: this.itemForm.isNotNewBlack,
      }
      if (!payload.name || !payload.href) {
        this.$buefy.toast.open({ message: '请填写名称和链接', type: 'is-warning' })
        return
      }
      this.saving = true
      try {
        const req = this.editingItemId
          ? updateNavItem(this.editingItemId, payload)
          : createNavItem(this.itemFormCategoryId, payload)
        const { data } = await req
        if (data?.ok) {
          this.categories = data.categories || this.categories
          await this.loadNav()
          this.closeItemForm()
          this.$buefy.toast.open({ message: '已保存', type: 'is-success' })
        }
      } catch (e) {
        this.$buefy.toast.open({ message: e?.msg || '保存失败', type: 'is-danger' })
      } finally {
        this.saving = false
      }
    },
    removeItem(item) {
      this.$buefy.dialog.confirm({
        title: '删除导航',
        message: `确定删除「${item.name}」？`,
        type: 'is-danger',
        confirmText: '删除',
        onConfirm: async () => {
          try {
            const { data } = await deleteNavItem(item.id)
            if (data?.ok) {
              this.categories = data.categories || []
              this.$buefy.toast.open({ message: '已删除', type: 'is-success' })
            }
          } catch (e) {
            this.$buefy.toast.open({ message: e?.msg || '删除失败', type: 'is-danger' })
          }
        },
      })
    },
    confirmReset() {
      this.$buefy.dialog.confirm({
        title: '恢复默认',
        message: '将用内置默认数据覆盖当前私人导航，是否继续？',
        type: 'is-warning',
        confirmText: '恢复',
        onConfirm: async () => {
          try {
            const { data } = await resetPrivateNav()
            if (data?.ok) {
              this.categories = data.categories || []
              this.$buefy.toast.open({ message: '已恢复默认', type: 'is-success' })
            }
          } catch (e) {
            this.$buefy.toast.open({ message: e?.msg || '操作失败', type: 'is-danger' })
          }
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.card-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
}

.card-desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.title-actions {
  display: flex;
  gap: 8px;
}

.inline-form {
  margin-bottom: 20px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 10px;
}

.inline-form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  line-height: 1.2;
}

.inline-form-row {
  display: flex;
  gap: 12px;

  > *:not(.btn-primary) {
    flex: 1;
    min-width: 0;
  }

  ::v-deep .control {
    margin-bottom: 0;
  }

  ::v-deep .input {
    height: 34px;
    box-sizing: border-box;
  }

  .btn-primary {
    flex-shrink: 0;
    margin: 0;
  }
}

.state-hint {
  text-align: center;
  padding: 32px;
  color: #9ca3af;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-block {
  border: 1px solid #eef0f2;
  border-radius: 10px;
  padding: 14px;
  background: #fafbfc;
}

.category-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.category-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.cat-count {
  font-size: 12px;
  color: #9ca3af;
}

.cat-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.cat-edit-input {
  max-width: 200px;
}

.nav-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  th,
  td {
    padding: 8px 10px;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
  }

  th {
    font-size: 12px;
    color: #6b7280;
    background: #f9fafb;
  }
}

.td-href {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #6b7280;
}

.color-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #fff;

  &.is-primary {
    background: #6943d0;
  }
  &.is-success {
    background: #20bc56;
  }
  &.is-danger {
    background: #ef4444;
  }
  &.is-warning {
    background: #f59e0b;
  }
  &.is-info {
    background: #3b82f6;
  }
}

.empty-items {
  margin: 0 0 8px;
  font-size: 13px;
  color: #9ca3af;
}

.btn-add-item {
  margin-top: 8px;
  border: 1px dashed #d1d5db;
  background: #fff;
  color: #20bc56;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: #20bc56;
    background: #f0fdf4;
  }
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.modal-title {
  margin: 0 0 16px;
  font-size: 17px;
  font-weight: 700;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.link-btn {
  border: none;
  background: none;
  color: #20bc56;
  font-size: 13px;
  cursor: pointer;

  &.muted {
    color: #6b7280;
  }
  &.danger {
    color: #ef4444;
  }
}

.btn-outline,
.btn-primary {
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.btn-outline {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
}

.btn-primary {
  border: none;
  background: linear-gradient(135deg, #22c65b, #20bc56);
  color: #fff;
  font-weight: 600;

  &:disabled {
    opacity: 0.7;
  }
}
</style>
