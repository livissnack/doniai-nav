<template>
  <div class="line-box" ref="chartRef"></div>
</template>

<script>
import * as echarts from 'echarts'

const DEFAULT_SUBJECTS = ['语文', '数学', '思想', '体育', '美术', '道法']

export default {
  name: 'ScoreLine',
  props: {
    scoreList: {
      type: Array,
      default: () => [],
    },
    subjectNames: {
      type: Array,
      default: () => DEFAULT_SUBJECTS,
    },
  },
  data() {
    return {
      chart: null,
    }
  },
  watch: {
    scoreList: {
      handler() {
        this.updateChart()
      },
      deep: true,
    },
    subjectNames: {
      handler() {
        this.updateChart()
      },
      deep: true,
    },
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chartRef)
    this.updateChart()
    this._onResize = () => this.chart?.resize()
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this._onResize)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    updateChart() {
      if (!this.chart) return
      const subjects = this.subjectNames.length ? this.subjectNames : DEFAULT_SUBJECTS
      this.chart.setOption({
        tooltip: {},
        grid: { left: 40, right: 20, top: 30, bottom: 30 },
        xAxis: { data: subjects },
        yAxis: { max: 100 },
        series: [
          {
            name: '分数',
            type: 'bar',
            label: { show: true, position: 'top' },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' },
              ]),
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2378f7' },
                  { offset: 0.7, color: '#2378f7' },
                  { offset: 1, color: '#83bff6' },
                ]),
              },
            },
            data: this.scoreList,
          },
        ],
      })
      this.chart.resize()
    },
  },
}
</script>

<style lang="less" scoped>
.line-box {
  width: 100%;
  max-width: 520px;
  height: 300px;
  margin: 0 auto;
}
</style>
