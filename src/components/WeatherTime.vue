<template>
  <div class="weather-box">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          {{ city }}
        </p>
      </header>
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <div class="media-content">
              <p class="title is-2"><i class="fas" :class="weatherIcon"></i></p>
              <p class="subtitle is-5">{{ temperature | celsius }}</p>
            </div>
          </div>
          <div class="media-content">
            <p class="title is-5">{{ humidity }}</p>
            <p class="subtitle is-6">{{ wind }} {{ windpower }}</p>
          </div>
        </div>

        <div class="content">
          <div class="subtitle is-5 text-center">
            {{ solarTimeComputed }}
          </div>
          <strong>{{ up_down_text }} {{ currentTime }}</strong>
          <br />
          <em>{{ solarComputed }}</em>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import solarLunar from 'solarlunar'
import request from 'axios'
const gaodekey = '045d06aff28968d4ade448d96aef901b'
const location_data = `114.02265,22.53764`

export default {
  name: 'WeatherTime',
  data() {
    return {
      weatherData: {},
      up_down_text: '',
      solar2lunarData: '',
      currentTime: ''
    }
  },
  computed: {
    city() {
      return this.weatherData.city
    },
    weatherIcon() {
      const map = new Map([
        ['多云', 'fa-cloud-sun'],
        ['晴', 'fa-sun'],
        ['阴', 'fa-cloud'],
        ['小雨', 'cloud-showers-heavy']
      ])
      return map.get(this.weatherData.weather)
    },
    temperature() {
      return this.weatherData.temperature
    },
    wind() {
      return this.weatherData.winddirection + '风'
    },
    windpower() {
      return this.weatherData.windpower + '级'
    },
    humidity() {
      return '湿度：' + this.weatherData.humidity + '%'
    },
    solarComputed() {
      let solar2lunarData = this.solar2lunarData
      return `${solar2lunarData.cYear}年${solar2lunarData.cMonth}月${solar2lunarData.cDay}日 ${solar2lunarData.ncWeek}`
    },
    solarTimeComputed() {
      let solar2lunarData = this.solar2lunarData
      return `${solar2lunarData.animal}-${solar2lunarData.gzYear}年-${solar2lunarData.monthCn}${solar2lunarData.dayCn}`
    }
  },
  filters: {
    celsius: function(value) {
      if (!value) return ''
      return `${value}℃`
    }
  },
  mounted() {
    setInterval(() => {
      this.currentTime = dayjs().format('hh:mm:ss')
    }, 1000)
  },
  created() {
    this.getWeekday()
    this.getLocation()
  },
  methods: {
    getWeekday() {
      const datetime = new Date()
      const year = datetime.getFullYear()
      const month = datetime.getMonth() + 1
      const date = datetime.getDate()
      const hour = datetime.getHours()
      this.up_down_text = hour > 12 ? '下午' : '上午'
      this.solar2lunarData = solarLunar.solar2lunar(year, month, date)
    },
    async getLocation() {
      const { data } = await request(
        `https://restapi.amap.com/v3/geocode/regeo?key=${gaodekey}&location=${location_data}`
      )
      if (
        data.info === 'OK' &&
        data.regeocode.addressComponent.adcode !== null
      ) {
        this.weatherData = await this.getWeather(
          data.regeocode.addressComponent.adcode
        )
      }
    },
    async getWeather(adcode) {
      const { data } = await request(
        `https://restapi.amap.com/v3/weather/weatherInfo?key=${gaodekey}&city=${adcode}&extensions=base`
      )
      return data.info === 'OK' ? data.lives[0] : []
    }
  }
}
</script>

<style lang="less" scoped>
.weather-box {
  .card {
    box-shadow: 0 2px 3px #ffffff, 0 0 0 1px #ffffff;
  }
}

.text-center {
  text-align: center;
  font-weight: 800;
  color: #f4645f;
}
</style>
