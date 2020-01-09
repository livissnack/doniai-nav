<template>
  <div class="weather-box">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          shenzhen
        </p>
      </header>
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <div class="media-content">
              <p class="title is-2"><i class="fas fa-sun"></i></p>
              <p class="subtitle is-5">25℃</p>
            </div>
          </div>
          <div class="media-content">
            <p class="title is-5">23℃~29℃</p>
            <p class="subtitle is-6">北风 3级</p>
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
export default {
  name: 'WeatherTime',
  data() {
    return {
      up_down_text: '',
      solar2lunarData: '',
      currentTime: ''
    }
  },
  computed: {
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
    Celsius: function(value) {
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
    navigator.geolocation.getCurrentPosition(this.showPosition)
  },
  methods: {
    getWeekday() {
      const datetime = new Date()
      const year = datetime.getFullYear()
      const month = datetime.getMonth() + 1
      const date = datetime.getDate()
      const hour = datetime.getHours()
      this.up_down_text = hour > 12 ? '上午' : '下午'
      this.solar2lunarData = solarLunar.solar2lunar(year, month, date)
    },
    showPosition(position) {
      console.log(position)
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
