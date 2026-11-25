// ============================================================================
// NEPSE Financial Calculation Engine
// Strictly implements SEBON, NEPSE Broker slabs, CDSC DP Fee, and CGT rules
// ============================================================================

import { BuyCalculation, SellCalculation, FeeSchedule } from "@/types";

export const DEFAULT_FEE_SCHEDULE: FeeSchedule = {
  effectiveDate: "2024-01-01",
  sebonFeeRate: 0.00015, // 0.015%
  dpFee: 25.0, // NPR 25 per transaction settlement
  slabs: [
    { maxAmount: 50000, rate: 0.004 }, // Up to 50,000: 0.40%
    { maxAmount: 500000, rate: 0.0037 }, // 50,001 to 500,000: 0.37%
    { maxAmount: 2000000, rate: 0.0034 }, // 500,001 to 2,000,000: 0.34%
    { maxAmount: 10000000, rate: 0.003 }, // 2,000,001 to 10,000,000: 0.30%
    { maxAmount: Infinity, rate: 0.0027 }, // Above 10,000,000: 0.27%
  ],
  cgtShortTermRate: 0.075, // 7.5% (< 365 days)
  cgtLongTermRate: 0.05, // 5.0% (>= 365 days)
};

/**
 * Returns the effective broker commission rate for a given gross turnover amount
 */
export function getBrokerCommissionRate(
  grossAmount: number,
  feeSchedule: FeeSchedule = DEFAULT_FEE_SCHEDULE
): number {
  for (const slab of feeSchedule.slabs) {
    if (grossAmount <= slab.maxAmount) {
      return slab.rate;
    }
  }
  return 0.0027;
}

/**
 * Calculates the broker commission in NPR, respecting the minimum NPR 10 rule
 */
export function calculateBrokerCommission(
  grossAmount: number,
  feeSchedule: FeeSchedule = DEFAULT_FEE_SCHEDULE
): { amount: number; rate: number } {
  if (grossAmount <= 0) return { amount: 0, rate: 0 };
  const rate = getBrokerCommissionRate(grossAmount, feeSchedule);
  const calculated = grossAmount * rate;
  return {
    amount: Math.max(10.0, Math.round(calculated * 100) / 100),
    rate,
  };
}

/**
 * Calculates complete buy transaction breakdown
 */
export function calculateBuy(
  symbol: string,
  quantity: number,
  purchasePrice: number,
  feeSchedule: FeeSchedule = DEFAULT_FEE_SCHEDULE
): BuyCalculation {
  const grossAmount = quantity * purchasePrice;
  const { amount: brokerCommission, rate: brokerCommissionRate } =
    calculateBrokerCommission(grossAmount, feeSchedule);
  const sebonFee = Math.round(grossAmount * feeSchedule.sebonFeeRate * 100) / 100;
  const dpFee = quantity > 0 ? feeSchedule.dpFee : 0;
  const totalCharges = brokerCommission + sebonFee + dpFee;
  const totalPayable = grossAmount + totalCharges;
  const effectiveCostPerShare =
    quantity > 0 ? Math.round((totalPayable / quantity) * 100) / 100 : 0;

  return {
    symbol,
    quantity,
    purchasePrice,
    grossAmount: Math.round(grossAmount * 100) / 100,
    brokerCommission,
    brokerCommissionRate,
    sebonFee,
    dpFee,
    totalCharges: Math.round(totalCharges * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
    effectiveCostPerShare,
  };
}

/**
 * Calculates complete sell transaction breakdown, including Capital Gains Tax (CGT)
 */
export function calculateSell(
  symbol: string,
  quantity: number,
  sellingPrice: number,
  purchaseWacc: number,
  holdingDays: number = 100,
  isIndividual: boolean = true,
  feeSchedule: FeeSchedule = DEFAULT_FEE_SCHEDULE
): SellCalculation {
  const grossAmount = quantity * sellingPrice;
  const { amount: brokerCommission, rate: brokerCommissionRate } =
    calculateBrokerCommission(grossAmount, feeSchedule);
  const sebonFee = Math.round(grossAmount * feeSchedule.sebonFeeRate * 100) / 100;
  const dpFee = quantity > 0 ? feeSchedule.dpFee : 0;
  const transactionCharges = brokerCommission + sebonFee + dpFee;

  // Net receivable before capital gains tax
  const netReceivablePreTax = grossAmount - transactionCharges;
  const totalCostBasis = quantity * purchaseWacc;

  // Profit / Loss calculation for CGT
  // Under Nepal tax rule: Capital Gain = Net Receivable - Cost Basis
  const capitalGain = Math.max(0, netReceivablePreTax - totalCostBasis);

  let cgtRate = 0;
  if (capitalGain > 0) {
    if (!isIndividual) {
      cgtRate = 0.1; // 10% for institutions
    } else {
      cgtRate =
        holdingDays >= 365
          ? feeSchedule.cgtLongTermRate
          : feeSchedule.cgtShortTermRate;
    }
  }

  const cgtAmount = Math.round(capitalGain * cgtRate * 100) / 100;
  const totalCharges = transactionCharges + cgtAmount;
  const netReceivable = Math.round((grossAmount - totalCharges) * 100) / 100;
  const netProfitLoss = Math.round((netReceivable - totalCostBasis) * 100) / 100;
  const returnPercent =
    totalCostBasis > 0
      ? Math.round((netProfitLoss / totalCostBasis) * 10000) / 100
      : 0;

  return {
    symbol,
    quantity,
    sellingPrice,
    purchaseWacc,
    holdingDays,
    isIndividual,
    grossAmount: Math.round(grossAmount * 100) / 100,
    brokerCommission,
    brokerCommissionRate,
    sebonFee,
    dpFee,
    capitalGain: Math.round(capitalGain * 100) / 100,
    cgtRate,
    cgtAmount,
    totalCharges: Math.round(totalCharges * 100) / 100,
    netReceivable,
    netProfitLoss,
    returnPercent,
  };
}

/**
 * Calculates exact break-even selling price per share
 * accounting for purchase WACC, selling broker commission, SEBON fee, and DP charge
 */
export function calculateBreakEvenPrice(
  waccPerShare: number,
  quantity: number,
  feeSchedule: FeeSchedule = DEFAULT_FEE_SCHEDULE
): number {
  if (quantity <= 0 || waccPerShare <= 0) return 0;
  const targetTotalCost = waccPerShare * quantity;

  // We solve: SellingPrice * Q - (SellingPrice * Q * (brokerRate + sebonRate)) - dpFee >= targetTotalCost
  // Let P = SellingPrice, gross = P * Q
  // gross * (1 - brokerRate - sebonRate) = targetTotalCost + dpFee
  let estimatedPrice = waccPerShare * 1.008; // Starting approximation
  for (let i = 0; i < 5; i++) {
    const gross = estimatedPrice * quantity;
    const rate = getBrokerCommissionRate(gross, feeSchedule);
    const denominator = 1 - rate - feeSchedule.sebonFeeRate;
    estimatedPrice = (targetTotalCost + feeSchedule.dpFee) / (quantity * denominator);
  }

  return Math.round(estimatedPrice * 100) / 100;
}

/**
 * Adjusts price for bonus share declaration
 * Example: 15% bonus on LTP 1000 => 1000 / (1 + 0.15) = 869.57
 */
export function calculateBonusShareAdjustment(
  ltp: number,
  bonusPercent: number
): { adjustedPrice: number; ratio: number } {
  const ratio = bonusPercent / 100;
  const adjustedPrice = Math.round((ltp / (1 + ratio)) * 100) / 100;
  return { adjustedPrice, ratio };
}

/**
 * Adjusts price for rights share offering
 * Formula: Adjusted Price = (LTP + (Right Ratio * Paid Amount per share)) / (1 + Right Ratio)
 * In Nepal, right shares are issued at face value NPR 100 per share.
 */
export function calculateRightShareAdjustment(
  ltp: number,
  rightRatioNumerator: number,
  rightRatioDenominator: number,
  issuePrice: number = 100
): { adjustedPrice: number; rightRatio: number } {
  const rightRatio = rightRatioNumerator / rightRatioDenominator;
  const adjustedPrice =
    Math.round(((ltp + rightRatio * issuePrice) / (1 + rightRatio)) * 100) / 100;
  return { adjustedPrice, rightRatio };
}

/**
 * Calculates position sizing based on risk budget
 * Position Size = Risk Budget (NPR) / (Entry Price - Stop Loss Price)
 */
export function calculatePositionSize(
  riskBudget: number,
  entryPrice: number,
  stopLossPrice: number
): {
  maxShares: number;
  totalCapitalRequired: number;
  riskRewardRatio: number;
  targetPrice?: number;
} {
  const riskPerShare = Math.abs(entryPrice - stopLossPrice);
  if (riskPerShare <= 0) return { maxShares: 0, totalCapitalRequired: 0, riskRewardRatio: 0 };
  const maxShares = Math.floor(riskBudget / riskPerShare);
  return {
    maxShares,
    totalCapitalRequired: maxShares * entryPrice,
    riskRewardRatio: 0,
  };
}
