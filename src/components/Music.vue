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
Vue.use(APlayer, {
  defaultCover: 'https://github.com/u3u.png',
  productionTip: true
})
export default {
  name: 'Music',
  data() {
    return {
      is_hide_list: true,
      audio: [
        {
          name: '真的爱你',
          artist: 'Beyond',
          url: 'https://cdn.doniai.com/music/mp3/really-love.mp3',
          cover:
            'https://p1.music.126.net/5zs7IvmLv7KahY3BFzUmrg==/109951163635241613.jpg?param=300y300',
          lrc: 'https://cdn.doniai.com/music/lrc/really-love.lrc'
        },
        {
          name: '布拉格广场',
          artist: '周杰伦',
          url: 'https://cdn.doniai.com/music/mp3/prague.mp3',
          cover:
            'https://p1.music.126.net/AUGVPQ_rVrngDH9ocQrn3Q==/109951163613037822.jpg?param=300y300',
          lrc: 'https://cdn.doniai.com/music/lrc/prague.lrc'
        },
        {
          name: '光辉岁月',
          artist: 'Beyond',
          url: 'https://cdn.doniai.com/music/mp3/old-young.mp3',
          cover:
            'https://p1.music.126.net/K0-IPcIQ9QFvA0jXTBqoWQ==/109951163636756693.jpg?param=300y300',
          lrc: 'https://cdn.doniai.com/music/lrc/old-young.lrc'
        }
      ]
    }
  },
  methods: {
    goTv() {
      this.$router.push({ path: '/player' })
    }
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
}
</style>
