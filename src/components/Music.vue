<template>
  <div class="music-box">
    <div class="music-title">
      <h3>音乐播放器</h3>
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
          name: '东西',
          artist: '纳豆',
          url: 'https://cdn.moefe.org/music/mp3/thing.mp3',
          cover:
            'https://p1.music.126.net/5zs7IvmLv7KahY3BFzUmrg==/109951163635241613.jpg?param=300y300',
          lrc: 'https://cdn.moefe.org/music/lrc/thing.lrc'
        },
        {
          name: '响喜乱舞',
          artist: '泠鸢yousa',
          url: 'https://cdn.moefe.org/music/mp3/kyoukiranbu.mp3',
          cover:
            'https://p1.music.126.net/AUGVPQ_rVrngDH9ocQrn3Q==/109951163613037822.jpg?param=300y300',
          lrc: 'https://cdn.moefe.org/music/lrc/kyoukiranbu.lrc'
        },
        {
          name: '啵唧',
          artist: 'Hanser',
          url: 'https://cdn.moefe.org/music/mp3/kiss.mp3',
          cover:
            'https://p1.music.126.net/K0-IPcIQ9QFvA0jXTBqoWQ==/109951163636756693.jpg?param=300y300',
          lrc: 'https://cdn.moefe.org/music/lrc/kiss.lrc'
        }
      ]
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.music-box {
  background: #ffffff;
  padding: 10px 10px 10px 10px;
  .music-title {
    h3 {
      font-size: 1em;
      font-weight: 700;
      color: #363636;
    }
  }
}
</style>
