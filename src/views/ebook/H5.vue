<template>
  <div class="home">
    <div id="bookDom" :style="{ backgroundColor: bgColor }"></div>
  </div>
</template>

<script>
import 'jszip'
import Vue from 'vue'
import Epub from 'epubjs'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import bookList from "@/services/book.json"

Vue.use(BackTop)
export default {
  name: 'ebook',
  components: {
    Navbar,
    Sidebar,
    Footer
  },
  mounted() {
    this.init(this.bookUrl)
  },
  data() {
    return {
      currentTheme: {
        name: 'default',
        style: {
          body: {
            color: '#000',
            background: '#fff',
          }
        }
      },
      themeList: [
        {
          name: 'default',
          style: {
            body: {
              color: '#000',
              background: '#fff',
            }
          }
        },
        {
          name: 'orange',
          style: {
            body: {
              color: '#000',
              background: '#f9f4e9',
            }
          }
        },
        {
          name: 'green',
          style: {
            body: {
              color: '#000',
              background: '#ceeaba',
            }
          }
        },
        {
          name: 'grey',
          style: {
            body: {
              color: '#fff',
              background: '#6d6d6f',
            }
          }
        },
        {
          name: 'black',
          style: {
            body: {
              color: '#fff',
              background: '#3b403c',
            }
          }
        },
      ],
      fontSize: 14,
      directory: [],
      currentNav: '',
      bookCoverSrc: '',
      rendition: null,
      showDropdown: false,
      currentBookIndex: 2,
      bookName: '斗罗大陆1绝世唐门',
      bookUrl: '斗罗大陆1.epub',
      bookList: bookList,
      file: null
    }
  },
  computed: {
    bgColor() {
      return this.currentTheme.style.body.background
    },
    fontSizeVal() {
      return `${this.fontSize}px`
    }
  },
  methods: {
    async init(path, isLocal = false) {
      let bookUrl
      if (isLocal) {
        bookUrl = path
      } else {
        bookUrl = `${this.OBS}${path}`
      }
      const BOOK = new Epub(bookUrl)
      this.rendition = BOOK.renderTo('bookDom', {
        method: 'default',
        manager: "default",
        width: '100%',
        height: '100%',
        view: 'iframe',
        flow: 'scrolled',
        snap: true,
        allowScriptedContent: true,
      })
      this.rendition.themes.fontSize(this.fontSizeVal)
      this.rendition.book.coverUrl().then((url) => {
        this.bookCoverSrc = url
      })
      let navigation = await this.rendition.book.loaded.navigation
      let directory = navigation.toc
      let curNav = directory[this.currentBookIndex]
      this.directory = directory
      this.currentNav = curNav
      this.rendition.display(curNav.href)
      this.themeList.forEach((theme) => {
        this.rendition.themes.register(theme.name, theme.style)
      })
    },
    handlePrev() {
      this.currentBookIndex -= 1
      this.rendition.prev()
    },
    handleNext() {
      this.currentBookIndex += 1
      this.rendition.next()
    },
    jumpPage(item, index) {
      this.currentBookIndex = index
      this.currentNav = item
      this.rendition.display(item.href)
    },
    changeTheme(name) {
      this.rendition.themes.select(name)
    },
    handlePlusFontSize() {
      this.fontSize += 1
      this.changeFontSize(this.fontSize)
    },
    handleMinusFontSize() {
      this.fontSize -= 1
      this.changeFontSize(this.fontSize)
    },
    changeFontSize(fontSize) {
      this.fontSize = fontSize
      this.rendition.themes.fontSize(this.fontSizeVal)
    },
    handleShowDropdownBook() {
      this.showDropdown = !this.showDropdown
    },
    handleDestroy() {
      this.rendition.destroy()
    },
    handleChangeBook(book) {
      this.handleDestroy()
      this.init(book.url)
      this.handleShowDropdownBook()
      this.bookName = book.name
    },
    handleUploadEbook(file) {
      this.handleDestroy()
      this.init(file, true)
      this.handleShowDropdownBook()
      this.bookName = file.name
    },
  }
}
</script>

<style lang="less" scoped>
.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
}

.section-box {
  margin-bottom: 20px;
}

.content-box {
  background: #EEEEF4;
  display: flex;
  justify-content: flex-start;
  .nav-list {
    width: 300px;
    background: #F8F8FA;
    .panel {
      padding: 20px 0;
      height: 100vh;
      overflow-y: auto;
      .directory-font {
        color: rgb(51, 51, 51);
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }
      .is-active {
        color: #7957d5;
        text-decoration: underline;
      }
    }
  }

  .ebook-box {
    margin-bottom: 48px;
    width: calc(100% - 300px);
    min-height: 100vh;
    padding: 28px 300px 0 300px;
    z-index: 99;
    .top-operate-box {
      display: flex;
      justify-content: space-between;
      padding-bottom: 20px;
      .left-box {
        display: flex;
        justify-content: flex-start;
        .color-change {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          .color-text-box {
            font-size: 20px;
            font-weight: 400;
            color: #666;
            margin-right: 10px;
            min-width: 24px;
          }
          .color-list {
            display: flex;
            justify-content: flex-start;
            .color-btn {
              width: 24px;
              height: 24px;
              border-radius: 12px;
              border: 1px solid transparent;
              cursor: pointer;
              -webkit-transition: all .2s ease;
              transition: all .2s ease;
              margin: 0 5px;
            }
            .color-btn1 {
              background: #fcfcfc;
              border-color: #d5d5d5;
            }
            .color-btn2 {
              background: #f9f4e9;
              border-color: #bbb6ab;
            }
            .color-btn3 {
              background: #ceeaba;
              border-color: #a0ea9c;
            }
            .color-btn4 {
              background: #6d6d6f;
              border-color: #535353;
            }
            .color-btn5 {
              background: #3b403c;
              border-color: #424242;
            }
          }
        }
        .font-size-change {
          margin-left: 30px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          .font-text-box {
            font-size: 20px;
            color: #666;
            min-width: 24px;
            margin-right: 10px;
          }
          .font-btn {
            width: 24px;
            height: 24px;
            font-size: 12px;
            text-align: center;
            line-height: 24px;
            color: #999;
            margin-right: 6px;
          }
          .font-size-val {
            font-size: 20px;
            color: #666;
          }
          .plus-btn {
            border: 1px solid #cecece;
            border-radius: 50%;
            cursor: pointer;
          }
          .minus-btn {
            border: 1px solid #cecece;
            border-radius: 50%;
            cursor: pointer;
          }
        }
        .change-page {
          margin-left: 20px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          .btn {
            margin-right: 10px;
            &:hover {
              color: #1a73e8;
              text-decoration: underline;
              cursor: pointer;
            }
          }
        }
      }
      .right-box {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .img-box {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 20px;
          .img {
            width: 30px;
            height: 30px;
          }
        }
      }
    }
    .jump-box {
      display: flex;
      justify-content: flex-start;
      flex-direction: column;
      background: #FFFFFF;
      .operate-box {
        display: flex;
        justify-content: space-between;
        width: 100%;
        border-top: 1px solid #e4e4e4;
        padding: 48px 120px 20px 120px;
        .btn {
          width: 330px;
          height: 60px;
          background-color: hsla(0,0%,95%,.8);
          border-radius: 4px;
          font-size: 14px;
          color: #1890ff;
          cursor: pointer;
          line-height: 60px;
          text-align: center;
          &:hover {
            text-decoration: underline;
          }
        }
      }

      .upgrade-membership {
        padding: 28px 120px 48px 120px;
        text-align: center;
        font-size: 14px;
      }
    }
  }
}

#bookDom {
  min-height: 100vh;
  /deep/ .epub-container {
    overflow-x: hidden !important;
    /deep/ .epub-view{
      padding-top: 40px !important;
      padding-bottom: 40px !important;
    }
    /deep/ p {
      font-size: 20px !important;
      line-height: 26px !important;
      font-family: Microsoft Yahei, Heiti SC, Heiti TC,serif !important;
      font-weight: normal !important;
      position: static !important;
    }
  }
}
</style>
