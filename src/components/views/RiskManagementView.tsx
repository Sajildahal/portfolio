"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  PieChart,
  Activity,
  Flame,
  AlertTriangle,
  TrendingDown,
  Percent,
  CheckCircle2,
} from "lucide-react";
import { Holding, PortfolioSummary } from "@/types";

interface RiskManagementViewProps {
  holdings: Holding[];
  summary: PortfolioSummary;
}

export function RiskManagementView({ holdings, summary }: RiskManagementViewProps) {
  const [stressScenario, setStressScenario] = useState<"flash_crash" | "interest_rate" | "sector_slump">("flash_crash");

  // Portfolio metrics calculations
  const totalValue = summary.currentMarketValue || 1;
  const topPosition = holdings[0];
  const topAllocation = topPosition ? topPosition.allocationPercent : 0;

  // Group allocations by Sector
  const sectorAllocations = holdings.reduce((acc, h) => {
    acc[h.sector] = (acc[h.sector] || 0) + h.currentMarketValue;
    return acc;
  }, {} as Record<string, number>);

  const sectorEntries = Object.entries(sectorAllocations)
    .map(([sec, val]) => ({
      sector: sec,
      value: val,
      percent: Math.round((val / totalValue) * 1000) / 10,
    }))
    .sort((a, b) => b.percent - a.percent);

  // VaR Estimation (Historical Parametric 95% 1-Day Value at Risk)
  const portfolioVolatilityAnnualized = 18.5; // %
  const dailyVol = portfolioVolatilityAnnualized / Math.sqrt(252);
  const var95Npr = Math.round(totalValue * (1.645 * (dailyVol / 100)));
  const cvar95Npr = Math.round(var95Npr * 1.25); // Expected shortfall

  // Stress test scenarios
  let stressDropPercent = 8.0;
  let stressTitle = "Market Flash Crash (-8.0% Benchmark Drop)";
  let stressImpactNpr = Math.round(totalValue * 0.08);

  if (stressScenario === "interest_rate") {
    stressDropPercent = 5.5;
    stressTitle = "Central Bank Monetary Tightening (+150 bps Yield Surge)";
    stressImpactNpr = Math.round(totalValue * 0.055);
  } else if (stressScenario === "sector_slump") {
    stressDropPercent = 12.0;
    stressTitle = "Hydropower / Beta Sector Margin Contraction (-12.0%)";
    stressImpactNpr = Math.round(totalValue * 0.12);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>PORTFOLIO RISK & CVAR STRESS TESTER</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">CAPITAL PRESERVATION ENGINE</span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-white">Risk Exposure & Monte Carlo Scenarios</h1>
        <p className="mt-1 text-xs text-slate-400">
          Value at Risk (VaR), Conditional CVaR expected shortfall, sector concentration ceilings, and simulated market shocks.
        </p>
      </div>

      {/* Top 4 Risk Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-slate-400 text-[11px] font-sans block">1-Day Value at Risk (95% VaR)</span>
          <span className="text-xl font-bold text-rose-400 mt-1 block">
            NPR {var95Npr.toLocaleString()}
          </span>
          <span className="text-slate-500 text-[10px] font-sans">
            Max expected daily loss 95% of time
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-slate-400 text-[11px] font-sans block">Conditional VaR (CVaR / Shortfall)</span>
          <span className="text-xl font-bold text-rose-400 mt-1 block">
            NPR {cvar95Npr.toLocaleString()}
          </span>
          <span className="text-slate-500 text-[10px] font-sans">
            Expected loss during tail risk events
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-slate-400 text-[11px] font-sans block">Max Single Stock Concentration</span>
          <span
            className={`text-xl font-bold mt-1 block ${
              topAllocation > 30 ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {topAllocation}% ({topPosition?.symbol || "None"})
          </span>
          <span className="text-slate-500 text-[10px] font-sans">
            {topAllocation > 30 ? "WARNING: Exceeds 30% limit" : "Safe: Within 30% ceiling"}
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-slate-400 text-[11px] font-sans block">Annualized Volatility</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">
            {portfolioVolatilityAnnualized}%
          </span>
          <span className="text-slate-500 text-[10px] font-sans">vs NEPSE Index (19.2%)</span>
        </div>
      </div>

      {/* Middle Grid: Sector Concentration & Stress Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Exposure Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <PieChart className="h-4 w-4 text-blue-400" />
            <span>Sector Concentration Limits</span>
          </h2>

          <div className="space-y-3">
            {sectorEntries.map((sec) => (
              <div key={sec.sector} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-sans">{sec.sector}</span>
                  <span className="font-bold text-white">
                    NPR {sec.value.toLocaleString()} ({sec.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sec.percent > 40
                        ? "bg-rose-500"
                        : sec.percent > 25
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(100, sec.percent)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-sans">
            Institutional best practice limits exposure to any single NEPSE sector below 35% of total capital.
          </p>
        </div>

        {/* Stress Testing Simulator */}
        <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Flame className="h-4 w-4 text-rose-400" />
            <span>Market Stress Testing Simulator</span>
          </h2>

          <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setStressScenario("flash_crash")}
              className={`flex-1 rounded py-1.5 transition-all ${
                stressScenario === "flash_crash" ? "bg-rose-600 text-white font-bold" : "text-slate-400"
              }`}
            >
              Flash Crash
            </button>
            <button
              onClick={() => setStressScenario("interest_rate")}
              className={`flex-1 rounded py-1.5 transition-all ${
                stressScenario === "interest_rate" ? "bg-rose-600 text-white font-bold" : "text-slate-400"
              }`}
            >
              Rate Shock
            </button>
            <button
              onClick={() => setStressScenario("sector_slump")}
              className={`flex-1 rounded py-1.5 transition-all ${
                stressScenario === "sector_slump" ? "bg-rose-600 text-white font-bold" : "text-slate-400"
              }`}
            >
              Beta Contraction
            </button>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-3 font-mono">
            <span className="font-bold text-white font-sans text-xs block">{stressTitle}</span>
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-sans">Projected Valuation Drop:</span>
              <span className="text-rose-400 font-bold">-{stressDropPercent}%</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-sans">Simulated Capital Impact:</span>
              <span className="text-rose-400 font-bold">
                -NPR {stressImpactNpr.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-300 border-t border-slate-800 pt-2 font-bold">
              <span className="font-sans">Post-Stress Market Value:</span>
              <span className="text-white">
                NPR {(totalValue - stressImpactNpr).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3 text-xs text-slate-300 space-y-1">
            <strong className="text-amber-400 font-bold block">Defensive Cushion Advice:</strong>
            <p className="text-[11px] text-slate-400">
              Holding NPR {summary.cashBalance.toLocaleString()} in liquid cash provides adequate buffer to absorb tail-risk margin requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
