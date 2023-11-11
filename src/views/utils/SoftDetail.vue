<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="原版软件"/>
    </div>

    <div class="content-box">
      <div class="container">
        <div class="software-name">
          WINDOWS 11
        </div>
        <div class="software-info">
          <div class="software-imgs">
            <b-carousel icon-pack="fas" :pause-info="false">
              <b-carousel-item v-for="(carousel, i) in carousels" :key="i">
                <img :src="carousel.imgUrl" :alt="carousel.title">
              </b-carousel-item>
            </b-carousel>
          </div>
          <div class="software-desc">
            <div class="software-desc-top">
              <div class="software-desc-title">
                <span class="title">概要</span>
              </div>
              <div class="software-desc-item">
                <div class="software-desc-label">厂商: </div>
                <div class="software-desc-value">微软</div>
              </div>
              <div class="software-desc-item">
                <div class="software-desc-label">类别: </div>
                <div class="software-desc-value">操作系统 - Windows</div>
              </div>
              <div class="software-desc-item">
                <div class="software-desc-label">发行时间: </div>
                <div class="software-desc-value">2021-06-24</div>
              </div>
              <div class="software-desc-item">
                <div class="software-desc-label">最近更新: </div>
                <div class="software-desc-value">2023-10-31</div>
              </div>
              <div class="software-desc-item">
                <div class="software-desc-label">最新版本: </div>
                <div class="software-desc-value">23H2</div>
              </div>
              <div class="software-desc-notice">
                <small>*  本站仅提供软件原版相关信息，不提供破解和正版授权。</small>
              </div>
            </div>

            <div class="software-desc-bottom">
              <a class="go-software">
                官方网站
              </a>
            </div>
          </div>
        </div>

        <div class="software-content">
          <div class="software-head">
            <div class="left-title">
              建议使用
            </div>
            <div class="right-title">
              <b-tooltip type="is-white" label="复制ED2K或者BT链接，建议使用专用下载工具下载。下载速度仅与您宽带环壤和工具有关。捐助与否是您自由选择。" multilined>
                <small>
                  <i class="far fa-question-circle"></i>
                  如何下载？
                </small>
              </b-tooltip>
            </div>
          </div>

          <div class="software-list">
            <div class="software-li">
              <b-collapse v-for="(software, softwareIndex) in softwareList" :key="softwareIndex" :open="software.isOpen" class="card" animation="slide" :aria-id="`contentIdFor${software.id}`">
                <template #trigger="props">
                  <div class="card-header" role="button" :aria-controls="`contentIdFor${software.id}`" :aria-expanded="props.open">
                    <p class="card-header-title">
                      {{ software.filename }}
                    </p>
                    <a class="card-header-icon">
                      <i class="far fa-menu-down" :icon="props.open ? 'fa-menu-down' : 'fa-menu-up'"></i>
                    </a>
                  </div>
                </template>
                <div class="card-content">
                  <div class="content">
                    <div class="soft-content-item">
                      <div class="soft-title">名称：</div>
                      <div class="soft-text">{{ software.filename }}</div>
                    </div>
                    <div class="soft-content-item">
                      <div class="soft-title">发布时间：</div>
                      <div class="soft-text">{{ software.publishTime }}</div>
                    </div>
                    <div class="soft-content-item">
                      <div class="soft-title">文件：</div>
                      <div class="soft-text">{{ software.file }}</div>
                    </div>
                    <div class="soft-content-item">
                      <div class="soft-title">大小：</div>
                      <div class="soft-text">{{ software.size }}</div>
                    </div>
                    <div class="soft-content-item">
                      <div class="soft-title">MD5：</div>
                      <div class="soft-text">{{ software.md5 }}</div>
                    </div>
                    <div class="soft-content-item">
                      <div class="soft-title">SHA1：</div>
                      <div class="soft-text">{{ software.sha1 }}</div>
                    </div>
                    <div class="soft-content-item">
                      <div class="soft-title">SHA256：</div>
                      <div class="soft-text">{{ software.sha256 }}</div>
                    </div>
                    <div class="soft-content-item">
                      <div class="soft-title">ED2K：</div>
                      <div class="soft-text">{{ software.ed2k }}</div>
                      <div class="soft-copy-btn" @click="handleCopyText(software.ed2k)">
                        <b-tag type="is-danger" rounded>
                          <i class="far fa-copy"></i>
                          复制
                        </b-tag>
                      </div>
                    </div>
                    <div class="soft-content-item">
                      <div class="soft-title">BT：</div>
                      <div class="soft-text">{{ software.bt }}</div>
                      <div class="soft-copy-btn" @click="handleCopyText(software.bt)">
                        <b-tag type="is-danger" rounded>
                          <i class="far fa-copy"></i>
                          复制
                        </b-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </b-collapse>
            </div>
          </div>

          <div class="software-footer">
            <div class="copyright-text">
              本站数据均来自于互联网搜集，如有侵犯您的权利，请联系删除。 按“ESC”键可以返回列表。
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
  name: 'Download',
  components: {
    Navbar,
    Footer
  },
  data() {
    return {
      carousels: [
        { title: 'Slide 1', imgUrl: 'https://static.itellyou.cn/images/windows_11/pic1.png' },
        { title: 'Slide 2', imgUrl: 'https://static.itellyou.cn/images/windows_11/pic2.png' },
        { title: 'Slide 3', imgUrl: 'https://static.itellyou.cn/images/windows_11/pic3.png' },
        { title: 'Slide 4', imgUrl: 'https://static.itellyou.cn/images/windows_11/pic4.png' },
        { title: 'Slide 5', imgUrl: 'https://static.itellyou.cn/images/windows_11/pic5.png' },
        { title: 'Slide 6', imgUrl: 'https://static.itellyou.cn/images/windows_11/pic6.png' },
      ],
      softwareList: [
        {
          id: 1,
          filename: 'Windows 11, version 23H2 (ARM64) - DVD (Chinese-Simplified)',
          file: 'SW_DVD9_Win_Pro_11_23H2_Arm64_ChnSimp_Pro_Ent_EDU_N_MLF_X23-59518.ISO',
          size: '6.65GB',
          md5: '9A19E48D5BF7870653A5BE96AD1BB120',
          sha1: 'AB04EA5C8A3948CD184221E79AFCA43E92672866',
          sha256: '2AFAF2B74EE7213B37EB9EF9E1D9B27208D9893ECE6A29045FE124E06F77F340',
          publishTime: '2023-10-31',
          ed2k: 'ed2k://|file|SW_DVD9_Win_Pro_11_23H2_Arm64_ChnSimp_Pro_Ent_EDU_N_MLF_X23-59518.ISO|7142125568|769949291524FDE82A0BB52138433F06|/',
          bt: 'magnet:?xt=urn:btih:64fb7c011f407628471432d8cd52b2b5c6c52673&dn=SW_DVD9_Win_Pro_11_23H2_Arm64_ChnSimp_Pro_Ent_EDU_N_MLF_X23-59518.ISO&xl=7142125568',
          isOpen: true,
        },
        {
          id: 2,
          filename: 'Windows 11 (business editions), version 23H2 (x64) - DVD (Chinese-Simplified)',
          file: 'zh-cn_windows_11_business_editions_version_23h2_x64_dvd_2a79e0f1.iso',
          size: '6.16GB',
          md5: 'F0CD49E97086CFE70212261C7D5E7910',
          sha1: 'C81C9B2B7A3597CC6B42FB93ECB7DD9A07899180',
          sha256: 'B4F4CAA4BA52B4BCD59072D5361DBDB287856C48CE7C9EE39008DC294F3111DF',
          publishTime: '2023-10-31',
          ed2k: 'ed2k://|file|zh-cn_windows_11_business_editions_version_23h2_x64_dvd_2a79e0f1.iso|6613571584|1AFADEBC5966E9E689F242549FFB5562|/',
          bt: 'magnet:?xt=urn:btih:b5fed4ee16b1c9b886f44dd30cd70fdf746f58f5&dn=zh-cn_windows_11_business_editions_version_23h2_x64_dvd_2a79e0f1.iso&xl=6613571584',
          isOpen: false,
        },
        {
          id: 3,
          filename: 'Windows 11 (consumer editions), version 23H2 (x64) - DVD (Chinese-Simplified)',
          file: 'zh-cn_windows_11_consumer_editions_version_23h2_x64_dvd_91207780.iso',
          size: '6.25GB',
          md5: '071620252EC577D55C67F00A4DB039F1',
          sha1: 'C61F2BD7B7F2F7312892B988CE5C057B2CF1CB94',
          sha256: '86533155B48398556014DE1AA03917A4C243686BB1E8D6B6D878EC5B9C8638FA',
          publishTime: '2023-10-31',
          ed2k: 'ed2k://|file|zh-cn_windows_11_consumer_editions_version_23h2_x64_dvd_91207780.iso|6714650624|5E927EF9FA65D78D1898213281CB3757|/',
          bt: 'magnet:?xt=urn:btih:19ffe4debe0e0466dcf7a93dc910756e23d77356&dn=zh-cn_windows_11_consumer_editions_version_23h2_x64_dvd_91207780.iso&xl=6714650624',
          isOpen: false,
        },
      ],
    }
  },
  mounted() {
    this.listenKeyboardEsc()
  },
  methods: {
    onCopySuccess() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `${this.showMoney}`,
        type: 'is-success',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
    },
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
    listenKeyboardEsc() {
      this.$nextTick(() => {
        document.addEventListener('keydown', (e) => {
          if (e.keyCode === 27) {
            this.$router.push({
              path: `/utils/software`
            })
          }
        })
      })
    },
    oneOpen(url) {
      location.href = `motrix://open?url=${url}`
    }
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
  background: #EEEEF4;
  display: flex;
  justify-content: center;
  .container {
    background: #FFFFFF;
    border-radius: 6px;
    margin: 40px 0;
    .software-name {
      margin-top: 32px;
      text-align: center;
      color: #454444;
      font: 600 42px/46px "Open Sans Condensed",sans-serif;
      letter-spacing: 2px;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    .software-info {
      display: flex;
      justify-content: flex-start;
      .software-imgs {
        padding: 10px 60px;
        width: 60%;
      }

      .software-desc {
        width: 40%;
        padding: 10px 50px 20px 0;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        .software-desc-top {
          .software-desc-title {
            border-bottom: 1px solid #cdcdcd;
            color: #444;
            .title {
              border-bottom: 3px solid #1e88e5;
              font-size: 18px;
              font-weight: 600;
            }
          }
          .software-desc-item {
            height: 40px;
            border-bottom: 1px dotted #dfdfdf;
            padding: inherit;
            color: #666;
            font-family: "Open Sans Condensed",sans-serif;
            font-size: 14px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            .software-desc-label {
              width: 100px;
              color: #696969;
              font-weight: 600;
              margin-right: 10px;
            }
          }

          .software-desc-notice {
            padding: 6px 0;
            font-size: 12px;
          }
        }
        .software-desc-bottom {
          display: flex;
          justify-content: flex-end;
          .go-software {
            padding: 6px 12px;
            color: #1e88e5;
            background-color: transparent;
            border: 1px solid #1e88e5;
            box-shadow: 0 2px 2px 0 rgba(66,165,245,.14), 0 3px 1px -2px rgba(66,165,245,.2), 0 1px 5px 0 rgba(66,165,245,.12);
            transition: .2s ease-in;
            border-radius: 60px;
            cursor: pointer;
            &:hover {
              background: #1e88e5;
              border-color: #1e88e5;
              color: #fff;
              box-shadow: 0 14px 26px -12px rgba(23,105,255,.42), 0 4px 23px 0 rgba(0,0,0,.12), 0 8px 10px -5px rgba(23,105,255,.2);
            }
          }
        }
      }
    }

    .software-content {
      padding: 30px 60px;
      .software-head {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #cdcdcd;
        color: #444;
        .left-title {
          color: #444444;
          font-weight: 600;
          border-bottom: 3px solid #1e88e5;
        }
      }

      .software-list {
        margin-top: 40px;
        .software-li {
          /deep/ .card {
            /deep/ .collapse-content {
              /deep/ .card-content {
                padding-left: 0 !important;
              }
            }
          }

          .soft-content-item {
            display: flex;
            justify-content: flex-start;
            font-size: 14px;
            margin-top: 4px;
            &:not(:last-child) {
              border-bottom: 1px solid #cecece;
            }
            .soft-title {
              font-weight: bold;
            }
            padding: 4px 0;
            .soft-copy-btn {
              margin-left: 30px;
              cursor: pointer;
            }
          }
        }
      }

      .software-footer {
        margin-top: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        .copyright-text {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
