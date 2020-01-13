<template>
  <div>
    <progress
      class="is-link custom-progress progress is-small"
      :value="process_width"
      max="100"
    ></progress>
  </div>
</template>

<script>
export default {
  name: 'ProcessBar',
  data() {
    return {
      process_width: 0
    }
  },
  created() {
    this.handleLoadProcess()
  },
  methods: {
    handleLoadProcess() {
      let process_width = 0
      let t = setInterval(() => {
        process_width++
        this.process_width = process_width
        if (process_width === 100) {
          clearInterval(t)
        }
      }, 6)
    }
  }
}
</script>

<style lang="less" scoped>
.custom-progress {
  margin-bottom: 0;
  height: 0.25rem;
}
</style>
