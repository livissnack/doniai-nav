<template>
  <div class="notes-panel">
    <aside class="doc-sidebar">
      <div class="sidebar-search">
        <i class="fas fa-search"></i>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="输入关键字"
          autocomplete="off"
        />
      </div>

      <div class="sidebar-project">
        <select
          v-model="currentProjectId"
          class="project-select"
          @change="onProjectChange"
        >
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <button type="button" class="foot-icon" title="新建项目" @click="showProjectModal = true">
          <i class="fas fa-folder-plus"></i>
        </button>
      </div>

      <div class="sidebar-tree">
        <ul class="tree-root">
          <doc-tree-node
            v-for="node in treeRoots"
            :key="node.id"
            :node="node"
            :active-id="activePageId"
            @select="selectPage"
            @delete="removePage"
          />
        </ul>
        <div v-if="!treeRoots.length" class="tree-empty">
          <p>{{ searchKeyword ? '无匹配页面' : '暂无文档' }}</p>
        </div>
      </div>

      <div class="sidebar-foot">
        <button type="button" class="foot-icon" title="新建页面" @click="addPage">
          <i class="fas fa-plus"></i>
        </button>
        <button type="button" class="foot-icon" title="新建目录" @click="addFolder">
          <i class="fas fa-folder-plus"></i>
        </button>
      </div>
    </aside>

    <div class="doc-center">
      <main v-if="activePage && activePage.kind === 'page'" class="doc-main">
        <header class="doc-article-head">
          <input
            v-model="editTitle"
            class="doc-title-field"
            placeholder="页面标题"
            @blur="saveMeta"
          />
          <div class="doc-article-actions">
            <button
              v-if="headings.length"
              type="button"
              class="head-icon"
              :class="{ active: tocOpen }"
              title="目录"
              @click="tocOpen = !tocOpen"
            >
              <i class="fas fa-list-ul"></i>
            </button>
          </div>
        </header>

        <div class="doc-article" :class="`mode-${viewMode}`">
          <textarea
            v-show="viewMode !== 'preview'"
            v-model="editContent"
            class="md-source"
            placeholder="在此编写 Markdown…"
          />
          <div
            v-show="viewMode !== 'edit'"
            ref="mdPreview"
            class="md-preview markdown-body"
            v-html="previewHtml"
          />
        </div>
      </main>

      <main v-else class="doc-main doc-empty">
        <i :class="activePage && activePage.kind === 'folder' ? 'fas fa-folder-open' : 'fas fa-file-alt'"></i>
        <p v-if="activePage && activePage.kind === 'folder'">目录「{{ activePage.title }}」</p>
        <p v-else>选择左侧文档开始阅读</p>
      </main>

      <transition name="toc-slide">
        <aside v-if="tocOpen && headings.length" class="doc-toc">
          <div class="toc-head">
            <span>目录</span>
            <button type="button" class="toc-close" @click="tocOpen = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <nav class="toc-nav">
            <a
              v-for="h in headings"
              :key="h.id"
              href="#"
              class="toc-link"
              :class="`level-${h.level}`"
              @click.prevent="scrollToHeading(h.id)"
            >{{ h.text }}</a>
          </nav>
        </aside>
      </transition>
    </div>

    <div v-if="showProjectModal" class="modal-mask" @click.self="showProjectModal = false">
      <div class="modal-card">
        <h3>新建项目</h3>
        <o-field label="名称">
          <o-input v-model="newProjectName" placeholder="项目名称" />
        </o-field>
        <div class="modal-foot">
          <button type="button" class="btn-outline" @click="showProjectModal = false">取消</button>
          <button type="button" class="btn-primary" @click="createProject">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchProjects,
  createProject,
  fetchPages,
  createPage,
  fetchPage,
  updatePage,
  deletePage,
} from '@/services/notesApi'
import { renderMarkdown, extractHeadings } from '@/utils/markdown'

const DocTreeNode = {
  name: 'DocTreeNode',
  props: { node: Object, activeId: [Number, String] },
  template: `
    <li class="tree-node">
      <div
        class="tree-row"
        :class="{ active: node.id === activeId, 'is-folder': node.kind === 'folder' }"
        @click="$emit('select', node)"
      >
        <i :class="node.kind === 'folder' ? 'fas fa-folder' : 'fas fa-file-alt'"></i>
        <span class="tree-label" :title="node.title">{{ node.title }}</span>
        <button type="button" class="tree-del" title="删除" @click.stop="$emit('delete', node)">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <ul v-if="node.children && node.children.length" class="tree-children">
        <doc-tree-node
          v-for="c in node.children"
          :key="c.id"
          :node="c"
          :active-id="activeId"
          @select="$emit('select', $event)"
          @delete="$emit('delete', $event)"
        />
      </ul>
    </li>
  `,
}

function buildTree(pages, parentId = 0) {
  return pages
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map((p) => ({
      ...p,
      children: buildTree(pages, p.id),
    }))
}

export default {
  name: 'NotesPanel',
  components: { DocTreeNode },
  data() {
    return {
      projects: [],
      pages: [],
      currentProjectId: null,
      activePageId: null,
      activePage: null,
      editTitle: '',
      editContent: '',
      viewMode: 'split',
      saving: false,
      showProjectModal: false,
      newProjectName: '',
      searchKeyword: '',
      tocOpen: true,
    }
  },
  computed: {
    filteredPages() {
      const k = this.searchKeyword.trim().toLowerCase()
      if (!k) return this.pages
      return this.pages.filter((p) => p.title.toLowerCase().includes(k))
    },
    treeRoots() {
      return buildTree(this.filteredPages, 0)
    },
    previewHtml() {
      return renderMarkdown(this.editContent)
    },
    headings() {
      return extractHeadings(this.editContent)
    },
  },
  watch: {
    viewMode(mode) {
      this.$emit('view-mode-change', mode)
    },
    headings(list) {
      if (!list.length) this.tocOpen = false
    },
  },
  mounted() {
    this.loadProjects()
    this.$emit('view-mode-change', this.viewMode)
  },
  methods: {
    setViewMode(mode) {
      this.viewMode = mode
    },
    emitProjectName() {
      const p = this.projects.find((x) => x.id === this.currentProjectId)
      this.$emit('project-change', p?.name || '云笔记')
    },
    async loadProjects() {
      try {
        const { data } = await fetchProjects()
        if (data?.ok) {
          this.projects = data.projects || []
          if (!this.currentProjectId && this.projects.length) {
            this.currentProjectId = this.projects[0].id
            await this.loadPages()
          }
          this.emitProjectName()
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '加载项目失败', type: 'is-danger' })
      }
    },
    async onProjectChange() {
      this.activePageId = null
      this.activePage = null
      await this.loadPages()
      this.emitProjectName()
    },
    async loadPages() {
      if (!this.currentProjectId) return
      try {
        const { data } = await fetchPages(this.currentProjectId)
        if (data?.ok) this.pages = data.pages || []
      } catch (e) {
        this.$toast.open({ message: e?.msg || '加载页面失败', type: 'is-danger' })
      }
    },
    async createProject() {
      const name = this.newProjectName.trim()
      if (!name) return
      try {
        const { data } = await createProject({ name })
        if (data?.ok) {
          this.showProjectModal = false
          this.newProjectName = ''
          await this.loadProjects()
          if (data.project) {
            this.currentProjectId = data.project.id
            await this.loadPages()
            this.emitProjectName()
          }
          this.$toast.open({ message: '项目已创建', type: 'is-success' })
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '创建失败', type: 'is-danger' })
      }
    },
    parentForNew() {
      if (this.activePage && this.activePage.kind === 'folder') return this.activePage.id
      if (this.activePage) return this.activePage.parentId || 0
      return 0
    },
    async addFolder() {
      if (!this.currentProjectId) return
      const title = window.prompt('目录名称')
      if (!title) return
      await this.createNode(title, 'folder')
    },
    async addPage() {
      if (!this.currentProjectId) return
      const title = window.prompt('页面标题', '未命名页面')
      if (!title) return
      await this.createNode(title, 'page')
    },
    async createNode(title, kind) {
      try {
        const { data } = await createPage({
          projectId: this.currentProjectId,
          parentId: this.parentForNew(),
          title,
          kind,
          content: kind === 'page' ? `# ${title}\n\n` : '',
        })
        if (data?.ok) {
          await this.loadPages()
          if (data.page && kind === 'page') this.selectPage(data.page)
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '创建失败', type: 'is-danger' })
      }
    },
    async selectPage(node) {
      this.activePageId = node.id
      if (node.kind === 'folder') {
        this.activePage = node
        return
      }
      try {
        const { data } = await fetchPage(node.id)
        if (data?.ok && data.page) {
          this.activePage = data.page
          this.editTitle = data.page.title
          this.editContent = data.page.content || ''
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '加载失败', type: 'is-danger' })
      }
    },
    async saveMeta() {
      if (!this.activePage || this.activePage.kind !== 'page') return
      if (this.editTitle.trim() === this.activePage.title) return
      await this.patchPage({ title: this.editTitle.trim() })
    },
    async saveContent() {
      if (!this.activePage || this.activePage.kind !== 'page') return
      this.saving = true
      try {
        await this.patchPage({ content: this.editContent })
        this.$toast.open({ message: '已保存', type: 'is-success' })
      } catch (e) {
        this.$toast.open({ message: e?.msg || '保存失败', type: 'is-danger' })
      } finally {
        this.saving = false
      }
    },
    async patchPage(payload) {
      const { data } = await updatePage(this.activePage.id, payload)
      if (data?.ok && data.page) {
        this.activePage = data.page
        await this.loadPages()
      }
    },
    scrollToHeading(id) {
      const root = this.$refs.mdPreview
      if (!root) return
      const el = root.querySelector(`#${id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    removePage(node) {
      this.$dialog.confirm({
        title: '删除',
        message: `确定删除「${node.title}」${node.kind === 'folder' ? '及其子项' : ''}？`,
        type: 'is-danger',
        confirmText: '删除',
        onConfirm: async () => {
          try {
            const { data } = await deletePage(node.id)
            if (data?.ok) {
              if (this.activePageId === node.id) {
                this.activePageId = null
                this.activePage = null
              }
              this.pages = data.pages || []
              this.$toast.open({ message: '已删除', type: 'is-success' })
            }
          } catch (e) {
            this.$toast.open({ message: e?.msg || '删除失败', type: 'is-danger' })
          }
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@accent: #20bc56;
@accent-soft: #f0fdf4;
@sidebar: #f8fafc;
@border: #e2e8f0;
@text: #1e293b;
@muted: #64748b;

.notes-panel {
  display: flex;
  height: 100%;
  min-height: 0;
  background: #fff;
}

/* —— 左侧栏 —— */
.doc-sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: @sidebar;
  border-right: 1px solid @border;
}

.sidebar-search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 12px 8px;
  padding: 0 10px;
  height: 34px;
  background: #fff;
  border: 1px solid @border;
  border-radius: 8px;

  i {
    color: @muted;
    font-size: 12px;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    color: @text;
    font-size: 13px;
    outline: none;

    &::placeholder {
      color: #94a3b8;
    }
  }

  &:focus-within {
    border-color: @accent;
    box-shadow: 0 0 0 2px rgba(32, 188, 86, 0.12);
  }
}

.sidebar-project {
  display: flex;
  gap: 6px;
  padding: 0 12px 10px;
  border-bottom: 1px solid @border;
}

.project-select {
  flex: 1;
  height: 30px;
  border: 1px solid @border;
  border-radius: 8px;
  background: #fff;
  color: @text;
  font-size: 12px;
  padding: 0 8px;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: @accent;
  }
}

.sidebar-tree {
  flex: 1;
  overflow: auto;
  padding: 8px 6px;
}

.tree-root,
:deep(.tree-children) {
  list-style: none;
  margin: 0;
  padding: 0;
}

:deep(.tree-children) {
  padding-left: 14px;
}

:deep(.tree-row) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  margin-bottom: 2px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #475569;
  border-left: 3px solid transparent;
  transition: background 0.12s, border-color 0.12s;

  > i:first-child {
    width: 14px;
    text-align: center;
    font-size: 12px;
    color: @muted;
    flex-shrink: 0;
  }

  &.is-folder > i:first-child {
    color: #f59e0b;
  }

  &:hover {
    background: #fff;

    .tree-del {
      opacity: 1;
    }
  }

  &.active {
    background: @accent-soft;
    border-left-color: @accent;
    color: #166534;
    font-weight: 500;

    > i:first-child {
      color: @accent;
    }

    .tree-del {
      opacity: 1;
    }
  }
}

:deep(.tree-label) {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.tree-del) {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: @muted;
  font-size: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s, background 0.12s, color 0.12s;

  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }
}

.tree-empty {
  padding: 24px 12px;
  text-align: center;

  p {
    margin: 0;
    font-size: 12px;
    color: @muted;
  }
}

.sidebar-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 8px;
  border-top: 1px solid @border;
}

.foot-icon {
  width: 36px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: @muted;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: #eef2f6;
    color: @text;
  }
}

/* —— 正文区 —— */
.doc-center {
  flex: 1;
  display: flex;
  min-width: 0;
  min-height: 0;
  position: relative;
  background: #fff;
  border-left: 1px solid @border;
}

.doc-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.doc-empty {
  align-items: center;
  justify-content: center;
  color: @muted;
  background: #fafbfc;

  i {
    font-size: 36px;
    margin-bottom: 10px;
    color: #cbd5e1;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.doc-article-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 20px 10px;
  border-bottom: 1px solid @border;
  background: #fafbfc;
  position: relative;
}

.doc-title-field {
  flex: 1;
  max-width: 560px;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: @text;
  outline: none;

  &::placeholder {
    color: #94a3b8;
  }
}

.doc-article-actions {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.head-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: @muted;
  cursor: pointer;

  &:hover,
  &.active {
    background: @accent-soft;
    color: @accent;
  }
}

.doc-article {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;

  &.mode-edit .md-preview {
    display: none;
  }

  &.mode-preview .md-source {
    display: none;
  }

  &.mode-split {
    .md-source {
      width: 50%;
      border-right: 1px solid @border;
    }
    .md-preview {
      width: 50%;
    }
  }
}

.md-source {
  flex: 1;
  border: none;
  resize: none;
  padding: 16px 20px;
  font-family: Consolas, 'Microsoft YaHei', monospace;
  font-size: 14px;
  line-height: 1.65;
  color: @text;
  background: #fafbfc;
  outline: none;
}

.md-preview {
  flex: 1;
  overflow: auto;
  padding: 16px 22px 24px;
  background: #fff;
}

/* —— 右侧目录 —— */
.doc-toc {
  width: 188px;
  flex-shrink: 0;
  background: #f8fafc;
  border-left: 1px solid @border;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid @border;
  font-size: 13px;
  font-weight: 600;
  color: @text;
}

.toc-close {
  border: none;
  background: none;
  color: @muted;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: @text;
  }
}

.toc-nav {
  flex: 1;
  overflow: auto;
  padding: 10px 0;
}

.toc-link {
  display: block;
  padding: 6px 14px;
  font-size: 12px;
  color: @muted;
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: color 0.12s, border-color 0.12s, background 0.12s;

  &:hover {
    color: #166534;
    background: @accent-soft;
    border-left-color: @accent;
  }

  &.level-1 {
    font-weight: 600;
    color: @text;
  }

  &.level-2 {
    padding-left: 22px;
  }

  &.level-3 {
    padding-left: 30px;
    font-size: 11px;
  }
}

.toc-slide-enter-active,
.toc-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.toc-slide-enter,
.toc-slide-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

/* —— 弹窗 —— */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 360px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);

  h3 {
    margin: 0 0 16px;
    color: @text;
    font-size: 17px;
  }
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.btn-outline {
  border: 1px solid @border;
  background: #fff;
  color: @muted;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
}

.btn-primary {
  border: none;
  background: @accent;
  color: #fff;
  border-radius: 8px;
  padding: 8px 18px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 900px) {
  .notes-panel {
    flex-direction: column;
  }

  .doc-sidebar {
    width: 100%;
    max-height: min(36vh, 260px);
    min-height: 168px;
    border-right: none;
    border-bottom: 1px solid @border;
  }

  .doc-center {
    border-left: none;
  }

  .doc-toc {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    width: min(220px, 78vw);
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
  }
}

@media (max-width: 768px) {
  .sidebar-search {
    margin: 10px 10px 6px;
    height: 32px;
  }

  .sidebar-project {
    padding: 0 10px 8px;
  }

  .doc-article-head {
    padding: 10px 12px 8px;
  }

  .doc-title-field {
    font-size: 16px;
    padding-right: 36px;
  }

  .doc-article-actions {
    right: 8px;
  }

  .doc-article.mode-split {
    flex-direction: column;

    .md-source,
    .md-preview {
      width: 100%;
      min-height: 34vh;
      max-height: 42vh;
    }

    .md-source {
      border-right: none;
      border-bottom: 1px solid @border;
    }
  }

  .md-source,
  .md-preview {
    padding: 12px 14px;
    font-size: 13px;
  }

  .modal-card {
    width: calc(100vw - 32px);
    max-width: 360px;
    margin: 0 16px;
    padding: 18px 16px;
    border-radius: 0;
  }

  .modal-foot {
    flex-direction: column-reverse;

    .btn-outline,
    .btn-primary {
      width: 100%;
      text-align: center;
    }
  }
}
</style>

<style lang="less">
.doc-center .markdown-body {
  color: #334155;
  font-size: 14px;
  line-height: 1.75;

  h1, h2, h3, h4 {
    color: #1e293b;
    font-weight: 700;
    margin-top: 1.2em;
    margin-bottom: 0.5em;
    scroll-margin-top: 12px;
  }

  h1 {
    font-size: 1.45em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #e2e8f0;
  }

  h2 { font-size: 1.2em; }
  h3 { font-size: 1.05em; }

  p { margin: 0.7em 0; }

  a {
    color: #20bc56;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  ul, ol { padding-left: 1.5em; }

  pre {
    background: #f6f8fa;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 14px;
    overflow: auto;
    margin: 12px 0;
  }

  code {
    font-family: Consolas, Monaco, monospace;
    font-size: 0.9em;
  }

  p code, li code, td code {
    background: #f1f5f9;
    color: #0f766e;
    padding: 2px 6px;
    border-radius: 4px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 13px;
  }

  th {
    background: #f0fdf4;
    color: #166534;
    font-weight: 600;
  }

  th, td {
    border: 1px solid #e2e8f0;
    padding: 8px 10px;
  }

  blockquote {
    margin: 12px 0;
    padding: 8px 14px;
    border-left: 4px solid #20bc56;
    background: #f0fdf4;
    color: #64748b;
    border-radius: 0 6px 6px 0;
  }

  img {
    max-width: 100%;
    border-radius: 6px;
  }

  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0;
  }
}
</style>
