import { NextResponse } from "next/server";
import { getSeedTransactions } from "@/lib/portfolio/portfolioEngine";
import { Transaction } from "@/types";

let transactions: Transaction[] = [...getSeedTransactions()];

export async function GET() {
  return NextResponse.json({
    count: transactions.length,
    transactions,
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (Array.isArray(data)) {
      // Bulk import
      transactions = [...data, ...transactions];
      return NextResponse.json({ success: true, count: data.length });
    }

    const tx: Transaction = {
      ...data,
      id: data.id || `tx-${Date.now()}`,
      createdAt: data.createdAt || new Date().toISOString(),
    };
    transactions.unshift(tx);
    return NextResponse.json({ success: true, transaction: tx });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
  }

  const prevLen = transactions.length;
  transactions = transactions.filter((t) => t.id !== id);

  return NextResponse.json({
    success: true,
    deletedId: id,
    remaining: transactions.length,
  });
}
