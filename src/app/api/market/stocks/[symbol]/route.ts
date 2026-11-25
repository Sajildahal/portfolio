import { NextResponse } from "next/server";
import {
  generateHistoricalCandles,
  INITIAL_MARKET_PRICES,
  NEPSE_COMPANIES,
} from "@/lib/market/nepseData";
import {
  calculateBollingerBands,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateSMA,
  calculateSupportResistance,
} from "@/lib/quantitative/indicators";
import { generateStockAIRecommendation } from "@/lib/ai/recommendationEngine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upper = symbol.toUpperCase();

  const stock = INITIAL_MARKET_PRICES.find((s) => s.symbol === upper);
  if (!stock) {
    return NextResponse.json(
      { error: `Stock symbol ${symbol} not found in NEPSE listings` },
      { status: 404 }
    );
  }

  const company = NEPSE_COMPANIES.find((c) => c.symbol === upper);
  const candles = generateHistoricalCandles(upper, 60);
  const closes = candles.map((c) => c.close);

  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  const bb = calculateBollingerBands(closes, 20);
  const sr = calculateSupportResistance(candles);
  const ai = generateStockAIRecommendation(upper, stock);

  return NextResponse.json({
    stock,
    company,
    candles,
    indicators: {
      sma20: sma20[sma20.length - 1],
      sma50: sma50[sma50.length - 1],
      rsi: rsi[rsi.length - 1],
      macd: {
        line: macd.macdLine[macd.macdLine.length - 1],
        signal: macd.signalLine[macd.signalLine.length - 1],
        hist: macd.histogram[macd.histogram.length - 1],
      },
      bollinger: {
        upper: bb.upper[bb.upper.length - 1],
        middle: bb.middle[bb.middle.length - 1],
        lower: bb.lower[bb.lower.length - 1],
        bandwidth: bb.bandwidth[bb.bandwidth.length - 1],
      },
      supports: sr.supports,
      resistances: sr.resistances,
    },
    aiRecommendation: ai,
  });
}
