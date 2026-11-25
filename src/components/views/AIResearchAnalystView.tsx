"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Download,
  Printer,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  BarChart3,
  Award,
  Layers,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Scale,
} from "lucide-react";
import { INITIAL_MARKET_PRICES, NEPSE_COMPANIES } from "@/lib/market/nepseData";
import { generateInstitutionalResearchReport } from "@/lib/ai/institutionalEngine";
import { InstitutionalResearchReport } from "@/types";

interface AIResearchAnalystViewProps {
  initialSymbol?: string;
  onSelectStock?: (symbol: string) => void;
}

export function AIResearchAnalystView({
  initialSymbol = "NABIL",
  onSelectStock,
}: AIResearchAnalystViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "BANKING" | "HYDRO" | "INSURANCE">("ALL");

  React.useEffect(() => {
    if (initialSymbol) {
      setSelectedSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  const report: InstitutionalResearchReport = useMemo(() => {
    return generateInstitutionalResearchReport(selectedSymbol);
  }, [selectedSymbol]);

  const company = useMemo(() => {
    return NEPSE_COMPANIES.find((c) => c.symbol === selectedSymbol);
  }, [selectedSymbol]);

  const stock = useMemo(() => {
    return INITIAL_MARKET_PRICES.find((s) => s.symbol === selectedSymbol) || INITIAL_MARKET_PRICES[0];
  }, [selectedSymbol]);

  // Sector peers for valuation comparison
  const sectorPeers = useMemo(() => {
    return INITIAL_MARKET_PRICES.filter(
      (s) => s.sector === stock.sector && s.symbol !== stock.symbol
    ).slice(0, 4);
  }, [stock.sector, stock.symbol]);

  const filteredSymbols = useMemo(() => {
    return INITIAL_MARKET_PRICES.filter((s) => {
      const matchSearch =
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (activeTab === "BANKING") return s.sector === "Commercial Banks" || s.sector === "Development Banks";
      if (activeTab === "HYDRO") return s.sector === "Hydro Power";
      if (activeTab === "INSURANCE") return s.sector.includes("Insurance");
      return true;
    });
  }, [searchQuery, activeTab]);

  const handlePrint = () => {
    window.print();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "BUY":
        return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
      case "HOLD":
        return "text-amber-400 bg-amber-500/15 border-amber-500/30";
      case "REDUCE":
        return "text-orange-400 bg-orange-500/15 border-orange-500/30";
      case "SELL":
        return "text-rose-400 bg-rose-500/15 border-rose-500/30";
      default:
        return "text-slate-400 bg-slate-800/80 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
              <FileText className="h-3.5 w-3.5 text-gold" />
              <span>04 · INSTITUTIONAL RESEARCH ANALYST</span>
            </span>
            <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-mono text-champagne border border-bronze">
              AUDITED NEPSE DISCLOSURES
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Equity Research & Valuation Synthesis
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">
            In-depth 8-part institutional research report covering fundamentals, multi-factor valuation, peer multiples, downside risk factors, and price scenarios.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 rounded-xl border border-bronze bg-charcoal px-4 py-2 text-xs font-semibold text-champagne hover:border-gold/40 hover:text-gold transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
          <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Rating</span>
            <span className={`text-sm font-black px-2 py-0.5 rounded border inline-block ${getActionColor(report.conclusion.rating)}`}>
              {report.conclusion.rating} · {report.conclusion.confidenceScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Stock Selection Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-bronze bg-charcoal/80 p-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company symbol or name (e.g. NABIL, SHIVM, CHCL)..."
            className="w-full rounded-lg border border-bronze bg-obsidian py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        {/* Quick Tickers */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["NABIL", "GBIME", "CIT", "SHIVM", "HDHPC", "NICA", "HDL"].map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                selectedSymbol === sym
                  ? "gold-gradient-btn"
                  : "border border-bronze bg-obsidian text-slate-400 hover:text-champagne hover:border-gold/30"
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Main Report Container */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 sm:p-8 space-y-8 shadow-2xl">
        {/* Report Header: Company Overview */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-bronze/60 pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-black text-white">{report.symbol}</span>
              <span className="rounded-lg border border-bronze bg-obsidian px-3 py-1 text-xs font-bold text-champagne">
                {report.sector}
              </span>
              <span className={`rounded-lg px-3 py-1 text-xs font-black border ${getActionColor(report.conclusion.rating)}`}>
                RECOMMENDATION: {report.conclusion.rating}
              </span>
            </div>
            <h2 className="text-base text-slate-300 font-medium mt-1">{report.companyName}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Source: {report.reportingDate} · NEPSE Licensed Disclosure
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
            <div className="rounded-xl border border-bronze bg-obsidian p-2.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">LTP (NPR)</span>
              <span className="text-base font-black text-white">NPR {report.price.toLocaleString()}</span>
            </div>
            <div className="rounded-xl border border-bronze bg-obsidian p-2.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">EPS (Audited)</span>
              <span className="text-base font-black text-emerald-400">NPR {report.fundamentalAnalysis.eps}</span>
            </div>
            <div className="rounded-xl border border-bronze bg-obsidian p-2.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Book Value</span>
              <span className="text-base font-black text-champagne">NPR {report.fundamentalAnalysis.bookValue}</span>
            </div>
            <div className="rounded-xl border border-bronze bg-obsidian p-2.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">P/E Multiple</span>
              <span className="text-base font-black text-gold">{report.valuationAnalysis.pe}x</span>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Thesis */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold">
            <Sparkles className="h-4 w-4" />
            <span>01 · Executive Investment Thesis</span>
          </div>
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-xs text-slate-200 leading-relaxed font-sans">
            {report.executiveThesis}
          </div>
        </section>

        {/* Section 2 & 3: Fundamentals & Valuation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 2: Fundamental Quality */}
          <section className="rounded-xl border border-bronze bg-obsidian p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-champagne">
                <Building className="h-4 w-4 text-gold" />
                <span>02 · Fundamental Quality & Solvency</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {report.fundamentalAnalysis.profitabilityGrade}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-bronze/50 rounded-lg p-3 bg-charcoal/50">
                <span className="text-slate-400 block text-[10px]">Return on Equity (ROE)</span>
                <span className="text-sm font-black text-white">{report.fundamentalAnalysis.roe}%</span>
                <span className="text-[10px] text-slate-500 block">Annualized audited</span>
              </div>
              <div className="border border-bronze/50 rounded-lg p-3 bg-charcoal/50">
                <span className="text-slate-400 block text-[10px]">Net Profit Growth</span>
                <span className="text-sm font-black text-emerald-400">{report.fundamentalAnalysis.revenueGrowth}</span>
                <span className="text-[10px] text-slate-500 block">Year-over-Year</span>
              </div>
              <div className="border border-bronze/50 rounded-lg p-3 bg-charcoal/50 col-span-2">
                <span className="text-slate-400 block text-[10px]">Balance Sheet Solvency</span>
                <span className="text-xs font-medium text-slate-200">{report.fundamentalAnalysis.balanceSheetHealth}</span>
              </div>
            </div>
          </section>

          {/* Section 3: Valuation vs Peers */}
          <section className="rounded-xl border border-bronze bg-obsidian p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-champagne">
                <Scale className="h-4 w-4 text-gold" />
                <span>03 · Valuation vs Sector Peers</span>
              </div>
              <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/30">
                {report.valuationAnalysis.valuationRating}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="border border-bronze/50 rounded-lg p-2.5 bg-charcoal/50 text-center">
                <span className="text-slate-400 block text-[10px]">P/E</span>
                <span className="text-sm font-black text-white">{report.valuationAnalysis.pe}x</span>
              </div>
              <div className="border border-bronze/50 rounded-lg p-2.5 bg-charcoal/50 text-center">
                <span className="text-slate-400 block text-[10px]">P/B</span>
                <span className="text-sm font-black text-white">{report.valuationAnalysis.pb}x</span>
              </div>
              <div className="border border-bronze/50 rounded-lg p-2.5 bg-charcoal/50 text-center">
                <span className="text-slate-400 block text-[10px]">Div Yield</span>
                <span className="text-sm font-black text-emerald-400">{report.valuationAnalysis.dividendYield}%</span>
              </div>
            </div>

            <div className="border border-bronze/40 rounded-lg p-3 bg-charcoal/30 text-xs">
              <p className="text-slate-300 font-medium mb-1.5">{report.valuationAnalysis.peVsSectorMedian}</p>
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Sector Peer Comparisons:</span>
                <div className="flex flex-wrap gap-2">
                  {sectorPeers.map((peer) => {
                    const peerComp = NEPSE_COMPANIES.find((c) => c.symbol === peer.symbol);
                    return (
                      <div
                        key={peer.symbol}
                        onClick={() => setSelectedSymbol(peer.symbol)}
                        className="cursor-pointer rounded border border-bronze bg-charcoal px-2 py-1 text-[11px] text-slate-300 hover:border-gold/50 hover:text-gold transition-colors"
                      >
                        <span className="font-bold">{peer.symbol}</span>: NPR {peer.ltp} (P/E {peerComp?.pe || 22}x)
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Section 4 & 5: Technicals & Risk Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 4: Technical Strength & Anchors */}
          <section className="rounded-xl border border-bronze bg-obsidian p-5 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-champagne">
              <BarChart3 className="h-4 w-4 text-gold" />
              <span>04 · Technical Structure & Price Anchors</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-bronze/40 pb-2">
                <span className="text-slate-400">Structural Trend:</span>
                <span className="font-bold text-emerald-400">{report.technicalAnalysis.trend}</span>
              </div>
              <div className="flex justify-between items-center border-b border-bronze/40 pb-2">
                <span className="text-slate-400">Momentum Indicator:</span>
                <span className="font-mono text-champagne">{report.technicalAnalysis.momentum}</span>
              </div>
              <div className="flex justify-between items-center border-b border-bronze/40 pb-2">
                <span className="text-slate-400">Key Support Cushion:</span>
                <span className="font-mono font-bold text-emerald-400">NPR {report.technicalAnalysis.supportLevel}</span>
              </div>
              <div className="flex justify-between items-center border-b border-bronze/40 pb-2">
                <span className="text-slate-400">Key Overhead Resistance:</span>
                <span className="font-mono font-bold text-rose-400">NPR {report.technicalAnalysis.resistanceLevel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Volatility Envelope:</span>
                <span className="text-slate-300">{report.technicalAnalysis.volatility}</span>
              </div>
            </div>
          </section>

          {/* Section 5: Risk Analysis */}
          <section className="rounded-xl border border-bronze bg-obsidian p-5 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-champagne">
              <ShieldAlert className="h-4 w-4 text-gold" />
              <span>05 · Risk Matrix & Vulnerabilities</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-lg border border-bronze/50 bg-charcoal/50 p-2.5">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">Credit & Financial Risk</span>
                <p className="text-slate-300 text-[11px] mt-0.5">{report.riskAnalysis.financialRisk}</p>
              </div>
              <div className="rounded-lg border border-bronze/50 bg-charcoal/50 p-2.5">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">Sector & Regulatory Policy</span>
                <p className="text-slate-300 text-[11px] mt-0.5">{report.riskAnalysis.sectorRisk}</p>
              </div>
              <div className="rounded-lg border border-bronze/50 bg-charcoal/50 p-2.5">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">Tradability & Liquidity Risk</span>
                <p className="text-slate-300 text-[11px] mt-0.5">{report.riskAnalysis.liquidityRisk}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Section 6: Catalysts */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold">
            <Target className="h-4 w-4" />
            <span>06 · Forward Catalysts & Event Triggers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {report.catalysts.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 rounded-xl border border-bronze bg-obsidian p-4 text-xs text-slate-300"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[10px] font-bold text-gold border border-gold/30">
                  {idx + 1}
                </span>
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Bull / Base / Bear Price Scenarios */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold">
            <Layers className="h-4 w-4" />
            <span>07 · Multi-Scenario Price Targets & Invalidation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bull Case */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-400">Bull Case (Upside)</span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400">
                  {report.scenarios.bull.upside}
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                NPR {report.scenarios.bull.targetPrice.toLocaleString()}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.scenarios.bull.assumption}
              </p>
            </div>

            {/* Base Case */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-blue-400">Base Case (Expected)</span>
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-mono font-bold text-blue-400">
                  {report.scenarios.base.upside}
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                NPR {report.scenarios.base.targetPrice.toLocaleString()}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.scenarios.base.assumption}
              </p>
            </div>

            {/* Bear Case */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-rose-400">Bear Case (Downside)</span>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-mono font-bold text-rose-400">
                  {report.scenarios.bear.upside}
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                NPR {report.scenarios.bear.targetPrice.toLocaleString()}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.scenarios.bear.assumption}
              </p>
              <div className="rounded border border-rose-500/30 bg-rose-900/30 p-2 text-[11px] text-rose-300 font-medium">
                {report.scenarios.bear.invalidation}
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Conclusion & Protection Guidelines */}
        <section className="rounded-xl border border-gold/40 bg-gradient-to-r from-charcoal via-obsidian to-charcoal p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold">
              <Award className="h-4 w-4" />
              <span>08 · Conclusion & Capital Protection Framework</span>
            </div>
            <span className="text-xs font-mono font-bold text-champagne">
              CONFIDENCE: {report.conclusion.confidenceScore}/100
            </span>
          </div>
          <p className="text-sm font-semibold text-white leading-relaxed">
            {report.conclusion.summary}
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400 border-t border-bronze/50 font-mono">
            <span>MAX CAPITAL ALLOCATION: 10% OF PORTFOLIO</span>
            <span>STOP-LOSS DISCIPLINE: STRICT (NO EMOTIONAL AVERAGING)</span>
            <span>RE-EVALUATION TRIGGER: Q2 REPORT OR 7% DRAWDOWN</span>
          </div>
        </section>
      </div>
    </div>
  );
}
