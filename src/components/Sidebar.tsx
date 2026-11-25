"use client";

import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Bot,
  LineChart,
  Crosshair,
  Building2,
  Gauge,
  Newspaper,
  Filter,
  BookOpen,
  Calculator,
  ShieldCheck,
  CreditCard,
  Bookmark,
  ShieldAlert,
  BrainCircuit,
  Radar,
  Activity,
  LogOut,
  FileText,
  Scale,
  Sparkles,
  Compass,
} from "lucide-react";

export type TabKey =
  | "command-center"
  | "dashboard"
  | "live-market"
  | "portfolio"
  | "stock-radar"
  | "portfolio-doctor"
  | "smart-exit"
  | "ai-research"
  | "position-sizing"
  | "copilot"
  | "ai-intelligence"
  | "technical"
  | "tools"
  | "fundamentals"
  | "backtesting"
  | "risk"
  | "watchlist"
  | "sentiment"
  | "news"
  | "screener"
  | "journal"
  | "calculator"
  | "admin"
  | "subscription";

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const menuGroups = [
    {
      group: "FLAGSHIP AI SYSTEMS",
      items: [
        { key: "command-center", label: "00 · Market Command Center", icon: Compass, badge: "Macro" },
        { key: "stock-radar", label: "01 · Stock Radar", icon: Radar, badge: "AI" },
        { key: "portfolio-doctor", label: "02 · Portfolio Doctor", icon: Activity, badge: "Risk" },
        { key: "smart-exit", label: "03 · Smart Exit Advisor", icon: LogOut, badge: "Exit" },
        { key: "ai-research", label: "04 · AI Research Analyst", icon: FileText, badge: "Report" },
        { key: "position-sizing", label: "07 · Position Sizing", icon: Scale, badge: "Quant" },
        { key: "copilot", label: "10 · AI Copilot Terminal", icon: Bot, badge: "Live" },
      ],
    },
    {
      group: "PORTFOLIO & CAPITAL",
      items: [
        { key: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
        { key: "live-market", label: "Live Market (282+)", icon: TrendingUp },
        { key: "portfolio", label: "My Portfolio", icon: Briefcase, badge: "CRUD" },
        { key: "risk", label: "Risk & Stress Test", icon: ShieldAlert },
        { key: "calculator", label: "Share Fee Calculator", icon: Calculator },
        { key: "watchlist", label: "Watchlist & Alerts", icon: Bookmark },
      ],
    },
    {
      group: "ANALYTICS & STRATEGY",
      items: [
        { key: "tools", label: "Trading Scanners (9x)", icon: Crosshair },
        { key: "backtesting", label: "Strategy Backtesting", icon: BrainCircuit, badge: "Sim" },
        { key: "technical", label: "Technical Charting", icon: LineChart },
        { key: "fundamentals", label: "Fundamental Ratios", icon: Building2 },
        { key: "sentiment", label: "Market Fear & Greed", icon: Gauge },
        { key: "news", label: "Intelligence News Feed", icon: Newspaper },
        { key: "screener", label: "Advanced Screener", icon: Filter },
        { key: "journal", label: "Trading Journal", icon: BookOpen },
      ],
    },
    {
      group: "SYSTEM CONTROL",
      items: [
        { key: "admin", label: "Admin Master Control", icon: ShieldCheck, badge: "Master" },
        { key: "subscription", label: "Subscription Tiers", icon: CreditCard },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-bronze bg-charcoal p-3 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              {group.group}
            </p>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectTab(item.key as TabKey)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "border border-gold/40 bg-gold/15 text-gold shadow-gold font-bold"
                        : "text-slate-400 hover:bg-obsidian hover:text-champagne border border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-gold" : "text-slate-500"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          item.badge === "AI" || item.badge === "Live"
                            ? "bg-gold/20 text-gold border border-gold/30"
                            : item.badge === "Risk" || item.badge === "Exit"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : item.badge === "Master"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="mt-4 pt-3 border-t border-bronze/60">
        <div className="rounded-xl border border-bronze/70 bg-obsidian p-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
              INSTITUTIONAL CORE
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Capital Protection &amp; Quantitative Engine Active.
          </p>
        </div>
      </div>
    </aside>
  );
}
