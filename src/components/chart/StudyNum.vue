<template>
  <div class="line-box" id="line"></div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'StudyNum',
  props: {
    // 修改props，接收学生点名次数数据
    rollCallData: {
      type: Array,
      default: () => []
    }
  },
  mounted() {
    this.initPieChart()
    this._onResize = () => this.chart?.resize()
    window.addEventListener('resize', this._onResize)
  },
  watch: {
    rollCallData: {
      handler() {
        this.updateChart()
      },
      deep: true,
    },
  },
  methods: {
    initPieChart() {
      this.chart = echarts.init(this.$el)
      this.updateChart()
    },

    updateChart() {
      if (!this.chart) return

      this.chart.setOption({
        title: {
          text: '学生点名次数统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}次 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '点名次数',
            type: 'pie',
            radius: '50%',
            data: this.rollCallData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: '{b}: {c}次'
            }
          }
        ]
      })
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this._onResize)
    if (this.chart) {
      this.chart.dispose()
    }
  },
}
</script>

<style lang="less" scoped>
.line-box {
  width: 100%;
  height: 280px;
  min-height: 240px;
}
</style>
