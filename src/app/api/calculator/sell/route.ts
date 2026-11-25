import { NextResponse } from "next/server";
import { calculateSell, DEFAULT_FEE_SCHEDULE } from "@/lib/financial/nepseFeeEngine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "NABIL";
  const quantity = parseFloat(searchParams.get("quantity") || "100");
  const sellingPrice = parseFloat(searchParams.get("sellingPrice") || "550");
  const purchaseWacc = parseFloat(searchParams.get("purchaseWacc") || "500");
  const holdingDays = parseInt(searchParams.get("holdingDays") || "100", 10);
  const isIndividual = searchParams.get("isIndividual") !== "false";

  const result = calculateSell(
    symbol,
    quantity,
    sellingPrice,
    purchaseWacc,
    holdingDays,
    isIndividual,
    DEFAULT_FEE_SCHEDULE
  );

  return NextResponse.json(result);
}
