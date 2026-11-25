// ============================================================================
// Institutional Technical Charting Studio
// Japanese Candlesticks, Multi-timeframes, Bollinger, Moving Averages, RSI, MACD
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  Maximize2,
  Calendar,
  Sparkles,
  BarChart2,
  Sliders,
  ShieldCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";
import { INITIAL_MARKET_PRICES, generateHistoricalCandles } from "@/lib/market/nepseData";
import {
  calculateBollingerBands,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateSMA,
  calculateSupportResistance,
  calculateVWAP,
  calculateFibonacci,
} from "@/lib/quantitative/indicators";
import { CandlestickChart, ChartType } from "@/components/charts/CandlestickChart";
import { MarketPrice } from "@/types";

interface TechnicalAnalysisViewProps {
  initialSymbol?: string;
  onSelectStock?: (symbol: string) => void;
  onOpenOrderPad?: (symbol: string, type: "BUY" | "SELL") => void;
  marketPrices?: MarketPrice[];
}

export function TechnicalAnalysisView({
  initialSymbol = "NABIL",
  onSelectStock,
  onOpenOrderPad,
  marketPrices = INITIAL_MARKET_PRICES,
}: TechnicalAnalysisViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1D");
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showFibonacci, setShowFibonacci] = useState(true);
  const [showSRZones, setShowSRZones] = useState(true);
  const [showSignals, setShowSignals] = useState(true);

  // Sync prop changes
  useEffect(() => {
    if (initialSymbol) {
      setSelectedSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  const stock = useMemo(() => {
    return (
      marketPrices.find((s) => s.symbol === selectedSymbol) ||
      marketPrices[0]
    );
  }, [marketPrices, selectedSymbol]);

  // Adjust candle history length based on timeframe
  const rawCandles = useMemo(() => {
    let count = 45;
    if (timeframe === "1W") count = 30;
    if (timeframe === "1M") count = 50;
    if (timeframe === "3M") count = 75;
    if (timeframe === "1Y") count = 90;
    return generateHistoricalCandles(selectedSymbol, count);
  }, [selectedSymbol, timeframe]);

  const closes = useMemo(() => rawCandles.map((c) => c.close), [rawCandles]);

  const sma20 = useMemo(() => calculateSMA(closes, 20), [closes]);
  const sma50 = useMemo(() => calculateSMA(closes, 50), [closes]);
  const bb = useMemo(() => calculateBollingerBands(closes, 20), [closes]);
  const rsi = useMemo(() => calculateRSI(closes, 14), [closes]);
  const macd = useMemo(() => calculateMACD(closes), [closes]);
  const sr = useMemo(() => calculateSupportResistance(rawCandles), [rawCandles]);
  const vwap = useMemo(() => calculateVWAP(rawCandles), [rawCandles]);

  const { swingHigh, swingLow, fibonacciLevels } = useMemo(() => {
    if (!rawCandles || rawCandles.length === 0) {
      return { swingHigh: 1000, swingLow: 100, fibonacciLevels: [] };
    }
    const highs = rawCandles.map((c) => c.high);
    const lows = rawCandles.map((c) => c.low);
    const high = Math.max(...highs);
    const low = Math.min(...lows);
    return {
      swingHigh: high,
      swingLow: low,
      fibonacciLevels: calculateFibonacci(high, low),
    };
  }, [rawCandles]);

  const latestRsi = rsi[rsi.length - 1] ?? 50;
  const latestMacdHist = macd.histogram[macd.histogram.length - 1] ?? 0;
  const s20Val = sma20[sma20.length - 1] ?? stock.ltp;
  const s50Val = sma50[sma50.length - 1] ?? stock.ltp;

  const trendStatus =
    stock.ltp > s20Val && s20Val > s50Val
      ? "STRONG BULLISH"
      : stock.ltp > s20Val
      ? "MODERATE BULLISH"
      : stock.ltp < s50Val * 0.95
      ? "BEARISH BREAKDOWN"
      : "SIDEWAYS CONSOLIDATION";

  return (
    <div className="space-y-6">
      {/* View Header & Quick Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
              <BarChart2 className="h-3.5 w-3.5 text-gold" />
              <span>INSTITUTIONAL TECHNICAL CHARTING</span>
            </span>
            <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-mono text-champagne border border-bronze">
              REAL-TIME CANDLESTICKS
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Interactive Candlestick &amp; Momentum Studio
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">
            High-precision Japanese candlesticks with volume sub-layers, multi-period moving averages, Bollinger envelopes, RSI momentum oscillators, and MACD divergence.
          </p>
        </div>

        {/* Stock Quick Switcher & Trade Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedSymbol}
            onChange={(e) => {
              setSelectedSymbol(e.target.value);
              if (onSelectStock) onSelectStock(e.target.value);
            }}
            className="rounded-xl border border-bronze bg-obsidian py-2 px-3 text-xs font-bold text-white focus:border-gold focus:outline-none"
          >
            {marketPrices.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — NPR {s.ltp} ({s.changePercent >= 0 ? "+" : ""}{s.changePercent}%)
              </option>
            ))}
          </select>

          {onOpenOrderPad && (
            <button
              onClick={() => onOpenOrderPad(stock.symbol, "BUY")}
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 font-black text-black shadow-emerald transition-all text-xs"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>BUY</span>
            </button>
          )}

          {onOpenOrderPad && (
            <button
              onClick={() => onOpenOrderPad(stock.symbol, "SELL")}
              className="flex items-center space-x-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 px-3.5 py-2 font-black text-white shadow-rose transition-all text-xs"
            >
              <span>SELL</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Chart Toolbar: Tickers, Indicators, Timeframe */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bronze/60 pb-3 text-xs">
          {/* Symbol & Live Price Badge */}
          <div className="flex items-center space-x-4">
            <div>
              <span className="font-black text-white text-lg tracking-wide">{stock.symbol}</span>
              <span className="text-[11px] text-slate-400 block font-normal">{stock.name}</span>
            </div>
            <div className="border-l border-bronze pl-4">
              <span className="font-mono text-lg font-black text-white">
                NPR {stock.ltp.toLocaleString()}
              </span>
              <span
                className={`ml-2 text-xs font-bold font-mono px-2 py-0.5 rounded border inline-block ${
                  stock.changePercent >= 0
                    ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
                    : "text-rose-400 bg-rose-500/15 border-rose-500/30"
                }`}
              >
                {stock.changePercent >= 0 ? "+" : ""}
                {stock.change} ({stock.changePercent >= 0 ? "+" : ""}
                {stock.changePercent}%)
              </span>
            </div>
          </div>

          {/* Chart Mode Selector (Candles, Line, Area, OHLC) */}
          <div className="flex items-center space-x-1 rounded-xl border border-bronze bg-obsidian p-1 text-xs font-bold">
            {(
              [
                { type: "candlestick", label: "Candles" },
                { type: "line", label: "Line" },
                { type: "area", label: "Area" },
                { type: "ohlc", label: "OHLC Bars" },
              ] as const
            ).map((m) => (
              <button
                key={m.type}
                onClick={() => setChartType(m.type)}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  chartType === m.type
                    ? "gold-gradient-btn font-black text-black"
                    : "text-slate-400 hover:text-champagne"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center space-x-1 rounded-xl border border-bronze bg-obsidian p-1 text-xs font-bold">
            {(["1D", "1W", "1M", "3M", "1Y"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  timeframe === tf
                    ? "bg-slate-700 font-black text-white"
                    : "text-slate-400 hover:text-champagne"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator Toggles */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showSMA20}
                onChange={(e) => setShowSMA20(e.target.checked)}
                className="rounded accent-[#38BDF8]"
              />
              <span className="text-[11px] font-medium text-sky-400">SMA 20</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showSMA50}
                onChange={(e) => setShowSMA50(e.target.checked)}
                className="rounded accent-[#D4AF37]"
              />
              <span className="text-[11px] font-medium text-gold">SMA 50</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showVWAP}
                onChange={(e) => setShowVWAP(e.target.checked)}
                className="rounded accent-[#E879F9]"
              />
              <span className="text-[11px] font-medium text-fuchsia-400">VWAP</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showFibonacci}
                onChange={(e) => setShowFibonacci(e.target.checked)}
                className="rounded accent-[#D4AF37]"
              />
              <span className="text-[11px] font-medium text-amber-300">Fibonacci</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showSRZones}
                onChange={(e) => setShowSRZones(e.target.checked)}
                className="rounded accent-[#10B981]"
              />
              <span className="text-[11px] font-medium text-emerald-400">S/R Zones</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showSignals}
                onChange={(e) => setShowSignals(e.target.checked)}
                className="rounded accent-[#F59E0B]"
              />
              <span className="text-[11px] font-medium text-amber-400">AI Signals</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showBollinger}
                onChange={(e) => setShowBollinger(e.target.checked)}
                className="rounded accent-[#A855F7]"
              />
              <span className="text-[11px] font-medium text-purple-400">Bollinger</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="rounded accent-[#10B981]"
              />
              <span className="text-[11px] font-medium text-emerald-400">Volume</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showRSI}
                onChange={(e) => setShowRSI(e.target.checked)}
                className="rounded accent-[#F59E0B]"
              />
              <span className="text-[11px] font-medium text-amber-400">RSI</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showMACD}
                onChange={(e) => setShowMACD(e.target.checked)}
                className="rounded accent-[#38BDF8]"
              />
              <span className="text-[11px] font-medium text-blue-400">MACD</span>
            </label>
          </div>
        </div>

        {/* Real Dynamic Multi-Mode Chart Component */}
        <div className="rounded-xl border border-bronze/70 bg-obsidian overflow-hidden">
          <CandlestickChart
            candles={rawCandles}
            height={360}
            chartType={chartType}
            showSMA20={showSMA20}
            showSMA50={showSMA50}
            showBollinger={showBollinger}
            showVolume={showVolume}
            showRSI={showRSI}
            showMACD={showMACD}
            showVWAP={showVWAP}
            showFibonacci={showFibonacci}
            showSupportResistanceZones={showSRZones}
            showSignals={showSignals}
            sma20={sma20}
            sma50={sma50}
            bbUpper={bb.upper}
            bbLower={bb.lower}
            rsi={rsi}
            macdHistogram={macd.histogram}
            macdLine={macd.macdLine}
            signalLine={macd.signalLine}
            vwap={vwap}
            supports={sr.supports}
            resistances={sr.resistances}
            fibonacciLevels={fibonacciLevels}
          />
        </div>
      </div>

      {/* Technical Indicators & Institutional Anchors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Support & Resistance Levels */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-champagne flex items-center space-x-1.5">
              <Target className="h-4 w-4 text-gold" />
              <span>Structural Anchors (Extrema)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">PIVOTS</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-rose-400 uppercase font-sans block mb-1">
                Resistance Levels (Overhead Supply)
              </span>
              <div className="space-y-1.5">
                {sr.resistances.slice(0, 3).map((r, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-obsidian border border-rose-500/20 rounded-lg px-3 py-1.5 text-rose-300"
                  >
                    <span>R{i + 1} Resistance</span>
                    <span className="font-bold">NPR {r.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-emerald-400 uppercase font-sans block mb-1">
                Support Levels (Demand Cushions)
              </span>
              <div className="space-y-1.5">
                {sr.supports.slice(0, 3).map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-obsidian border border-emerald-500/20 rounded-lg px-3 py-1.5 text-emerald-300"
                  >
                    <span>S{i + 1} Support</span>
                    <span className="font-bold">NPR {s.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Momentum & Trend Gauge */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-champagne flex items-center space-x-1.5">
              <Activity className="h-4 w-4 text-gold" />
              <span>Momentum &amp; Oscillators</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">DAILY</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-bronze bg-obsidian p-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">RSI (14-period):</span>
                <span className="font-mono font-bold text-white text-sm">
                  {latestRsi.toFixed(1)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {latestRsi > 70
                  ? "Overbought territory (>70); cautionary profit-taking recommended."
                  : latestRsi < 30
                  ? "Oversold territory (<30); potential mean-reversion bounce opportunity."
                  : "Balanced momentum in constructive neutral zone (30-70)."}
              </p>
            </div>

            <div className="rounded-xl border border-bronze bg-obsidian p-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">MACD Histogram:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    latestMacdHist >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {latestMacdHist >= 0 ? "+" : ""}
                  {latestMacdHist.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {latestMacdHist >= 0
                  ? "MACD line is trading above signal line; expansionary buyer strength."
                  : "MACD line is below signal line; contractionary seller dominance."}
              </p>
            </div>
          </div>
        </div>

        {/* Quantitative Trend Summary & Action */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-champagne flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span>Quantitative Regime Summary</span>
            </span>
            <span className="text-[10px] text-gold font-bold font-mono">QUANT v3.4</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-gold/30 bg-gold/10 p-3.5 space-y-1 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Primary Structural Regime
              </span>
              <span className="text-base font-black text-gold block">
                {trendStatus}
              </span>
            </div>

            <div className="space-y-2 font-mono text-[11px] pt-1">
              <div className="flex justify-between border-b border-bronze/40 pb-1.5">
                <span className="text-slate-400">SMA 20 Anchor:</span>
                <span className="text-sky-400 font-bold">NPR {s20Val.toFixed(1)}</span>
              </div>
              <div className="flex justify-between border-b border-bronze/40 pb-1.5">
                <span className="text-slate-400">SMA 50 Anchor:</span>
                <span className="text-gold font-bold">NPR {s50Val.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bollinger Bandwidth:</span>
                <span className="text-purple-400 font-bold">
                  {(
                    (((bb.upper[bb.upper.length - 1] ?? stock.ltp * 1.05) -
                      (bb.lower[bb.lower.length - 1] ?? stock.ltp * 0.95)) /
                      stock.ltp) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Fibonacci Levels & AI Chart Flag Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-champagne flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-gold" />
              <span>Fibonacci Retracement Grid (Swing High: {swingHigh} / Low: {swingLow})</span>
            </span>
            <span className="text-[10px] text-gold font-bold font-mono">FIBONACCI</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            {fibonacciLevels.map((fib) => {
              const isGolden = fib.ratio === 0.618;
              return (
                <div
                  key={fib.ratio}
                  className={`p-2.5 rounded-xl border ${
                    isGolden
                      ? "bg-amber-500/15 border-amber-500/50 text-gold shadow-gold/10"
                      : "bg-obsidian border-bronze/60 text-slate-300"
                  }`}
                >
                  <span className="text-[10px] text-slate-400 block font-sans">
                    {fib.label}
                  </span>
                  <span className="text-sm font-black font-mono block mt-0.5">
                    NPR {fib.price.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-champagne flex items-center space-x-1.5">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>AI Chart Patterns &amp; Order Flow Flags</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">REAL-TIME</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian border border-bronze/60">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Volume Breakout Filter:</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">
                {rawCandles[rawCandles.length - 1]?.volume > 50000 ? "ACCUMULATION SURGE DETECTED" : "NORMAL PARTICIPATION"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian border border-bronze/60">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="font-semibold text-white">VWAP Benchmark Alignment:</span>
              </div>
              <span className="font-mono text-blue-300 font-bold">
                {stock.ltp >= (vwap[vwap.length - 1] ?? stock.ltp) ? "ABOVE VWAP (BULLISH BIAS)" : "BELOW VWAP (DISCOUNT BIAS)"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian border border-bronze/60">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-gold" />
                <span className="font-semibold text-white">Golden Pocket Test:</span>
              </div>
              <span className="font-mono text-gold font-bold">
                {Math.abs(stock.ltp - (fibonacciLevels.find(f => f.ratio === 0.618)?.price ?? 0)) < 15
                  ? "TESTING 61.8% KEY LEVEL"
                  : "CLEAR OF GOLDEN LEVEL"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
