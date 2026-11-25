import { NextResponse } from "next/server";
import {
  generateStockAIRecommendation,
  getAllAIRecommendations,
} from "@/lib/ai/recommendationEngine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (symbol) {
    const rec = generateStockAIRecommendation(symbol.toUpperCase());
    return NextResponse.json(rec);
  }

  const recommendations = getAllAIRecommendations();
  return NextResponse.json({
    count: recommendations.length,
    recommendations,
    generatedAt: new Date().toISOString(),
    modelVersion: "NEPSE-Quant-Ensemble-v3.4.1",
  });
}
