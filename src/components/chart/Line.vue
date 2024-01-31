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
          data: ['语文', '数学', '思想', '体育', '美术', '总分']
        },
        yAxis: {},
        series: [
          {
            name: '分数',
            type: 'bar',
            data: [95, 80, 56, 89, 25, 175]
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
