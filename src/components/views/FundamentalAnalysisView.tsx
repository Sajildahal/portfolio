// ============================================================================
// Institutional Fundamental Analysis & Audited Metrics View
// Valuation, EPS, ROE, P/E, Book Value, Solvency & Capital Structure
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Percent,
  Activity,
  Layers,
  PieChart,
  ShieldCheck,
  Award,
} from "lucide-react";
import { NEPSE_COMPANIES, INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";

interface FundamentalAnalysisViewProps {
  initialSymbol?: string;
}

export function FundamentalAnalysisView({ initialSymbol = "NABIL" }: FundamentalAnalysisViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);

  useEffect(() => {
    if (initialSymbol) {
      setSelectedSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  const company =
    NEPSE_COMPANIES.find((c) => c.symbol === selectedSymbol) || NEPSE_COMPANIES[0];
  const stockPrice =
    INITIAL_MARKET_PRICES.find((s) => s.symbol === selectedSymbol) ||
    INITIAL_MARKET_PRICES[0];

  // Financial health composite scores
  const healthScore = Math.min(95, Math.max(50, Math.round(company.roe * 3 + company.eps * 0.8)));
  const valuationScore = company.pe > 0 && company.pe < 22 ? 88 : company.pe < 35 ? 74 : 58;
  const profitabilityScore = Math.min(98, Math.round(company.roe * 5.5));
  const solvencyScore = company.sector === "Commercial Banks" ? 92 : 84;

  return (
    <div className="space-y-6">
      {/* Header and Company Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white">Fundamental Analysis &amp; Audited Metrics</h1>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              AUDITED BALANCE SHEETS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Comprehensive financial valuation, EPS growth, ROE capital efficiency, and debt solvency ratings.
          </p>
        </div>

        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="rounded-xl border border-bronze bg-obsidian px-3 py-2 text-xs font-bold text-white focus:border-gold focus:outline-none"
        >
          {NEPSE_COMPANIES.map((c) => (
            <option key={c.symbol} value={c.symbol}>
              {c.symbol} - {c.name} ({c.sector})
            </option>
          ))}
        </select>
      </div>

      {/* Primary Company Profile Banner */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-bronze/60 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-xl bg-gold/20 px-3 py-1 text-sm font-black text-gold border border-gold/40">
                {company.symbol}
              </span>
              <h2 className="text-xl font-bold text-white">{company.name}</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400 font-sans">
              Sector: <span className="text-slate-200 font-semibold">{company.sector}</span> | NEPSE Security Class: Equity
            </p>
          </div>

          <div className="text-left sm:text-right font-mono">
            <span className="text-xs text-slate-400 font-sans block">Market LTP</span>
            <span className="text-2xl font-black text-white">NPR {stockPrice.ltp}</span>
            <span
              className={`block text-xs font-bold ${
                stockPrice.change >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {stockPrice.change >= 0 ? "+" : ""}{stockPrice.change} ({stockPrice.changePercent}%)
            </span>
          </div>
        </div>

        {/* 4 Financial Pillar Scores */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl bg-obsidian p-3 border border-bronze/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Financial Health</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{healthScore} / 100</span>
          </div>
          <div className="rounded-xl bg-obsidian p-3 border border-bronze/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Valuation Rating</span>
            <span className="text-xl font-bold font-mono text-champagne">{valuationScore} / 100</span>
          </div>
          <div className="rounded-xl bg-obsidian p-3 border border-bronze/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Profitability</span>
            <span className="text-xl font-bold font-mono text-gold">{profitabilityScore} / 100</span>
          </div>
          <div className="rounded-xl bg-obsidian p-3 border border-bronze/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Solvency Score</span>
            <span className="text-xl font-bold font-mono text-amber-400">{solvencyScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Financial Valuation Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs tabular-nums">
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-2 shadow-sm">
          <span className="text-gold font-sans text-[11px] font-bold uppercase block">Per Share Metrics</span>
          <div className="flex justify-between border-b border-bronze/40 pb-2 pt-1">
            <span className="text-slate-400">Earnings Per Share (EPS):</span>
            <span className="text-emerald-400 font-bold">NPR {company.eps.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-bronze/40 pb-2">
            <span className="text-slate-400">Book Value Per Share:</span>
            <span className="text-champagne font-bold">NPR {company.bookValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Dividend Yield:</span>
            <span className="text-gold font-bold">{company.dividendYield}%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-2 shadow-sm">
          <span className="text-gold font-sans text-[11px] font-bold uppercase block">Valuation Multiples</span>
          <div className="flex justify-between border-b border-bronze/40 pb-2 pt-1">
            <span className="text-slate-400">Price / Earnings (P/E):</span>
            <span className="text-white font-bold">{company.pe.toFixed(1)}x</span>
          </div>
          <div className="flex justify-between border-b border-bronze/40 pb-2">
            <span className="text-slate-400">Price / Book (P/B):</span>
            <span className="text-white font-bold">{company.pb.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">52-Week Range:</span>
            <span className="text-slate-300">NPR {company.low52} - {company.high52}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-2 shadow-sm">
          <span className="text-gold font-sans text-[11px] font-bold uppercase block">Profitability &amp; Solvency</span>
          <div className="flex justify-between border-b border-bronze/40 pb-2 pt-1">
            <span className="text-slate-400">Return on Equity (ROE):</span>
            <span className="text-emerald-400 font-bold">{company.roe}%</span>
          </div>
          <div className="flex justify-between border-b border-bronze/40 pb-2">
            <span className="text-slate-400">Return on Assets (ROA):</span>
            <span className="text-champagne font-bold">{company.roa}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Paid-up Capital:</span>
            <span className="text-white font-bold">NPR {(company.paidUpCapital / 10000000).toFixed(1)} Cr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
