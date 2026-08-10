<template>
  <div class="reader-page">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="电子书阅读器" />
    </div>

    <div class="reader-layout">
      <aside class="reader-sidebar" :class="{ 'is-collapsed': !sidebarOpen }">
        <div class="sidebar-book">
          <div class="cover-wrap">
            <img
              v-if="bookCoverSrc"
              class="cover-img"
              :src="bookCoverSrc"
              :alt="bookName"
            >
            <div v-else class="cover-placeholder">
              <AppIcon name="book" aria-hidden="true" />
            </div>
          </div>
          <h2 class="book-title">{{ bookName }}</h2>
          <p v-if="currentAuthor" class="book-author">{{ currentAuthor }}</p>
        </div>

        <div class="sidebar-toc">
          <div class="toc-head">
            <span class="toc-label">目录</span>
            <span v-if="directory.length" class="toc-count">{{ directory.length }} 章</span>
          </div>
          <nav v-if="directory.length" class="toc-list">
            <button
              v-for="(item, index) in directory"
              :key="item.id || index"
              type="button"
              class="toc-item"
              :class="{ 'is-active': currentBookIndex === index }"
              :title="item.label"
              @click="jumpPage(item, index)"
            >
              <span class="toc-index">{{ index + 1 }}</span>
              <span class="toc-text">{{ item.label }}</span>
            </button>
          </nav>
          <p v-else-if="!loading" class="toc-empty">暂无目录，请切换书籍或上传本地 EPUB</p>
        </div>
      </aside>

      <main class="reader-main">
        <header class="reader-toolbar">
          <div class="toolbar-group toolbar-group--left">
            <button
              type="button"
              class="toolbar-icon-btn sidebar-toggle"
              :aria-label="sidebarOpen ? '收起目录' : '展开目录'"
              @click="sidebarOpen = !sidebarOpen"
            >
              <AppIcon name="bars" aria-hidden="true" />
            </button>

            <div class="toolbar-divider" />

            <div class="theme-picker">
              <span class="toolbar-label">配色</span>
              <div class="theme-swatches">
                <button
                  v-for="theme in themeList"
                  :key="theme.name"
                  type="button"
                  class="theme-swatch"
                  :class="[`theme-swatch--${theme.name}`, { 'is-active': activeTheme === theme.name }]"
                  :aria-label="themeLabel(theme.name)"
                  @click="changeTheme(theme.name)"
                />
              </div>
            </div>

            <div class="toolbar-divider" />

            <div class="font-picker">
              <span class="toolbar-label">字号</span>
              <button type="button" class="font-btn" aria-label="减小字号" @click="handleMinusFontSize">
                <AppIcon name="minus" aria-hidden="true" />
              </button>
              <span class="font-value">{{ fontSize }}</span>
              <button type="button" class="font-btn" aria-label="增大字号" @click="handlePlusFontSize">
                <AppIcon name="plus" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="toolbar-group toolbar-group--right">
            <div class="book-picker" v-click-outside="closeDropdown">
              <button
                type="button"
                class="book-picker-trigger"
                :aria-expanded="showDropdown"
                @click="handleShowDropdownBook"
              >
                <AppIcon name="book" class="book-picker-icon" aria-hidden="true" />
                <span class="book-picker-text">{{ bookName }}</span>
                <AppIcon name="angle-down" class="book-picker-chevron" aria-hidden="true" />
              </button>
              <div v-show="showDropdown" class="book-picker-menu" role="menu">
                <button
                  v-for="(book, index) in bookList"
                  :key="index"
                  type="button"
                  class="book-picker-item"
                  :class="{ 'is-active': bookName === book.name }"
                  role="menuitem"
                  @click="handleChangeBook(book)"
                >
                  <span class="book-picker-item-name">{{ book.name }}</span>
                  <span class="book-picker-item-author">{{ book.author }}</span>
                </button>
                <div class="book-picker-upload">
                  <o-field class="file is-fullwidth" :class="{ 'has-name': !!file }">
                    <o-upload
                      v-model="file"
                      class="file-label"
                      accept=".epub"
                      @update:model-value="handleUploadEbook"
                    >
                      <span class="file-cta">
                        <AppIcon name="upload" class="file-icon" />
                        <span class="file-label">上传本地 .epub</span>
                      </span>
                    </o-upload>
                  </o-field>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div class="reader-viewport" :style="{ backgroundColor: bgColor }">
          <div v-if="loading" class="reader-state">
            <div class="reader-spinner" />
            <p>正在加载书籍…</p>
          </div>
          <p v-else-if="loadError" class="reader-error">{{ loadError }}</p>
          <div id="bookDom" class="reader-canvas" :class="{ 'is-hidden': loading || loadError }" />
        </div>

        <footer class="reader-footer">
          <button type="button" class="nav-btn" :disabled="!rendition" @click="handlePrev">
            <AppIcon name="chevron-left" aria-hidden="true" />
            上一页
          </button>
          <span class="reader-hint">支持 ← → 方向键翻页</span>
          <button type="button" class="nav-btn" :disabled="!rendition" @click="handleNext">
            下一页
            <AppIcon name="chevron-right" aria-hidden="true" />
          </button>
        </footer>
      </main>
    </div>

    <div class="backtop">
      <back-top color="#7957d5" :size="1.1" :slow="10" />
    </div>
    <Footer />
  </div>
</template>

<script>
import 'jszip'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import bookList from '@/services/book.json'
import { destroyEbookReader, openEbookReader } from '@/utils/ebookReader'

const defaultBook = bookList[0] || { name: '', url: '', author: '' }

const THEME_LABELS = {
  default: '默认白',
  orange: '护眼黄',
  green: '清新绿',
  grey: '深灰',
  black: '夜间黑',
}

export default {
  name: 'ebook',
  components: {
    Navbar,
    Footer,
  },
  mounted() {
    this.init(this.bookUrl)
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
    this.handleDestroy()
  },
  data() {
    return {
      currentTheme: {
        name: 'default',
        style: {
          body: {
            color: '#000',
            background: '#fff',
          },
        },
      },
      themeList: [
        {
          name: 'default',
          style: {
            body: {
              color: '#1a1a2e',
              background: '#ffffff',
            },
          },
        },
        {
          name: 'orange',
          style: {
            body: {
              color: '#3d3428',
              background: '#f9f4e9',
            },
          },
        },
        {
          name: 'green',
          style: {
            body: {
              color: '#2d3a28',
              background: '#e8f5e0',
            },
          },
        },
        {
          name: 'grey',
          style: {
            body: {
              color: '#f0f0f0',
              background: '#5a5a5c',
            },
          },
        },
        {
          name: 'black',
          style: {
            body: {
              color: '#d4d4d4',
              background: '#1e1e1e',
            },
          },
        },
      ],
      fontSize: 16,
      directory: [],
      currentNav: '',
      bookCoverSrc: '',
      rendition: null,
      showDropdown: false,
      sidebarOpen: true,
      loading: false,
      activeTheme: 'default',
      currentBookIndex: 0,
      bookName: defaultBook.name,
      bookUrl: defaultBook.url,
      bookList,
      file: null,
      loadError: '',
    }
  },
  computed: {
    bgColor() {
      return this.currentTheme.style.body.background
    },
    fontSizeVal() {
      return `${this.fontSize}px`
    },
    currentAuthor() {
      const book = this.bookList.find((item) => item.name === this.bookName)
      return book?.author || ''
    },
  },
  methods: {
    themeLabel(name) {
      return THEME_LABELS[name] || name
    },
    async init(path, isLocal = false) {
      if (!path) return
      this.loadError = ''
      this.loading = true
      this.handleDestroy()
      try {
        const result = await openEbookReader({
          path,
          isLocal,
          fontSizeVal: this.fontSizeVal,
          themeList: this.themeList,
          currentBookIndex: this.currentBookIndex,
          onCover: (url) => {
            this.bookCoverSrc = url
          },
        })
        this.rendition = result.rendition
        this.directory = result.directory
        this.currentNav = result.currentNav
        this.currentBookIndex = result.currentBookIndex
      } catch (err) {
        console.error(err)
        this.directory = []
        this.bookCoverSrc = ''
        this.loadError = isLocal
          ? '无法打开该 EPUB 文件，请确认文件格式正确。'
          : '远程书籍加载失败，请尝试切换其他书籍或上传本地 .epub。'
      } finally {
        this.loading = false
      }
    },
    handleKeydown(event) {
      if (!this.rendition) return
      if (event.target?.closest('input, textarea, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        this.handlePrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        this.handleNext()
      }
    },
    handlePrev() {
      if (!this.rendition) return
      this.currentBookIndex = Math.max(0, this.currentBookIndex - 1)
      this.rendition.prev()
    },
    handleNext() {
      if (!this.rendition) return
      this.currentBookIndex += 1
      this.rendition.next()
    },
    jumpPage(item, index) {
      if (!this.rendition || !item?.href) return
      this.currentBookIndex = index
      this.currentNav = item
      this.rendition.display(item.href)
    },
    changeTheme(name) {
      this.activeTheme = name
      this.currentTheme = this.themeList.find((theme) => theme.name === name) || this.currentTheme
      this.rendition?.themes.select(name)
    },
    handlePlusFontSize() {
      if (this.fontSize >= 28) return
      this.fontSize += 1
      this.changeFontSize(this.fontSize)
    },
    handleMinusFontSize() {
      if (this.fontSize <= 12) return
      this.fontSize -= 1
      this.changeFontSize(this.fontSize)
    },
    changeFontSize(fontSize) {
      this.fontSize = fontSize
      this.rendition?.themes.fontSize(this.fontSizeVal)
    },
    handleShowDropdownBook() {
      this.showDropdown = !this.showDropdown
    },
    closeDropdown() {
      this.showDropdown = false
    },
    handleDestroy() {
      destroyEbookReader(this.rendition)
      this.rendition = null
    },
    handleChangeBook(book) {
      this.currentBookIndex = 0
      this.handleDestroy()
      this.bookName = book.name
      this.init(book.url)
      this.closeDropdown()
    },
    handleUploadEbook(file) {
      if (!file) return
      this.currentBookIndex = 0
      this.handleDestroy()
      this.bookName = file.name.replace(/\.epub$/i, '')
      this.init(file, true)
      this.closeDropdown()
    },
  },
}
</script>

<style lang="less" scoped>
.reader-page {
  min-height: 100vh;
  background: #f0f2f8;
}

.nav-box {
  background: #fff;
  border-bottom: 1px solid #e8eaf0;
}

.reader-layout {
  display: flex;
  min-height: calc(100vh - 56px);
  max-width: 1600px;
  margin: 0 auto;
}

.reader-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e8eaf0;
  transition: width 0.25s ease, opacity 0.25s ease;

  &.is-collapsed {
    width: 0;
    overflow: hidden;
    opacity: 0;
    border-right: none;
  }
}

.sidebar-book {
  padding: 24px 20px 16px;
  border-bottom: 1px solid #f0f2f8;
  text-align: center;
}

.cover-wrap {
  width: 120px;
  height: 168px;
  margin: 0 auto 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(30, 30, 60, 0.12);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #7957d5 0%, #5a3fb8 100%);
  color: rgba(255, 255, 255, 0.85);
  font-size: 2.5rem;
}

.book-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.4;
  margin: 0 0 4px;
}

.book-author {
  font-size: 13px;
  color: #8b8fa8;
  margin: 0;
}

.sidebar-toc {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.toc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 10px;
}

.toc-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8b8fa8;
}

.toc-count {
  font-size: 12px;
  color: #b0b4c8;
}

.toc-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 16px;
}

.toc-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 2px;
  border: none;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: #f5f6fb;
  }

  &.is-active {
    background: rgba(121, 87, 213, 0.1);

    .toc-index {
      background: #7957d5;
      color: #fff;
    }

    .toc-text {
      color: #7957d5;
      font-weight: 500;
    }
  }
}

.toc-index {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #eef0f6;
  font-size: 11px;
  line-height: 22px;
  text-align: center;
  color: #8b8fa8;
}

.toc-text {
  flex: 1;
  font-size: 13px;
  line-height: 1.45;
  color: #3d4058;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.toc-empty {
  padding: 20px;
  font-size: 13px;
  color: #b0b4c8;
  text-align: center;
  line-height: 1.6;
}

.reader-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.reader-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e8eaf0;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  &--right {
    margin-left: auto;
  }
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e8eaf0;
}

.toolbar-label {
  font-size: 13px;
  color: #8b8fa8;
  white-space: nowrap;
}

.toolbar-icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e8eaf0;
  border-radius: 8px;
  background: #fff;
  color: #5a5d78;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: #7957d5;
    color: #7957d5;
  }
}

.theme-picker,
.font-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-swatches {
  display: flex;
  gap: 6px;
}

.theme-swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: scale(1.08);
  }

  &.is-active {
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px #7957d5;
  }

  &--default {
    background: #fff;
    border-color: #d8dae6;
  }

  &--orange {
    background: #f9f4e9;
    border-color: #ddd5c4;
  }

  &--green {
    background: #e8f5e0;
    border-color: #b8d4a8;
  }

  &--grey {
    background: #5a5a5c;
    border-color: #48484a;
  }

  &--black {
    background: #1e1e1e;
    border-color: #333;
  }
}

.font-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e8eaf0;
  border-radius: 50%;
  background: #fff;
  color: #5a5d78;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: #7957d5;
    color: #7957d5;
  }
}

.font-value {
  min-width: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #3d4058;
}

.book-picker {
  position: relative;
}

.book-picker-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid #e8eaf0;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  max-width: 280px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: #7957d5;
    box-shadow: 0 2px 8px rgba(121, 87, 213, 0.12);
  }
}

.book-picker-icon {
  color: #7957d5;
  flex-shrink: 0;
}

.book-picker-text {
  font-size: 14px;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-picker-chevron {
  color: #b0b4c8;
  font-size: 12px;
  flex-shrink: 0;
}

.book-picker-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 200;
  min-width: 280px;
  max-height: 360px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(30, 30, 60, 0.14);
  padding: 6px;
}

.book-picker-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  &:hover,
  &.is-active {
    background: rgba(121, 87, 213, 0.08);
  }

  &.is-active .book-picker-item-name {
    color: #7957d5;
  }
}

.book-picker-item-name {
  font-size: 14px;
  color: #1a1a2e;
}

.book-picker-item-author {
  font-size: 12px;
  color: #8b8fa8;
}

.book-picker-upload {
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px solid #f0f2f8;

  :deep(.file-cta) {
    width: 100%;
    justify-content: center;
    border-radius: 8px;
    border: 1px dashed #d0d4e4;
    background: #fafbfe;
    color: #5a5d78;

    &:hover {
      border-color: #7957d5;
      color: #7957d5;
    }
  }
}

.reader-viewport {
  flex: 1;
  position: relative;
  min-height: 520px;
  transition: background-color 0.3s ease;
}

.reader-canvas {
  min-height: 520px;

  &.is-hidden {
    visibility: hidden;
    height: 0;
    min-height: 0;
    overflow: hidden;
  }
}

.reader-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #8b8fa8;
  font-size: 14px;
}

.reader-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8eaf0;
  border-top-color: #7957d5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.reader-error {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 480px;
  width: calc(100% - 40px);
  margin: 0;
  padding: 14px 18px;
  font-size: 14px;
  color: #b42318;
  background: #fef3f2;
  border: 1px solid #fecdca;
  border-radius: 10px;
  text-align: center;
  line-height: 1.5;
}

.reader-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  background: #fff;
  border-top: 1px solid #e8eaf0;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid #e8eaf0;
  border-radius: 10px;
  background: #fafbfe;
  color: #7957d5;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover:not(:disabled) {
    background: rgba(121, 87, 213, 0.08);
    border-color: #7957d5;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.reader-hint {
  font-size: 12px;
  color: #b0b4c8;
}

#bookDom {
  :deep(.epub-container) {
    overflow-x: hidden !important;
  }

  :deep(.epub-view) {
    padding: 32px 0 48px !important;
  }

  :deep(p) {
    font-size: inherit !important;
    line-height: 1.75 !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', serif !important;
    font-weight: normal !important;
    position: static !important;
  }
}

@media (max-width: 960px) {
  .reader-sidebar {
    position: fixed;
    left: 0;
    top: 56px;
    bottom: 0;
    z-index: 100;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);

    &.is-collapsed {
      width: 0;
    }
  }

  .reader-toolbar {
    padding: 10px 14px;
  }

  .toolbar-label {
    display: none;
  }

  .reader-footer {
    padding: 12px 14px;
  }

  .reader-hint {
    display: none;
  }
}
</style>
