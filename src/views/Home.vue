<template>
  <div class="home">
    <div class="nav-box">
      <Navbar @updateCurrentNavs="updateCurrentNavs" :currentActiveMenuId="current_active_menu_id"/>
    </div>
    <div class="content-box cover-bg">
      <div
        class="cover-layer is-visible"
        :style="{ backgroundImage: coverBg ? `url(${coverBg})` : 'none' }"
      />
      <div class="container cover-content">
        <div class="columns">
          <div class="column is-three-quarters mt20">
            <SearchInput/>
          </div>
        </div>

        <div class="columns">
          <div class="column is-three-quarters main-column">
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
          <div class="column sidebar-column">
            <Sidebar/>
          </div>
        </div>
      </div>
    </div>

    <AsyncBackTop v-if="showBackTop" />
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
import Footer from '@/components/Footer.vue'
import { canAccessMenu, isLoggedIn } from '@/store/auth'
import { fetchPrivateNav } from '@/services/navApi'
import {
  DEFAULT_COVER,
  getCachedCover,
  preloadCover,
  refreshBingCover,
} from '@/utils/bingCover'

const MENU_STORAGE_KEY = 'doniaiNavActiveMenuId'
const VALID_MENU_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const PRIVATE_MENU_ID = 2

export default {
  name: 'home',
  components: {
    SearchInput,
    Navbar,
    Sidebar,
    Footer,
    AsyncBackTop: () =>
      import(/* webpackChunkName: "back-top" */ '@mlqt/vue-back-top').then((mod) => {
        const BackTop = mod.default
        Vue.use(BackTop)
        return BackTop
      }),
  },
  data() {
    const cached = getCachedCover()
    return {
      current_active_menu_id: 1,
      navData: [],
      coverBg: cached || DEFAULT_COVER,
      showBackTop: false,
    }
  },
  mounted() {
    this.showBackTop = true
  },
  created() {
    const menuId = this.getSavedMenuId()
    this.current_active_menu_id = menuId
    this.getCurrentNavs(menuId)
    this.initCover()
  },
  methods: {
    getSavedMenuId() {
      const saved = parseInt(localStorage.getItem(MENU_STORAGE_KEY), 10)
      const id = VALID_MENU_IDS.includes(saved) ? saved : 1
      return canAccessMenu(id) ? id : 1
    },
    saveMenuId(menuId) {
      localStorage.setItem(MENU_STORAGE_KEY, String(menuId))
    },
    async getCurrentNavs(menu_id) {
      if (menu_id === PRIVATE_MENU_ID && isLoggedIn()) {
        await this.loadPrivateNav()
        return
      }

      const dataMap = {
        1: 'homeData',
        2: 'workData',
        3: 'iosData',
        4: 'toolsData',
        5: 'frontendData',
        6: 'shopData',
        7: 'designData',
        8: 'blogData',
        9: 'foreignData',
        10: 'studyData',
      }
      const key = dataMap[menu_id] || 'homeData'
      const jsonNavs = (await import(/* webpackChunkName: "nav-data" */ '@/services/data.json')).default
      this.navData = jsonNavs[key] || []
    },
    async loadPrivateNav() {
      try {
        const { data } = await fetchPrivateNav()
        if (data?.ok && Array.isArray(data.categories) && data.categories.length > 0) {
          this.navData = data.categories
          return
        }
      } catch (e) {
        console.warn('load private nav failed', e)
      }
      const jsonNavs = (await import(/* webpackChunkName: "nav-data" */ '@/services/data.json')).default
      this.navData = jsonNavs.workData || []
    },
    updateCurrentNavs(obj) {
      const menuId = obj.menu_id
      if (!VALID_MENU_IDS.includes(menuId)) return
      if (!canAccessMenu(menuId)) {
        this.$buefy.toast.open({
          message: '请先登录后访问「私人」栏目',
          type: 'is-warning',
        })
        this.$router.push({ path: '/login', query: { redirect: '/' } })
        return
      }
      this.current_active_menu_id = menuId
      this.saveMenuId(menuId)
      this.getCurrentNavs(menuId)
    },
    async initCover() {
      const initial = this.coverBg
      preloadCover(initial).catch(() => {})

      refreshBingCover({ silent: true })
        .then(async (url) => {
          if (url && url !== this.coverBg) {
            await preloadCover(url).catch(() => {})
            this.coverBg = url
          }
        })
        .catch(() => {})
    },
  }
}
</script>

<style lang="less" scoped>
.nav-box {
  margin-bottom: 12px;
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
  position: relative;
  min-height: 100vh;
}

.cover-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: #1a2332;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 1;
  transition: opacity 0.4s ease;

  &:not(.is-visible) {
    opacity: 0;
  }
}

.cover-content {
  position: relative;
  z-index: 1;
}

.home .sidebar-column {
  min-width: 0;
  max-width: 100%;
}

@media screen and (max-width: 768px) {
  .home .content-box {
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }

  .home .content-box > .container {
    width: 100%;
    max-width: 100%;
    padding-left: 12px;
    padding-right: 12px;
  }

  .home .columns > .column {
    width: 100% !important;
  }

  .home .post {
    padding: 16px 14px;
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
  }

  .home .main-column .post:last-child {
    margin-bottom: 0;
  }

  .home .widget {
    margin-bottom: 12px;
  }

  .home .sub-title {
    font-size: 16px;
  }

  .home .tab-item {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;

    a,
    .box-item {
      width: 100%;
      max-width: none;
      height: 40px;
      line-height: 40px;
      font-size: 13px;
      margin: 0;
    }
  }

  .home .sidebar-column {
    margin-top: 4px;
  }
}

@media screen and (max-width: 360px) {
  .home .tab-item {
    grid-template-columns: 1fr;
  }
}
</style>
