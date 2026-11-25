"use client";

import React, { useState } from "react";
import { Sliders, X, CheckCircle2, TrendingDown } from "lucide-react";
import { Holding } from "@/types";
import { simulateAveraging } from "@/lib/portfolio/portfolioEngine";

interface AveragingAssistantModalProps {
  holding: Holding | null;
  onClose: () => void;
}

export function AveragingAssistantModal({
  holding,
  onClose,
}: AveragingAssistantModalProps) {
  if (!holding) return null;

  const [addUnits, setAddUnits] = useState(50);
  const [purchasePrice, setPurchasePrice] = useState(holding.currentLtp);

  const result = simulateAveraging(holding, addUnits, purchasePrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#131B2E] p-6 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
              {holding.symbol}
            </span>
            <h2 className="text-base font-bold text-white">Intelligent Averaging Assistant</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current State */}
        <div className="rounded-xl bg-slate-900/80 p-3.5 grid grid-cols-3 gap-2 text-center font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Current Units</span>
            <span className="font-bold text-white text-sm">{holding.quantity}</span>
          </div>
          <div className="border-x border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Current WACC</span>
            <span className="font-bold text-amber-400 text-sm">NPR {holding.wacc.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Current LTP</span>
            <span className="font-bold text-emerald-400 text-sm">NPR {holding.currentLtp}</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 pt-1">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Additional Units to Purchase:</span>
              <span className="font-mono font-bold text-blue-400">{addUnits} Units</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={addUnits}
              onChange={(e) => setAddUnits(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Prospective Purchase Price (NPR):</span>
              <span className="font-mono font-bold text-emerald-400">NPR {purchasePrice}</span>
            </div>
            <input
              type="range"
              min={Math.round(holding.currentLtp * 0.7)}
              max={Math.round(holding.currentLtp * 1.3)}
              step="1"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        {/* Simulation Output */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2 font-mono">
          <div className="flex justify-between text-slate-300">
            <span className="font-sans">New Total Units:</span>
            <span className="font-bold text-white">{result.newTotalUnits}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="font-sans">Revised Holding WACC:</span>
            <span className="font-bold text-blue-400">NPR {result.newWacc.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="font-sans">WACC Reduction Per Share:</span>
            <span className="font-bold text-emerald-400">
              -NPR {result.costReductionPerShare.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="font-sans">New Break-Even Price:</span>
            <span className="font-bold text-amber-400">NPR {result.newBreakEven.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-slate-200">
            <span className="font-sans">Additional Capital Required:</span>
            <span className="text-emerald-400">
              NPR {result.additionalCapitalRequired.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
