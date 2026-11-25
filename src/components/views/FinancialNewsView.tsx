"use client";

import React, { useState } from "react";
import {
  Newspaper,
  ExternalLink,
  Bot,
  Sparkles,
  TrendingUp,
  Tag,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { FINANCIAL_NEWS_FEED } from "@/lib/news/newsEngine";

interface FinancialNewsViewProps {
  onSelectStock: (symbol: string) => void;
}

export function FinancialNewsView({ onSelectStock }: FinancialNewsViewProps) {
  const [filterSentiment, setFilterSentiment] = useState<string>("ALL");

  const filteredNews = FINANCIAL_NEWS_FEED.filter(
    (n) => filterSentiment === "ALL" || n.sentiment === filterSentiment
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
            <Newspaper className="h-3.5 w-3.5 text-blue-400" />
            <span>FINANCIAL NEWS & DISCLOSURE INTELLIGENCE</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">SEBON & NEPSE AGGREGATOR</span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-white">Curated Market News & AI Insights</h1>
        <p className="mt-1 text-xs text-slate-400">
          Executive summaries, corporate dividend declarations, and verified regulatory notifications from reputable publishers.
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center space-x-2 text-xs font-semibold">
        {["ALL", "Bullish", "Neutral", "Bearish"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterSentiment(s)}
            className={`rounded-xl px-3 py-1.5 transition-all ${
              filterSentiment === s
                ? "bg-blue-600 text-white font-bold"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {s} News
          </button>
        ))}
      </div>

      {/* News Feed List */}
      <div className="space-y-4">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 shadow-lg space-y-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                  {item.source}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    item.sentiment === "Bullish"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : item.sentiment === "Bearish"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-slate-700/50 text-slate-300"
                  }`}
                >
                  {item.sentiment}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Impact: {item.impactScore} / 5</span>
              </div>

              <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" />
                <span>{item.publishedAt}</span>
              </div>
            </div>

            <h2 className="text-base font-bold text-white hover:text-blue-400 transition-colors">
              {item.title}
            </h2>

            {/* AI Executive Summary Callout */}
            <div className="rounded-xl border border-blue-500/20 bg-slate-900/80 p-3.5 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-[11px] mb-1">
                <Bot className="h-3.5 w-3.5" />
                <span>AI EXECUTIVE SUMMARY</span>
              </div>
              <p className="leading-relaxed">{item.summary}</p>
            </div>

            {/* Ticker Tags and Source Link */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-slate-400 text-[11px]">Impacted Symbols:</span>
                {item.relatedSymbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => onSelectStock(sym)}
                    className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-semibold"
              >
                <span>Read Full Disclosure</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
