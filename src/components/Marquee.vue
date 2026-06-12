<template>
  <div class="marquee">
    <div class="content" :style="{ animationDuration: duration + 's', animationDelay: delay + 's' }">
      {{ text }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Marquee',
  props: {
    textList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      currentIndex: 0,
      duration: 4,
      delay: 1,
      timer: null,
    }
  },
  computed: {
    text() {
      if (!this.textList.length) return ''
      return this.textList[this.currentIndex]
    },
  },
  mounted() {
    this.initMarquee()
  },
  unmounted() {
    this.destroyTimer()
  },
  methods: {
    initMarquee() {
      if (!this.textList.length) return
      this.timer = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.textList.length
      }, (this.duration + this.delay) * 1000)
    },
    destroyTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
  },
}
</script>

<style lang="less" scoped>
@keyframes scroll {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-100%);
  }
}

.marquee {
  height: 20px;
  overflow: hidden;
}

.content {
  display: inline-block;
  animation: scroll linear infinite;
  font-size: 12px;
}
</style>
