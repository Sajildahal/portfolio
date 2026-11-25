"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Percent,
  DollarSign,
  Scale,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { calculateBuy, calculateSell, calculateBreakEvenPrice } from "@/lib/financial/nepseFeeEngine";

export function SmartPositionSizingView() {
  const [totalCapital, setTotalCapital] = useState<number>(1000000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NABIL");
  
  const currentStock = useMemo(() => {
    return INITIAL_MARKET_PRICES.find((s) => s.symbol === selectedSymbol) || INITIAL_MARKET_PRICES[0];
  }, [selectedSymbol]);

  const [entryPrice, setEntryPrice] = useState<number>(currentStock.ltp);
  const [stopLossPrice, setStopLossPrice] = useState<number>(Math.round(currentStock.ltp * 0.94));
  const [targetPrice, setTargetPrice] = useState<number>(Math.round(currentStock.ltp * 1.12));

  // Sync entry price when selected symbol changes
  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
    const stock = INITIAL_MARKET_PRICES.find((s) => s.symbol === sym) || INITIAL_MARKET_PRICES[0];
    setEntryPrice(stock.ltp);
    setStopLossPrice(Math.round(stock.ltp * 0.94));
    setTargetPrice(Math.round(stock.ltp * 1.12));
  };

  // Calculations
  const calculation = useMemo(() => {
    const riskAmount = (totalCapital * riskPercent) / 100;
    const perShareRisk = Math.max(1, entryPrice - stopLossPrice);
    const perShareReward = Math.max(1, targetPrice - entryPrice);

    // Theoretical shares based solely on stop-loss risk
    const theoreticalShares = Math.floor(riskAmount / perShareRisk);

    // Constraints:
    // 1. Max portfolio allocation limit (e.g., max 25% in one stock)
    const maxCapitalPerStock = totalCapital * 0.25;
    const maxSharesByCapital = Math.floor(maxCapitalPerStock / entryPrice);

    // 2. Liquidity constraint: no more than 5% of daily volume to ensure smooth exit
    const avgDailyVolume = currentStock.volume || 50000;
    const maxSharesByLiquidity = Math.floor(avgDailyVolume * 0.05);

    // Recommended shares is minimum of risk-based and constraints
    const recommendedShares = Math.max(
      10,
      Math.min(theoreticalShares, maxSharesByCapital, maxSharesByLiquidity)
    );

    const grossPositionValue = recommendedShares * entryPrice;

    // Fee breakdown for entry
    const buyFees = calculateBuy(selectedSymbol, recommendedShares, entryPrice);

    // Fee breakdown for exit at stop-loss
    const stopLossFees = calculateSell(selectedSymbol, recommendedShares, stopLossPrice, entryPrice, 30, true);

    // Fee breakdown for exit at target
    const targetFees = calculateSell(selectedSymbol, recommendedShares, targetPrice, entryPrice, 30, true);

    const netCapitalRequired = buyFees.totalPayable;
    const actualLossAtStop = netCapitalRequired - stopLossFees.netReceivable;
    const actualProfitAtTarget = targetFees.netReceivable - netCapitalRequired;

    const breakEvenPrice = calculateBreakEvenPrice(entryPrice, recommendedShares);
    const rewardRiskRatio = actualLossAtStop > 0 ? (actualProfitAtTarget / actualLossAtStop).toFixed(2) : "0.0";

    const portfolioExposurePercent = ((grossPositionValue / totalCapital) * 100).toFixed(1);

    const isConstrainedByLiquidity = theoreticalShares > maxSharesByLiquidity;
    const isConstrainedByCapitalCap = theoreticalShares > maxSharesByCapital;

    return {
      riskAmount,
      perShareRisk,
      perShareReward,
      theoreticalShares,
      recommendedShares,
      grossPositionValue,
      netCapitalRequired,
      actualLossAtStop,
      actualProfitAtTarget,
      breakEvenPrice,
      rewardRiskRatio,
      portfolioExposurePercent,
      isConstrainedByLiquidity,
      isConstrainedByCapitalCap,
      buyFees,
      stopLossFees,
      targetFees,
    };
  }, [totalCapital, riskPercent, entryPrice, stopLossPrice, targetPrice, currentStock]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
            <Scale className="h-3.5 w-3.5 text-gold" />
            <span>07 · CAPITAL ALLOCATION &amp; POSITION SIZING</span>
          </span>
          <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-mono text-champagne border border-bronze">
            RISK-BASED MATH
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          Smart Position Sizing &amp; Exposure Engine
        </h1>
        <p className="mt-1 text-xs text-slate-400 max-w-2xl">
          Determine the mathematically optimal number of shares to purchase based on portfolio equity, risk tolerance, stop-loss distance, liquidity constraints, and exact SEBON/broker fees.
        </p>
      </div>

      {/* Main Grid: Inputs vs Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-bronze bg-charcoal p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-bronze pb-3">
            <h2 className="text-sm font-bold text-champagne flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-gold" />
              <span>Risk &amp; Trade Parameters</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">SEBON 2081/82 COMPLIANT</span>
          </div>

          {/* Capital & Risk % */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Total Portfolio Capital (NPR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={totalCapital}
                  onChange={(e) => setTotalCapital(Math.max(10000, Number(e.target.value)))}
                  className="w-full rounded-xl border border-bronze bg-obsidian py-2.5 px-4 text-xs font-mono font-bold text-white focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Risk Per Trade: <span className="text-gold font-mono">{riskPercent}%</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Max Risk: NPR {calculation.riskAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.5% (Conservative)</span>
                <span>1.5% (Standard)</span>
                <span>3.0%+ (Aggressive)</span>
              </div>
            </div>
          </div>

          {/* Stock Selection */}
          <div className="space-y-2 pt-2 border-t border-bronze/60">
            <label className="text-xs font-bold text-slate-300 block">Select Target Company</label>
            <div className="grid grid-cols-4 gap-2">
              {["NABIL", "GBIME", "SHIVM", "HDHPC", "CIT", "HDL", "NICA", "CHCL"].map((sym) => (
                <button
                  key={sym}
                  onClick={() => handleSelectSymbol(sym)}
                  className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                    selectedSymbol === sym
                      ? "gold-gradient-btn"
                      : "border border-bronze bg-obsidian text-slate-400 hover:text-champagne"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Entry, Stop-Loss, Target Prices */}
          <div className="space-y-3 pt-2 border-t border-bronze/60">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Entry Price (NPR)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-bronze bg-obsidian py-2 px-3 text-xs font-mono font-bold text-white focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">Stop-Loss Price (NPR)</label>
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => setStopLossPrice(Math.round(entryPrice * 0.95))}
                    className="text-[10px] text-slate-400 hover:text-rose-400 border border-bronze rounded px-1.5"
                  >
                    -5%
                  </button>
                  <button
                    onClick={() => setStopLossPrice(Math.round(entryPrice * 0.93))}
                    className="text-[10px] text-slate-400 hover:text-rose-400 border border-bronze rounded px-1.5"
                  >
                    -7%
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-rose-500/40 bg-obsidian py-2 px-3 text-xs font-mono font-bold text-rose-400 focus:border-rose-400 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">Target Profit Price (NPR)</label>
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => setTargetPrice(Math.round(entryPrice * 1.1))}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 border border-bronze rounded px-1.5"
                  >
                    +10%
                  </button>
                  <button
                    onClick={() => setTargetPrice(Math.round(entryPrice * 1.15))}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 border border-bronze rounded px-1.5"
                  >
                    +15%
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-emerald-500/40 bg-obsidian py-2 px-3 text-xs font-mono font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Results & Sizing Blueprint (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Recommended Allocation Card */}
          <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-charcoal via-obsidian to-charcoal p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
              <Scale className="h-40 w-40 text-gold" />
            </div>

            <span className="text-[10px] uppercase font-bold text-gold tracking-wider block mb-1">
              MATHEMATICALLY CALIBRATED RECOMMENDATION
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
              <div>
                <span className="text-4xl font-black text-white font-mono">
                  {calculation.recommendedShares.toLocaleString()}{" "}
                  <span className="text-base font-normal text-slate-400">Shares</span>
                </span>
                <span className="text-xs text-champagne block mt-0.5">
                  of {currentStock.name} ({currentStock.symbol})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block">Portfolio Allocation</span>
                <span className="text-lg font-black text-gold font-mono">
                  {calculation.portfolioExposurePercent}% of Capital
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-bronze/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Net Capital Needed</span>
                <span className="text-sm font-bold text-white font-mono">
                  NPR {calculation.netCapitalRequired.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Risk at Stop-Loss</span>
                <span className="text-sm font-bold text-rose-400 font-mono">
                  -NPR {calculation.actualLossAtStop.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Profit at Target</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  +NPR {calculation.actualProfitAtTarget.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Reward/Risk Ratio</span>
                <span className="text-sm font-bold text-gold font-mono">
                  {calculation.rewardRiskRatio} : 1
                </span>
              </div>
            </div>
          </div>

          {/* Break-Even & Liquidity Safety Constraints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Break-Even Box */}
            <div className="rounded-xl border border-bronze bg-charcoal p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-champagne">Break-Even Price</span>
                <span className="text-[10px] text-slate-500 font-mono">INCL. ALL FEES</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                NPR {calculation.breakEvenPrice.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400">
                Requires a +{(((calculation.breakEvenPrice - entryPrice) / entryPrice) * 100).toFixed(2)}% move to cover SEBON (0.015%), broker commission, and CDSC DP (Rs 25).
              </p>
            </div>

            {/* Liquidity Guard */}
            <div className="rounded-xl border border-bronze bg-charcoal p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-champagne">Liquidity &amp; Impact Check</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {((calculation.recommendedShares / (currentStock.volume || 1)) * 100).toFixed(2)}% of Volume
              </div>
              <p className="text-[11px] text-slate-400">
                Position represents safe execution depth without moving the order book or risking bid-ask slippage.
              </p>
            </div>
          </div>

          {/* Fee Transparency Breakdown */}
          <div className="rounded-xl border border-bronze bg-charcoal p-4 space-y-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Official NEPSE Regulatory Fee Breakdown (Buy Side):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div className="border border-bronze/50 rounded-lg p-2 bg-obsidian">
                <span className="text-slate-500 block text-[9px]">Broker Commission</span>
                <span className="text-white">NPR {calculation.buyFees.brokerCommission.toFixed(2)}</span>
              </div>
              <div className="border border-bronze/50 rounded-lg p-2 bg-obsidian">
                <span className="text-slate-500 block text-[9px]">SEBON Regulatory (0.015%)</span>
                <span className="text-white">NPR {calculation.buyFees.sebonFee.toFixed(2)}</span>
              </div>
              <div className="border border-bronze/50 rounded-lg p-2 bg-obsidian">
                <span className="text-slate-500 block text-[9px]">CDSC DP Fee</span>
                <span className="text-white">NPR 25.00</span>
              </div>
              <div className="border border-bronze/50 rounded-lg p-2 bg-obsidian">
                <span className="text-slate-500 block text-[9px]">Effective Comm Rate</span>
                <span className="text-gold">{(calculation.buyFees.brokerCommissionRate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
