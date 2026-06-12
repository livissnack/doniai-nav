<template>
  <div class="line-box">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script>
import { destroyChart, replaceChart, resizeChart } from '@/utils/chartJsHelper'

export default {
  name: 'StudyNum',
  props: {
    rollCallData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      chart: null,
    }
  },
  mounted() {
    this.$nextTick(() => this.updateChart())
    this._onResize = () => resizeChart(this.chart)
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
  beforeUnmount() {
    window.removeEventListener('resize', this._onResize)
    destroyChart(this.chart)
    this.chart = null
  },
  methods: {
    buildConfig() {
      const items = Array.isArray(this.rollCallData) ? this.rollCallData : []
      return {
        type: 'pie',
        data: {
          labels: items.map((item) => item.name),
          datasets: [
            {
              label: '点名次数',
              data: items.map((item) => item.value),
              backgroundColor: [
                '#6943d0',
                '#20bc56',
                '#0e71de',
                '#ff9f43',
                '#f14668',
                '#48dbfb',
                '#a29bfe',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            title: {
              display: true,
              text: '学生点名次数统计',
            },
            legend: {
              position: 'left',
            },
            tooltip: {
              callbacks: {
                label(ctx) {
                  const label = ctx.label || ''
                  const value = ctx.parsed || 0
                  const total = ctx.dataset.data.reduce((sum, n) => sum + n, 0)
                  const pct = total ? ((value / total) * 100).toFixed(1) : 0
                  return `${label}: ${value}次 (${pct}%)`
                },
              },
            },
          },
        },
      }
    },
    updateChart() {
      const canvas = this.$refs.canvasRef
      if (!canvas) return
      this.chart = replaceChart(this.chart, canvas, this.buildConfig())
    },
  },
}
</script>

<style lang="less" scoped>
.line-box {
  width: 100%;
  height: 280px;
  min-height: 240px;
  position: relative;
}
</style>
