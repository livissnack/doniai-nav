<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="媒体资源播放器"/>
    </div>
    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters">
            <div class="mt-4 play-input">
              <div class="input-box">
                <b-input type="url" v-model="mediaSrc" placeholder="请输入播放地址" maxlength="400" icon-pack="fas"
                         icon-right="times"
                         icon-right-clickable
                         @icon-right-click="clearIconClick"></b-input>
              </div>
              <div class="start-play-btn">
                <b-button type="is-success" @click="startPlay">播放</b-button>
              </div>
            </div>

            <div class="lar-player">
              <iframe @load="deleteAd" id="xiami-player" class="xiami-player" :src="mediaSrc" :allowfullscreen="true"
                      security="restricted" referrerpolicy="no-referrer"
                      sandbox="allow-same-origin allow-forms allow-scripts"></iframe>
            </div>
          </div>
          <div class="column">
            <div class="section-box">
              <MediaResource :resourceUrl="mediaSrc"/>
            </div>
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
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import MediaResource from "@/components/MediaResource.vue";

Vue.use(BackTop)
export default {
  name: 'xiami',
  components: {
    MediaResource,
    Navbar,
    Sidebar,
    Footer
  },
  data() {
    return {
      mediaSrc: 'https://jx.xmflv.com/?url=https://www.iqiyi.com/v_mzhth0ui7o.html',
    }
  },
  methods: {
    clearIconClick() {
      this.mediaSrc = ''
    },
    startPlay() {
      document.getElementById('xiami-player').contentWindow.location.reload()
    },
    deleteAd() {
      let iframe = document.getElementById('xiami-player')
      if (iframe && iframe.contentWindow) {
        let box2 = iframe.contentWindow.document.getElementById('adv_wrap_hh')
        box2.remove()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
  margin-bottom: 35px;
  border-bottom: 2px solid #e1e1e1;
}

.play-input {
  display: flex;
  justify-content: flex-start;

  .input-box {
    flex: 1;
  }
}

.lar-player {
  width: 100%;
  height: 564px;

  iframe {
    width: 100%;
    height: 564px;
  }
}

.section-box {
  margin-bottom: 20px;
}
</style>
