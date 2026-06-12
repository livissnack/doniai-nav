<template>
  <div class="home player-page">
    <div class="nav-box">
      <Navbar :newPage="true" pageTitle="IPTV在线播放器"/>
    </div>
    <div class="content-box">
      <div class="container">
        <UtilPageColumns>
        <div class="columns">
          <div class="column is-three-quarters">
            <div class="play-input">
              <div class="input-box">
                <o-field>
                  <o-input
                    type="url"
                    v-model="mediaSrc"
                    placeholder="请输入播放地址"
                    maxlength="400"
                    icon-pack="fas"
                    icon-right="times"
                    icon-right-clickable
                    @icon-right-click="clearIconClick"
                    @keyup.enter="startPlay"
                  />
                </o-field>
              </div>
              <div class="start-play-btn">
                <o-button variant="success" @click="startPlay">播放</o-button>
              </div>
            </div>

            <div class="other-play-btn">
              <div class="title">
                本机软件打开：
              </div>
              <button class="button" @click="handleOpenPlayer(0)">
                <img class="player-logo" :src="potplayerLogo" alt="PotPlayer">
                PotPlayer
              </button>
              <button class="button" @click="handleOpenPlayer(1)">
                <img class="player-logo" :src="iinaLogo" alt="Iina">
                Iina
              </button>
              <button class="button" @click="handleOpenPlayer(2)">
                <img class="player-logo" :src="vlcLogo" alt="Vlc">
                Vlc
              </button>
            </div>

            <div
              class="lar-player"
              @mouseenter="onPlayerMouseEnter"
              @mouseleave="onPlayerMouseLeave"
              @touchstart.passive="onPlayerTouch"
            >
              <video
                id="larPlayer"
                ref="larPlayer"
                :playsinline="true"
                :webkit-playsinline="true"
                :src="mediaSrc"
                :controls="false"
                autoplay
                :preload="preload + ''"
                :volume="playerVolume"
                @click="handlePlay"
                @play="pausedStatus = false"
                @pause="pausedStatus = true"
              ></video>
              <div
                v-if="customPlayOperate && pausedStatus"
                class="play-overlay"
                @click="handlePlay"
              >
                <AppIcon name="play"  />
              </div>
              <div
                class="media-controls"
                :class="{
                  'is-visible': controlsVisible || isCoarsePointer,
                  'is-compact': !customPlayOperate,
                  'is-touch': isCoarsePointer,
                }"
              >
                <div class="media-controls__bar">
                  <div v-if="customPlayOperate" class="media-controls__left">
                    <button
                      type="button"
                      class="ctrl-btn"
                      :aria-label="pausedStatus ? '播放' : '暂停'"
                      @click="handlePlay"
                    >
                      <AppIcon :name="String(pausedStatus ? 'fa-play' : 'fa-pause').replace(/^fa-/, '')"  />
                    </button>
                    <div class="ctrl-volume">
                      <AppIcon :name="volumeIcon" class="ctrl-volume__icon" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        :value="playerVolume"
                        step="0.05"
                        class="ctrl-volume__slider"
                        aria-label="音量"
                        @input="handlePlayerVolume"
                      />
                    </div>
                    <span class="ctrl-live">LIVE</span>
                  </div>
                  <div class="media-controls__right">
                    <div class="ctrl-dropdown">
                      <button type="button" class="ctrl-btn ctrl-btn--text" @click="handleTvList">
                        <AppIcon name="list"  />
                        <span>频道</span>
                      </button>
                      <div class="ctrl-panel" id="tvList">
                        <div class="ctrl-panel__head">频道列表</div>
                        <div
                          v-for="(tv, index) in tvList"
                          :key="index"
                          class="ctrl-panel__item"
                          :class="{ 'is-active': currentTv === tv.name }"
                          :title="tv.url"
                          @click="handleListPlay(tv)"
                        >
                          <img class="ctrl-panel__logo" :src="tv.logo" :alt="tv.name" />
                          <div class="ctrl-panel__meta">
                            <span class="ctrl-panel__name">{{ tv.name }}</span>
                            <small class="ctrl-panel__group">{{ tv.group }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="ctrl-dropdown">
                      <button type="button" class="ctrl-btn" aria-label="更多" @click="handleSetBox">
                        <AppIcon name="ellipsis-h"  />
                      </button>
                      <div class="ctrl-panel ctrl-panel--menu" id="setBox">
                        <div class="ctrl-panel__head">更多功能</div>
                        <button type="button" class="ctrl-panel__action" @click="copyPlayUrl">
                          <AppIcon name="link"  />
                          <span>复制播放地址</span>
                        </button>
                        <button type="button" class="ctrl-panel__action" @click="openInNewTab">
                          <AppIcon name="external-link-alt"  />
                          <span>新窗口打开</span>
                        </button>
                        <button type="button" class="ctrl-panel__action" @click="reloadStream">
                          <AppIcon name="redo"  />
                          <span>重新加载</span>
                        </button>
                        <button type="button" class="ctrl-panel__action" @click="toggleMute">
                          <AppIcon :name="String(isMuted ? 'fa-volume-mute' : 'fa-volume-up').replace(/^fa-/, '')"  />
                          <span>{{ isMuted ? '取消静音' : '静音' }}</span>
                        </button>
                        <button type="button" class="ctrl-panel__action" @click="cyclePlaybackRate">
                          <AppIcon name="tachometer-alt"  />
                          <span>播放倍速 {{ playbackRate }}x</span>
                        </button>
                        <button type="button" class="ctrl-panel__action" @click="captureScreenshot">
                          <AppIcon name="camera"  />
                          <span>截图保存</span>
                        </button>
                        <button type="button" class="ctrl-panel__action" @click="handlePictureInPicture">
                          <AppIcon name="clone"  />
                          <span>画中画</span>
                        </button>
                        <button
                          v-if="currentTv"
                          type="button"
                          class="ctrl-panel__action"
                          @click="toggleBackupSource"
                        >
                          <AppIcon name="random"  />
                          <span>{{ useBackupSource ? '切换主源' : '切换备用源' }}</span>
                        </button>
                        <button type="button" class="ctrl-panel__action" @click="goIptvTool">
                          <AppIcon name="tv"  />
                          <span>IPTV 工具</span>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="ctrl-btn" aria-label="画中画" @click="handleScreenShot">
                      <AppIcon name="clone"  />
                    </button>
                    <button type="button" class="ctrl-btn" aria-label="全屏" @click="handleFullScreen">
                      <AppIcon name="expand"  />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <SidebarColumn root-class="column" />
        </div>
        </UtilPageColumns>
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
import Navbar from '@/components/Navbar.vue'
import SidebarColumn from '@/components/SidebarColumn.vue'
import UtilPageColumns from '@/components/UtilPageColumns.vue'
import BackTop from '@/components/BackTop.vue'
import Footer from '@/components/Footer.vue'
import { saveAs } from 'file-saver'
import { getResourceType, isEmpty, isHttps } from '@/utils/helper.js'
import Hls from 'hls.js'
import flvjs from 'flv.js'
import tvList from '@/services/tv.json'
import platform from 'platform'
import potplayerLogo from '@/assets/potplayer.svg'
import iinaLogo from '@/assets/iina.png'
import vlcLogo from '@/assets/vlc.svg'

const yspIp = 'https://eco.livissnack.com'
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

let flvPlayer = null
let hlsPlayer = null

export default {
  name: 'Player',
  components: {
    Navbar,
    SidebarColumn,
    UtilPageColumns,
    Footer
  },
  data() {
    return {
      potplayerLogo,
      iinaLogo,
      vlcLogo,
      mediaSrc: 'https://www.artplayer.org/assets/sample/video.mp4',
      pausedStatus: false,
      preload: true,
      playerVolume: 0.5,
      loading: false,
      currentTv: '',
      tvList: tvList,
      customPlayOperate: true,
      controlsVisible: true,
      isCoarsePointer: false,
      isMuted: false,
      playbackRate: 1,
      playbackRateIndex: 2,
      useBackupSource: true,
    }
  },
  computed: {
    volumeIcon() {
      const v = Number(this.playerVolume)
      if (v <= 0) return 'volume-mute'
      if (v < 0.35) return 'volume-down'
      return 'volume-up'
    },
  },
  created() {
    this.checkBrowser()
    this.isCoarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    if (this.isCoarsePointer) {
      this.controlsVisible = true
    }
  },
  beforeUnmount() {
    this.destroyPlayers()
  },
  methods: {
    destroyPlayers() {
      if (flvPlayer) {
        flvPlayer.destroy()
        flvPlayer = null
      }
      if (hlsPlayer) {
        hlsPlayer.destroy()
        hlsPlayer = null
      }
    },
    getVideoEl() {
      return this.$refs.larPlayer || document.getElementById('larPlayer')
    },
    checkBrowser() {
      if (platform.name === 'Safari') {
        this.customPlayOperate = false
      }
    },
    async startPlay() {
      if (!this.mediaSrc?.trim()) {
        this.$notify({
          duration: 3000,
          message: '请输入播放地址',
          type: 'is-warning',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
        return
      }
      this.pausedStatus = false
      this.destroyPlayers()
      try {
        await this.initPlayUrl()
        await this.loadMediaPlay()
      } catch (e) {
        console.error('startPlay failed:', e)
        this.$notify({
          duration: 3000,
          message: '播放失败，请检查地址是否有效',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      }
    },
    async clearIconClick() {
      this.pausedStatus = false
      this.mediaSrc = ''
    },
    handlePlayerVolume(vol) {
      const value = Number(vol.target.value)
      this.playerVolume = value
      const larPlayer = this.getVideoEl()
      if (larPlayer) larPlayer.volume = value
    },
    onPlayerMouseEnter() {
      this.controlsVisible = true
    },
    onPlayerMouseLeave() {
      if (this.isCoarsePointer) return
      this.controlsVisible = false
      this.hidePanel('tvList')
      this.hidePanel('setBox')
    },
    onPlayerTouch() {
      if (!this.isCoarsePointer) return
      this.controlsVisible = true
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
      const larPlayer = this.getVideoEl()
      if (!larPlayer) return
      if (larPlayer.paused) {
        larPlayer.play().catch(() => {})
      } else {
        larPlayer.pause()
      }
    },
    togglePanel(id) {
      const panel = document.getElementById(id)
      if (!panel) return
      const willOpen = panel.style.display !== 'block'
      this.hidePanel('tvList')
      this.hidePanel('setBox')
      if (willOpen) panel.style.display = 'block'
    },
    hidePanel(id) {
      const panel = document.getElementById(id)
      if (panel) panel.style.display = 'none'
    },
    handleTvList() {
      this.togglePanel('tvList')
    },
    handleSetBox() {
      this.togglePanel('setBox')
    },
    hideTvList() {
      this.hidePanel('tvList')
    },
    closeMoreMenu() {
      this.hidePanel('setBox')
    },
    notify(message, type = 'is-info') {
      this.$notify({
        duration: 3000,
        message,
        type,
        position: 'is-bottom-right',
        actionText: 'Msg',
      })
    },
    async copyPlayUrl() {
      const url = this.mediaSrc?.trim()
      if (!url) {
        this.notify('暂无播放地址', 'is-warning')
        return
      }
      try {
        await this.$copyText(url)
        this.notify('播放地址已复制')
      } catch {
        this.notify('复制失败', 'is-danger')
      }
      this.closeMoreMenu()
    },
    openInNewTab() {
      const url = this.mediaSrc?.trim()
      if (!url) {
        this.notify('暂无播放地址', 'is-warning')
        return
      }
      window.open(url, '_blank', 'noopener,noreferrer')
      this.closeMoreMenu()
    },
    async reloadStream() {
      this.closeMoreMenu()
      if (!this.mediaSrc?.trim()) {
        this.notify('请先输入播放地址', 'is-warning')
        return
      }
      await this.startPlay()
      this.notify('已重新加载')
    },
    toggleMute() {
      const larPlayer = this.getVideoEl()
      if (!larPlayer) return
      larPlayer.muted = !larPlayer.muted
      this.isMuted = larPlayer.muted
      this.notify(this.isMuted ? '已静音' : '已取消静音')
      this.closeMoreMenu()
    },
    cyclePlaybackRate() {
      const larPlayer = this.getVideoEl()
      if (!larPlayer) return
      this.playbackRateIndex = (this.playbackRateIndex + 1) % PLAYBACK_RATES.length
      this.playbackRate = PLAYBACK_RATES[this.playbackRateIndex]
      larPlayer.playbackRate = this.playbackRate
      this.notify(`播放倍速 ${this.playbackRate}x`)
      this.closeMoreMenu()
    },
    captureScreenshot() {
      const larPlayer = this.getVideoEl()
      if (!larPlayer || larPlayer.readyState < 2) {
        this.notify('画面未就绪，请稍后再试', 'is-warning')
        return
      }
      const canvas = document.createElement('canvas')
      canvas.width = larPlayer.videoWidth || 1280
      canvas.height = larPlayer.videoHeight || 720
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        this.notify('截图失败', 'is-danger')
        return
      }
      try {
        ctx.drawImage(larPlayer, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (!blob) {
            this.notify('截图失败', 'is-danger')
            return
          }
          saveAs(blob, `player-${Date.now()}.png`)
          this.notify('截图已保存')
        }, 'image/png', 0.92)
      } catch (e) {
        console.error('captureScreenshot failed:', e)
        this.notify('截图失败，可能受跨域限制', 'is-danger')
      }
      this.closeMoreMenu()
    },
    handlePictureInPicture() {
      this.handleScreenShot()
      this.closeMoreMenu()
    },
    goIptvTool() {
      this.closeMoreMenu()
      this.$router.push({ path: '/utils/iptv' })
    },
    resolveTvUrl(tv) {
      const useBackup = this.useBackupSource && !isEmpty(tv.backup_url)
      const raw = useBackup ? tv.backup_url : tv.url
      return raw.startsWith('http') ? raw : `${yspIp}${raw}`
    },
    async toggleBackupSource() {
      const tv = this.tvList.find((item) => item.name === this.currentTv)
      if (!tv) {
        this.notify('请先选择频道', 'is-warning')
        return
      }
      if (isEmpty(tv.backup_url)) {
        this.notify('当前频道无备用源', 'is-warning')
        return
      }
      this.useBackupSource = !this.useBackupSource
      this.mediaSrc = this.resolveTvUrl(tv)
      this.closeMoreMenu()
      await this.startPlay()
      this.notify(this.useBackupSource ? '已切换备用源' : '已切换主源')
    },
    async handleListPlay(tv) {
      this.currentTv = tv.name
      this.mediaSrc = this.resolveTvUrl(tv)
      this.pausedStatus = false
      await this.hideTvList()
      await this.startPlay()
    },
    handleScreenShot() {
      const larPlayer = this.getVideoEl()
      if (!larPlayer) return
      if (larPlayer.requestPictureInPicture) {
        larPlayer.requestPictureInPicture().catch(() => {})
      }
    },
    handleFullScreen() {
      const larPlayer = this.getVideoEl()
      if (!larPlayer) return
      if (larPlayer.requestFullscreen) {
        larPlayer.requestFullscreen().catch(() => {})
      }
    },
    async initPlayUrl() {
      const videoSrc = this.mediaSrc?.trim()
      if (!videoSrc) return
      let mediaType = 'unknow'
      try {
        mediaType = getResourceType(videoSrc)
      } catch (e) {
        console.warn('getResourceType failed:', e)
      }
      if (!['php', 'unknow'].includes(mediaType)) return

      const url = `https://poly_admin.livissnack.com/api/parse?live_url=${encodeURIComponent(videoSrc)}`
      const response = await fetch(url)
      const res = await response.json()
      const parseUrl = res?.data
      if (!parseUrl) {
        throw new Error('parse url empty')
      }
      this.mediaSrc = isHttps(parseUrl) ? parseUrl : parseUrl.replace(/^http/, 'https')
    },
    loadMediaPlay() {
      const videoSrc = this.mediaSrc?.trim()
      const larPlayer = this.getVideoEl()
      if (!videoSrc || !larPlayer) return

      let mediaType = 'video'
      try {
        mediaType = getResourceType(videoSrc)
      } catch (e) {
        console.warn('getResourceType failed:', e)
      }

      if (mediaType === 'hls') {
        if (Hls.isSupported()) {
          hlsPlayer = new Hls()
          hlsPlayer.loadSource(videoSrc)
          hlsPlayer.attachMedia(larPlayer)
          hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
            larPlayer.playbackRate = this.playbackRate
            larPlayer.muted = this.isMuted
            larPlayer.play().catch(() => {})
          })
        } else if (larPlayer.canPlayType('application/vnd.apple.mpegurl')) {
          larPlayer.src = videoSrc
          larPlayer.playbackRate = this.playbackRate
          larPlayer.muted = this.isMuted
          larPlayer.play().catch(() => {})
        } else {
          console.log('Unsupported playback format: m3u8')
        }
        return
      }

      if (mediaType === 'flv') {
        if (flvjs.isSupported()) {
          flvPlayer = flvjs.createPlayer({ type: 'flv', url: videoSrc })
          flvPlayer.attachMediaElement(larPlayer)
          flvPlayer.load()
          larPlayer.playbackRate = this.playbackRate
          larPlayer.muted = this.isMuted
          larPlayer.play().catch(() => {})
        } else {
          console.log('Unsupported playback format: flv')
        }
        return
      }

      larPlayer.src = videoSrc
      larPlayer.load()
      larPlayer.playbackRate = this.playbackRate
      larPlayer.muted = this.isMuted
      larPlayer.play().catch(() => {})
    },
  },
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
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;

  .input-box {
    flex: 1;
    min-width: 0;

    :deep(.field) {
      margin-bottom: 0;
      width: 100%;
    }

    :deep(.control) {
      width: 100%;
    }

    :deep(.input) {
      width: 100%;
      height: 40px;
      min-height: 40px;
      box-sizing: border-box;
    }
  }

  .start-play-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;

    :deep(.button) {
      height: 40px;
      min-height: 40px;
      margin: 0;
      white-space: nowrap;
    }
  }
}

.lar-player {
  margin: 20px 0;
  position: relative;
  border-radius: 0;
  overflow: hidden;
  background: #000;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.18);

  video {
    display: block;
    object-fit: contain;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    min-height: 200px;
    max-height: 564px;
    background: #000;
  }

  video::-webkit-media-controls {
    display: none !important;
  }
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  cursor: pointer;
  z-index: 2;

  i {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(32, 188, 86, 0.92);
    color: #fff;
    font-size: 28px;
    padding-left: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    transition: transform 0.2s, background 0.2s;
  }

  &:hover i {
    transform: scale(1.06);
    background: #22c65b;
  }
}

.media-controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  &.is-compact .media-controls__bar {
    justify-content: flex-end;
  }
}

.media-controls__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.72) 40%, rgba(0, 0, 0, 0.88) 100%);
  backdrop-filter: blur(6px);
}

.media-controls__left,
.media-controls__right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ctrl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: rgba(32, 188, 86, 0.35);
    color: #fff;
  }

  &--text {
    padding: 0 12px;
    font-size: 13px;
    font-weight: 500;
  }
}

.ctrl-volume {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);

  &__icon {
    flex-shrink: 0;
    width: 16px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
  }

  &__slider {
    -webkit-appearance: none;
    appearance: none;
    width: 88px;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.35);
    outline: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #20bc56;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
      cursor: pointer;
    }

    &::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border: none;
      border-radius: 50%;
      background: #20bc56;
      cursor: pointer;
    }
  }
}

.ctrl-live {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.85);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.ctrl-dropdown {
  position: relative;
}

.ctrl-panel {
  display: none;
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  width: 280px;
  max-height: 260px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 10px;
  background: rgba(24, 24, 27, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);

  &--sm {
    width: 140px;
    max-height: none;
    padding: 6px;
  }

  &--menu {
    width: 200px;
    max-height: 320px;
    padding: 6px;
  }

  &__head {
    padding: 6px 8px 10px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.55);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 6px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: rgba(32, 188, 86, 0.18);
    }

    &.is-active {
      background: rgba(32, 188, 86, 0.28);

      .ctrl-panel__name {
        color: #4ade80;
      }
    }
  }

  &__logo {
    flex-shrink: 0;
    width: 56px;
    height: 28px;
    object-fit: contain;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 4px;
  }

  &__meta {
    min-width: 0;
    flex: 1;
  }

  &__name {
    display: block;
    font-size: 13px;
    color: #f3f4f6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__group {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
  }

  &__action {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #f3f4f6;
    font-size: 13px;
    text-align: left;
    cursor: pointer;

    i {
      width: 16px;
      flex-shrink: 0;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
      text-align: center;
    }

    span {
      flex: 1;
      min-width: 0;
    }

    &:hover {
      background: rgba(32, 188, 86, 0.18);

      i {
        color: #4ade80;
      }
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(32, 188, 86, 0.6);
    border-radius: 999px;
  }
}

@media screen and (max-width: 768px) {
  .player-page .nav-box {
    margin-bottom: 16px;
  }

  .player-page .content-box {
    overflow-x: hidden;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }

  .player-page .content-box > .container {
    padding: 0 12px;
  }

  .play-input {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;

    .start-play-btn :deep(.button) {
      width: 100%;
    }
  }

  .lar-player {
    margin: 12px 0 16px;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);

    video {
      max-height: none;
      min-height: 180px;
    }
  }

  .media-controls__bar {
    flex-wrap: nowrap;
    align-items: center;
    padding: 6px 8px;
    gap: 4px;
  }

  .media-controls__left {
    flex: 1;
    min-width: 0;
    gap: 4px;
    overflow: hidden;
  }

  .media-controls__right {
    flex-shrink: 0;
    gap: 4px;
  }

  .media-controls.is-touch {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  .ctrl-volume,
  .ctrl-live {
    display: none;
  }

  .ctrl-btn {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    font-size: 13px;
  }

  .ctrl-btn--text span {
    display: none;
  }

  .media-controls__right > .ctrl-btn[aria-label='画中画'] {
    display: none;
  }

  .ctrl-panel {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    top: auto;
    width: auto;
    max-height: min(52vh, 320px);
    z-index: 120;
    transform: none;
  }

  .ctrl-panel--menu {
    max-height: min(60vh, 360px);
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
</style>
