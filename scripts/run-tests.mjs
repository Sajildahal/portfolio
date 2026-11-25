// ============================================================================
// NEPSE Financial & Quantitative Engine Automated Test Suite
// ============================================================================

import assert from "node:assert";

// Mock or inline essential fee engine logic for isolated runner
const DEFAULT_FEE_SCHEDULE = {
  effectiveDate: "2024-01-01",
  sebonFeeRate: 0.00015,
  dpFee: 25.0,
  slabs: [
    { maxAmount: 50000, rate: 0.004 },
    { maxAmount: 500000, rate: 0.0037 },
    { maxAmount: 2000000, rate: 0.0034 },
    { maxAmount: 10000000, rate: 0.003 },
    { maxAmount: Infinity, rate: 0.0027 },
  ],
  cgtShortTermRate: 0.075,
  cgtLongTermRate: 0.05,
};

function getBrokerCommissionRate(grossAmount) {
  for (const slab of DEFAULT_FEE_SCHEDULE.slabs) {
    if (grossAmount <= slab.maxAmount) return slab.rate;
  }
  return 0.0027;
}

function calculateBrokerCommission(grossAmount) {
  if (grossAmount <= 0) return { amount: 0, rate: 0 };
  const rate = getBrokerCommissionRate(grossAmount);
  return {
    amount: Math.max(10.0, Math.round(grossAmount * rate * 100) / 100),
    rate,
  };
}

function calculateBuy(symbol, quantity, purchasePrice) {
  const grossAmount = quantity * purchasePrice;
  const { amount: brokerCommission } = calculateBrokerCommission(grossAmount);
  const sebonFee = Math.round(grossAmount * DEFAULT_FEE_SCHEDULE.sebonFeeRate * 100) / 100;
  const dpFee = quantity > 0 ? DEFAULT_FEE_SCHEDULE.dpFee : 0;
  const totalCharges = brokerCommission + sebonFee + dpFee;
  const totalPayable = grossAmount + totalCharges;
  const effectiveCostPerShare = Math.round((totalPayable / quantity) * 100) / 100;

  return { grossAmount, brokerCommission, sebonFee, dpFee, totalCharges, totalPayable, effectiveCostPerShare };
}

function calculateSell(symbol, quantity, sellingPrice, purchaseWacc, holdingDays = 100, isIndividual = true) {
  const grossAmount = quantity * sellingPrice;
  const { amount: brokerCommission } = calculateBrokerCommission(grossAmount);
  const sebonFee = Math.round(grossAmount * DEFAULT_FEE_SCHEDULE.sebonFeeRate * 100) / 100;
  const dpFee = quantity > 0 ? DEFAULT_FEE_SCHEDULE.dpFee : 0;
  const transactionCharges = brokerCommission + sebonFee + dpFee;
  const netReceivablePreTax = grossAmount - transactionCharges;
  const totalCostBasis = quantity * purchaseWacc;
  const capitalGain = Math.max(0, netReceivablePreTax - totalCostBasis);

  const cgtRate = capitalGain > 0 ? (isIndividual ? (holdingDays >= 365 ? 0.05 : 0.075) : 0.1) : 0;
  const cgtAmount = Math.round(capitalGain * cgtRate * 100) / 100;
  const totalCharges = transactionCharges + cgtAmount;
  const netReceivable = Math.round((grossAmount - totalCharges) * 100) / 100;
  const netProfitLoss = Math.round((netReceivable - totalCostBasis) * 100) / 100;

  return { grossAmount, brokerCommission, sebonFee, dpFee, capitalGain, cgtAmount, totalCharges, netReceivable, netProfitLoss };
}

function calculateBreakEvenPrice(waccPerShare, quantity) {
  const targetTotalCost = waccPerShare * quantity;
  let estimatedPrice = waccPerShare * 1.008;
  for (let i = 0; i < 5; i++) {
    const gross = estimatedPrice * quantity;
    const rate = getBrokerCommissionRate(gross);
    const denominator = 1 - rate - DEFAULT_FEE_SCHEDULE.sebonFeeRate;
    estimatedPrice = (targetTotalCost + DEFAULT_FEE_SCHEDULE.dpFee) / (quantity * denominator);
  }
  return Math.round(estimatedPrice * 100) / 100;
}

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

console.log("=================================================");
console.log("NEPSE Financial & Quantitative Test Suite Running");
console.log("=================================================");

// 1. Broker Commission Slabs
test("Broker Commission Slab 1 (<= NPR 50,000 is 0.40%)", () => {
  const res = calculateBrokerCommission(40000);
  assert.strictEqual(res.rate, 0.004);
  assert.strictEqual(res.amount, 160.0);
});

test("Broker Commission Minimum Fee Rule (NPR 10 minimum)", () => {
  const res = calculateBrokerCommission(1000);
  assert.strictEqual(res.amount, 10.0); // 1000 * 0.004 = 4, but min is 10
});

test("Broker Commission Slab 2 (NPR 50,001 to 500,000 is 0.37%)", () => {
  const res = calculateBrokerCommission(100000);
  assert.strictEqual(res.rate, 0.0037);
  assert.strictEqual(res.amount, 370.0);
});

test("Broker Commission Slab 3 (NPR 500,001 to 2,000,000 is 0.34%)", () => {
  const res = calculateBrokerCommission(1000000);
  assert.strictEqual(res.rate, 0.0034);
  assert.strictEqual(res.amount, 3400.0);
});

test("Broker Commission Slab 4 (NPR 2,000,001 to 10,000,000 is 0.30%)", () => {
  const res = calculateBrokerCommission(3000000);
  assert.strictEqual(res.rate, 0.003);
  assert.strictEqual(res.amount, 9000.0);
});

test("Broker Commission Slab 5 (> NPR 10,000,000 is 0.27%)", () => {
  const res = calculateBrokerCommission(15000000);
  assert.strictEqual(res.rate, 0.0027);
  assert.strictEqual(res.amount, 40500.0);
});

// 2. Buy Calculation
test("Buy Calculation: NABIL 100 shares @ NPR 500", () => {
  const buy = calculateBuy("NABIL", 100, 500);
  assert.strictEqual(buy.grossAmount, 50000);
  assert.strictEqual(buy.brokerCommission, 200); // 50,000 * 0.40%
  assert.strictEqual(buy.sebonFee, 7.5); // 50,000 * 0.015%
  assert.strictEqual(buy.dpFee, 25);
  assert.strictEqual(buy.totalCharges, 232.5);
  assert.strictEqual(buy.totalPayable, 50232.5);
  assert.strictEqual(buy.effectiveCostPerShare, 502.33);
});

// 3. Sell Calculation with CGT
test("Sell Calculation: Short-Term Individual (< 365 days, 7.5% CGT)", () => {
  const sell = calculateSell("NABIL", 100, 600, 500, 120, true);
  assert.strictEqual(sell.grossAmount, 60000);
  assert.strictEqual(sell.brokerCommission, 222); // 60,000 * 0.37% = 222
  assert.strictEqual(sell.sebonFee, 9.0); // 60,000 * 0.015%
  assert.strictEqual(sell.dpFee, 25);
  // Net receivable pre tax = 60000 - 256 = 59744
  // Cost basis = 100 * 500 = 50000
  // Capital gain = 9744
  assert.strictEqual(sell.capitalGain, 9744);
  // CGT @ 7.5% = 9744 * 0.075 = 730.8
  assert.strictEqual(sell.cgtAmount, 730.8);
  assert.strictEqual(sell.netReceivable, 59013.2);
  assert.strictEqual(sell.netProfitLoss, 9013.2);
});

test("Sell Calculation: Long-Term Individual (>= 365 days, 5.0% CGT)", () => {
  const sell = calculateSell("NABIL", 100, 600, 500, 400, true);
  assert.strictEqual(sell.capitalGain, 9744);
  // CGT @ 5.0% = 9744 * 0.05 = 487.2
  assert.strictEqual(sell.cgtAmount, 487.2);
  assert.strictEqual(sell.netReceivable, 59256.8);
});

test("Sell Calculation: Loss trade pays 0 CGT", () => {
  const sell = calculateSell("NABIL", 100, 450, 500, 100, true);
  assert.strictEqual(sell.capitalGain, 0);
  assert.strictEqual(sell.cgtAmount, 0);
  assert.ok(sell.netProfitLoss < 0);
});

// 4. Break-Even Price Calculation
test("Break-Even Price Validation", () => {
  const wacc = 502.33;
  const qty = 100;
  const breakEven = calculateBreakEvenPrice(wacc, qty);
  assert.ok(breakEven > wacc, "Break-even must be higher than purchase WACC to absorb exit fees");
  
  // Verify that selling at break-even produces ~0 net profit/loss
  const sellAtBE = calculateSell("NABIL", qty, breakEven, wacc, 50, true);
  assert.ok(Math.abs(sellAtBE.netProfitLoss) < 5.0, `Net P/L at break-even should be near zero, got ${sellAtBE.netProfitLoss}`);
});

console.log("=================================================");
console.log(`Results: ${passed} / ${total} Tests Passed Successfully`);
console.log("=================================================");

if (passed !== total) {
  process.exit(1);
}
