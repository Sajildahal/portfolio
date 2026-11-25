"use client";

import React, { useState } from "react";
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Flame,
  AlertTriangle,
  PieChart,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Holding, PortfolioSummary } from "@/types";
import { diagnosePortfolioDoctor } from "@/lib/ai/institutionalEngine";

interface PortfolioDoctorViewProps {
  holdings: Holding[];
  summary: PortfolioSummary;
  onSelectStock?: (symbol: string) => void;
}

export function PortfolioDoctorView({
  holdings,
  summary,
}: PortfolioDoctorViewProps) {
  const diagnostic = diagnosePortfolioDoctor(holdings, summary);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("s2");

  const selectedScenario =
    diagnostic.stressTestResults.find((s) => s.id === activeScenarioId) ||
    diagnostic.stressTestResults[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
            <Activity className="h-3.5 w-3.5 text-gold" />
            <span>02 · ADVANCED PORTFOLIO PROTECTION</span>
          </span>
          <span className="text-xs text-gold-champagne font-mono">AI PORTFOLIO DOCTOR</span>
        </div>
        <h1 className="mt-2.5 text-2xl font-black text-white sm:text-3xl">
          AI Portfolio Doctor &amp; Health Diagnostics
        </h1>
        <p className="mt-1 text-xs text-slate-400 max-w-2xl">
          Audits concentration limits, cross-sector correlation, liquidity vulnerabilities, and tail-risk exposure before they translate into irreversible capital drawdowns.
        </p>

        {/* Capital Preservation Mode Alert */}
        {diagnostic.capitalPreservationMode && (
          <div className="mt-4 rounded-xl bg-amber-950/40 border border-amber-500/40 p-3 text-xs text-amber-300 flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Capital Preservation Mode Active:</strong> Portfolio Risk Score exceeds 55/100. Tightened risk monitoring and defensive cash allocations are strongly recommended.
            </span>
          </div>
        )}
      </div>

      {/* Main Diagnostic Score & Component Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Gauge Card */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-6 text-center space-y-4 shadow-xl lg:col-span-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
            Composite Portfolio Risk Score
          </h2>

          <div className="py-2">
            <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full border-4 border-bronze bg-obsidian shadow-inner">
              <div className="text-center font-mono">
                <span
                  className={`text-4xl font-black ${
                    diagnostic.portfolioRiskScore >= 70
                      ? "text-rose-400"
                      : diagnostic.portfolioRiskScore >= 50
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {diagnostic.portfolioRiskScore}
                </span>
                <span className="text-[10px] text-slate-500 block font-sans">OUT OF 100</span>
              </div>
            </div>
            <p
              className={`mt-4 text-base font-black ${
                diagnostic.portfolioRiskScore >= 70
                  ? "text-rose-400"
                  : diagnostic.portfolioRiskScore >= 50
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              Health Status: {diagnostic.riskBand}
            </p>
          </div>

          <div className="border-t border-bronze pt-3 text-[11px] text-slate-400 font-mono">
            <span>Model: 0.25C + 0.20V + 0.20D + 0.15L + 0.10S + 0.10M</span>
          </div>
        </div>

        {/* 6 Component Drivers */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-xl lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-bronze pb-3 flex items-center space-x-2">
            <PieChart className="h-4 w-4 text-gold" />
            <span>Risk Factor Component Breakdown</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="rounded-xl bg-obsidian border border-bronze p-3 space-y-1">
              <span className="text-[10px] text-slate-500 block font-sans">Concentration (25%)</span>
              <span className="text-lg font-bold text-white">{diagnostic.components.concentrationRisk}</span>
              <span className="text-[9px] text-slate-400 block font-sans">Max single asset exposure</span>
            </div>

            <div className="rounded-xl bg-obsidian border border-bronze p-3 space-y-1">
              <span className="text-[10px] text-slate-500 block font-sans">Volatility Risk (20%)</span>
              <span className="text-lg font-bold text-white">{diagnostic.components.volatilityRisk}</span>
              <span className="text-[9px] text-slate-400 block font-sans">Portfolio beta variance</span>
            </div>

            <div className="rounded-xl bg-obsidian border border-bronze p-3 space-y-1">
              <span className="text-[10px] text-slate-500 block font-sans">Drawdown Risk (20%)</span>
              <span className="text-lg font-bold text-white">{diagnostic.components.drawdownRisk}</span>
              <span className="text-[9px] text-slate-400 block font-sans">Unrealized return cushion</span>
            </div>

            <div className="rounded-xl bg-obsidian border border-bronze p-3 space-y-1">
              <span className="text-[10px] text-slate-500 block font-sans">Liquidity Risk (15%)</span>
              <span className="text-lg font-bold text-white">{diagnostic.components.liquidityRisk}</span>
              <span className="text-[9px] text-slate-400 block font-sans">Exit depth &amp; daily turnover</span>
            </div>

            <div className="rounded-xl bg-obsidian border border-bronze p-3 space-y-1">
              <span className="text-[10px] text-slate-500 block font-sans">Sector Exposure (10%)</span>
              <span className="text-lg font-bold text-white">{diagnostic.components.sectorRisk}</span>
              <span className="text-[9px] text-slate-400 block font-sans">Subindex concentration</span>
            </div>

            <div className="rounded-xl bg-obsidian border border-bronze p-3 space-y-1">
              <span className="text-[10px] text-slate-500 block font-sans">Market Regime (10%)</span>
              <span className="text-lg font-bold text-emerald-400">{diagnostic.components.marketRegimeRisk}</span>
              <span className="text-[9px] text-slate-400 block font-sans">NEPSE macro breadth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerability Warnings & Action Recommendations */}
      {diagnostic.warnings.length > 0 && (
        <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-bronze pb-3">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Detected Portfolio Vulnerabilities ({diagnostic.warnings.length} Active Warnings)</span>
          </h3>

          <div className="space-y-3">
            {diagnostic.warnings.map((warn) => (
              <div
                key={warn.id}
                className="rounded-xl border border-bronze bg-obsidian p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center space-x-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        warn.severity === "CRITICAL"
                          ? "bg-rose-500"
                          : warn.severity === "ELEVATED"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    ></span>
                    <span>{warn.title}</span>
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      warn.severity === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {warn.severity}
                  </span>
                </div>
                <p className="text-slate-300">{warn.description}</p>
                <p className="text-gold text-[11px] font-semibold flex items-center space-x-1">
                  <ArrowRight className="h-3 w-3" />
                  <span>Preservation Prescription: {warn.actionAdvice}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced 7-Scenario Stress Testing Simulator */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-xl space-y-4">
        <div className="border-b border-bronze pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Flame className="h-4 w-4 text-rose-400" />
              <span>Advanced 7-Scenario Market Stress Tester</span>
            </h3>
            <p className="text-xs text-slate-400">
              Hypothetical macro shocks testing portfolio downside resilience and detractor contribution.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">PORTFOLIO VALUATION: NPR {summary.currentMarketValue.toLocaleString()}</span>
        </div>

        {/* Scenario Selector Chips */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {diagnostic.stressTestResults.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`rounded-xl px-3 py-1.5 transition-all ${
                activeScenarioId === sc.id
                  ? "gold-gradient-btn shadow-gold-sm"
                  : "bg-obsidian border border-bronze text-slate-400 hover:text-white"
              }`}
            >
              {sc.name}
            </button>
          ))}
        </div>

        {/* Selected Scenario Output Card */}
        {selectedScenario && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 p-5 space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-rose-500/20 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Simulated Stress Shock</span>
                <span className="text-base font-bold text-white font-sans">{selectedScenario.name}</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 block font-sans">Projected Capital Impact</span>
                <span className="text-xl font-black text-rose-400">
                  -NPR {selectedScenario.estimatedLossNpr.toLocaleString()} (-{selectedScenario.dropPercent}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans mb-1">
                  Post-Shock Portfolio Valuation
                </span>
                <span className="text-2xl font-black text-white">
                  NPR {selectedScenario.portfolioValueAfter.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block font-sans mt-0.5">
                  Liquid buffer of NPR {summary.cashBalance.toLocaleString()} cushions margin stress
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-sans mb-2">
                  Top Detractors Responsible for Downside Loss
                </span>
                <div className="space-y-1.5 font-sans">
                  {selectedScenario.topDetractors.map((det) => (
                    <div key={det.symbol} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{det.symbol}:</span>
                      <span className="font-mono text-rose-400">
                        -NPR {det.lossNpr.toLocaleString()} ({det.contributionPct}% of loss)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
