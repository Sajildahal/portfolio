// ============================================================================
// NEPSE Intelligence AI - Master Application Shell
// Institutional Edition with Live Market Stream, Order Execution Pad & Persistence
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar, TabKey } from "@/components/Sidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { LiveMarketView } from "@/components/views/LiveMarketView";
import { AIMarketCommandCenterView } from "@/components/views/AIMarketCommandCenterView";
import { PortfolioView } from "@/components/views/PortfolioView";
import { WatchlistView } from "@/components/views/WatchlistView";
import { RiskManagementView } from "@/components/views/RiskManagementView";
import { BacktestingView } from "@/components/views/BacktestingView";
import { AIIntelligenceView } from "@/components/views/AIIntelligenceView";
import { AIStockRadarView } from "@/components/views/AIStockRadarView";
import { PortfolioDoctorView } from "@/components/views/PortfolioDoctorView";
import { SmartExitAdvisorView } from "@/components/views/SmartExitAdvisorView";
import { AIResearchAnalystView } from "@/components/views/AIResearchAnalystView";
import { SmartPositionSizingView } from "@/components/views/SmartPositionSizingView";
import { InvestmentCopilotView } from "@/components/views/InvestmentCopilotView";
import { TechnicalAnalysisView } from "@/components/views/TechnicalAnalysisView";
import { TradingToolsView } from "@/components/views/TradingToolsView";
import { ShareCalculatorView } from "@/components/views/ShareCalculatorView";
import { FundamentalAnalysisView } from "@/components/views/FundamentalAnalysisView";
import { MarketSentimentView } from "@/components/views/MarketSentimentView";
import { FinancialNewsView } from "@/components/views/FinancialNewsView";
import { StockScreenerView } from "@/components/views/StockScreenerView";
import { TradingJournalView } from "@/components/views/TradingJournalView";
import { AdminDashboardView } from "@/components/views/AdminDashboardView";
import { SubscriptionView } from "@/components/views/SubscriptionView";
import { AveragingAssistantModal } from "@/components/modals/AveragingAssistantModal";
import { StockDetailModal } from "@/components/modals/StockDetailModal";
import { NepseTermsGuideModal } from "@/components/modals/NepseTermsGuideModal";
import { OrderPadModal } from "@/components/modals/OrderPadModal";
import { SponsorPopupModal } from "@/components/modals/SponsorPopupModal";
import { CommandPaletteModal } from "@/components/modals/CommandPaletteModal";
import { AdBannerWidget } from "@/components/widgets/AdBannerWidget";
import { computePortfolioHoldings } from "@/lib/portfolio/portfolioEngine";
import { marketStream } from "@/lib/market/marketStreamEngine";
import {
  loadStoredTransactions,
  saveStoredTransactions,
  loadStoredAlerts,
  saveStoredAlerts,
  loadStoredWatchlist,
  saveStoredWatchlist,
  loadStoredSettings,
  saveStoredSettings,
  resetAllStorageToDefault,
  exportFullBackupJSON,
  StoredPriceAlert,
} from "@/lib/storage/portfolioStorage";
import { Holding, Transaction, MarketPrice, MarketIndex } from "@/types";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabKey>("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accountingMethod, setAccountingMethod] = useState<"WACC" | "FIFO">("WACC");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<StoredPriceAlert[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(() => marketStream.getPrices());
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>(() => marketStream.getIndices());
  const [flashingSymbols, setFlashingSymbols] = useState<{ [symbol: string]: "up" | "down" }>({});

  // Modals & Navigation state
  const [inspectSymbol, setInspectSymbol] = useState<string | null>(null);
  const [averagingHolding, setAveragingHolding] = useState<Holding | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isOrderPadOpen, setIsOrderPadOpen] = useState(false);
  const [orderPadInitialSymbol, setOrderPadInitialSymbol] = useState("NABIL");
  const [orderPadInitialType, setOrderPadInitialType] = useState<"BUY" | "SELL">("BUY");

  // Client hydration of persisted user data
  useEffect(() => {
    const savedTxs = loadStoredTransactions();
    setTransactions(savedTxs);

    const savedAlerts = loadStoredAlerts();
    setAlerts(savedAlerts);
    marketStream.setAlerts(savedAlerts);

    const settings = loadStoredSettings();
    setTheme(settings.theme);
    setAccountingMethod(settings.accountingMethod);
  }, []);

  // Save transactions when modified
  useEffect(() => {
    if (transactions.length > 0) {
      saveStoredTransactions(transactions);
    }
  }, [transactions]);

  // Subscribe to real-time market stream
  useEffect(() => {
    const unsubscribeMarket = marketStream.subscribe((newPrices, newIndices, changedSymbols) => {
      setMarketPrices(newPrices);
      setMarketIndices(newIndices);

      if (changedSymbols.length > 0) {
        const flashes: { [symbol: string]: "up" | "down" } = {};
        changedSymbols.forEach((c) => {
          flashes[c.symbol] = c.isUp ? "up" : "down";
        });
        setFlashingSymbols(flashes);

        setTimeout(() => {
          setFlashingSymbols({});
        }, 1200);
      }
    });

    const unsubscribeAlerts = marketStream.subscribeAlerts((alert, price) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, triggered: true } : a))
      );
    });

    return () => {
      unsubscribeMarket();
      unsubscribeAlerts();
    };
  }, []);

  // Compute live portfolio state using live market prices
  const { holdings, summary } = useMemo(() => {
    return computePortfolioHoldings(
      transactions,
      marketPrices,
      accountingMethod
    );
  }, [transactions, marketPrices, accountingMethod]);

  const handleAddTransaction = useCallback((newTx: Transaction) => {
    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      saveStoredTransactions(updated);
      return updated;
    });
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveStoredTransactions(updated);
      return updated;
    });
  }, []);

  const handleSelectStock = useCallback((symbol: string) => {
    setInspectSymbol(symbol.toUpperCase());
  }, []);

  const handleOpenAnalysis = useCallback((symbol: string) => {
    setInspectSymbol(symbol.toUpperCase());
    setCurrentTab("technical");
  }, []);

  const handleOpenOrderPad = useCallback((symbol?: string, type?: "BUY" | "SELL") => {
    if (symbol) setOrderPadInitialSymbol(symbol.toUpperCase());
    if (type) setOrderPadInitialType(type);
    setIsOrderPadOpen(true);
  }, []);

  const handleAddToWatchlist = useCallback((symbol: string) => {
    const current = loadStoredWatchlist();
    if (!current.some((i) => i.symbol.toUpperCase() === symbol.toUpperCase())) {
      const stock = marketPrices.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
      const ltp = stock?.ltp || 500;
      const updated = [
        {
          id: `w-${Date.now()}`,
          symbol: symbol.toUpperCase(),
          targetPrice: Math.round(ltp * 1.15),
          stopLossPrice: Math.round(ltp * 0.94),
          notes: "Added from quick action",
          addedAt: new Date().toISOString().split("T")[0],
        },
        ...current,
      ];
      saveStoredWatchlist(updated);
    }
  }, [marketPrices]);

  const handleAccountingMethodChange = useCallback((method: "WACC" | "FIFO") => {
    setAccountingMethod(method);
    saveStoredSettings({ accountingMethod: method });
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      saveStoredSettings({ theme: next });
      return next;
    });
  }, []);

  const handleResetData = useCallback(() => {
    if (confirm("Reset all portfolio and journal data to initial institutional seed?")) {
      resetAllStorageToDefault();
      setTransactions(loadStoredTransactions());
      setAlerts(loadStoredAlerts());
    }
  }, []);

  const handleExportBackup = useCallback(() => {
    const jsonStr = exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NEPSE_Intelligence_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  return (
    <div
      className={`flex h-screen w-screen flex-col overflow-hidden transition-colors ${
        theme === "dark" ? "bg-obsidian text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* Top Real-Time Institutional Navigation Bar */}
      <Navbar
        onSearchSelect={(sym) => {
          setInspectSymbol(sym);
        }}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onNavigateSubscription={() => setCurrentTab("subscription")}
        onNavigateAdmin={() => setCurrentTab("admin")}
        onOpenOrderPad={() => handleOpenOrderPad()}
        onResetData={handleResetData}
        onExportBackup={handleExportBackup}
        activePortfolioName={summary.portfolioName}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        marketPrices={marketPrices}
        marketIndices={marketIndices}
        alerts={alerts}
      />

      {/* Sponsored Partner Ribbon */}
      <AdBannerWidget
        placement="top-announcement"
        onUpgradeClick={() => setCurrentTab("subscription")}
      />

      {/* Main App Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-obsidian">
          <div className="mx-auto max-w-7xl">
            {/* 10 Flagship AI Systems */}
            {currentTab === "command-center" && (
              <AIMarketCommandCenterView
                onSelectStock={handleSelectStock}
                onOpenOrderPad={handleOpenOrderPad}
                onNavigateTab={(t) => setCurrentTab(t as TabKey)}
                marketPrices={marketPrices}
              />
            )}

            {currentTab === "stock-radar" && (
              <AIStockRadarView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "portfolio-doctor" && (
              <PortfolioDoctorView
                holdings={holdings}
                summary={summary}
                onSelectStock={handleSelectStock}
              />
            )}

            {currentTab === "smart-exit" && (
              <SmartExitAdvisorView
                holdings={holdings}
                onSelectStock={handleSelectStock}
              />
            )}

            {currentTab === "ai-research" && (
              <AIResearchAnalystView
                initialSymbol={inspectSymbol || "NABIL"}
                onSelectStock={handleSelectStock}
              />
            )}

            {currentTab === "position-sizing" && (
              <SmartPositionSizingView />
            )}

            {currentTab === "copilot" && (
              <InvestmentCopilotView
                holdings={holdings}
                summary={summary}
                onSelectStock={handleSelectStock}
              />
            )}

            {/* Core & Analytics Systems */}
            {currentTab === "dashboard" && (
              <DashboardView
                summary={summary}
                holdings={holdings}
                onNavigate={(tab) => setCurrentTab(tab as TabKey)}
                onSelectStock={handleSelectStock}
              />
            )}

            {currentTab === "live-market" && (
              <LiveMarketView
                onSelectStock={handleSelectStock}
                onOpenOrderPad={handleOpenOrderPad}
                onAddToWatchlist={handleAddToWatchlist}
                marketPrices={marketPrices}
                flashingSymbols={flashingSymbols}
              />
            )}

            {currentTab === "portfolio" && (
              <PortfolioView
                holdings={holdings}
                summary={summary}
                transactions={transactions}
                accountingMethod={accountingMethod}
                onAccountingMethodChange={handleAccountingMethodChange}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onSelectStock={handleSelectStock}
                onOpenAveragingModal={(h) => setAveragingHolding(h)}
                onOpenOrderPad={handleOpenOrderPad}
              />
            )}

            {currentTab === "watchlist" && (
              <WatchlistView
                onSelectStock={handleSelectStock}
                onOpenOrderPad={handleOpenOrderPad}
                marketPrices={marketPrices}
              />
            )}

            {currentTab === "risk" && (
              <RiskManagementView holdings={holdings} summary={summary} />
            )}

            {currentTab === "backtesting" && <BacktestingView />}

            {currentTab === "ai-intelligence" && (
              <AIIntelligenceView
                holdings={holdings}
                onSelectStock={handleSelectStock}
              />
            )}

            {currentTab === "technical" && (
              <TechnicalAnalysisView
                initialSymbol={inspectSymbol || "NABIL"}
                onSelectStock={handleSelectStock}
                onOpenOrderPad={handleOpenOrderPad}
                marketPrices={marketPrices}
              />
            )}

            {currentTab === "tools" && (
              <TradingToolsView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "calculator" && <ShareCalculatorView />}

            {currentTab === "fundamentals" && (
              <FundamentalAnalysisView initialSymbol={inspectSymbol || "NABIL"} />
            )}

            {currentTab === "sentiment" && (
              <MarketSentimentView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "news" && (
              <FinancialNewsView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "screener" && (
              <StockScreenerView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "journal" && <TradingJournalView />}

            {currentTab === "admin" && <AdminDashboardView />}

            {currentTab === "subscription" && <SubscriptionView />}
          </div>
        </main>
      </div>

      {/* Dynamic Modals */}
      <OrderPadModal
        isOpen={isOrderPadOpen}
        initialSymbol={orderPadInitialSymbol}
        initialType={orderPadInitialType}
        marketPrices={marketPrices}
        holdings={holdings}
        cashBalance={summary.cashBalance}
        onClose={() => setIsOrderPadOpen(false)}
        onExecuteTrade={handleAddTransaction}
      />

      <AveragingAssistantModal
        holding={averagingHolding}
        onClose={() => setAveragingHolding(null)}
      />

      <StockDetailModal
        symbol={inspectSymbol}
        onClose={() => setInspectSymbol(null)}
        onOpenAnalysis={handleOpenAnalysis}
        onOpenOrderPad={handleOpenOrderPad}
        onAddToWatchlist={handleAddToWatchlist}
      />

      <NepseTermsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* First-Visit Verified Sponsor Partner Modal */}
      <SponsorPopupModal />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onSelectStock={handleSelectStock}
        onOpenOrderPad={handleOpenOrderPad}
      />
    </div>
  );
}
