"use client";

import React, { useState } from "react";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { Sector } from "@/types";
import { LayoutGrid } from "lucide-react";

interface MarketHeatmapProps {
  onSelectStock: (symbol: string) => void;
}

export function MarketHeatmap({ onSelectStock }: MarketHeatmapProps) {
  const [metric, setMetric] = useState<"turnover" | "volume">("turnover");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");

  const sectors: Sector[] = Array.from(
    new Set(INITIAL_MARKET_PRICES.map((s) => s.sector))
  );

  const filtered = INITIAL_MARKET_PRICES.filter(
    (s) => selectedSector === "ALL" || s.sector === selectedSector
  );

  const getHeatmapColor = (changePercent: number) => {
    if (changePercent >= 3.0) return "bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400/40";
    if (changePercent >= 1.0) return "bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border-emerald-600/30";
    if (changePercent > 0) return "bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border-emerald-800/40";
    if (changePercent === 0) return "bg-obsidian hover:bg-slate-800 text-slate-300 border-bronze";
    if (changePercent > -1.0) return "bg-rose-950/70 hover:bg-rose-900 text-rose-200 border-rose-800/40";
    if (changePercent > -3.0) return "bg-rose-800/80 hover:bg-rose-700 text-rose-100 border-rose-600/30";
    return "bg-rose-600/90 hover:bg-rose-500 text-white border-rose-400/40";
  };

  return (
    <div className="rounded-2xl border border-bronze bg-charcoal p-5 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-bronze/60 pb-3">
        <div>
          <h2 className="text-sm font-bold text-champagne flex items-center space-x-2">
            <LayoutGrid className="h-4 w-4 text-gold" />
            <span>NEPSE Market Heatmap &amp; Liquidity Matrix</span>
            <span className="rounded bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/30">
              REAL-TIME
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Tile color denotes session gain/loss; tile size represents market turnover depth.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="flex rounded-xl border border-bronze bg-obsidian p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMetric("turnover")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                metric === "turnover"
                  ? "gold-gradient-btn text-black font-black"
                  : "text-slate-400 hover:text-champagne"
              }`}
            >
              Turnover
            </button>
            <button
              onClick={() => setMetric("volume")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                metric === "volume"
                  ? "gold-gradient-btn text-black font-black"
                  : "text-slate-400 hover:text-champagne"
              }`}
            >
              Volume
            </button>
          </div>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="rounded-xl border border-bronze bg-obsidian px-3 py-1.5 text-xs text-white focus:border-gold focus:outline-none"
          >
            <option value="ALL">All Sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {filtered.map((stock) => {
          const colorClass = getHeatmapColor(stock.changePercent);
          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className={`rounded-xl p-3 cursor-pointer transition-all border shadow-sm flex flex-col justify-between h-24 ${colorClass}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-black text-sm tracking-tight">{stock.symbol}</span>
                <span className="font-mono text-xs font-bold">
                  {stock.changePercent >= 0 ? "+" : ""}
                  {stock.changePercent}%
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold block">
                  NPR {stock.ltp.toLocaleString()}
                </span>
                <span className="text-[10px] opacity-80 block truncate">
                  {metric === "turnover"
                    ? `NPR ${(stock.turnover / 10000000).toFixed(1)} Cr`
                    : `${stock.volume.toLocaleString()} Shs`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
