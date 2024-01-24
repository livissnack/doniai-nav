<template>
  <div class="home">
    <div class="nav-box">
      <Navbar @updateCurrentNavs="updateCurrentNavs" :currentActiveMenuId="current_active_menu_id"/>
    </div>
    <div class="content-box cover-bg">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters mt20">
            <SearchInput/>
          </div>
        </div>

        <div class="columns">
          <div class="column is-three-quarters">
            <div class="post" v-for="navItems in navData" :key="navItems.title">
              <div class="widget">
                <a href="#" class="sub-title title-underline">
                  {{ navItems.title }}
                </a>
              </div>
              <div class="tab-item">
                <a
                    :href="navItem.href"
                    :target="navItem.isNotNewBlack ? '_self' : '_blank'"
                    class="box-item"
                    :class="navItem.color"
                    v-for="navItem in navItems.items"
                    :key="navItem.index"
                >{{ navItem.name }}</a
                >
              </div>
            </div>
          </div>
          <div class="column">
            <Sidebar/>
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
import SearchInput from '@/components/SearchInput.vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import jsonNavs from '@/services/data.json'

Vue.use(BackTop)
export default {
  name: 'home',
  components: {
    SearchInput,
    Navbar,
    Sidebar,
    Footer
  },
  data() {
    return {
      current_active_menu_id: 1,
      navData: []
    }
  },
  created() {
    this.getCurrentNavs(1)
  },
  methods: {
    async getCurrentNavs(menu_id) {
      const dataMap = new Map([
        [1, 'homeData'],
        [2, 'workData'],
        [3, 'iosData'],
        [4, 'toolsData'],
        [5, 'frontendData'],
        [6, 'shopData'],
        [7, 'designData'],
        [8, 'blogData'],
        [9, 'foreignData'],
      ])
      let navs = await jsonNavs[dataMap.get(menu_id)]
      this.navData = navs
      this.$set(this, "navData", navs)
    },
    updateCurrentNavs(obj) {
      this.current_active_menu_id = obj.menu_id
      this.getCurrentNavs(obj.menu_id)
    },
  }
}
</script>

<style lang="less" scoped>
@media screen and (max-width: 375px) {
  .tab-item {
    .box-item {
      width: 130px !important;
    }
  }
}

.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
  margin-bottom: 12px;
  border-bottom: 2px solid #e1e1e1;
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
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 24px;
  a {
    color: #ffffff;
    font-size: 14px;
    display: inline-block;
    width: 140px;
    height: 35px;
    line-height: 35px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    //margin: 10px 34px 10px 0;
    text-align: center;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  .box-item {
    box-shadow: 1px 1px 5px #ccc5c5;
  }
}

.mt20 {
  margin-top: 20px;
}

.cover-bg {
  background-image: url('https://epg.112114.xyz/bingimg');
  background-size: cover;
}
</style>
