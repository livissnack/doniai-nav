<template>
  <div ref="root" class="aplayer-host" :class="{ 'is-empty': !hasTracks }"></div>
</template>

<script>
import { yieldToMain } from '@/utils/defer'

let aplayerModule = null

function loadAPlayer() {
  if (!aplayerModule) {
    aplayerModule = Promise.all([
      import('aplayer'),
      import('aplayer/dist/APlayer.min.css'),
    ]).then(([mod]) => mod.default)
  }
  return aplayerModule
}

function normalizeTracks(list) {
  return (list || [])
    .filter((item) => item && item.url)
    .map((item) => {
      const track = {
        name: String(item.name || '未知曲目'),
        artist: String(item.artist || ''),
        url: String(item.url),
        cover: String(item.cover || 'https://github.com/u3u.png'),
      }
      const lrc = item.lrc ? String(item.lrc).trim() : ''
      if (lrc) track.lrc = lrc
      return track
    })
}

/** APlayer destroy 后仍有 setInterval/setTimeout 访问 container，需先停定时器并 stub UI 更新 */
function safeDisposeAPlayer(player) {
  if (!player) return

  const noop = () => {}

  try {
    if (player.timer?.destroy) {
      player.timer.destroy()
    }
    if (player.noticeTime) {
      clearTimeout(player.noticeTime)
      player.noticeTime = null
    }

    player.setUIPaused = noop
    player.setUIPlaying = noop
    player.pause = noop
    player.play = noop
    player.toggle = noop

    if (player.hls?.destroy) {
      try {
        player.hls.destroy()
      } catch {
        // ignore
      }
      player.hls = null
    }

    if (player.audio) {
      try {
        player.audio.pause()
        player.audio.removeAttribute('src')
        player.audio.load()
      } catch {
        // ignore
      }
    }

    if (player.container) {
      player.container.innerHTML = ''
    }

    if (typeof player.destroy === 'function') {
      player.destroy = noop
    }
  } catch (e) {
    console.warn('APlayer safe dispose:', e)
  }
}

export default {
  name: 'MusicPlayer',
  props: {
    audio: { type: Array, default: () => [] },
    lrcType: { type: Number, default: 3 },
    listFolded: { type: Boolean, default: true },
  },
  data() {
    return {
      player: null,
      hasTracks: false,
      tracks: [],
      _rebuildGen: 0,
      _rebuildTimer: null,
      _mounted: false,
      _visible: false,
      _pendingList: null,
      _io: null,
    }
  },
  watch: {
    audio: {
      deep: true,
      immediate: true,
      handler(list) {
        this.scheduleRebuild(list)
      },
    },
  },
  mounted() {
    this._mounted = true
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = this.$refs.root
        if (!el || !this._mounted) return
        this._io = new IntersectionObserver(
          (entries) => {
            const visible = entries.some((entry) => entry.isIntersecting)
            if (visible === this._visible) return
            this._visible = visible
            if (visible) {
              this.scheduleRebuild(this._pendingList ?? this.audio)
            }
          },
          { root: null, rootMargin: '80px 0px', threshold: 0.01 },
        )
        this._io.observe(el)
      })
    })
  },
  beforeUnmount() {
    this._mounted = false
    this._io?.disconnect()
    this._io = null
    this.destroyPlayer()
  },
  methods: {
    disposePlayer() {
      const player = this.player
      this.player = null
      safeDisposeAPlayer(player)

      const el = this.$refs.root
      if (el) {
        el.innerHTML = ''
      }
    },
    destroyPlayer() {
      this._rebuildGen += 1
      clearTimeout(this._rebuildTimer)
      this._rebuildTimer = null
      this.disposePlayer()
      this.hasTracks = false
      this.tracks = []
    },
    scheduleRebuild(list) {
      this._pendingList = list
      if (!this._visible) return
      clearTimeout(this._rebuildTimer)
      this._rebuildTimer = setTimeout(() => {
        this._rebuildTimer = null
        this.rebuild(list)
      }, 80)
    },
    isStale(gen) {
      return gen !== this._rebuildGen || !this._mounted
    },
    async rebuild(list) {
      if (!this._visible) {
        this._pendingList = list
        return
      }

      const gen = ++this._rebuildGen
      const tracks = normalizeTracks(list)

      if (!tracks.length) {
        this.destroyPlayer()
        return
      }

      const same =
        tracks.length === this.tracks.length &&
        tracks.every((t, i) => t.url === this.tracks[i]?.url)
      if (same && this.player) return

      this.disposePlayer()
      this.tracks = tracks
      this.hasTracks = true

      await this.$nextTick()
      if (this.isStale(gen)) return

      await yieldToMain()
      if (this.isStale(gen)) return

      const el = this.$refs.root
      if (!el || !el.isConnected) return

      el.innerHTML = ''

      const APlayer = await loadAPlayer()
      if (this.isStale(gen)) return

      await yieldToMain()
      if (this.isStale(gen)) return

      const hasRemoteLrc = tracks.some((t) => t.lrc && String(t.lrc).startsWith('http'))
      const lrcType = hasRemoteLrc ? this.lrcType : 0

      try {
        const instance = new APlayer({
          container: el,
          audio: tracks,
          lrcType,
          listFolded: this.listFolded,
          listMaxHeight: 120,
          theme: '#20bc56',
          autoplay: false,
          preload: 'none',
        })

        if (this.isStale(gen)) {
          safeDisposeAPlayer(instance)
          return
        }

        this.player = instance
      } catch (e) {
        console.warn('APlayer init failed', e)
        this.hasTracks = false
        this.tracks = []
      }
    },
  },
}
</script>

<style scoped>
.aplayer-host {
  width: 100%;
  min-height: 66px;
}

.aplayer-host.is-empty {
  min-height: 0;
}
</style>
