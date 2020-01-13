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
import {
  timeNow,
  year,
  month,
  day,
  monningAndAfternoonText
} from '@/utils/helper.js'
import solarLunar from 'solarlunar'

export default {
  name: 'LunarTime',
  data() {
    return {
      up_down_text: '',
      solar2lunarData: '',
      currentTime: timeNow()
    }
  },
  computed: {
    solarComputed() {
      let solar2lunarData = this.solar2lunarData
      return `${solar2lunarData.cYear}年${solar2lunarData.cMonth}月${solar2lunarData.cDay}日 ${solar2lunarData.ncWeek}`
    },
    solarTimeComputed() {
      let solar2lunarData = this.solar2lunarData
      return `${solar2lunarData.gzYear}年[${solar2lunarData.animal}年]-${solar2lunarData.monthCn}${solar2lunarData.dayCn}`
    }
  },
  mounted() {
    setInterval(() => {
      this.currentTime = timeNow()
    }, 1000)
  },
  created() {
    this.getWeekday()
  },
  methods: {
    getWeekday() {
      this.up_down_text = monningAndAfternoonText()
      this.solar2lunarData = solarLunar.solar2lunar(year(), month(), day())
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
