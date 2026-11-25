// ============================================================================
// Institutional Order Execution Pad
// Real-world trade entry, limit/market/stop-loss, SEBON fees, and instant settlement
// ============================================================================

"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  DollarSign,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { MarketPrice, Transaction, Holding } from "@/types";
import { calculateBuy, calculateSell, DEFAULT_FEE_SCHEDULE } from "@/lib/financial/nepseFeeEngine";
import { soundEngine } from "@/lib/audio/soundEngine";

interface OrderPadModalProps {
  isOpen: boolean;
  initialSymbol?: string;
  initialType?: "BUY" | "SELL";
  marketPrices: MarketPrice[];
  holdings: Holding[];
  cashBalance: number;
  onClose: () => void;
  onExecuteTrade: (tx: Transaction) => void;
}

export function OrderPadModal({
  isOpen,
  initialSymbol = "NABIL",
  initialType = "BUY",
  marketPrices,
  holdings,
  cashBalance,
  onClose,
  onExecuteTrade,
}: OrderPadModalProps) {
  const [orderType, setOrderType] = useState<"BUY" | "SELL">(initialType);
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [orderMode, setOrderMode] = useState<"MARKET" | "LIMIT" | "STOP">("LIMIT");
  const [quantity, setQuantity] = useState<string>("100");
  const [customPrice, setCustomPrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Sync initial props when opened
  React.useEffect(() => {
    if (initialSymbol) setSymbol(initialSymbol.toUpperCase());
    if (initialType) setOrderType(initialType);
    setIsSuccess(false);
  }, [initialSymbol, initialType, isOpen]);

  const stock = useMemo(() => {
    return marketPrices.find((s) => s.symbol === symbol) || marketPrices[0];
  }, [marketPrices, symbol]);

  const currentHolding = useMemo(() => {
    return holdings.find((h) => h.symbol === symbol);
  }, [holdings, symbol]);

  const effectivePrice = useMemo(() => {
    if (orderMode === "MARKET") return stock.ltp;
    const parsed = parseFloat(customPrice);
    return isNaN(parsed) || parsed <= 0 ? stock.ltp : parsed;
  }, [orderMode, customPrice, stock.ltp]);

  const qtyNum = parseInt(quantity) || 0;

  // NEPSE calculations
  const buyCalculation = useMemo(() => {
    return calculateBuy(symbol, qtyNum, effectivePrice, DEFAULT_FEE_SCHEDULE);
  }, [symbol, qtyNum, effectivePrice]);

  const sellCalculation = useMemo(() => {
    const wacc = currentHolding?.wacc || effectivePrice * 0.95;
    return calculateSell(symbol, qtyNum, effectivePrice, wacc, 120, true, DEFAULT_FEE_SCHEDULE);
  }, [symbol, qtyNum, effectivePrice, currentHolding]);

  if (!isOpen) return null;

  const hasEnoughCash = orderType === "BUY" ? cashBalance >= buyCalculation.totalPayable : true;
  const hasEnoughShares = orderType === "SELL" ? (currentHolding?.quantity || 0) >= qtyNum : true;
  const canExecute = qtyNum > 0 && effectivePrice > 0 && (orderType === "BUY" ? hasEnoughCash : hasEnoughShares);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canExecute) return;

    let gross = qtyNum * effectivePrice;
    let broker = 0;
    let sebon = 0;
    let dp = 0;
    let net = gross;

    if (orderType === "BUY") {
      broker = buyCalculation.brokerCommission;
      sebon = buyCalculation.sebonFee;
      dp = buyCalculation.dpFee;
      net = buyCalculation.totalPayable;
    } else {
      broker = sellCalculation.brokerCommission;
      sebon = sellCalculation.sebonFee;
      dp = sellCalculation.dpFee;
      net = sellCalculation.netReceivable;
    }

    const newTx: Transaction = {
      id: `tx-ord-${Date.now()}`,
      portfolioId: "default",
      symbol: stock.symbol,
      companyName: stock.name,
      type: orderType,
      date: new Date().toISOString().split("T")[0],
      quantity: qtyNum,
      price: effectivePrice,
      grossAmount: gross,
      brokerCommission: broker,
      sebonFee: sebon,
      dpFee: dp,
      totalCharges: broker + sebon + dp,
      netAmount: net,
      notes: notes || `${orderMode} Order executed via Institutional Order Pad`,
      createdAt: new Date().toISOString(),
    };

    soundEngine.playOrderExecuted();
    onExecuteTrade(newTx);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-bronze bg-charcoal p-6 shadow-2xl space-y-5 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bronze/60 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-white">NEPSE Order Pad</h2>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  INSTANT SETTLEMENT
                </span>
              </div>
              <p className="text-[10px] text-slate-400">SEBON &amp; CDSC Audited Broker Fee Schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-obsidian hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="text-lg font-bold text-white">Trade Executed Successfully!</h3>
            <p className="text-xs text-slate-400 font-mono">
              {orderType} {qtyNum} shares of {symbol} @ NPR {effectivePrice} entered into audit ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleExecute} className="space-y-4">
            {/* BUY / SELL Switcher */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-obsidian p-1 border border-bronze">
              <button
                type="button"
                onClick={() => setOrderType("BUY")}
                className={`flex items-center justify-center space-x-2 py-2 rounded-lg font-black transition-all ${
                  orderType === "BUY"
                    ? "bg-emerald-500 text-black shadow-emerald"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>BUY ORDER</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType("SELL")}
                className={`flex items-center justify-center space-x-2 py-2 rounded-lg font-black transition-all ${
                  orderType === "SELL"
                    ? "bg-rose-500 text-white shadow-rose"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingDown className="h-4 w-4" />
                <span>SELL ORDER</span>
              </button>
            </div>

            {/* Symbol Selector & Stock Overview */}
            <div className="rounded-xl border border-bronze/70 bg-obsidian p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Select Equity Symbol:</span>
                <select
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value);
                    setCustomPrice("");
                  }}
                  className="rounded-lg border border-bronze bg-charcoal px-3 py-1 font-mono font-bold text-white text-xs focus:border-gold outline-none"
                >
                  {marketPrices.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} · {s.name.slice(0, 22)} (NPR {s.ltp})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-bronze/40 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Market LTP</span>
                  <span className="text-sm font-bold text-white">NPR {stock.ltp}</span>
                  <span
                    className={`text-[10px] ml-1 font-bold ${
                      stock.change >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    ({stock.change >= 0 ? "+" : ""}{stock.changePercent}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-sans block">
                    {orderType === "BUY" ? "Available Cash" : "Owned Units"}
                  </span>
                  <span className="text-xs font-bold text-champagne">
                    {orderType === "BUY"
                      ? `NPR ${cashBalance.toLocaleString()}`
                      : `${currentHolding?.quantity || 0} Shares`}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Mode & Inputs */}
            <div className="grid grid-cols-3 gap-2">
              {(["LIMIT", "MARKET", "STOP"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setOrderMode(mode)}
                  className={`rounded-lg py-1.5 font-bold transition-all ${
                    orderMode === mode
                      ? "border border-gold bg-gold/15 text-gold"
                      : "border border-bronze bg-obsidian text-slate-400 hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">
                  Share Quantity (Units):
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 font-mono font-bold text-white outline-none focus:border-gold"
                />
                <div className="flex space-x-1 mt-1.5">
                  {[10, 50, 100, 500].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q.toString())}
                      className="rounded bg-obsidian/80 px-2 py-0.5 text-[10px] font-mono text-slate-400 hover:text-gold border border-bronze/50"
                    >
                      +{q}
                    </button>
                  ))}
                  {orderType === "SELL" && currentHolding && (
                    <button
                      type="button"
                      onClick={() => setQuantity(currentHolding.quantity.toString())}
                      className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-500/40"
                    >
                      Max
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  {orderMode === "MARKET" ? "Execution Price (LTP)" : "Limit Price (NPR)"}:
                </label>
                <input
                  type="number"
                  disabled={orderMode === "MARKET"}
                  step="0.1"
                  value={orderMode === "MARKET" ? stock.ltp : (customPrice || stock.ltp)}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className={`w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 font-mono font-bold text-white outline-none focus:border-gold ${
                    orderMode === "MARKET" ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
                <span className="text-[10px] text-slate-500 block mt-1.5 font-mono">
                  Day Range: {stock.low} - {stock.high}
                </span>
              </div>
            </div>

            {/* SEBON Regulatory Fee Breakdown */}
            <div className="rounded-xl border border-bronze/80 bg-obsidian p-3.5 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Gross Turnover:</span>
                <span className="text-white font-bold">
                  NPR {(qtyNum * effectivePrice).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>
                  Broker Commission ({((orderType === "BUY" ? buyCalculation.brokerCommissionRate : sellCalculation.brokerCommissionRate) * 100).toFixed(2)}%):
                </span>
                <span className="text-white">
                  NPR {(orderType === "BUY" ? buyCalculation.brokerCommission : sellCalculation.brokerCommission).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SEBON Regulatory Fee (0.015%):</span>
                <span className="text-white">
                  NPR {(orderType === "BUY" ? buyCalculation.sebonFee : sellCalculation.sebonFee).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CDSC DP Fee:</span>
                <span className="text-white">NPR 25.00</span>
              </div>

              <div className="flex justify-between border-t border-bronze/60 pt-2 text-xs">
                <span className="font-bold text-white">
                  {orderType === "BUY" ? "Total Payable Amount:" : "Estimated Net Proceeds:"}
                </span>
                <span
                  className={`font-black text-sm ${
                    orderType === "BUY" ? "text-champagne" : "text-emerald-400"
                  }`}
                >
                  NPR {(orderType === "BUY" ? buyCalculation.totalPayable : sellCalculation.netReceivable).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Warnings if insufficient funds or shares */}
            {!hasEnoughCash && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-rose-300 text-[11px]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Insufficient cash balance. Required: NPR {buyCalculation.totalPayable.toLocaleString()}</span>
              </div>
            )}

            {!hasEnoughShares && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-rose-300 text-[11px]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>You do not own {qtyNum} shares of {symbol} to sell. Owned: {currentHolding?.quantity || 0}</span>
              </div>
            )}

            {/* Execute Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-bronze bg-obsidian px-4 py-2 font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canExecute}
                className={`rounded-xl px-6 py-2.5 font-black text-xs transition-all ${
                  !canExecute
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : orderType === "BUY"
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald"
                    : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose"
                }`}
              >
                {orderType === "BUY" ? "Confirm Buy Order" : "Confirm Sell Order"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
