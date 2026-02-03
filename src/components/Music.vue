<template>
  <div class="music-box">
    <div class="music-title">
      <div><h3>音乐播放器</h3></div>
      <div class="tv-title"><h3 @click="goTv">TV一下</h3></div>
    </div>
    <div class="music-player">
      <aplayer :audio="audio" :lrcType="3" :listFolded="is_hide_list" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import APlayer from '@moefe/vue-aplayer'
import {getVikiRandomMusic, getVikiRandomMusicDetail} from "@/services/api1";
Vue.use(APlayer, {
  defaultCover: 'https://github.com/u3u.png',
  productionTip: true
})
export default {
  name: 'Music',
  data() {
    return {
      is_hide_list: true,
      audio: []
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
      const { data: list } = await getVikiRandomMusic()
      const rankId = list[0].id
      const { data: musicList } = await getVikiRandomMusicDetail(rankId)
      musicList.forEach(item => {
        this.audio.push({
          name: item.title,
          artist: item.artist[0].name,
          url: item.link,
          cover: item.album.cover,
          lrc: `https://60s.viki.moe/v2/lyric?query=${item.title}`,
        })
      })
      console.log(this.audio, 'kkkk---')
    },
  }
}
</script>

<style lang="less" scoped>
.music-box {
  background: #ffffff;
  padding: 10px 10px 10px 10px;
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
    max-width: 298px;
  }
}
</style>
