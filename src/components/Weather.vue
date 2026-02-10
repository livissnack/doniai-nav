<template>
  <div class="weather-box">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          {{ city === undefined ? '江夏区' : city }}
        </p>
        <Countdown />
      </header>
      <div class="card-content">
        <div class="h3-box" v-if="country">
          <div class="title">{{ country }}</div>
        </div>
        <div class="media" v-if="temperature > 0">
          <div class="media-left">
            <div class="media-content">
              <p class="title is-2">
                <img class="weather-icon" :src="weatherIcon" alt="weather_icon">
                <span class="description">{{ description }}</span>
              </p>
            </div>
          </div>
          <div class="media-content">
            <p class="subtitle is-6">{{ temperature | celsius }}</p>
            <p class="subtitle is-6">{{ humidity }}</p>
            <p class="subtitle is-6">{{ windpower }}</p>
          </div>
        </div>

        <LunarTime />
      </div>
    </div>
    <div id="map-box"></div>
  </div>
</template>

<script>
import LunarTime from '@/components/LunarTime.vue'
import Countdown from '@/components/Countdown.vue'
import {getWeather} from "@/services/api";

export default {
  name: 'Weather',
  components: {
    LunarTime,
    Countdown
  },
  data() {
    return {
      weatherData: {
        weather: {},
        location: { country: '' },
      },
      up_down_text: '',
      solar2lunarData: '',
      currentTime: '',
      latitude: null,
      longitude: null,
    }
  },
  computed: {
    city() {
      if (!this.weatherData.name) {
        return '江夏区'
      }
      return `${this.weatherData.name}`
    },
    weatherIcon() {
      if (this.weatherData.weather) {
        const currentHour = new Date().getHours();
        const timeSuffix = currentHour >= 6 && currentHour < 18 ? '' : '';
        let icon = this.weatherData.weather.condition_code + timeSuffix;
        return require(`../assets/weather/${icon}@2x.png`);
      }
    },
    temperature() {
      return this.weatherData.weather.temperature
    },
    windpower() {
      return '风速：' + this.weatherData.weather.wind_power + '级'
    },
    humidity() {
      return '湿度：' + this.weatherData.weather.humidity + '%'
    },
    description() {
      return `${this.weatherData.weather.wind_direction} - ${this.weatherData.weather.condition}`
    },
    country() {
      return this.weatherData.location.city || ''
    }
  },
  filters: {
    celsius: function(value) {
      if (!value) return ''
      return '温度：' + value + '℃'
    }
  },
  async created() {
    await this.getWeather()
  },
  methods: {
    async getWeather() {
      const { data } = await getWeather({ query: this.city })
      this.weatherData = data.data
    },
    getErrMsg(code) {
      switch (code) {
        case 1:
          return '定位失败，用户拒绝请求地理定位'
        case 2:
          return '定位失败，位置信息是不可用'
        case 3:
          return '定位失败，请求获取用户位置超时'
        default:
          return '定位失败'
      }
    },
  }
}
</script>

<style lang="less" scoped>
.weather-box {
  .card {
    box-shadow: 0 2px 3px #ffffff, 0 0 0 1px #ffffff;
    .card-header {
      .card-header-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .card-content {
      .h3-box {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
        .title {
          font-size: 24px;

        }
      }
      .media {
        .media-left {
          margin-left: 3rem;
          .media-content {
            margin-top: -1rem;
          }
        }
        .media-content {
          .subtitle {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}


.weather-icon {
  display: block;
  width: 60px;
  height: 60px;
}
.description {
  display: block;
  font-size: 12px;
  color: #D33D3D;
}

</style>
