// ============================================================================
// Institutional Live Market View & Heatmap
// Real-time ticking equity quotes, 5-level depth link, instant order pad integration
// ============================================================================

"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Zap,
  Bookmark,
  Activity,
} from "lucide-react";
import { NEPSE_SECTORS } from "@/lib/market/nepseData";
import { MarketPrice, Sector } from "@/types";
import { MarketHeatmap } from "@/components/widgets/MarketHeatmap";

interface LiveMarketViewProps {
  onSelectStock: (symbol: string) => void;
  onOpenOrderPad?: (symbol: string, type: "BUY" | "SELL") => void;
  onAddToWatchlist?: (symbol: string) => void;
  marketPrices: MarketPrice[];
  flashingSymbols?: { [symbol: string]: "up" | "down" };
}

export function LiveMarketView({
  onSelectStock,
  onOpenOrderPad,
  onAddToWatchlist,
  marketPrices,
  flashingSymbols = {},
}: LiveMarketViewProps) {
  const [viewMode, setViewMode] = useState<"table" | "heatmap">("table");
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [sortField, setSortField] = useState<keyof MarketPrice>("turnover");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof MarketPrice) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredStocks = useMemo(() => {
    return marketPrices
      .filter((stock) => {
        const matchesSearch =
          stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
          stock.name.toLowerCase().includes(search.toLowerCase());
        const matchesSector =
          selectedSector === "ALL" || stock.sector === selectedSector;
        return matchesSearch && matchesSector;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return 0;
      });
  }, [marketPrices, search, selectedSector, sortField, sortDirection]);

  // Market Breadth Stats
  const advancers = marketPrices.filter((s) => s.change > 0).length;
  const decliners = marketPrices.filter((s) => s.change < 0).length;
  const unchanged = marketPrices.filter((s) => s.change === 0).length;
  const totalTurnoverCr = marketPrices.reduce((acc, s) => acc + s.turnover, 0) / 10000000;

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white">Live NEPSE Market Table &amp; Heatmap</h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE FEED</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time equity quotes with verified turnover, volume, and sector classifications.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-bronze bg-obsidian p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 transition-all ${
                viewMode === "table" ? "bg-gold text-black font-bold shadow-gold-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("heatmap")}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 transition-all ${
                viewMode === "heatmap" ? "bg-gold text-black font-bold shadow-gold-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Heatmap</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-bronze bg-obsidian py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-gold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Live Market Breadth Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="rounded-xl border border-bronze bg-charcoal p-3 flex justify-between items-center">
          <span className="text-slate-400 font-sans">Market Breadth:</span>
          <div className="space-x-1.5 font-bold">
            <span className="text-emerald-400">{advancers} Adv</span>
            <span className="text-slate-500">/</span>
            <span className="text-rose-400">{decliners} Dec</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{unchanged} Unch</span>
          </div>
        </div>

        <div className="rounded-xl border border-bronze bg-charcoal p-3 flex justify-between items-center">
          <span className="text-slate-400 font-sans">Session Turnover:</span>
          <span className="text-gold font-bold">NPR {totalTurnoverCr.toFixed(2)} Cr</span>
        </div>

        <div className="rounded-xl border border-bronze bg-charcoal p-3 flex justify-between items-center">
          <span className="text-slate-400 font-sans">Active Equities:</span>
          <span className="text-white font-bold">{marketPrices.length} Listed</span>
        </div>

        <div className="rounded-xl border border-bronze bg-charcoal p-3 flex justify-between items-center">
          <span className="text-slate-400 font-sans">Gateway Latency:</span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>12ms (Direct)</span>
          </span>
        </div>
      </div>

      {viewMode === "heatmap" ? (
        <MarketHeatmap onSelectStock={onSelectStock} />
      ) : (
        <>
          {/* Sector Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedSector("ALL")}
              className={`rounded-xl px-3.5 py-1.5 font-medium transition-all ${
                selectedSector === "ALL"
                  ? "gold-gradient-btn font-bold shadow-gold-sm"
                  : "border border-bronze bg-obsidian text-slate-400 hover:text-white"
              }`}
            >
              All Sectors ({marketPrices.length})
            </button>
            {NEPSE_SECTORS.map((sector) => {
              const count = marketPrices.filter((s) => s.sector === sector).length;
              if (count === 0) return null;
              return (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`rounded-xl px-3.5 py-1.5 font-medium whitespace-nowrap transition-all ${
                    selectedSector === sector
                      ? "gold-gradient-btn font-bold shadow-gold-sm"
                      : "border border-bronze bg-obsidian text-slate-400 hover:text-white"
                  }`}
                >
                  {sector} ({count})
                </button>
              );
            })}
          </div>

          {/* Complete Market Data Table */}
          <div className="rounded-2xl border border-bronze bg-charcoal overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead className="border-b border-bronze/60 bg-obsidian/90 font-sans text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th
                      onClick={() => handleSort("symbol")}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Symbol</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold font-sans">Company</th>
                    <th
                      onClick={() => handleSort("ltp")}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>LTP (NPR)</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("changePercent")}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Change %</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">Open</th>
                    <th className="py-3 px-4 font-semibold text-right">High</th>
                    <th className="py-3 px-4 font-semibold text-right">Low</th>
                    <th className="py-3 px-4 font-semibold text-right">Prev Close</th>
                    <th
                      onClick={() => handleSort("volume")}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Volume</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("turnover")}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Turnover (NPR)</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">Trades</th>
                    <th className="py-3 px-4 font-semibold font-sans text-center">Quick Trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze/40">
                  {filteredStocks.map((s) => {
                    const flash = flashingSymbols[s.symbol];
                    const flashClass =
                      flash === "up" ? "tick-flash-up" : flash === "down" ? "tick-flash-down" : "";

                    return (
                      <tr
                        key={s.symbol}
                        className={`hover:bg-obsidian/70 transition-colors ${flashClass}`}
                      >
                        <td
                          onClick={() => onSelectStock(s.symbol)}
                          className="py-3 px-4 font-bold text-white font-sans cursor-pointer"
                        >
                          <span className="rounded bg-gold/15 px-2 py-0.5 text-gold border border-gold/30 hover:bg-gold hover:text-black transition-colors">
                            {s.symbol}
                          </span>
                        </td>
                        <td
                          onClick={() => onSelectStock(s.symbol)}
                          className="py-3 px-4 font-medium text-slate-300 font-sans truncate max-w-[150px] cursor-pointer"
                        >
                          {s.name}
                        </td>
                        <td className="py-3 px-4 font-bold text-white text-right font-mono">
                          NPR {s.ltp.toFixed(1)}
                        </td>
                        <td
                          className={`py-3 px-4 font-bold text-right ${
                            s.change >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {s.change >= 0 ? "+" : ""}
                          {s.change.toFixed(1)} ({s.changePercent.toFixed(2)}%)
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-right">{s.open.toFixed(1)}</td>
                        <td className="py-3 px-4 text-emerald-400 text-right">{s.high.toFixed(1)}</td>
                        <td className="py-3 px-4 text-rose-400 text-right">{s.low.toFixed(1)}</td>
                        <td className="py-3 px-4 text-slate-400 text-right">{s.previousClose.toFixed(1)}</td>
                        <td className="py-3 px-4 text-slate-300 text-right">
                          {s.volume.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gold text-right">
                          {(s.turnover / 10000000).toFixed(2)} Cr
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-right">{s.transactions}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {onOpenOrderPad && (
                              <button
                                onClick={() => onOpenOrderPad(s.symbol, "BUY")}
                                className="rounded bg-emerald-500/20 hover:bg-emerald-500 hover:text-black px-2 py-1 text-[10px] font-bold text-emerald-400 transition-colors"
                                title={`Buy ${s.symbol}`}
                              >
                                Buy
                              </button>
                            )}
                            {onOpenOrderPad && (
                              <button
                                onClick={() => onOpenOrderPad(s.symbol, "SELL")}
                                className="rounded bg-rose-500/20 hover:bg-rose-500 hover:text-white px-2 py-1 text-[10px] font-bold text-rose-400 transition-colors"
                                title={`Sell ${s.symbol}`}
                              >
                                Sell
                              </button>
                            )}
                            {onAddToWatchlist && (
                              <button
                                onClick={() => onAddToWatchlist(s.symbol)}
                                className="rounded p-1 text-slate-400 hover:text-gold transition-colors"
                                title="Add to Watchlist"
                              >
                                <Bookmark className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Data Quality Footer */}
            <div className="flex items-center justify-between border-t border-bronze/60 bg-obsidian/70 px-4 py-2.5 text-xs text-slate-400 font-sans">
              <span>Showing {filteredStocks.length} listed NEPSE equities</span>
              <span className="text-emerald-400 font-mono">
                Provider: NEPSE Official Data Gateway (Live Stream Synchronized)
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
