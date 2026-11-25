// ============================================================================
// Institutional Data Persistence & Synchronization Engine
// Safely syncs transactions, journal, watchlist, alerts, and settings in localStorage
// ============================================================================

import { Transaction, JournalEntry, WatchlistItem } from "@/types";
import { getSeedTransactions } from "@/lib/portfolio/portfolioEngine";

export interface StoredPriceAlert {
  id: string;
  symbol: string;
  condition: "ABOVE" | "BELOW";
  targetPrice: number;
  createdAt: string;
  triggered: boolean;
  notes?: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  traderDensity: "compact" | "comfortable";
  accountingMethod: "WACC" | "FIFO";
  theme: "dark" | "light";
  simulationEnabled: boolean;
  simulationSpeed: 1 | 2 | 5;
}

const STORAGE_KEYS = {
  TRANSACTIONS: "nepse_portfolio_transactions_v2",
  JOURNAL: "nepse_trading_journal_v2",
  WATCHLIST: "nepse_watchlist_items_v2",
  ALERTS: "nepse_price_alerts_v2",
  SETTINGS: "nepse_user_settings_v2",
};

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  traderDensity: "compact",
  accountingMethod: "WACC",
  theme: "dark",
  simulationEnabled: true,
  simulationSpeed: 1,
};

export const INITIAL_JOURNAL_SEED: JournalEntry[] = [
  {
    id: "j-1",
    symbol: "NABIL",
    entryDate: "2024-08-15",
    exitDate: "2024-10-10",
    entryPrice: 490,
    exitPrice: 565,
    quantity: 150,
    strategy: "50-SMA Mean Reversion",
    setupType: "RSI Bullish Divergence",
    emotionAtEntry: "Disciplined",
    emotionAtExit: "Satisfied",
    confidenceRating: 4,
    pl: 10840,
    plPercent: 15.3,
    lessonsLearned: "Patience rewarded; waited for candle close confirmation rather than chasing market orders.",
    isClosed: true,
  },
  {
    id: "j-2",
    symbol: "UPPER",
    entryDate: "2024-09-02",
    exitDate: "2024-09-18",
    entryPrice: 245,
    exitPrice: 220,
    quantity: 200,
    strategy: "Breakout Continuation",
    setupType: "High Volume Surge",
    emotionAtEntry: "FOMO",
    emotionAtExit: "Panic Sold",
    confidenceRating: 2,
    pl: -5200,
    plPercent: -10.2,
    lessonsLearned: "Chased 3rd green daily candle near known resistance; failed to set predefined stop-loss order.",
    isClosed: true,
  },
  {
    id: "j-3",
    symbol: "CHCL",
    entryDate: "2024-10-05",
    entryPrice: 420,
    quantity: 100,
    strategy: "Support Zone Accumulation",
    setupType: "Tight Bollinger Squeeze",
    emotionAtEntry: "Disciplined",
    confidenceRating: 5,
    lessonsLearned: "Holding position with trailing stop at break-even.",
    isClosed: false,
  },
];

export const INITIAL_WATCHLIST_SEED: WatchlistItem[] = [
  {
    id: "w-1",
    symbol: "NABIL",
    targetPrice: 580,
    stopLossPrice: 500,
    rsiAlertUpper: 70,
    rsiAlertLower: 35,
    notes: "Core bluechip banking holding",
    addedAt: "2024-10-01",
  },
  {
    id: "w-2",
    symbol: "CHCL",
    targetPrice: 480,
    stopLossPrice: 420,
    rsiAlertUpper: 72,
    notes: "Hydro breakout candidate over NPR 445 resistance",
    addedAt: "2024-10-15",
  },
  {
    id: "w-3",
    symbol: "HRL",
    targetPrice: 700,
    stopLossPrice: 590,
    notes: "Institutional turnover accumulation",
    addedAt: "2024-10-22",
  },
  {
    id: "w-4",
    symbol: "SCB",
    targetPrice: 640,
    stopLossPrice: 550,
    notes: "High ROE dividend payer approaching 20-EMA",
    addedAt: "2024-11-01",
  },
];

export const INITIAL_ALERTS_SEED: StoredPriceAlert[] = [
  {
    id: "alt-1",
    symbol: "NABIL",
    condition: "ABOVE",
    targetPrice: 535,
    createdAt: new Date().toISOString(),
    triggered: false,
    notes: "Breakout above 52-week consolidation",
  },
  {
    id: "alt-2",
    symbol: "CHCL",
    condition: "ABOVE",
    targetPrice: 450,
    createdAt: new Date().toISOString(),
    triggered: false,
    notes: "Hydropower index breakout confirmation",
  },
];

function isClient(): boolean {
  return typeof window !== "undefined";
}

// ------------------------------------------
// Transactions
// ------------------------------------------

export function loadStoredTransactions(): Transaction[] {
  if (!isClient()) return getSeedTransactions();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return getSeedTransactions();
}

export function saveStoredTransactions(txs: Transaction[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch {}
}

// ------------------------------------------
// Journal
// ------------------------------------------

export function loadStoredJournal(): JournalEntry[] {
  if (!isClient()) return INITIAL_JOURNAL_SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_JOURNAL_SEED;
}

export function saveStoredJournal(entries: JournalEntry[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
  } catch {}
}

// ------------------------------------------
// Watchlist
// ------------------------------------------

export function loadStoredWatchlist(): WatchlistItem[] {
  if (!isClient()) return INITIAL_WATCHLIST_SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_WATCHLIST_SEED;
}

export function saveStoredWatchlist(items: WatchlistItem[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(items));
  } catch {}
}

// ------------------------------------------
// Alerts
// ------------------------------------------

export function loadStoredAlerts(): StoredPriceAlert[] {
  if (!isClient()) return INITIAL_ALERTS_SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_ALERTS_SEED;
}

export function saveStoredAlerts(alerts: StoredPriceAlert[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  } catch {}
}

// ------------------------------------------
// Settings
// ------------------------------------------

export function loadStoredSettings(): UserSettings {
  if (!isClient()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: Partial<UserSettings>): void {
  if (!isClient()) return;
  try {
    const current = loadStoredSettings();
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
  } catch {}
}

// ------------------------------------------
// Full Reset & Backup
// ------------------------------------------

export function resetAllStorageToDefault(): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(getSeedTransactions()));
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(INITIAL_JOURNAL_SEED));
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(INITIAL_WATCHLIST_SEED));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS_SEED));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  } catch {}
}

export function exportFullBackupJSON(): string {
  const data = {
    version: "2.0.0",
    exportedAt: new Date().toISOString(),
    transactions: loadStoredTransactions(),
    journal: loadStoredJournal(),
    watchlist: loadStoredWatchlist(),
    alerts: loadStoredAlerts(),
    settings: loadStoredSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importFullBackupJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.transactions && Array.isArray(parsed.transactions)) {
      saveStoredTransactions(parsed.transactions);
    }
    if (parsed.journal && Array.isArray(parsed.journal)) {
      saveStoredJournal(parsed.journal);
    }
    if (parsed.watchlist && Array.isArray(parsed.watchlist)) {
      saveStoredWatchlist(parsed.watchlist);
    }
    if (parsed.alerts && Array.isArray(parsed.alerts)) {
      saveStoredAlerts(parsed.alerts);
    }
    if (parsed.settings && typeof parsed.settings === "object") {
      saveStoredSettings(parsed.settings);
    }
    return true;
  } catch {
    return false;
  }
}
