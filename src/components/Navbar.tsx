// ============================================================================
// Institutional NEPSE Navigation Bar & Live Ticker Ribbon
// Real-time Nepal Time clock, ticker tape, audio controls, order pad launcher
// ============================================================================

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  Activity,
  TrendingUp,
  Clock,
  Layers,
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Download,
  Upload,
  Command,
} from "lucide-react";
import { MarketPrice, MarketIndex } from "@/types";
import { marketStream, MarketSessionStatus } from "@/lib/market/marketStreamEngine";
import { soundEngine } from "@/lib/audio/soundEngine";
import { loadUserTier } from "@/lib/admin/adminStore";
import { StoredPriceAlert } from "@/lib/storage/portfolioStorage";

interface NavbarProps {
  onSearchSelect?: (symbol: string) => void;
  onOpenGuide?: () => void;
  onOpenCommandPalette?: () => void;
  onNavigateSubscription?: () => void;
  onNavigateAdmin?: () => void;
  onOpenOrderPad?: () => void;
  onResetData?: () => void;
  onExportBackup?: () => void;
  activePortfolioName: string;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
  marketPrices: MarketPrice[];
  marketIndices: MarketIndex[];
  alerts?: StoredPriceAlert[];
}

export function Navbar({
  onSearchSelect,
  onOpenGuide,
  onOpenCommandPalette,
  onNavigateSubscription,
  onNavigateAdmin,
  onOpenOrderPad,
  onResetData,
  onExportBackup,
  activePortfolioName,
  theme = "dark",
  onToggleTheme,
  marketPrices,
  marketIndices,
  alerts = [],
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userTier, setUserTier] = useState<"free" | "pro" | "premium">("free");
  const [isMuted, setIsMuted] = useState(false);
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<MarketSessionStatus>(() =>
    marketStream.getSessionStatus()
  );

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const nepseIndex = marketIndices[0] || { current: 2750.4, change: 18.5, changePercent: 0.68 };
  const sensitiveIndex = marketIndices[1] || { current: 472.1, change: 3.2, changePercent: 0.68 };

  // Real-time session clock tick every second
  useEffect(() => {
    setMounted(true);
    setUserTier(loadUserTier());
    setIsMuted(soundEngine.getMuted());
    setIsSimRunning(marketStream.getSimulationRunning());
    setSessionStatus(marketStream.getSessionStatus());

    const clockTimer = setInterval(() => {
      setSessionStatus(marketStream.getSessionStatus());
    }, 1000);

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (onOpenCommandPalette) onOpenCommandPalette();
        else setIsSearchFocused(true);
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setIsSearchFocused(true);
      } else if ((e.key === "b" || e.key === "B") && document.activeElement?.tagName !== "INPUT") {
        if (onOpenOrderPad) {
          e.preventDefault();
          onOpenOrderPad();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(clockTimer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenOrderPad]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const toggleSimulation = () => {
    const next = !isSimRunning;
    setIsSimRunning(next);
    marketStream.setSimulationRunning(next);
  };

  // Filter stocks for quick search dropdown
  const searchResults = searchQuery.trim()
    ? marketPrices
        .filter(
          (s) =>
            s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 7)
    : [];

  const handleSelectStock = (symbol: string) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    if (onSearchSelect) {
      onSearchSelect(symbol.toUpperCase());
    }
  };

  const triggeredAlerts = alerts.filter((a) => a.triggered);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-bronze bg-charcoal/95 backdrop-blur-md">
      {/* Top Real-time Ticker Ribbon */}
      <div className="flex h-7 items-center justify-between overflow-x-auto border-b border-bronze/60 px-4 text-xs font-mono text-slate-300 bg-obsidian">
        <div className="flex items-center space-x-5 min-w-max">
          {/* Live Session Status */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                sessionStatus.status === "REGULAR"
                  ? "bg-emerald-500 animate-ping"
                  : isSimRunning
                  ? "bg-amber-400 animate-pulse"
                  : "bg-slate-500"
              }`}
            />
            <span className="text-slate-400 font-sans text-[11px]">NEPSE:</span>
            <span
              className={`font-bold text-[11px] ${
                sessionStatus.status === "REGULAR" ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {sessionStatus.label}
            </span>
          </div>

          {/* Indices */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">INDEX:</span>
            <span className="font-bold text-white">{nepseIndex.current.toLocaleString()}</span>
            <span
              className={`font-semibold ${
                nepseIndex.change >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {nepseIndex.change >= 0 ? "+" : ""}
              {nepseIndex.change} ({nepseIndex.changePercent}%)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">SENSITIVE:</span>
            <span className="font-bold text-white">{sensitiveIndex.current.toLocaleString()}</span>
            <span
              className={`font-semibold ${
                sensitiveIndex.change >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {sensitiveIndex.change >= 0 ? "+" : ""}
              {sensitiveIndex.change} ({sensitiveIndex.changePercent}%)
            </span>
          </div>

          {/* Quick Active Tickers Ribbon */}
          <div className="hidden lg:flex items-center space-x-4 pl-3 border-l border-bronze/60">
            {marketPrices.slice(0, 6).map((s) => (
              <button
                key={s.symbol}
                onClick={() => onSearchSelect && onSearchSelect(s.symbol)}
                className="flex items-center space-x-1.5 hover:text-gold transition-colors"
              >
                <span className="text-slate-300 font-bold">{s.symbol}:</span>
                <span className="text-white">NPR {s.ltp}</span>
                <span
                  className={`text-[10px] ${
                    s.change >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {s.change >= 0 ? "+" : ""}
                  {s.changePercent}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Session Clock & Toggles */}
        <div className="flex items-center space-x-3 text-slate-400 font-sans text-xs">
          {/* Simulation Toggle */}
          <button
            onClick={toggleSimulation}
            title={isSimRunning ? "Pause Live Ticks" : "Resume Live Ticks"}
            className="flex items-center space-x-1 rounded bg-obsidian px-2 py-0.5 text-[10px] text-slate-300 hover:text-gold border border-bronze/50"
          >
            {isSimRunning ? (
              <>
                <Pause className="h-3 w-3 text-emerald-400" />
                <span className="font-mono text-emerald-400">STREAM ON</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 text-amber-400" />
                <span className="font-mono text-amber-400">PAUSED</span>
              </>
            )}
          </button>

          {/* Audio Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? "Unmute Trader Sounds" : "Mute Sounds"}
            className="rounded p-1 text-slate-400 hover:text-gold transition-colors"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-gold" />}
          </button>

          {/* Real Nepal Time Clock */}
          <div className="flex items-center space-x-1.5 text-slate-300 font-mono text-[11px]" suppressHydrationWarning>
            <Clock className="h-3 w-3 text-gold" />
            <span suppressHydrationWarning>{mounted ? sessionStatus.nepalTime : "--:--:-- NPT"}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient-btn shadow-gold">
              <TrendingUp className="h-6 w-6 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-white">NEPSE</span>
                <span className="rounded-md bg-gold/20 px-1.5 py-0.5 text-[11px] font-bold text-gold border border-gold/30">
                  INTELLIGENCE AI
                </span>
                <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                  INSTITUTIONAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Capital Protection &amp; Quantitative Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar with Live Dropdown */}
        <div ref={searchContainerRef} className="relative w-72 sm:w-80 hidden md:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            placeholder="Search symbol (e.g. NABIL, CIT) · Press /"
            className="w-full rounded-xl border border-bronze bg-obsidian py-2 pl-9 pr-12 text-xs text-white placeholder-slate-500 focus:border-gold focus:outline-none shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
              /
            </kbd>
          </div>

          {/* Dropdown Results */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-bronze bg-charcoal p-2 shadow-2xl backdrop-blur-xl space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Matching Equities
              </div>
              {searchResults.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => handleSelectStock(stock.symbol)}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-obsidian cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-gold/20 px-2 py-0.5 text-xs font-bold text-gold border border-gold/30">
                      {stock.symbol}
                    </span>
                    <span className="text-xs text-slate-200 truncate max-w-[150px]">{stock.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-white">NPR {stock.ltp}</span>
                    <span
                      className={`text-[10px] ml-1.5 ${
                        stock.change >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {stock.change >= 0 ? "+" : ""}
                      {stock.changePercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Action Icons & Trader Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Command Palette Trigger */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              title="Command Palette (Ctrl+K)"
              className="hidden sm:flex items-center space-x-1.5 rounded-xl border border-bronze bg-obsidian px-2.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:border-gold/50 transition-all"
            >
              <Command className="h-3.5 w-3.5 text-gold" />
              <span className="font-mono text-[10px] text-slate-400">Ctrl+K</span>
            </button>
          )}

          {/* Quick Trade Button */}
          {onOpenOrderPad && (
            <button
              onClick={onOpenOrderPad}
              className="gold-gradient-btn flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-black shadow-gold"
              title="Open Quick Order Pad (Press B)"
            >
              <Zap className="h-4 w-4" />
              <span>NEW TRADE</span>
              <kbd className="hidden sm:inline-block ml-1 rounded bg-black/20 px-1 text-[9px] font-mono">
                B
              </kbd>
            </button>
          )}

          {/* Backup & Reset Options */}
          {onResetData && (
            <button
              onClick={onResetData}
              title="Reset Portfolio to Default Institutional Seed"
              className="rounded-lg p-2 text-slate-400 hover:text-rose-400 hover:bg-obsidian transition-colors hidden sm:block"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          {onExportBackup && (
            <button
              onClick={onExportBackup}
              title="Export Full JSON Backup"
              className="rounded-lg p-2 text-slate-400 hover:text-champagne hover:bg-obsidian transition-colors hidden sm:block"
            >
              <Download className="h-4 w-4" />
            </button>
          )}

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-slate-400 hover:bg-obsidian hover:text-white transition-colors"
            >
              <Bell className="h-5 w-5" />
              {triggeredAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-bronze bg-charcoal p-4 shadow-2xl z-50 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-bronze/60 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">Live Intelligence Alerts</span>
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">
                      {triggeredAlerts.length} Active
                    </span>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {triggeredAlerts.length > 0 ? (
                    triggeredAlerts.map((alt) => (
                      <div
                        key={alt.id}
                        onClick={() => onSearchSelect && onSearchSelect(alt.symbol)}
                        className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 cursor-pointer hover:bg-amber-500/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{alt.symbol} Price Alert Triggered!</span>
                          <span className="text-[10px] text-amber-400 font-mono">HIT</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Condition met: Price {alt.condition.toLowerCase()} NPR {alt.targetPrice}. {alt.notes || ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-slate-400 text-xs">
                      No triggered alerts. Market conditions normal.
                    </div>
                  )}

                  {/* Sample institutional feeds */}
                  <div className="rounded-xl border border-bronze/60 bg-obsidian p-2.5 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold text-emerald-400">NABIL Golden Cross Confirmed</span>
                      <span>5m ago</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      20-day SMA crossed above 50-day SMA with 1.8x volume surge.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="rounded-lg p-2 text-slate-400 hover:bg-obsidian hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-gold" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </button>
          )}

          {/* NEPSE Terms Guide Button */}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="hidden sm:flex items-center space-x-1 rounded-xl border border-bronze bg-obsidian px-3 py-1.5 text-xs font-semibold text-champagne hover:border-gold transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>Guide</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
