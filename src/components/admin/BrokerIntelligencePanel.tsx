// ============================================================================
// Institutional Master Admin - AI Broker Intelligence & Script Analysis Panel
// Top buyer/seller brokers, net positions, accumulation/distribution detection
// ============================================================================

"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { FloorsheetRecord, ScriptBrokerIntelligence } from "@/types";
import { analyzeBrokerIntelligenceForSymbol } from "@/lib/floorsheet/brokerIntelligenceEngine";
import { loadStoredDatasets } from "@/lib/floorsheet/floorsheetEngine";

interface BrokerIntelligencePanelProps {
  initialSymbol?: string;
  showToast: (msg: string) => void;
  logAction: (action: string, category: any) => void;
}

export function BrokerIntelligencePanel({
  initialSymbol = "NABIL",
  showToast,
  logAction,
}: BrokerIntelligencePanelProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [customInput, setCustomInput] = useState("");

  // Gather all approved records from stored datasets
  const allRecords: FloorsheetRecord[] = useMemo(() => {
    const datasets = loadStoredDatasets();
    const approved = datasets.filter((d) => d.status === "APPROVED");
    const collected: FloorsheetRecord[] = [];
    approved.forEach((d) => collected.push(...d.records));
    return collected;
  }, []);

  const intelligence: ScriptBrokerIntelligence = useMemo(() => {
    return analyzeBrokerIntelligenceForSymbol(selectedSymbol, allRecords);
  }, [selectedSymbol, allRecords]);

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym.toUpperCase());
    setCustomInput("");
  };

  const handleSearchCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setSelectedSymbol(customInput.trim().toUpperCase());
    }
  };

  const handlePublishAnalysis = () => {
    showToast(`Published official broker intelligence for ${selectedSymbol} to User Dashboard.`);
    logAction(`Published Broker Intelligence for ${selectedSymbol}`, "AI_BROKER");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
              <Users className="h-3.5 w-3.5 text-gold" />
              <span>MODULE 4 &amp; 5 · AI BROKER INTELLIGENCE &amp; ACCUMULATION</span>
            </span>
            <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-mono text-champagne border border-bronze">
              ORDER FLOW CONCENTRATION
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white">Script-Level Broker Activity &amp; Pressure Engine</h2>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">
            Analyze broker-side net buying and selling volumes. Quantify accumulation/distribution dynamics and broker concentration using neutral, non-defamatory mathematical models.
          </p>
        </div>

        <button
          onClick={handlePublishAnalysis}
          className="gold-gradient-btn flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-gold"
        >
          <Sparkles className="h-4 w-4" />
          <span>Publish Analysis</span>
        </button>
      </div>

      {/* Script Selector Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bronze bg-charcoal p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 font-sans mr-1">Active Scrips:</span>
          {["NABIL", "GBIME", "CHCL", "SHIVM", "CIT", "HRL", "NICA", "SCB"].map((sym) => (
            <button
              key={sym}
              onClick={() => handleSelectSymbol(sym)}
              className={`rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                selectedSymbol === sym
                  ? "gold-gradient-btn text-black shadow-gold-sm"
                  : "border border-bronze bg-obsidian text-slate-400 hover:text-white"
              }`}
            >
              {sym}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchCustom} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticker..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-36 sm:w-44 rounded-xl border border-bronze bg-obsidian py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-gold focus:outline-none uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-bronze bg-obsidian px-3 py-1.5 text-xs font-bold text-champagne hover:border-gold"
          >
            Query
          </button>
        </form>
      </div>

      {/* Primary KPI & Quantitative Scores Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs tabular-nums">
        {/* Accumulation Score */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-1 shadow-sm">
          <span className="text-slate-400 font-sans block text-[11px] uppercase">Accumulation Score</span>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black ${
                intelligence.accumulationScore >= 70 ? "text-emerald-400" : "text-slate-200"
              }`}
            >
              {intelligence.accumulationScore} / 100
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block">
            {intelligence.accumulationScore >= 70 ? "Persistent net buying cluster" : "Neutral buyer activity"}
          </span>
        </div>

        {/* Distribution Score */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-1 shadow-sm">
          <span className="text-slate-400 font-sans block text-[11px] uppercase">Distribution Score</span>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black ${
                intelligence.distributionScore >= 70 ? "text-rose-400" : "text-slate-200"
              }`}
            >
              {intelligence.distributionScore} / 100
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block">
            {intelligence.distributionScore >= 70 ? "Elevated seller dominance" : "Restrained selling volume"}
          </span>
        </div>

        {/* Broker Concentration */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-1 shadow-sm">
          <span className="text-slate-400 font-sans block text-[11px] uppercase">Broker Concentration</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-champagne">
              {intelligence.brokerConcentrationRatio}%
            </span>
            <span className="text-[10px] text-gold font-bold font-sans">
              ({intelligence.brokerConcentrationLevel})
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block">
            Share of top 3 buying brokers
          </span>
        </div>

        {/* Total Turnover */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-1 shadow-sm">
          <span className="text-slate-400 font-sans block text-[11px] uppercase">Turnover Analysed</span>
          <span className="text-2xl font-black text-white">
            NPR {(intelligence.totalTurnover / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-emerald-400 font-sans block">
            {intelligence.totalQuantity.toLocaleString()} shares traded
          </span>
        </div>
      </div>

      {/* AI Signal & Neutral Interpretation Banner */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-bronze/60 pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <span className="rounded-xl bg-gold/20 px-3 py-1 text-sm font-black text-gold border border-gold/40 font-mono">
              {selectedSymbol}
            </span>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                AI Quantitative Order Flow Classification
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Session As Of: {intelligence.tradingDate} · Data Freshness: {new Date(intelligence.dataFreshness).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div>
            <span
              className={`rounded-xl px-3.5 py-1 text-xs font-black border uppercase tracking-wider ${
                intelligence.signal === "ACCUMULATION_LIKE"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : intelligence.signal === "DISTRIBUTION_LIKE"
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : intelligence.signal === "HIGH_BROKER_CONCENTRATION"
                  ? "bg-gold/20 text-gold border-gold/40"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              Signal: {intelligence.signal.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Analytical Interpretation */}
        <div className="space-y-2">
          <p className="text-xs text-slate-200 leading-relaxed font-sans bg-obsidian p-4 rounded-xl border border-bronze/50">
            {intelligence.aiInterpretation}
          </p>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-sans block">
              Observed Transaction Facts:
            </span>
            <ul className="space-y-1 text-xs text-slate-300 font-sans">
              {intelligence.supportingEvidence.map((ev, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-gold mt-0.5">•</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Regulatory & Analytical Disclaimer */}
        <div className="rounded-xl bg-obsidian/60 border border-bronze/40 p-3 text-[11px] text-slate-400 flex items-start space-x-2 font-sans">
          <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <span>
            <strong>Institutional Integrity Notice:</strong> Broker-side data indicates transaction clearing volume, not beneficial ownership or intent. Signals reflect mathematical activity patterns and should be synthesized with technical levels and fundamental valuation.
          </span>
        </div>
      </div>

      {/* Top Buyer Brokers vs Top Seller Brokers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Buyer Brokers */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase text-emerald-400 font-sans">
                Top Buyer Brokers
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">GROSS ACCUMULATION</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead className="bg-obsidian font-sans text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="py-2 px-3">Broker</th>
                  <th className="py-2 px-3 text-right">Bought Units</th>
                  <th className="py-2 px-3 text-right">Avg Rate</th>
                  <th className="py-2 px-3 text-right">Turnover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bronze/40">
                {intelligence.topBuyers.map((b) => (
                  <tr key={b.brokerNo} className="hover:bg-obsidian/60">
                    <td className="py-2 px-3 font-medium text-white font-sans">
                      <span className="font-mono text-emerald-400 mr-1.5">#{b.brokerNo}</span>
                      {b.brokerName}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-200">
                      {b.buyQty.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">NPR {b.avgBuyRate}</td>
                    <td className="py-2 px-3 text-right font-bold text-champagne">
                      NPR {(b.buyAmount / 100000).toFixed(2)} L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Seller Brokers */}
        <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-bronze/60 pb-2">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-bold uppercase text-rose-400 font-sans">
                Top Seller Brokers
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">GROSS DISTRIBUTION</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead className="bg-obsidian font-sans text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="py-2 px-3">Broker</th>
                  <th className="py-2 px-3 text-right">Sold Units</th>
                  <th className="py-2 px-3 text-right">Avg Rate</th>
                  <th className="py-2 px-3 text-right">Turnover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bronze/40">
                {intelligence.topSellers.map((s) => (
                  <tr key={s.brokerNo} className="hover:bg-obsidian/60">
                    <td className="py-2 px-3 font-medium text-white font-sans">
                      <span className="font-mono text-rose-400 mr-1.5">#{s.brokerNo}</span>
                      {s.brokerName}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-200">
                      {s.sellQty.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">NPR {s.avgSellRate}</td>
                    <td className="py-2 px-3 text-right font-bold text-champagne">
                      NPR {(s.sellAmount / 100000).toFixed(2)} L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Net Positioning Table */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-bronze/60 pb-2">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-gold" />
            <span className="text-xs font-bold uppercase text-gold font-sans">
              Net Broker Accumulation / Distribution Ledger
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">BUY UNITS MINUS SELL UNITS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Net Buyers */}
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase font-sans block mb-1.5">
              Net Accumulating Brokers
            </span>
            <div className="space-y-1.5">
              {intelligence.netBuyerBrokers.map((b) => (
                <div
                  key={b.brokerNo}
                  className="flex justify-between items-center bg-obsidian border border-emerald-500/20 rounded-xl px-3 py-2 text-xs font-mono"
                >
                  <span className="font-sans text-white">
                    <span className="font-mono text-emerald-400 mr-1">#{b.brokerNo}</span>
                    {b.brokerName}
                  </span>
                  <span className="font-bold text-emerald-400">+{b.netQty.toLocaleString()} Units</span>
                </div>
              ))}
            </div>
          </div>

          {/* Net Sellers */}
          <div>
            <span className="text-[11px] font-bold text-rose-400 uppercase font-sans block mb-1.5">
              Net Distributing Brokers
            </span>
            <div className="space-y-1.5">
              {intelligence.netSellerBrokers.map((s) => (
                <div
                  key={s.brokerNo}
                  className="flex justify-between items-center bg-obsidian border border-rose-500/20 rounded-xl px-3 py-2 text-xs font-mono"
                >
                  <span className="font-sans text-white">
                    <span className="font-mono text-rose-400 mr-1">#{s.brokerNo}</span>
                    {s.brokerName}
                  </span>
                  <span className="font-bold text-rose-400">-{s.netQty.toLocaleString()} Units</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
