<template>
  <div class="notes-panel" @click="closePopovers">
    <aside class="doc-sidebar">
      <div class="sidebar-search">
        <AppIcon name="search" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索标题"
          autocomplete="off"
        />
        <button
          v-if="searchKeyword"
          type="button"
          class="search-clear"
          title="清除"
          aria-label="清除搜索"
          @click="searchKeyword = ''"
        >
          <AppIcon name="times" />
        </button>
      </div>

      <div class="sidebar-project">
        <div class="project-picker" :class="{ open: projectMenuOpen }">
          <button
            type="button"
            class="project-trigger"
            :title="currentProjectName"
            @click.stop="toggleProjectMenu"
          >
            <span class="project-trigger__icon">
              <AppIcon name="folder" />
            </span>
            <span class="project-trigger__name">{{ currentProjectName }}</span>
            <AppIcon class="project-trigger__caret" name="chevron-down" />
          </button>
          <ul v-if="projectMenuOpen" class="project-menu" @click.stop>
            <li
              v-for="p in projects"
              :key="p.id"
              class="project-menu__item"
              :class="{ active: Number(p.id) === Number(currentProjectId) }"
              @click="chooseProject(p)"
            >
              <AppIcon name="folder" />
              <span>{{ p.name }}</span>
            </li>
            <li v-if="!projects.length" class="project-menu__empty">暂无项目</li>
            <li
              v-if="currentProjectId"
              class="project-menu__item project-menu__item--danger"
              @click="askDeleteProject"
            >
              <AppIcon name="trash-alt" />
              <span>删除当前项目</span>
            </li>
          </ul>
        </div>
        <button type="button" class="foot-icon" title="新建项目" @click.stop="showProjectModal = true">
          <AppIcon name="folder-plus" />
        </button>
      </div>

      <div class="sidebar-tree">
        <ul v-if="treeRoots.length" class="tree-root">
          <DocTreeNode
            v-for="node in treeRoots"
            :key="node.id"
            :node="node"
            :active-id="activePageId"
            :expanded-ids="expandedIds"
            :dragging-id="draggingId"
            :drop-hint="dropHint"
            :renaming-id="renamingId"
            :rename-draft="renameDraft"
            :keyword="searchKeyword"
            @select="selectPage"
            @toggle="toggleFolder"
            @contextmenu="openContextMenu"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
            @drag-over="onDragOver"
            @drop-node="onDropNode"
            @rename-input="renameDraft = $event"
            @rename-commit="commitRename"
            @rename-cancel="cancelRename"
          />
        </ul>
        <div v-else class="tree-empty">
          <p>{{ searchKeyword ? '无匹配页面' : '暂无文档' }}</p>
        </div>
      </div>

      <div class="sidebar-foot">
        <button type="button" class="foot-icon" title="新建页面" @click="openPageModal">
          <AppIcon name="plus" />
        </button>
        <button type="button" class="foot-icon" title="新建目录" @click="openFolderModal">
          <AppIcon name="folder-plus" />
        </button>
        <span class="foot-sep" aria-hidden="true" />
        <button type="button" class="foot-icon" title="导入 / 导出" @click="showBackupModal = true">
          <AppIcon name="download" />
        </button>
        <button type="button" class="foot-icon" title="AI 设置" @click="openAiSettings">
          <AppIcon name="cog" />
        </button>
        <input
          ref="importInput"
          type="file"
          accept="application/json,.json"
          class="import-input"
          multiple
          @change="onImportFiles"
        />
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
              <AppIcon name="list-ul"  />
            </button>
          </div>
        </header>

        <div class="doc-article" :class="`mode-${viewMode}`">
          <MarkdownEditor
            v-show="viewMode !== 'preview'"
            v-model="editContent"
            class="md-source"
            :page-title="editTitle"
            @open-settings="openAiSettings"
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
        <div class="doc-empty__icon">
          <AppIcon :name="activePage && activePage.kind === 'folder' ? 'folder-open' : 'file-alt'" />
        </div>
        <p v-if="activePage && activePage.kind === 'folder'" class="doc-empty__title">
          目录「{{ activePage.title }}」
        </p>
        <p v-else class="doc-empty__title">选择左侧文档开始阅读</p>
        <p class="doc-empty__hint">
          {{ activePage && activePage.kind === 'folder' ? '可在底部新建子页面或子目录' : '点击文章后默认进入预览模式' }}
        </p>
      </main>

      <transition name="toc-slide">
        <aside v-if="tocOpen && headings.length" class="doc-toc">
          <div class="toc-head">
            <span>目录</span>
            <button type="button" class="toc-close" @click="tocOpen = false">
              <AppIcon name="times"  />
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

    <!-- 新建项目 -->
    <div v-if="showProjectModal" class="doc-modal-mask" @click.self="closeProjectModal">
      <div class="doc-modal" role="dialog" aria-labelledby="modal-project-title">
        <div class="doc-modal-icon doc-modal-icon--project">
          <AppIcon name="folder-plus" />
        </div>
        <h3 id="modal-project-title" class="doc-modal-title">新建项目</h3>
        <p class="doc-modal-desc">创建独立笔记空间，文档与目录按项目分开管理</p>
        <div class="doc-modal-form">
          <label class="field-label">项目名称 <span class="required">*</span></label>
          <input
            ref="projectNameInput"
            v-model="newProjectName"
            type="text"
            class="field-input"
            placeholder="例如：学习笔记、工作文档"
            maxlength="40"
            @keyup.enter="createProject"
          />
          <label class="field-label">项目描述</label>
          <input
            v-model="newProjectDesc"
            type="text"
            class="field-input"
            placeholder="可选，简要说明用途"
            maxlength="80"
          />
        </div>
        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" @click="closeProjectModal">取消</button>
          <button type="button" class="btn-primary" :disabled="creating || !newProjectName.trim()" @click="createProject">
            <AppIcon v-if="creating" name="spinner fa-spin" />
            {{ creating ? '创建中…' : '创建项目' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 新建页面 -->
    <div v-if="showPageModal" class="doc-modal-mask" @click.self="closePageModal">
      <div class="doc-modal" role="dialog" aria-labelledby="modal-page-title">
        <div class="doc-modal-icon doc-modal-icon--page">
          <AppIcon name="file-alt" />
        </div>
        <h3 id="modal-page-title" class="doc-modal-title">新建页面</h3>
        <p class="doc-modal-desc">将创建 Markdown 文档页面</p>
        <div class="doc-modal-form">
          <div class="field-hint">
            <AppIcon name="folder-open" />
            <span>位置：{{ parentLabel }}</span>
          </div>
          <label class="field-label">页面标题 <span class="required">*</span></label>
          <input
            ref="pageTitleInput"
            v-model="newPageTitle"
            type="text"
            class="field-input"
            placeholder="输入页面标题"
            maxlength="60"
            @keyup.enter="submitNewPage"
          />
        </div>
        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" @click="closePageModal">取消</button>
          <button type="button" class="btn-primary" :disabled="creating || !newPageTitle.trim()" @click="submitNewPage">
            <AppIcon v-if="creating" name="spinner fa-spin" />
            {{ creating ? '创建中…' : '创建页面' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 新建目录 -->
    <div v-if="showFolderModal" class="doc-modal-mask" @click.self="closeFolderModal">
      <div class="doc-modal" role="dialog" aria-labelledby="modal-folder-title">
        <div class="doc-modal-icon doc-modal-icon--folder">
          <AppIcon name="folder" />
        </div>
        <h3 id="modal-folder-title" class="doc-modal-title">新建目录</h3>
        <p class="doc-modal-desc">用于分组整理多个页面</p>
        <div class="doc-modal-form">
          <div class="field-hint">
            <AppIcon name="folder-open" />
            <span>位置：{{ parentLabel }}</span>
          </div>
          <label class="field-label">目录名称 <span class="required">*</span></label>
          <input
            ref="folderTitleInput"
            v-model="newFolderTitle"
            type="text"
            class="field-input"
            placeholder="输入目录名称"
            maxlength="40"
            @keyup.enter="submitNewFolder"
          />
        </div>
        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" @click="closeFolderModal">取消</button>
          <button type="button" class="btn-primary" :disabled="creating || !newFolderTitle.trim()" @click="submitNewFolder">
            <AppIcon v-if="creating" name="spinner fa-spin" />
            {{ creating ? '创建中…' : '创建目录' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="showDeleteModal" class="doc-modal-mask" @click.self="closeDeleteModal">
      <div class="doc-modal doc-modal--danger" role="dialog" aria-labelledby="modal-delete-title">
        <div class="doc-modal-icon doc-modal-icon--danger">
          <AppIcon name="trash-alt" />
        </div>
        <h3 id="modal-delete-title" class="doc-modal-title">确认删除</h3>
        <p class="doc-modal-desc">
          <template v-if="deleteKind === 'project'">
            确定删除项目「{{ deleteTarget?.title }}」及其全部笔记吗？
          </template>
          <template v-else>
            确定删除「{{ deleteTarget?.title }}」{{ deleteTarget?.kind === 'folder' ? '及其全部子项' : '' }}吗？
          </template>
          <br />
          <span class="doc-modal-warn">此操作不可恢复</span>
        </p>
        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" :disabled="deleting" @click="closeDeleteModal">取消</button>
          <button type="button" class="btn-danger" :disabled="deleting" @click="confirmDelete">
            <AppIcon v-if="deleting" name="spinner" spin />
            {{ deleting ? '删除中…' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>


    <!-- 导入导出 -->
    <div v-if="showBackupModal" class="doc-modal-mask" @click.self="closeBackupModal">
      <div class="doc-modal doc-modal--wide" role="dialog" aria-labelledby="modal-backup-title">
        <div class="doc-modal-icon doc-modal-icon--project">
          <AppIcon name="download" />
        </div>
        <h3 id="modal-backup-title" class="doc-modal-title">导入 / 导出</h3>
        <p class="doc-modal-desc">支持当前项目或全部笔记；可一次选择多个备份文件导入</p>

        <div class="backup-section">
          <h4 class="backup-section__title">导出</h4>
          <div class="backup-actions">
            <button type="button" class="backup-btn" :disabled="backupBusy" @click="doExport('current')">
              <AppIcon name="file-alt" />
              <span>导出当前项目</span>
            </button>
            <button type="button" class="backup-btn" :disabled="backupBusy" @click="doExport('all')">
              <AppIcon name="folder" />
              <span>导出全部笔记</span>
            </button>
          </div>
        </div>

        <div class="backup-section">
          <h4 class="backup-section__title">导入</h4>
          <p class="backup-hint">兼容单项目（v1）与全量备份（v2），多文件将逐个导入并让出主线程</p>
          <div class="backup-actions">
            <button type="button" class="backup-btn backup-btn--primary" :disabled="backupBusy" @click="triggerImport">
              <AppIcon name="upload" />
              <span>{{ backupBusy ? backupProgress : '选择备份文件…' }}</span>
            </button>
          </div>
        </div>

        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" :disabled="backupBusy" @click="closeBackupModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- DeepSeek AI 秘钥 -->
    <div v-if="showAiSettingsModal" class="doc-modal-mask" @click.self="closeAiSettings">
      <div class="doc-modal" role="dialog" aria-labelledby="modal-ai-title">
        <div class="doc-modal-icon doc-modal-icon--page">
          <AppIcon name="magic" />
        </div>
        <h3 id="modal-ai-title" class="doc-modal-title">DeepSeek AI 设置</h3>
        <p class="doc-modal-desc">秘钥仅保存在你的账号笔记设置中，优先于服务器环境变量</p>
        <div class="doc-modal-form">
          <label class="field-label">API Key</label>
          <input
            v-model="deepseekApiKey"
            type="password"
            class="field-input"
            autocomplete="off"
            placeholder="sk-…"
            @keydown.enter.prevent="saveAiSettings"
          />
          <p class="ai-settings-hint">
            可在
            <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer">DeepSeek 控制台</a>
            创建秘钥。留空并保存可清除个人秘钥。
          </p>
        </div>
        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" :disabled="aiSettingsSaving" @click="closeAiSettings">取消</button>
          <button type="button" class="btn-primary" :disabled="aiSettingsSaving" @click="saveAiSettings">
            {{ aiSettingsSaving ? '保存中…' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 分享 -->
    <div v-if="showShareModal" class="doc-modal-mask" @click.self="closeShareModal">
      <div class="doc-modal" role="dialog" aria-labelledby="modal-share-title">
        <div class="doc-modal-icon doc-modal-icon--page">
          <AppIcon name="share-alt" />
        </div>
        <h3 id="modal-share-title" class="doc-modal-title">分享笔记</h3>
        <p class="doc-modal-desc">「{{ shareTarget?.title }}」· 可设置链接时效</p>
        <div class="doc-modal-form">
          <label class="field-label">有效期</label>
          <div class="share-expiry">
            <button
              v-for="opt in shareExpiryOptions"
              :key="opt.value"
              type="button"
              class="share-expiry__btn"
              :class="{ active: shareExpiresIn === opt.value }"
              @click="shareExpiresIn = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <label v-if="shareUrl" class="field-label">分享链接</label>
          <div v-if="shareUrl" class="share-url-box">
            <input class="field-input" :value="shareUrl" readonly @focus="$event.target.select()" />
            <button type="button" class="btn-primary share-copy" @click="copyShareUrl">复制</button>
          </div>
        </div>
        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" @click="closeShareModal">关闭</button>
          <button type="button" class="btn-primary" :disabled="sharing" @click="createShareLink">
            <AppIcon v-if="sharing" name="spinner" spin />
            {{ shareUrl ? '重新生成' : '生成链接' }}
          </button>
        </div>
      </div>
    </div>

    <teleport to="body">
      <ul
        v-if="contextMenu.visible"
        class="doc-ctx-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <li @click="ctxOpen">
          <AppIcon name="folder-open" />
          <span>打开</span>
        </li>
        <li @click="ctxRename">
          <AppIcon name="edit" />
          <span>重命名</span>
        </li>
        <li v-if="contextMenu.node && contextMenu.node.kind === 'page'" @click="ctxShare">
          <AppIcon name="share-alt" />
          <span>分享</span>
        </li>
        <li class="danger" @click="ctxDelete">
          <AppIcon name="trash-alt" />
          <span>删除</span>
        </li>
      </ul>
    </teleport>
  </div>
</template>

<script>
import {
  fetchProjects,
  createProject,
  deleteProject,
  fetchPages,
  createPage,
  fetchPage,
  updatePage,
  deletePage,
  createShare,
  exportProject,
  exportAllNotes,
  importNotes,
  fetchNotesSettings,
  updateNotesSettings,
} from '@/services/notesApi'
import { renderMarkdown, extractHeadings } from '@/utils/markdown'
import { fetchFileBlob } from '@/services/filesApi'
import DocTreeNode from '@/components/docs/DocTreeNode.vue'
import MarkdownEditor from '@/components/docs/MarkdownEditor.vue'

function buildTree(pages, parentId = 0) {
  const pid = Number(parentId) || 0
  return pages
    .filter((p) => Number(p.parentId) === pid)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map((p) => ({
      ...p,
      children: buildTree(pages, p.id),
    }))
}

function normalizePage(raw) {
  if (!raw) return null
  const id = Number(raw.id)
  if (!Number.isFinite(id)) return null
  const kindRaw = String(raw.kind || raw.type || 'page').toLowerCase()
  return {
    ...raw,
    id,
    projectId: Number(raw.projectId ?? raw.project_id) || 0,
    parentId: Number(raw.parentId ?? raw.parent_id) || 0,
    kind: kindRaw === 'folder' ? 'folder' : 'page',
    title: String(raw.title || '未命名'),
    sort: Number(raw.sort) || 0,
  }
}

function normalizeProjectId(id) {
  const n = Number(id)
  return Number.isFinite(n) && n > 0 ? n : null
}

export default {
  name: 'NotesPanel',
  components: { DocTreeNode, MarkdownEditor },
  data() {
    return {
      projects: [],
      pages: [],
      currentProjectId: null,
      activePageId: null,
      activePage: null,
      editTitle: '',
      editContent: '',
      viewMode: 'preview',
      saving: false,
      creating: false,
      showProjectModal: false,
      showPageModal: false,
      showFolderModal: false,
      newProjectName: '',
      newProjectDesc: '',
      newPageTitle: '',
      newFolderTitle: '',
      searchKeyword: '',
      tocOpen: true,
      projectMenuOpen: false,
      expandedIds: {},
      draggingId: null,
      dropHint: null,
      showDeleteModal: false,
      deleteTarget: null,
      deleting: false,
      deleteKind: 'page',
      showShareModal: false,
      shareTarget: null,
      shareExpiresIn: '7d',
      shareExpiryOptions: [
        { value: '1h', label: '1 小时' },
        { value: '24h', label: '24 小时' },
        { value: '7d', label: '7 天' },
        { value: '30d', label: '30 天' },
        { value: 'forever', label: '永久' },
      ],
      shareUrl: '',
      sharing: false,
      showBackupModal: false,
      backupBusy: false,
      backupProgress: '',
      showAiSettingsModal: false,
      deepseekApiKey: '',
      aiSettingsSaving: false,
      renamingId: null,
      renameDraft: '',
      renameSaving: false,
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        node: null,
      },
      _fileBlobUrls: [],
    }
  },
  computed: {
    filteredPages() {
      const k = this.searchKeyword.trim().toLowerCase()
      if (!k) return this.pages
      const matched = this.pages.filter((p) => p.title.toLowerCase().includes(k))
      const keep = new Set(matched.map((p) => Number(p.id)))
      matched.forEach((p) => {
        let pid = Number(p.parentId) || 0
        while (pid) {
          if (keep.has(pid)) break
          keep.add(pid)
          const parent = this.pages.find((x) => Number(x.id) === pid)
          if (!parent) break
          pid = Number(parent.parentId) || 0
        }
      })
      return this.pages.filter((p) => keep.has(Number(p.id)))
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
    parentLabel() {
      const pid = this.parentForNew()
      if (!pid) return '根目录'
      const node = this.pages.find((p) => p.id === pid)
      return node ? `「${node.title}」下` : '根目录'
    },
    currentProjectName() {
      const id = normalizeProjectId(this.currentProjectId)
      const p = this.projects.find((x) => Number(x.id) === id)
      return p?.name || '选择项目'
    },
  },
  watch: {
    showProjectModal(open) {
      if (open) {
        this.$nextTick(() => this.$refs.projectNameInput?.focus())
      }
    },
    showPageModal(open) {
      if (open) {
        this.$nextTick(() => this.$refs.pageTitleInput?.focus())
      }
    },
    showFolderModal(open) {
      if (open) {
        this.$nextTick(() => this.$refs.folderTitleInput?.focus())
      }
    },
    viewMode(mode) {
      this.$emit('view-mode-change', mode)
      this.$nextTick(() => this.hydratePreviewFiles())
    },
    editContent() {
      if (this.viewMode === 'edit') return
      clearTimeout(this._hydrateTimer)
      this._hydrateTimer = setTimeout(() => this.hydratePreviewFiles(), 300)
    },
    headings(list) {
      if (!list.length) this.tocOpen = false
    },
    searchKeyword(k) {
      const key = String(k || '').trim()
      if (!key) return
      const next = { ...this.expandedIds }
      this.filteredPages.forEach((p) => {
        if (p.kind === 'folder') next[p.id] = true
      })
      this.expandedIds = next
    },
  },
  mounted() {
    this.loadProjects().then(() => this.openSharedPage())
    this.$emit('view-mode-change', this.viewMode)
    this._onWinClick = () => this.closePopovers()
    window.addEventListener('click', this._onWinClick)
    this.$nextTick(() => this.hydratePreviewFiles())
  },
  beforeUnmount() {
    window.removeEventListener('click', this._onWinClick)
    clearTimeout(this._hydrateTimer)
    this.revokeFileBlobs()
  },
  methods: {
    revokeFileBlobs() {
      ;(this._fileBlobUrls || []).forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch {
          /* ignore */
        }
      })
      this._fileBlobUrls = []
    },
    async hydratePreviewFiles() {
      const root = this.$refs.mdPreview
      if (!root || this.viewMode === 'edit') return
      this.revokeFileBlobs()
      const nodes = root.querySelectorAll('[data-doniai-file]')
      for (const el of nodes) {
        const path = el.getAttribute('data-doniai-file')
        if (!path) continue
        try {
          const res = await fetchFileBlob(path)
          const blob = new Blob([res.data])
          const url = URL.createObjectURL(blob)
          this._fileBlobUrls.push(url)
          if (el.tagName === 'IMG') {
            el.src = url
          } else if (el.tagName === 'A') {
            el.href = url
            el.target = '_blank'
            el.rel = 'noopener noreferrer'
            el.addEventListener(
              'click',
              (e) => {
                // allow download/open of blob
                if (!el.getAttribute('download')) {
                  el.setAttribute('download', path.split('/').pop() || 'file')
                }
              },
              { once: true },
            )
          }
        } catch {
          if (el.tagName === 'IMG') {
            el.alt = `${el.alt || '文件'}（加载失败）`
          }
        }
      }
    },
    setViewMode(mode) {
      this.viewMode = mode
    },
    emitProjectName() {
      const id = normalizeProjectId(this.currentProjectId)
      const p = this.projects.find((x) => x.id === id)
      this.$emit('project-change', p?.name || '云笔记')
    },
    closeProjectModal() {
      this.showProjectModal = false
      this.newProjectName = ''
      this.newProjectDesc = ''
    },
    closePageModal() {
      this.showPageModal = false
      this.newPageTitle = ''
    },
    closeFolderModal() {
      this.showFolderModal = false
      this.newFolderTitle = ''
    },
    openPageModal() {
      if (!normalizeProjectId(this.currentProjectId)) {
        this.$toast.open({ message: '请先选择或创建项目', type: 'is-warning' })
        return
      }
      this.newPageTitle = ''
      this.showPageModal = true
    },
    openFolderModal() {
      if (!normalizeProjectId(this.currentProjectId)) {
        this.$toast.open({ message: '请先选择或创建项目', type: 'is-warning' })
        return
      }
      this.newFolderTitle = ''
      this.showFolderModal = true
    },
    async loadProjects() {
      try {
        const { data } = await fetchProjects()
        if (data?.ok) {
          this.projects = data.projects || []
          const cur = normalizeProjectId(this.currentProjectId)
          const exists = cur && this.projects.some((p) => p.id === cur)
          if (exists) {
            this.currentProjectId = cur
          } else if (this.projects.length) {
            this.currentProjectId = this.projects[0].id
          } else {
            this.currentProjectId = null
            this.pages = []
          }
          if (this.currentProjectId) {
            await this.loadPages()
          }
          this.emitProjectName()
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '加载项目失败', type: 'is-danger' })
      }
    },
    async onProjectChange() {
      this.currentProjectId = normalizeProjectId(this.currentProjectId)
      this.activePageId = null
      this.activePage = null
      await this.loadPages()
      this.seedExpanded()
      this.emitProjectName()
    },
    toggleProjectMenu() {
      this.projectMenuOpen = !this.projectMenuOpen
      this.contextMenu.visible = false
    },
    async chooseProject(p) {
      this.projectMenuOpen = false
      if (Number(p.id) === Number(this.currentProjectId)) return
      this.currentProjectId = Number(p.id)
      await this.onProjectChange()
    },
    closePopovers() {
      this.projectMenuOpen = false
      this.contextMenu.visible = false
    },
    async openSharedPage() {
      const pageId = Number(this.$route?.query?.page)
      if (!pageId) return
      const local = this.pages.find((p) => Number(p.id) === pageId)
      if (local) {
        await this.selectPage(local)
        return
      }
      await this.selectPage({ id: pageId, kind: 'page', title: '' })
    },
    seedExpanded() {
      const next = { ...this.expandedIds }
      this.pages.forEach((p) => {
        if (p.kind === 'folder' && next[p.id] === undefined) next[p.id] = true
      })
      this.expandedIds = next
    },
    toggleFolder(id) {
      this.expandedIds = {
        ...this.expandedIds,
        [id]: !this.expandedIds[id],
      }
    },
    onDragStart(id) {
      this.draggingId = id
      this.contextMenu.visible = false
    },
    onDragEnd() {
      this.draggingId = null
      this.dropHint = null
    },
    onDragOver(hint) {
      this.dropHint = hint
    },
    isDescendant(nodeId, ancestorId) {
      let cur = this.pages.find((p) => Number(p.id) === Number(nodeId))
      const guard = new Set()
      while (cur) {
        const pid = Number(cur.parentId) || 0
        if (!pid) return false
        if (pid === Number(ancestorId)) return true
        if (guard.has(pid)) return false
        guard.add(pid)
        cur = this.pages.find((p) => Number(p.id) === pid)
      }
      return false
    },
    async onDropNode({ dragId, targetId, position }) {
      this.dropHint = null
      this.draggingId = null
      const drag = this.pages.find((p) => Number(p.id) === Number(dragId))
      const target = this.pages.find((p) => Number(p.id) === Number(targetId))
      if (!drag || !target || Number(dragId) === Number(targetId)) return
      if (drag.kind === 'folder' && this.isDescendant(targetId, dragId)) {
        this.$toast.open({ message: '不能移动到自己的子目录中', type: 'is-warning' })
        return
      }

      let newParentId = 0
      let ordered = []

      if (position === 'inside' && target.kind === 'folder') {
        newParentId = Number(target.id)
        ordered = this.pages
          .filter((p) => Number(p.parentId) === newParentId && Number(p.id) !== Number(dragId))
          .sort((a, b) => (a.sort || 0) - (b.sort || 0))
        ordered.push(drag)
        this.expandedIds = { ...this.expandedIds, [target.id]: true }
      } else {
        newParentId = Number(target.parentId) || 0
        ordered = this.pages
          .filter((p) => Number(p.parentId) === newParentId && Number(p.id) !== Number(dragId))
          .sort((a, b) => (a.sort || 0) - (b.sort || 0))
        const idx = ordered.findIndex((p) => Number(p.id) === Number(targetId))
        const insertAt = position === 'before' ? Math.max(idx, 0) : idx + 1
        ordered.splice(insertAt, 0, drag)
      }

      const updates = ordered.map((p, i) => ({
        id: Number(p.id),
        parentId: newParentId,
        sort: i,
      }))

      try {
        await Promise.all(
          updates
            .filter((u) => {
              const cur = this.pages.find((p) => Number(p.id) === u.id)
              return !cur || Number(cur.parentId) !== u.parentId || Number(cur.sort || 0) !== u.sort
            })
            .map((u) => updatePage(u.id, { parentId: u.parentId, sort: u.sort })),
        )
        await this.loadPages()
      } catch (e) {
        this.$toast.open({ message: e?.msg || '移动失败', type: 'is-danger' })
        await this.loadPages()
      }
    },
    openContextMenu(node, event) {
      event?.stopPropagation?.()
      this.projectMenuOpen = false
      const pad = 8
      const menuW = 160
      const menuH = 168
      let x = event.clientX
      let y = event.clientY
      if (x + menuW > window.innerWidth - pad) x = window.innerWidth - menuW - pad
      if (y + menuH > window.innerHeight - pad) y = window.innerHeight - menuH - pad
      this.contextMenu = {
        visible: true,
        x,
        y,
        node,
      }
    },
    ctxOpen() {
      const node = this.contextMenu.node
      this.contextMenu.visible = false
      if (!node) return
      if (node.kind === 'folder') {
        this.expandedIds = { ...this.expandedIds, [node.id]: true }
        this.activePageId = Number(node.id)
        this.activePage = normalizePage(node)
        return
      }
      this.selectPage(node)
    },
    ctxRename() {
      const node = this.contextMenu.node
      this.contextMenu.visible = false
      if (!node) return
      this.startRename(node)
    },
    startRename(node) {
      this.renamingId = Number(node.id)
      this.renameDraft = node.title
      this.contextMenu.visible = false
    },
    cancelRename() {
      this.renamingId = null
      this.renameDraft = ''
      this.renameSaving = false
    },
    async commitRename() {
      if (this.renameSaving) return
      const id = Number(this.renamingId)
      if (!id) return
      const title = this.renameDraft.trim()
      const target = this.pages.find((p) => Number(p.id) === id)
      this.renamingId = null
      this.renameDraft = ''
      if (!target) return
      if (!title || title === target.title) return
      this.renameSaving = true
      try {
        const { data } = await updatePage(id, { title })
        if (data?.ok) {
          if (Number(this.activePageId) === id) {
            this.editTitle = title
            if (this.activePage) this.activePage = { ...this.activePage, title }
          }
          await this.loadPages()
          this.$toast.open({ message: '已重命名', type: 'is-success' })
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '重命名失败', type: 'is-danger' })
      } finally {
        this.renameSaving = false
      }
    },
    ctxShare() {
      const node = this.contextMenu.node
      this.contextMenu.visible = false
      if (!node || node.kind !== 'page') return
      this.shareTarget = node
      this.shareExpiresIn = '7d'
      this.shareUrl = ''
      this.showShareModal = true
    },
    closeShareModal() {
      this.showShareModal = false
      this.shareTarget = null
      this.shareUrl = ''
      this.sharing = false
    },
    async createShareLink() {
      if (!this.shareTarget || this.sharing) return
      this.sharing = true
      try {
        const { data } = await createShare(Number(this.shareTarget.id), {
          expiresIn: this.shareExpiresIn,
        })
        if (data?.ok && data.share?.token) {
          this.shareUrl = `${window.location.origin}/docs/s/${data.share.token}`
          this.$toast.open({ message: '分享链接已生成', type: 'is-success' })
        } else {
          this.$toast.open({ message: data?.message || '生成失败', type: 'is-danger' })
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '生成失败', type: 'is-danger' })
      } finally {
        this.sharing = false
      }
    },
    async copyShareUrl() {
      if (!this.shareUrl) return
      try {
        await navigator.clipboard.writeText(this.shareUrl)
        this.$toast.open({ message: '链接已复制', type: 'is-success' })
      } catch {
        this.$toast.open({ message: this.shareUrl, type: 'is-info', duration: 5000 })
      }
    },
    ctxDelete() {
      const node = this.contextMenu.node
      this.contextMenu.visible = false
      if (node) this.removePage(node)
    },
    askDeleteProject() {
      this.projectMenuOpen = false
      const id = normalizeProjectId(this.currentProjectId)
      const p = this.projects.find((x) => Number(x.id) === id)
      if (!p) return
      this.deleteKind = 'project'
      this.deleteTarget = { id: p.id, title: p.name, kind: 'project' }
      this.showDeleteModal = true
    },
    closeBackupModal() {
      if (this.backupBusy) return
      this.showBackupModal = false
      this.backupProgress = ''
    },
    async openAiSettings() {
      this.showAiSettingsModal = true
      try {
        const { data } = await fetchNotesSettings()
        if (data?.ok && data.settings) {
          this.deepseekApiKey = data.settings.deepseekApiKey || ''
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '加载设置失败', type: 'is-danger' })
      }
    },
    closeAiSettings() {
      if (this.aiSettingsSaving) return
      this.showAiSettingsModal = false
    },
    async saveAiSettings() {
      if (this.aiSettingsSaving) return
      this.aiSettingsSaving = true
      try {
        const { data } = await updateNotesSettings({
          deepseekApiKey: this.deepseekApiKey.trim(),
        })
        if (!data?.ok) {
          this.$toast.open({ message: data?.message || '保存失败', type: 'is-danger' })
          return
        }
        this.deepseekApiKey = data.settings?.deepseekApiKey || this.deepseekApiKey.trim()
        this.showAiSettingsModal = false
        this.$toast.open({
          message: this.deepseekApiKey ? 'DeepSeek 秘钥已保存' : '已清除个人秘钥',
          type: 'is-success',
        })
      } catch (e) {
        this.$toast.open({ message: e?.msg || '保存失败', type: 'is-danger' })
      } finally {
        this.aiSettingsSaving = false
      }
    },
    downloadJson(obj, filename) {
      const json = JSON.stringify(obj)
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    safeFileName(name) {
      return String(name || 'notes').replace(/[\\/:*?"<>|]/g, '_')
    },
    async doExport(scope) {
      if (this.backupBusy) return
      this.backupBusy = true
      this.backupProgress = '导出中…'
      try {
        let data
        let filename
        if (scope === 'all') {
          ;({ data } = await exportAllNotes())
          filename = `doniai-notes-all-${new Date().toISOString().slice(0, 10)}.json`
        } else {
          const projectId = normalizeProjectId(this.currentProjectId)
          if (!projectId) {
            this.$toast.open({ message: '请先选择项目', type: 'is-warning' })
            return
          }
          ;({ data } = await exportProject(projectId))
          const name = this.safeFileName(data?.export?.project?.name || this.currentProjectName)
          filename = `${name}-${new Date().toISOString().slice(0, 10)}.json`
        }
        if (!data?.ok || !data.export) {
          this.$toast.open({ message: data?.message || '导出失败', type: 'is-danger' })
          return
        }
        // 大文件用紧凑 JSON，减小体积与序列化耗时
        this.downloadJson(data.export, filename)
        const tip =
          scope === 'all'
            ? `已导出全部笔记（${data.export.projects?.length || 0} 个项目）`
            : '当前项目已导出'
        this.$toast.open({ message: tip, type: 'is-success' })
      } catch (e) {
        this.$toast.open({ message: e?.msg || '导出失败', type: 'is-danger' })
      } finally {
        this.backupBusy = false
        this.backupProgress = ''
      }
    },
    triggerImport() {
      this.$refs.importInput?.click()
    },
    yieldToMain() {
      return new Promise((resolve) => {
        if (typeof requestIdleCallback === 'function') {
          requestIdleCallback(() => resolve(), { timeout: 50 })
        } else {
          setTimeout(resolve, 0)
        }
      })
    },
    isValidBackup(payload) {
      if (!payload || typeof payload !== 'object') return false
      if (payload.format === 'doniai-notes-v2') {
        return Array.isArray(payload.projects) && payload.projects.length > 0
      }
      if (payload.format === 'doniai-notes-v1' || !payload.format) {
        if (payload.project && (Array.isArray(payload.pages) || Array.isArray(payload.project.pages))) {
          return true
        }
        return Array.isArray(payload.projects) && payload.projects.length > 0
      }
      return false
    },
    async onImportFiles(e) {
      const files = Array.from(e.target.files || [])
      e.target.value = ''
      if (!files.length) return

      this.backupBusy = true
      let okCount = 0
      let failCount = 0
      let lastProjectId = null
      let totalPages = 0

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          this.backupProgress = `导入中 ${i + 1}/${files.length}：${file.name}`
          await this.yieldToMain()
          try {
            // 超过 8MB 的文件分片读会影响体验，这里直接 text；后端 O(n) 导入
            if (file.size > 30 * 1024 * 1024) {
              failCount += 1
              this.$toast.open({ message: `${file.name} 超过 30MB，已跳过`, type: 'is-warning' })
              continue
            }
            const raw = await file.text()
            await this.yieldToMain()
            const payload = JSON.parse(raw)
            if (!this.isValidBackup(payload)) {
              failCount += 1
              continue
            }
            const { data } = await importNotes(payload)
            if (data?.ok) {
              okCount += 1
              totalPages += Number(data.importedCount || 0)
              if (data.project?.id) lastProjectId = Number(data.project.id)
            } else {
              failCount += 1
            }
          } catch {
            failCount += 1
          }
          await this.yieldToMain()
        }

        await this.loadProjects()
        if (lastProjectId) {
          this.currentProjectId = lastProjectId
          await this.loadPages()
          this.emitProjectName()
        } else if (this.currentProjectId) {
          await this.loadPages()
        }

        if (okCount && !failCount) {
          this.$toast.open({
            message: `成功导入 ${okCount} 个文件（约 ${totalPages} 篇）`,
            type: 'is-success',
          })
          this.showBackupModal = false
        } else if (okCount) {
          this.$toast.open({
            message: `完成：成功 ${okCount}，失败 ${failCount}`,
            type: 'is-warning',
          })
        } else {
          this.$toast.open({ message: '导入失败，请检查备份文件', type: 'is-danger' })
        }
      } finally {
        this.backupBusy = false
        this.backupProgress = ''
      }
    },
    async loadPages() {
      const projectId = normalizeProjectId(this.currentProjectId)
      if (!projectId) {
        this.pages = []
        return
      }
      try {
        const { data } = await fetchPages(projectId)
        if (data?.ok) {
          this.pages = (data.pages || []).map(normalizePage).filter(Boolean)
          this.seedExpanded()
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '加载页面失败', type: 'is-danger' })
      }
    },
    async createProject() {
      const name = this.newProjectName.trim()
      if (!name || this.creating) return
      this.creating = true
      try {
        const { data } = await createProject({
          name,
          desc: this.newProjectDesc.trim(),
        })
        if (data?.ok) {
          this.closeProjectModal()
          await this.loadProjects()
          if (data.project) {
            this.currentProjectId = Number(data.project.id)
            await this.loadPages()
            this.emitProjectName()
          }
          this.$toast.open({ message: '项目已创建', type: 'is-success' })
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '创建失败', type: 'is-danger' })
      } finally {
        this.creating = false
      }
    },
    parentForNew() {
      if (this.activePage && this.activePage.kind === 'folder') return Number(this.activePage.id)
      if (this.activePage) return Number(this.activePage.parentId) || 0
      return 0
    },
    async submitNewPage() {
      const title = this.newPageTitle.trim()
      if (!title) return
      this.showPageModal = false
      this.newPageTitle = ''
      await this.createNode(title, 'page')
    },
    async submitNewFolder() {
      const title = this.newFolderTitle.trim()
      if (!title) return
      this.showFolderModal = false
      this.newFolderTitle = ''
      await this.createNode(title, 'folder')
    },
    async createNode(title, kind) {
      const projectId = normalizeProjectId(this.currentProjectId)
      if (!projectId) return
      this.creating = true
      try {
        const { data } = await createPage({
          projectId,
          parentId: this.parentForNew(),
          title,
          kind,
          content: kind === 'page' ? `# ${title}\n\n` : '',
        })
        if (data?.ok) {
          if (data.page) {
            const page = normalizePage(data.page)
            const idx = this.pages.findIndex((p) => p.id === page.id)
            if (idx >= 0) {
              this.pages.splice(idx, 1, page)
            } else {
              this.pages.push(page)
            }
          }
          await this.loadPages()
          if (data.page && kind === 'page') {
            await this.selectPage(normalizePage(data.page), { mode: 'edit' })
          } else if (data.page && kind === 'folder') {
            this.activePageId = Number(data.page.id)
            this.activePage = normalizePage(data.page)
          }
          this.$toast.open({ message: kind === 'folder' ? '目录已创建' : '页面已创建', type: 'is-success' })
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '创建失败', type: 'is-danger' })
      } finally {
        this.creating = false
      }
    },
    async selectPage(node, options = {}) {
      const id = Number(node.id)
      this.activePageId = id
      if (node.kind === 'folder') {
        this.activePage = normalizePage(node)
        return
      }
      try {
        const { data } = await fetchPage(id)
        if (data?.ok && data.page) {
          const page = normalizePage(data.page)
          this.activePage = page
          this.editTitle = page.title
          this.editContent = page.content || ''
          this.viewMode = options.mode || 'preview'
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
        this.activePage = normalizePage(data.page)
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
      this.deleteKind = 'page'
      this.deleteTarget = node
      this.showDeleteModal = true
    },
    closeDeleteModal() {
      if (this.deleting) return
      this.showDeleteModal = false
      this.deleteTarget = null
      this.deleteKind = 'page'
    },
    async confirmDelete() {
      const node = this.deleteTarget
      if (!node || this.deleting) return
      this.deleting = true
      try {
        if (this.deleteKind === 'project') {
          const { data } = await deleteProject(Number(node.id))
          if (data?.ok) {
            this.showDeleteModal = false
            this.deleteTarget = null
            this.deleteKind = 'page'
            this.activePageId = null
            this.activePage = null
            this.pages = []
            await this.loadProjects()
            this.$toast.open({ message: '项目已删除', type: 'is-success' })
          } else {
            this.$toast.open({ message: data?.message || '删除失败', type: 'is-danger' })
          }
          return
        }

        const pageId = Number(node.id)
        if (!Number.isFinite(pageId) || pageId <= 0) {
          this.$toast.open({ message: '无效的文档 ID', type: 'is-danger' })
          return
        }
        const { data } = await deletePage(pageId)
        if (data?.ok) {
          if (Number(this.activePageId) === pageId) {
            this.activePageId = null
            this.activePage = null
          }
          // Also clear selection if deleted ancestor folder contained active page
          if (this.activePageId) {
            const stillThere = (data.pages || []).some((p) => Number(p.id) === Number(this.activePageId))
            // data.pages is all user pages; still reload by project below
            void stillThere
          }
          this.showDeleteModal = false
          this.deleteTarget = null
          await this.loadPages()
          if (this.activePageId && !this.pages.some((p) => Number(p.id) === Number(this.activePageId))) {
            this.activePageId = null
            this.activePage = null
          }
          this.$toast.open({ message: '已删除', type: 'is-success' })
        } else {
          this.$toast.open({ message: data?.message || '删除失败', type: 'is-danger' })
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '删除失败', type: 'is-danger' })
      } finally {
        this.deleting = false
      }
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
  width: 268px;
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
  padding: 0 8px 0 10px;
  height: 34px;
  background: #fff;
  border: 1px solid @border;
  border-radius: 0;

  :deep(.app-icon) {
    color: @muted;
    font-size: 12px;
    flex-shrink: 0;
  }

  input {
    flex: 1;
    min-width: 0;
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

.search-clear {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #e2e8f0;
  color: #64748b;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: #cbd5e1;
    color: #1e293b;
  }

  :deep(.app-icon) {
    font-size: 11px;
    color: inherit;
  }
}

.sidebar-project {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px 10px;
  border-bottom: 1px solid @border;
}

.project-picker {
  position: relative;
  flex: 1;
  min-width: 0;
}

.project-trigger {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid @border;
  background: #fff;
  color: @text;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover,
  .project-picker.open & {
    border-color: rgba(32, 188, 86, 0.45);
    box-shadow: 0 0 0 2px rgba(32, 188, 86, 0.1);
  }
}

.project-trigger__icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  flex-shrink: 0;
  font-size: 13px;
}

.project-trigger__name {
  flex: 1;
  min-width: 0;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-trigger__caret {
  color: #94a3b8;
  font-size: 11px;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.project-picker.open .project-trigger__caret {
  transform: rotate(180deg);
  color: @accent;
}

.project-menu {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  z-index: 30;
  margin: 0;
  padding: 4px;
  list-style: none;
  background: #fff;
  border: 1px solid @border;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
  max-height: 240px;
  overflow: auto;
}

.project-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 6px 8px;
  color: #475569;
  font-size: 13px;
  cursor: pointer;

  :deep(.app-icon) {
    color: #f59e0b;
    font-size: 12px;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background: #f8fafc;
    color: @text;
  }

  &.active {
    background: @accent-soft;
    color: #166534;
    font-weight: 600;
  }
}

.project-menu__empty {
  padding: 12px 8px;
  text-align: center;
  color: @muted;
  font-size: 12px;
}

.sidebar-tree {
  flex: 1;
  overflow: auto;
  padding: 8px 6px;
}

.tree-root {
  list-style: none;
  margin: 0;
  padding: 0;
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
  position: relative;
}

.foot-sep {
  width: 1px;
  height: 18px;
  margin: 0 4px;
  background: @border;
}

.import-input {
  display: none;
}

.doc-modal--wide {
  max-width: 480px;
}

.ai-settings-hint {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #94a3b8;

  a {
    color: #15803d;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.backup-section {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid @border;
  background: #f8fafc;
}

.backup-section__title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: @text;
}

.backup-hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: @muted;
  line-height: 1.5;
}

.backup-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.backup-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 72px;
  padding: 12px 8px;
  border: 1px solid @border;
  background: #fff;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    border-color: rgba(32, 188, 86, 0.45);
    background: @accent-soft;
    color: #166534;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &--primary {
    grid-column: 1 / -1;
    flex-direction: row;
    min-height: 44px;
    background: @accent-soft;
    border-color: rgba(32, 188, 86, 0.35);
    color: #166534;
  }
}

.project-menu__item--danger {
  margin-top: 4px;
  border-top: 1px solid @border;
  color: #dc2626 !important;

  :deep(.app-icon) {
    color: #dc2626 !important;
  }

  &:hover {
    background: #fef2f2 !important;
  }
}

.share-expiry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}

.share-expiry__btn {
  height: 34px;
  border: 1px solid @border;
  background: #fff;
  color: #475569;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    border-color: rgba(32, 188, 86, 0.45);
  }

  &.active {
    border-color: @accent;
    background: @accent-soft;
    color: #166534;
    font-weight: 600;
  }
}

.share-url-box {
  display: flex;
  gap: 8px;
  align-items: center;

  .field-input {
    flex: 1;
    margin: 0;
  }
}

.share-copy {
  flex-shrink: 0;
  height: 40px;
  padding: 0 14px;
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
  gap: 8px;
  padding: 24px;
  color: @muted;
  background:
    radial-gradient(420px 180px at 50% 35%, rgba(32, 188, 86, 0.06), transparent 70%),
    #fafbfc;
}

.doc-empty__icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #94a3b8;
  font-size: 26px;
}

.doc-empty__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.doc-empty__hint {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.doc-article-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 20px 12px;
  border-bottom: 1px solid @border;
  background:
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
}

.doc-title-field {
  flex: 1;
  max-width: 560px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: @text;
  outline: none;
  padding: 6px 12px;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  &::placeholder {
    color: #94a3b8;
    font-weight: 600;
  }

  &:hover {
    background: rgba(248, 250, 252, 0.9);
    border-color: #e2e8f0;
  }

  &:focus {
    background: #fff;
    border-color: #86efac;
    box-shadow: 0 0 0 3px rgba(32, 188, 86, 0.14);
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
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: @muted;
  cursor: pointer;
  transition:
    background 0.14s ease,
    color 0.14s ease,
    border-color 0.14s ease,
    transform 0.12s ease;

  &:hover {
    background: @accent-soft;
    border-color: #bbf7d0;
    color: @accent;
  }

  &:active {
    transform: scale(0.94);
  }

  &.active {
    background: @accent-soft;
    border-color: #86efac;
    color: @accent;
    box-shadow: 0 0 0 2px rgba(32, 188, 86, 0.12);
  }
}

.doc-article {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
  background: #f8fafc;

  &.mode-edit .md-preview {
    display: none;
  }

  &.mode-preview .md-source {
    display: none;
  }

  &.mode-split {
    .md-source {
      width: 50%;
      position: relative;
      border-right: none;

      &::after {
        content: '';
        position: absolute;
        top: 12px;
        right: 0;
        bottom: 12px;
        width: 1px;
        background: linear-gradient(
          180deg,
          transparent,
          rgba(148, 163, 184, 0.55) 12%,
          rgba(148, 163, 184, 0.55) 88%,
          transparent
        );
        pointer-events: none;
      }
    }
    .md-preview {
      width: 50%;
    }
  }
}

.md-source {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: none;
  background: transparent;
}

.md-preview {
  flex: 1;
  overflow: auto;
  padding: 28px 20px 48px;
  background:
    radial-gradient(900px 280px at 0% 0%, rgba(32, 188, 86, 0.05), transparent 55%),
    radial-gradient(700px 220px at 100% 8%, rgba(14, 165, 233, 0.04), transparent 50%),
    linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  scrollbar-width: thin;
  scrollbar-color: rgba(34, 197, 94, 0.35) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    margin: 8px 0;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(134, 239, 172, 0.7), rgba(34, 197, 94, 0.45));
    border-radius: 999px;
    border: 1px solid transparent;
    background-clip: padding-box;
    transition: background 0.15s ease;
  }

  &:hover::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(74, 222, 128, 0.85), rgba(22, 163, 74, 0.65));
  }

  &::-webkit-scrollbar-thumb:active {
    background: #16a34a;
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }
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
.doc-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.doc-modal {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px 22px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  animation: modal-in 0.22s ease-out;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.doc-modal-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;

  &--project {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #15803d;
  }

  &--page {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #1d4ed8;
  }

  &--folder {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #b45309;
  }

  &--danger {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    color: #dc2626;
  }
}

.doc-modal--danger {
  border: 1px solid #fecaca;
}

.doc-modal-warn {
  display: inline-block;
  margin-top: 6px;
  color: #dc2626;
  font-weight: 600;
}

.doc-modal-title {
  margin: 0 0 6px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: @text;
}

.doc-modal-desc {
  margin: 0 0 20px;
  text-align: center;
  font-size: 13px;
  color: @muted;
  line-height: 1.5;
}

.doc-modal-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: @text;

  .required {
    color: #ef4444;
  }
}

.field-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid @border;
  border-radius: 10px;
  font-size: 14px;
  color: @text;
  background: #fff;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: @accent;
    box-shadow: 0 0 0 3px rgba(32, 188, 86, 0.15);
  }

  &::placeholder {
    color: #94a3b8;
  }
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid @border;
  font-size: 12px;
  color: @muted;

  i {
    color: @accent;
    font-size: 12px;
  }
}

.doc-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #f1f5f9;
}

.btn-ghost {
  border: 1px solid @border;
  background: #fff;
  color: @muted;
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: #f8fafc;
    color: @text;
  }
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: linear-gradient(135deg, #22c65b, @accent);
  color: #fff;
  border-radius: 10px;
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(32, 188, 86, 0.28);
  transition: opacity 0.15s, transform 0.15s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  border-radius: 10px;
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.28);
  transition: opacity 0.15s, transform 0.15s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }
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

  .md-preview {
    padding: 18px 14px 28px;
    font-size: 14px;
  }

  .doc-modal {
    max-width: none;
    margin: 0;
    padding: 22px 18px 18px;
    border-radius: 14px;
  }

  .doc-modal-foot {
    flex-direction: column-reverse;

    .btn-ghost,
    .btn-primary {
      width: 100%;
      justify-content: center;
      min-height: 42px;
    }
  }
}
</style>

<style lang="less">
.doc-center .markdown-body {
  --md-ink: #1e293b;
  --md-body: #334155;
  --md-muted: #64748b;
  --md-line: #e2e8f0;
  --md-accent: #16a34a;
  --md-accent-soft: #f0fdf4;
  --md-code-bg: #f1f5f9;
  --md-pre-bg: #f8fafc;

  width: 100%;
  max-width: none;
  margin: 0;
  box-sizing: border-box;
  color: var(--md-body);
  font-size: 15.5px;
  line-height: 1.85;
  letter-spacing: 0.01em;
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;

  > :first-child {
    margin-top: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    color: var(--md-ink);
    font-weight: 720;
    line-height: 1.35;
    margin-top: 1.55em;
    margin-bottom: 0.55em;
    scroll-margin-top: 16px;
    letter-spacing: -0.015em;
  }

  h1 {
    font-size: 1.85em;
    padding-bottom: 0.42em;
    border-bottom: 1px solid var(--md-line);
  }

  h2 {
    font-size: 1.42em;
    padding-bottom: 0.28em;
    border-bottom: 1px solid rgba(226, 232, 240, 0.85);
  }

  h3 { font-size: 1.18em; }
  h4 { font-size: 1.05em; color: #475569; }

  p {
    margin: 0.85em 0;
  }

  strong {
    color: var(--md-ink);
    font-weight: 700;
  }

  em {
    color: #475569;
  }

  a {
    color: var(--md-accent);
    text-decoration: none;
    border-bottom: 1px solid rgba(22, 163, 74, 0.25);
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
    border-radius: 2px;

    &:hover {
      color: #15803d;
      border-bottom-color: rgba(22, 163, 74, 0.55);
      background: rgba(34, 197, 94, 0.06);
    }
  }

  ul, ol {
    margin: 0.75em 0;
    padding-left: 1.35em;
  }

  li {
    margin: 0.28em 0;
    padding-left: 0.15em;
  }

  ul > li::marker {
    color: #86efac;
  }

  ol > li::marker {
    color: var(--md-accent);
    font-weight: 600;
  }

  li > ul,
  li > ol {
    margin: 0.25em 0;
  }

  blockquote {
    margin: 1em 0;
    padding: 12px 16px 12px 18px;
    border-left: 3px solid #4ade80;
    background: linear-gradient(90deg, rgba(240, 253, 244, 0.95), rgba(240, 253, 244, 0.35));
    color: #475569;
    border-radius: 0 12px 12px 0;
    box-shadow: inset 0 0 0 1px rgba(134, 239, 172, 0.18);

    p {
      margin: 0.35em 0;
    }

    p:first-child {
      margin-top: 0;
    }

    p:last-child {
      margin-bottom: 0;
    }
  }

  pre {
    position: relative;
    margin: 1.1em 0;
    padding: 14px 16px;
    overflow: auto;
    border-radius: 12px;
    background: var(--md-pre-bg);
    border: 1px solid #e2e8f0;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
    color: #334155;

    code {
      background: transparent;
      color: inherit;
      padding: 0;
      font-size: 0.88em;
      line-height: 1.65;
      white-space: pre;
      border: none;
    }
  }

  code {
    font-family: Consolas, 'Cascadia Code', 'SF Mono', Monaco, monospace;
    font-size: 0.9em;
  }

  :not(pre) > code {
    background: var(--md-code-bg);
    color: #0f766e;
    padding: 0.15em 0.45em;
    border-radius: 6px;
    border: 1px solid rgba(148, 163, 184, 0.25);
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 1.15em 0;
    font-size: 0.92em;
    overflow: hidden;
    border: 1px solid var(--md-line);
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
  }

  th {
    background: linear-gradient(180deg, #f0fdf4, #ecfdf5);
    color: #166534;
    font-weight: 650;
    text-align: left;
  }

  th, td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--md-line);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr {
    transition: background 0.14s ease;

    &:hover td {
      background: rgba(240, 253, 244, 0.55);
    }
  }

  hr {
    border: none;
    height: 1px;
    margin: 1.8em 0;
    background: linear-gradient(90deg, transparent, #cbd5e1 20%, #86efac 50%, #cbd5e1 80%, transparent);
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 0.6em 0;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  }

  .doniai-file-img {
    display: block;
    max-width: min(100%, 720px);
    margin: 14px 0;
    border: 1px solid var(--md-line);
    background: #f8fafc;
  }

  .doniai-file-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #15803d;
    font-weight: 650;
    padding: 2px 6px;
    border-radius: 6px;
    border-bottom: none;
    background: rgba(240, 253, 244, 0.8);

    &:hover {
      background: #dcfce7;
    }
  }

  input[type='checkbox'] {
    margin-right: 0.4em;
    accent-color: var(--md-accent);
  }

  del {
    color: #94a3b8;
  }
}
</style>

<style lang="less">
.doc-ctx-menu {
  position: fixed;
  z-index: 10060;
  min-width: 148px;
  margin: 0;
  padding: 4px;
  list-style: none;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 10px;
    color: #334155;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      background: #f8fafc;
    }

    &.danger {
      color: #dc2626;

      &:hover {
        background: #fef2f2;
      }
    }
  }
}
</style>

