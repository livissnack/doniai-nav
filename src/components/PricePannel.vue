<template>
  <div class="util-box info-card">
    <div class="util-title">
      <div><h3>实时快讯</h3></div>
    </div>

    <div class="info-content" v-if="showInfo">
      <div class="info-item">
        <div class="info-label">
          <i class="fas fa-chart-line icon-rate"></i>
          汇率 (USD/CNY)
        </div>
        <div class="info-value">
          <span class="price">7.2458</span>
          <span class="trend up"><i class="fas fa-caret-up"></i> 0.12%</span>
        </div>
      </div>

      <div class="info-item">
        <div class="info-label">
          <i class="fas fa-gas-pump icon-oil"></i>
          今日油价 ({{ region }})
        </div>
        <div class="info-grid">
          <div class="gas-type" v-for="(fuel, index) in fuelList" :key="index">{{ fuel.name}} <span>{{ fuel.price }}</span></div>
        </div>
      </div>

      <div class="info-footer">
        数据更新于：2026-02-03
      </div>
    </div>
  </div>
</template>

<script>
import {getVikiExchangeRate, getVikiFuelPrice} from "@/services/api1";

export default {
  name: 'LiveInfoCard',
  data() {
    return {
      showInfo: true,
      region: '蕲春',
      rateList: [],
      fuelList: [],
    }
  },
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      let res1 = await getVikiExchangeRate()
      let res2 = await getVikiFuelPrice(this.region)
      this.rateList = res1.data.rates
      this.fuelList = res2.data.items
      console.log(res1, this.fuelList, 'kkk---')
    }
  }
}
</script>

<style lang="less" scoped>
.util-box.info-card {
  background: #ffffff;
  padding: 10px;
  margin-top: 15px;

  .info-content {
    padding: 10px 4px 0 4px;

    .info-item {
      margin-bottom: 12px;

      .info-label {
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 4px;
        display: flex;
        align-items: center;

        i {
          margin-right: 6px;
          width: 14px;
        }
        .icon-rate { color: #2f54eb; }
        .icon-oil { color: #fa8c16; }
      }

      .info-value {
        display: flex;
        align-items: baseline;
        .price {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-right: 8px;
        }
        .trend {
          font-size: 12px;
          &.up { color: #cf1322; }
          &.down { color: #389e0d; }
        }
      }

      .info-grid {
        display: flex;
        justify-content: space-between;
        background: #f5f5f5;
        border-radius: 4px;
        padding: 6px 8px;

        .gas-type {
          font-size: 13px;
          color: #595959;
          span {
            font-weight: 700;
            color: #141414;
            margin-left: 2px;
          }
        }
      }
    }

    .info-footer {
      font-size: 11px;
      color: #bfbfbf;
      text-align: right;
      border-top: 1px dashed #f0f0f0;
      padding-top: 6px;
    }
  }
}
</style>