<template>
  <div class="radar-box" ref="chartRef"></div>
</template>

<script>
import * as echarts from 'echarts'

const DEFAULT_SUBJECTS = ['语文', '数学', '思想', '体育', '美术', '道法']

export default {
  name: 'ScoreRadar',
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
      const indicator = subjects.map((name) => ({ name, max: 100 }))
      this.chart.setOption({
        legend: { left: 'center', data: ['分数'] },
        tooltip: {},
        radar: {
          indicator,
          radius: 120,
          axisName: {
            color: '#fff',
            backgroundColor: '#666',
            borderRadius: 3,
            padding: [3, 5],
          },
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: this.scoreList,
                name: '分数',
                label: {
                  show: true,
                  formatter(params) {
                    return params.value
                  },
                },
              },
            ],
          },
        ],
      })
      this.chart.resize()
    },
  },
}
</script>

<style lang="less" scoped>
.radar-box {
  width: 100%;
  max-width: 520px;
  height: 360px;
  margin: 0 auto;
}
</style>
