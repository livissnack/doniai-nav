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
  computed: {
    text() {
      return this.textList[this.currentIndex];
    },
  },
  props: {
    textList: {
      type: Array,
      default: []
    },
  },
  data() {
    return {
      currentIndex: 0,
      duration: 4, // 滚动速度，单位为秒
      delay: 1, // 滚动间隔时间，单位为秒
      timer: null, //定时器
    }
  },
  mounted() {
    this.initMarquee()
  },
  destroyed() {
    this.destroyTimer()
  },
  methods: {
    initMarquee() {
      this.timer = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.textList.length
      }, (this.duration + this.delay) * 1000)
    },
    destroyTimer() {
      if (this.timer) {
        clearInterval(this.timer)
      }
    }
  }
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

.scroll {
  animation: scroll 5s linear infinite;
}

.marquee {
  height: 20px; // 设置跑马灯高度
  overflow: hidden; // 隐藏超出高度的部分
}

.content {
  display: inline-block; // 让文字在一行内显示
  animation: scroll linear infinite; // 应用滚动动画
  font-size: 12px;
}
</style>
