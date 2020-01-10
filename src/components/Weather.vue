<template>
  <div class="weather-box">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          {{ city === undefined ? '福田区' : city }}
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
            <p class="title is-5">
              {{ humidity }}
            </p>
            <p class="subtitle is-6">{{ wind }} {{ windpower }}</p>
          </div>
        </div>

        <LunarTime />
      </div>
    </div>
    <div id="map-box"></div>
  </div>
</template>

<script>
import request from 'axios'
import LunarTime from '@/components/LunarTime.vue'
const gaodekey = '045d06aff28968d4ade448d96aef901b'

export default {
  name: 'Weather',
  components: {
    LunarTime
  },
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
    }
  },
  filters: {
    celsius: function(value) {
      if (!value) return ''
      return value + '℃'
    }
  },
  created() {
    this.getLocalInfo()
  },
  methods: {
    async getLocation(location_str) {
      const { data } = await request(
        `https://restapi.amap.com/v3/geocode/regeo?key=${gaodekey}&location=${location_str}`
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
      if (data.info.toUpperCase() === 'OK') {
        return data.lives[0]
      } else {
        return {}
      }
    },
    async getLocalInfo() {
      // eslint-disable-next-line no-undef
      let map = new AMap.Map('map-box')
      await map.plugin('AMap.Geolocation', () => {
        // eslint-disable-next-line no-undef
        let geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, //是否使用高精度定位，默认:true
          timeout: 10000,
          GeoLocationFirst: false,
          maximumAge: 0 //定位结果缓存0毫秒，默认：0
        })
        map.addControl(geolocation)
        geolocation.getCurrentPosition((status, result) => {
          if (status == 'complete') {
            this.onComplete(result)
          } else {
            this.onError(result)
          }
        })
      })
    },
    async onComplete(data) {
      if (data.info === 'SUCCESS') {
        const location_str = `${data.position.lng},${data.position.lat}`
        const local_data = location_str ? location_str : '114.02265,22.53764'
        await this.getLocation(local_data)
      }
    },
    onError() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: '高德定位失败',
        type: 'is-success',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
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
</style>
