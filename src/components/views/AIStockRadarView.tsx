"use client";

import React, { useState, useMemo } from "react";
import {
  Radar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart2,
} from "lucide-react";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { computeStockIntelligenceScore } from "@/lib/ai/institutionalEngine";
import { InstitutionalStockScore } from "@/types";

interface AIStockRadarViewProps {
  onSelectStock: (symbol: string) => void;
}

export function AIStockRadarView({ onSelectStock }: AIStockRadarViewProps) {
  const [filterMode, setFilterMode] = useState<
    "ALL" | "MOMENTUM_WATCH" | "ACCUMULATION_WATCH" | "BREAKOUT_WATCH" | "RISK_WATCH" | "BUY" | "VALUE"
  >("ALL");
  const [search, setSearch] = useState("");

  const allScores = useMemo(() => {
    return INITIAL_MARKET_PRICES.map((stock) =>
      computeStockIntelligenceScore(stock.symbol, false)
    );
  }, []);

  const filteredScores = useMemo(() => {
    return allScores.filter((item) => {
      const matchesSearch =
        item.symbol.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === "MOMENTUM_WATCH") return item.technicalStrength >= 65 && item.action === "BUY";
      if (filterMode === "ACCUMULATION_WATCH") return item.liquidityTradability >= 65;
      if (filterMode === "BREAKOUT_WATCH") return item.totalScore >= 70 && item.riskScore <= 50;
      if (filterMode === "RISK_WATCH") return item.riskScore >= 60 || item.action === "AVOID" || item.action === "SELL";
      if (filterMode === "BUY") return item.action === "BUY";
      if (filterMode === "VALUE") return item.fundamentalQuality >= 65 && item.riskScore <= 50;
      return true;
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [allScores, filterMode, search]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
            <Radar className="h-3.5 w-3.5 text-gold" />
            <span>01 · DISCOVERY &amp; DETERIORATION RADAR</span>
          </span>
          <span className="text-xs text-gold-champagne font-mono">100-POINT MULTI-FACTOR ENGINE</span>
        </div>
        <h1 className="mt-2.5 text-2xl font-black text-white sm:text-3xl">
          AI Stock Intelligence Radar
        </h1>
        <p className="mt-1 text-xs text-slate-400 max-w-2xl">
          Identifies high-conviction institutional setups while warning against deteriorating balance sheets and overpriced momentum traps across the entire NEPSE universe.
        </p>

        {/* Scoring Weights Ribbon */}
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono border-t border-bronze pt-3">
          <span className="rounded bg-obsidian border border-bronze px-2 py-0.5 text-slate-300">
            Technical: <strong className="text-gold">30%</strong>
          </span>
          <span className="rounded bg-obsidian border border-bronze px-2 py-0.5 text-slate-300">
            Fundamental: <strong className="text-gold">25%</strong>
          </span>
          <span className="rounded bg-obsidian border border-bronze px-2 py-0.5 text-slate-300">
            Sector/Market: <strong className="text-gold">15%</strong>
          </span>
          <span className="rounded bg-obsidian border border-bronze px-2 py-0.5 text-slate-300">
            Liquidity: <strong className="text-gold">10%</strong>
          </span>
          <span className="rounded bg-obsidian border border-bronze px-2 py-0.5 text-slate-300">
            Sentiment: <strong className="text-gold">10%</strong>
          </span>
          <span className="rounded bg-obsidian border border-bronze px-2 py-0.5 text-slate-300">
            Risk-Adjusted: <strong className="text-gold">10%</strong>
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {[
            { key: "ALL", label: `All Stocks (${allScores.length})` },
            { key: "MOMENTUM_WATCH", label: "⚡ Momentum Watch" },
            { key: "ACCUMULATION_WATCH", label: "🏛️ Accumulation Watch" },
            { key: "BREAKOUT_WATCH", label: "🎯 Breakout Watch" },
            { key: "RISK_WATCH", label: "⚠️ Risk Watch" },
            { key: "BUY", label: "Strong Buy Candidates" },
            { key: "VALUE", label: "Value Quality" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterMode(tab.key as any)}
              className={`rounded-xl px-3.5 py-2 transition-all ${
                filterMode === tab.key
                  ? "gold-gradient-btn shadow-gold-sm"
                  : "bg-charcoal border border-bronze text-slate-300 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter symbol or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-bronze bg-obsidian px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-gold focus:outline-none w-full sm:w-60"
        />
      </div>

      {/* Stock Radar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScores.map((item) => (
          <div
            key={item.symbol}
            onClick={() => onSelectStock(item.symbol)}
            className="rounded-2xl border border-bronze bg-charcoal p-5 shadow-lg space-y-3.5 hover:border-gold/50 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Symbol, Price, and Action Badge */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-lg bg-gold/15 px-2 py-0.5 text-xs font-black text-gold border border-gold/30">
                      {item.symbol}
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[140px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">
                    {item.sector}
                  </span>
                </div>

                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-white">NPR {item.ltp}</span>
                  <span
                    className={`block text-[11px] font-bold ${
                      item.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {item.changePercent >= 0 ? "+" : ""}
                    {item.changePercent}%
                  </span>
                </div>
              </div>

              {/* Action Decision Pill & Total Score */}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-obsidian p-2.5 border border-bronze font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-sans">
                    Action Decision
                  </span>
                  <span
                    className={`inline-block font-black text-xs px-2 py-0.5 rounded border mt-0.5 ${
                      item.action === "BUY"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : item.action === "HOLD"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : item.action === "REDUCE"
                        ? "bg-amber-500/25 text-amber-300 border-amber-500/50"
                        : item.action === "SELL"
                        ? "bg-rose-500/25 text-rose-400 border-rose-500/50"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {item.action}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block uppercase font-sans">
                    Intelligence Score
                  </span>
                  <span className="text-base font-black text-gold">
                    {item.totalScore} <span className="text-[10px] text-slate-500">/ 100</span>
                  </span>
                </div>
              </div>

              {/* Multi-Factor Progress Breakdown */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                <div className="rounded bg-charcoal-light p-1.5 border border-bronze/50">
                  <span className="text-[9px] text-slate-500 block font-sans">Technical (30%)</span>
                  <span className="font-bold text-white">{item.technicalStrength}</span>
                </div>
                <div className="rounded bg-charcoal-light p-1.5 border border-bronze/50">
                  <span className="text-[9px] text-slate-500 block font-sans">Fundamental (25%)</span>
                  <span className="font-bold text-white">{item.fundamentalQuality}</span>
                </div>
                <div className="rounded bg-charcoal-light p-1.5 border border-bronze/50">
                  <span className="text-[9px] text-slate-500 block font-sans">Risk Score</span>
                  <span
                    className={`font-bold ${
                      item.riskScore >= 65 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {item.riskScore}
                  </span>
                </div>
              </div>

              {/* Deterioration Alert or Opportunity Note */}
              <div className="mt-2 text-[11px] text-slate-300">
                {item.keyDeteriorationAlert ? (
                  <div className="rounded-lg bg-rose-950/30 border border-rose-500/30 p-2 text-rose-300 flex items-start space-x-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{item.keyDeteriorationAlert}</span>
                  </div>
                ) : (
                  <p className="line-clamp-2 text-slate-400 italic">
                    &ldquo;{item.primaryThesis}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Footer Metrics */}
            <div className="flex items-center justify-between border-t border-bronze pt-2.5 text-[10px] font-mono text-slate-400">
              <span>Liquidity: <strong className="text-white">{item.liquidityRating}</strong></span>
              <span>R:R: <strong className="text-emerald-400">{item.rewardRiskRatio} : 1</strong></span>
              <span className="text-gold flex items-center space-x-0.5">
                <span>View Details</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
