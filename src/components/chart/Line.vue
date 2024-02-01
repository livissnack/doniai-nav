<template>
  <div class="radar-box" id="radar"></div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'ScoreRadar',
  props: {
    scoreList: {
      type: Array,
      default: []
    }
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
          data: ['语文', '数学', '思想', '体育', '美术', '道法']
        },
        yAxis: {},
        series: [
          {
            name: '分数',
            type: 'bar',
            label: {
              show: true,
              position: 'top'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2378f7' },
                  { offset: 0.7, color: '#2378f7' },
                  { offset: 1, color: '#83bff6' }
                ])
              }
            },
            data: this.scoreList
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
