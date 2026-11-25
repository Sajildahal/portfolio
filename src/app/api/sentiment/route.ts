import { NextResponse } from "next/server";
import {
  computeMarketSentiment,
  detectUnusualActivity,
} from "@/lib/sentiment/sentimentEngine";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";

export async function GET() {
  const sentiment = computeMarketSentiment(INITIAL_MARKET_PRICES);
  const unusualAlerts = detectUnusualActivity(INITIAL_MARKET_PRICES);

  return NextResponse.json({
    sentiment,
    unusualAlerts,
    asOf: new Date().toISOString(),
  });
}
