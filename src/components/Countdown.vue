<template>
  <p v-cloak class="gx-countdown card-header-title">
    <strong>{{ remainText }}</strong>
  </p>
</template>

<script>
export default {
  name: 'Countdown',
  data() {
    return {
      remark: '距离下班还剩：',
      type: 'down',
      remainTime: '18:30:00'
    }
  },
  mounted() {
    setInterval(() => {
      this.remainTime = this.getWorkEndTime()
    }, 1000)
  },
  computed: {
    remainText() {
      let showText = ''
      if (this.type === 'down') {
        showText = this.remark
      }
      if (this.type === 'up') {
        showText = this.remark + this.remainTime
      }
      return showText
    }
  },
  methods: {
    getWorkEndTime() {
      const time = new Date()
      const startTime = Date.parse(time)
      const endTime = time.setHours(18, 30, 0, 0)

      if (startTime > endTime) {
        this.remark = '恭喜你已经下班了'
        this.type = 'down'
        return
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
    }
  }
}
</script>

<style lang="less" scoped>
.gx-countdown {
  justify-content: flex-end;
}
</style>
