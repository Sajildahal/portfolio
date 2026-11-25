import { NextResponse } from "next/server";
import {
  computePortfolioHoldings,
  getSeedTransactions,
} from "@/lib/portfolio/portfolioEngine";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { Transaction } from "@/types";

// In-memory persistent transactional store for application runtime
let memoryTransactions: Transaction[] = [...getSeedTransactions()];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const method = (searchParams.get("accounting") || "WACC") as "WACC" | "FIFO";

  const { holdings, summary } = computePortfolioHoldings(
    memoryTransactions,
    INITIAL_MARKET_PRICES,
    method
  );

  return NextResponse.json({
    holdings,
    summary,
    transactionsCount: memoryTransactions.length,
    accountingMethod: method,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTx: Transaction = {
      ...body,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    memoryTransactions.unshift(newTx);

    const { holdings, summary } = computePortfolioHoldings(
      memoryTransactions,
      INITIAL_MARKET_PRICES,
      "WACC"
    );

    return NextResponse.json({
      success: true,
      transaction: newTx,
      holdings,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to add transaction" },
      { status: 400 }
    );
  }
}
