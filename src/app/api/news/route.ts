import { NextResponse } from "next/server";
import { FINANCIAL_NEWS_FEED } from "@/lib/news/newsEngine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();

  let news = [...FINANCIAL_NEWS_FEED];
  if (symbol) {
    news = news.filter((n) => n.relatedSymbols.includes(symbol));
  }

  return NextResponse.json({
    count: news.length,
    news,
    feedSource: "SEBON, NEPSE, ShareSansar, Bizmandu, NEPSE Alpha Certified RSS Feeds",
  });
}
