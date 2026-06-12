<template>
  <p v-cloak class="countdown">
    <strong>{{ remainText }}</strong>
  </p>
</template>

<script>
export default {
  name: 'Countdown',
  data() {
    return {
      remark: '距离下班还剩：',
      type: 'up',
      remainTime: '18:00:00',
      timerId: null,
    }
  },
  computed: {
    remainText() {
      if (this.type === 'down') {
        return this.remark
      }
      return this.remark + this.remainTime
    },
  },
  mounted() {
    this.remainTime = this.getWorkEndTime()
    this.timerId = setInterval(() => {
      this.remainTime = this.getWorkEndTime()
    }, 1000)
  },
  beforeUnmount() {
    if (this.timerId) {
      clearInterval(this.timerId)
    }
  },
  methods: {
    getWorkEndTime() {
      const time = new Date()
      const startTime = Date.parse(time)
      const endTime = time.setHours(18, 0, 0, 0)

      if (startTime > endTime) {
        this.remark = '恭喜你已经下班了'
        this.type = 'down'
        return ''
      }

      this.type = 'up'
      this.remark = '距离下班还剩：'
      const diffTime = endTime - startTime
      let hours = Math.floor(diffTime / (3600 * 1000))
      let minutes = Math.floor((diffTime - hours * 3600 * 1000) / (60 * 1000))
      let seconds = Math.floor(
        (diffTime - hours * 3600 * 1000 - minutes * 60 * 1000) / 1000
      )
      hours = hours < 10 ? '0' + hours : hours
      minutes = minutes < 10 ? '0' + minutes : minutes
      seconds = seconds < 10 ? '0' + seconds : seconds

      return `${hours}:${minutes}:${seconds}`
    },
  },
}
</script>

<style lang="less" scoped>
.countdown {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  line-height: 1.3;
  max-width: 140px;
}
</style>
