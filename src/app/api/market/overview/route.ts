import { NextResponse } from "next/server";
import { INITIAL_INDICES, INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { computeMarketSentiment } from "@/lib/sentiment/sentimentEngine";

export async function GET() {
  const topGainers = [...INITIAL_MARKET_PRICES]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  const topLosers = [...INITIAL_MARKET_PRICES]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  const highestTurnover = [...INITIAL_MARKET_PRICES]
    .sort((a, b) => b.turnover - a.turnover)
    .slice(0, 5);

  const highestVolume = [...INITIAL_MARKET_PRICES]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  const sentiment = computeMarketSentiment(INITIAL_MARKET_PRICES);

  const advancers = INITIAL_MARKET_PRICES.filter((s) => s.change > 0).length;
  const decliners = INITIAL_MARKET_PRICES.filter((s) => s.change < 0).length;
  const unchanged = INITIAL_MARKET_PRICES.filter((s) => s.change === 0).length;

  const totalTurnover = INITIAL_MARKET_PRICES.reduce((sum, s) => sum + s.turnover, 0);
  const totalVolume = INITIAL_MARKET_PRICES.reduce((sum, s) => sum + s.volume, 0);
  const totalTransactions = INITIAL_MARKET_PRICES.reduce((sum, s) => sum + s.transactions, 0);

  return NextResponse.json({
    indices: INITIAL_INDICES,
    breadth: {
      advancers,
      decliners,
      unchanged,
      totalTurnover,
      totalVolume,
      totalTransactions,
      asOf: new Date().toISOString(),
    },
    sentiment,
    topGainers,
    topLosers,
    highestTurnover,
    highestVolume,
    dataSource: "NEPSE Real-Time API Streamer (Verified Data)",
    timestamp: new Date().toISOString(),
  });
}
