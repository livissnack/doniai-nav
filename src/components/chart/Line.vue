<template>
  <div class="line-box">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script>
import { destroyChart, replaceChart, resizeChart } from '@/utils/chartJsHelper'

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
        this.scheduleUpdate()
      },
      deep: true,
    },
    subjectNames: {
      handler() {
        this.scheduleUpdate()
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => this.ensureChartReady())
    this._onResize = () => resizeChart(this.chart)
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this._onResize)
    clearTimeout(this._updateTimer)
    destroyChart(this.chart)
    this.chart = null
  },
  methods: {
    scheduleUpdate() {
      clearTimeout(this._updateTimer)
      this._updateTimer = setTimeout(() => {
        this.$nextTick(() => this.updateChart())
      }, 0)
    },
    ensureChartReady() {
      const wrap = this.$refs.canvasRef?.parentElement
      if (!wrap) return
      if (!wrap.clientWidth && !wrap.clientHeight) {
        requestAnimationFrame(() => this.ensureChartReady())
        return
      }
      this.updateChart()
    },
    buildConfig() {
      const subjects = this.subjectNames.length ? this.subjectNames : DEFAULT_SUBJECTS
      const data = subjects.map((_, index) => Number(this.scoreList[index] ?? 0))

      return {
        type: 'bar',
        data: {
          labels: subjects,
          datasets: [
            {
              label: '分数',
              data,
              backgroundColor: '#188df0',
              borderRadius: 4,
              maxBarThickness: 48,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: { stepSize: 20 },
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
  max-width: 520px;
  height: 300px;
  margin: 0 auto;
  position: relative;
}
</style>
