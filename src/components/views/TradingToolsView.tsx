"use client";

import React, { useState } from "react";
import {
  Crosshair,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Target,
  Sparkles,
  BarChart3,
  Layers,
} from "lucide-react";
import { ScannerType, ScannerResult } from "@/types";
import { runQuantitativeScanner } from "@/lib/quantitative/scanners";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";

interface TradingToolsViewProps {
  onSelectStock: (symbol: string) => void;
}

export function TradingToolsView({ onSelectStock }: TradingToolsViewProps) {
  const [selectedScanner, setSelectedScanner] = useState<ScannerType>("CONSOLIDATING_UP_BREAKOUT");

  const scannerTabs: Array<{ key: ScannerType; title: string; subtitle: string }> = [
    {
      key: "CONSOLIDATING_UP_BREAKOUT",
      title: "Consolidating Up Breakout",
      subtitle: "Volatility squeeze breaking upper band with volume surge",
    },
    {
      key: "CONSOLIDATING_DOWN_BREAKOUT",
      title: "Consolidating Down Breakdown",
      subtitle: "Support breakdown with heavy sell-side momentum",
    },
    {
      key: "INSIDE_BAR_UP",
      title: "Inside Bar Bullish Breakout",
      subtitle: "Compression inside candle breaking mother high",
    },
    {
      key: "INSIDE_BAR_DOWN",
      title: "Inside Bar Bearish Breakdown",
      subtitle: "Inside candle breaking mother low with downside continuation",
    },
    {
      key: "TRENDING_STOCKS",
      title: "Trending Institutional Stocks",
      subtitle: "Strong moving average stack: Price > 20-SMA > 50-SMA",
    },
    {
      key: "MOMENTUM_SIGNAL",
      title: "Momentum Surge Scanner",
      subtitle: "MACD acceleration + RSI expanding between 55 and 70",
    },
    {
      key: "TREND_RELAY",
      title: "Multi-Timeframe Trend Relay",
      subtitle: "Harmonious trend alignment across Daily & Weekly cycles",
    },
    {
      key: "REVERSAL_SIGNAL",
      title: "Mean Reversal Signal",
      subtitle: "Oversold divergence rebound from historical support",
    },
    {
      key: "INTELLIGENT_AVERAGING",
      title: "Intelligent Averaging",
      subtitle: "High ROE fundamental equities at audited support zones",
    },
  ];

  const results: ScannerResult[] = runQuantitativeScanner(selectedScanner, INITIAL_MARKET_PRICES);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
            <Crosshair className="h-3.5 w-3.5 text-blue-400" />
            <span>9x ADVANCED QUANTITATIVE SCANNERS</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">AUTOMATED SYSTEMATIC ENGINE</span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-white">
          Systematic Market Opportunity Scanner
        </h1>
        <p className="mt-1 text-xs text-slate-400 max-w-2xl">
          Mathematical breakout detection, inside bar range resolutions, and institutional momentum scoring for active NEPSE market participants.
        </p>
      </div>

      {/* 9x Scanner Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scannerTabs.map((s) => {
          const isActive = selectedScanner === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setSelectedScanner(s.key)}
              className={`text-left rounded-xl p-3.5 border transition-all ${
                isActive
                  ? "border-blue-500 bg-blue-600/15 text-white shadow-md shadow-blue-500/20"
                  : "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{s.title}</span>
                {isActive && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
              </div>
              <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{s.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Scanner Results List */}
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Ranked Scanner Results ({results.length} Matches)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Sorted by quantitative confidence score and risk-to-reward ratio.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">TIMEFRAME: DAILY</span>
        </div>

        {results.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No stocks currently meet this specific quantitative filter threshold in today&apos;s session.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectStock(item.symbol)}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 hover:border-blue-500/50 hover:bg-slate-850 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
                        {item.symbol}
                      </span>
                      <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                        {item.companyName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans">
                      Sector: {item.sector}
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

                {/* Entry, Target & Stop Loss Pills */}
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-950/60 p-2 text-center font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans">Entry Range</span>
                    <span className="font-bold text-slate-200">
                      {item.entryZone.min}-{item.entryZone.max}
                    </span>
                  </div>
                  <div className="border-x border-slate-800 px-1">
                    <span className="text-[9px] text-slate-400 block font-sans">Target</span>
                    <span className="font-bold text-emerald-400">NPR {item.targetPrice}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans">Stop Loss</span>
                    <span className="font-bold text-rose-400">NPR {item.stopLoss}</span>
                  </div>
                </div>

                {/* Reasons List */}
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {item.reasons.map((r, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-blue-400">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>

                {/* Footer Metrics */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] font-mono text-slate-400">
                  <span>Confidence: <strong className="text-blue-400">{item.signalConfidence}%</strong></span>
                  <span>R:R: <strong className="text-emerald-400">{item.riskRewardRatio} : 1</strong></span>
                  <span>Vol Ratio: <strong className="text-amber-400">{item.volumeRatio}x</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
