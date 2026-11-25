"use client";

import React, { useState, useMemo } from "react";
import {
  Filter,
  Search,
  ArrowUpDown,
  Sparkles,
  Download,
  RotateCcw,
} from "lucide-react";
import { INITIAL_MARKET_PRICES, NEPSE_COMPANIES } from "@/lib/market/nepseData";

interface StockScreenerViewProps {
  onSelectStock: (symbol: string) => void;
}

export function StockScreenerView({ onSelectStock }: StockScreenerViewProps) {
  const [maxPE, setMaxPE] = useState<number>(35);
  const [minROE, setMinROE] = useState<number>(8);
  const [minTurnoverCr, setMinTurnoverCr] = useState<number>(2);
  const [filterBullishOnly, setFilterBullishOnly] = useState<boolean>(false);

  const screenedStocks = useMemo(() => {
    return INITIAL_MARKET_PRICES.filter((stock) => {
      const comp = NEPSE_COMPANIES.find((c) => c.symbol === stock.symbol);
      const pe = comp?.pe || 999;
      const roe = comp?.roe || 0;
      const turnoverCr = stock.turnover / 10000000;

      const matchesPE = pe > 0 && pe <= maxPE;
      const matchesROE = roe >= minROE;
      const matchesTurnover = turnoverCr >= minTurnoverCr;
      const matchesTrend = !filterBullishOnly || stock.changePercent > 0;

      return matchesPE && matchesROE && matchesTurnover && matchesTrend;
    });
  }, [maxPE, minROE, minTurnoverCr, filterBullishOnly]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
            <Filter className="h-3.5 w-3.5 text-blue-400" />
            <span>INSTITUTIONAL STOCK SCREENER</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">MULTI-FACTOR QUERY</span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-white">Stock Screener & Custom Filter Matrix</h1>
        <p className="mt-1 text-xs text-slate-400">
          Filter NEPSE listed equities using audited P/E multiples, capital efficiency ROE, and trading liquidity.
        </p>
      </div>

      {/* Filter Parameters Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl border border-slate-800 bg-[#131B2E] p-5 text-xs">
        <div>
          <label className="text-slate-400 block mb-1">
            Max P/E Multiple: <strong className="text-blue-400 font-mono">{maxPE}x</strong>
          </label>
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={maxPE}
            onChange={(e) => setMaxPE(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">
            Min ROE Capital Efficiency: <strong className="text-emerald-400 font-mono">{minROE}%</strong>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={minROE}
            onChange={(e) => setMinROE(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">
            Min Turnover: <strong className="text-amber-400 font-mono">{minTurnoverCr} Crore</strong>
          </label>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={minTurnoverCr}
            onChange={(e) => setMinTurnoverCr(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <input
            type="checkbox"
            id="bullish"
            checked={filterBullishOnly}
            onChange={(e) => setFilterBullishOnly(e.target.checked)}
            className="accent-blue-500 rounded"
          />
          <label htmlFor="bullish" className="text-slate-300 font-medium">
            Bullish Session Change Only (&gt; 0%)
          </label>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] overflow-hidden shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-900/60 text-xs">
          <span className="font-bold text-white">
            Matching Equities ({screenedStocks.length} Companies)
          </span>
          <span className="text-slate-400 font-mono text-[11px]">CRITERIA VALIDATED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-900/80 font-sans text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Symbol</th>
                <th className="py-3 px-4 font-semibold font-sans">Company</th>
                <th className="py-3 px-4 font-semibold text-right">LTP</th>
                <th className="py-3 px-4 font-semibold text-right">Change %</th>
                <th className="py-3 px-4 font-semibold text-right">P/E</th>
                <th className="py-3 px-4 font-semibold text-right">ROE</th>
                <th className="py-3 px-4 font-semibold text-right">EPS</th>
                <th className="py-3 px-4 font-semibold text-right">Turnover</th>
                <th className="py-3 px-4 font-semibold font-sans">Sector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {screenedStocks.map((stock) => {
                const comp = NEPSE_COMPANIES.find((c) => c.symbol === stock.symbol);
                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => onSelectStock(stock.symbol)}
                    className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-white font-sans">
                      <span className="rounded bg-blue-500/20 px-2 py-0.5 text-blue-400 border border-blue-500/30">
                        {stock.symbol}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">{stock.name}</td>
                    <td className="py-3 px-4 font-bold text-white text-right">NPR {stock.ltp}</td>
                    <td
                      className={`py-3 px-4 font-bold text-right ${
                        stock.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent}%
                    </td>
                    <td className="py-3 px-4 text-blue-400 font-bold text-right">
                      {comp?.pe.toFixed(1)}x
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold text-right">
                      {comp?.roe}%
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-right">{comp?.eps.toFixed(1)}</td>
                    <td className="py-3 px-4 text-amber-300 text-right">
                      {(stock.turnover / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">{stock.sector}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
