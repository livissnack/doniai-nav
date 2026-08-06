<template>
  <div class="docs-page">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="云笔记" :newUrl="`/docs`" />
    </div>

    <div class="docs-main">
      <div class="docs-card">
        <header class="docs-bar">
          <div class="bar-left">
            <router-link to="/" class="bar-back" title="返回首页">
              <AppIcon name="angle-left" />
            </router-link>
            <div class="bar-heading">
              <span class="bar-kicker">云笔记</span>
              <span class="bar-title">{{ topbarTitle }}</span>
            </div>
          </div>

          <nav class="bar-tabs" aria-label="功能切换">
            <button
              type="button"
              class="bar-tab"
              :class="{ active: tab === 'notes' }"
              @click="tab = 'notes'"
            >
              笔记
            </button>
            <button
              type="button"
              class="bar-tab"
              :class="{ active: tab === 'files' }"
              @click="tab = 'files'"
            >
              文件
            </button>
          </nav>

          <div class="bar-actions">
            <template v-if="tab === 'notes'">
              <div class="mode-switch" role="group" aria-label="阅读模式">
                <button
                  type="button"
                  class="bar-icon"
                  :class="{ active: notesViewMode === 'edit' }"
                  title="编辑"
                  @click="setNotesMode('edit')"
                >
                  <AppIcon name="edit" />
                </button>
                <button
                  type="button"
                  class="bar-icon bar-icon--split"
                  :class="{ active: notesViewMode === 'split' }"
                  title="分屏"
                  @click="setNotesMode('split')"
                >
                  <AppIcon name="columns" />
                </button>
                <button
                  type="button"
                  class="bar-icon"
                  :class="{ active: notesViewMode === 'preview' }"
                  title="预览"
                  @click="setNotesMode('preview')"
                >
                  <AppIcon name="eye" />
                </button>
              </div>
              <span
                v-if="saveStatusText"
                class="save-status"
                :class="`is-${notesSave.status}`"
                :title="saveStatusText"
              >
                {{ saveStatusText }}
              </span>
              <button type="button" class="bar-save" title="保存" @click="saveNotes">
                <AppIcon name="save" />
                <span>保存</span>
              </button>
            </template>
            <button type="button" class="bar-backup" title="备份 / 恢复" @click="showBackupModal = true">
              <AppIcon name="download" />
              <span>备份</span>
            </button>
          </div>
        </header>

        <div class="docs-body">
          <NotesPanel
            v-show="tab === 'notes'"
            ref="notesPanel"
            @project-change="projectName = $event"
            @view-mode-change="notesViewMode = $event"
            @save-status="onSaveStatus"
          />
          <FilesPanel
            v-show="tab === 'files'"
            ref="filesPanel"
            :active="tab === 'files'"
            :initial-file="$route.query.file || ''"
          />
        </div>
      </div>
    </div>

    <div v-if="showBackupModal" class="backup-mask" @click.self="closeBackupModal">
      <div class="backup-box" role="dialog" aria-labelledby="docs-backup-title">
        <header class="backup-head">
          <h3 id="docs-backup-title">备份 / 恢复</h3>
          <button type="button" class="backup-close" :disabled="backupBusy" @click="closeBackupModal">
            <AppIcon name="times" />
          </button>
        </header>
        <p class="backup-desc">
          一次导出包含<strong>全部笔记</strong>与<strong>全部文件</strong>的
          <code>tar.gz</code>，导入即可恢复。笔记会以新项目形式导入，文件按路径合并覆盖。
        </p>

        <div class="backup-section">
          <h4>导出</h4>
          <button type="button" class="backup-action" :disabled="backupBusy" @click="doExportBackup">
            <AppIcon name="file-archive" />
            <span>{{ backupBusy && backupMode === 'export' ? backupProgress : '导出 tar.gz' }}</span>
          </button>
        </div>

        <div class="backup-section">
          <h4>恢复</h4>
          <button type="button" class="backup-action primary" :disabled="backupBusy" @click="triggerImportBackup">
            <AppIcon name="upload" />
            <span>{{ backupBusy && backupMode === 'import' ? backupProgress : '选择 tar.gz 恢复…' }}</span>
          </button>
          <input
            ref="backupInput"
            type="file"
            accept=".tar.gz,.tgz,application/gzip,application/x-gzip,application/x-tar"
            hidden
            @change="onImportBackup"
          />
        </div>

        <footer class="backup-foot">
          <button type="button" class="backup-ghost" :disabled="backupBusy" @click="closeBackupModal">
            关闭
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import NotesPanel from '@/components/docs/NotesPanel.vue'
import FilesPanel from '@/components/docs/FilesPanel.vue'
import { exportBackup, importBackup } from '@/services/backupApi'
import { prefetchUniver } from '@/utils/univerLoad'

export default {
  name: 'Docs',
  components: { Navbar, NotesPanel, FilesPanel },
  data() {
    return {
      tab: 'notes',
      projectName: '云笔记',
      notesViewMode: 'preview',
      isNarrow: false,
      notesSave: { status: 'idle', dirty: false, at: 0 },
      showBackupModal: false,
      backupBusy: false,
      backupMode: '',
      backupProgress: '',
    }
  },
  mounted() {
    this.syncNarrow()
    this._mq = window.matchMedia('(max-width: 768px)')
    this._mqHandler = () => this.syncNarrow()
    this._mq.addEventListener('change', this._mqHandler)
    if (this.$route.query.file) {
      this.tab = 'files'
    }
  },
  beforeUnmount() {
    this._mq?.removeEventListener('change', this._mqHandler)
  },
  watch: {
    tab(next) {
      if (next !== 'notes') {
        this.$refs.notesPanel?.flushAutoSave?.()
      }
      // Entering files: warm Univer core in background (first office open is much faster)
      if (next === 'files' && !this._univerWarmed) {
        this._univerWarmed = true
        const warm = () => prefetchUniver('doc')
        if (typeof requestIdleCallback === 'function') {
          requestIdleCallback(warm, { timeout: 3000 })
        } else {
          setTimeout(warm, 800)
        }
      }
    },
  },
  computed: {
    topbarTitle() {
      return this.tab === 'notes' ? this.projectName : '文件管理'
    },
    saveStatusText() {
      const { status, dirty, at } = this.notesSave
      if (status === 'saving') return '保存中…'
      if (status === 'pending' || dirty) return '未保存'
      if (status === 'error') return '保存失败'
      if (status === 'saved' && at) return '已自动保存'
      return ''
    },
  },
  methods: {
    syncNarrow() {
      this.isNarrow = window.matchMedia('(max-width: 768px)').matches
      if (this.isNarrow && this.notesViewMode === 'split') {
        this.setNotesMode('preview')
      }
    },
    setNotesMode(mode) {
      if (this.isNarrow && mode === 'split') {
        mode = 'preview'
      }
      this.notesViewMode = mode
      this.$refs.notesPanel?.setViewMode(mode)
    },
    onSaveStatus(payload) {
      this.notesSave = {
        status: payload?.status || 'idle',
        dirty: !!payload?.dirty,
        at: Number(payload?.at) || 0,
      }
    },
    saveNotes() {
      this.$refs.notesPanel?.saveContent()
    },
    closeBackupModal() {
      if (this.backupBusy) return
      this.showBackupModal = false
      this.backupProgress = ''
      this.backupMode = ''
    },
    async doExportBackup() {
      if (this.backupBusy) return
      this.backupBusy = true
      this.backupMode = 'export'
      this.backupProgress = '打包中…'
      try {
        await this.$refs.notesPanel?.flushAutoSave?.()
        const res = await exportBackup()
        const blob = new Blob([res.data], { type: 'application/gzip' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
        a.href = url
        a.download = `doniai-backup-${stamp}.tar.gz`
        a.click()
        URL.revokeObjectURL(url)
        this.$toast.open({ message: '备份已下载', type: 'is-success' })
      } catch (e) {
        this.$toast.open({ message: e?.msg || '导出失败', type: 'is-danger' })
      } finally {
        this.backupBusy = false
        this.backupMode = ''
        this.backupProgress = ''
      }
    },
    triggerImportBackup() {
      if (this.backupBusy) return
      this.$refs.backupInput?.click()
    },
    async onImportBackup(e) {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      this.backupBusy = true
      this.backupMode = 'import'
      this.backupProgress = '恢复中…'
      try {
        await this.$refs.notesPanel?.flushAutoSave?.()
        const { data } = await importBackup(file)
        if (!data?.ok) {
          this.$toast.open({ message: data?.message || '恢复失败', type: 'is-danger' })
          return
        }
        await Promise.all([
          this.$refs.notesPanel?.reloadAfterBackup?.(),
          this.$refs.filesPanel?.reloadAfterBackup?.(),
        ])
        this.$toast.open({ message: data.message || '恢复完成', type: 'is-success' })
        this.showBackupModal = false
      } catch (err) {
        this.$toast.open({ message: err?.msg || '恢复失败', type: 'is-danger' })
      } finally {
        this.backupBusy = false
        this.backupMode = ''
        this.backupProgress = ''
      }
    },
  },
}
</script>

<style lang="less" scoped>
@primary: #20bc56;
@text: #1e293b;
@muted: #64748b;
@border: #e2e8f0;

.docs-page {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(900px 240px at 8% 0%, rgba(32, 188, 86, 0.08), transparent 55%),
    radial-gradient(700px 220px at 92% 0%, rgba(59, 130, 246, 0.06), transparent 50%),
    #eef2f6;
  overflow: hidden;
}

.nav-box {
  flex-shrink: 0;
}

.docs-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  max-width: 1320px;
  width: 100%;
  margin: 0 auto;
  padding: 12px 16px 14px;
  box-sizing: border-box;
}

.docs-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid @border;
  border-radius: 0;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.docs-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  background: linear-gradient(180deg, #fbfcfd 0%, #f6f8fa 100%);
  border-bottom: 1px solid @border;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.bar-back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: @muted;
  font-size: 16px;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: #f0fdf4;
    border-color: rgba(32, 188, 86, 0.25);
    color: @primary;
  }
}

.bar-heading {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
}

.bar-kicker {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  line-height: 1.2;
}

.bar-title {
  font-size: 14px;
  font-weight: 700;
  color: @text;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.bar-tabs {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: #e8eef4;
  border: 1px solid #dde5ee;
}

.bar-tab {
  border: none;
  background: transparent;
  color: @muted;
  font-size: 13px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    color: @text;
  }

  &.active {
    background: #fff;
    color: #166534;
    font-weight: 700;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  }
}

.bar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-status {
  font-size: 12px;
  color: @muted;
  white-space: nowrap;
  user-select: none;

  &.is-pending {
    color: #b45309;
  }

  &.is-saving {
    color: @muted;
  }

  &.is-saved {
    color: #166534;
  }

  &.is-error {
    color: #b91c1c;
  }
}

.mode-switch {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: #fff;
  border: 1px solid @border;
}

.bar-icon {
  width: 32px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  color: @muted;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  :deep(.app-icon) {
    font-size: 14px;
    color: inherit;
  }

  :deep(svg) {
    display: block;
    width: 1em;
    height: 1em;
  }

  &:hover {
    color: @text;
    background: #f8fafc;
  }

  &.active {
    background: #f0fdf4;
    color: @primary;
    border-color: rgba(32, 188, 86, 0.28);
  }
}

.bar-save {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(32, 188, 86, 0.35);
  background: #f0fdf4;
  color: #166534;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  :deep(.app-icon),
  :deep(svg) {
    font-size: 13px;
    width: 1em;
    height: 1em;
  }

  &:hover {
    background: @primary;
    border-color: @primary;
    color: #fff;
  }
}

.bar-backup {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid @border;
  background: #fff;
  color: @text;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  :deep(.app-icon),
  :deep(svg) {
    font-size: 13px;
    width: 1em;
    height: 1em;
  }

  &:hover {
    border-color: @primary;
    color: @primary;
    background: #f0fdf4;
  }
}

.backup-mask {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.backup-box {
  width: min(440px, 100%);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  padding: 18px 20px 14px;
}

.backup-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;

  h3 {
    margin: 0;
    font-size: 17px;
    color: @text;
  }
}

.backup-close {
  border: none;
  background: #f1f5f9;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  color: @muted;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }
}

.backup-desc {
  margin: 0 0 14px;
  font-size: 13px;
  color: @muted;
  line-height: 1.55;

  code {
    font-size: 12px;
    background: #f1f5f9;
    padding: 1px 5px;
    border-radius: 4px;
  }

  strong {
    color: @text;
    font-weight: 600;
  }
}

.backup-section {
  margin-bottom: 12px;

  h4 {
    margin: 0 0 8px;
    font-size: 13px;
    color: @text;
  }
}

.backup-action {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid @border;
  background: #fff;
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: @text;

  &:hover:not(:disabled) {
    border-color: @primary;
    background: #f0fdf4;
  }

  &.primary {
    background: #f0fdf4;
    border-color: rgba(32, 188, 86, 0.35);
    color: #166534;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.backup-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.backup-ghost {
  border: 1px solid @border;
  background: #fff;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  color: @muted;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: @text;
    background: #f8fafc;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.docs-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  > * {
    flex: 1;
    min-height: 0;
  }
}

@media screen and (max-width: 768px) {
  .docs-page {
    min-height: 100dvh;
    height: 100dvh;
    height: 100svh;
  }

  .docs-main {
    padding: 8px 10px calc(10px + env(safe-area-inset-bottom, 0px));
  }

  .docs-card {
    box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
  }

  .docs-bar {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 10px;
  }

  .bar-left {
    flex: 1;
    min-width: 0;
  }

  .bar-title {
    max-width: none;
    font-size: 13px;
  }

  .bar-tabs {
    order: 3;
    width: 100%;
    justify-content: stretch;

    .bar-tab {
      flex: 1;
      text-align: center;
      padding: 7px 8px;
      font-size: 12px;
    }
  }

  .bar-actions {
    margin-left: auto;
    gap: 6px;
  }

  .save-status {
    font-size: 11px;
    max-width: 72px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bar-icon {
    width: 30px;
    height: 28px;
    font-size: 12px;
  }

  .bar-icon--split {
    display: none;
  }

  .bar-save span,
  .bar-backup span {
    display: none;
  }

  .bar-save,
  .bar-backup {
    width: 34px;
    padding: 0;
    justify-content: center;
  }
}
</style>
