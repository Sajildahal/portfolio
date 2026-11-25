// ============================================================================
// Institutional Stock Detail & 5-Level Market Depth Modal
// Real-world order book, quick trade execution, consensus, Monte Carlo target
// ============================================================================

"use client";

import React, { useMemo, useState } from "react";
import {
  X,
  ExternalLink,
  Target,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  Bookmark,
  Check,
} from "lucide-react";
import { INITIAL_MARKET_PRICES, NEPSE_COMPANIES } from "@/lib/market/nepseData";
import { generateStockAIRecommendation } from "@/lib/ai/recommendationEngine";
import { computeNeuralConsensus } from "@/lib/ai/nepseAiAdvanceEngine";
import { marketStream } from "@/lib/market/marketStreamEngine";

interface StockDetailModalProps {
  symbol: string | null;
  onClose: () => void;
  onOpenAnalysis: (symbol: string) => void;
  onOpenOrderPad?: (symbol: string, type: "BUY" | "SELL") => void;
  onAddToWatchlist?: (symbol: string) => void;
}

export function StockDetailModal({
  symbol,
  onClose,
  onOpenAnalysis,
  onOpenOrderPad,
  onAddToWatchlist,
}: StockDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "depth">("overview");
  const [watchlistAdded, setWatchlistAdded] = useState(false);

  const stock = useMemo(() => {
    if (!symbol) return null;
    return marketStream.getStock(symbol) || INITIAL_MARKET_PRICES.find((s) => s.symbol === symbol);
  }, [symbol]);

  const company = useMemo(() => {
    if (!symbol) return null;
    return NEPSE_COMPANIES.find((c) => c.symbol === symbol);
  }, [symbol]);

  const ai = useMemo(() => {
    if (!symbol || !stock) return null;
    return generateStockAIRecommendation(symbol, stock);
  }, [symbol, stock]);

  const consensus = useMemo(() => {
    if (!symbol || !stock) return null;
    return computeNeuralConsensus(symbol);
  }, [symbol, stock]);

  const marketDepth = useMemo(() => {
    if (!symbol) return null;
    return marketStream.getMarketDepth(symbol);
  }, [symbol]);

  if (!symbol || !stock) return null;

  const handleAddWatchlist = () => {
    if (onAddToWatchlist && symbol) {
      onAddToWatchlist(symbol);
      setWatchlistAdded(true);
      setTimeout(() => setWatchlistAdded(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-bronze bg-charcoal p-6 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bronze/60 pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="rounded-xl bg-gold/20 px-3 py-1 text-sm font-black text-gold border border-gold/40">
              {stock.symbol}
            </span>
            <div>
              <h2 className="text-base font-bold text-white">{stock.name}</h2>
              <span className="text-[10px] text-slate-400">{stock.sector} · NEPSE Listed</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleAddWatchlist}
              className="flex items-center space-x-1 rounded-lg border border-bronze bg-obsidian px-2.5 py-1 text-[11px] font-semibold text-champagne hover:border-gold transition-colors"
            >
              {watchlistAdded ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Added</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3 w-3 text-gold" />
                  <span>Watchlist</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-obsidian hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Price & Quick Trade Action Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-obsidian p-4 border border-bronze/60">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black font-mono text-white">NPR {stock.ltp}</span>
              <span
                className={`text-xs font-bold font-mono ${
                  stock.change >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {stock.change >= 0 ? "+" : ""}
                {stock.change} ({stock.changePercent}%)
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Day High: NPR {stock.high} · Low: NPR {stock.low} · Vol: {stock.volume.toLocaleString()}
            </div>
          </div>

          {/* Quick Trade Execution Buttons */}
          {onOpenOrderPad && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenOrderPad(stock.symbol, "BUY");
                }}
                className="flex items-center space-x-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 font-black text-black shadow-emerald transition-all"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>BUY</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenOrderPad(stock.symbol, "SELL");
                }}
                className="flex items-center space-x-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 px-3.5 py-2 font-black text-white shadow-rose transition-all"
              >
                <TrendingDown className="h-3.5 w-3.5" />
                <span>SELL</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Toggle: Overview vs 5-Level Market Depth */}
        <div className="flex rounded-lg border border-bronze bg-obsidian p-1 font-semibold text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              activeTab === "overview" ? "bg-gold text-black font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Institutional Overview & AI Consensus
          </button>
          <button
            onClick={() => setActiveTab("depth")}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              activeTab === "depth" ? "bg-gold text-black font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            5-Level Market Depth & Order Book
          </button>
        </div>

        {activeTab === "overview" ? (
          <div className="space-y-3">
            {/* Fundamentals Strip */}
            <div className="grid grid-cols-4 gap-2 rounded-xl bg-obsidian/70 p-3 font-mono text-center border border-bronze/50">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">P/E Ratio</span>
                <span className="font-bold text-white">{company?.pe || 22}x</span>
              </div>
              <div className="border-l border-bronze/50">
                <span className="text-[10px] text-slate-400 block font-sans">EPS (Annual)</span>
                <span className="font-bold text-emerald-400">NPR {company?.eps || 24}</span>
              </div>
              <div className="border-l border-bronze/50">
                <span className="text-[10px] text-slate-400 block font-sans">Book Value</span>
                <span className="font-bold text-champagne">NPR {company?.bookValue || 215}</span>
              </div>
              <div className="border-l border-bronze/50">
                <span className="text-[10px] text-slate-400 block font-sans">ROE</span>
                <span className="font-bold text-gold">{company?.roe || 12}%</span>
              </div>
            </div>

            {/* Neural Consensus & Targets */}
            {consensus && (
              <div className="rounded-xl border border-bronze/70 bg-obsidian p-3.5 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs font-sans font-bold text-white border-b border-bronze/40 pb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    <span>Neural Consensus:</span>
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-black border ${
                      consensus.recommendation === "STRONG_BUY" || consensus.recommendation === "BUY"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-gold/20 text-gold border-gold/40"
                    }`}
                  >
                    {consensus.recommendation} ({consensus.overallConsensusScore}/100)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">10-Day Target:</span>
                    <span className="text-champagne font-bold">
                      NPR {consensus.monteCarloForecast.targets.day10.target} (+{consensus.monteCarloForecast.targets.day10.upsidePercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">30-Day Target:</span>
                    <span className="text-emerald-400 font-bold">
                      NPR {consensus.monteCarloForecast.targets.day30.target} (+{consensus.monteCarloForecast.targets.day30.upsidePercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Suggested Stop:</span>
                    <span className="text-rose-400 font-bold">
                      NPR {ai?.stopLoss || Math.round(stock.ltp * 0.93)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Institutional Flow:</span>
                    <span className="text-gold font-bold">
                      {consensus.smartMoneyFlow.institutionalSentiment.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 5-Level Market Depth (NEPSE Order Book) */
          marketDepth && (
            <div className="rounded-xl border border-bronze/70 bg-obsidian p-3 font-mono text-[11px] space-y-2">
              <div className="grid grid-cols-2 gap-3 text-center border-b border-bronze/40 pb-1.5 font-sans font-bold">
                <span className="text-emerald-400">BUY ORDERS (BIDS)</span>
                <span className="text-rose-400">SELL ORDERS (ASKS)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Bids Table */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 border-b border-bronze/30 pb-1 mb-1">
                    <span>Orders</span>
                    <span>Qty</span>
                    <span>Bid Price</span>
                  </div>
                  <div className="space-y-1">
                    {marketDepth.bids.map((b, i) => (
                      <div key={i} className="relative flex justify-between py-0.5 px-1 rounded overflow-hidden">
                        <div
                          className="absolute inset-y-0 right-0 bg-emerald-500/15"
                          style={{
                            width: `${Math.min(100, (b.quantity / (marketDepth.totalBidQty / 3)) * 100)}%`,
                          }}
                        />
                        <span className="relative text-slate-400">{b.orders}</span>
                        <span className="relative font-bold text-slate-200">{b.quantity}</span>
                        <span className="relative font-bold text-emerald-400">NPR {b.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between border-t border-bronze/40 pt-1 text-[10px] text-slate-400 mt-1">
                    <span>Total Bid Qty:</span>
                    <span className="font-bold text-emerald-400">{marketDepth.totalBidQty.toLocaleString()}</span>
                  </div>
                </div>

                {/* Asks Table */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 border-b border-bronze/30 pb-1 mb-1">
                    <span>Ask Price</span>
                    <span>Qty</span>
                    <span>Orders</span>
                  </div>
                  <div className="space-y-1">
                    {marketDepth.asks.map((a, i) => (
                      <div key={i} className="relative flex justify-between py-0.5 px-1 rounded overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-rose-500/15"
                          style={{
                            width: `${Math.min(100, (a.quantity / (marketDepth.totalAskQty / 3)) * 100)}%`,
                          }}
                        />
                        <span className="relative font-bold text-rose-400">NPR {a.price}</span>
                        <span className="relative font-bold text-slate-200">{a.quantity}</span>
                        <span className="relative text-slate-400">{a.orders}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between border-t border-bronze/40 pt-1 text-[10px] text-slate-400 mt-1">
                    <span>Total Ask Qty:</span>
                    <span className="font-bold text-rose-400">{marketDepth.totalAskQty.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Modal Actions */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenAnalysis(stock.symbol);
            }}
            className="flex items-center space-x-1.5 text-gold hover:text-champagne font-semibold text-xs transition-colors"
          >
            <span>Open Technical Chart &rarr;</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl gold-gradient-btn px-5 py-2 font-black text-black shadow-gold hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
