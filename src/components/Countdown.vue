<template>
  <strong class="subtitle is-7">距离下班还剩：{{ currentTime }}</strong>
</template>

<script>
import { timeNow } from '@/utils/helper.js'

export default {
  name: 'Countdown',
  data() {
    return {
      currentTime: timeNow()
    }
  },
  mounted() {
    setInterval(() => {
      this.currentTime = timeNow()
    }, 1000)
  },
  methods: {}
}
</script>
