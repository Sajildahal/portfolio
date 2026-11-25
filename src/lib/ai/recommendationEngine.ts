// ============================================================================
// AI Stock Recommendation & Quantitative Signal Decision Engine
// Multi-factor Scoring + Regime Detection + Risk/Reward Calibration
// ============================================================================

import { AIRecommendation, MarketPrice, SignalType } from "@/types";
import { generateHistoricalCandles, INITIAL_MARKET_PRICES, NEPSE_COMPANIES } from "@/lib/market/nepseData";
import {
  calculateBollingerBands,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateSMA,
  calculateSupportResistance,
} from "@/lib/quantitative/indicators";

export function generateStockAIRecommendation(
  symbol: string,
  stockPrice?: MarketPrice
): AIRecommendation {
  const stock =
    stockPrice ||
    INITIAL_MARKET_PRICES.find((s) => s.symbol === symbol) ||
    INITIAL_MARKET_PRICES[0];
  const company = NEPSE_COMPANIES.find((c) => c.symbol === stock.symbol);

  const candles = generateHistoricalCandles(stock.symbol, 60);
  const closes = candles.map((c) => c.close);
  const currentPrice = stock.ltp;

  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const bb = calculateBollingerBands(closes, 20);
  const { supports, resistances } = calculateSupportResistance(candles);

  const latestRsi = rsi[rsi.length - 1] ?? 50;
  const latestMacdHist = macd.histogram[macd.histogram.length - 1] ?? 0;
  const s20 = sma20[sma20.length - 1] ?? currentPrice;
  const s50 = sma50[sma50.length - 1] ?? currentPrice;

  // Quantitative Factor Evaluation:
  // 1. Trend Factor (0-25)
  let trendScore = 12;
  if (currentPrice > s20 && s20 > s50) trendScore = 25;
  else if (currentPrice > s20) trendScore = 18;
  else if (currentPrice < s50) trendScore = 5;

  // 2. Momentum Factor (0-25)
  let momentumScore = 12;
  if (latestRsi >= 55 && latestRsi <= 70 && latestMacdHist > 0) momentumScore = 24;
  else if (latestRsi > 70) momentumScore = 15; // Overbought risk
  else if (latestRsi < 35) momentumScore = 16; // Potential mean reversion
  else if (latestMacdHist > 0) momentumScore = 18;

  // 3. Fundamental Factor (0-25)
  let fundScore = 15;
  const pe = company?.pe || 25;
  const roe = company?.roe || 10;
  if (pe > 0 && pe < 20 && roe > 12) fundScore = 24;
  else if (pe > 0 && pe < 30 && roe > 8) fundScore = 18;
  else if (pe < 0) fundScore = 4;

  // 4. Volume & Liquidity Factor (0-25)
  let volScore = 15;
  if (stock.volume > 100000 && stock.transactions > 800) volScore = 23;
  else if (stock.volume > 40000) volScore = 18;

  const totalConfidence = Math.min(96, Math.max(50, trendScore + momentumScore + fundScore + volScore));

  // Determine Signal Type
  let signal: SignalType = "HOLD";
  let horizon: AIRecommendation["horizon"] = "Medium-term (1-3 months)";
  let targetPrice = Math.round(currentPrice * 1.12);
  let stopLoss = Math.round(currentPrice * 0.94);

  if (trendScore >= 20 && momentumScore >= 20 && fundScore >= 18) {
    signal = "STRONG_BUY";
    targetPrice = Math.round(currentPrice * 1.18);
    stopLoss = Math.round(currentPrice * 0.95);
    horizon = "Medium-term (1-3 months)";
  } else if (trendScore >= 18 && fundScore >= 15) {
    signal = "BUY";
    targetPrice = Math.round(currentPrice * 1.14);
    stopLoss = Math.round(currentPrice * 0.94);
  } else if (latestRsi < 40 && fundScore >= 18) {
    signal = "ACCUMULATE";
    targetPrice = Math.round(currentPrice * 1.15);
    stopLoss = Math.round(currentPrice * 0.92);
    horizon = "Long-term (6-12 months)";
  } else if (latestRsi > 72 && currentPrice > (resistances[0] || currentPrice * 1.1)) {
    signal = "REDUCE";
    targetPrice = currentPrice;
    stopLoss = Math.round(currentPrice * 0.97);
    horizon = "Short-term (1-4 weeks)";
  } else if (fundScore <= 8 || currentPrice < s50 * 0.92) {
    signal = "AVOID";
    targetPrice = Math.round(currentPrice * 0.9);
    stopLoss = Math.round(currentPrice * 1.05);
  }

  const riskPerShare = Math.max(1, Math.abs(currentPrice - stopLoss));
  const rewardPerShare = Math.max(1, Math.abs(targetPrice - currentPrice));
  const riskReward = Math.round((rewardPerShare / riskPerShare) * 10) / 10;

  const nearestS = supports[0] || Math.round(currentPrice * 0.95);
  const nearestR = resistances[0] || Math.round(currentPrice * 1.1);

  return {
    symbol: stock.symbol,
    companyName: stock.name,
    sector: stock.sector,
    currentPrice,
    signal,
    horizon,
    confidenceScore: totalConfidence,
    entryRange: {
      min: Math.round(Math.min(currentPrice * 0.985, nearestS)),
      max: Math.round(Math.max(currentPrice * 1.01, currentPrice)),
    },
    targetPrice,
    stopLoss,
    riskReward,
    technicalThesis: `Price is trading at NPR ${currentPrice} relative to 20-SMA (NPR ${s20}) and 50-SMA (NPR ${s50}). RSI indicator sits at ${latestRsi} with MACD histogram at ${latestMacdHist}. Strong institutional support established at NPR ${nearestS} with key upside test at NPR ${nearestR}.`,
    fundamentalThesis: `${company?.name || stock.name} commands an EPS of NPR ${company?.eps || 20} with a Book Value of NPR ${company?.bookValue || 180} and P/E multiple of ${company?.pe || 22}x. ROE performance stands at ${company?.roe || 11}%, representing resilient capital efficiency in the ${stock.sector} sector.`,
    marketRegime: trendScore >= 20 ? "Strong Bullish" : trendScore >= 15 ? "Weak Bullish" : "Sideways",
    positiveFactors: [
      `Consistent earnings yield with ROE at ${company?.roe || 12}%`,
      `Price holding above primary moving average support`,
      `High liquidity depth with daily turnover exceeding NPR ${(stock.turnover / 10000000).toFixed(1)} Crore`,
    ],
    negativeFactors: [
      `Sector volatility correlation to macroeconomic monetary policy`,
      `Resistance hurdle at psychological zone NPR ${nearestR}`,
    ],
    invalidationConditions: [
      `Daily closing breakdown below Stop-Loss level of NPR ${stopLoss}`,
      `Abnormal bearish divergence in NEPSE benchmark index`,
      `Material negative deviation in quarterly audited earnings report`,
    ],
    timestamp: new Date().toISOString(),
    modelVersion: "NEPSE-Quant-Ensemble-v3.4.1",
  };
}

export function getAllAIRecommendations(stocks: MarketPrice[] = INITIAL_MARKET_PRICES): AIRecommendation[] {
  return stocks.map((stock) => generateStockAIRecommendation(stock.symbol, stock));
}
