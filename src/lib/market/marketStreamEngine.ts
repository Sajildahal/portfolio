// ============================================================================
// NEPSE Real-Time Market Stream & Simulation Engine
// Realistic high-frequency tick simulation, Nepal Time clock, order book depth
// ============================================================================

import { MarketPrice, MarketIndex } from "@/types";
import { INITIAL_MARKET_PRICES, INITIAL_INDICES } from "@/lib/market/nepseData";
import { soundEngine } from "@/lib/audio/soundEngine";
import { StoredPriceAlert } from "@/lib/storage/portfolioStorage";

export interface MarketDepthLevel {
  orders: number;
  quantity: number;
  price: number;
}

export interface MarketDepth {
  symbol: string;
  bids: MarketDepthLevel[];
  asks: MarketDepthLevel[];
  totalBidQty: number;
  totalAskQty: number;
}

export interface MarketSessionStatus {
  status: "REGULAR" | "PRE_OPEN" | "CLOSED";
  label: string;
  nepalTime: string;
  timeRemaining: string;
  isSimulatedLive: boolean;
}

type MarketListener = (prices: MarketPrice[], indices: MarketIndex[], changedSymbols: { symbol: string; isUp: boolean }[]) => void;
type AlertTriggerListener = (alert: StoredPriceAlert, currentPrice: number) => void;

class MarketStreamEngine {
  private prices: MarketPrice[] = [...INITIAL_MARKET_PRICES];
  private indices: MarketIndex[] = [...INITIAL_INDICES];
  private listeners: Set<MarketListener> = new Set();
  private alertListeners: Set<AlertTriggerListener> = new Set();
  private alerts: StoredPriceAlert[] = [];
  private timer: NodeJS.Timeout | null = null;
  private isSimulationRunning: boolean = true;
  private simulationSpeedMs: number = 2500;

  constructor() {
    this.startSimulation();
  }

  public getPrices(): MarketPrice[] {
    return this.prices;
  }

  public getStock(symbol: string): MarketPrice | undefined {
    return this.prices.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
  }

  public getIndices(): MarketIndex[] {
    return this.indices;
  }

  public setAlerts(alerts: StoredPriceAlert[]) {
    this.alerts = alerts;
  }

  public subscribe(listener: MarketListener): () => void {
    this.listeners.add(listener);
    // Initial call
    listener(this.prices, this.indices, []);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeAlerts(listener: AlertTriggerListener): () => void {
    this.alertListeners.add(listener);
    return () => {
      this.alertListeners.delete(listener);
    };
  }

  public setSimulationRunning(running: boolean) {
    this.isSimulationRunning = running;
    if (!running && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    } else if (running && !this.timer) {
      this.startSimulation();
    }
  }

  public getSimulationRunning(): boolean {
    return this.isSimulationRunning;
  }

  public setSimulationSpeed(speed: 1 | 2 | 5) {
    this.simulationSpeedMs = speed === 5 ? 800 : speed === 2 ? 1500 : 2500;
    if (this.isSimulationRunning) {
      if (this.timer) clearInterval(this.timer);
      this.startSimulation();
    }
  }

  /**
   * Calculates realistic 5-level Order Book / Depth around current LTP
   */
  public getMarketDepth(symbol: string): MarketDepth {
    const stock = this.getStock(symbol) || this.prices[0];
    const ltp = stock.ltp;
    const baseQty = Math.max(100, Math.floor(stock.volume / 200));

    // Bids (Buy orders below LTP)
    const bids: MarketDepthLevel[] = [];
    let totalBid = 0;
    for (let i = 1; i <= 5; i++) {
      const price = Math.round((ltp - i * (ltp > 500 ? 1.0 : 0.5)) * 10) / 10;
      const qty = Math.floor(baseQty * (0.8 + Math.sin(i * 1.5) * 0.4 + (5 - i) * 0.2));
      const orders = Math.max(1, Math.floor(qty / 150));
      bids.push({ orders, quantity: qty, price });
      totalBid += qty;
    }

    // Asks (Sell orders above LTP)
    const asks: MarketDepthLevel[] = [];
    let totalAsk = 0;
    for (let i = 1; i <= 5; i++) {
      const price = Math.round((ltp + i * (ltp > 500 ? 1.0 : 0.5)) * 10) / 10;
      const qty = Math.floor(baseQty * (0.7 + Math.cos(i * 1.2) * 0.4 + (5 - i) * 0.25));
      const orders = Math.max(1, Math.floor(qty / 160));
      asks.push({ orders, quantity: qty, price });
      totalAsk += qty;
    }

    return {
      symbol: stock.symbol,
      bids,
      asks,
      totalBidQty: totalBid,
      totalAskQty: totalAsk,
    };
  }

  /**
   * Computes current Nepal Time (UTC + 5:45) and official market session
   */
  public getSessionStatus(): MarketSessionStatus {
    const now = new Date();
    // Nepal is UTC+5:45
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const nepTime = new Date(utc + 3600000 * 5.75);

    const day = nepTime.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
    const hours = nepTime.getHours();
    const minutes = nepTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const timeStr = nepTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // NEPSE trading: Sunday (0) to Thursday (4)
    const isTradingDay = day >= 0 && day <= 4;
    const isPreOpen = isTradingDay && totalMinutes >= 10 * 60 + 30 && totalMinutes < 10 * 60 + 45;
    const isRegular = isTradingDay && totalMinutes >= 11 * 60 && totalMinutes < 15 * 60;

    if (isRegular) {
      const closeMinutes = 15 * 60 - totalMinutes;
      const h = Math.floor(closeMinutes / 60);
      const m = closeMinutes % 60;
      return {
        status: "REGULAR",
        label: "REGULAR SESSION (LIVE)",
        nepalTime: `${timeStr} NPT`,
        timeRemaining: `Closes in ${h}h ${m}m`,
        isSimulatedLive: this.isSimulationRunning,
      };
    } else if (isPreOpen) {
      return {
        status: "PRE_OPEN",
        label: "PRE-OPEN SESSION",
        nepalTime: `${timeStr} NPT`,
        timeRemaining: "Opens in 15m",
        isSimulatedLive: this.isSimulationRunning,
      };
    } else {
      return {
        status: "CLOSED",
        label: this.isSimulationRunning ? "SIMULATED LIVE SESSION" : "MARKET CLOSED",
        nepalTime: `${timeStr} NPT`,
        timeRemaining: "Next session: Sun 11:00 AM",
        isSimulatedLive: this.isSimulationRunning,
      };
    }
  }

  private startSimulation() {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      if (!this.isSimulationRunning) return;
      this.executeTick();
    }, this.simulationSpeedMs);
  }

  private executeTick() {
    // Pick 1 to 3 random stocks to fluctuate realistically
    const numStocks = Math.floor(Math.random() * 3) + 1;
    const changedSymbols: { symbol: string; isUp: boolean }[] = [];

    for (let i = 0; i < numStocks; i++) {
      const idx = Math.floor(Math.random() * this.prices.length);
      const stock = this.prices[idx];

      // Subtle fluctuation: -0.4% to +0.5% with slight upward bias
      const changePercent = (Math.random() - 0.47) * 0.8;
      const priceDelta = Math.round((stock.ltp * (changePercent / 100)) * 10) / 10;
      if (priceDelta === 0) continue;

      const newLtp = Math.max(10, Math.round((stock.ltp + priceDelta) * 10) / 10);
      const isUp = newLtp > stock.ltp;

      const newChange = Math.round((newLtp - stock.previousClose) * 10) / 10;
      const newChangePercent =
        Math.round(((newChange / stock.previousClose) * 100) * 100) / 100;
      const newHigh = Math.max(stock.high, newLtp);
      const newLow = Math.min(stock.low, newLtp);
      const tradedQty = Math.floor(Math.random() * 400) + 50;
      const newVolume = stock.volume + tradedQty;
      const newTurnover = stock.turnover + tradedQty * newLtp;
      const newTransactions = stock.transactions + 1;

      this.prices[idx] = {
        ...stock,
        ltp: newLtp,
        change: newChange,
        changePercent: newChangePercent,
        high: newHigh,
        low: newLow,
        volume: newVolume,
        turnover: newTurnover,
        transactions: newTransactions,
        timestamp: new Date().toISOString(),
      };

      changedSymbols.push({ symbol: stock.symbol, isUp });

      // Play subtle tick audio
      soundEngine.playTick(isUp);

      // Check price alerts
      this.checkAlerts(stock.symbol, newLtp);
    }

    // Slightly adjust NEPSE index to mirror market flow
    if (changedSymbols.length > 0) {
      const upCount = changedSymbols.filter((c) => c.isUp).length;
      const indexDrift = (upCount - (changedSymbols.length - upCount)) * 0.45;
      const nepse = this.indices[0];
      const newNepse = Math.round((nepse.current + indexDrift) * 100) / 100;
      const nepseChange = Math.round((newNepse - 2750.0) * 100) / 100;
      const nepsePct = Math.round(((nepseChange / 2750.0) * 100) * 100) / 100;

      this.indices[0] = {
        ...nepse,
        current: newNepse,
        change: nepseChange,
        changePercent: nepsePct,
      };

      // Notify all listeners
      this.listeners.forEach((listener) => {
        listener([...this.prices], [...this.indices], changedSymbols);
      });
    }
  }

  private checkAlerts(symbol: string, currentPrice: number) {
    if (!this.alerts || this.alerts.length === 0) return;

    this.alerts.forEach((alert) => {
      if (alert.symbol.toUpperCase() === symbol.toUpperCase() && !alert.triggered) {
        let isTriggered = false;
        if (alert.condition === "ABOVE" && currentPrice >= alert.targetPrice) {
          isTriggered = true;
        } else if (alert.condition === "BELOW" && currentPrice <= alert.targetPrice) {
          isTriggered = true;
        }

        if (isTriggered) {
          alert.triggered = true;
          soundEngine.playAlert();
          this.alertListeners.forEach((listener) => listener(alert, currentPrice));
        }
      }
    });
  }
}

export const marketStream = new MarketStreamEngine();
