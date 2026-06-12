<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/loan-rate`" pageTitle="贷款利率计算器"></Navbar>
    </div>

    <div class="content-box">
      <div class="container">
        <UtilPageColumns>
          <div class="columns">
            <div class="column bg-white is-three-quarters">
              <div class="loan-panel" ref="loan-rate">
                <div class="loan-type-tabs">
                  <button
                    v-for="tab in loanTypeTabs"
                    :key="tab.value"
                    type="button"
                    class="type-tab"
                    :class="{ active: loanType === tab.value }"
                    @click="switchLoanType(tab.value)"
                  >
                    <i :class="tab.icon"></i>
                    {{ tab.label }}
                  </button>
                </div>

                <section class="form-section">
                  <h3 class="section-title">
                    <i class="fas fa-sliders-h"></i>
                    贷款参数
                  </h3>

                  <div class="form-grid">
                    <template v-if="loanType === 'combined'">
                      <div class="form-item">
                        <label class="form-label">公积金贷款</label>
                        <div class="input-unit-row">
                          <o-field>
                            <o-input size="small" v-model.number="fundMoney" type="number" :min="0" placeholder="公积金金额" />
                          </o-field>
                          <span class="unit-text">元</span>
                        </div>
                        <div class="preset-row">
                          <button
                            v-for="preset in fundAmountPresets"
                            :key="preset.value"
                            type="button"
                            class="preset-chip"
                            :class="{ active: fundMoney === preset.value }"
                            @click="fundMoney = preset.value"
                          >
                            {{ preset.label }}
                          </button>
                        </div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">商业贷款</label>
                        <div class="input-unit-row">
                          <o-field>
                            <o-input size="small" v-model.number="commercialMoney" type="number" :min="0" placeholder="商贷金额" />
                          </o-field>
                          <span class="unit-text">元</span>
                        </div>
                        <div class="preset-row">
                          <button
                            v-for="preset in commercialAmountPresets"
                            :key="preset.value"
                            type="button"
                            class="preset-chip"
                            :class="{ active: commercialMoney === preset.value }"
                            @click="commercialMoney = preset.value"
                          >
                            {{ preset.label }}
                          </button>
                        </div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">公积金利率</label>
                        <div class="input-unit-row">
                          <o-field>
                            <o-input size="small" v-model.number="fundRate" type="number" :min="0" :step="0.01" />
                          </o-field>
                          <span class="unit-text">%</span>
                        </div>
                        <div class="preset-row">
                          <button
                            v-for="rate in fundRatePresets"
                            :key="rate"
                            type="button"
                            class="preset-chip"
                            :class="{ active: fundRate === rate }"
                            @click="fundRate = rate"
                          >
                            {{ rate }}%
                          </button>
                        </div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">商贷利率</label>
                        <div class="input-unit-row">
                          <o-field>
                            <o-input size="small" v-model.number="commercialRate" type="number" :min="0" :step="0.01" />
                          </o-field>
                          <span class="unit-text">%</span>
                        </div>
                        <div class="preset-row">
                          <button
                            v-for="rate in commercialRatePresets"
                            :key="rate"
                            type="button"
                            class="preset-chip"
                            :class="{ active: commercialRate === rate }"
                            @click="commercialRate = rate"
                          >
                            {{ rate }}%
                          </button>
                        </div>
                      </div>
                    </template>

                    <template v-else>
                      <div class="form-item form-item-wide">
                        <label class="form-label">{{ loanType === 'fund' ? '公积金贷款本金' : '商业贷款本金' }}</label>
                        <div class="input-unit-row">
                          <o-field>
                            <o-input size="small" v-model.number="money" type="number" :min="1" placeholder="请输入贷款本金" />
                          </o-field>
                          <span class="unit-text">元</span>
                        </div>
                        <div class="preset-row">
                          <button
                            v-for="preset in amountPresets"
                            :key="preset.value"
                            type="button"
                            class="preset-chip"
                            :class="{ active: money === preset.value }"
                            @click="money = preset.value"
                          >
                            {{ preset.label }}
                          </button>
                        </div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">{{ loanType === 'fund' ? '公积金年化利率' : '商贷年化利率' }}</label>
                        <div class="input-unit-row">
                          <o-field>
                            <o-input size="small"
                              v-model.number="activeRate"
                              type="number"
                              :min="0"
                              :step="0.01"
                              placeholder="请输入年化利率"
                            />
                          </o-field>
                          <span class="unit-text">%</span>
                        </div>
                        <div class="preset-row">
                          <button
                            v-for="rate in currentRatePresets"
                            :key="rate"
                            type="button"
                            class="preset-chip"
                            :class="{ active: activeRate === rate }"
                            @click="activeRate = rate"
                          >
                            {{ rate }}%
                          </button>
                        </div>
                      </div>
                    </template>

                    <div class="form-item">
                      <label class="form-label">贷款期限</label>
                      <div class="input-unit-row">
                        <o-field>
                          <o-input size="small" v-model.number="termInput" type="number" :min="1" placeholder="请输入期限" />
                        </o-field>
                        <div class="unit-toggle">
                          <button
                            type="button"
                            class="unit-toggle-btn"
                            :class="{ active: termUnit === 'month' }"
                            @click="termUnit = 'month'"
                          >
                            月
                          </button>
                          <button
                            type="button"
                            class="unit-toggle-btn"
                            :class="{ active: termUnit === 'year' }"
                            @click="termUnit = 'year'"
                          >
                            年
                          </button>
                        </div>
                      </div>
                      <div class="preset-row">
                        <button
                          v-for="preset in termPresets"
                          :key="preset.months"
                          type="button"
                          class="preset-chip"
                          :class="{ active: months === preset.months }"
                          @click="applyTermPreset(preset.months)"
                        >
                          {{ preset.label }}
                        </button>
                      </div>
                    </div>

                    <div class="form-item">
                      <label class="form-label">还款方式</label>
                      <div class="mode-group">
                        <button type="button" class="mode-btn" :class="{ active: paybackMode === 1 }" @click="paybackMode = 1">
                          <i class="fas fa-equals"></i>
                          等额本息
                        </button>
                        <button type="button" class="mode-btn" :class="{ active: paybackMode === 2 }" @click="paybackMode = 2">
                          <i class="fas fa-chart-line"></i>
                          等额本金
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-if="loanType === 'combined'" class="combined-total">
                    贷款总额：<strong>{{ formatMoney(combinedTotal) }}</strong> 元
                    （公积金 {{ formatMoney(fundMoney) }} + 商贷 {{ formatMoney(commercialMoney) }}）
                  </div>

                  <div class="remark-box">
                    <i class="fas fa-info-circle"></i>
                    <span>{{ remark }}</span>
                  </div>
                </section>

                <section class="prepay-section">
                  <div class="prepay-header">
                    <h3 class="section-title">
                      <i class="fas fa-hand-holding-usd"></i>
                      提前还款
                    </h3>
                    <o-switch v-model="prepayEnabled" variant="success" size="small">
                      {{ prepayEnabled ? '已启用' : '未启用' }}
                    </o-switch>
                  </div>

                  <div v-if="prepayEnabled" class="prepay-form">
                    <div class="prepay-grid">
                      <div class="form-item">
                        <label class="form-label">还款期数（第几期后）</label>
                        <div class="input-unit-row">
                          <o-field>
                            <o-input size="small" v-model.number="prepayMonth" type="number" :min="1" :max="months - 1" />
                          </o-field>
                          <span class="unit-text">期</span>
                        </div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">提前还款金额</label>
                        <div class="input-unit-row">
                          <o-field>
                            <o-input size="small"
                              v-model.number="prepayAmount"
                              type="number"
                              :min="0"
                              :disabled="prepayFull"
                              placeholder="请输入提前还款金额"
                            />
                          </o-field>
                          <span class="unit-text">元</span>
                        </div>
                        <div class="preset-row">
                          <button
                            v-for="preset in prepayPresets"
                            :key="preset"
                            type="button"
                            class="preset-chip"
                            :disabled="prepayFull"
                            @click="prepayAmount = preset"
                          >
                            {{ preset >= 10000 ? `${preset / 10000}万` : preset }}
                          </button>
                        </div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">还款策略</label>
                        <div class="mode-group">
                          <button
                            type="button"
                            class="mode-btn"
                            :class="{ active: prepayStrategy === 'shorten' }"
                            :disabled="prepayFull"
                            @click="prepayStrategy = 'shorten'"
                          >
                            缩短期限
                          </button>
                          <button
                            type="button"
                            class="mode-btn"
                            :class="{ active: prepayStrategy === 'reduce' }"
                            :disabled="prepayFull"
                            @click="prepayStrategy = 'reduce'"
                          >
                            减少月供
                          </button>
                        </div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">结清方式</label>
                        <div class="mode-group">
                          <button type="button" class="mode-btn" :class="{ active: !prepayFull }" @click="prepayFull = false">
                            部分还款
                          </button>
                          <button type="button" class="mode-btn" :class="{ active: prepayFull }" @click="prepayFull = true">
                            全部结清
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="prepay-hint">
                      <template v-if="prepayFull">
                        在第 {{ prepayMonth }} 期后一次性结清剩余本金，贷款提前结束。
                      </template>
                      <template v-else-if="prepayStrategy === 'shorten'">
                        在第 {{ prepayMonth }} 期后还款 {{ formatMoney(prepayAmount) }} 元，保持月供不变、缩短还款期限。
                      </template>
                      <template v-else>
                        在第 {{ prepayMonth }} 期后还款 {{ formatMoney(prepayAmount) }} 元，保持原期限、重新计算更低月供。
                      </template>
                      <template v-if="loanType === 'combined'">
                        组合贷提前还款将按公积金/商贷剩余本金比例自动分摊。
                      </template>
                    </div>
                  </div>
                </section>

                <section v-if="list.length" class="summary-section">
                  <div class="summary-card highlight">
                    <div class="card-label">月供</div>
                    <div class="card-value">{{ monthlySummary }}</div>
                    <div class="card-hint">{{ paybackMode === 1 ? '每月固定' : '首高尾低' }}</div>
                  </div>
                  <div class="summary-card">
                    <div class="card-label">还款总额</div>
                    <div class="card-value">{{ formatMoney(totalPayment) }}</div>
                    <div class="card-hint">本金 + 利息</div>
                  </div>
                  <div class="summary-card">
                    <div class="card-label">利息总额</div>
                    <div class="card-value accent">{{ formatMoney(totalInterest) }}</div>
                    <div class="card-hint">占本金 {{ interestRatio }}%</div>
                  </div>
                  <div class="summary-card" :class="{ saved: prepayEnabled && savedInterest > 0 }">
                    <div class="card-label">{{ prepayEnabled ? '节省利息' : '贷款本金' }}</div>
                    <div class="card-value" :class="{ accent: prepayEnabled && savedInterest > 0 }">
                      {{ prepayEnabled ? formatMoney(savedInterest) : formatMoney(totalPrincipal) }}
                    </div>
                    <div class="card-hint">
                      {{ prepayEnabled ? `较原计划少还` : `共 ${list.length} 期` }}
                    </div>
                  </div>
                </section>

                <section v-if="loanType === 'combined' && list.length" class="combined-summary">
                  <div class="combined-item">
                    <span class="label">公积金月供</span>
                    <span class="value fund">¥ {{ combinedFirstFundPayment }}</span>
                  </div>
                  <div class="combined-item">
                    <span class="label">商贷月供</span>
                    <span class="value commercial">¥ {{ combinedFirstCommercialPayment }}</span>
                  </div>
                </section>

                <section v-if="list.length" class="chart-section">
                  <h3 class="section-title">
                    <i class="fas fa-chart-area"></i>
                    还款构成
                  </h3>
                  <div ref="chartRef" class="chart-box"></div>
                </section>

                <div class="pass-operate">
                  <div class="btns">
                    <o-button variant="success" icon-pack="fas" icon-left="calculator" @click="getLoanRate">计算</o-button>
                    <o-button variant="primary" icon-pack="fas" icon-left="file-excel" :disabled="!list.length" @click="exportExcel">
                      导出 Excel
                    </o-button>
                    <o-button
                      variant="warning"
                      icon-pack="fas"
                      icon-left="download"
                      :loading="downloadStatus"
                      :disabled="!list.length"
                      @click="downloadLoanRateData"
                    >
                      下载图片
                    </o-button>
                  </div>
                </div>

                <section v-if="list.length" class="result-section" ref="exportSectionRef">
                  <h3 class="section-title">
                    <i class="fas fa-table"></i>
                    还款明细
                    <span class="result-count">共 {{ list.length }} 期</span>
                  </h3>
                  <div class="table-wrap" ref="tableRef">
                    <table class="loan-table">
                      <thead>
                        <tr>
                          <th rowspan="2">期数</th>
                          <th rowspan="2">月供</th>
                          <th v-if="loanType === 'combined'" colspan="2">公积金</th>
                          <th v-if="loanType === 'combined'" colspan="2">商贷</th>
                          <th colspan="2">当月拆解</th>
                          <th colspan="2">累计还款</th>
                          <th colspan="2">剩余待还</th>
                        </tr>
                        <tr>
                          <template v-if="loanType === 'combined'">
                            <th>月供</th>
                            <th>利息</th>
                            <th>月供</th>
                            <th>利息</th>
                          </template>
                          <th>本金</th>
                          <th>利息</th>
                          <th>本金</th>
                          <th>利息</th>
                          <th>本金</th>
                          <th>利息</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="row-total">
                          <td>合计</td>
                          <td>{{ formatMoney(totalPayment) }}</td>
                          <template v-if="loanType === 'combined'">
                            <td>{{ formatMoney(fundTotalPayment) }}</td>
                            <td>{{ formatMoney(fundTotalInterest) }}</td>
                            <td>{{ formatMoney(commercialTotalPayment) }}</td>
                            <td>{{ formatMoney(commercialTotalInterest) }}</td>
                          </template>
                          <td>{{ formatMoney(totalPrincipal) }}</td>
                          <td>{{ formatMoney(totalInterest) }}</td>
                          <td>-</td>
                          <td>-</td>
                          <td>{{ formatMoney(totalPrincipal) }}</td>
                          <td>{{ formatMoney(totalInterest) }}</td>
                        </tr>
                        <tr
                          v-for="(item, index) in list"
                          :key="index"
                          :class="{ 'row-prepay': item.isPrepay, 'row-payoff': item.isPayoff }"
                        >
                          <td>
                            {{ item.month }}
                            <span v-if="item.prepayNote" class="prepay-tag">{{ item.prepayNote }}</span>
                          </td>
                          <td class="num">{{ item.payment }}</td>
                          <template v-if="loanType === 'combined'">
                            <td class="num fund">{{ item.fundPayment || '-' }}</td>
                            <td class="num fund">{{ item.fundInterest || '-' }}</td>
                            <td class="num commercial">{{ item.commercialPayment || '-' }}</td>
                            <td class="num commercial">{{ item.commercialInterest || '-' }}</td>
                          </template>
                          <td class="num">{{ item.principal }}</td>
                          <td class="num interest">{{ item.interest }}</td>
                          <td class="num">{{ item.repaymentPrincipal }}</td>
                          <td class="num">{{ item.repaymentInterest }}</td>
                          <td class="num">{{ item.remainingPrincipal }}</td>
                          <td class="num">{{ remainingInterest(item) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <div v-else-if="calcError" class="empty-state">
                  <i class="fas fa-exclamation-triangle"></i>
                  <p>{{ calcError }}</p>
                </div>
              </div>
            </div>
            <SidebarColumn />
          </div>
        </UtilPageColumns>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"></back-top>
    </div>
    <div id="footer">
      <Footer />
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import SidebarColumn from '@/components/SidebarColumn.vue'
import UtilPageColumns from '@/components/UtilPageColumns.vue'
import Footer from '@/components/Footer.vue'
import { calculateLoanPlan } from '@/utils/loanCalc'
import * as echarts from 'echarts'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const EXPORT_PAGE_ROW_SIZE = 50
const EXPORT_MAX_CANVAS_DIM = 12000

const REMARKS = {
  commercial: '商业贷款：利率随 LPR 及银行政策浮动，适用于购房、消费等场景。',
  fund: '公积金贷款：利率低于商贷，有额度与资格限制，适合符合条件的缴存职工。',
  combined: '组合贷：公积金与商业贷款组合使用，分别计息、合并月供，常见于公积金贷款额度不足时。',
  payback1: '等额本息：每月还款额相同，前期利息占比高，适合收入稳定人群。',
  payback2: '等额本金：每月偿还相同本金，利息逐月递减，总利息更少、前期压力较大。',
}

export default {
  name: 'LoanRate',
  components: {
    Navbar,
    SidebarColumn,
    UtilPageColumns,
    Footer,
  },
  data() {
    return {
      loanType: 'commercial',
      loanTypeTabs: [
        { value: 'commercial', label: '商业贷款', icon: 'fas fa-building' },
        { value: 'fund', label: '公积金贷款', icon: 'fas fa-home' },
        { value: 'combined', label: '组合贷', icon: 'fas fa-layer-group' },
      ],
      money: 1000000,
      yearRate: 3.1,
      fundMoney: 600000,
      commercialMoney: 400000,
      fundRate: 2.85,
      commercialRate: 3.1,
      termInput: 30,
      termUnit: 'year',
      paybackMode: 1,
      prepayEnabled: false,
      prepayMonth: 12,
      prepayAmount: 100000,
      prepayStrategy: 'shorten',
      prepayFull: false,
      downloadStatus: false,
      list: [],
      baselineList: [],
      savedInterest: 0,
      calcError: '',
      amountPresets: [
        { label: '10万', value: 100000 },
        { label: '30万', value: 300000 },
        { label: '50万', value: 500000 },
        { label: '100万', value: 1000000 },
        { label: '200万', value: 2000000 },
      ],
      fundAmountPresets: [
        { label: '30万', value: 300000 },
        { label: '50万', value: 500000 },
        { label: '60万', value: 600000 },
        { label: '80万', value: 800000 },
        { label: '120万', value: 1200000 },
      ],
      commercialAmountPresets: [
        { label: '10万', value: 100000 },
        { label: '20万', value: 200000 },
        { label: '40万', value: 400000 },
        { label: '60万', value: 600000 },
        { label: '100万', value: 1000000 },
      ],
      termPresets: [
        { label: '1年', months: 12 },
        { label: '3年', months: 36 },
        { label: '5年', months: 60 },
        { label: '10年', months: 120 },
        { label: '20年', months: 240 },
        { label: '30年', months: 360 },
      ],
      fundRatePresets: [2.35, 2.6, 2.85, 3.1],
      commercialRatePresets: [2.85, 3.1, 3.45, 4.2, 4.9],
      prepayPresets: [50000, 100000, 200000, 500000],
      chart: null,
    }
  },
  computed: {
    months() {
      const n = Number(this.termInput)
      if (!n || n <= 0) return 0
      return this.termUnit === 'year' ? Math.round(n * 12) : Math.round(n)
    },
    activeRate: {
      get() {
        return this.loanType === 'fund' ? this.fundRate : this.yearRate
      },
      set(val) {
        if (this.loanType === 'fund') this.fundRate = val
        else this.yearRate = val
      },
    },
    currentRatePresets() {
      return this.loanType === 'fund' ? this.fundRatePresets : this.commercialRatePresets
    },
    combinedTotal() {
      return Number(this.fundMoney || 0) + Number(this.commercialMoney || 0)
    },
    remark() {
      const typeRemark = REMARKS[this.loanType] || ''
      const paybackRemark = this.paybackMode === 1 ? REMARKS.payback1 : REMARKS.payback2
      return `${typeRemark} ${paybackRemark}`
    },
    totalPrincipal() {
      return this.loanType === 'combined' ? this.combinedTotal : Number(this.money) || 0
    },
    totalPayment() {
      return this.list.reduce((sum, item) => sum + Number(item.payment || 0), 0)
    },
    totalInterest() {
      return Math.max(0, this.totalPayment - this.totalPrincipal)
    },
    interestRatio() {
      if (!this.totalPrincipal) return '0.00'
      return ((this.totalInterest / this.totalPrincipal) * 100).toFixed(2)
    },
    monthlySummary() {
      if (!this.list.length) return '-'
      if (this.loanType === 'combined') {
        const first = this.list[0]
        return `¥ ${first.payment}`
      }
      if (this.paybackMode === 1) return `¥ ${this.list[0].payment}`
      const first = this.list[0].payment
      const last = this.list[this.list.length - 1].payment
      return `¥ ${first} → ${last}`
    },
    combinedFirstFundPayment() {
      return this.list[0]?.fundPayment || '0.00'
    },
    combinedFirstCommercialPayment() {
      return this.list[0]?.commercialPayment || '0.00'
    },
    fundTotalPayment() {
      return this.list.reduce((s, item) => s + Number(item.fundPayment || 0), 0)
    },
    commercialTotalPayment() {
      return this.list.reduce((s, item) => s + Number(item.commercialPayment || 0), 0)
    },
    fundTotalInterest() {
      return this.list.reduce((s, item) => s + Number(item.fundInterest || 0), 0)
    },
    commercialTotalInterest() {
      return this.list.reduce((s, item) => s + Number(item.commercialInterest || 0), 0)
    },
  },
  watch: {
    loanType() {
      this.getLoanRate()
    },
    paybackMode() {
      this.getLoanRate()
    },
    prepayEnabled() {
      this.getLoanRate()
    },
    prepayFull() {
      this.getLoanRate()
    },
    prepayStrategy() {
      this.scheduleCalc()
    },
    prepayMonth() {
      this.scheduleCalc()
    },
    prepayAmount() {
      this.scheduleCalc()
    },
    money() {
      this.scheduleCalc()
    },
    yearRate() {
      this.scheduleCalc()
    },
    fundMoney() {
      this.scheduleCalc()
    },
    commercialMoney() {
      this.scheduleCalc()
    },
    fundRate() {
      this.scheduleCalc()
    },
    commercialRate() {
      this.scheduleCalc()
    },
    termInput() {
      this.scheduleCalc()
    },
    termUnit() {
      this.scheduleCalc()
    },
    list() {
      this.$nextTick(() => this.renderChart())
    },
  },
  mounted() {
    this.getLoanRate()
    this._onResize = () => this.chart?.resize()
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this._onResize)
    this.destroyChart()
  },
  methods: {
    switchLoanType(type) {
      this.loanType = type
    },
    scheduleCalc() {
      clearTimeout(this._calcTimer)
      this._calcTimer = setTimeout(() => this.getLoanRate(), 300)
    },
    applyTermPreset(months) {
      if (months % 12 === 0 && months >= 12) {
        this.termUnit = 'year'
        this.termInput = months / 12
      } else {
        this.termUnit = 'month'
        this.termInput = months
      }
    },
    validate() {
      const months = this.months
      if (!months || months <= 0 || months > 600) return '贷款期限需在 1～600 个月之间'

      if (this.loanType === 'combined') {
        const fund = Number(this.fundMoney)
        const commercial = Number(this.commercialMoney)
        if ((!fund || fund <= 0) && (!commercial || commercial <= 0)) {
          return '公积金与商贷金额至少填写一项'
        }
        if (fund < 0 || commercial < 0) return '贷款金额不能为负数'
        if (this.fundRate < 0 || this.fundRate > 100 || this.commercialRate < 0 || this.commercialRate > 100) {
          return '利率需在 0%～100% 之间'
        }
      } else {
        const money = Number(this.money)
        const rate = this.activeRate
        if (!money || money <= 0) return '请输入有效的贷款本金'
        if (rate < 0 || rate > 100) return '年化利率需在 0%～100% 之间'
      }

      if (this.prepayEnabled) {
        const pm = Number(this.prepayMonth)
        if (!pm || pm < 1 || pm >= months) return `提前还款期数需在 1～${months - 1} 之间`
        if (!this.prepayFull) {
          const amount = Number(this.prepayAmount)
          if (!amount || amount <= 0) return '请输入有效的提前还款金额'
        }
      }
      return ''
    },
    getLoanRate() {
      const error = this.validate()
      if (error) {
        this.calcError = error
        this.list = []
        this.baselineList = []
        this.savedInterest = 0
        this.destroyChart()
        return
      }

      this.calcError = ''
      const result = calculateLoanPlan({
        loanType: this.loanType,
        paybackMode: this.paybackMode,
        months: this.months,
        money: this.money,
        yearRate: this.yearRate,
        fundMoney: this.fundMoney,
        commercialMoney: this.commercialMoney,
        fundRate: this.fundRate,
        commercialRate: this.commercialRate,
        prepayEnabled: this.prepayEnabled,
        prepayMonth: this.prepayMonth,
        prepayAmount: this.prepayAmount,
        prepayFull: this.prepayFull,
        prepayStrategy: this.prepayStrategy,
      })

      this.baselineList = result.baselineList
      this.list = result.list
      this.savedInterest = result.savedInterest
    },
    formatMoney(val) {
      const num = Number(val)
      if (Number.isNaN(num)) return '0.00'
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    remainingInterest(item) {
      const left = this.totalInterest - Number(item.repaymentInterest || 0)
      return left < 0.1 ? '0.00' : left.toFixed(2)
    },
    destroyChart() {
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
    },
    renderChart() {
      const el = this.$refs.chartRef
      if (!el || !this.list.length) {
        this.destroyChart()
        return
      }
      if (!this.chart) this.chart = echarts.init(el)

      const labels = this.list.map((item) => item.month.replace(/第|期|（.*?）/g, ''))
      const series =
        this.loanType === 'combined'
          ? [
              { name: '公积金本金', type: 'bar', stack: 'pay', data: this.list.map((i) => Number(i.fundPrincipal || 0)) },
              { name: '商贷本金', type: 'bar', stack: 'pay', data: this.list.map((i) => Number(i.commercialPrincipal || 0)) },
              { name: '公积金利息', type: 'bar', stack: 'pay', data: this.list.map((i) => Number(i.fundInterest || 0)) },
              { name: '商贷利息', type: 'bar', stack: 'pay', data: this.list.map((i) => Number(i.commercialInterest || 0)) },
            ]
          : [
              { name: '本金', type: 'bar', stack: 'pay', data: this.list.map((i) => Number(i.principal)) },
              { name: '利息', type: 'bar', stack: 'pay', data: this.list.map((i) => Number(i.interest)) },
            ]

      this.chart.setOption({
        color: ['#20bc56', '#2095f2', '#f14668', '#ff9f43'],
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        legend: { bottom: 0 },
        grid: { left: 48, right: 24, top: 24, bottom: 48 },
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: { interval: Math.max(0, Math.floor(labels.length / 12) - 1) },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (v) => (v >= 10000 ? `${(v / 10000).toFixed(0)}万` : v),
          },
        },
        dataZoom:
          labels.length > 24 ? [{ type: 'inside', start: 0, end: 30 }, { start: 0, end: 30 }] : undefined,
        series,
      })
      this.chart.resize()
    },
    getExportMetaRows() {
      const typeLabel = { commercial: '商业贷款', fund: '公积金贷款', combined: '组合贷' }[this.loanType]
      const mode = this.paybackMode === 1 ? '等额本息' : '等额本金'
      const rateText =
        this.loanType === 'combined'
          ? `公积金 ${this.fundRate}% / 商贷 ${this.commercialRate}%`
          : `${this.activeRate}%`

      const rows = [
        ['贷款还款明细'],
        ['贷款类型', typeLabel],
        ['还款方式', mode],
        ['贷款本金(元)', this.totalPrincipal],
        ['贷款期限', `${this.months} 期`],
        ['年化利率', rateText],
        ['还款总额(元)', Number(this.totalPayment.toFixed(2))],
        ['利息总额(元)', Number(this.totalInterest.toFixed(2))],
      ]

      if (this.prepayEnabled) {
        rows.push([
          '提前还款',
          this.prepayFull
            ? `第 ${this.prepayMonth} 期后全部结清`
            : `第 ${this.prepayMonth} 期后还款 ${this.prepayAmount} 元（${this.prepayStrategy === 'shorten' ? '缩短期限' : '减少月供'}）`,
        ])
        rows.push(['节省利息(元)', Number(this.savedInterest.toFixed(2))])
      }

      return rows
    },
    getExportTableHeader() {
      const isCombined = this.loanType === 'combined'
      return isCombined
        ? ['期数', '月供', '公积金月供', '公积金利息', '商贷月供', '商贷利息', '本金', '利息', '累计本金', '累计利息', '剩余本金', '剩余利息', '备注']
        : ['期数', '月供', '本金', '利息', '累计本金', '累计利息', '剩余本金', '剩余利息', '备注']
    },
    getExportTotalRow() {
      const isCombined = this.loanType === 'combined'
      return isCombined
        ? [
            '合计',
            Number(this.totalPayment.toFixed(2)),
            Number(this.fundTotalPayment.toFixed(2)),
            Number(this.fundTotalInterest.toFixed(2)),
            Number(this.commercialTotalPayment.toFixed(2)),
            Number(this.commercialTotalInterest.toFixed(2)),
            Number(this.totalPrincipal.toFixed(2)),
            Number(this.totalInterest.toFixed(2)),
            '-',
            '-',
            Number(this.totalPrincipal.toFixed(2)),
            Number(this.totalInterest.toFixed(2)),
            '',
          ]
        : [
            '合计',
            Number(this.totalPayment.toFixed(2)),
            Number(this.totalPrincipal.toFixed(2)),
            Number(this.totalInterest.toFixed(2)),
            '-',
            '-',
            Number(this.totalPrincipal.toFixed(2)),
            Number(this.totalInterest.toFixed(2)),
            '',
          ]
    },
    getExportDetailRows() {
      const isCombined = this.loanType === 'combined'
      return this.list.map((item) =>
        isCombined
          ? [
              item.month,
              Number(item.payment),
              Number(item.fundPayment || 0),
              Number(item.fundInterest || 0),
              Number(item.commercialPayment || 0),
              Number(item.commercialInterest || 0),
              Number(item.principal),
              Number(item.interest),
              Number(item.repaymentPrincipal),
              Number(item.repaymentInterest),
              Number(item.remainingPrincipal),
              Number(this.remainingInterest(item)),
              item.prepayNote || '',
            ]
          : [
              item.month,
              Number(item.payment),
              Number(item.principal),
              Number(item.interest),
              Number(item.repaymentPrincipal),
              Number(item.repaymentInterest),
              Number(item.remainingPrincipal),
              Number(this.remainingInterest(item)),
              item.prepayNote || '',
            ],
      )
    },
    exportExcel() {
      if (!this.list.length) return

      const rows = [
        ...this.getExportMetaRows(),
        [],
        this.getExportTableHeader(),
        this.getExportTotalRow(),
        ...this.getExportDetailRows(),
      ]

      const sheet = XLSX.utils.aoa_to_sheet(rows)
      const book = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(book, sheet, '还款明细')
      const typeLabel = { commercial: '商业贷款', fund: '公积金贷款', combined: '组合贷' }[this.loanType]
      const mode = this.paybackMode === 1 ? '等额本息' : '等额本金'
      XLSX.writeFile(book, `贷款还款明细_${typeLabel}_${mode}_${this.list.length}期_${Date.now()}.xlsx`)
      this.$notify({
        duration: 3000,
        message: `Excel 导出成功，共 ${this.list.length} 期明细`,
        type: 'is-success',
        position: 'is-bottom-right',
        actionText: 'Msg',
      })
    },
    applyExportTableStyles(table) {
      table.style.cssText = 'width:100%;border-collapse:collapse;font-size:13px;background:#fff;'
      table.querySelectorAll('th, td').forEach((cell) => {
        cell.style.padding = '10px 8px'
        cell.style.textAlign = 'center'
        cell.style.border = '1px solid #eee'
        cell.style.whiteSpace = 'nowrap'
      })
      table.querySelectorAll('thead th').forEach((th) => {
        th.style.background = '#f0f2f5'
        th.style.fontWeight = '600'
        th.style.color = '#363636'
      })
      const totalRow = table.querySelector('.row-total')
      if (totalRow) {
        totalRow.querySelectorAll('td').forEach((td) => {
          td.style.background = '#e8f8ee'
          td.style.fontWeight = '700'
          td.style.color = '#148f42'
        })
      }
    },
    createExportCaptureBox(titleText) {
      const container = document.createElement('div')
      container.style.cssText =
        'position:fixed;left:-20000px;top:0;z-index:-1;background:#fff;padding:16px;box-sizing:border-box;'
      const title = document.createElement('div')
      title.textContent = titleText
      title.style.cssText = 'font-size:16px;font-weight:600;margin-bottom:12px;color:#363636;'
      container.appendChild(title)
      return container
    },
    buildExportPageTable(sourceTable, { startIndex, endIndex, showTotal }) {
      const table = document.createElement('table')
      const thead = sourceTable.querySelector('thead')
      if (thead) table.appendChild(thead.cloneNode(true))

      const tbody = document.createElement('tbody')
      if (showTotal) {
        const totalRow = sourceTable.querySelector('.row-total')
        if (totalRow) tbody.appendChild(totalRow.cloneNode(true))
      }

      const detailRows = sourceTable.querySelectorAll('tbody tr:not(.row-total)')
      for (let i = startIndex; i < endIndex && i < detailRows.length; i++) {
        tbody.appendChild(detailRows[i].cloneNode(true))
      }
      table.appendChild(tbody)
      this.applyExportTableStyles(table)
      return table
    },
    calcExportScale(width, height) {
      let scale = 1.5
      const maxSide = Math.max(width, height)
      if (maxSide * scale > EXPORT_MAX_CANVAS_DIM) {
        scale = EXPORT_MAX_CANVAS_DIM / maxSide
      }
      return Math.max(0.6, Math.min(1.5, scale))
    },
    captureElementToBlob(element) {
      const scale = this.calcExportScale(element.scrollWidth, element.scrollHeight)
      return html2canvas(element, {
        allowTaint: true,
        scale,
        backgroundColor: '#ffffff',
        logging: false,
      }).then(
        (canvas) =>
          new Promise((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) resolve({ blob, scale })
                else reject(new Error('canvas toBlob failed'))
              },
              'image/png',
              0.92,
            )
          }),
      )
    },
    async downloadLoanRateData() {
      const tableEl = this.$refs.tableRef?.querySelector('table')
      if (!tableEl || !this.list.length) return

      this.downloadStatus = true
      const detailRows = tableEl.querySelectorAll('tbody tr:not(.row-total)')
      const pageCount = Math.ceil(detailRows.length / EXPORT_PAGE_ROW_SIZE)
      const containers = []

      try {
        if (pageCount <= 1) {
          const container = this.createExportCaptureBox(`还款明细（共 ${this.list.length} 期）`)
          const clone = tableEl.cloneNode(true)
          this.applyExportTableStyles(clone)
          container.appendChild(clone)
          document.body.appendChild(container)
          containers.push(container)

          const { blob } = await this.captureElementToBlob(container)
          saveAs(blob, `loan-rate-${this.list.length}期-${Date.now()}.png`)
          this.$notify({
            duration: 3000,
            message: `图片下载成功，共 ${this.list.length} 期明细`,
            type: 'is-success',
            position: 'is-bottom-right',
            actionText: 'Msg',
          })
          return
        }

        const zip = new JSZip()
        for (let page = 0; page < pageCount; page++) {
          const start = page * EXPORT_PAGE_ROW_SIZE
          const end = start + EXPORT_PAGE_ROW_SIZE
          const container = this.createExportCaptureBox(
            `还款明细（共 ${this.list.length} 期，第 ${page + 1}/${pageCount} 页）`,
          )
          const pageTable = this.buildExportPageTable(tableEl, {
            startIndex: start,
            endIndex: end,
            showTotal: page === 0,
          })
          container.appendChild(pageTable)
          document.body.appendChild(container)
          containers.push(container)

          const { blob } = await this.captureElementToBlob(container)
          zip.file(`还款明细_${String(page + 1).padStart(2, '0')}.png`, blob)
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        saveAs(zipBlob, `loan-rate-${this.list.length}期-${Date.now()}.zip`)
        this.$notify({
          duration: 3000,
          message: `图片已打包下载，共 ${this.list.length} 期明细，${pageCount} 张图片`,
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      } catch (e) {
        console.error('download loan table failed:', e)
        this.$notify({
          duration: 3000,
          message: '还款表格图片下载失败，请优先使用 Excel 导出',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg',
        })
      } finally {
        containers.forEach((container) => {
          if (container.parentNode) container.parentNode.removeChild(container)
        })
        this.downloadStatus = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
  margin-bottom: 35px;
  border-bottom: 2px solid #e1e1e1;
}

.bg-white {
  padding: 0;
  background-color: transparent;
  margin-bottom: 200px;
}

.loan-panel {
  padding: 28px 24px 24px;
  background: #fff;
}

.loan-type-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.type-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #20bc56;
    color: #20bc56;
  }

  &.active {
    background: linear-gradient(135deg, #e8f8ee 0%, #fff 100%);
    border-color: #20bc56;
    color: #148f42;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(32, 188, 86, 0.12);
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #363636;

  i {
    color: #20bc56;
  }

  .result-count {
    margin-left: auto;
    font-size: 13px;
    font-weight: 400;
    color: #888;
  }
}

.form-section,
.prepay-section {
  margin-bottom: 24px;
}

.prepay-section {
  padding: 16px 18px;
  background: #fafbfc;
  border: 1px solid #eee;
  border-radius: 8px;
}

.prepay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .section-title {
    margin-bottom: 0;
  }
}

.prepay-form {
  margin-top: 16px;
}

.prepay-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;
}

.prepay-hint {
  margin-top: 12px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #666;
  background: #fff;
  border-radius: 6px;
  border-left: 3px solid #f5a623;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 28px;
}

.form-item-wide {
  grid-column: span 2;
}

.form-item {
  min-width: 0;

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #363636;
  }

  .input-unit-row {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    :deep(.field) {
      flex: 1;
      min-width: 0;
      margin-bottom: 0;
    }

    :deep(.control) {
      width: 100%;
    }

    :deep(.input) {
      width: 100%;
      height: 32px;
      font-size: 0.875rem;
      border-radius: 4px;
    }

    .unit-text {
      flex-shrink: 0;
      white-space: nowrap;
      font-size: 13px;
      font-weight: 600;
      color: #888;
      line-height: 32px;
    }

    .unit-toggle {
      display: flex;
      flex-shrink: 0;
      height: 32px;
      border: 1px solid #dbdbdb;
      border-radius: 6px;
      overflow: hidden;
      background: #fafafa;
    }

    .unit-toggle-btn {
      min-width: 36px;
      padding: 0 10px;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 600;
      color: #888;
      cursor: pointer;
      transition: all 0.2s;

      &:not(:last-child) {
        border-right: 1px solid #dbdbdb;
      }

      &:hover {
        color: #20bc56;
      }

      &.active {
        background: #e8f8ee;
        color: #148f42;
      }
    }
  }
}

.combined-total {
  margin-top: 8px;
  font-size: 14px;
  color: #666;

  strong {
    color: #148f42;
    font-size: 16px;
  }
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-chip {
  padding: 4px 12px;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #20bc56;
    color: #20bc56;
  }

  &.active {
    background: #e8f8ee;
    border-color: #20bc56;
    color: #148f42;
    font-weight: 600;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.mode-group {
  display: flex;
  gap: 12px;
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 32px;
  font-size: 13px;
  color: #666;
  background: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #20bc56;
    color: #20bc56;
  }

  &.active {
    background: #e8f8ee;
    border-color: #20bc56;
    color: #148f42;
    font-weight: 600;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.remark-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.6;
  color: #888;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #2095f2;

  i {
    margin-top: 3px;
    color: #2095f2;
  }
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.summary-card {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
  border: 1px solid #eee;
  border-radius: 8px;

  &.highlight {
    background: linear-gradient(135deg, #e8f8ee 0%, #fff 100%);
    border-color: #b8e6c8;
  }

  &.saved {
    background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
    border-color: #f5c6cb;
  }

  .card-label {
    font-size: 13px;
    color: #888;
    margin-bottom: 6px;
  }

  .card-value {
    font-size: 20px;
    font-weight: 700;
    color: #363636;
    word-break: break-all;

    &.accent {
      color: #f14668;
    }
  }

  .card-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #aaa;
  }
}

.combined-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;

  .combined-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;

    .label {
      color: #888;
    }

    .value {
      font-weight: 700;
      font-family: Consolas, Monaco, monospace;

      &.fund {
        color: #20bc56;
      }

      &.commercial {
        color: #2095f2;
      }
    }
  }
}

.chart-section {
  margin-bottom: 24px;
}

.chart-box {
  width: 100%;
  height: 280px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
}

.pass-operate {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;

  .btns {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.result-section {
  margin-top: 8px;
}

.table-wrap {
  max-height: 480px;
  overflow: auto;
  border: 1px solid #eee;
  border-radius: 8px;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c8c8c8;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
}

.loan-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 10px 8px;
    text-align: center;
    border-bottom: 1px solid #eee;
    white-space: nowrap;
  }

  thead {
    position: sticky;
    top: 0;
    z-index: 1;

    th {
      background: #f0f2f5;
      font-weight: 600;
      color: #363636;
    }
  }

  tbody tr:hover:not(.row-total) {
    background: #f8fdf9;
  }

  .row-total {
    font-weight: 700;
    background: #e8f8ee;

    td {
      color: #148f42;
    }
  }

  .row-prepay {
    background: #fff8e6;
  }

  .row-payoff {
    background: #ffe8e8;
    font-weight: 600;
  }

  .prepay-tag {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    color: #f5a623;
    white-space: normal;
  }

  .num {
    font-family: Consolas, Monaco, 'Courier New', monospace;
  }

  .interest {
    color: #f14668;
  }

  .fund {
    color: #20bc56;
  }

  .commercial {
    color: #2095f2;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 20px;
  color: #aaa;

  i {
    font-size: 32px;
    color: #f5a623;
  }
}

.sidebar-column {
  min-width: 0;
}

@media screen and (max-width: 1024px) {
  .summary-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .loan-panel {
    padding: 20px 16px;
  }

  .loan-type-tabs {
    flex-direction: column;
  }

  .form-grid,
  .prepay-grid {
    grid-template-columns: 1fr;
  }

  .form-item-wide {
    grid-column: span 1;
  }

  .summary-section {
    grid-template-columns: 1fr;
  }

  .combined-summary {
    flex-direction: column;
    gap: 8px;
  }

  .pass-operate .btns {
    width: 100%;
    justify-content: stretch;

    :deep(.button) {
      flex: 1;
    }
  }
}
</style>
