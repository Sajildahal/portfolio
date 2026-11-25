"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Lock,
  Layers,
} from "lucide-react";
import { Holding } from "@/types";
import { analyzeSmartExit } from "@/lib/ai/institutionalEngine";

interface SmartExitAdvisorViewProps {
  holdings: Holding[];
  onSelectStock: (symbol: string) => void;
}

export function SmartExitAdvisorView({
  holdings,
  onSelectStock,
}: SmartExitAdvisorViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    holdings[0]?.symbol || "NABIL"
  );

  const activeHolding =
    holdings.find((h) => h.symbol === selectedSymbol) || holdings[0];

  const exitAnalysis = activeHolding ? analyzeSmartExit(activeHolding) : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
            <ShieldAlert className="h-3.5 w-3.5 text-gold" />
            <span>03 · EXIT MANAGEMENT &amp; CAPITAL PRESERVATION</span>
          </span>
          <span className="text-xs text-gold-champagne font-mono">SMART EXIT ADVISOR</span>
        </div>
        <h1 className="mt-2.5 text-2xl font-black text-white sm:text-3xl">
          Smart Exit Advisor
        </h1>
        <p className="mt-1 text-xs text-slate-400 max-w-2xl">
          Most retail tools only focus on buying. The Smart Exit Advisor continuously audits your active positions, detecting trend breakdowns, volatility spikes, and thesis deterioration to protect your hard-earned profits.
        </p>
      </div>

      {holdings.length === 0 ? (
        <div className="rounded-2xl border border-bronze bg-charcoal p-12 text-center text-slate-400">
          No active holdings found in your portfolio ledger. Add transactions to activate the Smart Exit Advisor.
        </div>
      ) : (
        <>
          {/* Holding Selector Ribbon */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
            {holdings.map((h) => {
              const analysis = analyzeSmartExit(h);
              return (
                <button
                  key={h.symbol}
                  onClick={() => setSelectedSymbol(h.symbol)}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2 transition-all ${
                    selectedSymbol === h.symbol
                      ? "gold-gradient-btn shadow-gold-sm"
                      : "bg-charcoal border border-bronze text-slate-300 hover:text-white"
                  }`}
                >
                  <span>{h.symbol}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      analysis.exitUrgency === "URGENT"
                        ? "bg-rose-500/25 text-rose-300 border border-rose-500/40"
                        : analysis.exitUrgency === "ELEVATED"
                        ? "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {analysis.suggestedAction}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Smart Exit Screen */}
          {exitAnalysis && activeHolding && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Urgency & Position Overview */}
              <div className="space-y-4 lg:col-span-1">
                <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">{exitAnalysis.companyName}</span>
                      <h2 className="text-2xl font-black font-mono text-white">
                        {exitAnalysis.symbol}
                      </h2>
                    </div>

                    <span
                      className={`rounded-xl px-3 py-1 text-xs font-black border ${
                        exitAnalysis.exitUrgency === "URGENT"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          : exitAnalysis.exitUrgency === "ELEVATED"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      }`}
                    >
                      {exitAnalysis.exitUrgency} RISK
                    </span>
                  </div>

                  {/* Return Callout */}
                  <div className="rounded-xl bg-obsidian border border-bronze p-4 text-center font-mono">
                    <span className="text-[10px] text-slate-400 block font-sans uppercase">
                      Current Unrealized Return
                    </span>
                    <span
                      className={`text-3xl font-black mt-1 block ${
                        exitAnalysis.unrealizedPLPercent >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {exitAnalysis.unrealizedPLPercent >= 0 ? "+" : ""}
                      {exitAnalysis.unrealizedPLPercent}%
                    </span>
                    <span className="text-xs text-slate-400 font-sans mt-1 block">
                      Position: {exitAnalysis.quantity} units @ WACC NPR {activeHolding.wacc}
                    </span>
                  </div>

                  {/* Suggested Strategic Action */}
                  <div className="rounded-xl bg-charcoal-light border border-bronze p-3.5 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">
                      Suggested Action
                    </span>
                    <span className="text-lg font-black text-gold">
                      {exitAnalysis.suggestedAction}
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Thesis Status: <strong className="text-white">{exitAnalysis.thesisStatus}</strong>
                    </p>
                  </div>

                  {/* Quantitative Protection Levels */}
                  <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
                    <div className="rounded-xl bg-obsidian border border-bronze p-3">
                      <span className="text-[10px] text-slate-400 block font-sans">
                        Trailing Stop Level
                      </span>
                      <span className="text-sm font-bold text-amber-400 mt-1 block">
                        NPR {exitAnalysis.trailingProtectionLevel}
                      </span>
                    </div>
                    <div className="rounded-xl bg-obsidian border border-bronze p-3">
                      <span className="text-[10px] text-slate-400 block font-sans">
                        Stop-Loss Floor
                      </span>
                      <span className="text-sm font-bold text-rose-400 mt-1 block">
                        NPR {exitAnalysis.recommendedStopLoss}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Columns: Exit Intelligence & Action Plan */}
              <div className="space-y-4 lg:col-span-2">
                {/* Exit Intelligence Diagnostic */}
                <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-bronze pb-3">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Exit Intelligence &amp; Deterioration Detection</span>
                  </h3>

                  <ul className="space-y-2 text-xs text-slate-300">
                    {exitAnalysis.exitIntelligence.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-gold font-bold">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Actionable Recommendations */}
                  <div className="rounded-xl bg-obsidian border border-bronze p-4 space-y-2.5">
                    <span className="text-xs font-bold text-gold uppercase tracking-wider block">
                      Recommended Action Steps
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {exitAnalysis.possibleActions.map((act, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rule of Exit Note */}
                  <div className="rounded-xl bg-charcoal-light p-3 text-[11px] text-slate-400 italic border border-bronze/60">
                    &ldquo;The Smart Exit Advisor never forces an exit merely because a stock has risen or fallen by a fixed percentage. It systematically evaluates volatility, liquidity, moving average support, and original thesis health.&rdquo;
                  </div>
                </div>

                {/* Staged Partial Exit Planner */}
                {exitAnalysis.partialExitPercent > 0 && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sliders className="h-4 w-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white">
                          Staged Partial Exit Plan ({exitAnalysis.partialExitPercent}% Trim)
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Sell {Math.round(activeHolding.quantity * (exitAnalysis.partialExitPercent / 100))} Shares
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Reducing {exitAnalysis.partialExitPercent}% of your position locks in NPR{" "}
                      {Math.round(
                        (activeHolding.quantity * (exitAnalysis.partialExitPercent / 100)) *
                          (activeHolding.currentLtp - activeHolding.wacc)
                      ).toLocaleString()}{" "}
                      in net capital gains while letting the remaining shares ride the institutional trend.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
