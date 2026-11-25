"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  PieChart,
  Bot,
  Zap,
  ShieldCheck,
  ChevronRight,
  Radar,
  LogOut,
  FileText,
  Scale,
  Sparkles,
  BarChart2,
  Gauge,
  Layers,
  Clock,
  Crosshair,
  Compass,
} from "lucide-react";
import { INITIAL_INDICES, INITIAL_MARKET_PRICES, generateHistoricalCandles } from "@/lib/market/nepseData";
import { calculateSMA } from "@/lib/quantitative/indicators";
import { PortfolioSummary, Holding } from "@/types";
import { TabKey } from "../Sidebar";
import { CandlestickChart } from "@/components/charts/CandlestickChart";
import { MarketHeatmap } from "@/components/widgets/MarketHeatmap";
import { AdBannerWidget } from "@/components/widgets/AdBannerWidget";

interface DashboardViewProps {
  summary: PortfolioSummary;
  holdings: Holding[];
  onNavigate: (tab: TabKey) => void;
  onSelectStock: (symbol: string) => void;
}

export function DashboardView({
  summary,
  holdings,
  onNavigate,
  onSelectStock,
}: DashboardViewProps) {
  const [activePreviewSymbol, setActivePreviewSymbol] = useState<string>("NABIL");

  const nepseIndex = INITIAL_INDICES[0];
  const sensitiveIndex = INITIAL_INDICES[1];

  const previewCandles = useMemo(() => {
    return generateHistoricalCandles(activePreviewSymbol, 35);
  }, [activePreviewSymbol]);

  const previewCloses = useMemo(() => previewCandles.map((c) => c.close), [previewCandles]);
  const previewSMA20 = useMemo(() => calculateSMA(previewCloses, 20), [previewCloses]);
  const previewSMA50 = useMemo(() => calculateSMA(previewCloses, 50), [previewCloses]);

  const topGainers = useMemo(() => {
    return [...INITIAL_MARKET_PRICES]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5);
  }, []);

  const topLosers = useMemo(() => {
    return [...INITIAL_MARKET_PRICES]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5);
  }, []);

  const topTurnover = useMemo(() => {
    return [...INITIAL_MARKET_PRICES]
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 5);
  }, []);

  return (
    <div className="space-y-6">
      {/* Trader Terminal Hero Banner */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
                <Activity className="h-3.5 w-3.5 text-gold" />
                <span>NEPSE INTELLIGENCE AI TERMINAL</span>
              </span>
              <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-mono text-champagne border border-bronze">
                INSTITUTIONAL EDITION v3.4.1
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Professional Trading &amp; Portfolio Dashboard
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              High-frequency NEPSE market monitoring, multi-factor quantitative scoring, risk-aware capital preservation, and automated SEBON regulatory compliance.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate("stock-radar")}
              className="gold-gradient-btn rounded-xl px-4 py-2.5 text-xs font-black shadow-gold flex items-center space-x-2"
            >
              <Radar className="h-4 w-4" />
              <span>01 · AI Stock Radar</span>
            </button>
            <button
              onClick={() => onNavigate("portfolio-doctor")}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all flex items-center space-x-1.5"
            >
              <ShieldCheck className="h-4 w-4 text-rose-400" />
              <span>02 · Portfolio Doctor</span>
            </button>
            <button
              onClick={() => onNavigate("copilot")}
              className="rounded-xl border border-bronze bg-obsidian px-4 py-2.5 text-xs font-bold text-champagne hover:border-gold/40 hover:text-gold transition-all flex items-center space-x-1.5"
            >
              <Bot className="h-4 w-4 text-gold" />
              <span>10 · AI Copilot</span>
            </button>
          </div>
        </div>

        {/* Live Market Breadth Sub-ribbon */}
        <div className="mt-6 pt-4 border-t border-bronze/60 grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">NEPSE Index</span>
            <span className="text-white font-bold">{nepseIndex.current.toLocaleString()}</span>
            <span className="text-emerald-400 text-[10px] ml-1">+{nepseIndex.changePercent}%</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Sensitive Index</span>
            <span className="text-white font-bold">{sensitiveIndex.current.toLocaleString()}</span>
            <span className="text-emerald-400 text-[10px] ml-1">+{sensitiveIndex.changePercent}%</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Market Breadth</span>
            <span className="text-emerald-400 font-bold">142 Adv</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-rose-400 font-bold">98 Dec</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Daily Turnover</span>
            <span className="text-gold font-bold">NPR 6.84 Arba</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Session Status</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>VERIFIED LIVE</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sponsored Partner & Native Campaign Banner */}
      <AdBannerWidget
        placement="dashboard-native"
        onUpgradeClick={() => onNavigate("subscription")}
      />

      {/* Primary Portfolio Health Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Invested */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Invested Capital</span>
            <DollarSign className="h-4 w-4 text-gold" />
          </div>
          <p className="text-2xl font-black font-mono text-white">
            NPR {summary.totalInvested.toLocaleString()}
          </p>
          <div className="text-[11px] text-slate-400">
            Across {summary.holdingsCount} active holdings (WACC Basis)
          </div>
        </div>

        {/* Current Market Value */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Market Value</span>
            <PieChart className="h-4 w-4 text-gold" />
          </div>
          <p className="text-2xl font-black font-mono text-white">
            NPR {summary.currentMarketValue.toLocaleString()}
          </p>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Daily +NPR {summary.dailyChange.toLocaleString()} (+{summary.dailyChangePercent}%)</span>
          </div>
        </div>

        {/* Unrealized Profit / Loss */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unrealized Gain/Loss</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <p
            className={`text-2xl font-black font-mono ${
              summary.unrealizedPL >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {summary.unrealizedPL >= 0 ? "+" : ""}NPR {summary.unrealizedPL.toLocaleString()}
          </p>
          <div className="text-[11px] font-mono font-bold text-slate-300">
            Return: {summary.unrealizedPLPercent >= 0 ? "+" : ""}{summary.unrealizedPLPercent}%
          </div>
        </div>

        {/* Liquid Cash Buffer */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cash Reserve Buffer</span>
            <ShieldCheck className="h-4 w-4 text-champagne" />
          </div>
          <p className="text-2xl font-black font-mono text-champagne">
            NPR {summary.cashBalance.toLocaleString()}
          </p>
          <div className="text-[11px] text-slate-400">
            {((summary.cashBalance / Math.max(1, summary.currentMarketValue)) * 100).toFixed(1)}% liquid for dip accumulation
          </div>
        </div>
      </div>

      {/* Middle Section: Live Candlestick Preview + 10 Flagship AI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Candlestick Studio Preview (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-bronze bg-charcoal p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-bronze/60 pb-3 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center space-x-1.5">
                <BarChart2 className="h-4 w-4 text-gold" />
                <span>Live Technical Candlestick Monitor</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal block">
                Interactive real-time OHLCV stream
              </span>
            </div>

            {/* Quick Symbol Switcher */}
            <div className="flex items-center space-x-1.5">
              {["NABIL", "GBIME", "CIT", "SHIVM", "HDHPC"].map((sym) => (
                <button
                  key={sym}
                  onClick={() => setActivePreviewSymbol(sym)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    activePreviewSymbol === sym
                      ? "gold-gradient-btn font-black text-black"
                      : "border border-bronze bg-obsidian text-slate-400 hover:text-champagne"
                  }`}
                >
                  {sym}
                </button>
              ))}
              <button
                onClick={() => onNavigate("technical")}
                className="rounded-lg border border-bronze bg-obsidian px-2 py-1 text-[11px] text-gold hover:text-white"
                title="Open Full Technical Analysis Studio"
              >
                Expand &rarr;
              </button>
            </div>
          </div>

          {/* Render Candlestick Chart */}
          <div className="rounded-xl border border-bronze/70 bg-obsidian overflow-hidden">
            <CandlestickChart
              candles={previewCandles}
              height={260}
              showSMA20={true}
              showSMA50={true}
              showBollinger={false}
              showVolume={true}
              sma20={previewSMA20}
              sma50={previewSMA50}
            />
          </div>
        </div>

        {/* Flagship AI Navigation Suite (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-bronze bg-charcoal p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-gold" />
              <span>Institutional AI Suite</span>
            </span>
            <span className="text-[10px] text-champagne font-mono">10 FLAGSHIP SYSTEMS</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate("command-center")}
              className="flex w-full items-center justify-between rounded-xl border border-gold/40 bg-obsidian p-3 text-left hover:border-gold hover:bg-gold/10 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20 text-gold border border-gold/40 group-hover:scale-105 transition-transform">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block flex items-center space-x-1.5">
                    <span>00 · Market Command Center</span>
                    <span className="rounded bg-gold/20 px-1.5 py-0.2 text-[9px] font-black text-gold border border-gold/30">
                      FLAGSHIP
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 block">Macro briefing, market breadth &amp; 4-pillar script radar</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gold" />
            </button>

            <button
              onClick={() => onNavigate("stock-radar")}
              className="flex w-full items-center justify-between rounded-xl border border-bronze bg-obsidian p-3 text-left hover:border-gold/50 hover:bg-gold/5 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold border border-gold/30">
                  <Radar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">01 · AI Stock Radar</span>
                  <span className="text-[10px] text-slate-400 block">Opportunity discovery &amp; deterioration screening</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>

            <button
              onClick={() => onNavigate("portfolio-doctor")}
              className="flex w-full items-center justify-between rounded-xl border border-bronze bg-obsidian p-3 text-left hover:border-rose-500/50 hover:bg-rose-500/5 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">02 · AI Portfolio Doctor</span>
                  <span className="text-[10px] text-slate-400 block">7-scenario stress testing &amp; concentration risk</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>

            <button
              onClick={() => onNavigate("smart-exit")}
              className="flex w-full items-center justify-between rounded-xl border border-bronze bg-obsidian p-3 text-left hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <LogOut className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">03 · Smart Exit Advisor</span>
                  <span className="text-[10px] text-slate-400 block">Trailing stops &amp; staged partial exit targets</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>

            <button
              onClick={() => onNavigate("ai-research")}
              className="flex w-full items-center justify-between rounded-xl border border-bronze bg-obsidian p-3 text-left hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">04 · AI Research Analyst</span>
                  <span className="text-[10px] text-slate-400 block">8-part institutional equity research reports</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>

            <button
              onClick={() => onNavigate("position-sizing")}
              className="flex w-full items-center justify-between rounded-xl border border-bronze bg-obsidian p-3 text-left hover:border-gold/50 hover:bg-gold/5 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold border border-gold/30">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">07 · Smart Position Sizing</span>
                  <span className="text-[10px] text-slate-400 block">Risk-based allocation &amp; SEBON fee engine</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Market Heatmap Widget */}
      <MarketHeatmap onSelectStock={onSelectStock} />

      {/* Institutional Floorsheet & Broker Clearing Pulse */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bronze/60 pb-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Floorsheet &amp; Broker Clearing Flow Pulse
                </h3>
                <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                  REAL-TIME CLEARING
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Institutional order flow aggregated across all 60+ licensed CDSC clearing brokers. Broker-side data reflects clearing activity, not beneficial ownership.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate("admin")}
              className="flex items-center space-x-1.5 rounded-xl border border-gold/40 bg-obsidian px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold/10 transition-all"
            >
              <span>Floorsheet Ingestion Console</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 3-Column Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Top Accumulating Brokers */}
          <div className="rounded-xl border border-bronze/60 bg-obsidian p-4 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-sans font-bold text-emerald-400 border-b border-bronze/40 pb-1.5">
              <span>Top Net Buying Brokers</span>
              <span>NET UNITS</span>
            </div>
            <div className="space-y-1.5">
              {[
                { broker: "Broker 58", name: "Himalayan", net: "+58,400", val: "NPR 3.2 Cr" },
                { broker: "Broker 45", name: "Imperial", net: "+41,200", val: "NPR 2.4 Cr" },
                { broker: "Broker 49", name: "Online Sec.", net: "+29,800", val: "NPR 1.8 Cr" },
              ].map((b, i) => (
                <div key={i} className="flex justify-between items-center text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-white font-bold">{b.broker}</span>
                    <span className="text-[10px] text-slate-500 font-sans">({b.name})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400">{b.net}</span>
                    <span className="text-[9px] text-slate-500 block">{b.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Brokers */}
          <div className="rounded-xl border border-bronze/60 bg-obsidian p-4 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-sans font-bold text-rose-400 border-b border-bronze/40 pb-1.5">
              <span>Top Net Selling Brokers</span>
              <span>NET UNITS</span>
            </div>
            <div className="space-y-1.5">
              {[
                { broker: "Broker 34", name: "Vision Sec.", net: "-49,100", val: "NPR 2.8 Cr" },
                { broker: "Broker 28", name: "Shree Krishna", net: "-34,500", val: "NPR 1.9 Cr" },
                { broker: "Broker 17", name: "ABC Sec.", net: "-22,000", val: "NPR 1.2 Cr" },
              ].map((b, i) => (
                <div key={i} className="flex justify-between items-center text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-white font-bold">{b.broker}</span>
                    <span className="text-[10px] text-slate-500 font-sans">({b.name})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-400">{b.net}</span>
                    <span className="text-[9px] text-slate-500 block">{b.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Broker Concentration Watchlist */}
          <div className="rounded-xl border border-bronze/60 bg-obsidian p-4 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-sans font-bold text-gold border-b border-bronze/40 pb-1.5">
              <span>Concentrated Scripts</span>
              <span>STATUS</span>
            </div>
            <div className="space-y-1.5">
              {[
                { symbol: "NABIL", conc: "54.2%", signal: "ACCUMULATION_LIKE", color: "text-emerald-400" },
                { symbol: "SHIVM", conc: "48.1%", signal: "HIGH_CONCENTRATION", color: "text-gold" },
                { symbol: "CHCL", conc: "41.0%", signal: "BALANCED_FLOW", color: "text-sky-400" },
              ].map((s, i) => (
                <div
                  key={i}
                  onClick={() => onSelectStock(s.symbol)}
                  className="flex justify-between items-center cursor-pointer hover:text-white transition-colors"
                >
                  <div>
                    <span className="font-bold text-white">{s.symbol}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">Top-3: {s.conc}</span>
                  </div>
                  <span className={`text-[9px] font-bold ${s.color}`}>
                    {s.signal}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Movers Grid: Top Gainers, Losers, and Turnover */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <TrendingUp className="h-4 w-4" />
              <span>Top NEPSE Gainers</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">TODAY</span>
          </div>
          <div className="space-y-2">
            {topGainers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="flex items-center justify-between rounded-xl border border-bronze bg-obsidian p-2.5 text-xs cursor-pointer hover:border-gold/40 hover:text-gold transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">{stock.symbol}</span>
                  <span className="text-[10px] text-slate-400">{stock.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-white block">NPR {stock.ltp}</span>
                  <span className="text-emerald-400 text-[11px] font-bold">
                    +{stock.changePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
              <TrendingDown className="h-4 w-4" />
              <span>Top NEPSE Losers</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">TODAY</span>
          </div>
          <div className="space-y-2">
            {topLosers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="flex items-center justify-between rounded-xl border border-bronze bg-obsidian p-2.5 text-xs cursor-pointer hover:border-gold/40 hover:text-gold transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">{stock.symbol}</span>
                  <span className="text-[10px] text-slate-400">{stock.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-white block">NPR {stock.ltp}</span>
                  <span className="text-rose-400 text-[11px] font-bold">
                    {stock.changePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Turnover */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center space-x-1.5">
              <DollarSign className="h-4 w-4" />
              <span>Turnover Leaders</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">VOLUME</span>
          </div>
          <div className="space-y-2">
            {topTurnover.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="flex items-center justify-between rounded-xl border border-bronze bg-obsidian p-2.5 text-xs cursor-pointer hover:border-gold/40 hover:text-gold transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">{stock.symbol}</span>
                  <span className="text-[10px] text-slate-400">Vol: {stock.volume.toLocaleString()}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-gold block">
                    NPR {(stock.turnover / 10000000).toFixed(2)} Cr
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    LTP: {stock.ltp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
