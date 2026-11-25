"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  X,
  BookOpen,
  Scale,
  Calculator,
  Percent,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Info,
} from "lucide-react";

interface NepseTermsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NepseTermsGuideModal({
  isOpen,
  onClose,
}: NepseTermsGuideModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "fees" | "taxes" | "trading" | "indicators"
  >("all");

  if (!isOpen) return null;

  const terms = [
    {
      term: "WACC (Weighted Average Cost of Capital)",
      category: "taxes",
      badge: "SEBON Essential",
      shortExplanation: "The average purchase price of your shares after combining purchases, bonus shares, and right shares.",
      detailedExplanation:
        "In Nepal, CDSC and SEBON mandate WACC calculation to determine your true purchase cost base. When you receive bonus shares (which enter at NPR 0 cost) or right shares (at NPR 100 face value), your WACC drops, ensuring Capital Gains Tax is accurately calculated upon selling.",
      formula: "WACC = (Total Purchase Cost + Adjustment Costs) / Total Shares Owned",
    },
    {
      term: "Capital Gains Tax (CGT - 7.5% vs 5.0%)",
      category: "taxes",
      badge: "Nepal Tax Law",
      shortExplanation: "Tax on net profits when selling shares in NEPSE.",
      detailedExplanation:
        "For individual Nepali citizens: If you hold a share for less than 365 days before selling, it is classified as Short-Term and taxed at 7.5% on net capital gains. If held for 365 days or more, it is Long-Term and taxed at 5.0%. Corporate entities pay a flat 10.0%. If you sell at a loss, 0 CGT is owed.",
      formula: "CGT = Max(0, Net Profit) × (7.5% or 5.0%)",
    },
    {
      term: "Broker Commission Slabs (0.40% to 0.27%)",
      category: "fees",
      badge: "Regulatory Tariff",
      shortExplanation: "Fee charged by registered NEPSE stockbrokers across 5 transaction tiers.",
      detailedExplanation:
        "SEBON regulates commission rates: Up to NPR 50,000 = 0.40% (minimum fee NPR 10); NPR 50,001 - 5,00,000 = 0.37%; NPR 5,00,001 - 20,00,000 = 0.34%; NPR 20,00,001 - 1,00,00,000 = 0.30%; Above NPR 1 Crore = 0.27%.",
      formula: "Tiered Rate based on Gross Transaction Volume",
    },
    {
      term: "SEBON Regulatory Fee (0.015%)",
      category: "fees",
      badge: "Statutory Levy",
      shortExplanation: "Statutory charge levied by Securities Board of Nepal on every trade.",
      detailedExplanation:
        "A flat 0.015% (or 0.00015 multiplier) is levied on the total purchase or disposal gross turnover to fund market supervision and investor protection programs.",
      formula: "Gross Amount × 0.00015",
    },
    {
      term: "CDSC DP Fee (NPR 25 Flat)",
      category: "fees",
      badge: "Depository",
      shortExplanation: "Central Depository Services charge per company per settlement day.",
      detailedExplanation:
        "Whenever shares are debited from or credited to your Demat account via CDSC, a flat NPR 25.00 Depository Participant (DP) charge is added per company traded in that trade day.",
      formula: "Flat NPR 25.00 per transaction batch",
    },
    {
      term: "Floor Sheet",
      category: "trading",
      badge: "Order Flow",
      shortExplanation: "The real-time log of every executed trade matching buyer and seller broker numbers.",
      detailedExplanation:
        "NEPSE's Floor Sheet records the exact contract ID, traded symbol, buyer broker (e.g. Broker 58), seller broker (e.g. Broker 45), quantity, and price. Institutional analysts watch for consecutive large buyer transactions (Block accumulation) to detect smart money entry.",
      formula: "Contract Number + Buyer Broker + Seller Broker + Volume",
    },
    {
      term: "Circuit Breaker Rules (4%, 5%, 6%)",
      category: "trading",
      badge: "Market Safety",
      shortExplanation: "Automated trading halts triggered when the NEPSE Index swings drastically.",
      detailedExplanation:
        "1st Halt: 4% index move in the 1st hour halts trading for 20 minutes. 2nd Halt: 5% move in the 2nd hour halts trading for 40 minutes. 3rd Halt: 6% move at any time halts trading for the remainder of the trading day.",
      formula: "4% -> 20m Halt, 5% -> 40m Halt, 6% -> Day Closed",
    },
    {
      term: "10% Daily Stock Price Band",
      category: "trading",
      badge: "Stock Limit",
      shortExplanation: "Maximum allowable price fluctuation for an individual stock in a single day.",
      detailedExplanation:
        "Individual equities cannot trade beyond ±10% of their previous day's closing price. Once a stock reaches +10%, it hits the Upper Circuit limit; at -10%, it hits Lower Circuit limit.",
      formula: "Previous Close × 0.90 to Previous Close × 1.10",
    },
  ];

  const filtered = terms.filter(
    (t) => selectedCategory === "all" || t.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-bronze bg-charcoal p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-obsidian hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-bronze/60 flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20 border border-gold/40 text-gold">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white">NEPSE Easy-to-Understand Financial Guide</h2>
              <span className="rounded bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/40">
                EDUCATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Clear, beginner-friendly explanations of NEPSE fees, WACC, capital gains tax, and trading rules.
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex space-x-2 mt-4 flex-shrink-0 overflow-x-auto pb-1">
          {[
            { key: "all", label: "All Concepts" },
            { key: "taxes", label: "Taxes & CGT" },
            { key: "fees", label: "Broker & SEBON Fees" },
            { key: "trading", label: "Trading & Circuit Limits" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.key
                  ? "bg-gold text-black shadow-gold"
                  : "bg-obsidian border border-bronze/60 text-slate-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Scrollable Glossary */}
        <div className="mt-4 overflow-y-auto space-y-3 pr-1 flex-1">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-bronze/70 bg-obsidian/70 p-4 hover:border-gold/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>{item.term}</span>
                </h3>
                <span className="rounded bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/30">
                  {item.badge}
                </span>
              </div>

              <p className="mt-1.5 text-xs font-semibold text-champagne">
                {item.shortExplanation}
              </p>

              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                {item.detailedExplanation}
              </p>

              {item.formula && (
                <div className="mt-2.5 rounded-lg bg-charcoal/80 border border-bronze/50 px-3 py-1.5 font-mono text-[11px] text-amber-300 flex items-center justify-between">
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Rule / Formula:</span>
                  <span>{item.formula}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-bronze/60 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-gold" />
            <span>Compliant with SEBON Circulars &amp; CDSC Clearing Guidelines (2026).</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl gold-gradient-btn px-4 py-1.5 text-xs font-bold text-black shadow-gold hover:opacity-90"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
