<template>

  <div class="lunar-time">

    <p class="lunar-time__date">{{ solarTimeComputed }}</p>

    <p class="lunar-time__clock">

      <strong>{{ upDownTextComputed }} {{ currentTime }}</strong>

    </p>

  </div>

</template>



<script>

import {

  timeNow,

  year,

  month,

  day,

  monningAndAfternoonText,

} from '@/utils/helper.js'



export default {

  name: 'LunarTime',

  data() {

    return {

      up_down_text: '',

      solar2lunarData: null,

      currentTime: timeNow(),

      timerId: null,

    }

  },

  computed: {

    upDownTextComputed() {

      const data = this.solar2lunarData

      if (!data) return ''

      return `${data.ncWeek}[${this.up_down_text}]`

    },

    solarTimeComputed() {

      const data = this.solar2lunarData

      if (!data) return ''

      return `${data.gzYear}年[${data.animal}年]-${data.monthCn}${data.dayCn}`

    },

  },

  async created() {

    this.up_down_text = monningAndAfternoonText()

    try {

      const solarLunar = (await import('solarlunar')).default

      this.solar2lunarData = solarLunar.solar2lunar(year(), month(), day())

    } catch (e) {

      console.warn('load solarlunar failed', e)

    }

  },

  mounted() {

    this.timerId = setInterval(() => {

      this.currentTime = timeNow()

    }, 1000)

  },

  beforeUnmount() {

    if (this.timerId) {

      clearInterval(this.timerId)

    }

  },

}

</script>



<style lang="less" scoped>

.lunar-time {

  padding-top: 10px;

  border-top: 1px dashed #e5e7eb;

  text-align: center;

}



.lunar-time__date {

  margin: 0 0 6px;

  font-size: 0.875rem;

  font-weight: 600;

  color: #4c9ae8;

  line-height: 1.4;

}



.lunar-time__clock {

  margin: 0;

  font-size: 0.8125rem;

  color: #6b7280;

  line-height: 1.4;

}

</style>


