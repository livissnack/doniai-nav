/**
 * 贷款还款计划计算（商业 / 公积金 / 组合贷 / 提前还款）
 */

function round2(n) {
  return Number(n.toFixed(2))
}

function monthlyRate(annualRate) {
  return annualRate / 100 / 12
}

/** 等额本息还款计划 */
export function buildEqualInstallmentSchedule(loanAmount, annualRate, totalMonths) {
  const amount = Number(loanAmount)
  const months = Math.round(totalMonths)
  if (!amount || amount <= 0 || !months || months <= 0) return []

  const r = monthlyRate(annualRate)
  const payment =
    r === 0
      ? amount / months
      : (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)

  let balance = amount
  let cumPrincipal = 0
  let cumInterest = 0
  const schedule = []

  for (let m = 1; m <= months && balance > 0.005; m++) {
    const interest = balance * r
    const principal = Math.min(payment - interest, balance)
    const actualPayment = principal + interest
    balance = Math.max(0, balance - principal)
    cumPrincipal += principal
    cumInterest += interest
    schedule.push({
      month: `第${m}期`,
      payment: round2(actualPayment).toFixed(2),
      principal: round2(principal).toFixed(2),
      interest: round2(interest).toFixed(2),
      repaymentPrincipal: round2(cumPrincipal).toFixed(2),
      repaymentInterest: round2(cumInterest).toFixed(2),
      remainingPrincipal: round2(balance).toFixed(2),
    })
  }
  return schedule
}

/** 等额本金还款计划 */
export function buildPrincipalInstallmentSchedule(loanAmount, annualRate, totalMonths) {
  const amount = Number(loanAmount)
  const months = Math.round(totalMonths)
  if (!amount || amount <= 0 || !months || months <= 0) return []

  const r = monthlyRate(annualRate)
  const monthlyPrincipal = amount / months
  let paidPrincipal = 0
  let paidInterest = 0
  const schedule = []

  for (let m = 1; m <= months; m++) {
    const interest = (amount - paidPrincipal) * r
    const payment = monthlyPrincipal + interest
    paidPrincipal += monthlyPrincipal
    paidInterest += interest
    schedule.push({
      month: `第${m}期`,
      payment: round2(payment).toFixed(2),
      principal: round2(monthlyPrincipal).toFixed(2),
      interest: round2(interest).toFixed(2),
      repaymentPrincipal: round2(paidPrincipal).toFixed(2),
      repaymentInterest: round2(paidInterest).toFixed(2),
      remainingPrincipal: round2(Math.max(0, amount - paidPrincipal)).toFixed(2),
    })
  }
  return schedule
}

export function buildSchedule(loanAmount, annualRate, totalMonths, paybackMode) {
  return paybackMode === 1
    ? buildEqualInstallmentSchedule(loanAmount, annualRate, totalMonths)
    : buildPrincipalInstallmentSchedule(loanAmount, annualRate, totalMonths)
}

function emptyPeriod(month) {
  return {
    month: `第${month}期`,
    payment: '0.00',
    principal: '0.00',
    interest: '0.00',
    repaymentPrincipal: '0.00',
    repaymentInterest: '0.00',
    remainingPrincipal: '0.00',
  }
}

/** 合并公积金 + 商贷还款计划 */
export function mergeLoanSchedules(fundSchedule, commercialSchedule) {
  const len = Math.max(fundSchedule.length, commercialSchedule.length)
  const merged = []
  let cumPrincipal = 0
  let cumInterest = 0

  for (let i = 0; i < len; i++) {
    const fund = fundSchedule[i] || emptyPeriod(i + 1)
    const commercial = commercialSchedule[i] || emptyPeriod(i + 1)
    const payment = Number(fund.payment) + Number(commercial.payment)
    const principal = Number(fund.principal) + Number(commercial.principal)
    const interest = Number(fund.interest) + Number(commercial.interest)
    cumPrincipal += principal
    cumInterest += interest
    const remainingPrincipal =
      Number(fund.remainingPrincipal) + Number(commercial.remainingPrincipal)

    merged.push({
      month: `第${i + 1}期`,
      payment: round2(payment).toFixed(2),
      principal: round2(principal).toFixed(2),
      interest: round2(interest).toFixed(2),
      repaymentPrincipal: round2(cumPrincipal).toFixed(2),
      repaymentInterest: round2(cumInterest).toFixed(2),
      remainingPrincipal: round2(remainingPrincipal).toFixed(2),
      fundPayment: fund.payment,
      commercialPayment: commercial.payment,
      fundPrincipal: fund.principal,
      commercialPrincipal: commercial.principal,
      fundInterest: fund.interest,
      commercialInterest: commercial.interest,
      fundRemaining: fund.remainingPrincipal,
      commercialRemaining: commercial.remainingPrincipal,
    })
  }
  return merged
}

function reindexSchedule(rows, startMonth, cumPrincipal, cumInterest) {
  let cp = cumPrincipal
  let ci = cumInterest
  return rows.map((row, idx) => {
    cp += Number(row.principal)
    ci += Number(row.interest)
    return {
      ...row,
      month: `第${startMonth + idx}期`,
      repaymentPrincipal: round2(cp).toFixed(2),
      repaymentInterest: round2(ci).toFixed(2),
    }
  })
}

function continueEqualShorten(balance, monthlyPayment, annualRate) {
  const r = monthlyRate(annualRate)
  const rows = []
  let b = balance
  while (b > 0.005) {
    const interest = b * r
    const principal = Math.min(monthlyPayment - interest, b)
    const payment = principal + interest
    b = Math.max(0, b - principal)
    rows.push({
      payment: round2(payment).toFixed(2),
      principal: round2(principal).toFixed(2),
      interest: round2(interest).toFixed(2),
      remainingPrincipal: round2(b).toFixed(2),
    })
  }
  return rows
}

function continueEqualReduce(balance, annualRate, remainingMonths) {
  return buildEqualInstallmentSchedule(balance, annualRate, remainingMonths).map((row) => ({
    payment: row.payment,
    principal: row.principal,
    interest: row.interest,
    remainingPrincipal: row.remainingPrincipal,
  }))
}

function continuePrincipalShorten(balance, monthlyPrincipal, annualRate) {
  const r = monthlyRate(annualRate)
  const rows = []
  let b = balance
  while (b > 0.005) {
    const interest = b * r
    const principal = Math.min(monthlyPrincipal, b)
    const payment = principal + interest
    b = Math.max(0, b - principal)
    rows.push({
      payment: round2(payment).toFixed(2),
      principal: round2(principal).toFixed(2),
      interest: round2(interest).toFixed(2),
      remainingPrincipal: round2(b).toFixed(2),
    })
  }
  return rows
}

function continuePrincipalReduce(balance, annualRate, remainingMonths) {
  return buildPrincipalInstallmentSchedule(balance, annualRate, remainingMonths).map((row) => ({
    payment: row.payment,
    principal: row.principal,
    interest: row.interest,
    remainingPrincipal: row.remainingPrincipal,
  }))
}

function buildContinuation({
  balance,
  annualRate,
  paybackMode,
  strategy,
  originalSchedule,
  prepayMonth,
  totalMonths,
}) {
  if (balance <= 0.005) return []

  if (paybackMode === 1) {
    const monthlyPayment = Number(originalSchedule[0]?.payment || 0)
    return strategy === 'shorten'
      ? continueEqualShorten(balance, monthlyPayment, annualRate)
      : continueEqualReduce(balance, annualRate, totalMonths - prepayMonth)
  }

  const monthlyPrincipal = Number(originalSchedule[0]?.principal || 0)
  return strategy === 'shorten'
    ? continuePrincipalShorten(balance, monthlyPrincipal, annualRate)
    : continuePrincipalReduce(balance, annualRate, totalMonths - prepayMonth)
}

function totalInterestOf(schedule, totalPrincipal) {
  const payment = schedule.reduce((s, row) => s + Number(row.payment || 0), 0)
  return Math.max(0, payment - totalPrincipal)
}

function applyPrepayToSingleSchedule(schedule, options) {
  const {
    prepayMonth,
    prepayAmount,
    fullPayoff,
    strategy,
    paybackMode,
    annualRate,
    totalMonths,
  } = options

  if (!schedule.length || prepayMonth < 1 || prepayMonth > schedule.length) {
    return { schedule, savedInterest: 0 }
  }

  const before = schedule.slice(0, prepayMonth)
  const current = { ...schedule[prepayMonth - 1] }
  let remaining = Number(current.remainingPrincipal)

  const cumP = Number(before[before.length - 1]?.repaymentPrincipal || 0)
  const cumI = Number(before[before.length - 1]?.repaymentInterest || 0)
  const originalPrincipal = Number(schedule[schedule.length - 1]?.repaymentPrincipal || 0)
  const baselineInterest = totalInterestOf(schedule, originalPrincipal)

  if (fullPayoff || prepayAmount >= remaining - 0.01) {
    const payoffRow = {
      month: `第${prepayMonth}期后（提前结清）`,
      payment: round2(remaining).toFixed(2),
      principal: round2(remaining).toFixed(2),
      interest: '0.00',
      repaymentPrincipal: round2(cumP + remaining).toFixed(2),
      repaymentInterest: round2(cumI).toFixed(2),
      remainingPrincipal: '0.00',
      isPrepay: true,
      isPayoff: true,
      prepayNote: `结清剩余 ${round2(remaining).toFixed(2)} 元`,
    }
    const result = [...before, payoffRow]
    return {
      schedule: result,
      savedInterest: round2(baselineInterest - totalInterestOf(result, originalPrincipal)),
    }
  }

  const newBalance = remaining - prepayAmount
  const markedRow = {
    ...current,
    isPrepay: true,
    prepayNote: `提前还款 ${round2(prepayAmount).toFixed(2)} 元`,
  }

  const continuation = buildContinuation({
    balance: newBalance,
    annualRate,
    paybackMode,
    strategy,
    originalSchedule: schedule,
    prepayMonth,
    totalMonths,
  })

  const tail = reindexSchedule(continuation, prepayMonth + 1, cumP, cumI)
  const result = [...before.slice(0, -1), markedRow, ...tail]
  return {
    schedule: result,
    savedInterest: round2(baselineInterest - totalInterestOf(result, originalPrincipal)),
  }
}

/** 组合贷提前还款：按剩余本金比例分摊到公积金与商贷 */
function applyPrepayToCombinedSchedule(fundSchedule, commercialSchedule, options) {
  const merged = mergeLoanSchedules(fundSchedule, commercialSchedule)
  const { prepayMonth, prepayAmount, fullPayoff, strategy, paybackMode, totalMonths } = options

  if (!merged.length || prepayMonth < 1 || prepayMonth > merged.length) {
    return { schedule: merged, savedInterest: 0 }
  }

  const row = merged[prepayMonth - 1]
  const fundRemaining = Number(row.fundRemaining)
  const commercialRemaining = Number(row.commercialRemaining)
  const totalRemaining = fundRemaining + commercialRemaining
  const originalPrincipal =
    Number(fundSchedule[fundSchedule.length - 1]?.repaymentPrincipal || 0) +
    Number(commercialSchedule[commercialSchedule.length - 1]?.repaymentPrincipal || 0)
  const baselineInterest = totalInterestOf(merged, originalPrincipal)

  if (totalRemaining <= 0.005) {
    return { schedule: merged, savedInterest: 0 }
  }

  let fundPrepay = prepayAmount
  let commercialPrepay = 0
  if (!fullPayoff && prepayAmount < totalRemaining - 0.01) {
    fundPrepay = prepayAmount * (fundRemaining / totalRemaining)
    commercialPrepay = prepayAmount - fundPrepay
  } else {
    fundPrepay = fundRemaining
    commercialPrepay = commercialRemaining
  }

  const fundResult = applyPrepayToSingleSchedule(fundSchedule, {
    prepayMonth,
    prepayAmount: fundPrepay,
    fullPayoff: fullPayoff || fundPrepay >= fundRemaining - 0.01,
    strategy,
    paybackMode,
    annualRate: options.fundRate,
    totalMonths,
  })
  const commercialResult = applyPrepayToSingleSchedule(commercialSchedule, {
    prepayMonth,
    prepayAmount: commercialPrepay,
    fullPayoff: fullPayoff || commercialPrepay >= commercialRemaining - 0.01,
    strategy,
    paybackMode,
    annualRate: options.commercialRate,
    totalMonths,
  })

  const result = mergeLoanSchedules(fundResult.schedule, commercialResult.schedule)
  for (let i = 0; i < result.length; i++) {
    const fundRow = fundResult.schedule[i]
    const commercialRow = commercialResult.schedule[i]
    if (fundRow?.isPrepay || commercialRow?.isPrepay) {
      result[i].isPrepay = true
      if (fundRow?.prepayNote || commercialRow?.prepayNote) {
        result[i].prepayNote = [fundRow?.prepayNote, commercialRow?.prepayNote]
          .filter(Boolean)
          .join('；')
      }
      if (fundRow?.isPayoff || commercialRow?.isPayoff) {
        result[i].isPayoff = true
      }
    }
  }

  return {
    schedule: result,
    savedInterest: round2(baselineInterest - totalInterestOf(result, originalPrincipal)),
  }
}

export function applyEarlyRepayment(baseSchedule, options) {
  if (!options.prepayEnabled) {
    return { schedule: baseSchedule, savedInterest: 0 }
  }

  if (options.loanType === 'combined') {
    return applyPrepayToCombinedSchedule(
      options.fundSchedule,
      options.commercialSchedule,
      options,
    )
  }

  return applyPrepayToSingleSchedule(baseSchedule, options)
}

export function calculateLoanPlan(params) {
  const {
    loanType,
    paybackMode,
    months,
    money,
    yearRate,
    fundMoney,
    commercialMoney,
    fundRate,
    commercialRate,
    prepayEnabled,
    prepayMonth,
    prepayAmount,
    prepayFull,
    prepayStrategy,
  } = params

  let baseSchedule = []
  let fundSchedule = []
  let commercialSchedule = []
  let totalPrincipal = 0

  if (loanType === 'combined') {
    fundSchedule = buildSchedule(fundMoney, fundRate, months, paybackMode)
    commercialSchedule = buildSchedule(commercialMoney, commercialRate, months, paybackMode)
    baseSchedule = mergeLoanSchedules(fundSchedule, commercialSchedule)
    totalPrincipal = Number(fundMoney) + Number(commercialMoney)
  } else {
    const amount = Number(money)
    const rate = loanType === 'fund' ? fundRate : yearRate
    baseSchedule = buildSchedule(amount, rate, months, paybackMode)
    totalPrincipal = amount
  }

  const prepayOptions = {
    loanType,
    prepayEnabled,
    prepayMonth: Number(prepayMonth),
    prepayAmount: Number(prepayAmount),
    fullPayoff: prepayFull,
    strategy: prepayStrategy,
    paybackMode,
    annualRate: loanType === 'fund' ? fundRate : yearRate,
    fundRate,
    commercialRate,
    totalMonths: months,
    fundSchedule,
    commercialSchedule,
  }

  const { schedule, savedInterest } = applyEarlyRepayment(baseSchedule, prepayOptions)

  return {
    baselineList: baseSchedule,
    list: schedule,
    savedInterest,
    totalPrincipal,
  }
}
