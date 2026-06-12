<template>
  <div class="home base64-page">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/base64`" pageTitle="Base64加解密"></Navbar>
    </div>

    <div class="content-box">
      <div class="container">
        <UtilPageColumns>
          <div class="columns">
            <div class="column bg-white is-three-quarters">
              <div class="b64-input">
                <o-field label="待处理内容：" variant="primary" :message="remark">
                  <o-input
                    maxlength="2000000"
                    variant="success"
                    v-model="content"
                    placeholder="QmFRaVdMQGdtYWlsLmNvbQ=="
                    icon-pack="fas"
                    icon-right="close-circle"
                    icon-right-clickable
                    @input="handleChangeBase64"
                    @icon-right-click="handleClearBase64"
                  />
                </o-field>
              </div>

              <div class="b64-result">
                <o-field label="处理后结果：">
                  <o-input maxlength="2000000" type="textarea" rows="4" v-model="result"></o-input>
                </o-field>
              </div>

              <div class="pass-operate">
                <div class="btns">
                  <o-button
                    :disabled="isDisabled"
                    :variant="isType"
                    icon-pack="fas"
                    :icon-left="icon"
                    @click="handleBase64"
                  >
                    {{ title }}
                  </o-button>
                  <o-button
                    :disabled="!result"
                    variant="warning"
                    icon-pack="fas"
                    icon-left="copy"
                    @click="copyResult"
                  >
                    复制
                  </o-button>
                </div>
              </div>
            </div>
            <SidebarColumn />
          </div>
        </UtilPageColumns>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"></back-top>
    </div>
    <div id="footer">
      <Footer />
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import SidebarColumn from '@/components/SidebarColumn.vue'
import UtilPageColumns from '@/components/UtilPageColumns.vue'
import Footer from '@/components/Footer.vue'
import { isBase64 } from '@/utils/helper'

export default {
  name: 'Base64',
  components: {
    Navbar,
    SidebarColumn,
    UtilPageColumns,
    Footer,
  },
  data() {
    return {
      title: 'Base64解密',
      icon: 'unlock',
      content: '',
      result: '',
      isType: 'success',
      remark: '自动识别是否是编码后的base64字符串，识别为base64字符串时，自动解密，反之加密',
    }
  },
  computed: {
    isDisabled() {
      return this.content.length === 0
    },
  },
  methods: {
    handleChangeBase64(res) {
      const isBase64Res = isBase64(res)
      if (isBase64Res) {
        this.title = 'Base64解密'
        this.icon = 'unlock'
        this.isType = 'success'
      } else {
        this.title = 'Base64加密'
        this.icon = 'lock'
        this.isType = 'danger'
      }
    },
    handleClearBase64() {
      this.content = ''
      this.result = ''
    },
    handleBase64() {
      const val = this.content ? this.content.trim() : ''
      if (!val) {
        this.$toast.open({ message: '请输入内容', type: 'is-warning' })
        return
      }

      const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

      try {
        if (base64Regex.test(val)) {
          const decoded = atob(val)
          this.result = decodeURIComponent(
            Array.prototype.map
              .call(decoded, (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          this.$toast.open({ message: '检测到 Base64，已为您解密', type: 'is-success' })
        } else {
          throw new Error('Not Base64')
        }
      } catch {
        this.result = btoa(
          encodeURIComponent(val).replace(/%([0-9A-F]{2})/g, (match, p1) =>
            String.fromCharCode('0x' + p1)
          )
        )
        this.$toast.open({ message: '非 Base64 格式，已为您加密', type: 'is-info' })
      }
    },
    copyResult() {
      this.$copyText(this.result)
        .then(() => this.onCopySuccess())
        .catch(() => this.onCopyError({ text: '复制失败' }))
    },
    onCopySuccess() {
      this.$notify({
        duration: 3000,
        message: `复制成功：${this.result}`,
        type: 'is-success',
        position: 'is-bottom-right',
        actionText: 'Msg',
      })
    },
    onCopyError(err) {
      if (err.text === undefined) {
        err.text = '复制失败'
      }
      this.$notify({
        duration: 3000,
        message: `${err.text}`,
        type: 'is-danger',
        position: 'is-bottom-right',
        actionText: 'Msg',
      })
    },
  },
}
</script>

<style lang="less" scoped>
.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
  margin-bottom: 35px;
  border-bottom: 2px solid #e1e1e1;
}

.content-box {
  overflow-x: hidden;
}

.bg-white {
  padding: 28px 24px 24px;
  background-color: #ffffff;
  margin-bottom: 40px;
  box-sizing: border-box;
  min-width: 0;

  :deep(.field) {
    margin-bottom: 0.75rem;
  }
}

.b64-input {
  width: 100%;
  padding-top: 12px;

  :deep(.field) {
    width: 100%;
    margin-bottom: 0;
  }

  :deep(.control) {
    width: 100%;
  }

  :deep(.label) {
    font-weight: 600;
    color: #363636;
    margin-bottom: 6px;
  }

  :deep(.help) {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.5;
    color: #7a7a7a;
    word-break: break-word;
    white-space: normal;
  }

  :deep(.input) {
    width: 100%;
    height: 42px;
    padding: 0 14px;
    font-size: 1rem;
    border: 1px solid #dbdbdb;
    border-radius: 6px;
    box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.04);
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: #b5b5b5;
    }

    &:focus {
      border-color: #20bc56;
      box-shadow: 0 0 0 3px rgba(32, 188, 86, 0.15);
    }
  }
}

.b64-result {
  margin-top: 20px;
  width: 100%;

  :deep(.field) {
    width: 100%;
  }

  :deep(.control) {
    width: 100%;
  }

  :deep(.label) {
    font-weight: 600;
    color: #363636;
    margin-bottom: 6px;
  }

  :deep(.textarea),
  :deep(textarea.input) {
    width: 100%;
    min-height: 130px;
    padding: 12px 14px;
    font-size: 1rem;
    line-height: 1.65;
    font-family: Consolas, Monaco, 'Courier New', monospace;
    color: #363636;
    background: #fafafa;
    border: 1px solid #dbdbdb;
    border-radius: 6px;
    resize: vertical;
    box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.04);
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;

    &:hover {
      border-color: #b5b5b5;
    }

    &:focus {
      background: #fff;
      border-color: #20bc56;
      box-shadow: 0 0 0 3px rgba(32, 188, 86, 0.15);
    }

    &::placeholder {
      color: #b5b5b5;
    }
  }
}

.pass-operate {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  .btns {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.sidebar-column {
  min-width: 0;
}

@media screen and (max-width: 768px) {
  .base64-page {
    overflow-x: hidden;
  }

  .nav-box {
    margin-bottom: 16px;
  }

  .content-box {
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }

  .content-box > .container {
    width: 100%;
    max-width: 100%;
    padding: 0 12px;
    box-sizing: border-box;
  }

  .bg-white {
    padding: 16px 14px;
    margin-bottom: 16px;
    box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  }

  .b64-input {
    padding-top: 0;

    :deep(.help) {
      font-size: 12px;
    }

    :deep(.input) {
      height: 40px;
      font-size: 14px;
    }
  }

  .b64-result {
    margin-top: 16px;

    :deep(.textarea),
    :deep(textarea.input) {
      min-height: 160px;
      font-size: 14px;
    }
  }

  .pass-operate {
    justify-content: stretch;
    margin-top: 12px;

    .btns {
      width: 100%;
      flex-direction: column;
      gap: 10px;
    }

    :deep(.button) {
      width: 100%;
      justify-content: center;
      min-height: 42px;
    }
  }
}
</style>
