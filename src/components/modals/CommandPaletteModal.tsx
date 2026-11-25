// ============================================================================
// Institutional Command Palette & Instant Global Search (Ctrl+K / Cmd+K)
// Sub-second fuzzy search across stocks, analytical tools, views & actions
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Command,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Compass,
  Radar,
  Activity,
  LogOut,
  FileText,
  Scale,
  Bot,
  Briefcase,
  LineChart,
  Building2,
  BrainCircuit,
  ShieldCheck,
  Calculator,
  X,
  Zap,
} from "lucide-react";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { TabKey } from "@/components/Sidebar";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: TabKey) => void;
  onSelectStock: (symbol: string) => void;
  onOpenOrderPad: (symbol?: string, type?: "BUY" | "SELL") => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectStock,
  onOpenOrderPad,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Navigation Items
  const toolItems = useMemo(
    () => [
      { key: "command-center" as TabKey, label: "Market Command Center", category: "Flagship AI", icon: Compass },
      { key: "stock-radar" as TabKey, label: "AI Stock Radar & Deterioration", category: "Flagship AI", icon: Radar },
      { key: "portfolio-doctor" as TabKey, label: "AI Portfolio Doctor & Stress Test", category: "Flagship AI", icon: Activity },
      { key: "smart-exit" as TabKey, label: "Smart Exit Advisor & Stop Rules", category: "Flagship AI", icon: LogOut },
      { key: "ai-research" as TabKey, label: "AI Research Analyst Reports", category: "Flagship AI", icon: FileText },
      { key: "position-sizing" as TabKey, label: "Quantitative Position Sizer", category: "Flagship AI", icon: Scale },
      { key: "copilot" as TabKey, label: "AI Copilot Terminal", category: "Flagship AI", icon: Bot },
      { key: "live-market" as TabKey, label: "Live NEPSE Market Feed (282+)", category: "Market", icon: TrendingUp },
      { key: "portfolio" as TabKey, label: "My Portfolio Ledger", category: "Portfolio", icon: Briefcase },
      { key: "technical" as TabKey, label: "Interactive Technical Charting", category: "Analytics", icon: LineChart },
      { key: "fundamentals" as TabKey, label: "Fundamental Ratios & Quality", category: "Analytics", icon: Building2 },
      { key: "backtesting" as TabKey, label: "Strategy Backtesting Simulator", category: "Analytics", icon: BrainCircuit },
      { key: "calculator" as TabKey, label: "SEBON Fee & WACC Calculator", category: "Tools", icon: Calculator },
      { key: "admin" as TabKey, label: "Master Admin Console & Floorsheet", category: "Admin", icon: ShieldCheck },
    ],
    []
  );

  // Filtered Stocks
  const matchingStocks = useMemo(() => {
    if (!query.trim()) return INITIAL_MARKET_PRICES.slice(0, 6);
    const q = query.toLowerCase();
    return INITIAL_MARKET_PRICES.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  // Filtered Tools
  const matchingTools = useMemo(() => {
    if (!query.trim()) return toolItems.slice(0, 8);
    const q = query.toLowerCase();
    return toolItems.filter(
      (t) => t.label.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [query, toolItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border-2 border-gold/40 bg-gradient-to-b from-[#111726] to-[#0A0E17] shadow-2xl shadow-gold/10 overflow-hidden text-white">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-bronze/70 px-4 py-3.5 bg-obsidian/70">
          <Search className="h-5 w-5 text-gold mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search NEPSE symbol (e.g. NABIL, SHIVM), view, or tool..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-white mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center space-x-1 rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-400">
            <span>ESC to close</span>
          </kbd>
        </div>

        {/* Scrollable Results */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Actions Bar */}
          <div className="flex items-center space-x-2 px-2 pt-1">
            <button
              onClick={() => {
                onOpenOrderPad();
                onClose();
              }}
              className="flex items-center space-x-1.5 rounded-lg gold-gradient-btn px-3 py-1.5 font-bold text-black shadow-gold text-[11px]"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Open Trade Pad</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab("command-center");
                onClose();
              }}
              className="flex items-center space-x-1.5 rounded-lg border border-bronze bg-charcoal px-3 py-1.5 font-bold text-slate-200 hover:text-white hover:border-gold/50 text-[11px]"
            >
              <Compass className="h-3.5 w-3.5 text-gold" />
              <span>Market Command Center</span>
            </button>
          </div>

          {/* Stocks Section */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 block">
              Stocks &amp; Listed Equities ({matchingStocks.length})
            </span>
            <div className="space-y-1">
              {matchingStocks.map((stock) => {
                const isPos = stock.changePercent >= 0;
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => {
                      onSelectStock(stock.symbol);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gold/10 hover:border-gold/40 border border-transparent cursor-pointer transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-obsidian border border-bronze group-hover:border-gold text-gold font-bold font-mono text-xs">
                        {stock.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{stock.symbol}</span>
                          <span className="text-[10px] text-slate-400">({stock.sector})</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                          {stock.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="font-bold text-white block">NPR {stock.ltp}</span>
                      <span className={`text-[11px] font-bold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                        {isPos ? "+" : ""}
                        {stock.changePercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tools & Modules Section */}
          <div className="space-y-1 pt-1 border-t border-bronze/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 block">
              Platform Tools &amp; Intelligence Views ({matchingTools.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {matchingTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.key}
                    onClick={() => {
                      onNavigateTab(tool.key);
                      onClose();
                    }}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-bronze cursor-pointer transition-all"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-obsidian border border-bronze text-gold">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-200 block truncate">
                        {tool.label}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
                        {tool.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Shortcut Guide */}
        <div className="flex items-center justify-between border-t border-bronze/70 bg-obsidian/90 px-4 py-2 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Dismiss</span>
          </div>
          <span className="text-gold font-bold">NEPSE AI Terminal v3.8</span>
        </div>
      </div>
    </div>
  );
}
