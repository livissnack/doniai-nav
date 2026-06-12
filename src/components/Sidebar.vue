<template>
  <div class="sidebar">
    <div v-if="showNews && panelReady.news" class="section-box">
      <AsyncNews />
    </div>
    <div v-if="showTools && panelReady.tools" class="section-box">
      <AsyncTools />
    </div>
    <div v-if="showMusic && panelReady.music" class="section-box">
      <AsyncMusic />
    </div>
    <div v-if="showWeather && panelReady.weather" class="section-box">
      <AsyncWeather />
    </div>
    <div v-if="showTodo && panelReady.todo" class="section-box task-todo">
      <AsyncTodo />
    </div>
    <div v-if="showPrice && panelReady.price" class="section-box task-todo">
      <AsyncPrice />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { authStore, isPanelVisible } from '@/store/auth'

const PANEL_SCHEDULE = [
  { id: 'news', delay: 0 },
  { id: 'tools', delay: 100 },
  { id: 'music', delay: 900 },
  { id: 'weather', delay: 1200 },
  { id: 'todo', delay: 700 },
  { id: 'price', delay: 1600 },
]

export default {
  name: 'Sidebar',
  components: {
    AsyncNews: defineAsyncComponent(() => import('@/components/News.vue')),
    AsyncTools: defineAsyncComponent(() => import('@/components/tools/index.vue')),
    AsyncMusic: defineAsyncComponent(() => import('@/components/Music.vue')),
    AsyncWeather: defineAsyncComponent(() => import('@/components/Weather.vue')),
    AsyncTodo: defineAsyncComponent(() => import('@/components/Todo.vue')),
    AsyncPrice: defineAsyncComponent(() => import('@/components/PricePanel.vue')),
  },
  data() {
    return {
      panelReady: {
        news: false,
        tools: false,
        music: false,
        weather: false,
        todo: false,
        price: false,
      },
    }
  },
  computed: {
    panelState() {
      return authStore.sidebarPanels
    },
    showNews() {
      return isPanelVisible('news')
    },
    showTools() {
      return isPanelVisible('tools')
    },
    showMusic() {
      return isPanelVisible('music')
    },
    showWeather() {
      return isPanelVisible('weather')
    },
    showTodo() {
      return isPanelVisible('todo')
    },
    showPrice() {
      return isPanelVisible('price')
    },
  },
  watch: {
    panelState: {
      deep: true,
      handler() {
        this.ensureVisiblePanels()
      },
    },
  },
  mounted() {
    this.schedulePanels()
  },
  methods: {
    ensureVisiblePanels() {
      for (const { id } of PANEL_SCHEDULE) {
        const visibleKey = `show${id.charAt(0).toUpperCase()}${id.slice(1)}`
        if (this[visibleKey]) {
          this.panelReady[id] = true
        }
      }
    },
    schedulePanels() {
      const timers = []
      for (const { id, delay } of PANEL_SCHEDULE) {
        const visibleKey = `show${id.charAt(0).toUpperCase()}${id.slice(1)}`
        if (!this[visibleKey]) continue
        timers.push(
          setTimeout(() => {
            this.panelReady[id] = true
          }, delay)
        )
      }
      this._panelTimers = timers
    },
  },
  beforeUnmount() {
    this._panelTimers?.forEach(clearTimeout)
  },
}
</script>

<style lang="less" scoped>
.sidebar {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.section-box {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-bottom: 20px;
  box-sizing: border-box;

  :deep(.sidebar-panel),
  :deep(.util-box),
  :deep(.news-panel),
  :deep(.music-box),
  :deep(.tools-panel),
  :deep(.todo-panel) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  :deep(.util-box),
  :deep(.news-panel),
  :deep(.music-box),
  :deep(.tools-panel) {
    overflow: hidden;
  }

  :deep(.todo-panel),
  :deep(.tools-panel),
  :deep(.info-card) {
    border-radius: 0 !important;
  }

  :deep(.todo-panel) {
    overflow: visible;
  }

  &.task-todo {
    overflow: visible;
  }

  :deep(.sidebar-panel) {
    overflow: visible;
  }

  :deep(.music-player),
  :deep(.aplayer),
  :deep(.news-body),
  :deep(.news-carousel),
  :deep(.news-footer) {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0;
  }
}

@media screen and (max-width: 768px) {
  .section-box {
    margin-bottom: 16px;

    :deep(.sidebar-panel),
    :deep(.util-box),
    :deep(.news-panel),
    :deep(.music-box),
    :deep(.todo-panel),
    :deep(.tools-panel),
    :deep(.info-card) {
      border-radius: 0 !important;
    }
  }
}
</style>
