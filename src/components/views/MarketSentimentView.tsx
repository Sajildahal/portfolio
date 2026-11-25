"use client";

import React from "react";
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Activity,
  ShieldAlert,
  Flame,
} from "lucide-react";
import { computeMarketSentiment, detectUnusualActivity } from "@/lib/sentiment/sentimentEngine";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";

interface MarketSentimentViewProps {
  onSelectStock: (symbol: string) => void;
}

export function MarketSentimentView({ onSelectStock }: MarketSentimentViewProps) {
  const sentiment = computeMarketSentiment(INITIAL_MARKET_PRICES);
  const alerts = detectUnusualActivity(INITIAL_MARKET_PRICES);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <Gauge className="h-3.5 w-3.5 text-emerald-400" />
            <span>NEPSE TRADER EMOTION & SENTIMENT</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">MEASURABLE MARKET PSYCHOLOGY</span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-white">Market Sentiment & Psychology Tracker</h1>
        <p className="mt-1 text-xs text-slate-400">
          Evaluates market-wide order flow, institutional volume accumulation, buying/selling pressure imbalance, and unusual transaction activity.
        </p>
      </div>

      {/* Fear & Greed Dial Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 text-center space-y-4 lg:col-span-1 shadow-lg">
          <h2 className="text-sm font-bold text-white flex items-center justify-center space-x-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <span>NEPSE Fear & Greed Index</span>
          </h2>

          <div className="py-4">
            <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-900 shadow-inner">
              <div className="text-center font-mono">
                <span className="text-4xl font-black text-white">{sentiment.score}</span>
                <span className="text-[10px] text-slate-400 block font-sans">OUT OF 100</span>
              </div>
            </div>
            <p
              className={`mt-4 text-base font-bold ${
                sentiment.score >= 58 ? "text-emerald-400" : sentiment.score <= 42 ? "text-rose-400" : "text-amber-400"
              }`}
            >
              Current State: {sentiment.status}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {sentiment.score >= 58
                ? "Bullish optimism and healthy turnover momentum dominate session flows."
                : "Defensive positioning with cautious order book depth."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-3 text-xs font-mono">
            <div className="rounded-lg bg-slate-900/60 p-2">
              <span className="text-slate-400 block text-[10px]">Bullish Breadth</span>
              <span className="font-bold text-emerald-400">{sentiment.bullishPercent}%</span>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-2">
              <span className="text-slate-400 block text-[10px]">Bearish Breadth</span>
              <span className="font-bold text-rose-400">{sentiment.bearishPercent}%</span>
            </div>
          </div>
        </div>

        {/* Buying vs Selling Pressure Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 lg:col-span-2 space-y-4 shadow-lg">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <span>Market Order Flow & Volume Pressure</span>
          </h2>

          {/* Volume Pressure Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-emerald-400 font-bold">
                Buying Pressure: {sentiment.buyingPressureRatio}%
              </span>
              <span className="text-rose-400 font-bold">
                Selling Pressure: {100 - sentiment.buyingPressureRatio}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${sentiment.buyingPressureRatio}%` }}
              ></div>
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${100 - sentiment.buyingPressureRatio}%` }}
              ></div>
            </div>
          </div>

          {/* Psychological Insights Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="rounded-xl bg-slate-900/60 p-3.5 space-y-1">
              <span className="font-bold text-slate-200 block">Price-Volume Expansion</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                NEPSE benchmark registered +1.09% on elevated turnover of NPR 6.84 Arba, confirming constructive institutional accumulation rather than thin retail drift.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/60 p-3.5 space-y-1">
              <span className="font-bold text-slate-200 block">Sector Divergence</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Hydropower and Non-Life Insurance led session gains (+2.1% and +1.81%), indicating rotation into beta growth assets while Banking provided steady index support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Abnormal Activity & Large Transaction Alerts */}
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Unusual Transaction & Block Trade Alerts</span>
            </h2>
            <p className="text-xs text-slate-400">
              Algorithmic detection of volume explosions, concentrated block trades, and abnormal liquidity spikes.
            </p>
          </div>
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400 font-mono">
            {alerts.length} ALERTS TODAY
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectStock(alert.symbol)}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4 hover:border-blue-500/50 hover:bg-slate-850 transition-all cursor-pointer gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
                    {alert.symbol}
                  </span>
                  <span className="text-xs font-semibold text-white">{alert.companyName}</span>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                      alert.severity === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {alert.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{alert.message}</p>
              </div>

              <div className="text-left sm:text-right font-mono text-xs flex-shrink-0">
                <span className="text-slate-400 block text-[10px]">{alert.timestamp}</span>
                <span className="text-amber-400 font-bold">{alert.volumeRatio}x Avg Vol</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
