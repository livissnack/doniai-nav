<template>
  <div class="docs-page">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="云笔记" :newUrl="`/docs`" />
    </div>

    <div class="docs-main">
      <div class="docs-card">
        <header class="docs-bar">
          <router-link to="/" class="bar-back" title="返回首页">
            <i class="fas fa-angle-left"></i>
          </router-link>
          <span class="bar-title">{{ topbarTitle }}</span>

          <nav class="bar-tabs">
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
            <button
              type="button"
              class="bar-icon"
              :class="{ active: notesViewMode === 'edit' }"
              title="编辑"
              @click="setNotesMode('edit')"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              type="button"
              class="bar-icon"
              :class="{ active: notesViewMode === 'split' }"
              title="分屏"
              @click="setNotesMode('split')"
            >
              <i class="fas fa-columns"></i>
            </button>
            <button
              type="button"
              class="bar-icon"
              :class="{ active: notesViewMode === 'preview' }"
              title="预览"
              @click="setNotesMode('preview')"
            >
              <i class="fas fa-eye"></i>
            </button>
            <button type="button" class="bar-icon bar-save" title="保存" @click="saveNotes">
              <i class="fas fa-save"></i>
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
      notesViewMode: 'split',
    }
  },
  computed: {
    topbarTitle() {
      return this.tab === 'notes' ? this.projectName : '文件管理'
    },
  },
  methods: {
    setNotesMode(mode) {
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
  background: #f0f2f5;
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
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 10px 16px 12px;
  box-sizing: border-box;
}

.docs-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid @border;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.docs-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: #fafbfc;
  border-bottom: 1px solid @border;
}

.bar-back {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: @muted;
  font-size: 16px;
  text-decoration: none;

  &:hover {
    background: #f0fdf4;
    color: @primary;
  }
}

.bar-title {
  font-size: 14px;
  font-weight: 600;
  color: @text;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-tabs {
  display: flex;
  gap: 4px;
  margin-left: 4px;
  padding: 2px;
  background: #eef2f6;
  border-radius: 8px;
}

.bar-tab {
  border: none;
  background: transparent;
  color: @muted;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    color: @text;
  }

  &.active {
    background: #fff;
    color: #166534;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }
}

.bar-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.bar-icon {
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #fff;
  color: @muted;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: @border;
    color: @text;
  }

  &.active {
    border-color: rgba(32, 188, 86, 0.4);
    background: #f0fdf4;
    color: @primary;
  }

  &.bar-save:hover {
    border-color: @primary;
    background: #f0fdf4;
    color: @primary;
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
</style>
