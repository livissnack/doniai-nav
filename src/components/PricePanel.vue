<template>
  <div class="util-box info-card">
    <div class="util-title">
      <div><h3>实时快讯</h3></div>
    </div>

    <SidebarPanelState
      v-if="loading"
      status="loading"
      message="资讯加载中…"
      :retryable="false"
      compact
      :min-height="88"
    />

    <SidebarPanelState
      v-else-if="error"
      status="error"
      message="资讯加载失败"
      compact
      :min-height="88"
      @retry="getData"
    />

    <SidebarPanelState
      v-else-if="!hasContent"
      status="empty"
      message="暂无汇率与油价数据"
      :retryable="false"
      compact
      :min-height="88"
    />

    <div v-else class="info-content">
      <div class="info-item" v-if="currentCurrency && targetCurrencyValue != null">
        <div class="info-label">
          <AppIcon name="chart-line" class="icon-rate"  />
          汇率 ({{ currentCurrency }}/{{ targetCurrency }})
        </div>
        <div class="info-value">
          <span class="price">{{ targetCurrencyValue }}</span>
        </div>
      </div>

      <div class="info-item" v-if="fuelList.length">
        <div class="info-label">
          <AppIcon name="gas-pump" class="icon-oil"  />
          今日油价 ({{ region }})
        </div>
        <div class="info-grid">
          <div class="gas-type" v-for="(fuel, index) in fuelList" :key="index">
            {{ fuel.name }}
            <span>{{ fuel.price }}</span>
            <span
              v-if="fuelTrend !== null"
              :class="['trend', fuelTrend > 0 ? 'up' : 'down']"
            >
              <AppIcon :name="fuelTrend > 0  ? 'caret-up' : 'caret-down'"  />
            </span>
          </div>
        </div>
      </div>

      <div class="info-footer" v-if="updatedTime">
        数据更新于：{{ updatedTime }}
      </div>
      <div class="info-footer" v-if="trendDescription">
        {{ trendDescription }}
      </div>
    </div>
  </div>
</template>

<script>
import SidebarPanelState from '@/components/SidebarPanelState.vue'
import { getExchangeRate, getFuelPrice } from '@/services/api'
import { readCache, writeCache } from '@/utils/apiCache'

const RATE_KEY = 'doniaiNavCacheRate'
const FUEL_KEY = 'doniaiNavCacheFuel'
const PRICE_TTL = 15 * 60 * 1000

export default {
  name: 'PricePanel',
  components: { SidebarPanelState },
  data() {
    return {
      region: '蕲春',
      rateList: [],
      fuelList: [],
      currentCurrency: '',
      targetCurrency: '',
      targetCurrencyValue: null,
      updatedTime: '',
      fuelTrend: null,
      trendDescription: '',
      loading: true,
      error: false,
    }
  },
  computed: {
    hasContent() {
      return !!(this.currentCurrency && this.targetCurrencyValue != null) || this.fuelList.length > 0
    },
  },
  created() {
    this.getData()
  },
  methods: {
    applyRatePayload(rateRes) {
      const rateData = rateRes?.data
      if (!rateData?.rates) return false

      this.rateList = rateData.rates
      this.currentCurrency = rateData.base_code
      if (rateData.updated) this.updatedTime = rateData.updated

      const rmb = rateData.rates.find((item) => item.currency === 'CNY')
      if (rmb) {
        this.targetCurrency = rmb.currency
        this.targetCurrencyValue = rmb.rate
      }
      return !!(this.currentCurrency && this.targetCurrencyValue != null)
    },
    applyFuelPayload(fuelRes) {
      const fuelData = fuelRes?.data
      if (!fuelData?.items?.length) return false

      this.fuelList = fuelData.items
      if (fuelData.region) this.region = fuelData.region
      if (fuelData.updated) this.updatedTime = fuelData.updated

      const trend = fuelData.trend
      if (trend && trend.change_liter_max != null) {
        this.fuelTrend = trend.change_liter_max
        this.trendDescription = trend.description || ''
      }
      return this.fuelList.length > 0
    },
    applyPayload(rateRes, fuelRes) {
      this.applyRatePayload(rateRes)
      this.applyFuelPayload(fuelRes)
    },
    async getData() {
      const cachedRate = readCache(RATE_KEY, PRICE_TTL)
      const cachedFuel = readCache(FUEL_KEY, PRICE_TTL)

      if (cachedRate && cachedFuel) {
        this.applyPayload(cachedRate, cachedFuel)
        this.loading = false
        this.error = false
        return
      }

      if (cachedRate || cachedFuel) {
        this.applyPayload(cachedRate, cachedFuel)
      } else {
        this.loading = true
      }
      this.error = false

      let rateFailed = false
      let fuelFailed = false

      const [rateResult, fuelResult] = await Promise.allSettled([
        getExchangeRate(),
        getFuelPrice(),
      ])

      if (rateResult.status === 'fulfilled') {
        writeCache(RATE_KEY, rateResult.value.data)
        this.applyRatePayload(rateResult.value.data)
      } else {
        rateFailed = true
        console.error('exchange rate fetch failed:', rateResult.reason)
      }

      if (fuelResult.status === 'fulfilled') {
        writeCache(FUEL_KEY, fuelResult.value.data)
        this.applyFuelPayload(fuelResult.value.data)
      } else {
        fuelFailed = true
        console.error('fuel price fetch failed:', fuelResult.reason)
      }

      this.loading = false
      this.error = !this.hasContent && rateFailed && fuelFailed
    },
  },
}
</script>

<style lang="less" scoped>
.util-box.info-card {
  background: #ffffff;
  padding: 10px;
  margin-top: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 0;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  overflow: hidden;

  .util-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px 8px;
    margin: 0;

    h3 {
      margin: 0;
      font-size: 1em;
      font-weight: 700;
      color: #363636;
    }
  }

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

.trend {
  font-size: 12px;
  &.up {
    color: #cf1322 !important;
  }
  &.down {
    color: #389e0d !important;
  }
}
</style>
