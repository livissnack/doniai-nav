<template>
    <div class="home">
      <div class="nav-box">
        <Navbar :newPage="true" :newUrl="`/utils/color`" pageTitle="好看的设计">
            <template v-slot:custommenu>
                <b-navbar-item>
                  <div class="navbar-menu">
                    <b-dropdown v-model="navigation" position="is-bottom-left" append-to-body aria-role="menu">
                      <template #trigger>
                        <a class="navbar-item" role="button">
                          <b-icon pack="fab" icon="apple"></b-icon>
                          <span>好看UI</span>
                          <b-icon pack="fas" icon="angle-down"></b-icon>
                        </a>
                      </template>
                      <b-dropdown-item custom aria-role="menuitem">
                        <a href="/utils/design-card">卡片设计</a>
                      </b-dropdown-item>
                      <b-dropdown-item custom aria-role="menuitem">
                        <a href="/utils/design-btn">Button设计</a>
                      </b-dropdown-item>
                    </b-dropdown>
                  </div>
                </b-navbar-item>
              </template>
        </Navbar>
      </div>
  
      <div class="content-box">
        <div class="container-tmp">
            <div class="columns flex-wrap">
                <div class="column is-one-quarter" v-for="(color, index) in colorList" :key="index" @click="handleCopyText(color.colorBg)">
                   <div class="color-card" :style="`background: ${color.colorBg}`">
                        <div class="color-title">
                            <div class="value">{{ color.name }}</div>
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
    name: 'Color',
    components: {
      Navbar,
      Footer
    },
    data() {
      return {
        colorList: [
          {
            name: '神秘紫蓝渐变',
            colorBg: 'linear-gradient(135deg, #c850c0, #4158d0)'
          },
          {
            name: '天空蓝渐变',
            colorBg: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)'
          },
          {
            name: '瑰丽紫红渐变',
            colorBg: 'linear-gradient(135deg, #ff9a9e, #fad0c4)'
          },
          {
            name: '温暖阳光渐变',
            colorBg: 'linear-gradient(135deg, #f6d365, #fda085)'
          },
          {
            name: '自然绿意渐变',
            colorBg: 'linear-gradient(135deg, #a8e063, #56ab2f)'
          },
          {
            name: '神秘暗夜渐变',
            colorBg: 'linear-gradient(135deg, #292a3a, #536976)'
          },
          {
            name: '多彩糖果渐变',
            colorBg: 'linear-gradient(135deg, #ff00cc, #ffcc00, #00ffcc, #ff0066)'
          },
          {
            name: '星空夜幕渐变',
            colorBg: 'linear-gradient(135deg, #001f3f, #0088a9, #00c9a7, #92d5c6, #ebf5ee)'
          },
          {
            name: '金属质感渐变',
            colorBg: 'linear-gradient(135deg, #272727, #4a4a4a, #6d6d6d, #909090, #b3b3b3, #d6d6d6, #f9f9f9)'
          },
          {
            name: '雪山冰川渐变',
            colorBg: 'linear-gradient(135deg, #c7e9fb, #a6defa, #80d4f9, #5bc9f8, #35bef7)'
          },
          {
            name: '热带夏日渐变',
            colorBg: 'linear-gradient(135deg, #ffbe0c, #ffda0c, #fff70c, #c2ff0c, #7aff0c)'
          }
        ]
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
    height: 80vh;
    background-color: #333333;
    display: flex;
    justify-content: center;
    .container-tmp {
        width: 100%;
        max-width: 1334px;
        padding: 30px 0;
        .flex-wrap {
            flex-wrap: wrap;
        }
    }
    .color-card {
        position: relative;
        width: 200px;
        height: 200px;
        border-radius: 10px;
        .color-title {
            position: absolute;
            top: 40%;
            left: 25%;
            color: #ffffff;
        }
    }
  }
  </style>
  