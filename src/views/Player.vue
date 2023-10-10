<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="IPTV在线播放器"/>
    </div>
    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column is-three-quarters">
            <div class="mt-4 play-input">
              <div class="input-box">
                <b-input v-model="mediaSrc" placeholder="请输入播放地址" maxlength="400"></b-input>
              </div>
              <div class="start-play-btn">
                <b-button type="is-success" @click="startPlay">播放</b-button>
              </div>
            </div>
           
            <div class="lar-player">
              <video id="larPlayer" ref="larPlayer" :src="mediaSrc" controls autoplay :preload="preload+''" :height="height" :volume="playerVolume"></video>
              <div class="play-btn" @click="handlePlay">
                <i class="fas play-icon" :class="!pausedStatus ? 'fa-play-circle' : 'fa-pause-circle'"></i>
              </div>
              <div class="media-controls" v-if="!loading">
                <div class="left-controls">
                  <div class="control-btn" @click="handlePlay">
                    <i class="fas icon-style" :class="!pausedStatus ? 'fa-play-circle' : 'fa-pause-circle'"></i>
                  </div>
                  <div class="control-btn">
                    <div class="txt">音量 </div>
                    <input type="range" min="0" max="1" value="0.5" step="0.05" class="slider">
                  </div>
                  <div class="control-btn">Live</div>
                </div>
                <div class="right-controls">
                  <div class="control-btn" @click="handlePlay">播放</div>
                  <div class="control-btn">音量</div>
                  <div class="control-btn">
                    <i class="fas fa-square-full icon-style"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"> </back-top>
    </div>
    <div id="footer">
      <Footer />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import { getResourceType } from '@/utils/helper.js'
import Hls from 'hls.js'
import flvjs from 'flv.js'
Vue.use(BackTop)
export default {
  name: 'json',
  components: {
    Navbar,
    Sidebar,
    Footer
  },
  data() {
    return {
      mediaSrc: 'https://www.artplayer.org/assets/sample/video.mp4',
      //mediaSrc: '',
      pausedStatus: false,
      preload: true,
      height: 500,
      playerVolume: 0.01,
      loading: false,
    }
  },
  methods: {
    async startPlay() {
      await this.initPlayUrl()
      await this.loadMediaPlay()
    },
    handlePlay() {
      this.pausedStatus = !this.pausedStatus
      let larPlayer = document.getElementById('larPlayer')
      if (larPlayer.paused) {
        larPlayer.play()
      } else {
        larPlayer.pause()
      }
    },
    async initPlayUrl() {
      let videoSrc = this.mediaSrc
      let mediaType = getResourceType(videoSrc)
      if(["php", "unknow"].includes(mediaType)) {
        const res = await fetch(videoSrc)
        if (res.redirected) {
          this.mediaSrc = res.url
        }
      }
    },
    loadMediaPlay() {
      let videoSrc = this.mediaSrc
      let mediaType = getResourceType(videoSrc)
      let larPlayer = document.getElementById('larPlayer')
      if (mediaType === 'hls') {
        if (Hls.isSupported()) {
          let hls = new Hls()
          hls.loadSource(videoSrc)
          hls.attachMedia(larPlayer)
        } else if (larPlayer.canPlayType('application/vnd.apple.mpegurl')) {
          larPlayer.src = videoSrc
        } else {
          console.log('Unsupported playback format: m3u8')
        }
      } else if (mediaType === 'flv') {
        if (flvjs.isSupported()) {
          let flv = flvjs.createPlayer({
            type: 'flv',
            url: videoSrc
          })
          flv.attachMediaElement(larPlayer)
          flv.load()
        } else {
          console.log('Unsupported playback format: flv')
        }
      } else {
        larPlayer.src = videoSrc
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
  margin: 20px 0;
  position: relative;
  .play-btn {
    position: absolute;
    top: 40%;
    left: 48%;
    .play-icon {
      cursor: pointer;
      width: 60px;
      height: 60px;
      color: #FFFFFF;
      &:hover {
        color: #b1d4ee;
      }
    }
  }
  video {
    object-fit: fill;
    width: 100%;
    border-radius: 4px;
    background: #000000;
  }
  video::-webkit-media-controls {
    display: none !important;
  }
  .media-controls {
    width: 100%;
    position: absolute;
    display: flex;
    justify-content: space-between;
    color: #FFFFFF;
    bottom: 20px;
    .left-controls {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-left: 20px;
      .control-btn {
        margin-right: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        .txt {
          width: 52px;
        }
        .icon-style {
          color: #FFFFFF;
          width: 30px;
          height: 30px;
        }
        .slider {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: #FFFFFF;
          outline: none;
          opacity: 0.7;
          -webkit-transition: .2s;
          transition: opacity .2s;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #f33206;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #f33206;
          cursor: pointer;
        }
      }
    }
    .right-controls {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-right: 20px;
      .control-btn {
        margin-left: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        .icon-style {
          color: #FFFFFF;
          width: 30px;
          height: 30px;
        }
      }
    }
  }
  .media-loading {
    position: absolute;
    top: 40%;
    left: 45%;
    width: 80px;
    height: 80px;
    z-index: 100000;
    .circular {
      display: inline;
      width: 80px;
      height: 80px;
      box-sizing: border-box;
      animation: loading-rotate 2s linear infinite;
    }
  }
}
</style>
