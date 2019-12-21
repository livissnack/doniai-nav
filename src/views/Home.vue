<template>
  <div class="home">
    <div class="nav-box">
      <div class="container">
        <b-navbar>
          <template slot="brand">
            <b-navbar-item tag="router-link" :to="{ path: '/' }">
              <h3 class="nav-brand text-primary">Doniai导航</h3>
            </b-navbar-item>
          </template>
          <template slot="start">
            <b-navbar-item
              :active="nav.id === current_active_menu_id"
              @click="handleChangeData(nav)"
              href="#"
              v-for="nav in navs"
              :key="nav.id"
              >{{ nav.name }}</b-navbar-item
            >
          </template>

          <template slot="end">
            <b-navbar-item>
              <span class="text-primary">登录</span>
            </b-navbar-item>
            <b-navbar-item>
              <span class="text-primary">注册</span>
            </b-navbar-item>
          </template>
        </b-navbar>
      </div>
    </div>
    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters">
            <div class="input-group">
              <b-field class="custom-input-width">
                <b-input
                  v-model="filter.search_text"
                  size="is-small"
                  placeholder="请输入搜索内容"
                  @keyup.enter.native="startSearch"
                ></b-input>
                <b-button type="is-success" size="is-small" @click="startSearch"
                  >搜索</b-button
                >
              </b-field>
              <div class="block custom-input-width">
                <b-radio
                  v-for="search in searchs"
                  :key="search.id"
                  v-model="filter.search_type"
                  size="is-small"
                  :name="search.id.toString()"
                  :native-value="search.id"
                  >{{ search.name }}</b-radio
                >
              </div>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column is-three-quarters">
            <div class="post" v-for="navItems in navData" :key="navItems.id">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  {{ navItems.title }}
                </a>
              </div>
              <div class="tab-item">
                <a
                  :href="navItem.href"
                  class="box-item"
                  :class="navItem.color"
                  target="_blank"
                  v-for="navItem in navItems.items"
                  :key="navItem.index"
                  >{{ navItem.name }}</a
                >
              </div>
            </div>
          </div>
          <div class="column"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const navsData = [
  {
    id: 1,
    title: '常用网站',
    items: [
      {
        name: '百度',
        href: 'https://www.baidu.com',
        color: 'is-primary'
      },
      {
        name: '谷歌',
        href: 'https://www.google.com',
        color: 'is-success'
      },
      {
        name: '必应',
        href: 'https://cn.bing.com',
        color: 'is-danger'
      },
      {
        name: 'Stackoverflow',
        href: 'https://stackoverflow.com',
        color: 'is-warning'
      },
      {
        name: 'Segmentfault',
        href: 'https://segmentfault.com',
        color: 'is-info'
      },
      {
        name: '腾讯企业邮',
        href:
          'https://exmail.qq.com/cgi-bin/loginpage?t=dm_loginpage&dmtype=bizmail',
        color: 'is-primary'
      },
      {
        name: '谷歌邮箱',
        href: 'https://mail.google.com/mail',
        color: 'is-success'
      },
      {
        name: 'Outlook邮箱',
        href: 'https://outlook.live.com/mail',
        color: 'is-danger'
      },
      {
        name: '掘金',
        href: 'https://juejin.im',
        color: 'is-warning'
      },
      {
        name: 'V2EX',
        href: 'http://www.v2ex.com',
        color: 'is-info'
      }
    ]
  },
  {
    id: 2,
    title: '互联网资讯',
    items: [
      {
        name: '知乎',
        href: 'https://www.zhihu.com',
        color: 'is-primary'
      },
      {
        name: '36氪',
        href: 'http://36kr.com',
        color: 'is-success'
      },
      {
        name: '简书',
        href: 'https://www.jianshu.com',
        color: 'is-danger'
      },
      {
        name: '廖雪峰',
        href: 'https://www.liaoxuefeng.com',
        color: 'is-warning'
      },
      {
        name: '泡在网上的日子',
        href: 'http://www.jcodecraeer.com',
        color: 'is-info'
      },
      {
        name: '阮一峰',
        href: 'http://www.ruanyifeng.com/blog',
        color: 'is-primary'
      },
      {
        name: '创业邦',
        href: 'http://www.cyzone.cn',
        color: 'is-success'
      },
      {
        name: 'i黑马',
        href: 'http://www.iheima.com',
        color: 'is-danger'
      }
    ]
  },
  {
    id: 3,
    title: '公司博客',
    items: [
      {
        name: '美团点评',
        href: 'https://tech.meituan.com',
        color: 'is-primary'
      },
      {
        name: '悦动圈',
        href: 'https://joyrun.github.io',
        color: 'is-success'
      },
      {
        name: '网易考拉',
        href: 'https://blog.klmobile.app',
        color: 'is-danger'
      },
      {
        name: '有赞',
        href: 'https://tech.youzan.com',
        color: 'is-warning'
      },
      {
        name: '阿里中间件',
        href: 'http://jm.taobao.org',
        color: 'is-info'
      },
      {
        name: '360',
        href: 'http://blogs.360.cn',
        color: 'is-primary'
      },
      {
        name: '百度移动体验部',
        href: 'http://mux.baidu.com/case',
        color: 'is-success'
      },
      {
        name: 'Glow',
        href: 'http://tech.glowing.com/cn',
        color: 'is-danger'
      }
    ]
  },
  {
    id: 4,
    title: '代码托管',
    items: [
      {
        name: 'Github',
        href: 'https://github.com',
        color: 'is-primary'
      },
      {
        name: 'Coding',
        href: 'https://coding.net',
        color: 'is-success'
      },
      {
        name: '码云',
        href: 'http://git.oschina.net',
        color: 'is-danger'
      },
      {
        name: 'Bitbucket',
        href: 'https://bitbucket.org',
        color: 'is-warning'
      },
      {
        name: 'Gitlab',
        href: 'https://about.gitlab.com',
        color: 'is-info'
      }
    ]
  },
  {
    id: 5,
    title: '学习平台',
    items: [
      {
        name: '慕课网',
        href: 'http://www.imooc.com',
        color: 'is-primary'
      },
      {
        name: '菜鸟教程',
        href: 'http://www.runoob.com',
        color: 'is-success'
      },
      {
        name: '极客学院',
        href: 'http://www.jikexueyuan.com',
        color: 'is-danger'
      },
      {
        name: '网易云课堂',
        href: 'https://study.163.com',
        color: 'is-warning'
      },
      {
        name: '腾讯课堂',
        href: 'https://ke.qq.com/course/list',
        color: 'is-info'
      }
    ]
  },
  {
    id: 6,
    title: '求职招聘',
    items: [
      {
        name: '拉钩网',
        href: 'https://www.lagou.com',
        color: 'is-primary'
      },
      {
        name: 'Boss直聘',
        href: 'https://www.zhipin.com',
        color: 'is-success'
      },
      {
        name: '前程无忧',
        href: 'https://www.51job.com',
        color: 'is-danger'
      },
      {
        name: '智联招聘',
        href: 'https://www.zhaopin.com',
        color: 'is-warning'
      },
      {
        name: 'Leetcode',
        href: 'https://leetcode-cn.com',
        color: 'is-info'
      },
      {
        name: '牛客网',
        href: 'https://www.nowcoder.com/contestRoom',
        color: 'is-primary'
      }
    ]
  },
  {
    id: 7,
    title: '兼职网站',
    items: [
      {
        name: '程序员客栈',
        href: 'https://www.proginn.com/cat/?type=4',
        color: 'is-primary'
      },
      {
        name: '码市',
        href: 'https://codemart.com',
        color: 'is-success'
      },
      {
        name: '实现网',
        href: 'https://shixian.com',
        color: 'is-danger'
      }
    ]
  }
]
export default {
  name: 'home',
  data() {
    return {
      filter: {
        search_text: '',
        search_type: 1
      },
      current_active_menu_id: 1,
      navs: [
        {
          id: 1,
          name: '首页',
          is_active: true
        },
        {
          id: 2,
          name: '私人',
          is_active: false
        },
        {
          id: 3,
          name: 'ios',
          is_active: false
        },
        {
          id: 4,
          name: '工具',
          is_active: false
        },
        {
          id: 5,
          name: '前端',
          is_active: false
        },
        {
          id: 6,
          name: '后端',
          is_active: false
        },
        {
          id: 7,
          name: '设计',
          is_active: false
        }
      ],
      searchs: [
        {
          id: 1,
          name: '百度',
          url: 'https://www.baidu.com/s?wd=',
          is_default: true
        },
        {
          id: 2,
          name: '谷歌',
          url: 'https://www.google.com.hk/search?q=',
          is_default: false
        },
        {
          id: 3,
          name: '必应',
          url: 'https://cn.bing.com/search?q=',
          is_default: false
        },
        {
          id: 4,
          name: '多尼爱',
          url: 'https://www.doniai.com/search?q=',
          is_default: false
        },
        {
          id: 5,
          name: 'githup',
          url: 'https://github.com/search?q=',
          is_default: false
        },
        {
          id: 6,
          name: '图片',
          url:
            'http://image.baidu.com/search/index?tn=baiduimage&ps=1&ct=201326592&lm=-1&cl=2&nc=1&ie=utf-8&word=',
          is_default: false
        },
        {
          id: 7,
          name: '图标',
          url: 'https://www.iconfont.cn/search/index?searchType=icon&q=',
          is_default: false
        }
      ],
      navData: [],
      workData: [
        {
          id: 1,
          title: '本机内网快捷',
          items: [
            {
              name: '操盘管理后台',
              href: 'http://admin.ties.test',
              color: 'is-primary'
            },
            {
              name: '用户管理后台',
              href: 'http://admin.tiuc.test',
              color: 'is-success'
            },
            {
              name: '对接用户接口管理',
              href: 'http://api.tiuc.test/api',
              color: 'is-danger'
            }
          ]
        },
        {
          id: 2,
          title: '公司内网快捷',
          items: [
            {
              name: '赛事后台测试',
              href: 'http://admin.ties.t',
              color: 'is-primary'
            },
            {
              name: '赛事后台开发',
              href: 'http://admin.ties.d',
              color: 'is-success'
            },
            {
              name: '赛事H5测试',
              href: 'http://h5.ties.t',
              color: 'is-warning'
            },
            {
              name: '赛事H5开发',
              href: 'http://h5.ties.d',
              color: 'is-info'
            }
          ]
        },
        {
          id: 3,
          title: '内网代码',
          items: [
            {
              name: '内网gitlab代码管理',
              href: 'http://git.l',
              color: 'is-primary'
            }
          ]
        }
      ]
    }
  },
  created() {
    this.getCurrentNavs()
  },
  methods: {
    startSearch() {
      let id = this.filter.search_type
      let text = this.filter.search_text
      if (text == '' || text == null || undefined) {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: '输入框内容不能为空！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
        return
      }
      let searchObj = this.searchs.find(el => el.id === id)
      window.open(`${searchObj.url}${text}`)
    },
    getCurrentNavs() {
      this.navData =
        this.current_active_menu_id === 2 ? this.workData : navsData
    },
    handleChangeData(menu) {
      this.current_active_menu_id = menu.id
      this.getCurrentNavs()
    }
  }
}
</script>

<style lang="less" scope>
.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
  margin-bottom: 35px;
  border-bottom: 2px solid #e1e1e1;
}

.nav-brand {
  font-size: 18px;
}

.text-primary {
  color: #15b982;
}

.custom-input-width {
  width: 400px;
  margin: 0 auto;
  .control {
    width: 400px;
  }
}

.post {
  background: #ffffff;
  padding: 35px;
  margin-bottom: 35px;
}

.widget {
  margin-bottom: 20px;
}

.title-underline {
  text-decoration: none;
  border-bottom: 1px solid #e67e22;
}

.tab-item {
  a {
    color: #ffffff;
    font-size: 14px;
    display: inline-block;
    width: 15%;
    height: 35px;
    line-height: 35px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin: 10px 34px 10px 0px;
    text-align: center;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
    text-decoration: none;
  }
  .box-item {
    box-shadow: 1px 1px 5px #ccc5c5;
  }
}

.is-active {
  color: #7957d5 !important;
  font-weight: bold;
}
</style>
