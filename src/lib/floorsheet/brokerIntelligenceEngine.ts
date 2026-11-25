// ============================================================================
// AI Broker Intelligence & Accumulation/Distribution Analysis Engine
// Quantitative broker concentration, net buying/selling pressure & pattern detection
// Strictly uses neutral non-defamatory institutional terminology
// ============================================================================

import { FloorsheetRecord, ScriptBrokerIntelligence, BrokerStats } from "@/types";
import { getBrokerName } from "./floorsheetEngine";

/**
 * Aggregates floorsheet records for a given symbol and computes broker intelligence
 */
export function analyzeBrokerIntelligenceForSymbol(
  symbol: string,
  records: FloorsheetRecord[]
): ScriptBrokerIntelligence {
  const stockRecords = records.filter((r) => r.symbol.toUpperCase() === symbol.toUpperCase());

  if (stockRecords.length === 0) {
    return {
      symbol,
      tradingDate: new Date().toISOString().split("T")[0],
      totalTurnover: 0,
      totalQuantity: 0,
      topBuyers: [],
      topSellers: [],
      netBuyerBrokers: [],
      netSellerBrokers: [],
      brokerConcentrationRatio: 0,
      brokerConcentrationLevel: "LOW",
      accumulationScore: 50,
      distributionScore: 50,
      buyingPressureScore: 50,
      sellingPressureScore: 50,
      signal: "INSUFFICIENT_EVIDENCE",
      aiInterpretation: "Data insufficient: No verified floorsheet transaction records available for this script.",
      supportingEvidence: ["No transaction records matched the queried symbol."],
      dataFreshness: new Date().toISOString(),
    };
  }

  const brokerMap = new Map<number, BrokerStats>();

  const getOrCreate = (brokerNo: number): BrokerStats => {
    if (!brokerMap.has(brokerNo)) {
      brokerMap.set(brokerNo, {
        brokerNo,
        brokerName: getBrokerName(brokerNo),
        buyQty: 0,
        buyAmount: 0,
        avgBuyRate: 0,
        sellQty: 0,
        sellAmount: 0,
        avgSellRate: 0,
        netQty: 0,
        netAmount: 0,
        participationPercent: 0,
      });
    }
    return brokerMap.get(brokerNo)!;
  };

  let totalQty = 0;
  let totalTurnover = 0;
  const dates = new Set<string>();

  stockRecords.forEach((r) => {
    totalQty += r.quantity;
    totalTurnover += r.amount;
    if (r.transactionDate) dates.add(r.transactionDate);

    // Buyer side
    const buyer = getOrCreate(r.buyerBroker);
    buyer.buyQty += r.quantity;
    buyer.buyAmount += r.amount;

    // Seller side
    const seller = getOrCreate(r.sellerBroker);
    seller.sellQty += r.quantity;
    seller.sellAmount += r.amount;
  });

  // Calculate averages, net positions and participation percentages
  for (const b of brokerMap.values()) {
    b.avgBuyRate = b.buyQty > 0 ? Math.round((b.buyAmount / b.buyQty) * 100) / 100 : 0;
    b.avgSellRate = b.sellQty > 0 ? Math.round((b.sellAmount / b.sellQty) * 100) / 100 : 0;
    b.netQty = b.buyQty - b.sellQty;
    b.netAmount = Math.round((b.buyAmount - b.sellAmount) * 100) / 100;
    b.participationPercent =
      totalQty > 0 ? Math.round(((b.buyQty + b.sellQty) / (totalQty * 2)) * 1000) / 10 : 0;
  }

  const allBrokers = Array.from(brokerMap.values());

  // Top Buyers
  const topBuyers = [...allBrokers]
    .filter((b) => b.buyQty > 0)
    .sort((a, b) => b.buyQty - a.buyQty)
    .slice(0, 5)
    .map((b) => ({
      brokerNo: b.brokerNo,
      brokerName: b.brokerName,
      buyQty: b.buyQty,
      buyAmount: b.buyAmount,
      avgBuyRate: b.avgBuyRate,
    }));

  // Top Sellers
  const topSellers = [...allBrokers]
    .filter((b) => b.sellQty > 0)
    .sort((a, b) => b.sellQty - a.sellQty)
    .slice(0, 5)
    .map((b) => ({
      brokerNo: b.brokerNo,
      brokerName: b.brokerName,
      sellQty: b.sellQty,
      sellAmount: b.sellAmount,
      avgSellRate: b.avgSellRate,
    }));

  // Net Buyer Brokers
  const netBuyerBrokers = [...allBrokers]
    .filter((b) => b.netQty > 0)
    .sort((a, b) => b.netQty - a.netQty)
    .slice(0, 5)
    .map((b) => ({
      brokerNo: b.brokerNo,
      brokerName: b.brokerName,
      netQty: b.netQty,
      netAmount: b.netAmount,
    }));

  // Net Seller Brokers
  const netSellerBrokers = [...allBrokers]
    .filter((b) => b.netQty < 0)
    .sort((a, b) => a.netQty - b.netQty)
    .slice(0, 5)
    .map((b) => ({
      brokerNo: b.brokerNo,
      brokerName: b.brokerName,
      netQty: Math.abs(b.netQty),
      netAmount: Math.abs(b.netAmount),
    }));

  // Broker Concentration: Share of top 3 buying brokers in total buy volume
  const top3BuyQty = topBuyers.slice(0, 3).reduce((acc, b) => acc + b.buyQty, 0);
  const brokerConcentrationRatio =
    totalQty > 0 ? Math.round((top3BuyQty / totalQty) * 1000) / 10 : 0;

  const brokerConcentrationLevel =
    brokerConcentrationRatio > 65
      ? "VERY_HIGH"
      : brokerConcentrationRatio > 45
      ? "HIGH"
      : brokerConcentrationRatio > 25
      ? "MODERATE"
      : "LOW";

  // Quantitative Scores (0-100)
  const topNetBuyQty = netBuyerBrokers.reduce((acc, b) => acc + b.netQty, 0);
  const topNetSellQty = netSellerBrokers.reduce((acc, b) => acc + b.netQty, 0);

  const buyingPressureScore = Math.min(
    95,
    Math.max(10, Math.round(50 + ((topNetBuyQty - topNetSellQty) / (totalQty || 1)) * 40))
  );
  const sellingPressureScore = 100 - buyingPressureScore;

  const accumulationScore = Math.min(
    95,
    Math.max(
      15,
      Math.round(
        buyingPressureScore * 0.6 +
          (brokerConcentrationRatio > 40 ? 25 : 10) +
          (stockRecords.length > 50 ? 10 : 0)
      )
    )
  );

  const distributionScore = Math.min(
    95,
    Math.max(
      15,
      Math.round(
        sellingPressureScore * 0.6 +
          (topNetSellQty > topNetBuyQty ? 20 : 5) +
          (brokerConcentrationRatio > 40 ? 15 : 0)
      )
    )
  );

  // Determine Signal using objective neutral standards
  let signal: ScriptBrokerIntelligence["signal"] = "BALANCED";
  let aiInterpretation = "";
  const supportingEvidence: string[] = [];

  if (stockRecords.length < 5) {
    signal = "INSUFFICIENT_EVIDENCE";
    aiInterpretation =
      "Transaction count is very small. Evidence is insufficient to deduce sustained accumulation or distribution patterns.";
    supportingEvidence.push(`Only ${stockRecords.length} transactions recorded for this session.`);
  } else if (accumulationScore >= 72 && brokerConcentrationRatio >= 40) {
    signal = "ACCUMULATION_LIKE";
    const leadBuyer = topBuyers[0];
    aiInterpretation = `Repeated net buying concentration observed among primary participating brokers (notably ${leadBuyer?.brokerName || "lead broker"}). Price stability and volume expansion across subsequent sessions should be monitored to confirm sustained accumulation.`;
    supportingEvidence.push(
      `Top 3 buyer brokers absorbed ${brokerConcentrationRatio}% of total session volume.`,
      `Net buying pressure score is ${buyingPressureScore}/100.`,
      `Primary buying broker #${leadBuyer?.brokerNo} accumulated ${leadBuyer?.buyQty.toLocaleString()} units.`
    );
  } else if (distributionScore >= 72) {
    signal = "DISTRIBUTION_LIKE";
    const leadSeller = topSellers[0];
    aiInterpretation = `Concentrated selling pressure detected from prominent brokers (notably ${leadSeller?.brokerName || "lead seller"}). Support zone defense and price absorption should be evaluated to gauge continuation risk.`;
    supportingEvidence.push(
      `Selling pressure score is elevated at ${sellingPressureScore}/100.`,
      `Lead selling broker #${leadSeller?.brokerNo} offloaded ${leadSeller?.sellQty.toLocaleString()} units.`
    );
  } else if (brokerConcentrationRatio >= 60) {
    signal = "HIGH_BROKER_CONCENTRATION";
    aiInterpretation = `High transaction volume is concentrated among a small cluster of brokers (${brokerConcentrationRatio}%). This indicates selective institutional or active participant focus.`;
    supportingEvidence.push(
      `Top 3 brokers account for ${brokerConcentrationRatio}% of entire traded volume.`
    );
  } else {
    signal = "BALANCED";
    aiInterpretation =
      "Broker-side trading activity is dispersed across multiple market participants without pronounced directional skew.";
    supportingEvidence.push(
      `Broker concentration is ${brokerConcentrationLevel.toLowerCase()} at ${brokerConcentrationRatio}%.`,
      "Buying and selling flow remain in equilibrium."
    );
  }

  return {
    symbol,
    tradingDate: Array.from(dates)[0] || new Date().toISOString().split("T")[0],
    totalTurnover: Math.round(totalTurnover * 100) / 100,
    totalQuantity: totalQty,
    topBuyers,
    topSellers,
    netBuyerBrokers,
    netSellerBrokers,
    brokerConcentrationRatio,
    brokerConcentrationLevel,
    accumulationScore,
    distributionScore,
    buyingPressureScore,
    sellingPressureScore,
    signal,
    aiInterpretation,
    supportingEvidence,
    dataFreshness: new Date().toISOString(),
  };
}

/**
 * Generates verified seed floorsheet transactions for demo/testing purposes
 */
export function generateSeedFloorsheetRecords(): FloorsheetRecord[] {
  const symbols = ["NABIL", "GBIME", "CHCL", "SHIVM", "CIT", "HRL", "NICA", "SCB"];
  const brokers = [58, 45, 34, 49, 28, 4, 17, 38, 42, 57];
  const records: FloorsheetRecord[] = [];
  const today = new Date().toISOString().split("T")[0];

  let txCounter = 20261124001;

  symbols.forEach((sym) => {
    const baseRate = sym === "NABIL" ? 524 : sym === "CHCL" ? 442 : sym === "SHIVM" ? 485 : 550;
    const numTx = Math.floor(Math.random() * 8) + 12;

    for (let i = 0; i < numTx; i++) {
      const buyer = brokers[Math.floor(Math.random() * brokers.length)];
      let seller = brokers[Math.floor(Math.random() * brokers.length)];
      if (seller === buyer) seller = (buyer + 3) % 60 || 45;

      const qty = [50, 100, 200, 300, 500, 1000, 1500][Math.floor(Math.random() * 7)];
      const rate = Math.round((baseRate + (Math.random() - 0.48) * 8) * 10) / 10;
      const amount = Math.round(qty * rate * 100) / 100;

      records.push({
        id: `seed-flr-${sym}-${i}`,
        transactionNo: `${txCounter++}`,
        contractNo: `CN-${txCounter}`,
        transactionDate: today,
        transactionTime: `11:${String(Math.floor(Math.random() * 50) + 10).padStart(2, "0")}:15`,
        symbol: sym,
        stockName: `${sym} Listed Equity`,
        quantity: qty,
        rate,
        amount,
        buyerBroker: buyer,
        buyerBrokerName: getBrokerName(buyer),
        sellerBroker: seller,
        sellerBrokerName: getBrokerName(seller),
      });
    }
  });

  return records;
}
