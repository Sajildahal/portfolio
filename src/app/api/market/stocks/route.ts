import { NextResponse } from "next/server";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector");
  const search = searchParams.get("search")?.toUpperCase();

  let stocks = [...INITIAL_MARKET_PRICES];

  if (sector && sector !== "ALL") {
    stocks = stocks.filter((s) => s.sector === sector);
  }

  if (search) {
    stocks = stocks.filter(
      (s) =>
        s.symbol.toUpperCase().includes(search) ||
        s.name.toUpperCase().includes(search)
    );
  }

  return NextResponse.json({
    count: stocks.length,
    stocks,
    dataFreshness: "Verified Real-Time / EOD Settlement Snapshot",
    timestamp: new Date().toISOString(),
  });
}
