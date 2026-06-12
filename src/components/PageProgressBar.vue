<template>
  <Teleport to="body">
    <div
      class="page-progress"
      :class="{ 'is-visible': visible, 'is-done': done }"
      role="progressbar"
      :aria-valuenow="Math.round(percent)"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="页面加载进度"
    >
      <div class="page-progress-bar" :style="{ width: `${percent}%` }">
        <span class="page-progress-glow" aria-hidden="true"></span>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, watch } from 'vue'
import { usePageProgress } from '@/utils/pageProgress'

export default {
  name: 'PageProgressBar',
  setup() {
    const { visible, percent } = usePageProgress()
    const done = ref(false)

    watch(visible, (show) => {
      if (show) done.value = false
    })

    watch(percent, (value) => {
      if (value >= 100) {
        done.value = true
      }
    })

    return { visible, percent, done }
  },
}
</script>

<!-- 全局样式：scoped 类名在 PurgeCSS 生产构建中会被误删 -->
<style lang="less">
.page-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 10050;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;

  &.is-visible {
    opacity: 1;
  }

  &.is-done {
    opacity: 0;
    transition: opacity 0.35s ease 0.05s;
  }
}

.page-progress-bar {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, #1ea84e, #20bc56 45%, #2dd36f);
  box-shadow: 0 0 10px rgba(32, 188, 86, 0.55);
  transition: width 0.18s ease-out;
  transform: translateZ(0);
}

.page-progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 100%;
  transform: translateX(50%);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.55),
    rgba(255, 255, 255, 0)
  );
  animation: page-progress-shine 1s ease-in-out infinite;
}

@keyframes page-progress-shine {
  0% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.35;
  }
}
</style>
