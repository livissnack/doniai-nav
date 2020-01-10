<template>
  <div class="content">
    <div class="subtitle is-5 text-center">
      {{ solarTimeComputed }}
    </div>
    <strong>{{ up_down_text }} {{ currentTime }}</strong>
    <br />
    <em>{{ solarComputed }}</em>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import solarLunar from 'solarlunar'

export default {
  name: 'LunarTime',
  data() {
    return {
      up_down_text: '',
      solar2lunarData: '',
      currentTime: dayjs().format('hh:mm:ss')
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
  mounted() {
    setInterval(() => {
      this.currentTime = dayjs().format('hh:mm:ss')
    }, 1000)
  },
  created() {
    this.getWeekday()
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
    }
  }
}
</script>

<style lang="less" scoped>
.text-center {
  text-align: center;
  font-weight: 800;
  color: #f4645f;
}
</style>
