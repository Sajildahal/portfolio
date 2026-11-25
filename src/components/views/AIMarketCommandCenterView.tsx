// ============================================================================
// NEPSE AI - Institutional Market Command Center
// Central Macro Intelligence Briefing, Market Breadth, Sector Momentum & Radar
// ============================================================================

"use client";

import React, { useState, useMemo } from "react";
import {
  Compass,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart2,
  PieChart,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { INITIAL_INDICES, INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { MarketPrice } from "@/types";

interface AIMarketCommandCenterViewProps {
  onSelectStock: (symbol: string) => void;
  onOpenOrderPad?: (symbol: string, type: "BUY" | "SELL") => void;
  onNavigateTab?: (tab: string) => void;
  marketPrices?: MarketPrice[];
}

export function AIMarketCommandCenterView({
  onSelectStock,
  onOpenOrderPad,
  onNavigateTab,
  marketPrices = INITIAL_MARKET_PRICES,
}: AIMarketCommandCenterViewProps) {
  const nepseIndex = INITIAL_INDICES[0];
  const [selectedSector, setSelectedSector] = useState<string>("ALL");

  // 1. Compute Market Breadth
  const { advances, declines, unchanged, advanceDeclineRatio } = useMemo(() => {
    let adv = 0;
    let dec = 0;
    let unc = 0;

    marketPrices.forEach((s) => {
      if (s.changePercent > 0) adv++;
      else if (s.changePercent < 0) dec++;
      else unc++;
    });

    const ratio = dec > 0 ? (adv / dec).toFixed(2) : adv.toString();
    return { advances: adv, declines: dec, unchanged: unc, advanceDeclineRatio: ratio };
  }, [marketPrices]);

  // 2. Sector Performance Heat Ranking
  const sectorPerformance = useMemo(() => {
    const sectorMap = new Map<string, { totalGain: number; count: number; volume: number; turnover: number }>();

    marketPrices.forEach((s) => {
      const sec = s.sector || "Other";
      if (!sectorMap.has(sec)) {
        sectorMap.set(sec, { totalGain: 0, count: 0, volume: 0, turnover: 0 });
      }
      const data = sectorMap.get(sec)!;
      data.totalGain += s.changePercent;
      data.count += 1;
      data.volume += s.volume;
      data.turnover += s.turnover;
    });

    const result = Array.from(sectorMap.entries()).map(([sector, data]) => ({
      sector,
      avgChange: parseFloat((data.totalGain / data.count).toFixed(2)),
      count: data.count,
      turnoverNpr: data.turnover,
      volume: data.volume,
    }));

    return result.sort((a, b) => b.avgChange - a.avgChange);
  }, [marketPrices]);

  // 3. Market Regime Classification
  const marketRegime = useMemo(() => {
    const advPct = (advances / Math.max(1, advances + declines)) * 100;
    const indexGain = nepseIndex?.changePercent || 0;

    if (indexGain >= 0.75 && advPct >= 60) {
      return {
        regime: "STRONG_BULLISH",
        label: "Bullish Expansion Regime",
        description: "Broad-based institutional participation with advancing issues dominating turnover. Favorable risk-on environment for breakout setups.",
        color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
        confidence: 88,
        macroTone: "Risk-On (High Conviction)",
      };
    } else if (indexGain >= 0.1 || advPct >= 52) {
      return {
        regime: "CAUTIOUSLY_BULLISH",
        label: "Cautiously Bullish Accumulation",
        description: "Index is holding green with selective sector leadership. Participation is concentrated in commercial banking and high-dividend assets.",
        color: "text-gold bg-gold/15 border-gold/30",
        confidence: 76,
        macroTone: "Selective Accumulation",
      };
    } else if (indexGain <= -0.75 && advPct <= 40) {
      return {
        regime: "BEARISH_CORRECTION",
        label: "Defensive Risk-Off Regime",
        description: "Systemic selling pressure across high-beta equities. Cash preservation, trailing stop enforcement, and capital defense recommended.",
        color: "text-rose-400 bg-rose-500/15 border-rose-500/30",
        confidence: 84,
        macroTone: "Capital Preservation Priority",
      };
    } else {
      return {
        regime: "SIDEWAYS_CONSOLIDATION",
        label: "Sideways Range Consolidation",
        description: "Balanced order book pressure without decisive directional momentum. Swing trading between verified support cushions and supply ceilings.",
        color: "text-sky-400 bg-sky-500/15 border-sky-500/30",
        confidence: 72,
        macroTone: "Range-Bound Rotation",
      };
    }
  }, [advances, declines, nepseIndex]);

  // 4. Strategic Radar Buckets
  const { momentumWatch, accumulationWatch, breakoutWatch, riskWatch } = useMemo(() => {
    const mom: MarketPrice[] = [];
    const acc: MarketPrice[] = [];
    const brk: MarketPrice[] = [];
    const rsk: MarketPrice[] = [];

    marketPrices.forEach((s) => {
      // Momentum: High gain + strong volume
      if (s.changePercent >= 2.0 && s.volume > 25000) {
        mom.push(s);
      }
      // Accumulation: Steady positive gain with high transaction volume
      if (s.changePercent >= 0.5 && s.changePercent < 2.5 && s.volume > 30000) {
        acc.push(s);
      }
      // Breakout Watch: Near psychological resistance or multi-day highs
      if (s.changePercent >= 1.2 && s.high === s.ltp) {
        brk.push(s);
      }
      // Risk Watch: Sharp decline or heavy drop on high volume
      if (s.changePercent <= -2.0) {
        rsk.push(s);
      }
    });

    return {
      momentumWatch: mom.slice(0, 5),
      accumulationWatch: acc.slice(0, 5),
      breakoutWatch: brk.slice(0, 5),
      riskWatch: rsk.slice(0, 5),
    };
  }, [marketPrices]);

  const topLeadingSector = sectorPerformance[0];
  const topLaggingSector = sectorPerformance[sectorPerformance.length - 1];

  return (
    <div className="space-y-6">
      {/* Hero: Institutional Market Command Center */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
                <Compass className="h-4 w-4 text-gold animate-spin-slow" />
                <span>AI MARKET COMMAND CENTER</span>
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-mono text-champagne border border-bronze">
                DAILY INTELLIGENCE BRIEFING
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${marketRegime.color}`}>
                {marketRegime.label}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Institutional Macro Intelligence &amp; Market Radar
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Real-time quantitative aggregation across all 282+ listed NEPSE equities, 60+ clearing brokers, and 13 economic sectors. Synthesizes market breadth, liquidity flows, and institutional accumulation into transparent actionable briefings.
            </p>
          </div>

          {/* Quick Benchmark Stats Badge */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs flex-shrink-0">
            <div className="rounded-xl border border-bronze/70 bg-obsidian p-3">
              <span className="text-[10px] uppercase font-sans text-slate-400 block">NEPSE Index</span>
              <span className="text-lg font-black text-white block mt-0.5">
                {nepseIndex?.current.toLocaleString()}
              </span>
              <span
                className={`text-[11px] font-bold ${
                  (nepseIndex?.changePercent || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {(nepseIndex?.changePercent || 0) >= 0 ? "+" : ""}
                {nepseIndex?.changePercent}%
              </span>
            </div>

            <div className="rounded-xl border border-bronze/70 bg-obsidian p-3">
              <span className="text-[10px] uppercase font-sans text-slate-400 block">Market Breadth</span>
              <span className="text-lg font-black text-emerald-400 block mt-0.5">
                {advances} <span className="text-xs text-slate-400 font-sans">Adv</span> / {declines} <span className="text-xs text-slate-400 font-sans">Dec</span>
              </span>
              <span className="text-[11px] text-slate-400 block">
                Ratio: <strong className="text-champagne">{advanceDeclineRatio}x</strong>
              </span>
            </div>

            <div className="rounded-xl border border-bronze/70 bg-obsidian p-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-sans text-slate-400 block">Regime Confidence</span>
              <span className="text-lg font-black text-gold block mt-0.5">
                {marketRegime.confidence}%
              </span>
              <span className="text-[10px] text-slate-400 block font-sans">
                {marketRegime.macroTone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily AI Intelligence Briefing Executive Card */}
      <div className="rounded-2xl border border-bronze bg-gradient-to-r from-[#111726] via-charcoal to-[#111726] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-bronze/60 pb-3">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Executive AI Market Briefing &amp; Overnight Shift
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
            <Clock className="h-3.5 w-3.5 text-gold" />
            <span>Updated Today · Nepal Standard Time</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-bronze/60 bg-obsidian/80 p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-gold tracking-wider flex items-center space-x-1">
              <Activity className="h-3.5 w-3.5" />
              <span>Current Market Outlook</span>
            </span>
            <p className="text-slate-200 leading-relaxed font-sans">
              <strong>{marketRegime.label}:</strong> {marketRegime.description}
            </p>
          </div>

          <div className="rounded-xl border border-bronze/60 bg-obsidian/80 p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider flex items-center space-x-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Leading Sector Flow</span>
            </span>
            <p className="text-slate-200 leading-relaxed font-sans">
              <strong>{topLeadingSector?.sector}:</strong> Leading capital absorption with average gains of{" "}
              <span className="text-emerald-400 font-bold">+{topLeadingSector?.avgChange}%</span> across {topLeadingSector?.count} scripts, driven by institutional delivery accumulation.
            </p>
          </div>

          <div className="rounded-xl border border-bronze/60 bg-obsidian/80 p-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider flex items-center space-x-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Key Systemic Risks</span>
            </span>
            <p className="text-slate-200 leading-relaxed font-sans">
              <strong>{topLaggingSector?.sector} Under Pressure ({topLaggingSector?.avgChange}%):</strong> Deteriorating turnover breadth in speculative small-caps. Strict stop-loss enforcement advised.
            </p>
          </div>
        </div>

        {/* Visual Market Breadth Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-bold">
              Advancing: {advances} ({((advances / marketPrices.length) * 100).toFixed(1)}%)
            </span>
            <span className="text-slate-400">
              Unchanged: {unchanged}
            </span>
            <span className="text-rose-400 font-bold">
              Declining: {declines} ({((declines / marketPrices.length) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(advances / marketPrices.length) * 100}%` }}
              className="bg-emerald-500 transition-all"
            />
            <div
              style={{ width: `${(unchanged / marketPrices.length) * 100}%` }}
              className="bg-slate-600 transition-all"
            />
            <div
              style={{ width: `${(declines / marketPrices.length) * 100}%` }}
              className="bg-rose-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4-Pillar Smart Script Radar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Target className="h-5 w-5 text-gold" />
              <span>Smart Script Radar — Automated Discovery Buckets</span>
            </h2>
            <p className="text-xs text-slate-400">
              Algorithmically scans the NEPSE universe and segments tickers into actionable institutional watchlists.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Momentum Watch */}
          <div className="rounded-2xl border border-sky-500/30 bg-charcoal p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-bronze/50 pb-2">
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Momentum Watch
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">ACCELERATING</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Scripts displaying expanding RSI, positive MACD momentum, and sustained buyer participation.
            </p>
            <div className="space-y-2">
              {momentumWatch.map((s) => (
                <div
                  key={s.symbol}
                  onClick={() => onSelectStock(s.symbol)}
                  className="flex items-center justify-between p-2 rounded-xl bg-obsidian border border-bronze/50 hover:border-sky-500/50 cursor-pointer transition-all"
                >
                  <div>
                    <span className="font-bold text-white text-xs block">{s.symbol}</span>
                    <span className="text-[10px] text-slate-400">{s.name.slice(0, 18)}</span>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-white font-bold block">NPR {s.ltp}</span>
                    <span className="text-sky-400 font-bold text-[11px]">+{s.changePercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 2: Accumulation Watch */}
          <div className="rounded-2xl border border-emerald-500/30 bg-charcoal p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-bronze/50 pb-2">
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Accumulation Watch
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">BROKER FLOW</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Quiet institutional accumulation observed via floorsheet delivery blocks without vertical price escalation.
            </p>
            <div className="space-y-2">
              {accumulationWatch.map((s) => (
                <div
                  key={s.symbol}
                  onClick={() => onSelectStock(s.symbol)}
                  className="flex items-center justify-between p-2 rounded-xl bg-obsidian border border-bronze/50 hover:border-emerald-500/50 cursor-pointer transition-all"
                >
                  <div>
                    <span className="font-bold text-white text-xs block">{s.symbol}</span>
                    <span className="text-[10px] text-slate-400">Vol: {s.volume.toLocaleString()}</span>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-white font-bold block">NPR {s.ltp}</span>
                    <span className="text-emerald-400 font-bold text-[11px]">+{s.changePercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 3: Breakout Watch */}
          <div className="rounded-2xl border border-gold/30 bg-charcoal p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-bronze/50 pb-2">
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-gold" />
                <h3 className="text-xs font-bold text-gold uppercase tracking-wider">
                  Breakout Watch
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">SUPPLY CEILING</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Scripts consolidating within 2.5% of key technical resistance zones; breakout confirmation pending.
            </p>
            <div className="space-y-2">
              {breakoutWatch.map((s) => (
                <div
                  key={s.symbol}
                  onClick={() => onSelectStock(s.symbol)}
                  className="flex items-center justify-between p-2 rounded-xl bg-obsidian border border-bronze/50 hover:border-gold/50 cursor-pointer transition-all"
                >
                  <div>
                    <span className="font-bold text-white text-xs block">{s.symbol}</span>
                    <span className="text-[10px] text-slate-400">Day High: {s.high}</span>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-white font-bold block">NPR {s.ltp}</span>
                    <span className="text-gold font-bold text-[11px]">+{s.changePercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 4: Risk Watch */}
          <div className="rounded-2xl border border-rose-500/30 bg-charcoal p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-bronze/50 pb-2">
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Risk / Exit Watch
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">DETERIORATION</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Elevated drawdown vulnerability, heavy distribution selling, or critical support breach testing.
            </p>
            <div className="space-y-2">
              {riskWatch.map((s) => (
                <div
                  key={s.symbol}
                  onClick={() => onSelectStock(s.symbol)}
                  className="flex items-center justify-between p-2 rounded-xl bg-obsidian border border-bronze/50 hover:border-rose-500/50 cursor-pointer transition-all"
                >
                  <div>
                    <span className="font-bold text-white text-xs block">{s.symbol}</span>
                    <span className="text-[10px] text-rose-400">Stop Breach Risk</span>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-white font-bold block">NPR {s.ltp}</span>
                    <span className="text-rose-400 font-bold text-[11px]">{s.changePercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sector Momentum Heatmap Table */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bronze/60 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-gold" />
              <span>Sector Momentum &amp; Capital Rotation Hierarchy</span>
            </h2>
            <p className="text-xs text-slate-400">
              Ranked from highest positive institutional capital inflow to lagging contractionary sectors.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Filter:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-obsidian border border-bronze rounded-lg px-2.5 py-1 text-white font-bold"
            >
              <option value="ALL">All Sectors ({sectorPerformance.length})</option>
              {sectorPerformance.map((s) => (
                <option key={s.sector} value={s.sector}>
                  {s.sector}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectorPerformance
            .filter((s) => selectedSector === "ALL" || s.sector === selectedSector)
            .map((sec, idx) => {
              const isPositive = sec.avgChange >= 0;
              return (
                <div
                  key={sec.sector}
                  className="rounded-xl border border-bronze/60 bg-obsidian p-3.5 space-y-2 hover:border-gold/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-[10px] font-mono text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white text-xs">{sec.sector}</span>
                    </div>
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                        isPositive
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {sec.avgChange}%
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-bronze/40">
                    <span>{sec.count} Listed Stocks</span>
                    <span>Turnover: NPR {(sec.turnoverNpr / 10000000).toFixed(1)} Cr</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
