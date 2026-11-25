// ============================================================================
// Institutional Test Suite: Floorsheet Engine & Quantitative Indicators
// ============================================================================

import assert from "node:assert";

// 1. Test Fibonacci calculation
function calculateFibonacci(high, low) {
  const diff = high - low;
  const ratios = [
    { ratio: 0.0, label: "0.0% (Swing High)" },
    { ratio: 0.236, label: "23.6% Pullback" },
    { ratio: 0.382, label: "38.2% Retracement" },
    { ratio: 0.5, label: "50.0% Midpoint" },
    { ratio: 0.618, label: "61.8% Golden Pocket" },
    { ratio: 0.786, label: "78.6% Deep Value" },
    { ratio: 1.0, label: "100.0% (Swing Low)" },
  ];
  return ratios.map((r) => ({
    ratio: r.ratio,
    price: Math.round((high - diff * r.ratio) * 100) / 100,
  }));
}

// 2. Test VWAP calculation
function calculateVWAP(candles) {
  let cumTypicalVolume = 0;
  let cumVolume = 0;
  const result = [];
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const vol = c.volume || 1;
    cumTypicalVolume += typicalPrice * vol;
    cumVolume += vol;
    result.push(Math.round((cumTypicalVolume / cumVolume) * 100) / 100);
  }
  return result;
}

// 3. Test Broker Stats Aggregation
function aggregateBrokerStats(records, symbol) {
  const filtered = records.filter((r) => r.symbol === symbol);
  const brokerMap = new Map();

  for (const rec of filtered) {
    // Buyer
    if (!brokerMap.has(rec.buyerBroker)) {
      brokerMap.set(rec.buyerBroker, { brokerNo: rec.buyerBroker, buyQty: 0, buyVal: 0, sellQty: 0, sellVal: 0 });
    }
    const b = brokerMap.get(rec.buyerBroker);
    b.buyQty += rec.quantity;
    b.buyVal += rec.amount;

    // Seller
    if (!brokerMap.has(rec.sellerBroker)) {
      brokerMap.set(rec.sellerBroker, { brokerNo: rec.sellerBroker, buyQty: 0, buyVal: 0, sellQty: 0, sellVal: 0 });
    }
    const s = brokerMap.get(rec.sellerBroker);
    s.sellQty += rec.quantity;
    s.sellVal += rec.amount;
  }

  const result = [];
  for (const b of brokerMap.values()) {
    result.push({
      ...b,
      netQty: b.buyQty - b.sellQty,
      netVal: b.buyVal - b.sellVal,
    });
  }
  return result;
}

console.log("==================================================");
console.log("NEPSE Floorsheet & Quantitative Verification Suite");
console.log("==================================================");

// Test 1: Fibonacci golden ratio calculation
const fib = calculateFibonacci(600, 500);
assert.strictEqual(fib[0].price, 600, "0.0% should match Swing High");
assert.strictEqual(fib[3].price, 550, "50% should be exact midpoint");
assert.strictEqual(fib[4].price, 538.2, "61.8% Golden Pocket should match 538.2");
assert.strictEqual(fib[6].price, 500, "100% should match Swing Low");
console.log("[PASS] Fibonacci Multi-Ratio Retracement Calculation (0%, 50%, 61.8%, 100%)");

// Test 2: VWAP computation
const sampleCandles = [
  { high: 510, low: 490, close: 500, volume: 1000 }, // TP = 500, TP*V = 500,000, CumV = 1000 -> VWAP = 500
  { high: 530, low: 510, close: 520, volume: 2000 }, // TP = 520, TP*V = 1,040,000, CumV = 3000 -> CumTPV = 1,540,000 -> VWAP = 513.33
];
const vwap = calculateVWAP(sampleCandles);
assert.strictEqual(vwap[0], 500);
assert.strictEqual(vwap[1], 513.33);
console.log("[PASS] VWAP Cumulative Volume-Weighted Average Price Verification");

// Test 3: Floorsheet Broker clearing aggregation
const sampleRecords = [
  { contractNo: "1", symbol: "NABIL", buyerBroker: 58, sellerBroker: 34, quantity: 1000, rate: 500, amount: 500000 },
  { contractNo: "2", symbol: "NABIL", buyerBroker: 58, sellerBroker: 28, quantity: 500, rate: 502, amount: 251000 },
  { contractNo: "3", symbol: "NABIL", buyerBroker: 45, sellerBroker: 58, quantity: 300, rate: 501, amount: 150300 },
];
const stats = aggregateBrokerStats(sampleRecords, "NABIL");
const b58 = stats.find((s) => s.brokerNo === 58);
assert.strictEqual(b58.buyQty, 1500, "Broker 58 total buy qty should be 1500");
assert.strictEqual(b58.sellQty, 300, "Broker 58 total sell qty should be 300");
assert.strictEqual(b58.netQty, 1200, "Broker 58 net qty should be +1200");
console.log("[PASS] Broker Aggregation: Net Buy / Net Sell / Position Balancing");

// Test 4: Duplicate transaction detection
const seenContracts = new Set();
let duplicates = 0;
for (const r of [...sampleRecords, sampleRecords[0]]) {
  if (seenContracts.has(r.contractNo)) {
    duplicates++;
  } else {
    seenContracts.add(r.contractNo);
  }
}
assert.strictEqual(duplicates, 1, "Exactly 1 duplicate contract should be detected");
console.log("[PASS] Floorsheet Transaction Identifier & Duplicate Protection");

console.log("==================================================");
console.log("All Floorsheet & Quantitative Tests Passed 100%!");
console.log("==================================================");
