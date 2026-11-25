// ============================================================================
// NEPSE Floorsheet Intelligence & Ingestion Engine
// Parser for CSV, XLSX, XLS with automated column detection, validation & audit
// ============================================================================

import { FloorsheetRecord, FloorsheetDataset } from "@/types";
import * as XLSX from "xlsx";

export const NEPSE_BROKERS: Record<number, string> = {
  1: "Kumari Securities",
  2: "Pandupati Investment",
  3: "Aradhana Investment",
  4: "Opal Securities",
  5: "Market Securitas",
  6: "Agrawal Securities",
  7: "J.B. Securities",
  8: "Ashutosh Brokerage",
  9: "Primo Securities",
  10: "Pragyan Securities",
  11: "Malla & Malla Stock Broking",
  12: "Neev Securities",
  13: "Thrive Brokerage",
  14: "Nepal Stock House",
  16: "Primo Securities",
  17: "ABC Securities",
  18: "Sagarmatha Securities",
  19: "Nepal Investment & Securities",
  20: "Sipla Securities",
  21: "Midas Stock Broking",
  22: "Siprabi Securities",
  25: "Sweta Securities",
  26: "Asian Securities",
  28: "Shree Krishna Securities",
  29: "Trishakti Securities",
  32: "Premier Securities",
  33: "Dakshinkali Securities",
  34: "Vision Securities",
  35: "Kohinoor Investment",
  36: "Secured Securities",
  37: "Dynamic Technosoft",
  38: "Dipshikha Dhitopatra Karobar",
  39: "Sumeru Securities",
  40: "Creative Securities",
  41: "Linch Stock Broking",
  42: "Sani Securities",
  43: "South Asian Bulls",
  44: "Dynamic Money Managers",
  45: "Imperial Securities",
  46: "Kalika Securities",
  47: "Nivaya Securities",
  48: "Trisul Securities",
  49: "Online Securities",
  50: "Crystal Kanchangunj Securities",
  51: "Oxford Securities",
  52: "Sundhara Securities",
  53: "Investment Management",
  54: "Sewa Securities",
  55: "Bhrikuti Stock Broking",
  56: "Sri Hari Securities",
  57: "Aryatara Investment",
  58: "Naasa Securities",
  59: "Deevraag Securities",
  60: "Swarnalaxmi Securities",
};

export function getBrokerName(brokerNo: number): string {
  return NEPSE_BROKERS[brokerNo] || `Broker ${brokerNo}`;
}

export interface ParseResult {
  filename: string;
  fileSize: number;
  detectedDate: string;
  detectedColumns: string[];
  totalRows: number;
  validRecords: FloorsheetRecord[];
  duplicateCount: number;
  missingValueCount: number;
  validationWarnings: string[];
  columnMapping: Record<string, string>;
}

/**
 * Standardizes raw column headers for NEPSE floorsheet detection
 */
export function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const normalize = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

  headers.forEach((orig) => {
    const norm = normalize(orig);
    if (/trans(action)?(no|num|id)?/i.test(norm) || norm === "sno" || norm === "sn") {
      mapping["transactionNo"] = orig;
    } else if (/contract(no|num)?/i.test(norm)) {
      mapping["contractNo"] = orig;
    } else if (/date/i.test(norm)) {
      mapping["transactionDate"] = orig;
    } else if (/time/i.test(norm)) {
      mapping["transactionTime"] = orig;
    } else if (norm === "symbol" || norm === "scrip" || norm === "stock" || norm === "script") {
      mapping["symbol"] = orig;
    } else if (/stockname|companyname|name/i.test(norm)) {
      mapping["stockName"] = orig;
    } else if (/qty|quantity|shares|volume|units/i.test(norm)) {
      mapping["quantity"] = orig;
    } else if (/rate|price|unitprice/i.test(norm)) {
      mapping["rate"] = orig;
    } else if (/amount|turnover|total/i.test(norm)) {
      mapping["amount"] = orig;
    } else if (/buyer|buyerbroker|buybroker|buyingbroker/i.test(norm)) {
      mapping["buyerBroker"] = orig;
    } else if (/seller|sellerbroker|sellbroker|sellingbroker/i.test(norm)) {
      mapping["sellerBroker"] = orig;
    }
  });

  return mapping;
}

/**
 * Parses raw text (CSV or TSV) into a structured preview
 */
export function parseCSVFloorsheet(
  csvText: string,
  filename: string,
  customMapping?: Record<string, string>
): ParseResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("Floorsheet file must have a header row and at least one transaction row.");
  }

  // Parse header
  const separator = lines[0].includes("\t") ? "\t" : ",";
  const rawHeaders = lines[0].split(separator).map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const mapping = customMapping || detectColumnMapping(rawHeaders);

  const warnings: string[] = [];
  const validRecords: FloorsheetRecord[] = [];
  const seenTx = new Set<string>();
  let duplicates = 0;
  let missingValues = 0;
  let detectedDate = new Date().toISOString().split("T")[0];

  const getColVal = (row: string[], field: string): string => {
    const colName = mapping[field];
    if (!colName) return "";
    const idx = rawHeaders.indexOf(colName);
    if (idx === -1 || idx >= row.length) return "";
    return row[idx].trim().replace(/^["']|["']$/g, "");
  };

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(separator);
    if (row.length < 3) continue;

    const txNo = getColVal(row, "transactionNo") || `TX-${i}`;
    const symbol = (getColVal(row, "symbol") || getColVal(row, "stockName") || "").toUpperCase();
    const qty = parseFloat(getColVal(row, "quantity").replace(/,/g, "")) || 0;
    const rate = parseFloat(getColVal(row, "rate").replace(/,/g, "")) || 0;
    const amount = parseFloat(getColVal(row, "amount").replace(/,/g, "")) || qty * rate;
    const buyerBroker = parseInt(getColVal(row, "buyerBroker").replace(/\D/g, "")) || 58;
    const sellerBroker = parseInt(getColVal(row, "sellerBroker").replace(/\D/g, "")) || 45;
    const dateStr = getColVal(row, "transactionDate");
    const timeStr = getColVal(row, "transactionTime");

    if (dateStr && /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(dateStr)) {
      detectedDate = dateStr.replace(/\//g, "-");
    }

    if (!symbol || qty <= 0 || rate <= 0) {
      missingValues++;
      continue;
    }

    // Duplicate detection: either identical transaction number or identical composite signature
    const sig = `${txNo}-${symbol}-${qty}-${rate}-${buyerBroker}-${sellerBroker}`;
    if (seenTx.has(sig)) {
      duplicates++;
      continue;
    }
    seenTx.add(sig);

    validRecords.push({
      id: `flr-${Date.now()}-${i}`,
      transactionNo: txNo,
      contractNo: getColVal(row, "contractNo") || undefined,
      transactionDate: detectedDate,
      transactionTime: timeStr || "12:00:00",
      symbol,
      stockName: getColVal(row, "stockName") || symbol,
      quantity: qty,
      rate,
      amount: Math.round(amount * 100) / 100,
      buyerBroker,
      buyerBrokerName: getBrokerName(buyerBroker),
      sellerBroker,
      sellerBrokerName: getBrokerName(sellerBroker),
    });
  }

  if (duplicates > 0) {
    warnings.push(`Detected and filtered ${duplicates} duplicate transactions.`);
  }
  if (missingValues > 0) {
    warnings.push(`Skipped ${missingValues} rows with missing symbol, quantity, or rate.`);
  }
  if (validRecords.length === 0) {
    warnings.push("No valid transaction rows found. Please review column mapping.");
  }

  return {
    filename,
    fileSize: csvText.length,
    detectedDate,
    detectedColumns: rawHeaders,
    totalRows: lines.length - 1,
    validRecords,
    duplicateCount: duplicates,
    missingValueCount: missingValues,
    validationWarnings: warnings,
    columnMapping: mapping,
  };
}

/**
 * Parses XLSX / XLS binary buffer into structured Floorsheet Dataset
 */
export function parseExcelFloorsheet(
  buffer: ArrayBuffer,
  filename: string,
  customMapping?: Record<string, string>
): ParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Excel workbook contains no sheets.");

  const sheet = workbook.Sheets[sheetName];
  const csvText = XLSX.utils.sheet_to_csv(sheet);
  return parseCSVFloorsheet(csvText, filename, customMapping);
}

// ------------------------------------------
// Storage & History Management
// ------------------------------------------

const FLOORSHEET_STORAGE_KEY = "nepse_floorsheet_datasets_v1";

export function loadStoredDatasets(): FloorsheetDataset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FLOORSHEET_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredDatasets(datasets: FloorsheetDataset[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FLOORSHEET_STORAGE_KEY, JSON.stringify(datasets));
  } catch {}
}

export function createDatasetFromParse(
  result: ParseResult,
  uploaderName: string = "Super Admin"
): FloorsheetDataset {
  const totalTurnover = result.validRecords.reduce((acc, r) => acc + r.amount, 0);
  const totalShares = result.validRecords.reduce((acc, r) => acc + r.quantity, 0);

  return {
    id: `ds-${Date.now()}`,
    filename: result.filename,
    fileSize: result.fileSize,
    fileType: result.filename.endsWith(".xlsx")
      ? "XLSX"
      : result.filename.endsWith(".xls")
      ? "XLS"
      : "CSV",
    tradingDate: result.detectedDate,
    totalRecords: result.validRecords.length,
    totalTurnover: Math.round(totalTurnover * 100) / 100,
    totalShares,
    status: "PENDING_APPROVAL",
    uploadedAt: new Date().toISOString(),
    uploadedBy: uploaderName,
    validationWarnings: result.validationWarnings,
    duplicateCount: result.duplicateCount,
    columnMapping: result.columnMapping,
    records: result.validRecords,
  };
}
