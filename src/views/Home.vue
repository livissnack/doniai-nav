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
            <b-navbar-item href="#" v-for="nav in navs" :key="nav.id">
              {{ nav.name }}
            </b-navbar-item>
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
                >
                  {{ search.name }}
                </b-radio>
              </div>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column is-three-quarters">
            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  常用网站
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">谷歌</a>
                <a href="" class="box-item is-success">百度</a>
                <a href="" class="box-item is-danger">必应</a>
                <a href="" class="box-item is-warning">谷歌开发者</a>
                <a href="" class="box-item is-info">Githup</a>

                <a href="" class="box-item is-primary">Stackoverflow</a>
                <a href="" class="box-item is-success">Segmentfault</a>
                <a href="" class="box-item is-danger">开源中国</a>
                <a href="" class="box-item is-warning">CSDN</a>
                <a href="" class="box-item is-info">掘金</a>

                <a href="" class="box-item is-primary">简书</a>
                <a href="" class="box-item is-success">玩Android</a>
                <a href="" class="box-item is-danger">开发者周报</a>
                <a href="" class="box-item is-warning">flutter中文</a>
                <a href="" class="box-item is-info">Dart</a>

                <a href="" class="box-item is-primary">AndroidBlog</a>
                <a href="" class="box-item is-success">51CTO</a>
                <a href="" class="box-item is-danger">Android开发网</a>
                <a href="" class="box-item is-warning">Android面试指南</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  经典博客
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">阮一峰</a>
                <a href="" class="box-item is-success">郭霖</a>
                <a href="" class="box-item is-danger">kymjs张涛</a>
                <a href="" class="box-item is-warning">任玉刚</a>
                <a href="" class="box-item is-info">技术小黑屋</a>

                <a href="" class="box-item is-primary">Weishu</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  常用网站
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">谷歌</a>
                <a href="" class="box-item is-success">百度</a>
                <a href="" class="box-item is-danger">必应</a>
                <a href="" class="box-item is-warning">谷歌开发者</a>
                <a href="" class="box-item is-info">Githup</a>

                <a href="" class="box-item is-primary">Stackoverflow</a>
                <a href="" class="box-item is-success">Segmentfault</a>
                <a href="" class="box-item is-danger">开源中国</a>
                <a href="" class="box-item is-warning">CSDN</a>
                <a href="" class="box-item is-info">掘金</a>

                <a href="" class="box-item is-primary">简书</a>
                <a href="" class="box-item is-success">玩Android</a>
                <a href="" class="box-item is-danger">开发者周报</a>
                <a href="" class="box-item is-warning">flutter中文</a>
                <a href="" class="box-item is-info">Dart</a>

                <a href="" class="box-item is-primary">AndroidBlog</a>
                <a href="" class="box-item is-success">51CTO</a>
                <a href="" class="box-item is-danger">Android开发网</a>
                <a href="" class="box-item is-warning">Android面试指南</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  经典博客
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">阮一峰</a>
                <a href="" class="box-item is-success">郭霖</a>
                <a href="" class="box-item is-danger">kymjs张涛</a>
                <a href="" class="box-item is-warning">任玉刚</a>
                <a href="" class="box-item is-info">技术小黑屋</a>

                <a href="" class="box-item is-primary">Weishu</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  常用网站
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">谷歌</a>
                <a href="" class="box-item is-success">百度</a>
                <a href="" class="box-item is-danger">必应</a>
                <a href="" class="box-item is-warning">谷歌开发者</a>
                <a href="" class="box-item is-info">Githup</a>

                <a href="" class="box-item is-primary">Stackoverflow</a>
                <a href="" class="box-item is-success">Segmentfault</a>
                <a href="" class="box-item is-danger">开源中国</a>
                <a href="" class="box-item is-warning">CSDN</a>
                <a href="" class="box-item is-info">掘金</a>

                <a href="" class="box-item is-primary">简书</a>
                <a href="" class="box-item is-success">玩Android</a>
                <a href="" class="box-item is-danger">开发者周报</a>
                <a href="" class="box-item is-warning">flutter中文</a>
                <a href="" class="box-item is-info">Dart</a>

                <a href="" class="box-item is-primary">AndroidBlog</a>
                <a href="" class="box-item is-success">51CTO</a>
                <a href="" class="box-item is-danger">Android开发网</a>
                <a href="" class="box-item is-warning">Android面试指南</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  经典博客
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">阮一峰</a>
                <a href="" class="box-item is-success">郭霖</a>
                <a href="" class="box-item is-danger">kymjs张涛</a>
                <a href="" class="box-item is-warning">任玉刚</a>
                <a href="" class="box-item is-info">技术小黑屋</a>

                <a href="" class="box-item is-primary">Weishu</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  常用网站
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">谷歌</a>
                <a href="" class="box-item is-success">百度</a>
                <a href="" class="box-item is-danger">必应</a>
                <a href="" class="box-item is-warning">谷歌开发者</a>
                <a href="" class="box-item is-info">Githup</a>

                <a href="" class="box-item is-primary">Stackoverflow</a>
                <a href="" class="box-item is-success">Segmentfault</a>
                <a href="" class="box-item is-danger">开源中国</a>
                <a href="" class="box-item is-warning">CSDN</a>
                <a href="" class="box-item is-info">掘金</a>

                <a href="" class="box-item is-primary">简书</a>
                <a href="" class="box-item is-success">玩Android</a>
                <a href="" class="box-item is-danger">开发者周报</a>
                <a href="" class="box-item is-warning">flutter中文</a>
                <a href="" class="box-item is-info">Dart</a>

                <a href="" class="box-item is-primary">AndroidBlog</a>
                <a href="" class="box-item is-success">51CTO</a>
                <a href="" class="box-item is-danger">Android开发网</a>
                <a href="" class="box-item is-warning">Android面试指南</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  经典博客
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">阮一峰</a>
                <a href="" class="box-item is-success">郭霖</a>
                <a href="" class="box-item is-danger">kymjs张涛</a>
                <a href="" class="box-item is-warning">任玉刚</a>
                <a href="" class="box-item is-info">技术小黑屋</a>

                <a href="" class="box-item is-primary">Weishu</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  常用网站
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">谷歌</a>
                <a href="" class="box-item is-success">百度</a>
                <a href="" class="box-item is-danger">必应</a>
                <a href="" class="box-item is-warning">谷歌开发者</a>
                <a href="" class="box-item is-info">Githup</a>

                <a href="" class="box-item is-primary">Stackoverflow</a>
                <a href="" class="box-item is-success">Segmentfault</a>
                <a href="" class="box-item is-danger">开源中国</a>
                <a href="" class="box-item is-warning">CSDN</a>
                <a href="" class="box-item is-info">掘金</a>

                <a href="" class="box-item is-primary">简书</a>
                <a href="" class="box-item is-success">玩Android</a>
                <a href="" class="box-item is-danger">开发者周报</a>
                <a href="" class="box-item is-warning">flutter中文</a>
                <a href="" class="box-item is-info">Dart</a>

                <a href="" class="box-item is-primary">AndroidBlog</a>
                <a href="" class="box-item is-success">51CTO</a>
                <a href="" class="box-item is-danger">Android开发网</a>
                <a href="" class="box-item is-warning">Android面试指南</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  经典博客
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">阮一峰</a>
                <a href="" class="box-item is-success">郭霖</a>
                <a href="" class="box-item is-danger">kymjs张涛</a>
                <a href="" class="box-item is-warning">任玉刚</a>
                <a href="" class="box-item is-info">技术小黑屋</a>

                <a href="" class="box-item is-primary">Weishu</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  常用网站
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">谷歌</a>
                <a href="" class="box-item is-success">百度</a>
                <a href="" class="box-item is-danger">必应</a>
                <a href="" class="box-item is-warning">谷歌开发者</a>
                <a href="" class="box-item is-info">Githup</a>

                <a href="" class="box-item is-primary">Stackoverflow</a>
                <a href="" class="box-item is-success">Segmentfault</a>
                <a href="" class="box-item is-danger">开源中国</a>
                <a href="" class="box-item is-warning">CSDN</a>
                <a href="" class="box-item is-info">掘金</a>

                <a href="" class="box-item is-primary">简书</a>
                <a href="" class="box-item is-success">玩Android</a>
                <a href="" class="box-item is-danger">开发者周报</a>
                <a href="" class="box-item is-warning">flutter中文</a>
                <a href="" class="box-item is-info">Dart</a>

                <a href="" class="box-item is-primary">AndroidBlog</a>
                <a href="" class="box-item is-success">51CTO</a>
                <a href="" class="box-item is-danger">Android开发网</a>
                <a href="" class="box-item is-warning">Android面试指南</a>
              </div>
            </div>

            <div class="post">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  经典博客
                </a>
              </div>
              <div class="tab-item">
                <a href="" class="box-item is-primary">阮一峰</a>
                <a href="" class="box-item is-success">郭霖</a>
                <a href="" class="box-item is-danger">kymjs张涛</a>
                <a href="" class="box-item is-warning">任玉刚</a>
                <a href="" class="box-item is-info">技术小黑屋</a>

                <a href="" class="box-item is-primary">Weishu</a>
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
export default {
  name: "home",
  data() {
    return {
      filter: {
        search_text: "",
        search_type: 1
      },
      navs: [
        {
          id: 1,
          name: "首页",
          is_active: true
        },
        {
          id: 2,
          name: "私人",
          is_active: false
        },
        {
          id: 3,
          name: "ios",
          is_active: false
        },
        {
          id: 4,
          name: "工具",
          is_active: false
        },
        {
          id: 5,
          name: "前端",
          is_active: false
        },
        {
          id: 6,
          name: "后端",
          is_active: false
        },
        {
          id: 7,
          name: "设计",
          is_active: false
        }
      ],
      searchs: [
        {
          id: 1,
          name: "百度",
          url: "https://www.baidu.com/s?wd=",
          is_default: true
        },
        {
          id: 2,
          name: "谷歌",
          url: "https://www.google.com.hk/search?q=",
          is_default: false
        },
        {
          id: 3,
          name: "必应",
          url: "https://cn.bing.com/search?q=",
          is_default: false
        },
        {
          id: 4,
          name: "多尼爱",
          url: "https://www.doniai.com/search?q=",
          is_default: false
        },
        {
          id: 5,
          name: "githup",
          url: "https://githup.com/search?q=",
          is_default: false
        },
        {
          id: 6,
          name: "图片",
          url:
            "http://image.baidu.com/search/index?tn=baiduimage&ps=1&ct=201326592&lm=-1&cl=2&nc=1&ie=utf-8&word=",
          is_default: false
        },
        {
          id: 7,
          name: "图标",
          url: "https://www.iconfont.cn/search/index?searchType=icon&q=",
          is_default: false
        }
      ]
    };
  },
  methods: {
    startSearch() {
      let id = this.filter.search_type;
      let text = this.filter.search_text;
      if (text == "" || text == null || undefined) {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: "输入框内容不能为空！",
          type: "is-danger",
          position: "is-bottom-right",
          actionText: "Msg"
        });
        return;
      }
      let searchObj = this.searchs.find(el => el.id === id);
      window.open(`${searchObj.url}${text}`);
    }
  }
};
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
</style>
