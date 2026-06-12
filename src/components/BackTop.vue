<template>
  <transition name="fade">
    <button
      v-show="visible"
      type="button"
      class="back-top"
      :style="btnStyle"
      aria-label="回到顶部"
      @click="scrollTop"
    >
      <AppIcon name="arrow-up"  />
    </button>
  </transition>
</template>

<script>
export default {
  name: 'BackTop',
  props: {
    color: { type: String, default: '#409EFF' },
    size: { type: Number, default: 1 },
    slow: { type: Number, default: 10 },
    visibilityHeight: { type: Number, default: 300 },
  },
  data() {
    return { visible: false }
  },
  computed: {
    btnStyle() {
      const px = 40 * this.size
      return {
        width: `${px}px`,
        height: `${px}px`,
        backgroundColor: this.color,
        fontSize: `${14 * this.size}px`,
      }
    },
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.onScroll()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll() {
      this.visible = window.scrollY > this.visibilityHeight
    },
    scrollTop() {
      const step = Math.max(1, this.slow)
      const timer = setInterval(() => {
        const top = window.scrollY
        if (top <= 0) {
          clearInterval(timer)
          return
        }
        window.scrollTo(0, Math.max(0, top - step * 8))
      }, 16)
    },
  },
}
</script>

<style scoped>
.back-top {
  position: fixed;
  right: 24px;
  bottom: 48px;
  z-index: 1000;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
