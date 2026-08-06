<template>
  <section
    class="weather-map"
    :class="{ 'is-fullscreen': isFullscreen }"
    aria-label="天气地图"
  >
    <div class="weather-map__chrome">
      <div class="weather-map__tabs" role="tablist" aria-label="地图图层">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="weather-map__tab"
          :class="[
            `weather-map__tab--${tab.id}`,
            { active: activeLayer === tab.id },
          ]"
          :aria-selected="activeLayer === tab.id"
          @click="activeLayer = tab.id"
        >
          <span class="weather-map__tab-dot" aria-hidden="true" />
          <span class="weather-map__tab-label">{{ tab.label }}</span>
        </button>
      </div>
      <button
        type="button"
        class="weather-map__expand"
        :aria-label="isFullscreen ? '退出全屏' : '全屏查看'"
        :title="isFullscreen ? '退出全屏' : '全屏查看'"
        @click="toggleFullscreen"
      >
        <AppIcon :name="isFullscreen ? 'compress-alt' : 'expand'" />
      </button>
    </div>

    <div class="weather-map__frame">
      <iframe
        :key="iframeSrc"
        class="weather-map__iframe"
        :src="iframeSrc"
        title="Ventusky 天气地图"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
      />
    </div>
  </section>
</template>

<script>
/** Ventusky embed 图层 ID（简写会回退到温度） */
const TABS = [
  { id: 'temperature', label: '温度', layer: 'temperature-2m' },
  { id: 'wind', label: '风', layer: 'wind-10m' },
  { id: 'rain', label: '降水', layer: 'rain-1h' },
  { id: 'clouds', label: '云', layer: 'clouds-total' },
]

export default {
  name: 'WeatherMap',
  props: {
    lat: { type: Number, default: 30.28 },
    lon: { type: Number, default: 114.32 },
    zoom: { type: Number, default: 7 },
  },
  data() {
    return {
      tabs: TABS,
      activeLayer: 'temperature',
      isFullscreen: false,
    }
  },
  computed: {
    ventuskyLayer() {
      const tab = this.tabs.find((t) => t.id === this.activeLayer)
      return tab?.layer || 'temperature-2m'
    },
    iframeSrc() {
      const p = encodeURIComponent(`${this.lat};${this.lon};${this.zoom}`)
      return `https://embed.ventusky.com/?p=${p}&l=${this.ventuskyLayer}`
    },
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown)
    this.unlockBody()
  },
  methods: {
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
      if (this.isFullscreen) this.lockBody()
      else this.unlockBody()
    },
    onKeydown(e) {
      if (e.key === 'Escape' && this.isFullscreen) {
        this.isFullscreen = false
        this.unlockBody()
      }
    },
    lockBody() {
      document.documentElement.style.overflow = 'hidden'
    },
    unlockBody() {
      document.documentElement.style.overflow = ''
    },
  },
}
</script>

<style lang="less" scoped>
.weather-map {
  --wm-accent: #2563eb;
  position: relative;
  display: flex;
  flex-direction: column;
  /* 撑满卡片内容区，左右顶破 padding */
  width: calc(100% + 3rem);
  margin: 12px -1.5rem 0;
  height: min(62vh, 420px);
  background: #0b1220;
  overflow: hidden;
}

.weather-map.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 10050;
  width: 100%;
  height: 100%;
  margin: 0;
}

.weather-map__chrome {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 10px 28px;
  background: linear-gradient(
    180deg,
    rgba(8, 15, 30, 0.82) 0%,
    rgba(8, 15, 30, 0.45) 55%,
    rgba(8, 15, 30, 0) 100%
  );
  pointer-events: none;
}

.weather-map__tabs,
.weather-map__expand {
  pointer-events: auto;
}

.weather-map__tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  flex: 1;
  min-width: 0;
  gap: 2px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}

.weather-map__tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  height: 32px;
  padding: 0 6px;
  border: 0;
  background: transparent;
  color: rgba(226, 232, 240, 0.78);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.06);
  }

  &.active {
    color: #fff;
    background: var(--wm-accent);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  }
}

.weather-map__tab--temperature.active {
  --wm-accent: #f59e0b;
}
.weather-map__tab--wind.active {
  --wm-accent: #0ea5e9;
}
.weather-map__tab--rain.active {
  --wm-accent: #3b82f6;
}
.weather-map__tab--clouds.active {
  --wm-accent: #94a3b8;
}

.weather-map__tab-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.55;
  flex-shrink: 0;
}

.weather-map__tab.active .weather-map__tab-dot {
  opacity: 1;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
}

.weather-map__tab-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weather-map__expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;

  &:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.28);
    background: rgba(37, 99, 235, 0.85);
  }
}

.weather-map__frame {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  background: #0b1220;
}

.weather-map__iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 420px) {
  .weather-map__tab-dot {
    display: none;
  }

  .weather-map__tab {
    font-size: 11px;
    height: 30px;
  }
}
</style>
