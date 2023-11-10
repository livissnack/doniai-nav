<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="原版软件"/>
    </div>

    <div class="content-box">
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
          imgUrl: 'https://mloongbld.obs.cn-north-4.myhuaweicloud.com/image/20231104/20231104145800081964.jpg',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 4,
          imgUrl: 'https://mloongbld.obs.cn-north-4.myhuaweicloud.com/image/20231104/20231104145800081964.jpg',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 5,
          imgUrl: 'https://mloongbld.obs.cn-north-4.myhuaweicloud.com/image/20231104/20231104145800081964.jpg',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        },
        {
          id: 5,
          imgUrl: 'https://mloongbld.obs.cn-north-4.myhuaweicloud.com/image/20231104/20231104145800081964.jpg',
          title: '正当防卫4',
          subtitle: 'steam激活码 | 国区标准版',
          tags: ['开放世界', '动作', '破坏', '单人冒险', '沙盒'],
          sellingPrice: 78,
          originalPrice: 379,
        }
      ],
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
  .container {
    background: #F5F5F5;
    border-radius: 6px;
    margin: 40px 0;
    padding: 20px 20px;
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
