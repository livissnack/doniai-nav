<template>
  <div class="music-box">
    <div class="music-title">
      <div><h3>音乐播放器</h3></div>
      <div class="tv-title"><h3 @click="goTv">TV一下</h3></div>
    </div>
    <div class="music-player">
      <MusicPlayer
        v-if="audioReady"
        :audio="audio"
        :lrcType="3"
        :listFolded="is_hide_list"
      />
      <SidebarPanelState
        v-else-if="loading"
        status="loading"
        message="音乐加载中…"
        :retryable="false"
        compact
        :min-height="72"
      />
      <SidebarPanelState
        v-else-if="error"
        status="error"
        message="音乐列表加载失败"
        compact
        :min-height="72"
        @retry="getMusicList"
      />
      <SidebarPanelState
        v-else
        status="empty"
        message="暂无音乐"
        :retryable="false"
        compact
        :min-height="72"
      />
    </div>
  </div>
</template>

<script>
import MusicPlayer from '@/components/MusicPlayer.vue'
import SidebarPanelState from '@/components/SidebarPanelState.vue'
import { getMusic } from '@/services/api'
import { readCache, writeCache } from '@/utils/apiCache'
import { isEmpty } from '@/utils/helper'

const MUSIC_CACHE_KEY = 'doniaiNavCacheMusic'
const MUSIC_CACHE_TTL = 30 * 60 * 1000

export default {
  name: 'Music',
  components: { MusicPlayer, SidebarPanelState },
  data() {
    return {
      is_hide_list: true,
      audio: [],
      audioReady: false,
      loading: true,
      error: false,
    }
  },
  async created() {
    await this.getMusicList()
  },
  methods: {
    goTv() {
      this.$router.push({ path: '/player' })
    },
    async getMusicList() {
      this.error = false
      const hadAudio = this.audio.length > 0

      const cached = readCache(MUSIC_CACHE_KEY, MUSIC_CACHE_TTL)
      if (Array.isArray(cached) && cached.length) {
        this.audio = cached
        this.loading = false
        this.audioReady = true
        return
      }

      if (!hadAudio) {
        this.audioReady = false
      }
      this.loading = true

      try {
        const { data: musicList } = await getMusic()
        if (!isEmpty(musicList)) {
          this.audio = musicList.map((item) => ({
            name: item.name,
            artist: item.artist,
            url: item.url,
            cover: item.pic,
            lrc: item.lrc,
          }))
          writeCache(MUSIC_CACHE_KEY, this.audio)
        } else {
          this.audio = []
        }
      } catch (e) {
        console.warn('load music failed', e)
        this.audio = []
        this.error = true
      } finally {
        this.loading = false
        this.audioReady = this.audio.length > 0
      }
    },
  },
}
</script>

<style lang="less" scoped>
.music-box {
  background: #ffffff;
  padding: 10px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  overflow: hidden;

  .music-title {
    display: flex;
    justify-content: space-between;
    padding: 0 4px;

    div {
      h3 {
        font-size: 1em;
        font-weight: 700;
        color: #363636;
      }
    }

    .tv-title {
      h3 {
        &:hover {
          cursor: pointer;
          text-decoration: underline;
          color: #f4645f;
        }
      }
    }
  }

  .music-player {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }
}
</style>
