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
              <div class="play-btn" @click="handlePlay" v-if="pausedStatus">
                <i class="fas play-icon" :class="pausedStatus ? 'fa-play-circle' : 'fa-pause-circle'"></i>
              </div>
              <div class="media-controls" v-if="!loading">
                <div class="left-controls">
                  <div class="control-btn" @click="handlePlay">
                    <i class="fas icon-style" :class="pausedStatus ? 'fa-play-circle' : 'fa-pause-circle'"></i>
                  </div>
                  <div class="control-btn">
                    <div class="txt">音量 </div>
                    <input type="range" min="0" max="1" value="0.5" step="0.05" class="slider">
                  </div>
                  <div class="control-btn">Live</div>
                </div>
                <div class="right-controls">
                  <div class="control-btn tv-box">
                    <div class="title" @click="handleTvList">列表</div>
                    <div class="tv-list-box" id="tvList">
                      <div class="tv-item" :class="currentTv === tv.name ? 'is-active' : ''" v-for="(tv, index) in tvList" :key="index" :title="tv.url" @click="handleListPlay(tv)">{{ tv.name }}</div>
                    </div>
                  </div>
                  <div class="control-btn">
                    <i class="fas fa-cog icon-style"></i>
                  </div>
                  <div class="control-btn">
                    <i class="fas fa-camera icon-style"></i>
                  </div>
                  <div class="control-btn" @click="handleFullScreen">
                    <i class="fas fa-expand icon-style"></i>
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
const yspIp = '42.81.252.22'
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
      height: 564,
      playerVolume: 0.01,
      loading: false,
      currentTv: '',
      tvList: [
        {
          name: 'CCTV-4K',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000266303.m3u8`
        },
        {
          name: 'CCTV-8K',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2020603421.m3u8`
        },
        {
          name: 'CCTV-1',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000210103.m3u8`
        },
        {
          name: 'CCTV-2',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000203603.m3u8`
        },
        {
          name: 'CCTV-3',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000203803.m3u8`
        },
        {
          name: 'CCTV-4',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000204803.m3u8`
        },
        {
          name: 'CCTV-5',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000205103.m3u8`
        },
        {
          name: 'CCTV-5+',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000204503.m3u8`
        },
        {
          name: 'CCTV-6',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000203303.m3u8`
        },
        {
          name: 'CCTV-7',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000510003.m3u8`
        },
        {
          name: 'CCTV-8',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000203903.m3u8`
        },
        {
          name: 'CCTV-9',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000499403.m3u8`
        },
        {
          name: 'CCTV-10',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000203503.m3u8`
        },
        {
          name: 'CCTV-11',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000204103.m3u8`
        },
        {
          name: 'CCTV-12',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000202603.m3u8`
        },
        {
          name: 'CCTV-13',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000204603.m3u8`
        },
        {
          name: 'CCTV-14',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000204403.m3u8`
        },
        {
          name: 'CCTV-15',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000205003.m3u8`
        },
        {
          name: 'CCTV-16',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012375003.m3u8`
        },
        {
          name: 'CCTV-16 4K',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012375003.m3u8`
        },
        {
          name: 'CCTV-17',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000204203.m3u8`
        },
        {
          name: '兵器科技',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012513403.m3u8`
        },
        {
          name: '第一剧场',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012514403.m3u8`
        },
        {
          name: '怀旧剧场',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012511203.m3u8`
        },
        {
          name: '风云剧场',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012513603.m3u8`
        },
        {
          name: '风云音乐',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012514103.m3u8`
        },
        {
          name: '风云足球',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012514203.m3u8`
        },
        {
          name: '电视指南',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012514003.m3u8`
        },
        {
          name: '女性时尚',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012513903.m3u8`
        },
        {
          name: '央视文化精品',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012513803.m3u8`
        },
        {
          name: '世界地理',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012513303.m3u8`
        },
        {
          name: '高尔夫网球',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012512503.m3u8`
        },
        {
          name: '央视台球',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012513703.m3u8`
        },
        {
          name: '卫生健康',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2012513503.m3u8`
        },
        {
          name: '北京卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000272103.m3u8`
        },
        {
          name: '东方卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000292403.m3u8`
        },
        {
          name: '天津卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2019927003.m3u8`
        },
        {
          name: '重庆卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000297803.m3u8`
        },
        {
          name: '黑龙江卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000293903.m3u8`
        },
        {
          name: '辽宁卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000281303.m3u8`
        },
        {
          name: '河北卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000293403.m3u8`
        },
        {
          name: '山东卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000294803.m3u8`
        },
        {
          name: '安徽卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000298003.m3u8`
        },
        {
          name: '河南卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000296103.m3u8`
        },
        {
          name: '湖北卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000294503.m3u8`
        },
        {
          name: '湖南卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000296203.m3u8`
        },
        {
          name: '江西卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000294103.m3u8`
        },
        {
          name: '江苏卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000295603.m3u8`
        },
        {
          name: '浙江卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000295503.m3u8`
        },
        {
          name: '东南卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000292503.m3u8`
        },
        {
          name: '广东卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000292703.m3u8`
        },
        {
          name: '深圳卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000292203.m3u8`
        },
        {
          name: '广西卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000294203.m3u8`
        },
        {
          name: '贵州卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000293303.m3u8`
        },
        {
          name: '四川卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000295003.m3u8`
        },
        {
          name: '新疆卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2019927403.m3u8`
        },
        {
          name: '海南卫视',
          url: `http://${yspIp}/tlivecloud-ipv6.ysp.cctv.cn/ysp/2000291503.m3u8`
        },
      ],
    }
  },
  methods: {
    async startPlay() {
      this.pausedStatus = false
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
    handleTvList() {
      let tvList = document.getElementById('tvList')
      if (tvList.style.display === 'block') {
        tvList.style.display = 'none'
      } else {
        tvList.style.display = 'block'
      }
    },
    hideTvList() {
      let tvList = document.getElementById('tvList')
      tvList.style.display = 'none'
    },
    async handleListPlay(tv) {
      this.currentTv = tv.name
      this.mediaSrc = tv.url
      this.pausedStatus = false
      await this.hideTvList()
      await this.startPlay()
    },
    handleFullScreen() {
      let larPlayer = document.getElementById('larPlayer')
      larPlayer.requestFullscreen()
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
      font-size: 60px;
      &:hover {
        color: #b1d4ee;
      }
    }
  }
  video {
    object-fit: fill;
    width: 100%;
    height: 564px;
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
          font-size: 30px;
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
          font-size: 30px;
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

.tv-box {
  position: relative;
  .title {
    right: 0;
    top: -6px;
    width: 40px;
    position: absolute;
    font-size: 1em;
    color: #FFFFFF;
  }
  .tv-list-box {
    display: none;
    position: absolute;
    background: #3a3a3a;
    width: 120px;
    bottom: 30px;
    right: -30px;
    padding: 10px;
    height: 200px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: block;
      width: 8px;
      height: 100%;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #23d160;
      border-radius: 30px;
      height: 50px;
    }
    .tv-item {
      text-transform: uppercase;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover {
        color: #23d160;
        text-decoration: underline;
      }
    }
    .is-active {
      color: #23d160;
      text-decoration: underline;
    }
  }
}
</style>
