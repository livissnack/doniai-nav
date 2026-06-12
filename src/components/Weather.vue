<template>
  <div class="card sidebar-panel weather-card">
    <header class="card-header">
      <div class="card-header-title">
        <h3 class="weather-card__city">{{ city }}</h3>
      </div>
      <div class="card-header-icon">
        <Countdown />
      </div>
    </header>

    <div class="card-content weather-card__body">
      <SidebarPanelState
        v-if="loading"
        status="loading"
        message="天气加载中…"
        :retryable="false"
        compact
        :min-height="88"
      />

      <SidebarPanelState
        v-else-if="error"
        status="error"
        message="天气加载失败"
        compact
        :min-height="88"
        @retry="getWeather"
      />

      <SidebarPanelState
        v-else-if="!hasWeather"
        status="empty"
        message="暂无天气数据"
        :retryable="false"
        compact
        :min-height="88"
      />

      <template v-else>
      <div v-if="country" class="weather-card__region">{{ country }}</div>

      <div class="weather-card__main">
        <div class="weather-card__visual">
          <img
            v-if="weatherIcon && !iconBroken"
            class="weather-card__icon"
            :src="weatherIcon"
            alt="weather"
            @error="iconBroken = true"
          />
          <div v-else class="weather-card__icon-placeholder">
            <AppIcon name="cloud-sun"  />
          </div>
          <p class="weather-card__desc">{{ description }}</p>
        </div>
        <ul class="weather-card__stats">
          <li v-if="temperatureText">{{ temperatureText }}</li>
          <li v-if="humidity">{{ humidity }}</li>
          <li v-if="windpower">{{ windpower }}</li>
        </ul>
      </div>
      </template>

      <LunarTime />
    </div>
  </div>
</template>

<script>
import LunarTime from '@/components/LunarTime.vue'
import Countdown from '@/components/Countdown.vue'
import SidebarPanelState from '@/components/SidebarPanelState.vue'
import { getWeather } from '@/services/api'
import { readCache, writeCache } from '@/utils/apiCache'

const WEATHER_CACHE_KEY = 'doniaiNavCacheWeather'
const WEATHER_CACHE_TTL = 10 * 60 * 1000

export default {
  name: 'Weather',
  components: {
    LunarTime,
    Countdown,
    SidebarPanelState,
  },
  data() {
    return {
      weatherData: {
        weather: {},
        location: { country: '' },
      },
      iconBroken: false,
      loading: true,
      error: false,
    }
  },
  computed: {
    city() {
      return this.weatherData.name || '江夏区'
    },
    weatherIcon() {
      const code = this.weatherData.weather?.condition_code
      if (!code) return ''
      try {
        return new URL(`../assets/weather/${code}@2x.png`, import.meta.url).href
      } catch {
        return ''
      }
    },
    temperature() {
      return this.weatherData.weather?.temperature
    },
    hasWeather() {
      return this.temperature > 0 || this.description
    },
    temperatureText() {
      if (!this.temperature) return ''
      return `温度：${this.temperature}℃`
    },
    windpower() {
      const w = this.weatherData.weather?.wind_power
      return w != null ? `风速：${w}级` : ''
    },
    humidity() {
      const h = this.weatherData.weather?.humidity
      return h != null ? `湿度：${h}%` : ''
    },
    description() {
      const wx = this.weatherData.weather
      if (!wx) return ''
      return `${wx.wind_direction || ''} - ${wx.condition || ''}`
    },
    country() {
      return this.weatherData.location?.city || ''
    },
  },
  async created() {
    await this.getWeather()
  },
  methods: {
    hasValidWeather(data) {
      const wx = data?.weather
      return !!(wx && (wx.temperature > 0 || wx.condition || wx.wind_direction))
    },
    async getWeather() {
      const cached = readCache(WEATHER_CACHE_KEY, WEATHER_CACHE_TTL)

      if (cached?.data && this.hasValidWeather(cached.data)) {
        this.weatherData = cached.data
        this.loading = false
        this.error = false
        return
      }

      this.loading = true
      this.error = false

      try {
        const { data } = await getWeather({ query: this.city })
        writeCache(WEATHER_CACHE_KEY, data)
        if (data?.data) {
          this.weatherData = data.data
          this.iconBroken = false
        }
        this.error = false
      } catch (e) {
        console.warn('weather fetch failed', e)
        if (!this.hasValidWeather(this.weatherData)) {
          this.error = true
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.weather-card {
  border: 1px solid #e8e8e8;
  border-radius: 0 !important;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  width: 100%;
  background: #fff;

  :deep(.card-header) {
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    align-items: center;
  }

  :deep(.card-header-title) {
    font-weight: 700;
    color: #363636;
  }

  :deep(.card-header-icon) {
    display: flex;
    align-items: center;
  }
}
.weather-card__city {
  margin: 0;
  font-size: 1em;
  font-weight: 700;
  color: #363636;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weather-card :deep(.weather-card__body) {
  padding-top: 14px;
}

.weather-card__region {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #363636;
  margin-bottom: 12px;
}

.weather-card__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.weather-card__visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.weather-card__icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.weather-card__icon-placeholder {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #60a5fa;
}

.weather-card__desc {
  margin: 6px 0 0;
  font-size: 12px;
  color: #d33d3d;
  text-align: center;
  line-height: 1.4;
}

.weather-card__stats {
  list-style: none;
  margin: 0;
  padding: 0;
  flex-shrink: 0;

  li {
    font-size: 0.875rem;
    color: #4b5563;
    line-height: 1.6;
    white-space: nowrap;
  }
}
</style>
