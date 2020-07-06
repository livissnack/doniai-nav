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
        <Countdown />
      </div>
    </div>
    <div id="map-box"></div>
  </div>
</template>

<script>
import request from 'axios'
import LunarTime from '@/components/LunarTime.vue'
import Countdown from '@/components/Countdown.vue'
const gaodekey = '045d06aff28968d4ade448d96aef901b'

export default {
  name: 'Weather',
  components: {
    LunarTime,
    Countdown
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
      const weatherMap = new Map([
        ['晴', 'fa-sun'],
        ['少云', 'fa-sun'],
        ['晴间多云', 'fa-sun'],
        ['多云', 'fa-cloud-sun'],
        ['阴', 'fa-cloud'],
        ['有风', 'fa-sun'],
        ['平静', 'fa-sun'],
        ['微风', 'fa-sun'],
        ['和风', 'fa-sun'],
        ['清风', 'fa-sun'],
        ['强风/劲风', 'fa-sun'],
        ['疾风', 'fa-sun'],
        ['大风', 'fa-sun'],
        ['烈风', 'fa-sun'],
        ['风暴', 'fa-sun'],
        ['狂爆风', 'fa-sun'],
        ['飓风', 'fa-sun'],
        ['热带风暴', 'fa-sun'],
        ['阵雨', 'fa-sun'],
        ['雷阵雨', 'fa-sun'],
        ['雷阵雨并伴有冰雹', 'fa-sun'],
        ['小雨', 'cloud-showers-heavy'],
        ['中雨', 'fa-sun'],
        ['大雨', 'fa-sun'],
        ['暴雨', 'fa-sun'],
        ['大暴雨', 'fa-sun'],
        ['特大暴雨', 'fa-sun'],
        ['强阵雨', 'fa-sun'],
        ['强雷阵雨', 'fa-sun'],
        ['极端降雨', 'fa-sun'],
        ['毛毛雨/细雨', 'fa-sun'],
        ['雨', 'fa-sun'],
        ['小雨-中雨', 'fa-sun'],
        ['中雨-大雨', 'fa-sun'],
        ['大雨-暴雨', 'fa-sun'],
        ['暴雨-大暴雨', 'fa-sun'],
        ['大暴雨-特大暴雨', 'fa-sun'],
        ['雨雪天气', 'fa-sun'],
        ['雨夹雪', 'fa-sun'],
        ['阵雨夹雪', 'fa-sun'],
        ['冻雨', 'fa-sun'],
        ['雪', 'fa-sun'],
        ['冻雨', 'fa-sun'],
        ['阵雪', 'fa-sun'],
        ['小雪', 'fa-sun'],
        ['中雪', 'fa-sun'],
        ['大雪', 'fa-sun'],
        ['暴雪', 'fa-sun'],
        ['小雪-中雪', 'fa-sun'],
        ['中雪-大雪', 'fa-sun'],
        ['大雪-暴雪', 'fa-sun'],
        ['浮尘', 'fa-sun'],
        ['扬沙', 'fa-sun'],
        ['沙尘暴', 'fa-sun'],
        ['强沙尘暴', 'fa-sun'],
        ['龙卷风', 'fa-sun'],
        ['雾', 'fa-sun'],
        ['浓雾', 'fa-sun'],
        ['强浓雾', 'fa-sun'],
        ['轻雾', 'fa-sun'],
        ['大雾', 'fa-sun'],
        ['特强浓雾', 'fa-sun'],
        ['霾', 'fa-sun'],
        ['中度霾', 'fa-sun'],
        ['重度霾', 'fa-sun'],
        ['严重霾', 'fa-sun'],
        ['热', 'fa-sun'],
        ['冷', 'fa-sun'],
        ['未知', 'fa-sun']
      ])
      return weatherMap.get(this.weatherData.weather)
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
        type: 'is-danger',
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
