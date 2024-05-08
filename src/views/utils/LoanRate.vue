<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/loan-rate`" pageTitle="贷款利率计算器"></Navbar>
    </div>

    <div class="content-box">
      <div class="container">
        <div class="columns">
          <div class="column bg-white is-three-quarters" ref="loan-rate">
            <div class="section-box">
              <div class="section-item">
                <b-field label="贷款本金：">
                  <b-input v-model="money" placeholder="请输入贷款本金"></b-input>
                  <p class="control text-black">
                    元
                  </p>
                </b-field>

                <b-field label="贷款期限：" class="clear-top">
                  <b-input v-model="months" placeholder="请输入贷款期限"></b-input>
                  <p class="control text-black">
                    月
                  </p>
                </b-field>
              </div>

              <div class="section-item">
                <b-field label="年化利率：">
                  <b-input v-model="yearRate" placeholder="请输入年化利率"></b-input>
                  <p class="control text-black">
                    %
                  </p>
                </b-field>

                <b-field label="还款方式：" class="clear-top">
                  <b-select placeholder="请选择还款方式" v-model="paybackMode" @input="handleChangePaybackMode">
                    <option :value="1">等额本息</option>
                    <option :value="2">等额本金</option>
                  </b-select>
                  <p class="control text-black"></p>
                </b-field>
              </div>
            </div>

            <div class="remark-box">
              <p class="text-gray">
                <i class="fas fa-info-circle"></i>
                <span>
                 {{ remark }}
                </span>
              </p>
            </div>

            <div class="pass-operate">
              <div class="btns">
                <b-button type="is-success" icon-pack="fas" icon-left="unlock" @click="getLoanRate">计算</b-button>
                <b-button type="is-warning" icon-pack="fas" icon-left="download" :loading="downloadStatus" @click="downloadLoanRateData">下载</b-button>
              </div>
            </div>

            <div class="pass-result mt20">
              <b-field label="推演结果：">
                <table class="table is-bordered is-narrow is-hoverable">
                  <thead>
                  <tr>
                    <th rowspan="2">期数</th>
                    <th rowspan="2">月供金额</th>
                    <th colspan="2">月供拆解</th>
                    <th colspan="2">累计还款</th>
                    <th colspan="2">剩余月供</th>
                  </tr>
                  <tr>
                    <th>本金</th>
                    <th>利息</th>
                    <th>本金</th>
                    <th>利息</th>
                    <th>本金</th>
                    <th>利息</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr class="x-all">
                    <td class="x-name">合计</td>
                    <td class="x-bill">{{ totalPayment }}</td>
                    <td class="x-amount">{{ totalPrincipal }}</td>
                    <td class="x-interest">{{ totalInterest }}</td>
                    <td class="x-total">-</td>
                    <td class="x-total">-</td>
                    <td class="x-left">{{ totalPrincipal }}</td>
                    <td class="x-left">{{ totalInterest }}</td>
                  </tr>
                  <tr class="" v-for="(item, index) in list" :key="index">
                    <td class="x-name">{{ item.month }}</td>
                    <td class="x-bill">{{ item.payment }}</td>
                    <td class="x-amount">{{ item.principal }}</td>
                    <td class="x-interest">{{ item.interest }}</td>
                    <td class="x-total">{{ item.repaymentPrincipal }}</td>
                    <td class="x-total">{{ item.repaymentInterest }}</td>
                    <td class="x-left">{{ item.remainingPrincipal }}</td>
                    <td class="x-left">{{ (totalInterest - item.repaymentInterest) < 0.1 ? 0.00 : (totalInterest - item.repaymentInterest).toFixed(2) }}</td>
                  </tr>
                  </tbody>
                </table>
              </b-field>
            </div>

          </div>
          <div class="column">
            <Sidebar/>
          </div>
        </div>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"></back-top>
    </div>
    <div id="footer">
      <Footer/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'
import {calculateEqualInstallment, calculatePrincipalInstallment} from "@/utils/helper"
import html2canvas from "html2canvas";

Vue.use(BackTop)
export default {
  name: 'LoanRate',
  components: {
    Navbar,
    Sidebar,
    Footer
  },
  data() {
    return {
      money: 10000,
      months: 12,
      yearRate: 24,
      paybackMode: 1,
      downloadStatus: false,
      remark: '等额本息：月供=贷款本金×[年化利率÷12×(1+年化利率÷12) ^ 还款月数]÷{[(1+年化利率÷12) ^ 还款月数]-1}',
      list: [],
    }
  },
  computed: {
    totalPayment() {
      let result = this.list.reduce((a, b) => {
        return a + Number(b.payment || 0)
      }, 0)
      return result.toFixed(2)
    },
    totalPrincipal() {
      let result = this.money
      return Number(result).toFixed(2)
    },
    totalInterest() {
      let totalPayment = this.list.reduce((a, b) => {
        return a + Number(b.payment || 0)
      }, 0)
      let totalPrincipal = this.money
      let result = (totalPayment - totalPrincipal)
      return result.toFixed(2)
    },
  },
  created() {
    this.getLoanRate()
  },
  methods: {
    async getLoanRate() {
      let data = []
      if (this.paybackMode === 1) {
        data = calculateEqualInstallment(this.money, this.yearRate, this.months / 12)
      } else if (this.paybackMode === 2) {
        data = calculatePrincipalInstallment(this.money, this.yearRate, this.months / 12)
      }
      this.list = data
    },
    handleChangePaybackMode(val) {
      if (val === 1) {
        this.remark = '等额本息：月供=贷款本金×[年化利率÷12×(1+年化利率÷12) ^ 还款月数]÷{[(1+年化利率÷12) ^ 还款月数]-1}'
        this.getLoanRate()
      } else if (val === 2) {
        this.remark = '等额本金：月供=贷款本金÷还款月数x(1+年化利率÷12x剩余还款期数)'
        this.getLoanRate()
      }
    },
    downloadLoanRateData() {
      this.downloadStatus = true
      let dom = this.$refs['loan-rate']
      html2canvas(dom, {
        allowTaint: true,
        taintTest: true,
        scale: 2,
        // useCORS: true,
      }).then((canvas) => {
        this.downloadImgUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = this.downloadImgUrl
        link.download = 'loan.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        this.$buefy.snackbar.open({
          duration: 3000,
          message: '还款表格图片下载成功！',
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
        this.downloadStatus = false
      }).catch(() => {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: '还款表格图片下载失败！',
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
        this.downloadStatus = false
      })
    },
  }
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
  margin-top: 12px;
  background-color: #FFFFFF;
  margin-bottom: 200px;
}

.section-box {
  .section-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 60px;

    .clear-top {
      margin-top: -1%;
    }

    .text-black {
      margin-left: 10px;
      font-size: 1rem;
      font-weight: 600;
      color: #aaa;
      margin-top: 2%;
    }
  }
}

.remark-box {
  .text-gray {
    font-size: 14px;
    color: #c6c3c3;
  }
}

.pass-operate {
  margin-top: 60px;
  display: flex;
  justify-content: flex-start;

  .btns {
    button {
      &:not(:first-child) {
        margin-left: 20px;
      }
    }
  }
}

.pass-result {
  table {
    width: 100%;
  }
}

.mt20 {
  margin-top: 20px;
}

/deep/ .field {
  .label {
    margin-top: 2%;
  }
}
</style>
  