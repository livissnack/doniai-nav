<template>
  <div class="radar-box" id="radar"></div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'ScoreRadar',
  data() {
    return {}
  },
  mounted() {
    this.initRadar()
  },
  methods: {
    initRadar() {
      let radar = echarts.init(document.getElementById('radar'))
      radar.setOption({
        tooltip: {},
        xAxis: {
          data: ['语文', '数学', '总分']
        },
        yAxis: {},
        series: [
          {
            name: '分数',
            type: 'bar',
            data: [95, 80, 175]
          }
        ]
      })
    }
  }
}
</script>

<style lang="less" scoped>
.radar-box {
  width: 400px;
  height: 300px;
}
</style>
