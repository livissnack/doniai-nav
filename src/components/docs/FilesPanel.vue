<template>
  <div class="files-panel">
    <div class="files-toolbar">
      <div class="breadcrumb-wrap">
        <i class="fas fa-hdd breadcrumb-icon"></i>
        <nav class="breadcrumb">
          <a href="#" @click.prevent="goRoot">全部文件</a>
          <span v-for="(seg, i) in pathSegments" :key="i" class="crumb-seg">
            <i class="fas fa-chevron-right"></i>
            <a href="#" @click.prevent="goTo(i)">{{ seg }}</a>
          </span>
        </nav>
      </div>
      <div class="tool-btns">
        <label class="btn-upload primary">
          <i class="fas fa-cloud-upload-alt"></i> 上传
          <input type="file" multiple hidden @change="onUpload" />
        </label>
        <button type="button" class="btn-tool" @click="newFolder">
          <i class="fas fa-folder-plus"></i> 新建文件夹
        </button>
        <button type="button" class="btn-tool icon-only" title="刷新" @click="loadList">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <div class="files-body">
    <div v-if="loading" class="files-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>加载文件列表…</p>
    </div>
    <table v-else class="files-table">
      <thead>
        <tr>
          <th>名称</th>
          <th>大小</th>
          <th>修改时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="currentPath" class="row-up" @dblclick="goUp">
          <td colspan="4">
            <span class="file-cell">
              <span class="file-icon up"><i class="fas fa-level-up-alt"></i></span>
              返回上级目录
            </span>
          </td>
        </tr>
        <tr
          v-for="item in items"
          :key="item.path"
          class="file-row"
          @dblclick="openItem(item)"
        >
          <td>
            <span class="file-cell">
              <span class="file-icon" :class="item.isDir ? 'folder' : fileIconClass(item)">
                <i :class="item.isDir ? 'fas fa-folder' : fileIcon(item)"></i>
              </span>
              <span class="file-name">{{ item.name }}</span>
            </span>
          </td>
          <td>{{ item.isDir ? '—' : formatSize(item.size) }}</td>
          <td>{{ formatTime(item.updatedAt) }}</td>
          <td class="td-act">
            <button v-if="!item.isDir" type="button" class="link-btn" @click="openItem(item)">打开</button>
            <button type="button" class="link-btn danger" @click="removeItem(item)">删除</button>
          </td>
        </tr>
        <tr v-if="!items.length && !loading">
          <td colspan="4" class="empty-cell">
            <i class="fas fa-inbox"></i>
            <p>文件夹为空</p>
            <span>上传文件或新建文件夹开始使用</span>
          </td>
        </tr>
      </tbody>
    </table>
    </div>

    <div v-if="viewerOpen" class="viewer-mask" @click.self="closeViewer">
      <div class="viewer-box">
        <header class="viewer-head">
          <span class="viewer-title"><i class="fas fa-file"></i> {{ viewerName }}</span>
          <div class="viewer-actions">
            <button v-if="canSave" type="button" class="btn-save" :disabled="viewerSaving" @click="saveViewer">
              <i :class="['fas', viewerSaving ? 'fa-spinner fa-spin' : 'fa-save']"></i> 保存
            </button>
            <button v-if="viewerMode === 'docx' && !htmlEdit" type="button" class="btn-tool" @click="startHtmlEdit">HTML 编辑</button>
            <a v-if="viewerBlobUrl" :href="viewerBlobUrl" download class="btn-tool">下载</a>
            <button type="button" class="btn-close" @click="closeViewer"><i class="fas fa-times"></i></button>
          </div>
        </header>
        <div class="viewer-body">
          <textarea
            v-if="viewerMode === 'text'"
            v-model="textContent"
            class="text-editor"
          />
          <div v-else-if="viewerMode === 'html'" class="html-editor" contenteditable="true" v-html="htmlContent" @input="onHtmlInput" />
          <div v-else-if="viewerMode === 'excel'" class="excel-wrap">
            <div class="excel-bar">
              <span>工作表</span>
              <button
                v-for="(name, idx) in sheetNames"
                :key="name"
                type="button"
                class="sheet-tab"
                :class="{ active: activeSheet === idx }"
                @click="switchSheet(idx)"
              >{{ name }}</button>
            </div>
            <div class="excel-scroll">
              <table class="excel-table">
                <tbody>
                  <tr v-for="(row, ri) in sheetRows" :key="ri">
                    <td v-for="(cell, ci) in row" :key="ci">
                      <input v-model="sheetRows[ri][ci]" type="text" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            v-else-if="viewerMode === 'docx'"
            class="docx-html-view"
            v-html="htmlContent"
          />
          <div v-else-if="viewerMode === 'unsupported'" class="unsupported-view">
            <p>该格式暂不支持在线预览，请下载后查看。</p>
            <a v-if="viewerBlobUrl" :href="viewerBlobUrl" :download="viewerName" class="btn-tool">下载文件</a>
          </div>
          <img v-else-if="viewerMode === 'image' && viewerBlobUrl" :src="viewerBlobUrl" class="img-view" alt="" />
          <iframe v-else-if="viewerMode === 'pdf' && viewerBlobUrl" :src="viewerBlobUrl" class="pdf-view" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
import {
  fetchFileList,
  createFolder,
  uploadFile,
  uploadBinary,
  deleteFile,
  fetchFileText,
  saveFileText,
  fetchFileBlob,
} from '@/services/filesApi'

export default {
  name: 'FilesPanel',
  data() {
    return {
      currentPath: '',
      items: [],
      loading: false,
      viewerOpen: false,
      viewerPath: '',
      viewerName: '',
      viewerMode: '',
      viewerSaving: false,
      textContent: '',
      htmlContent: '',
      htmlEdit: false,
      officeBuffer: null,
      viewerBlobUrl: '',
      workbook: null,
      sheetNames: [],
      activeSheet: 0,
      sheetRows: [],
    }
  },
  computed: {
    pathSegments() {
      if (!this.currentPath) return []
      return this.currentPath.split('/').filter(Boolean)
    },
    canSave() {
      return ['text', 'html', 'excel'].includes(this.viewerMode)
    },
  },
  mounted() {
    this.loadList()
  },
  beforeDestroy() {
    this.revokeBlob()
  },
  methods: {
    formatSize(n) {
      if (!n) return '0 B'
      if (n < 1024) return `${n} B`
      if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
      return `${(n / 1024 / 1024).toFixed(1)} MB`
    },
    formatTime(ts) {
      if (!ts) return '—'
      return new Date(ts * 1000).toLocaleString()
    },
    fileIcon(item) {
      const ext = (item.ext || '').toLowerCase()
      if (['.doc', '.docx'].includes(ext)) return 'fas fa-file-word'
      if (['.xls', '.xlsx', '.csv'].includes(ext)) return 'fas fa-file-excel'
      if (['.md', '.txt'].includes(ext)) return 'fas fa-file-alt'
      if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) return 'fas fa-file-image'
      if (ext === '.pdf') return 'fas fa-file-pdf'
      return 'fas fa-file'
    },
    fileIconClass(item) {
      const ext = (item.ext || '').toLowerCase()
      if (['.doc', '.docx'].includes(ext)) return 'word'
      if (['.xls', '.xlsx', '.csv'].includes(ext)) return 'excel'
      if (['.md', '.txt'].includes(ext)) return 'text'
      if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) return 'image'
      if (ext === '.pdf') return 'pdf'
      return 'file'
    },
    async loadList() {
      this.loading = true
      try {
        const { data } = await fetchFileList(this.currentPath)
        if (data?.ok) this.items = data.items || []
      } catch (e) {
        this.$buefy.toast.open({ message: e?.msg || '加载失败', type: 'is-danger' })
      } finally {
        this.loading = false
      }
    },
    goRoot() {
      this.currentPath = ''
      this.loadList()
    },
    goUp() {
      const parts = this.pathSegments
      parts.pop()
      this.currentPath = parts.join('/')
      this.loadList()
    },
    goTo(index) {
      const parts = this.pathSegments.slice(0, index + 1)
      this.currentPath = parts.join('/')
      this.loadList()
    },
    async onUpload(e) {
      const files = e.target.files
      if (!files?.length) return
      try {
        for (const file of files) {
          await uploadFile(file, this.currentPath)
        }
        this.$buefy.toast.open({ message: '上传完成', type: 'is-success' })
        await this.loadList()
      } catch (err) {
        this.$buefy.toast.open({ message: err?.msg || '上传失败', type: 'is-danger' })
      }
      e.target.value = ''
    },
    async newFolder() {
      const name = window.prompt('文件夹名称')
      if (!name) return
      try {
        const { data } = await createFolder(this.currentPath, name)
        if (data?.ok) {
          this.items = data.items || []
          this.$buefy.toast.open({ message: '已创建', type: 'is-success' })
        }
      } catch (e) {
        this.$buefy.toast.open({ message: e?.msg || '创建失败', type: 'is-danger' })
      }
    },
    openItem(item) {
      if (item.isDir) {
        this.currentPath = item.path
        this.loadList()
        return
      }
      this.openFile(item.path, item.name, item.ext)
    },
    async openFile(path, name, ext) {
      const e = (ext || '').toLowerCase()
      this.closeViewer()
      this.viewerPath = path
      this.viewerName = name
      this.viewerOpen = true

      try {
        if (['.md', '.txt', '.json', '.yaml', '.yml', '.xml', '.log', '.html', '.htm'].includes(e)) {
          const { data } = await fetchFileText(path)
          this.viewerMode = 'text'
          this.textContent = data?.content ?? ''
          return
        }

        const res = await fetchFileBlob(path)
        const buf = res.data
        this.officeBuffer = buf
        this.viewerBlobUrl = URL.createObjectURL(new Blob([buf]))

        if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(e)) {
          this.viewerMode = 'image'
        } else if (e === '.pdf') {
          this.viewerMode = 'pdf'
        } else if (['.xlsx', '.xls'].includes(e)) {
          this.loadExcel(buf)
          this.viewerMode = 'excel'
        } else if (e === '.csv') {
          this.loadCsv(buf)
          this.viewerMode = 'excel'
        } else if (e === '.docx') {
          await this.previewDocx(buf)
        } else if (e === '.doc') {
          this.viewerMode = 'unsupported'
        } else {
          this.viewerMode = 'unsupported'
        }
      } catch (err) {
        this.$buefy.toast.open({ message: err?.msg || '打开失败', type: 'is-danger' })
        this.viewerOpen = false
      }
    },
    loadExcel(buf) {
      this.workbook = XLSX.read(buf, { type: 'array' })
      this.sheetNames = this.workbook.SheetNames
      this.activeSheet = 0
      this.applySheet(0)
    },
    loadCsv(buf) {
      const text = new TextDecoder().decode(buf)
      this.workbook = XLSX.read(text, { type: 'string' })
      this.sheetNames = this.workbook.SheetNames
      this.activeSheet = 0
      this.applySheet(0)
    },
    applySheet(idx) {
      const name = this.sheetNames[idx]
      const sheet = this.workbook.Sheets[name]
      const arr = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
      const maxCol = Math.max(10, ...arr.map((r) => r.length))
      this.sheetRows = []
      const rows = Math.max(20, arr.length)
      for (let i = 0; i < rows; i++) {
        const row = []
        for (let j = 0; j < maxCol; j++) {
          row.push(arr[i] && arr[i][j] !== undefined ? String(arr[i][j]) : '')
        }
        this.sheetRows.push(row)
      }
    },
    switchSheet(idx) {
      this.saveCurrentSheet()
      this.activeSheet = idx
      this.applySheet(idx)
    },
    saveCurrentSheet() {
      if (!this.workbook || !this.sheetNames.length) return
      const name = this.sheetNames[this.activeSheet]
      const ws = XLSX.utils.aoa_to_sheet(this.sheetRows)
      this.workbook.Sheets[name] = ws
    },
    async previewDocx(buffer) {
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
        this.htmlContent = result.value
        this.viewerMode = 'docx'
        this.htmlEdit = false
      } catch (err) {
        this.viewerMode = 'unsupported'
        console.warn('docx preview failed', err)
      }
    },
    startHtmlEdit() {
      this.viewerMode = 'html'
      this.htmlEdit = true
    },
    onHtmlInput(e) {
      this.htmlContent = e.target.innerHTML
    },
    async saveViewer() {
      this.viewerSaving = true
      try {
        if (this.viewerMode === 'text') {
          await saveFileText(this.viewerPath, this.textContent)
        } else if (this.viewerMode === 'html') {
          const htmlPath = this.viewerPath.replace(/\.docx?$/i, '.html')
          await saveFileText(htmlPath, this.htmlContent)
          this.$buefy.toast.open({ message: `已保存为 ${htmlPath.split('/').pop()}`, type: 'is-success' })
          this.viewerSaving = false
          return
        } else if (this.viewerMode === 'excel') {
          this.saveCurrentSheet()
          const out = XLSX.write(this.workbook, { bookType: 'xlsx', type: 'array' })
          const blob = new Blob([out], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          })
          const file = new File([blob], this.viewerName, { type: blob.type })
          await uploadBinary(file, this.viewerPath)
        }
        this.$buefy.toast.open({ message: '已保存', type: 'is-success' })
      } catch (e) {
        this.$buefy.toast.open({ message: e?.msg || '保存失败', type: 'is-danger' })
      } finally {
        this.viewerSaving = false
      }
    },
    removeItem(item) {
      this.$buefy.dialog.confirm({
        title: '删除',
        message: `确定删除「${item.name}」？`,
        type: 'is-danger',
        confirmText: '删除',
        onConfirm: async () => {
          try {
            const { data } = await deleteFile(item.path)
            if (data?.ok) {
              this.items = data.items || []
              this.$buefy.toast.open({ message: '已删除', type: 'is-success' })
            }
          } catch (e) {
            this.$buefy.toast.open({ message: e?.msg || '删除失败', type: 'is-danger' })
          }
        },
      })
    },
    revokeBlob() {
      if (this.viewerBlobUrl) {
        URL.revokeObjectURL(this.viewerBlobUrl)
        this.viewerBlobUrl = ''
      }
    },
    closeViewer() {
      this.revokeBlob()
      this.viewerOpen = false
      this.officeBuffer = null
      this.workbook = null
      this.viewerMode = ''
      this.htmlEdit = false
    },
  },
}
</script>

<style lang="less" scoped>
@primary: #20bc56;
@border: #e2e8f0;
@text: #1e293b;
@muted: #64748b;

.files-panel {
  height: 100%;
  min-height: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.files-toolbar {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid @border;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
}

.files-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.breadcrumb-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.breadcrumb-icon {
  color: @primary;
  font-size: 18px;
  flex-shrink: 0;
}

.breadcrumb {
  font-size: 13px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  a {
    color: @primary;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }

  .crumb-seg i {
    margin: 0 8px;
    color: #94a3b8;
    font-size: 9px;
  }
}

.tool-btns {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-upload,
.btn-tool {
  border: 1px solid @border;
  background: #fff;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: @text;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;

  &:hover {
    border-color: @primary;
    color: @primary;
    background: #f0fdf4;
  }

  &.primary {
    background: linear-gradient(135deg, #22c65b, @primary);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 4px 12px rgba(32, 188, 86, 0.3);

    &:hover {
      color: #fff;
      transform: translateY(-1px);
    }
  }

  &.icon-only {
    padding: 8px 12px;
  }
}

.btn-upload input {
  display: none;
}

.files-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    padding: 12px 18px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: @muted;
    background: #f8fafc;
    border-bottom: 1px solid @border;
  }

  td {
    padding: 12px 18px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  .file-row {
    cursor: pointer;
    transition: background 0.12s;

    &:hover td {
      background: #f0fdf4;
    }
  }

  .row-up td {
    color: @muted;
    cursor: pointer;
    font-weight: 500;

    &:hover td {
      background: #f8fafc;
    }
  }
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 16px;

  &.folder {
    background: #fef3c7;
    color: #d97706;
  }
  &.word {
    background: #dbeafe;
    color: #2563eb;
  }
  &.excel {
    background: #dcfce7;
    color: #16a34a;
  }
  &.text {
    background: #f1f5f9;
    color: #475569;
  }
  &.image {
    background: #fce7f3;
    color: #db2777;
  }
  &.pdf {
    background: #fee2e2;
    color: #dc2626;
  }
  &.file {
    background: #f1f5f9;
    color: #64748b;
  }
  &.up {
    background: #e2e8f0;
    color: #64748b;
  }
}

.file-name {
  font-weight: 500;
  color: @text;
}

.td-act {
  white-space: nowrap;
}

.link-btn {
  border: none;
  background: none;
  color: @primary;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 12px;
  padding: 4px 0;

  &:hover {
    text-decoration: underline;
  }

  &.danger {
    color: #ef4444;
  }
}

.empty-cell {
  text-align: center;
  padding: 56px 24px !important;
  color: @muted;

  i {
    font-size: 40px;
    color: #cbd5e1;
    margin-bottom: 12px;
  }

  p {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    color: #94a3b8;
  }

  span {
    font-size: 13px;
  }
}

.files-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px;
  color: @muted;

  i {
    font-size: 28px;
    color: @primary;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.viewer-mask {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 20px;
}

.viewer-box {
  width: 100%;
  max-width: 1180px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
}

.viewer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid @border;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
}

.viewer-title {
  font-weight: 600;
  font-size: 15px;
  color: @text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  i {
    color: @primary;
    margin-right: 8px;
  }
}

.viewer-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: linear-gradient(135deg, #22c65b, @primary);
  color: #fff;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(32, 188, 86, 0.3);
}

.btn-tool {
  border: 1px solid @border;
  background: #fff;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  color: @text;
  text-decoration: none;

  &:hover {
    background: #f8fafc;
  }
}

.btn-close {
  border: none;
  background: #f1f5f9;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  color: @muted;
  transition: background 0.15s;

  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }
}

.viewer-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #fafbfc;
}

.text-editor {
  width: 100%;
  min-height: 100%;
  height: 100%;
  border: none;
  padding: 20px 24px;
  font-family: Consolas, Monaco, monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  box-sizing: border-box;
  background: #fff;
}

.html-editor {
  min-height: 100%;
  padding: 28px 36px;
  margin: 16px;
  outline: none;
  background: #fff;
  border: 1px solid @border;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  line-height: 1.7;
}

.docx-html-view {
  min-height: 100%;
  padding: 32px 48px;
  overflow: auto;
  background: #fff;
  margin: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  line-height: 1.75;
  font-size: 15px;
}

.unsupported-view {
  text-align: center;
  padding: 64px 24px;
  color: @muted;

  p {
    margin-bottom: 20px;
    font-size: 15px;
  }
}

.img-view {
  max-width: 100%;
  display: block;
  margin: 0 auto;
  padding: 24px;
}

.pdf-view {
  width: 100%;
  height: 100%;
  min-height: 480px;
  border: none;
  background: #fff;
}

.excel-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  border: 1px solid @border;
  overflow: hidden;
}

.excel-bar {
  padding: 10px 14px;
  border-bottom: 1px solid @border;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 600;
  color: @muted;
}

.sheet-tab {
  border: 1px solid @border;
  background: #fff;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &.active {
    border-color: @primary;
    background: #f0fdf4;
    color: #166534;
  }
}

.excel-scroll {
  overflow: auto;
  flex: 1;
}

.excel-table {
  border-collapse: collapse;
  font-size: 13px;

  td {
    border: 1px solid #e2e8f0;
    padding: 0;
    min-width: 110px;
  }

  input {
    width: 100%;
    border: none;
    padding: 8px 10px;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
    background: #fff;

    &:focus {
      background: #f0fdf4;
      box-shadow: inset 0 0 0 2px rgba(32, 188, 86, 0.25);
    }
  }
}

@media (max-width: 768px) {
  .files-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .tool-btns {
    justify-content: flex-end;
  }

  .files-table th:nth-child(2),
  .files-table td:nth-child(2) {
    display: none;
  }
}
</style>
