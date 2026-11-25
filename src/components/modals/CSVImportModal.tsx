"use client";

import React, { useState } from "react";
import { Upload, X, FileSpreadsheet, CheckCircle2, Download } from "lucide-react";
import { Transaction, TransactionType } from "@/types";
import { calculateBuy, DEFAULT_FEE_SCHEDULE } from "@/lib/financial/nepseFeeEngine";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Transaction[]) => void;
}

export function CSVImportModal({ isOpen, onClose, onImport }: CSVImportModalProps) {
  if (!isOpen) return null;

  const [csvText, setCsvText] = useState("");
  const [parsedCount, setParsedCount] = useState(0);

  const sampleCSV = `Symbol,Type,Date,Quantity,Price,Notes
NABIL,BUY,2024-05-10,100,510,Core buy
CHCL,BUY,2024-06-15,150,430,Hydro play
HRL,IPO,2024-01-10,100,206,IPO lot
SCB,BUY,2024-07-20,80,560,Standard Chartered dividend`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "NEPSE_Portfolio_Template.csv";
    link.click();
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split("\n");
    const newTxList: Transaction[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim());
      if (parts.length >= 5) {
        const symbol = parts[0].toUpperCase();
        const type = (parts[1].toUpperCase() || "BUY") as TransactionType;
        const date = parts[2] || new Date().toISOString().split("T")[0];
        const qty = parseFloat(parts[3]) || 0;
        const price = parseFloat(parts[4]) || 0;
        const notes = parts[5] || "CSV Imported Trade";

        if (qty > 0 && price > 0) {
          const buyCalc = calculateBuy(symbol, qty, price, DEFAULT_FEE_SCHEDULE);
          newTxList.push({
            id: `tx-imp-${Date.now()}-${i}`,
            portfolioId: "default",
            symbol,
            companyName: symbol,
            type,
            date,
            quantity: qty,
            price,
            grossAmount: buyCalc.grossAmount,
            brokerCommission: buyCalc.brokerCommission,
            sebonFee: buyCalc.sebonFee,
            dpFee: buyCalc.dpFee,
            totalCharges: buyCalc.totalCharges,
            netAmount: buyCalc.totalPayable,
            notes,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    if (newTxList.length > 0) {
      onImport(newTxList);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#131B2E] p-6 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Import Portfolio CSV / Excel</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-slate-400">
          Upload or paste comma-separated transactions exported from your Meroshare or broker statement.
        </p>

        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-400">Format: Symbol, Type, Date, Quantity, Price, Notes</span>
          <button
            onClick={handleDownloadSample}
            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-semibold text-[11px]"
          >
            <Download className="h-3 w-3" />
            <span>Download CSV Template</span>
          </button>
        </div>

        <textarea
          rows={6}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={`Paste CSV data here or click below to populate sample:\n\n${sampleCSV}`}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white font-mono text-[11px]"
        />

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setCsvText(sampleCSV)}
            className="text-slate-400 hover:text-white underline text-[11px]"
          >
            Fill Sample Data
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessImport}
              className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
            >
              Process & Ingest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
