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
              <widget-qrcode
                  class="qrcode-generate"
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
              ></widget-qrcode>
            </div>
            <div class="buttons">
              <button class="button is-info" @click="downloadImg('png')">下载PNG</button>
              <button v-if="false" class="button is-danger" @click="downloadImg('svg')">下载SVG</button>
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
                  <div class="block">
                    <b-radio size="is-small" v-model="qrcode.template" native-value="default">
                      默认
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.template" native-value="water">
                      液态
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.template" native-value="diamond">
                      菱形
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.template" native-value="hexagon">
                      六边形
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.template" native-value="star">
                      星星
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.template" native-value="rect">
                      方块
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.template" native-value="bar">
                      条形
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.template" native-value="heart">
                      心形
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.template" native-value="glitter">
                      闪烁
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.template" native-value="stroke">
                      描边
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.template" native-value="fusion">
                      融合
                    </b-radio>
                  </div>
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">纠错等级</div>
                  <div class="block">
                    <b-radio size="is-small" v-model="qrcode.level" native-value="M">
                      M
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.level" native-value="L">
                      L
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.level" native-value="Q">
                      Q
                    </b-radio>
                    <b-radio size="is-small" v-model="qrcode.level" native-value="H">
                      H
                    </b-radio>
                  </div>
                </div>
              </div>

              <div class="tmp-input-field field">
                <div class="control">
                  <div class="input-label">颜色方案</div>

                  <div class="block tmp-block">
                    <div class="color-select">
                      <b-switch size="is-small" v-model="foregroundColorMode" passive-type='is-dark' type='is-danger'>
                        {{ foregroundColorMode ? "组合色" : "单色" }}
                      </b-switch>
                      <input class="input is-small" v-model="qrcode.foregroundColor" :disabled="foregroundColorMode"
                             type="color">
                      <div class="color-label">前景</div>
                    </div>

                    <div class="color-select">
                      <input class="input is-small" v-model="qrcode.backgroundColor" type="color">
                      <div class="color-label">背景</div>
                    </div>

                    <div class="color-select">
                      <input class="input is-small" v-model="qrcode.innerColor" type="color">
                      <div class="color-label">定位内框</div>
                    </div>

                    <div class="color-select">
                      <input class="input is-small" v-model="qrcode.outerColor" type="color">
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
                      <input class="input is-small" v-model="qrcode.textColor" type="color">
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
                      <input class="input is-small" v-model="qrcode.textStroke" type="color">
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
import Vue from 'vue'
import Navbar from '@/components/Navbar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'

Vue.use(BackTop)
export default {
  name: 'Color',
  components: {
    Navbar,
    Footer
  },
  data() {
    return {
      foregroundColorMode: false,
      qrcode: {
        value: 'https://nav.doniai.com/',
        template: 'diamond',
        level: 'M',
        width: 300,
        height: 300,
        backgroundColor: '#fff2dc',
        foregroundColor: '',
        innerColor: '#094304',
        outerColor: '',
        backgroundImage: '',
        foregroundImage: 'https://minio.doniai.com/hiphup/qrcode/grass.png',
        logo: 'https://minio.doniai.com/hiphup/qrcode/snail.png',
        text: '',
        textColor: '#2c2b2e',
        textStroke: '',
      }
    }
  },
  methods: {
    handleCopyText(str) {
      this.$copyText(str).then(() => {
        let tmpStr = str.substring(0, 40)
        this.$buefy.snackbar.open({
          duration: 3000,
          message: `复制成功：${tmpStr} ...`,
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      }, (e) => {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: `复制失败：${e.message}`,
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      })
    },
    downloadImg(type) {
      if (['png', 'svg'].includes(type)) {
        const qrcodeWidget = document.getElementsByClassName('qrcode-generate')
        const canvas = qrcodeWidget[0].$canvas;
        console.log(canvas)
        if (canvas && canvas instanceof HTMLCanvasElement) {
          // 创建一个 a 标签，并设置 href 和 download 属性
          const el = document.createElement('a')
          // 设置 href 为图片经过 base64 编码后的字符串，默认为 png 格式
          el.href = canvas.toDataURL()
          el.download = `${new Date().getTime()}.${type}`
          // 创建一个点击事件并对 a 标签进行触发
          const event = new MouseEvent('click')
          el.dispatchEvent(event)
        } else {
          console.error('The selected element is not a valid canvas.')
        }
      } else {
        this.$buefy.snackbar.open({
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

.content-box {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;

  .container-box {
    max-width: 1100px;
    width: 1100px;
    background-color: #ffffff;
    padding: 20px 20px;

    .title-box {
      max-width: 980px;
      width: 980px;

      .title1 {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
      }

      .title2 {
        font-size: 16px;
        color: #666;
      }
    }

    .qrcode-box {
      margin-top: 40px;
      max-width: 1040px;
      width: 1040px;
      display: flex;
      justify-content: flex-start;

      .show-box {
        .buttons {
          margin-top: 12px;
          width: 300px;
          display: flex;
          justify-content: space-between;
        }
      }

      .input-box {
        width: calc(100% - 300px);
        margin-left: 24px;
        background-color: #ffffff;
        padding: 12px 24px;
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

              .input-label {
                font-size: 12px;
                width: 120px;
                font-weight: bold;
                color: rgb(110, 119, 129);
              }

              .input {
                width: 60%;
              }

              .block {
                margin-left: 12px;
                width: 100%;

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
      max-width: 1040px;
      width: 1040px;
      background-color: #ffffff;
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.075);

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
      max-width: 1040px;
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: 30px;

      .qrcode-widget {
        width: 182px;
        height: 182px;
      }
    }
  }
}
</style>
  