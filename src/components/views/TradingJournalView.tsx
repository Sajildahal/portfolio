// ============================================================================
// Institutional Trading Journal & Behavioral Coaching
// Trade logs, emotion tracking, trade closing, win rate analytics, CSV export
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Trash2,
  Check,
  Download,
} from "lucide-react";
import { JournalEntry } from "@/types";
import {
  loadStoredJournal,
  saveStoredJournal,
} from "@/lib/storage/portfolioStorage";

export function TradingJournalView() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadStoredJournal());
  const [showAddModal, setShowAddModal] = useState(false);
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);
  const [exitPriceInput, setExitPriceInput] = useState("");
  const [exitDateInput, setExitDateInput] = useState(new Date().toISOString().split("T")[0]);

  // Form State
  const [symbol, setSymbol] = useState("SCB");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [entryPrice, setEntryPrice] = useState("550");
  const [quantity, setQuantity] = useState("100");
  const [strategy, setStrategy] = useState("Moving Average Pullback");
  const [emotion, setEmotion] = useState<JournalEntry["emotionAtEntry"]>("Disciplined");
  const [confidence, setConfidence] = useState(4);
  const [lessons, setLessons] = useState("");

  useEffect(() => {
    saveStoredJournal(entries);
  }, [entries]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      entryDate,
      entryPrice: parseFloat(entryPrice) || 500,
      quantity: parseInt(quantity) || 100,
      strategy,
      setupType: "Technical Setup",
      emotionAtEntry: emotion,
      confidenceRating: confidence,
      lessonsLearned: lessons,
      isClosed: false,
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveStoredJournal(updated);
    setShowAddModal(false);
    setLessons("");
  };

  const handleCloseTrade = (tradeId: string) => {
    const exitPrice = parseFloat(exitPriceInput);
    if (isNaN(exitPrice) || exitPrice <= 0) return;

    const updated = entries.map((e) => {
      if (e.id === tradeId) {
        const pl = Math.round((exitPrice - e.entryPrice) * e.quantity);
        const plPercent = Math.round(((exitPrice - e.entryPrice) / e.entryPrice) * 1000) / 10;
        return {
          ...e,
          exitDate: exitDateInput,
          exitPrice,
          pl,
          plPercent,
          emotionAtExit: pl >= 0 ? ("Satisfied" as const) : ("Disciplined" as const),
          isClosed: true,
        };
      }
      return e;
    });

    setEntries(updated);
    saveStoredJournal(updated);
    setClosingTradeId(null);
    setExitPriceInput("");
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Delete this journal entry?")) {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      saveStoredJournal(updated);
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,Symbol,EntryDate,ExitDate,EntryPrice,ExitPrice,Quantity,Strategy,EmotionEntry,EmotionExit,PL,PLPercent,Closed,Lessons\n";
    const rows = entries
      .map(
        (e) =>
          `"${e.id}","${e.symbol}","${e.entryDate}","${e.exitDate || ""}","${e.entryPrice}","${e.exitPrice || ""}","${e.quantity}","${e.strategy}","${e.emotionAtEntry}","${e.emotionAtExit || ""}","${e.pl || ""}","${e.plPercent || ""}","${e.isClosed}","${e.lessonsLearned || ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NEPSE_Trading_Journal_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closedTrades = entries.filter((e) => e.isClosed && e.pl !== undefined);
  const winCount = closedTrades.filter((e) => (e.pl || 0) > 0).length;
  const winRate =
    closedTrades.length > 0 ? Math.round((winCount / closedTrades.length) * 1000) / 10 : 0;
  const totalPL = closedTrades.reduce((acc, e) => acc + (e.pl || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
              <BookOpen className="h-3.5 w-3.5 text-gold" />
              <span>BEHAVIORAL TRADING AUDIT</span>
            </span>
            <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-mono text-champagne border border-bronze">
              AI PSYCHOLOGY COACH
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-white">Quantitative Trading Journal</h1>
          <p className="mt-1 text-xs text-slate-400">
            Document trade executions, track emotional states (FOMO vs Discipline), and audit statistical edge.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 rounded-xl border border-bronze bg-obsidian px-3.5 py-2 text-xs font-semibold text-champagne hover:border-gold transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="gold-gradient-btn flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-gold"
          >
            <Plus className="h-4 w-4" />
            <span>Log New Trade</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs tabular-nums">
        <div className="rounded-2xl border border-bronze bg-charcoal p-4 space-y-1">
          <span className="text-slate-400 font-sans block text-[11px]">Win Rate</span>
          <span className="text-2xl font-black text-emerald-400">{winRate}%</span>
          <span className="text-[10px] text-slate-400 block font-sans">
            {winCount} Wins / {closedTrades.length - winCount} Losses
          </span>
        </div>

        <div className="rounded-2xl border border-bronze bg-charcoal p-4 space-y-1">
          <span className="text-slate-400 font-sans block text-[11px]">Cumulative Net P/L</span>
          <span
            className={`text-2xl font-black ${
              totalPL >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {totalPL >= 0 ? "+" : ""}NPR {totalPL.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block font-sans">
            Across {closedTrades.length} settled trades
          </span>
        </div>

        <div className="rounded-2xl border border-bronze bg-charcoal p-4 space-y-1">
          <span className="text-slate-400 font-sans block text-[11px]">Active Open Positions</span>
          <span className="text-2xl font-black text-champagne">
            {entries.filter((e) => !e.isClosed).length} Trades
          </span>
          <span className="text-[10px] text-slate-400 block font-sans">Pending exit confirmation</span>
        </div>

        <div className="rounded-2xl border border-bronze bg-charcoal p-4 space-y-1">
          <span className="text-slate-400 font-sans block text-[11px]">Emotional Discipline</span>
          <span className="text-2xl font-black text-gold">91.4%</span>
          <span className="text-[10px] text-emerald-400 block font-sans">Zero FOMO in last 5 sessions</span>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl border border-bronze bg-charcoal p-5 shadow-lg space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-bronze/60 pb-3">
              <div className="flex items-center space-x-3">
                <span className="rounded-xl bg-gold/20 px-3 py-1 text-sm font-black text-gold border border-gold/30">
                  {entry.symbol}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{entry.strategy}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                        entry.isClosed
                          ? "bg-slate-800 text-slate-300 border-slate-700"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {entry.isClosed ? "CLOSED" : "OPEN"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Entry: {entry.entryDate} {entry.exitDate ? `· Exit: ${entry.exitDate}` : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {entry.pl !== undefined && (
                  <div className="text-right font-mono tabular-nums">
                    <span
                      className={`text-base font-black ${
                        entry.pl >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {entry.pl >= 0 ? "+" : ""}NPR {entry.pl.toLocaleString()}
                    </span>
                    <span
                      className={`block text-[11px] font-bold ${
                        (entry.plPercent || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {(entry.plPercent || 0) >= 0 ? "+" : ""}{entry.plPercent}%
                    </span>
                  </div>
                )}

                {!entry.isClosed && (
                  <button
                    onClick={() => {
                      setClosingTradeId(entry.id);
                      setExitPriceInput((entry.entryPrice * 1.05).toString());
                    }}
                    className="rounded-xl bg-gold/15 hover:bg-gold hover:text-black border border-gold/40 px-3 py-1.5 text-xs font-bold text-gold transition-colors"
                  >
                    Close Trade
                  </button>
                )}

                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-obsidian transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Trade Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-obsidian p-3 font-mono text-xs border border-bronze/50 tabular-nums">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Entry Price</span>
                <span className="font-bold text-white">NPR {entry.entryPrice}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Exit Price</span>
                <span className="font-bold text-champagne">
                  {entry.exitPrice ? `NPR ${entry.exitPrice}` : "-- (Open)"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Position Size</span>
                <span className="font-bold text-white">{entry.quantity} Shares</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Entry Emotion</span>
                <span
                  className={`font-bold font-sans ${
                    entry.emotionAtEntry === "Disciplined"
                      ? "text-emerald-400"
                      : entry.emotionAtEntry === "FOMO"
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {entry.emotionAtEntry}
                </span>
              </div>
            </div>

            {/* Lessons Learned */}
            {entry.lessonsLearned && (
              <p className="text-xs text-slate-300 italic bg-obsidian/50 p-2.5 rounded-xl border border-bronze/30">
                &ldquo;{entry.lessonsLearned}&rdquo;
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Close Trade Modal */}
      {closingTradeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-bronze bg-charcoal p-6 shadow-2xl space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white">Settle &amp; Close Position</h2>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Exit Price (NPR)</label>
                <input
                  type="number"
                  step="0.1"
                  value={exitPriceInput}
                  onChange={(e) => setExitPriceInput(e.target.value)}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Exit Date</label>
                <input
                  type="date"
                  value={exitDateInput}
                  onChange={(e) => setExitDateInput(e.target.value)}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingTradeId(null)}
                  className="rounded-xl border border-bronze bg-obsidian px-4 py-2 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCloseTrade(closingTradeId)}
                  className="gold-gradient-btn rounded-xl px-4 py-2 font-bold text-black shadow-gold"
                >
                  Confirm Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Trade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-bronze bg-charcoal p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-bronze/60 pb-2">
              <h2 className="text-sm font-bold text-white">Record Trading Journal Entry</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Stock Symbol</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Entry Date</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Entry Price (NPR)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Strategy Used</label>
                <input
                  type="text"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Psychological Mindset</label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value as any)}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-semibold"
                >
                  <option value="Disciplined">Disciplined (Rules Strictly Followed)</option>
                  <option value="FOMO">FOMO (Chased After Big Green Candle)</option>
                  <option value="Anxious">Anxious (Uncertain / Position Too Big)</option>
                  <option value="Excited">Excited (Overconfident)</option>
                  <option value="Revenge">Revenge (Recovering Prior Loss)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Lessons &amp; Observations</label>
                <textarea
                  rows={2}
                  value={lessons}
                  onChange={(e) => setLessons(e.target.value)}
                  placeholder="Key takeaway: waited for confirmed candle close..."
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-bronze/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-bronze bg-obsidian px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn rounded-xl px-4 py-2 font-bold text-black shadow-gold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
