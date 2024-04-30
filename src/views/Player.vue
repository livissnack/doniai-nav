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
                <b-input type="url" v-model="mediaSrc" placeholder="请输入播放地址" maxlength="400" icon-pack="fas"
                         icon-right="times"
                         icon-right-clickable
                         @icon-right-click="clearIconClick"></b-input>
              </div>
              <div class="start-play-btn">
                <b-button type="is-success" @click="startPlay">播放</b-button>
              </div>
            </div>

            <div class="other-play-btn">
              <div class="title">
                本机软件打开：
              </div>
              <button class="button" @click="handleOpenPlayer(0)">
                <img class="player-logo" src="../assets/potplayer.svg" alt="PotPlayer">
                PotPlayer
              </button>
              <button class="button" @click="handleOpenPlayer(1)">
                <img class="player-logo" src="../assets/iina.png" alt="PotPlayer">
                Iina
              </button>
              <button class="button" @click="handleOpenPlayer(2)">
                <img class="player-logo" src="../assets/vlc.svg" alt="PotPlayer">
                Vlc
              </button>
            </div>

            <div class="lar-player">
              <video id="larPlayer" ref="larPlayer" :playsinline="true" :webkit-playsinline="true" :src="mediaSrc" :controls="true" autoplay :preload="preload+''"
                     :height="height" :volume="playerVolume" @click="handlePlay"></video>
              <div class="play-btn" @click="handlePlay" v-if="customPlayOperate">
                <i class="fas play-icon" :class="pausedStatus ? 'fa-play-circle' : 'fa-pause-circle'"></i>
              </div>
              <div class="media-controls" :class="customPlayOperate ? '' : 'flex-end'">
                <div class="left-controls" v-if="customPlayOperate">
                  <div class="control-btn" @click="handlePlay">
                    <i class="fas icon-style" :class="pausedStatus ? 'fa-play-circle' : 'fa-pause-circle'"></i>
                  </div>
                  <div class="control-btn live-volume">
                    <div class="txt">音量</div>
                    <input type="range" min="0" max="1" value="0.5" step="0.05" class="slider"
                           @input="handlePlayerVolume">
                  </div>
                  <div class="control-btn live-tag">Live</div>
                </div>
                <div class="right-controls">
                  <div class="control-btn tv-box">
                    <div class="title" @click="handleTvList">列表</div>
                    <div class="tv-list-box" id="tvList">
                      <div class="tv-item" :class="currentTv === tv.name ? 'is-active' : ''"
                           v-for="(tv, index) in tvList" :key="index" :title="tv.url" @click="handleListPlay(tv)">
                        <div class="tv-item-logo">
                          <img :src="tv.logo" :alt="tv.name">
                        </div>
                        <div class="tv-item-name">
                          {{ tv.name }}
                          <small class="tv-item-group">({{ tv.group }})</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="control-btn tv-box">
                    <i class="fas fa-cog icon-style" @click="handleSetBox"></i>
                    <div class="tv-list-box" id="setBox">
                      <div class="tv-item" @click="handleRemoteList()">
                        <div class="tv-item-name">
                          更多操作
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="control-btn" @click="handleScreenShot">
                    <i class="fas fa-camera icon-style"></i>
                  </div>
                  <div class="control-btn" @click="handleFullScreen">
                    <i class="fas fa-expand icon-style"></i>
                  </div>
                </div>
              </div>
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
import {getResourceType, isEmpty, isHttps} from '@/utils/helper.js'
import Hls from 'hls.js'
import flvjs from 'flv.js'
import MediaResource from "@/components/MediaResource.vue"
import tvList from "@/services/tv.json"
var platform = require('platform')

Vue.use(BackTop)
const yspIp = 'https://eco.livissnack.com'
const isBackup = true
var flv
export default {
  name: 'json',
  components: {
    MediaResource,
    Navbar,
    Sidebar,
    Footer
  },
  data() {
    return {
      mediaSrc: 'https://www.artplayer.org/assets/sample/video.mp4',
      pausedStatus: false,
      preload: true,
      height: 564,
      playerVolume: 0.5,
      loading: false,
      currentTv: '',
      tvList: tvList,
      customPlayOperate: true,
    }
  },
  created() {
    this.checkBrowser()
  },
  methods: {
    checkBrowser() {
      if (platform.name === 'Safari') {
        this.customPlayOperate = false
      }
    },
    async startPlay() {
      this.pausedStatus = false
      if (!isEmpty(flv)) {
        flv.destroy()
      }
      await this.initPlayUrl()
      await this.loadMediaPlay()
    },
    async clearIconClick() {
      this.pausedStatus = false
      this.mediaSrc = ''
    },
    handlePlayerVolume(vol) {
      this.playerVolume = vol.target.value
    },
    handleOpenPlayer(type) {
      let map = ['potplayer', 'iina', 'vlc', 'thunder']
      if (type === 1) {
        location.href = `iina://open?url=${this.mediaSrc}`
      } else {
        location.href = `${map[type]}://${this.mediaSrc}`
      }
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
    handleSetBox() {
      let tvList = document.getElementById('setBox')
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
    async handleRemoteList() {
    },
    async handleListPlay(tv) {
      this.currentTv = tv.name
      let tmpUrl = isBackup ? (isEmpty(tv.backup_url) ? tv.url : tv.backup_url) : tv.url
      this.mediaSrc = tmpUrl.startsWith('http') ? `${tmpUrl}` : `${yspIp}${tmpUrl}`
      this.pausedStatus = false
      await this.hideTvList()
      await this.startPlay()
    },
    handleScreenShot() {
      let larPlayer = document.getElementById('larPlayer')
      larPlayer.requestPictureInPicture()
      larPlayer.webkitEnterFullscreen()
    },
    handleFullScreen() {
      let larPlayer = document.getElementById('larPlayer')
      larPlayer.requestFullscreen()
    },
    async initPlayUrl() {
      let videoSrc = this.mediaSrc
      let mediaType = getResourceType(videoSrc)
      if (["php", "unknow"].includes(mediaType)) {
        let url = `https://poly_admin.livissnack.com/api/parse?live_url=${videoSrc}`
        let response = await fetch(url)
        let res = await response.json()
        let parseUrl = res.data
        if (isHttps(parseUrl)) {
          this.mediaSrc = parseUrl
        } else {
          this.mediaSrc = parseUrl.replace(/^http/, "https")
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
          flv = flvjs.createPlayer({
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
    },
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
    display: none;

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

  &:hover {
    .media-controls {
      display: flex;
      justify-content: space-between;
    }

    .play-btn {
      display: block;
    }
  }

  .flex-end {
    justify-content: flex-end !important;
  }

  .media-controls {
    width: 100%;
    position: absolute;
    color: #FFFFFF;
    bottom: 20px;
    display: none;

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
    width: 220px;
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
      cursor: pointer;
      display: flex;
      justify-content: flex-start;
      border-bottom: 1px solid #22c65b;

      .tv-item-logo {
        img {
          width: 80px;
          height: 30px;
          object-fit: contain;
        }
      }

      .tv-item-name {
        text-transform: uppercase;
        width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        .tv-item-group {
          margin-left: 4px;
        }
      }

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

.other-play-btn {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  height: 40px;

  .title {
    height: 40px;
    line-height: 40px;
    color: #15b982;
    font-size: 16px;
  }

  .player-logo {
    width: 24px;
    height: 24px;
  }
}

.section-box {
  margin-bottom: 20px;
}
</style>
