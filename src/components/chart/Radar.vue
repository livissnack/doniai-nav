<template>
  <div class="line-box" id="line"></div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'ScoreLine',
  data() {
    return {}
  },
  mounted() {
    this.initRadar()
  },
  methods: {
    initRadar() {
      let radar = echarts.init(document.getElementById('line'))
      radar.setOption({
        legend: {
          left: 'center',
          data: ['分数']
        },
        tooltip: {},
        radar: {
          indicator: [
            { name: '语文', max: 100 },
            { name: '数学', max: 100 },
            { name: '总分', max: 500 },
            { name: '体育', max: 100 },
            { name: '美术', max: 100 },
            { name: '思想', max: 100 }
          ],
          radius: 120,
          axisName: {
            color: '#fff',
            backgroundColor: '#666',
            borderRadius: 3,
            padding: [3, 5]
          }
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: [95, 86, 187, 100, 100, 100],
                name: '分数',
                label: {
                  show: true,
                  formatter: function (params) {
                    return params.value;
                  }
                }
              },
            ],
          }
        ]
      })
    }
  }
}
</script>

<style lang="less" scoped>
.line-box {
  width: 400px;
  height: 400px;
}
</style>
