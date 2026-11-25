"use client";

import React, { useState } from "react";
import {
  Calculator,
  ArrowRight,
  DollarSign,
  Percent,
  Layers,
  ShieldCheck,
  RefreshCw,
  Info,
  Sparkles,
  Check,
} from "lucide-react";
import {
  calculateBuy,
  calculateSell,
  calculateBreakEvenPrice,
  calculateBonusShareAdjustment,
  calculateRightShareAdjustment,
  calculatePositionSize,
  DEFAULT_FEE_SCHEDULE,
} from "@/lib/financial/nepseFeeEngine";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";

export function ShareCalculatorView() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "breakeven" | "bonus" | "rights" | "position">("buy");

  // Buy State
  const [buySymbol, setBuySymbol] = useState("NABIL");
  const [buyQty, setBuyQty] = useState("100");
  const [buyPrice, setBuyPrice] = useState("524");

  // Sell State
  const [sellSymbol, setSellSymbol] = useState("NABIL");
  const [sellQty, setSellQty] = useState("100");
  const [sellPrice, setSellPrice] = useState("580");
  const [purchaseWacc, setPurchaseWacc] = useState("524");
  const [holdingDays, setHoldingDays] = useState("120");
  const [isIndividual, setIsIndividual] = useState(true);

  // Bonus State
  const [bonusLtp, setBonusLtp] = useState("1000");
  const [bonusPercent, setBonusPercent] = useState("15");

  // Rights State
  const [rightsLtp, setRightsLtp] = useState("450");
  const [rightRatioNum, setRightRatioNum] = useState("1");
  const [rightRatioDen, setRightRatioDen] = useState("1");

  // Position Sizing State
  const [riskBudget, setRiskBudget] = useState("10000");
  const [entryPrice, setEntryPrice] = useState("500");
  const [stopLossPrice, setStopLossPrice] = useState("460");

  const buyCalc = calculateBuy(
    buySymbol,
    parseFloat(buyQty) || 0,
    parseFloat(buyPrice) || 0,
    DEFAULT_FEE_SCHEDULE
  );

  const sellCalc = calculateSell(
    sellSymbol,
    parseFloat(sellQty) || 0,
    parseFloat(sellPrice) || 0,
    parseFloat(purchaseWacc) || 0,
    parseInt(holdingDays) || 100,
    isIndividual,
    DEFAULT_FEE_SCHEDULE
  );

  const breakEvenResult = calculateBreakEvenPrice(
    parseFloat(buyPrice) || 500,
    parseFloat(buyQty) || 100,
    DEFAULT_FEE_SCHEDULE
  );

  const bonusResult = calculateBonusShareAdjustment(
    parseFloat(bonusLtp) || 1000,
    parseFloat(bonusPercent) || 10
  );

  const rightsResult = calculateRightShareAdjustment(
    parseFloat(rightsLtp) || 450,
    parseFloat(rightRatioNum) || 1,
    parseFloat(rightRatioDen) || 1
  );

  const posResult = calculatePositionSize(
    parseFloat(riskBudget) || 10000,
    parseFloat(entryPrice) || 500,
    parseFloat(stopLossPrice) || 460
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
            <Calculator className="h-3.5 w-3.5 text-gold" />
            <span>NEPSE REGULATORY FEE SUITE</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">SEBON &amp; CDSC ACCREDITED (2026)</span>
        </div>
        <h1 className="mt-2.5 text-2xl font-black text-white sm:text-3xl">Advanced NEPSE Share Calculators</h1>
        <p className="mt-1 text-xs text-slate-400">
          Compute verified broker commission slabs (0.40% to 0.27%), 0.015% SEBON levy, NPR 25 CDSC DP fees, short/long-term CGT, and book value adjustments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-bronze/70 pb-2 text-xs font-semibold">
        {[
          { key: "buy", label: "Share Purchase (Buy)" },
          { key: "sell", label: "Share Disposal (Sell & CGT)" },
          { key: "breakeven", label: "Break-Even Price" },
          { key: "bonus", label: "Bonus Share Adjustment" },
          { key: "rights", label: "Right Share Adjustment" },
          { key: "position", label: "Risk & Position Sizing" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`rounded-xl px-4 py-2 transition-all ${
              activeTab === tab.key
                ? "bg-gold text-black font-bold shadow-gold"
                : "bg-charcoal border border-bronze text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Buy Calculator */}
      {activeTab === "buy" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-gold"></span>
              <span>Purchase Input Parameters</span>
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Company Symbol</label>
                <select
                  value={buySymbol}
                  onChange={(e) => {
                    setBuySymbol(e.target.value);
                    const p = INITIAL_MARKET_PRICES.find((m) => m.symbol === e.target.value);
                    if (p) setBuyPrice(p.ltp.toString());
                  }}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                >
                  {INITIAL_MARKET_PRICES.map((m) => (
                    <option key={m.symbol} value={m.symbol}>
                      {m.symbol} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Quantity (Units)</label>
                <input
                  type="number"
                  min="1"
                  value={buyQty}
                  onChange={(e) => setBuyQty(e.target.value)}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Purchase Price Per Share (NPR)</label>
                <input
                  type="number"
                  step="0.1"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="rounded-xl border border-bronze/60 bg-obsidian p-3 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-gold block">SEBON Regulatory Tariff Reference:</span>
              <p>• Broker Commission: S1 &le; 50k (0.40%, min NPR 10), S2 &le; 500k (0.37%), S3 &le; 20L (0.34%), S4 &le; 1Cr (0.30%), S5 &gt; 1Cr (0.27%).</p>
              <p>• SEBON Charge: 0.015% · CDSC DP Fee: NPR 25.00 flat.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-3 font-mono text-xs">
            <h2 className="text-sm font-bold text-white font-sans border-b border-bronze/70 pb-2">
              Cost Breakdown (Buy)
            </h2>
            <div className="flex justify-between text-slate-300">
              <span>Gross Purchase Amount:</span>
              <span>NPR {buyCalc.grossAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Broker Commission ({(buyCalc.brokerCommissionRate * 100).toFixed(2)}%):</span>
              <span>NPR {buyCalc.brokerCommission.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>SEBON Regulatory Fee (0.015%):</span>
              <span>NPR {buyCalc.sebonFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>CDSC DP Fee:</span>
              <span>NPR {buyCalc.dpFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300 border-t border-bronze/60 pt-2">
              <span>Total Charges &amp; Fees:</span>
              <span className="text-gold font-bold">NPR {buyCalc.totalCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-bronze/60 pt-2 text-sm font-bold text-emerald-400">
              <span>Total Payable Amount:</span>
              <span>NPR {buyCalc.totalPayable.toLocaleString()}</span>
            </div>
            <div className="rounded-xl bg-obsidian p-3 text-center font-sans border border-bronze/60">
              <span className="text-[11px] text-slate-400 block font-bold">Effective Cost Per Share (WACC)</span>
              <span className="text-xl font-bold font-mono text-gold mt-0.5 block">
                NPR {buyCalc.effectiveCostPerShare.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sell Calculator */}
      {activeTab === "sell" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-rose-400"></span>
              <span>Disposal Parameters</span>
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Units to Sell</label>
                  <input
                    type="number"
                    value={sellQty}
                    onChange={(e) => setSellQty(e.target.value)}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Selling Price (NPR)</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Purchase WACC (NPR)</label>
                  <input
                    type="number"
                    value={purchaseWacc}
                    onChange={(e) => setPurchaseWacc(e.target.value)}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Holding Period (Days)</label>
                  <input
                    type="number"
                    value={holdingDays}
                    onChange={(e) => setHoldingDays(e.target.value)}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="indiv"
                  checked={isIndividual}
                  onChange={(e) => setIsIndividual(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <label htmlFor="indiv" className="text-slate-300 font-semibold cursor-pointer">
                  Individual Investor (7.5% &lt; 365d, 5.0% &ge; 365d)
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-3 font-mono text-xs">
            <h2 className="text-sm font-bold text-white font-sans border-b border-bronze/70 pb-2">
              Proceeds &amp; Net Profit Breakdown
            </h2>
            <div className="flex justify-between text-slate-300">
              <span>Gross Selling Turnover:</span>
              <span>NPR {sellCalc.grossAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Broker Commission:</span>
              <span>NPR {sellCalc.brokerCommission.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>SEBON Fee (0.015%):</span>
              <span>NPR {sellCalc.sebonFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>CDSC DP Fee:</span>
              <span>NPR {sellCalc.dpFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300 border-t border-bronze/60 pt-1">
              <span>Capital Gain:</span>
              <span>NPR {sellCalc.capitalGain.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gold">
              <span>CGT Amount ({(sellCalc.cgtRate * 100).toFixed(1)}%):</span>
              <span>NPR {sellCalc.cgtAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-bronze/60 pt-2 font-bold text-emerald-400 text-sm">
              <span>Net Receivable in Bank:</span>
              <span>NPR {sellCalc.netReceivable.toLocaleString()}</span>
            </div>
            <div className="rounded-xl bg-obsidian p-3 text-center font-sans border border-bronze/60">
              <span className="text-[11px] text-slate-400 block font-bold">Net Realized Profit / Loss</span>
              <span
                className={`text-lg font-bold font-mono ${
                  sellCalc.netProfitLoss >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {sellCalc.netProfitLoss >= 0 ? "+" : ""}NPR{" "}
                {sellCalc.netProfitLoss.toLocaleString()} ({sellCalc.returnPercent}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Break-Even Calculator */}
      {activeTab === "breakeven" && (
        <div className="rounded-2xl border border-bronze bg-charcoal p-6 max-w-xl mx-auto space-y-4 text-xs shadow-xl">
          <h2 className="text-base font-bold text-white">Target Break-Even Price Finder</h2>
          <p className="text-slate-400">
            Calculates the exact selling price per share where your net proceeds equal your acquisition cost (including both buy and sell commission slabs, SEBON, and DP fees).
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Acquisition WACC Per Share (NPR)</label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Holding Quantity (Units)</label>
              <input
                type="number"
                value={buyQty}
                onChange={(e) => setBuyQty(e.target.value)}
                className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-obsidian p-5 text-center font-mono border border-bronze/60">
            <span className="text-slate-400 block text-xs font-sans">
              Minimum Selling Price for 0.00% Loss
            </span>
            <span className="text-3xl font-black text-gold mt-1 block">
              NPR {breakEvenResult.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 font-sans mt-2 block">
              Sell above NPR {breakEvenResult.toFixed(2)} to realize positive capital gain.
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: Bonus Share Adjustment */}
      {activeTab === "bonus" && (
        <div className="rounded-2xl border border-bronze bg-charcoal p-6 max-w-xl mx-auto space-y-4 text-xs shadow-xl">
          <h2 className="text-base font-bold text-white">Bonus Share Price Adjustment</h2>
          <p className="text-slate-400">
            Adjusted Price = Market Price &divide; (1 + Bonus Ratio)
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Current Market Price (LTP)</label>
              <input
                type="number"
                value={bonusLtp}
                onChange={(e) => setBonusLtp(e.target.value)}
                className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Bonus Share Percentage (%)</label>
              <input
                type="number"
                value={bonusPercent}
                onChange={(e) => setBonusPercent(e.target.value)}
                className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="rounded-xl bg-obsidian p-5 text-center font-mono border border-bronze/60">
            <span className="text-slate-400 block text-xs font-sans">
              Theoretical Ex-Bonus Adjusted Price
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              NPR {bonusResult.adjustedPrice.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Tab 5: Right Share Adjustment */}
      {activeTab === "rights" && (
        <div className="rounded-2xl border border-bronze bg-charcoal p-6 max-w-xl mx-auto space-y-4 text-xs shadow-xl">
          <h2 className="text-base font-bold text-white">Right Share Price Adjustment</h2>
          <p className="text-slate-400">
            Adjusted Price = (LTP + (Ratio &times; 100)) &divide; (1 + Ratio)
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Current LTP (NPR)</label>
              <input
                type="number"
                value={rightsLtp}
                onChange={(e) => setRightsLtp(e.target.value)}
                className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Ratio (Num: e.g. 1)</label>
              <input
                type="number"
                value={rightRatioNum}
                onChange={(e) => setRightRatioNum(e.target.value)}
                className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Ratio (Denom: e.g. 1)</label>
              <input
                type="number"
                value={rightRatioDen}
                onChange={(e) => setRightRatioDen(e.target.value)}
                className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="rounded-xl bg-obsidian p-5 text-center font-mono border border-bronze/60">
            <span className="text-slate-400 block text-xs font-sans">
              Theoretical Ex-Rights Adjusted Price
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              NPR {rightsResult.adjustedPrice.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Tab 6: Position Sizing */}
      {activeTab === "position" && (
        <div className="rounded-2xl border border-bronze bg-charcoal p-6 max-w-xl mx-auto space-y-4 text-xs shadow-xl">
          <h2 className="text-base font-bold text-white">Fixed-Risk Position Sizing</h2>
          <p className="text-slate-400">
            Calculates max units to buy such that hitting your stop-loss limits total loss to your exact defined budget.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Risk Budget (NPR)</label>
              <input
                type="number"
                value={riskBudget}
                onChange={(e) => setRiskBudget(e.target.value)}
                className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Entry Price (NPR)</label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Stop-Loss Price (NPR)</label>
                <input
                  type="number"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-obsidian p-5 text-center font-mono border border-bronze/60 space-y-1">
            <span className="text-slate-400 block text-xs font-sans">
              Recommended Maximum Position Size
            </span>
            <span className="text-3xl font-black text-gold mt-1 block">
              {posResult.maxShares} Shares
            </span>
            <span className="text-xs text-slate-300 block">
              Capital Required: NPR {posResult.totalCapitalRequired.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
