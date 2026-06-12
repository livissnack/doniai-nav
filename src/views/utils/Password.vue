<template>
  <div class="home password-page">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/password`" pageTitle="密码生成器"></Navbar>
    </div>

    <div class="content-box">
      <div class="container">
        <UtilPageColumns>
          <div class="columns">
            <div class="column bg-white is-three-quarters">
              <div class="block clear-pd">
                <o-field class="pass-option-field">
                  <o-checkbox variant="success" v-model="checkList" native-value="number">
                    <span class="pass-option">
                      <span class="pass-option__title">普通数字</span>
                      <code class="pass-option__chars">0123456789</code>
                    </span>
                  </o-checkbox>
                </o-field>
                <o-field class="pass-option-field">
                  <o-checkbox variant="success" v-model="checkList" native-value="lower">
                    <span class="pass-option">
                      <span class="pass-option__title">小写字母</span>
                      <code class="pass-option__chars">abcdefghijklmnopqrstuvwxyz</code>
                    </span>
                  </o-checkbox>
                </o-field>
                <o-field class="pass-option-field">
                  <o-checkbox variant="success" v-model="checkList" native-value="upper">
                    <span class="pass-option">
                      <span class="pass-option__title">大写字母</span>
                      <code class="pass-option__chars">ABCDEFGHIJKLMNOPQRSTUVWXYZ</code>
                    </span>
                  </o-checkbox>
                </o-field>
                <o-field class="pass-option-field">
                  <o-checkbox variant="success" v-model="checkList" native-value="special">
                    <span class="pass-option">
                      <span class="pass-option__title">特殊符号</span>
                      <code class="pass-option__chars">~!@#$%^&amp;*()[{]}-_=+|;:'&quot;,./?`</code>
                    </span>
                  </o-checkbox>
                </o-field>

                <div class="pass-length">
                  <o-field label="密码长度：">
                    <o-input v-model="num" type="number" :min="4" :max="64" />
                  </o-field>
                </div>
              </div>

              <div class="pass-result">
                <o-field label="密码结果：">
                  <o-input maxlength="200" type="textarea" rows="4" v-model="password"></o-input>
                </o-field>
              </div>

              <div class="pass-operate">
                <div class="btns">
                  <o-button variant="success" icon-pack="fas" icon-left="lock" @click="handleGeneratePassword">生成随机密码</o-button>
                  <o-button variant="success" icon-pack="fas" icon-left="copy" @click="copyPassword">复制</o-button>
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
import { randomPass } from '@/utils/helper'

export default {
  name: 'Password',
  components: {
    Navbar,
    SidebarColumn,
    UtilPageColumns,
    Footer,
  },
  data() {
    return {
      checkList: ['number', 'lower', 'upper'],
      num: 16,
      password: '',
    }
  },
  methods: {
    handleGeneratePassword() {
      this.password = randomPass(this.num, this.checkList)
    },
    copyPassword() {
      this.$copyText(this.password)
        .then(() => this.onCopySuccess())
        .catch(() => this.onCopyError({ text: '复制失败' }))
    },
    onCopySuccess() {
      this.$notify({
        duration: 3000,
        message: `复制成功：${this.password}`,
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

.pass-option-field {
  :deep(.checkbox) {
    align-items: flex-start;
    max-width: 100%;
  }

  :deep(.checkbox input[type='checkbox']) {
    flex-shrink: 0;
    margin-top: 3px;
  }
}

.pass-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  line-height: 1.45;

  &__title {
    font-weight: 500;
    color: #363636;
  }

  &__chars {
    display: block;
    font-size: 12px;
    color: #6b7280;
    font-family: Consolas, Monaco, 'Courier New', monospace;
    word-break: break-all;
    white-space: normal;
    background: transparent;
    padding: 0;
  }
}

.clear-pd {
  padding: 12px 0 0;
}

.pass-length {
  max-width: 280px;
  margin-top: 12px;

  :deep(.label) {
    font-weight: 600;
    color: #363636;
    margin-bottom: 6px;
  }

  :deep(.input) {
    width: 100%;
    height: 42px;
    padding: 0 14px;
    font-size: 1.125rem;
    font-weight: 500;
    text-align: center;
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

.pass-result {
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

@media screen and (min-width: 769px) {
  .pass-option {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px;
  }
}

@media screen and (max-width: 768px) {
  .password-page {
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

  .pass-length {
    max-width: none;
    width: 100%;
  }

  .pass-result {
    :deep(.textarea),
    :deep(textarea.input) {
      min-height: 112px;
      font-size: 14px;
    }
  }

  .pass-operate {
    justify-content: stretch;

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
