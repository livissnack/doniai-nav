<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/qrcode`" pageTitle="二维码生成">
      </Navbar>
    </div>

    <div class="content-box">
      <div class="container-box">
        <div class="title-box">
          <div class="title1">
            二维码美化组件 <span class="tag is-primary">开源算法</span>
          </div>
          <div class="title2">
            仅需一个HTML标签，即可获得独具个性的二维码！图案随内容实时变化，让二维码更多彩~
          </div>
        </div>

        <div class="qrcode-box">
          <div class="show-box">
            <div class="set-qrcode">
              <div v-if="widgetLoading" class="qrcode-placeholder">
                <AppIcon name="spinner" spin  />
                <span>二维码组件加载中…</span>
              </div>
              <div v-else-if="widgetError" class="qrcode-placeholder is-error">
                <AppIcon name="exclamation-circle"  />
                <span>组件加载失败</span>
                <button type="button" class="retry-btn" @click="initWidget">重试</button>
              </div>
              <widget-qrcode
                v-else
                id="qrcode-generate"
                :value="qrcode.value"
                :template="qrcode.template"
                :level="qrcode.level"
                :width="qrcode.width"
                :height="qrcode.height"
                :background-color="qrcode.backgroundColor"
                :foreground-color="qrcode.foregroundColor"
                :inner-color="qrcode.innerColor"
                :outer-color="qrcode.outerColor"
                :background-image="qrcode.backgroundImage"
                :foreground-image="qrcode.foregroundImage"
                :logo="qrcode.logo"
                :text="qrcode.text"
                :text-color="qrcode.textColor"
                :text-stroke="qrcode.textStroke"
              />
            </div>
            <div class="buttons">
              <o-button variant="info" :disabled="!widgetReady" @click="downloadImg('png')">下载 PNG</o-button>
              <o-button variant="danger" :disabled="!widgetReady" @click="downloadImg('jpg')">下载 JPG</o-button>
            </div>
          </div>
          <div class="input-box">
            <div class="input-item">
              <div class="label-inner">
                <div class="line"></div>
                自定义标签
              </div>
              <div class="input-content">
                <code>&lt;widget-qrcode value="[二维码内容]"&gt;&lt;/widget-qrcode&gt;</code>
              </div>
            </div>
            <div class="input-item">
              <div class="label-inner">
                <div class="line"></div>
                实时演示
              </div>
              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">文本内容</div>
                  <input class="input is-small" v-model="qrcode.value" type="text" placeholder="请在此输入二维码内容">
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">风格模板</div>
                  <div class="block radio-group-wrap">
                    <o-radio size="small" v-model="qrcode.template" native-value="default">
                      默认
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.template" native-value="water">
                      液态
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.template" native-value="diamond">
                      菱形
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.template" native-value="hexagon">
                      六边形
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.template" native-value="star">
                      星星
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.template" native-value="rect">
                      方块
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.template" native-value="bar">
                      条形
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.template" native-value="heart">
                      心形
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.template" native-value="glitter">
                      闪烁
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.template" native-value="stroke">
                      描边
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.template" native-value="fusion">
                      融合
                    </o-radio>
                  </div>
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">纠错等级</div>
                  <div class="block radio-group-wrap">
                    <o-radio size="small" v-model="qrcode.level" native-value="M">
                      M
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.level" native-value="L">
                      L
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.level" native-value="Q">
                      Q
                    </o-radio>
                    <o-radio size="small" v-model="qrcode.level" native-value="H">
                      H
                    </o-radio>
                  </div>
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">颜色方案</div>

                  <div class="block tmp-block">
                    <div class="color-select">
                      <o-switch size="small" v-model="foregroundColorMode" variant="success">
                        {{ foregroundColorMode ? '组合色' : '单色' }}
                      </o-switch>
                      <input
                        class="input is-small"
                        type="color"
                        :value="pickHex(qrcode.foregroundColor)"
                        :disabled="foregroundColorMode"
                        @input="qrcode.foregroundColor = $event.target.value"
                      >
                      <div class="color-label">前景</div>
                    </div>

                    <div class="color-select">
                      <input
                        class="input is-small"
                        type="color"
                        :value="pickHex(qrcode.backgroundColor, '#ffffff')"
                        @input="qrcode.backgroundColor = $event.target.value"
                      >
                      <div class="color-label">背景</div>
                    </div>

                    <div class="color-select">
                      <input
                        class="input is-small"
                        type="color"
                        :value="pickHex(qrcode.innerColor)"
                        @input="qrcode.innerColor = $event.target.value"
                      >
                      <div class="color-label">定位内框</div>
                    </div>

                    <div class="color-select">
                      <input
                        class="input is-small"
                        type="color"
                        :value="pickHex(qrcode.outerColor)"
                        @input="qrcode.outerColor = $event.target.value"
                      >
                      <div class="color-label">定位外框</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="tmp-input-field field" v-show="foregroundColorMode">
                <div class="control">
                  <div class="input-label">前景组合色</div>
                  <input class="input is-small" v-model="qrcode.foregroundColor" type="text"
                         placeholder="前景色，默认：#000000;（多色用逗号分隔）">
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">悬浮文本内容</div>
                  <input class="input is-small" v-model="qrcode.text" type="text" placeholder="请在此输入悬浮文本内容">
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">悬浮文本颜色</div>

                  <div class="block tmp-block">
                    <div class="color-select">
                      <input
                        class="input is-small"
                        type="color"
                        :value="pickHex(qrcode.textColor)"
                        @input="qrcode.textColor = $event.target.value"
                      >
                      <div class="color-label">悬浮文本颜色</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">悬浮文本描边颜色</div>

                  <div class="block tmp-block">
                    <div class="color-select">
                      <input
                        class="input is-small"
                        type="color"
                        :value="pickHex(qrcode.textStroke, '#ffffff')"
                        @input="qrcode.textStroke = $event.target.value"
                      >
                      <div class="color-label">悬浮文本描边颜色</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">前景图片地址</div>
                  <input class="input is-small" v-model="qrcode.foregroundImage" type="text"
                         placeholder="请在此输入前景图片地址">
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">背景图片地址</div>
                  <input class="input is-small" v-model="qrcode.backgroundImage" type="text"
                         placeholder="请在此输入背景图片地址">
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">logo图片地址</div>
                  <input class="input is-small" v-model="qrcode.logo" type="text"
                         placeholder="请在此输入	logo图片地址">
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="table-inner">
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
            <caption class="caption">
              <h3 class="caption-text">
                <div class="line"></div>
                组件属性
              </h3>
            </caption>
            <thead>
            <tr>
              <th>属性</th>
              <th>说明</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>value</td>
              <td>二维码内容</td>
            </tr>
            <tr>
              <td>template</td>
              <td>
                样式模板,可选：'default','water','diamond','hexagon','star','rect','bar','heart','glitter','stroke','fusion'
              </td>
            </tr>
            <tr>
              <td>level</td>
              <td>纠错等级,可选：'M','L','Q','H'</td>
            </tr>
            <tr>
              <td>width</td>
              <td>二维码宽度，默认：300</td>
            </tr>
            <tr>
              <td>height</td>
              <td>二维码高度，默认：300</td>
            </tr>
            <tr>
              <td>background-color</td>
              <td>背景色，默认：#ffffff</td>
            </tr>
            <tr>
              <td>foreground-color</td>
              <td>前景色，默认：#000000;（多色用逗号分隔）</td>
            </tr>
            <tr>
              <td>inner-color</td>
              <td>定位点内层颜色，默认：#000000</td>
            </tr>
            <tr>
              <td>outer-color</td>
              <td>定位点外层颜色，默认：#000000</td>
            </tr>
            <tr>
              <td>background-image</td>
              <td>背景图片地址</td>
            </tr>
            <tr>
              <td>foreground-image</td>
              <td>前景图片地址</td>
            </tr>
            <tr>
              <td>logo</td>
              <td>logo图片地址</td>
            </tr>
            <tr>
              <td>text</td>
              <td>悬浮文本内容</td>
            </tr>
            <tr>
              <td>text-color</td>
              <td>悬浮文本颜色</td>
            </tr>
            <tr>
              <td>text-stroke</td>
              <td>悬浮文本描边</td>
            </tr>
            </tbody>
          </table>
        </div>


        <div class="demo-box">
          <h3 class="caption-text">
            <div class="line"></div>
            样例展示
          </h3>
        </div>

        <div class="qrcodes">
          <widget-qrcode class="qrcode-widget" template="fusion" level="M" background-image="https://minio.doniai.com/hiphup/qrcode/girl.jpeg"
                         background-color="#ffcc60"></widget-qrcode>
          <widget-qrcode class="qrcode-widget" id="show" template="fusion"
                         background-image="https://minio.doniai.com/hiphup/qrcode/monkey.jpeg" background-color="#ece8dd"
                         foreground-color="#000000" text="" text-color="#2c2b2e" text-stroke="#ece8dd"></widget-qrcode>
          <widget-qrcode class="qrcode-widget" template="diamond" logo="https://minio.doniai.com/hiphup/qrcode/snail.png"
                         foreground-image="https://minio.doniai.com/hiphup/qrcode/grass.png"
                         background-color="#fff2dc" inner-color="#094304"></widget-qrcode>
          <widget-qrcode class="qrcode-widget" template="water" logo="https://minio.doniai.com/hiphup/qrcode/earth.png"
                         foreground-color="#6d327c,#485DA6,#00a1ba,#00BF98,#36C486" background-color="#f1f8ff"
                         inner-color="#845EC2"></widget-qrcode>
          <widget-qrcode class="qrcode-widget" template="heart"
                         logo="https://minio.doniai.com/hiphup/qrcode/octopus.png" foreground-color="#ff9999"
                         background-color="#fff7f7" inner-color="#ce5050"></widget-qrcode>
          <widget-qrcode class="qrcode-widget" template="hexagon" foreground-color="#17252a,#2b7a78,#3aafa9"
                         background-color="#def2f1" inner-color="#17252a"></widget-qrcode>
          <widget-qrcode class="qrcode-widget" template="bar" foreground-color="#3b8686,#79bd9a,#f8ca00,#008c9e"
                         background-color="#f0f5f9" inner-color="#3B4E32"></widget-qrcode>
          <widget-qrcode class="qrcode-widget" template="glitter" foreground-color="#fe4365,#fc9d9a,#6d9d88,#490a3d"
                         background-color="#f9f1f1" inner-color="#881600" outer-color="#343838"></widget-qrcode>
          <widget-qrcode class="qrcode-widget" template="rect" foreground-color="#4abdac,#fc4a1a,#f7b733"
                         background-color="#f9f6f3" inner-color="#d66c44" outer-color="#037584"></widget-qrcode>
          <widget-qrcode class="qrcode-widget" template="star" level="L" foreground-color="#fc9000,#ffa935,#ffb756"
                         background-color="#034690"></widget-qrcode>
          <widget-qrcode class="qrcode-widget" template="stroke" foreground-color="#150f3f,#fb3242,#018bf8"
                         background-color="#edfaff"></widget-qrcode>
        </div>

        <div class="demo-box">
          <h3 class="caption-text">
            <div class="line"></div>
            感谢开源项目
          </h3>

          <div class="mit-list">
            <div class="list-item">
              <span>1、用到的开源组件：</span>
              <a href="https://github.com/mumuy/widget-qrcode/" target="_blank">widget-qrcode</a>
              <span> (MIT License)</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"></back-top>
    </div>
    <div id="footer">
      <Footer/>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { loadWidgetQrcode } from '@/utils/widgetQrcode'
import * as htmlToImage from 'html-to-image'
import FileSaver from 'file-saver'

export default {
  name: 'Qrcode',
  components: {
    Navbar,
    Footer,
  },
  data() {
    return {
      widgetLoading: true,
      widgetReady: false,
      widgetError: false,
      foregroundColorMode: false,
      qrcode: {
        value: 'https://nav.doniai.com/',
        template: 'diamond',
        level: 'M',
        width: 300,
        height: 300,
        backgroundColor: '#fff2dc',
        foregroundColor: '#000000',
        innerColor: '#094304',
        outerColor: '#000000',
        backgroundImage: '',
        // foregroundImage: 'https://doniai.oss-cn-shenzhen.aliyuncs.com/qrcode-bg/grass.png',
        foregroundImage: '',
        // logo: 'https://doniai.oss-cn-shenzhen.aliyuncs.com/qrcode-bg/snail.png',
        logo: '',
        text: '',
        textColor: '#2c2b2e',
        textStroke: '#ffffff',
      }
    }
  },
  mounted() {
    this.initWidget()
  },
  watch: {
    foregroundColorMode(mode) {
      if (!mode) {
        this.qrcode.foregroundColor = this.pickHex(this.qrcode.foregroundColor)
      }
    },
  },
  methods: {
    pickHex(color, fallback = '#000000') {
      const value = String(color || '').trim()
      if (/^#[0-9a-fA-F]{6}$/.test(value)) return value
      const first = value.split(',')[0]?.trim()
      if (/^#[0-9a-fA-F]{6}$/.test(first)) return first
      return fallback
    },
    async initWidget() {
      this.widgetLoading = true
      this.widgetError = false
      this.widgetReady = false
      try {
        await loadWidgetQrcode()
        this.widgetReady = true
      } catch (e) {
        console.error('widget-qrcode load failed:', e)
        this.widgetError = true
      } finally {
        this.widgetLoading = false
      }
    },
    handleCopyText(str) {
      this.$copyText(str).then(() => {
        let tmpStr = str.substring(0, 40)
        this.$notify({
          duration: 3000,
          message: `复制成功：${tmpStr} ...`,
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      }, (e) => {
        this.$notify({
          duration: 3000,
          message: `复制失败：${e.message}`,
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      })
    },
    downloadImg(type) {
      if (!this.widgetReady) return
      if (['png', 'jpg'].includes(type)) {
        const qrcodeWidget = document.getElementById('qrcode-generate')
        if (!qrcodeWidget) {
          this.$notify({
            duration: 3000,
            message: '二维码尚未渲染完成',
            type: 'is-warning',
            position: 'is-bottom-right',
            actionText: 'Msg',
          })
          return
        }
        htmlToImage
          .toBlob(qrcodeWidget)
          .then((blob) => {
            const fileName = `${Date.now()}.${type}`
            FileSaver.saveAs(blob, fileName)
          })
          .catch((e) => {
            console.error('download qrcode failed:', e)
            this.$notify({
              duration: 3000,
              message: '下载失败，请稍后重试',
              type: 'is-danger',
              position: 'is-bottom-right',
              actionText: 'Msg',
            })
          })
      } else {
        this.$notify({
          duration: 3000,
          message: `暂不支持${type}格式下载`,
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      }
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

.block-radio {
  display: flex;
  just-content: flex-start;
  gap: 10px;
}

.content-box {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 40px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 120px);

  .container-box {
    box-sizing: border-box;
    max-width: 1100px;
    width: 100%;
    background-color: #ffffff;
    padding: 20px 24px;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.06);

    .title-box {
      width: 100%;

      .title1 {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;

        .tag.is-primary {
          font-size: 12px;
          vertical-align: middle;
          margin-left: 8px;
          background-color: #2095f2;
          color: #fff;
          padding: 2px 8px;
          border-radius: 3px;
        }
      }

      .title2 {
        font-size: 15px;
        color: #666;
        line-height: 1.6;
      }
    }

    .qrcode-box {
      margin-top: 32px;
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      align-items: flex-start;

      .show-box {
        flex: 0 0 auto;

        .set-qrcode {
          width: 300px;
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 4px;
        }

        .qrcode-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: #888;
          font-size: 14px;
          padding: 24px;

          &.is-error {
            color: #e74c3c;
          }

          .retry-btn {
            margin-top: 4px;
            padding: 4px 14px;
            font-size: 13px;
            color: #2095f2;
            background: #fff;
            border: 1px solid #2095f2;
            border-radius: 4px;
            cursor: pointer;

            &:hover {
              background: #f0f8ff;
            }
          }
        }

        .buttons {
          margin-top: 12px;
          width: 300px;
          display: flex;
          gap: 12px;
        }
      }

      .input-box {
        flex: 1 1 360px;
        min-width: 0;
        background-color: #ffffff;
        padding: 12px 20px;
        box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(0, 0, 0, 0.075);

        .input-item {
          margin-bottom: 20px;

          .label-inner {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            display: flex;
            justify-content: flex-start;

            .line {
              width: 3px;
              background-color: #2095f2;
              height: 20px;
              margin-right: 10px;
            }
          }

          .field {
            margin-top: 20px;

            .control {
              display: flex;
              justify-content: flex-start;
              align-items: flex-start;
              gap: 12px;

              .input-label {
                flex-shrink: 0;
                width: 72px;
                padding-top: 6px;
                font-size: 12px;
                font-weight: bold;
                color: rgb(110, 119, 129);
              }

              .input {
                flex: 1;
                min-width: 0;
                max-width: 100%;
              }

              .block {
                flex: 1;
                min-width: 0;
                margin-left: 0;

                &.radio-group-wrap {
                  display: flex;
                  flex-wrap: wrap;
                  align-items: center;
                  gap: 8px 16px;
                  padding-top: 2px;

                  :deep(.o-radio) {
                    margin: 0;
                  }

                  :deep(label.radio) {
                    margin: 0;
                    white-space: nowrap;
                  }
                }

                .color-select {
                  display: flex;
                  justify-content: flex-start;
                  align-items: center;

                  .switch {
                    width: 82px;
                  }

                  .input {
                    width: 60px;
                  }

                  .color-label {
                    margin-left: 4px;
                    font-size: 12px;
                    color: #666;
                  }
                }
              }

              .tmp-block {
                display: flex;
                justify-content: flex-start;
                gap: 24px;
              }
            }
          }
        }
      }
    }

    .table-inner {
      margin-top: 32px;
      width: 100%;
      background-color: #ffffff;
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.075);
      overflow-x: auto;

      .table {
        .caption {
          padding: 4px 12px;
          text-align: left;
          background-color: #ffffff;

          .caption-text {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            font-size: 20px;
            color: #666;

            .line {
              width: 3px;
              background-color: #2095f2;
              height: 20px;
              margin-right: 10px;
            }
          }
        }
      }
    }

    .demo-box {
      margin-top: 32px;

      .caption-text {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: 20px;
        color: #666;

        .line {
          width: 3px;
          background-color: #2095f2;
          height: 20px;
          margin-right: 10px;
        }
      }
    }

    .qrcodes {
      margin-top: 10px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: 24px;

      .qrcode-widget {
        width: 182px;
        height: 182px;
        flex-shrink: 0;
      }
    }

    .mit-list {
      margin-top: 12px;
      font-size: 14px;
      color: #666;

      a {
        color: #2095f2;
      }
    }
  }
}

@media (max-width: 768px) {
  .content-box {
    padding: 16px 12px 32px;

    .container-box {
      padding: 16px;

      .qrcode-box {
        .show-box {
          width: 100%;

          .set-qrcode,
          .buttons {
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
          }
        }

        .input-box .input-item .field .control {
          flex-direction: column;
          align-items: stretch;

          .input-label {
            width: auto;
            margin-bottom: 6px;
          }

          .input {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
  