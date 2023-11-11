<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="原版软件">
        <template v-slot:custommenu>
          <b-navbar-item>
            <div class="navbar-menu">
              <b-dropdown v-model="navigation" position="is-bottom-left" append-to-body aria-role="menu">
                <template #trigger>
                  <a class="navbar-item" role="button">
                    <b-icon pack="fab" icon="apple"></b-icon>
                    <span>软件</span>
                    <b-icon pack="fas" icon="angle-down"></b-icon>
                  </a>
                </template>
                <b-dropdown-item custom aria-role="menuitem">
                  图形设计
                </b-dropdown-item>
                <b-dropdown-item custom aria-role="menuitem">
                  媒体工具
                </b-dropdown-item>
                <b-dropdown-item custom aria-role="menuitem">
                  游戏娱乐
                </b-dropdown-item>
                <b-dropdown-item custom aria-role="menuitem">
                  系统工具
                </b-dropdown-item>
                <b-dropdown-item custom aria-role="menuitem">
                  编程开发
                </b-dropdown-item>
                <b-dropdown-item custom aria-role="menuitem">
                  网络工具
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </b-navbar-item>
          <b-navbar-item>
            <b-dropdown v-model="navigation" position="is-bottom-left" append-to-body aria-role="menu">
              <template #trigger>
                <a class="navbar-item" role="button">
                  <b-icon pack="fab" icon="windows"></b-icon>
                  <span>系统</span>
                  <b-icon pack="fas" icon="angle-down"></b-icon>
                </a>
              </template>
              <b-dropdown-item custom aria-role="menuitem">
                <b-icon pack="fab" icon="windows"></b-icon>
                windows11
              </b-dropdown-item>
              <b-dropdown-item custom aria-role="menuitem">
                <b-icon pack="fab" icon="windows"></b-icon>
                windows10
              </b-dropdown-item>
              <b-dropdown-item custom aria-role="menuitem">
                <b-icon pack="fab" icon="windows"></b-icon>
                windows8
              </b-dropdown-item>
              <b-dropdown-item custom aria-role="menuitem">
                <b-icon pack="fab" icon="windows"></b-icon>
                windows7
              </b-dropdown-item>
            </b-dropdown>
          </b-navbar-item>
          <b-navbar-item>
            <b-dropdown v-model="navigation" position="is-bottom-left" append-to-body aria-role="menu">
              <template #trigger>
                <a class="navbar-item" role="button">
                  <b-icon pack="fas" icon="gamepad"></b-icon>
                  <span>游戏</span>
                  <b-icon pack="fas" icon="angle-down"></b-icon>
                </a>
              </template>
              <b-dropdown-item custom aria-role="menuitem">
                <b-icon pack="fab" icon="windows"></b-icon>
                windows11
              </b-dropdown-item>
              <b-dropdown-item custom aria-role="menuitem">
                <b-icon pack="fab" icon="windows"></b-icon>
                windows10
              </b-dropdown-item>
              <b-dropdown-item custom aria-role="menuitem">
                <b-icon pack="fab" icon="windows"></b-icon>
                windows8
              </b-dropdown-item>
              <b-dropdown-item custom aria-role="menuitem">
                <b-icon pack="fab" icon="windows"></b-icon>
                windows7
              </b-dropdown-item>
            </b-dropdown>
          </b-navbar-item>
        </template>
      </Navbar>
    </div>

    <div class="content-box">
      <div class="container clear-bg">
        <div class="notice-box">
          <div class="notice-left-box">
            <div class="badge badge-danger">
              <i class="fa fa-volume-up"></i> 网站动态
              <div class="spinner-grow"></div>
            </div>

            <div class="notice-msg">
              <Marquee :text-list="textList"/>
            </div>
          </div>
          <div class="notice-right-box">
            <b-field grouped group-multiline>
              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">今日发布</b-tag>
                  <b-tag type="is-info">0</b-tag>
                </b-taglist>
              </div>

              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">本周</b-tag>
                  <b-tag type="is-success">32</b-tag>
                </b-taglist>
              </div>

              <div class="control">
                <b-taglist attached>
                  <b-tag type="is-dark">总数</b-tag>
                  <b-tag type="is-primary">5394</b-tag>
                </b-taglist>
              </div>
            </b-field>
          </div>
        </div>
      </div>

      <div class="container clear-bg1">
        <div class="notice-box">
          <div class="notice-left-box">
            <div class="notice-title-box">
              <div class="notice-title">最新推荐</div>
              <div class="notice-remark">最新软件、游戏展示，精彩尽在咫尺</div>
            </div>
          </div>
          <div class="notice-right-box">
            <div class="buttons">
              <b-button size="is-small" type="is-primary">最新</b-button>
              <b-button size="is-small" type="is-success" outlined>系统</b-button>
              <b-button size="is-small" type="is-success" outlined>软件</b-button>
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="list">
          <div class="item" v-for="(item, index) in list" :key="index">
            <div class="bgcolor">
              <div class="img" @click="jumpSoftwareDetail(item)">
                <div class="src" :style="`background-image:url(${item.imgUrl})`"></div>
                <div class="hot-box is-hot">
                  热门
                </div>
              </div>
              <div class="info">
                <div class="title-box">
                  <div class="name-1 text-overflow-1 f16" :title="item.name">{{ item.title }}</div>
                  <div class="name-2 text-overflow-1 f16">{{ item.subtitle }}</div>
                  <div class="mlt-tags-box">
                    <div class="mlt-item-tag" v-for="(tag, index) in item.tags" :key="index">{{ tag }}</div>
                  </div>
                </div>
                <div class="content-box">
                  <div class="price">
                    <div class="cart">
                      <div class="buy-btn" @click="buyGoods(item)">
                        <div class="txt">下载</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
import Marquee from '@/components/Marquee.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'

Vue.use(BackTop)
export default {
  name: 'Download',
  components: {
    Navbar,
    Marquee,
    Footer
  },
  data() {
    return {
      list: [
        {
          id: 1,
          imgUrl: 'https://minio.doniai.com/doniai/software/images/windows11.jpg',
          title: 'Windows 11',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 2,
          imgUrl: 'https://minio.doniai.com/doniai/software/images/windows10.png',
          title: 'Windows 10',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 3,
          imgUrl: 'https://picsum.photos/240?random=1',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 4,
          imgUrl: 'https://picsum.photos/240?random=2',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 5,
          imgUrl: 'https://picsum.photos/240?random=3',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 6,
          imgUrl: 'https://picsum.photos/240?random=4',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 7,
          imgUrl: 'https://picsum.photos/240?random=5',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 8,
          imgUrl: 'https://picsum.photos/240?random=6',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 9,
          imgUrl: 'https://picsum.photos/240?random=7',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 10,
          imgUrl: 'https://picsum.photos/240?random=8',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 11,
          imgUrl: 'https://picsum.photos/240?random=9',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 12,
          imgUrl: 'https://picsum.photos/240?random=10',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 13,
          imgUrl: 'https://picsum.photos/240?random=11',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 14,
          imgUrl: 'https://picsum.photos/240?random=12',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 15,
          imgUrl: 'https://picsum.photos/240?random=13',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 16,
          imgUrl: 'https://picsum.photos/240?random=14',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        }
      ],
      textList: ['这是第一条滚动的文字。', '这是第二条滚动的文字。', '这是第三条滚动的文字。', '这是第四条滚动的文字。', '这是第五条滚动的文字。'],
    }
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
    jumpSoftwareDetail(item) {
      this.$router.push({
        path: `/utils/software/${item.id}`
      })
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
  background: #EEEEF4;
  display: flex;
  justify-content: center;
  flex-direction: column;
  .clear-bg {
    background: #dde2fa !important;
    margin-top: 30px !important;
    margin-bottom: 30px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  .clear-bg1 {
    background: #f5f5f5 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    .notice-box {
      background: #f5f5f5 !important;
    }
  }
  .container {
    width: 100%;
    margin: 40px auto;
    background: #F5F5F5;
    border-radius: 6px;
    padding: 20px 20px;
    .notice-box {
      color: #2b3978;
      background-color: #dde2fa;
      border-color: #cfd6f8;
      padding: 10px 15px;
      border-radius: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .notice-left-box {
        display: flex;
        align-items: center;
        .notice-msg {
          margin-left: 20px;
        }
        .notice-title-box {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          .notice-title {
            font-size: 20px;
            font-weight: bold;
          }
          .notice-remark {
            margin-left: 20px;
            font-size: 14px;
          }
        }
        .badge {
          display: inline-block;
          padding: 0.25em 0.4em;
          font-size: 75%;
          font-weight: 700;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          vertical-align: baseline;
          border-radius: 0.25rem;
          transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
          .spinner-grow {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-left: 10px;
            background-color: #FFFFFF;
            position: relative;
            display: inline-block;
            &:before,after {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 1px solid rgba(255, 77, 79, 0.5);
              border-top-color: transparent;
              animation: warn 1.2s ease-out 0s infinite;
            }
            @keyframes warn {
              0% {
                transform: scale(0.5);
                opacity: 1;
              }
              25% {
                transform: scale(1);
                opacity: 0.75;
              }
              50% {
                transform: scale(1.5);
                opacity: 0.5;
              }
              75% {
                transform: scale(2);
                opacity: 0.25;
              }
              100% {
                transform: scale(2.5);
                opacity: 0;
              }
            }
          }
        }
        .badge-danger {
          color: #fff;
          background-color: #ff5b5b;
        }
      }
    }

    .list {
      display: flex;
      flex-wrap: wrap;
      background: none;
      box-shadow: none;

      .item {
        width: calc(100% / 5);
        padding: 12px 12px;
        flex-shrink: 0;

        &:hover {
          box-shadow: 0 10px 20px 5px rgba(#ccc, .5);
          transform: translateY(-2px);
        }

        .bgcolor {
          background: #FFFFFF;
          border-radius: 2px;
          .info {
            height: 180px;
            display: flex;
            justify-content: space-between;
            flex-direction: column;

            .content-box {
              background: #FFFFFF;
              display: flex;
              justify-content: space-between;
              flex-direction: column;
            }
          }
        }

        a {
          display: block;
          background: #FFFFFF;
          transition: all 0.5s ease;
        }

        .img {
          position: relative;

          .src {
            padding-top: 100%;
            background: no-repeat center center;
            background-size: cover;
            cursor: pointer;

          }

          .hot-box {
            position: absolute;
            left: 0;
            top: 0;
            border-radius: 2px 2px 16px 2px;
            padding: 2px 10px;
            color: #fff;
            font-size: 12px;
            font-weight: 400;
          }

          .is-hot {
            background: #fa5e2e;
          }

          .is-default {
            background: #37b900;
          }

          .tags {
            position: absolute;
            bottom: 5px;
            left: 0;
            right: 0;
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            padding: 0 5px;

            span {
              background: rgba(#000, 0.5);
              color: #fff;
              margin: 5px;
              border-radius: 4px;
              padding: 5px 10px;
              font-size: 12px;
            }
          }
        }

        .name-1 {
          padding: 16px 10px 0 10px;
          color: #222;
          font-size: 18px;
          font-weight: 700;
          &:hover {
            cursor: pointer;
            text-decoration: underline;
          }
        }

        .name-2 {
          padding: 0 10px;
          color: #999;
          font-size: 12px;
        }

        .mlt-tags-box {
          padding: 13px 0 0 10px;
          display: flex;
          justify-content: flex-start;
          flex-flow: wrap;
          .mlt-item-tag {
            padding: 1px 4px;
            border-radius: 10px;
            border: 0.5px solid #EAEAEA;
            color: #666;
            text-align: center;
            font-size: 12px;
            margin-right: 8px;
            margin-bottom: 4px;
            &:hover {
              background: #0f77ea;
              color: #FFFFFF;
            }
          }
        }

        .price {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 10px 10px 16px 10px;
          color: #333;

          .blod {
            color: #333;
            font-size: 14px;
            font-weight: 700;
            line-height: 150%;
          }

          .fill {
            margin-left: 7px;
            flex: 1;
            color: #999;
            font-size: 12px;
            line-height: 150%;
            text-decoration: line-through;
          }

          .ori {
            color: rgba(255, 255, 255, 0.3);
            text-decoration: line-through;
            padding-left: 8px;
          }

          .cart {
            cursor: pointer;
            .buy-btn {
              width: 63px;
              padding: 7px 16px;
              justify-content: center;
              align-items: center;
              border-radius: 22px;
              border: 1px solid #222;
              .txt {
                color: #222;
                text-align: center;
                font-size: 14px;
                font-weight: 700;
                line-height: 18px;
              }

              &:hover {
                background: #fa5e2e;
                border: 1px solid #cecece;
                .txt {
                  color: #FFFFFF;
                  text-decoration: underline;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
