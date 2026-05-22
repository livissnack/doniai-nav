<template>
  <div class="util-box news-panel">
    <header class="util-title">
      <h3 class="panel-title">热门新闻</h3>
      <button type="button" class="json-link" @click="goJson">Json工具</button>
    </header>

    <div
      class="news-body"
      @mouseenter="pauseCarousel"
      @mouseleave="resumeCarousel"
    >
      <div v-if="loading" class="news-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>加载中…</span>
      </div>

      <div v-else-if="!list.length" class="news-state is-empty">
        <span>暂无新闻</span>
      </div>

      <template v-else>
        <div class="news-carousel" :style="{ height: carouselHeight + 'px' }">
          <div
            v-for="(group, slideIndex) in groupedNews"
            :key="slideIndex"
            class="news-slide"
            :class="{ 'is-active': slideIndex === currentIndex }"
          >
            <button
              v-for="(item, itemIndex) in group"
              :key="itemKey(item, slideIndex, itemIndex)"
              type="button"
              class="news-item"
              :title="item.name"
              @click="openLink(item)"
            >
              <span
                class="news-badge"
                :style="{ backgroundColor: sourceMeta(item.source).color }"
              >{{ sourceMeta(item.source).label }}</span>
              <span class="news-title">{{ item.name }}</span>
              <i class="fas fa-external-link-alt news-arrow"></i>
            </button>
          </div>
        </div>

        <div v-if="slideCount > 1" class="news-footer">
          <div class="news-dots" role="tablist" aria-label="新闻分页">
            <button
              v-for="(_, index) in groupedNews"
              :key="index"
              type="button"
              class="news-dot"
              :class="{ 'is-active': index === currentIndex }"
              :aria-label="`第 ${index + 1} 页`"
              :aria-selected="index === currentIndex"
              @click="goToSlide(index)"
            />
          </div>
          <div class="news-progress" aria-hidden="true">
            <span
              class="news-progress-bar"
              :style="{ width: progressWidth + '%' }"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { getHotNews } from '@/services/api'
import { readCache, writeCache } from '@/utils/apiCache'

const NEWS_CACHE_KEY = 'doniaiNavCacheNews'
const NEWS_CACHE_TTL = 5 * 60 * 1000

const ITEMS_PER_SLIDE = 5
const AUTO_PLAY_MS = 8000
const TICK_MS = 50

const SOURCE_META = {
  baidu: { label: '百', color: '#4e6ef2' },
  nodeseek: { label: 'N', color: '#15b982' },
  nikkei: { label: '日', color: '#d4380d' },
  news: { label: '热', color: '#8c8c8c' },
}

export default {
  name: 'News',
  data() {
    return {
      list: [],
      loading: true,
      currentIndex: 0,
      progressWidth: 0,
      timerId: null,
      progressId: null,
      paused: false,
      itemHeight: 34,
    }
  },
  computed: {
    groupedNews() {
      const groups = []
      for (let i = 0; i < this.list.length; i += ITEMS_PER_SLIDE) {
        groups.push(this.list.slice(i, i + ITEMS_PER_SLIDE))
      }
      return groups
    },
    slideCount() {
      return this.groupedNews.length
    },
    carouselHeight() {
      const count = this.groupedNews[this.currentIndex]?.length || ITEMS_PER_SLIDE
      return Math.max(count, 1) * this.itemHeight + 8
    },
  },
  watch: {
    slideCount(count) {
      if (this.currentIndex >= count) {
        this.currentIndex = 0
      }
      this.restartCarousel()
    },
  },
  created() {
    this.fetchNews()
  },
  mounted() {
    this.restartCarousel()
  },
  beforeDestroy() {
    this.clearTimers()
  },
  methods: {
    sourceMeta(source) {
      return SOURCE_META[source] || SOURCE_META.news
    },
    itemKey(item, slideIndex, itemIndex) {
      return `${item.source || 'news'}-${slideIndex}-${itemIndex}-${item.url || item.name}`
    },
    normalizeNewsList(payload) {
      if (!payload) return []

      const inner = payload.data !== undefined ? payload.data : payload

      if (Array.isArray(inner)) {
        return inner
          .filter(item => item && item.name && item.url)
          .map((item, index) => ({
            ...item,
            source: item.source || 'news',
            id: item.id != null ? item.id : index,
          }))
      }

      if (inner && typeof inner === 'object') {
        const merged = []
        const sources = [
          ['baidu', inner.baidu_list],
          ['nodeseek', inner.nodeseek_list],
          ['nikkei', inner.nikkei_list],
        ]

        sources.forEach(([source, items]) => {
          if (!Array.isArray(items)) return
          items.forEach((item, index) => {
            if (item && item.name && item.url) {
              merged.push({
                ...item,
                source,
                id: item.id != null ? item.id : `${source}-${index}`,
              })
            }
          })
        })

        if (merged.length) return merged
      }

      const legacySources = [
        ['baidu', payload.baidu_list],
        ['nodeseek', payload.nodeseek_list],
        ['nikkei', payload.nikkei_list],
      ]
      const legacy = []
      legacySources.forEach(([source, items]) => {
        if (!Array.isArray(items)) return
        items.forEach((item, index) => {
          if (item && item.name && item.url) {
            legacy.push({
              ...item,
              source,
              id: item.id != null ? item.id : `${source}-${index}`,
            })
          }
        })
      })
      return legacy
    },
    async fetchNews() {
      const cached = readCache(NEWS_CACHE_KEY, NEWS_CACHE_TTL)
      if (cached) {
        this.list = this.normalizeNewsList(cached)
        this.currentIndex = 0
        this.loading = false
      } else {
        this.loading = true
      }

      try {
        const { data } = await getHotNews()
        writeCache(NEWS_CACHE_KEY, data)
        this.list = this.normalizeNewsList(data)
        this.currentIndex = 0
      } catch (e) {
        console.error('News fetch failed:', e)
        if (!cached) this.list = []
      } finally {
        this.loading = false
      }
    },
    goJson() {
      this.$router.push({ path: '/json' })
    },
    openLink(item) {
      if (item && item.url) {
        this.$OPENLINK(item.url)
      }
    },
    goToSlide(index) {
      this.currentIndex = index
      this.resetProgress()
      this.restartCarousel()
    },
    nextSlide() {
      if (this.slideCount <= 1) return
      this.currentIndex = (this.currentIndex + 1) % this.slideCount
      this.resetProgress()
    },
    resetProgress() {
      this.progressWidth = 0
    },
    clearTimers() {
      if (this.timerId) {
        clearInterval(this.timerId)
        this.timerId = null
      }
      if (this.progressId) {
        clearInterval(this.progressId)
        this.progressId = null
      }
    },
    restartCarousel() {
      this.clearTimers()
      this.resetProgress()

      if (this.slideCount <= 1 || this.paused) return

      let elapsed = 0
      this.progressId = setInterval(() => {
        if (this.paused) return
        elapsed += TICK_MS
        this.progressWidth = Math.min((elapsed / AUTO_PLAY_MS) * 100, 100)
      }, TICK_MS)

      this.timerId = setInterval(() => {
        if (this.paused) return
        this.nextSlide()
      }, AUTO_PLAY_MS)
    },
    pauseCarousel() {
      this.paused = true
    },
    resumeCarousel() {
      this.paused = false
      if (!this.timerId) {
        this.restartCarousel()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.news-panel {
  background: #fff;
  padding: 10px;
}

.util-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 8px;
  margin: 0;
}

.panel-title {
  margin: 0;
  font-size: 1em;
  font-weight: 700;
  color: #363636;
}

.json-link {
  border: none;
  background: none;
  padding: 0;
  font-size: 1em;
  font-weight: 700;
  color: #363636;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    color: #f4645f;
  }
}

.news-body {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 120px;
  overflow: hidden;
}

.news-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 120px;
  color: #8c8c8c;
  font-size: 13px;

  &.is-empty {
    color: #bfbfbf;
  }
}

.news-carousel {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

.news-slide {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px);
  transition: opacity 0.35s ease, transform 0.35s ease, visibility 0.35s;
  pointer-events: none;

  &.is-active {
    position: relative;
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }
}

.news-item {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 34px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0 6px;
  margin: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f5f7fa;

    .news-title {
      color: #ff4500;
    }

    .news-arrow {
      opacity: 1;
    }
  }
}

.news-badge {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border-radius: 4px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
}

.news-title {
  flex: 1;
  min-width: 0;
  color: #666;
  font-size: 14px;
  font-weight: 400;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.news-arrow {
  flex-shrink: 0;
  margin-left: 6px;
  font-size: 10px;
  color: #bfbfbf;
  opacity: 0;
  transition: opacity 0.2s;
}

.news-footer {
  width: 100%;
  margin-top: 10px;
  padding: 0 4px;
  box-sizing: border-box;
}

.news-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
}

.news-dot {
  width: 6px;
  height: 6px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #d9d9d9;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;

  &.is-active {
    background: #15b982;
    transform: scale(1.25);
  }
}

.news-progress {
  height: 2px;
  background: #f0f0f0;
  border-radius: 1px;
  overflow: hidden;
}

.news-progress-bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #15b982, #36cfc9);
  border-radius: 1px;
  transition: width 0.05s linear;
}

@media screen and (max-width: 768px) {
  .news-title {
    font-size: 13px;
  }
}
</style>
