import { NextResponse } from "next/server";
import { calculateBuy, DEFAULT_FEE_SCHEDULE } from "@/lib/financial/nepseFeeEngine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "NABIL";
  const quantity = parseFloat(searchParams.get("quantity") || "100");
  const price = parseFloat(searchParams.get("price") || "500");

  const result = calculateBuy(symbol, quantity, price, DEFAULT_FEE_SCHEDULE);
  return NextResponse.json(result);
}
