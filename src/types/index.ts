// ==========================================
// NEPSE Intelligence AI - Master Type System
// Institutional Edition (10 Flagship AI Systems)
// ==========================================

export type Sector =
  | "Commercial Banks"
  | "Development Banks"
  | "Finance"
  | "Hotels And Tourism"
  | "Hydro Power"
  | "Investment"
  | "Life Insurance"
  | "Manufacturing And Processing"
  | "Microfinance"
  | "Non Life Insurance"
  | "Others"
  | "Tradings"
  | "Mutual Fund";

export interface Company {
  symbol: string;
  name: string;
  sector: Sector;
  listedShares: number;
  paidUpCapital: number; // in NPR
  eps: number;
  bookValue: number;
  pe: number;
  pb: number;
  roe: number;
  roa: number;
  dividendYield: number;
  high52: number;
  low52: number;
}

export interface MarketPrice {
  symbol: string;
  name: string;
  sector: Sector;
  ltp: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  turnover: number;
  transactions: number;
  marketCap: number; // in NPR Crores
  high52: number;
  low52: number;
  timestamp: string;
  status: "OPEN" | "CLOSED" | "PRE_OPEN";
}

export interface MarketIndex {
  name: string;
  current: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  turnover: number;
}

export interface MarketBreadth {
  advancers: number;
  decliners: number;
  unchanged: number;
  totalTurnover: number;
  totalTradedShares: number;
  totalTransactions: number;
  asOf: string;
}

// ------------------------------------------
// Portfolio & Transactions
// ------------------------------------------

export type TransactionType =
  | "BUY"
  | "SELL"
  | "IPO"
  | "RIGHTS"
  | "BONUS"
  | "DIVIDEND"
  | "AUCTION"
  | "TRANSFER";

export interface Transaction {
  id: string;
  portfolioId: string;
  symbol: string;
  companyName: string;
  type: TransactionType;
  date: string;
  quantity: number;
  price: number; // Gross price per share
  grossAmount: number;
  brokerCommission: number;
  sebonFee: number;
  dpFee: number;
  cgtRate?: number; // 0.05 or 0.075 for sales
  capitalGainsTax?: number;
  totalCharges: number;
  netAmount: number; // Total Paid (BUY) or Net Received (SELL)
  waccAtTime?: number;
  realizedPL?: number;
  notes?: string;
  createdAt: string;
}

export interface Holding {
  symbol: string;
  companyName: string;
  sector: Sector;
  quantity: number;
  wacc: number; // Weighted Average Cost per share
  totalInvested: number;
  currentLtp: number;
  currentMarketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  realizedPL: number;
  breakEvenPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  allocationPercent: number;
  aiSuggestedAction: SignalType;
  aiConfidence: number;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  userId: string;
  isDefault: boolean;
  createdAt: string;
}

export interface PortfolioSummary {
  portfolioId: string;
  portfolioName: string;
  totalInvested: number;
  currentMarketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  realizedPL: number;
  totalDividends: number;
  totalExpenses: number;
  netReturn: number;
  netReturnPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  cashBalance: number;
  holdingsCount: number;
  topGainer?: { symbol: string; gainPercent: number };
  topLoser?: { symbol: string; lossPercent: number };
}

// ------------------------------------------
// Calculator Types
// ------------------------------------------

export interface BuyCalculation {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  grossAmount: number;
  brokerCommission: number;
  brokerCommissionRate: number;
  sebonFee: number;
  dpFee: number;
  totalCharges: number;
  totalPayable: number;
  effectiveCostPerShare: number;
}

export interface SellCalculation {
  symbol: string;
  quantity: number;
  sellingPrice: number;
  purchaseWacc: number;
  holdingDays: number;
  isIndividual: boolean;
  grossAmount: number;
  brokerCommission: number;
  brokerCommissionRate: number;
  sebonFee: number;
  dpFee: number;
  capitalGain: number;
  cgtRate: number;
  cgtAmount: number;
  totalCharges: number;
  netReceivable: number;
  netProfitLoss: number;
  returnPercent: number;
}

// ------------------------------------------
// Technical & Quantitative Scanners
// ------------------------------------------

export type ScannerType =
  | "CONSOLIDATING_UP_BREAKOUT"
  | "CONSOLIDATING_DOWN_BREAKOUT"
  | "INSIDE_BAR_UP"
  | "INSIDE_BAR_DOWN"
  | "TRENDING_STOCKS"
  | "MOMENTUM_SIGNAL"
  | "TREND_RELAY"
  | "REVERSAL_SIGNAL"
  | "INTELLIGENT_AVERAGING";

export interface ScannerResult {
  id: string;
  symbol: string;
  companyName: string;
  sector: Sector;
  scannerType: ScannerType;
  scannerTitle: string;
  ltp: number;
  changePercent: number;
  signalConfidence: number; // 0-100%
  entryZone: { min: number; max: number };
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: number;
  volumeRatio: number; // vs 20-day SMA
  timeframe: "Daily" | "Weekly";
  reasons: string[];
  invalidationLevel: number;
  detectedAt: string;
}

// ------------------------------------------
// Institutional AI Engine & Scoring System
// ------------------------------------------

export type SignalType =
  | "STRONG_BUY"
  | "BUY"
  | "ACCUMULATE"
  | "HOLD"
  | "REDUCE"
  | "SELL"
  | "AVOID"
  | "WATCHLIST"
  | "AVERAGE_DOWN"
  | "AVERAGE_UP"
  | "NO_TRADE";

export interface InstitutionalStockScore {
  symbol: string;
  name: string;
  sector: Sector;
  ltp: number;
  changePercent: number;
  technicalStrength: number; // 30% weight
  fundamentalQuality: number; // 25% weight
  marketSectorStrength: number; // 15% weight
  liquidityTradability: number; // 10% weight
  sentimentEvents: number; // 10% weight
  riskAdjustedOpportunity: number; // 10% weight
  totalScore: number; // 0 - 100
  initialClassification: "Strong positive" | "Positive" | "Neutral" | "Weak" | "Very weak";
  action: "BUY" | "HOLD" | "REDUCE" | "SELL" | "AVOID";
  actionBadgeColor: string;
  riskScore: number; // 0 - 100 (Higher = riskier)
  liquidityRating: "High" | "Moderate" | "Constrained" | "Illiquid";
  rewardRiskRatio: number;
  primaryThesis: string;
  keyDeteriorationAlert?: string;
  dataFreshness: string;
}

export interface AIRecommendation {
  symbol: string;
  companyName: string;
  sector: Sector;
  currentPrice: number;
  signal: SignalType;
  horizon: "Short-term (1-4 weeks)" | "Medium-term (1-3 months)" | "Long-term (6-12 months)";
  confidenceScore: number; // 0 - 100
  entryRange: { min: number; max: number };
  targetPrice: number;
  stopLoss: number;
  riskReward: number;
  technicalThesis: string;
  fundamentalThesis: string;
  marketRegime: "Strong Bullish" | "Weak Bullish" | "Sideways" | "Bearish" | "High Volatility Compression";
  positiveFactors: string[];
  negativeFactors: string[];
  invalidationConditions: string[];
  timestamp: string;
  modelVersion: string;
}

// ------------------------------------------
// 02 · Protection: AI Portfolio Doctor
// ------------------------------------------

export interface PortfolioDoctorDiagnostic {
  portfolioRiskScore: number; // 0.25C + 0.20V + 0.20D + 0.15L + 0.10S + 0.10M
  riskBand: "Low Risk" | "Moderate" | "Elevated" | "High Risk";
  components: {
    concentrationRisk: number; // 0-100
    volatilityRisk: number;
    drawdownRisk: number;
    liquidityRisk: number;
    sectorRisk: number;
    marketRegimeRisk: number;
  };
  capitalPreservationMode: boolean;
  warnings: Array<{
    id: string;
    type: "CONCENTRATION" | "SECTOR" | "DRAWDOWN" | "LIQUIDITY" | "THESIS";
    severity: "CRITICAL" | "ELEVATED" | "MODERATE";
    title: string;
    description: string;
    actionAdvice: string;
  }>;
  stressTestResults: Array<{
    id: string;
    name: string;
    dropPercent: number;
    portfolioValueAfter: number;
    estimatedLossNpr: number;
    topDetractors: Array<{ symbol: string; lossNpr: number; contributionPct: number }>;
  }>;
  stressScenarios?: Array<{
    id: string;
    name: string;
    dropPercent: number;
    portfolioValueAfter: number;
    estimatedLossNpr: number;
    topDetractors: Array<{ symbol: string; lossNpr: number; contributionPct: number }>;
  }>;
}

// ------------------------------------------
// 03 · Exit Management: Smart Exit Advisor
// ------------------------------------------

export interface SmartExitAnalysis {
  symbol: string;
  companyName: string;
  sector: Sector;
  quantity: number;
  wacc: number;
  currentLtp: number;
  unrealizedPLPercent: number;
  suggestedAction: "HOLD / REVIEW EXIT" | "HOLD" | "TAKE PARTIAL PROFIT" | "REDUCE" | "URGENT EXIT / SELL";
  exitUrgency: "NORMAL" | "ELEVATED" | "URGENT";
  thesisStatus: "INTACT" | "WEAKENING" | "DETERIORATING" | "BROKEN";
  trailingProtectionLevel: number;
  recommendedStopLoss: number;
  partialExitPercent: number;
  exitIntelligence: string[];
  possibleActions: string[];
}

// ------------------------------------------
// 04 · Research: AI Research Analyst
// ------------------------------------------

export interface InstitutionalResearchReport {
  symbol: string;
  companyName: string;
  sector: Sector;
  price: number;
  reportingDate: string;
  executiveThesis: string;
  fundamentalAnalysis: {
    eps: number;
    roe: number;
    bookValue: number;
    revenueGrowth: string;
    profitabilityGrade: string;
    balanceSheetHealth: string;
  };
  valuationAnalysis: {
    pe: number;
    pb: number;
    dividendYield: number;
    peVsSectorMedian: string;
    valuationRating: string;
  };
  technicalAnalysis: {
    trend: string;
    momentum: string;
    supportLevel: number;
    resistanceLevel: number;
    volatility: string;
  };
  riskAnalysis: {
    financialRisk: string;
    sectorRisk: string;
    liquidityRisk: string;
    governanceRisk: string;
  };
  catalysts: string[];
  scenarios: {
    bull: { targetPrice: number; upside: string; assumption: string };
    base: { targetPrice: number; upside: string; assumption: string };
    bear: { targetPrice: number; upside: string; assumption: string; invalidation: string };
  };
  conclusion: {
    rating: "BUY" | "HOLD" | "REDUCE" | "SELL" | "AVOID";
    confidenceScore: number;
    summary: string;
  };
}

// ------------------------------------------
// 10 · Decision Support: AI Investment Copilot
// ------------------------------------------

export interface CopilotMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  actionRecommendation?: "BUY" | "HOLD" | "REDUCE" | "SELL" | "AVOID";
  evidenceCitations?: Array<{ label: string; value: string }>;
}

// ------------------------------------------
// Trading Journal & Psychology
// ------------------------------------------

export interface JournalEntry {
  id: string;
  symbol: string;
  entryDate: string;
  exitDate?: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  strategy: string;
  setupType: string;
  emotionAtEntry: "Disciplined" | "FOMO" | "Excited" | "Anxious" | "Revenge";
  emotionAtExit?: "Disciplined" | "Panic Sold" | "Greedy" | "Satisfied" | "Frustrated";
  confidenceRating: number; // 1-5
  lessonsLearned?: string;
  pl?: number;
  plPercent?: number;
  isClosed: boolean;
}

// ------------------------------------------
// Sentiment & News
// ------------------------------------------

export interface MarketSentiment {
  score: number; // 0 (Extreme Fear) to 100 (Extreme Greed)
  status: "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";
  bullishPercent: number;
  bearishPercent: number;
  buyingPressureRatio: number;
  volumeImbalance: number;
  unusualActivityCount: number;
  lastUpdated: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: "ShareSansar" | "Bizmandu" | "NEPSE Alpha" | "MeroLagani" | "NEPSE Disclosure";
  url: string;
  publishedAt: string;
  sentiment: "Bullish" | "Neutral" | "Bearish";
  impactScore: number; // 1 - 5
  relatedSymbols: string[];
  sector?: Sector;
  isVerified: boolean;
}

// ------------------------------------------
// Watchlist & Alerts
// ------------------------------------------

export interface WatchlistItem {
  id: string;
  symbol: string;
  targetPrice?: number;
  stopLossPrice?: number;
  rsiAlertUpper?: number;
  rsiAlertLower?: number;
  notes?: string;
  addedAt: string;
}

// ------------------------------------------
// Admin & RBAC
// ------------------------------------------

export type UserRole = "Super Admin" | "Admin" | "Financial Analyst" | "Trader" | "Free User";

export interface FeeSchedule {
  effectiveDate: string;
  sebonFeeRate: number; // 0.00015
  dpFee: number; // 25
  slabs: Array<{
    maxAmount: number;
    rate: number;
  }>;
  cgtShortTermRate: number; // 0.075
  cgtLongTermRate: number; // 0.05
}

// ------------------------------------------
// Floorsheet Intelligence & Broker Analysis
// ------------------------------------------

export interface FloorsheetRecord {
  id: string;
  transactionNo: string;
  contractNo?: string;
  transactionDate: string;
  transactionTime?: string;
  symbol: string;
  stockName?: string;
  quantity: number;
  rate: number;
  amount: number;
  buyerBroker: number;
  buyerBrokerName?: string;
  sellerBroker: number;
  sellerBrokerName?: string;
}

export interface FloorsheetDataset {
  id: string;
  filename: string;
  fileSize: number;
  fileType: "CSV" | "XLSX" | "XLS" | "PDF" | "TXT";
  tradingDate: string;
  totalRecords: number;
  totalTurnover: number;
  totalShares: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "ROLLED_BACK";
  uploadedAt: string;
  uploadedBy: string;
  validationWarnings: string[];
  duplicateCount: number;
  columnMapping: Record<string, string>;
  records: FloorsheetRecord[];
}

export interface BrokerStats {
  brokerNo: number;
  brokerName: string;
  buyQty: number;
  buyAmount: number;
  avgBuyRate: number;
  sellQty: number;
  sellAmount: number;
  avgSellRate: number;
  netQty: number;
  netAmount: number;
  participationPercent: number;
}

export interface ScriptBrokerIntelligence {
  symbol: string;
  tradingDate: string;
  totalTurnover: number;
  totalQuantity: number;
  topBuyers: Array<{ brokerNo: number; brokerName: string; buyQty: number; buyAmount: number; avgBuyRate: number }>;
  topSellers: Array<{ brokerNo: number; brokerName: string; sellQty: number; sellAmount: number; avgSellRate: number }>;
  netBuyerBrokers: Array<{ brokerNo: number; brokerName: string; netQty: number; netAmount: number }>;
  netSellerBrokers: Array<{ brokerNo: number; brokerName: string; netQty: number; netAmount: number }>;
  brokerConcentrationRatio: number; // Top 3 brokers share %
  brokerConcentrationLevel: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
  accumulationScore: number; // 0-100
  distributionScore: number; // 0-100
  buyingPressureScore: number; // 0-100
  sellingPressureScore: number; // 0-100
  signal:
    | "ACCUMULATION_LIKE"
    | "DISTRIBUTION_LIKE"
    | "BALANCED"
    | "HIGH_BROKER_CONCENTRATION"
    | "UNUSUAL_TRANSACTION_ACTIVITY"
    | "INSUFFICIENT_EVIDENCE";
  aiInterpretation: string;
  supportingEvidence: string[];
  dataFreshness: string;
}

export type MasterAdminSection =
  | "overview"
  | "ai-intelligence"
  | "floorsheet"
  | "broker-intelligence"
  | "stock-management"
  | "market-data"
  | "user-management"
  | "portfolio-control"
  | "advertisement-center"
  | "subscription-center"
  | "notifications"
  | "security-center"
  | "seo-content"
  | "system-settings";

