<template>
  <div class="share-page">
    <header class="share-top">
      <router-link to="/" class="share-brand">Doniai Nav</router-link>
      <span class="share-badge">分享笔记</span>
    </header>

    <main class="share-main">
      <div v-if="loading" class="share-state">加载中…</div>
      <div v-else-if="error" class="share-state is-error">
        <AppIcon name="exclamation-circle" />
        <p>{{ error }}</p>
        <router-link to="/login" class="share-link">去登录</router-link>
      </div>
      <article v-else class="share-card">
        <h1 class="share-title">{{ page.title }}</h1>
        <div class="share-body markdown-body" v-html="html" />
      </article>
    </main>
  </div>
</template>

<script>
import { fetchSharedPage } from '@/services/notesApi'
import { renderMarkdown } from '@/utils/markdown'

export default {
  name: 'SharedNote',
  data() {
    return {
      loading: true,
      error: '',
      page: { title: '', content: '' },
    }
  },
  computed: {
    html() {
      return renderMarkdown(this.page.content || '')
    },
  },
  async created() {
    await this.load()
  },
  methods: {
    async load() {
      const token = this.$route.params.token
      this.loading = true
      this.error = ''
      try {
        const { data } = await fetchSharedPage(token)
        if (data?.ok && data.page) {
          this.page = data.page
        } else {
          this.error = data?.message || '分享不存在或已失效'
        }
      } catch (e) {
        this.error = e?.msg || '分享不存在或已失效'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.share-page {
  min-height: 100vh;
  background:
    radial-gradient(900px 240px at 10% 0%, rgba(32, 188, 86, 0.08), transparent 55%),
    #eef2f6;
}

.share-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 860px;
  margin: 0 auto;
  padding: 18px 20px 8px;
}

.share-brand {
  color: #166534;
  font-weight: 700;
  text-decoration: none;
}

.share-badge {
  padding: 4px 10px;
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #166534;
  font-size: 12px;
  font-weight: 600;
}

.share-main {
  max-width: 860px;
  margin: 0 auto;
  padding: 12px 20px 40px;
}

.share-state {
  padding: 64px 20px;
  text-align: center;
  color: #64748b;
  font-size: 14px;

  &.is-error {
    color: #b91c1c;
  }

  p {
    margin: 10px 0;
  }
}

.share-link {
  color: #166534;
}

.share-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
  padding: 28px 28px 36px;
}

.share-title {
  margin: 0 0 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.share-body {
  min-height: 200px;
}
</style>
