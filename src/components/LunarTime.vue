<template>
  <div class="content">
    <div class="subtitle is-6 text-center">
      {{ solarTimeComputed }}
    </div>
    <strong class="subtitle is-7"
      >{{ upDownTextComputed }} {{ currentTime }}</strong
    >
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
    upDownTextComputed() {
      let solar2lunarData = this.solar2lunarData
      return `${solar2lunarData.ncWeek}[${this.up_down_text}]`
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
  font-weight: 600;
  color: #4c9ae8;
}
</style>
