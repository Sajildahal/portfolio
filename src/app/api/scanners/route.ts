import { NextResponse } from "next/server";
import { runQuantitativeScanner } from "@/lib/quantitative/scanners";
import { ScannerType } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "CONSOLIDATING_UP_BREAKOUT") as ScannerType;

  const results = runQuantitativeScanner(type);

  return NextResponse.json({
    scannerType: type,
    count: results.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
