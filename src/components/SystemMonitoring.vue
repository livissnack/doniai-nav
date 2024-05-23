<template>
  <div class="util-box">
    <div class="util-title">
      <div><h3>系统监控</h3></div>
      <div class="json-title">
        <b-switch v-model="showTools" @input="handleShowTools">
          开关
        </b-switch>
      </div>
    </div>

    <div class="monitoring-box" v-if="showTools">
      <CpuChart />
    </div>
  </div>
</template>

<script>
import CpuChart from '@/components/chart/Cpu.vue'
export default {
  name: 'SystemMonitoring',
  components: {
    CpuChart,
  },
  data() {
    return {
      showTools: true,
    }
  },
  async created() {
    this.getShowTools()
  },
  methods: {
    getShowTools() {
      let status = localStorage.getItem('doniaiNavSystemMonitoringShowStatus')
      this.showTools = status === 'true'
    },
    handleShowTools(value) {
      this.showTools = value
      localStorage.setItem('doniaiNavSystemMonitoringShowStatus', value)
    },
  }
}
</script>

<style lang="less" scoped>
.util-box {
  background: #ffffff;
  padding: 10px 10px 10px 10px;
  .util-title {
    display: flex;
    justify-content: space-between;
    padding: 0 4px;
    div {
      h3 {
        font-size: 1em;
        font-weight: 700;
        color: #363636;
      }
    }
  }
  .util-list {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    .util-list-item {
      padding: 6px 6px;
      &:not(:last-child) {
        border-bottom: 1px solid #e5e5e5;
      }
      .util-list-item-name {
        font-size: 14px;
        cursor: pointer;
        color: #D33D3D;
        .util-list-item-icon {
          color: #D33D3D;
        }
        &:hover {
          color: #333333;
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
