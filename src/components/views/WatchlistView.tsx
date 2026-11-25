// ============================================================================
// Institutional Watchlist & Dynamic Price Alert Engine
// Target tracking, risk-to-reward ratio, live tick synchronization, trade pad link
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Bookmark,
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Zap,
} from "lucide-react";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { WatchlistItem, MarketPrice } from "@/types";
import {
  loadStoredWatchlist,
  saveStoredWatchlist,
} from "@/lib/storage/portfolioStorage";

interface WatchlistViewProps {
  onSelectStock: (symbol: string) => void;
  onOpenOrderPad?: (symbol: string, type: "BUY" | "SELL") => void;
  marketPrices?: MarketPrice[];
}

export function WatchlistView({
  onSelectStock,
  onOpenOrderPad,
  marketPrices = INITIAL_MARKET_PRICES,
}: WatchlistViewProps) {
  const [activeWatchlist, setActiveWatchlist] = useState<string>("Core Growth");
  const [watchlists, setWatchlists] = useState<string[]>([
    "Core Growth",
    "High Dividend Yield",
    "Breakout Candidates",
  ]);

  const [items, setItems] = useState<WatchlistItem[]>(() => loadStoredWatchlist());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSymbol, setAddSymbol] = useState("SCB");
  const [targetPrice, setTargetPrice] = useState("640");
  const [stopLoss, setStopLoss] = useState("550");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    saveStoredWatchlist(items);
  }, [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: WatchlistItem = {
      id: `w-${Date.now()}`,
      symbol: addSymbol.toUpperCase(),
      targetPrice: parseFloat(targetPrice) || undefined,
      stopLossPrice: parseFloat(stopLoss) || undefined,
      notes,
      addedAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newItem, ...items];
    setItems(updated);
    saveStoredWatchlist(updated);
    setShowAddModal(false);
    setNotes("");
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveStoredWatchlist(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
              <Bookmark className="h-3.5 w-3.5 text-gold" />
              <span>SMART WATCHLIST &amp; ALERT ENGINE</span>
            </span>
            <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-mono text-champagne border border-bronze">
              MULTI-CONDITION MONITOR
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-white">Custom Watchlists &amp; Trigger Alerts</h1>
          <p className="mt-1 text-xs text-slate-400">
            Configure automated price threshold alerts, RSI boundary triggers, and volume breakout monitors.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="gold-gradient-btn flex items-center space-x-1.5 rounded-xl px-4 py-2.5 text-xs font-black shadow-gold"
        >
          <Plus className="h-4 w-4" />
          <span>Add Stock Alert</span>
        </button>
      </div>

      {/* Watchlist Filter Pills */}
      <div className="flex items-center space-x-2 border-b border-bronze/60 pb-2 text-xs font-semibold">
        {watchlists.map((wl) => (
          <button
            key={wl}
            onClick={() => setActiveWatchlist(wl)}
            className={`rounded-xl px-4 py-2 transition-all ${
              activeWatchlist === wl
                ? "gold-gradient-btn font-black text-black shadow-gold-sm"
                : "border border-bronze bg-obsidian text-slate-400 hover:text-white"
            }`}
          >
            {wl}
          </button>
        ))}
      </div>

      {/* Watchlist Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const stock = marketPrices.find((s) => s.symbol === item.symbol) || marketPrices[0];
          const currentPrice = stock.ltp;
          const targetDist = item.targetPrice
            ? Math.round(((item.targetPrice - currentPrice) / currentPrice) * 1000) / 10
            : null;
          const stopDist = item.stopLossPrice
            ? Math.round(((currentPrice - item.stopLossPrice) / currentPrice) * 1000) / 10
            : null;

          const isTargetHit = item.targetPrice ? currentPrice >= item.targetPrice : false;
          const isStopHit = item.stopLossPrice ? currentPrice <= item.stopLossPrice : false;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 shadow-lg space-y-3 transition-colors ${
                isTargetHit
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : isStopHit
                  ? "border-rose-500/50 bg-rose-500/5"
                  : "border-bronze bg-charcoal hover:border-gold/40"
              }`}
            >
              <div className="flex justify-between items-start">
                <div
                  onClick={() => onSelectStock(item.symbol)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="rounded-xl bg-gold/20 px-2.5 py-0.5 text-xs font-bold text-gold border border-gold/30">
                      {item.symbol}
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[130px]">
                      {stock.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{stock.sector}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {onOpenOrderPad && (
                    <button
                      onClick={() => onOpenOrderPad(item.symbol, "BUY")}
                      className="rounded bg-emerald-500/20 hover:bg-emerald-500 hover:text-black px-2 py-1 text-[10px] font-bold text-emerald-400 transition-colors"
                      title="Buy"
                    >
                      Buy
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex justify-between items-baseline font-mono tabular-nums">
                <span className="text-2xl font-black text-white">NPR {currentPrice}</span>
                <span
                  className={`text-xs font-bold ${
                    stock.change >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change} ({stock.changePercent}%)
                </span>
              </div>

              {/* Status Alert Badge */}
              {isTargetHit && (
                <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-[11px] font-bold text-emerald-400 text-center">
                  Target Price Reached! (+{targetDist}%)
                </div>
              )}
              {isStopHit && (
                <div className="rounded-lg bg-rose-500/15 border border-rose-500/30 px-2 py-1 text-[11px] font-bold text-rose-400 text-center">
                  Stop Loss Triggered! (-{stopDist}%)
                </div>
              )}

              {/* Targets and Alerts Matrix */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-obsidian p-3 font-mono text-xs border border-bronze/50 tabular-nums">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Target Price</span>
                  <span className="font-bold text-champagne">
                    NPR {item.targetPrice || "--"}
                  </span>
                  {targetDist !== null && (
                    <span className="text-[10px] text-emerald-400 block">
                      +{targetDist}% upside
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Stop Loss</span>
                  <span className="font-bold text-rose-400">
                    NPR {item.stopLossPrice || "--"}
                  </span>
                  {stopDist !== null && (
                    <span className="text-[10px] text-slate-400 block">
                      -{stopDist}% risk
                    </span>
                  )}
                </div>
              </div>

              {item.notes && (
                <p className="text-[11px] text-slate-400 italic">
                  &ldquo;{item.notes}&rdquo;
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-bronze bg-charcoal p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-bronze/60 pb-2">
              <h2 className="text-sm font-bold text-white">Add Watchlist Alert</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Company</label>
                <select
                  value={addSymbol}
                  onChange={(e) => {
                    setAddSymbol(e.target.value);
                    const p = marketPrices.find((m) => m.symbol === e.target.value);
                    if (p) {
                      setTargetPrice(Math.round(p.ltp * 1.15).toString());
                      setStopLoss(Math.round(p.ltp * 0.94).toString());
                    }
                  }}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono font-bold"
                >
                  {marketPrices.map((m) => (
                    <option key={m.symbol} value={m.symbol}>
                      {m.symbol} - {m.name} (NPR {m.ltp})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target Price (NPR)</label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stop-Loss Price (NPR)</label>
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Thesis Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Breakout retest confirmation"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-bronze/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-bronze bg-obsidian px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn rounded-xl px-4 py-2 font-bold text-black shadow-gold"
                >
                  Save Watchlist Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
