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

          <div v-if="tab === 'notes'" class="bar-actions">
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
            <button type="button" class="bar-save" title="保存" @click="saveNotes">
              <AppIcon name="save" />
              <span>保存</span>
            </button>
          </div>
        </header>

        <div class="docs-body">
          <NotesPanel
            v-show="tab === 'notes'"
            ref="notesPanel"
            @project-change="projectName = $event"
            @view-mode-change="notesViewMode = $event"
          />
          <FilesPanel v-show="tab === 'files'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import NotesPanel from '@/components/docs/NotesPanel.vue'
import FilesPanel from '@/components/docs/FilesPanel.vue'

export default {
  name: 'Docs',
  components: { Navbar, NotesPanel, FilesPanel },
  data() {
    return {
      tab: 'notes',
      projectName: '云笔记',
      notesViewMode: 'preview',
      isNarrow: false,
    }
  },
  mounted() {
    this.syncNarrow()
    this._mq = window.matchMedia('(max-width: 768px)')
    this._mqHandler = () => this.syncNarrow()
    this._mq.addEventListener('change', this._mqHandler)
  },
  beforeUnmount() {
    this._mq?.removeEventListener('change', this._mqHandler)
  },
  computed: {
    topbarTitle() {
      return this.tab === 'notes' ? this.projectName : '文件管理'
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
    saveNotes() {
      this.$refs.notesPanel?.saveContent()
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

  .bar-icon {
    width: 30px;
    height: 28px;
    font-size: 12px;
  }

  .bar-icon--split {
    display: none;
  }

  .bar-save span {
    display: none;
  }

  .bar-save {
    width: 34px;
    padding: 0;
    justify-content: center;
  }
}
</style>
