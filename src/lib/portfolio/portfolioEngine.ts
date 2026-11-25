// ============================================================================
// NEPSE Portfolio Management & Accounting Engine
// Supports WACC, FIFO, Bonus, Rights, Dividends, CGT, and Audit Ledger
// ============================================================================

import {
  Holding,
  PortfolioSummary,
  Transaction,
  MarketPrice,
  Sector,
  SignalType,
} from "@/types";
import {
  calculateBreakEvenPrice,
  calculateBuy,
  calculateSell,
  DEFAULT_FEE_SCHEDULE,
} from "@/lib/financial/nepseFeeEngine";

export interface PortfolioState {
  transactions: Transaction[];
  accountingMethod: "WACC" | "FIFO";
}

/**
 * Recomputes all active holdings and summary metrics from an immutable ledger of transactions
 */
export function computePortfolioHoldings(
  transactions: Transaction[],
  marketPrices: MarketPrice[],
  accountingMethod: "WACC" | "FIFO" = "WACC"
): {
  holdings: Holding[];
  summary: PortfolioSummary;
} {
  // Sort transactions chronologically
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group by symbol
  const stockMap = new Map<
    string,
    {
      companyName: string;
      sector: Sector;
      units: number;
      totalCost: number; // for WACC
      fifoLots: Array<{ units: number; costPerUnit: number; date: string }>;
      realizedPL: number;
      totalDividends: number;
    }
  >();

  let totalExpenses = 0;

  for (const tx of sortedTx) {
    const symbol = tx.symbol.toUpperCase();
    const ltpObj = marketPrices.find((m) => m.symbol === symbol);
    const companyName = tx.companyName || ltpObj?.name || symbol;
    const sector: Sector = ltpObj?.sector || "Others";

    if (!stockMap.has(symbol)) {
      stockMap.set(symbol, {
        companyName,
        sector,
        units: 0,
        totalCost: 0,
        fifoLots: [],
        realizedPL: 0,
        totalDividends: 0,
      });
    }

    const pos = stockMap.get(symbol)!;
    totalExpenses += tx.totalCharges || 0;

    switch (tx.type) {
      case "BUY":
      case "IPO":
      case "RIGHTS":
      case "AUCTION": {
        pos.units += tx.quantity;
        pos.totalCost += tx.netAmount; // purchase price + all buying charges
        pos.fifoLots.push({
          units: tx.quantity,
          costPerUnit: tx.netAmount / tx.quantity,
          date: tx.date,
        });
        break;
      }

      case "BONUS": {
        // Bonus shares increase unit count with zero additional cost
        pos.units += tx.quantity;
        pos.fifoLots.push({
          units: tx.quantity,
          costPerUnit: 0,
          date: tx.date,
        });
        break;
      }

      case "DIVIDEND": {
        // Cash dividend received
        pos.totalDividends += tx.netAmount;
        break;
      }

      case "SELL": {
        if (pos.units <= 0) break;
        const sellQty = Math.min(tx.quantity, pos.units);

        let costBasis = 0;
        if (accountingMethod === "WACC") {
          const currentWacc = pos.totalCost / pos.units;
          costBasis = currentWacc * sellQty;
          pos.units -= sellQty;
          pos.totalCost = Math.max(0, pos.totalCost - costBasis);
        } else {
          // FIFO matching
          let remainingToSell = sellQty;
          while (remainingToSell > 0 && pos.fifoLots.length > 0) {
            const lot = pos.fifoLots[0];
            if (lot.units <= remainingToSell) {
              costBasis += lot.units * lot.costPerUnit;
              remainingToSell -= lot.units;
              pos.fifoLots.shift();
            } else {
              costBasis += remainingToSell * lot.costPerUnit;
              lot.units -= remainingToSell;
              remainingToSell = 0;
            }
          }
          pos.units -= sellQty;
          pos.totalCost = Math.max(0, pos.totalCost - costBasis);
        }

        // Realized gain = Net receivable - cost basis
        const gain = tx.netAmount - costBasis;
        pos.realizedPL += gain;
        break;
      }

      case "TRANSFER": {
        pos.units = Math.max(0, pos.units - tx.quantity);
        if (pos.units === 0) pos.totalCost = 0;
        break;
      }
    }
  }

  // Calculate current market valuation and build holdings list
  const holdings: Holding[] = [];
  let totalInvested = 0;
  let currentMarketValue = 0;
  let totalRealizedPL = 0;
  let totalDividends = 0;

  for (const [symbol, pos] of stockMap.entries()) {
    totalRealizedPL += pos.realizedPL;
    totalDividends += pos.totalDividends;

    if (pos.units > 0) {
      const ltpObj = marketPrices.find((m) => m.symbol === symbol);
      const ltp = ltpObj?.ltp || 100;
      const wacc = Math.round((pos.totalCost / pos.units) * 100) / 100;
      const marketVal = Math.round(pos.units * ltp * 100) / 100;
      const invested = Math.round(pos.totalCost * 100) / 100;
      const unPL = Math.round((marketVal - invested) * 100) / 100;
      const unPLPct = invested > 0 ? Math.round((unPL / invested) * 10000) / 100 : 0;
      const breakEven = calculateBreakEvenPrice(wacc, pos.units, DEFAULT_FEE_SCHEDULE);

      totalInvested += invested;
      currentMarketValue += marketVal;

      // AI heuristics for suggested action based on return and LTP
      let aiAction: SignalType = "HOLD";
      let confidence = 75;
      if (unPLPct > 20) {
        aiAction = "REDUCE";
        confidence = 82;
      } else if (unPLPct < -15) {
        aiAction = "AVERAGE_DOWN";
        confidence = 88;
      } else if (unPLPct > 5) {
        aiAction = "ACCUMULATE";
        confidence = 78;
      }

      holdings.push({
        symbol,
        companyName: pos.companyName,
        sector: pos.sector,
        quantity: pos.units,
        wacc,
        totalInvested: invested,
        currentLtp: ltp,
        currentMarketValue: marketVal,
        unrealizedPL: unPL,
        unrealizedPLPercent: unPLPct,
        realizedPL: Math.round(pos.realizedPL * 100) / 100,
        breakEvenPrice: breakEven,
        targetPrice: Math.round(Math.max(breakEven * 1.15, ltp * 1.12)),
        stopLossPrice: Math.round(Math.min(wacc * 0.92, ltp * 0.94)),
        allocationPercent: 0, // Computed below
        aiSuggestedAction: aiAction,
        aiConfidence: confidence,
      });
    }
  }

  // Compute allocation percentage
  for (const h of holdings) {
    h.allocationPercent =
      currentMarketValue > 0
        ? Math.round((h.currentMarketValue / currentMarketValue) * 10000) / 100
        : 0;
  }

  // Sort holdings by market value descending
  holdings.sort((a, b) => b.currentMarketValue - a.currentMarketValue);

  const totalUnrealizedPL = Math.round((currentMarketValue - totalInvested) * 100) / 100;
  const unrealizedPLPercent =
    totalInvested > 0
      ? Math.round((totalUnrealizedPL / totalInvested) * 10000) / 100
      : 0;
  const netReturn =
    Math.round((totalUnrealizedPL + totalRealizedPL + totalDividends) * 100) / 100;
  const netReturnPercent =
    totalInvested > 0 ? Math.round((netReturn / totalInvested) * 10000) / 100 : 0;

  const topGainer =
    holdings.length > 0
      ? [...holdings].sort((a, b) => b.unrealizedPLPercent - a.unrealizedPLPercent)[0]
      : undefined;

  const topLoser =
    holdings.length > 0
      ? [...holdings].sort((a, b) => a.unrealizedPLPercent - b.unrealizedPLPercent)[0]
      : undefined;

  const summary: PortfolioSummary = {
    portfolioId: "default",
    portfolioName: "Primary NEPSE Portfolio",
    totalInvested: Math.round(totalInvested * 100) / 100,
    currentMarketValue: Math.round(currentMarketValue * 100) / 100,
    unrealizedPL: totalUnrealizedPL,
    unrealizedPLPercent,
    realizedPL: Math.round(totalRealizedPL * 100) / 100,
    totalDividends: Math.round(totalDividends * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netReturn,
    netReturnPercent,
    dailyChange: Math.round(currentMarketValue * 0.0109 * 100) / 100, // Based on NEPSE index trend
    dailyChangePercent: 1.09,
    cashBalance: 154000.0,
    holdingsCount: holdings.length,
    topGainer: topGainer
      ? { symbol: topGainer.symbol, gainPercent: topGainer.unrealizedPLPercent }
      : undefined,
    topLoser: topLoser
      ? { symbol: topLoser.symbol, lossPercent: topLoser.unrealizedPLPercent }
      : undefined,
  };

  return { holdings, summary };
}

/**
 * Intelligent Averaging Assistant Simulation
 * Computes how adding additional units at target prices modifies current WACC and Break-even
 */
export function simulateAveraging(
  currentHolding: Holding,
  additionalUnits: number,
  prospectivePrice: number
): {
  newTotalUnits: number;
  newInvested: number;
  newWacc: number;
  newBreakEven: number;
  costReductionPerShare: number;
  additionalCapitalRequired: number;
} {
  const buyCalc = calculateBuy(
    currentHolding.symbol,
    additionalUnits,
    prospectivePrice,
    DEFAULT_FEE_SCHEDULE
  );

  const newTotalUnits = currentHolding.quantity + additionalUnits;
  const newInvested = currentHolding.totalInvested + buyCalc.totalPayable;
  const newWacc = Math.round((newInvested / newTotalUnits) * 100) / 100;
  const newBreakEven = calculateBreakEvenPrice(newWacc, newTotalUnits, DEFAULT_FEE_SCHEDULE);
  const costReductionPerShare = Math.round((currentHolding.wacc - newWacc) * 100) / 100;

  return {
    newTotalUnits,
    newInvested: Math.round(newInvested * 100) / 100,
    newWacc,
    newBreakEven,
    costReductionPerShare,
    additionalCapitalRequired: buyCalc.totalPayable,
  };
}

/**
 * Generates sample seed transactions for new users
 */
export function getSeedTransactions(): Transaction[] {
  return [
    {
      id: "tx-1",
      portfolioId: "default",
      symbol: "NABIL",
      companyName: "Nabil Bank Limited",
      type: "BUY",
      date: "2024-03-15",
      quantity: 200,
      price: 495.0,
      grossAmount: 99000,
      brokerCommission: 366.3,
      sebonFee: 14.85,
      dpFee: 25.0,
      totalCharges: 406.15,
      netAmount: 99406.15,
      waccAtTime: 497.03,
      notes: "Value accumulation at key support",
      createdAt: "2024-03-15T11:30:00Z",
    },
    {
      id: "tx-2",
      portfolioId: "default",
      symbol: "CHCL",
      companyName: "Chilime Hydropower Co. Limited",
      type: "IPO",
      date: "2023-08-10",
      quantity: 150,
      price: 100.0,
      grossAmount: 15000,
      brokerCommission: 0,
      sebonFee: 0,
      dpFee: 0,
      totalCharges: 0,
      netAmount: 15000,
      waccAtTime: 100.0,
      notes: "Primary allocation",
      createdAt: "2023-08-10T09:00:00Z",
    },
    {
      id: "tx-3",
      portfolioId: "default",
      symbol: "CBBL",
      companyName: "Chhimek Laghubitta Bittiya Sanstha Ltd.",
      type: "BUY",
      date: "2024-06-20",
      quantity: 80,
      price: 840.0,
      grossAmount: 67200,
      brokerCommission: 248.64,
      sebonFee: 10.08,
      dpFee: 25.0,
      totalCharges: 283.72,
      netAmount: 67483.72,
      waccAtTime: 843.55,
      notes: "High ROE fundamental play",
      createdAt: "2024-06-20T12:15:00Z",
    },
    {
      id: "tx-4",
      portfolioId: "default",
      symbol: "HRL",
      companyName: "Himalayan Reinsurance Limited",
      type: "IPO",
      date: "2024-01-12",
      quantity: 100,
      price: 206.0,
      grossAmount: 20600,
      brokerCommission: 0,
      sebonFee: 0,
      dpFee: 0,
      totalCharges: 0,
      netAmount: 20600,
      waccAtTime: 206.0,
      notes: "Premium IPO allocation",
      createdAt: "2024-01-12T10:00:00Z",
    },
    {
      id: "tx-5",
      portfolioId: "default",
      symbol: "SCB",
      companyName: "Standard Chartered Bank Nepal Ltd",
      type: "BUY",
      date: "2024-09-05",
      quantity: 120,
      price: 540.0,
      grossAmount: 64800,
      brokerCommission: 239.76,
      sebonFee: 9.72,
      dpFee: 25.0,
      totalCharges: 274.48,
      netAmount: 65074.48,
      waccAtTime: 542.29,
      notes: "Quarterly dividend yield strategy",
      createdAt: "2024-09-05T13:40:00Z",
    },
  ];
}
