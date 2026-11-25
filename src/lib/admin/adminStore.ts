// ============================================================================
// NEPSE Intelligence AI - Master Admin, Subscription, Ads & Client Control Store
// Enterprise-grade persistence, Role-Based Access Control, and Analytics
// ============================================================================

import { FeeSchedule, UserRole } from "@/types";
import { DEFAULT_FEE_SCHEDULE } from "@/lib/financial/nepseFeeEngine";

// ----------------------------------------------------------------------------
// 1. Admin Authentication & Session Types
// ----------------------------------------------------------------------------

export interface AdminSession {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: "Super Admin" | "Risk Admin" | "Compliance Officer" | "Analyst";
    avatarUrl?: string;
    lastLogin: string;
    ipAddress: string;
  } | null;
  token: string | null;
  expiresAt: string | null;
}

export const DEFAULT_ADMIN_CREDENTIALS = [
  {
    email: "superadmin@nepseintelligence.ai",
    password: "nepseadmin2026",
    pin: "8888",
    name: "Siddhartha Sharma",
    role: "Super Admin" as const,
  },
  {
    email: "risk@nepseintelligence.ai",
    password: "riskmanager2026",
    pin: "1234",
    name: "Aarav Adhikari",
    role: "Risk Admin" as const,
  },
  {
    email: "compliance@nepseintelligence.ai",
    password: "compliance2026",
    pin: "5678",
    name: "Prashant Karki",
    role: "Compliance Officer" as const,
  },
];

// ----------------------------------------------------------------------------
// 2. Subscription Plan Management Types
// ----------------------------------------------------------------------------

export interface SubscriptionPlan {
  id: string;
  name: string;
  tierKey: "free" | "pro" | "premium" | "enterprise";
  priceMonthlyNpr: number;
  priceYearlyNpr: number;
  periodLabel: string;
  badge: string;
  description: string;
  isPopular?: boolean;
  isActive: boolean;
  features: string[];
  quotas: {
    aiQueriesPerDay: number | "unlimited";
    maxWatchlistSymbols: number | "unlimited";
    realtimeStream: boolean;
    institutionalOrderFlow: boolean;
    scannersCount: number;
    backtestingSimulations: number | "unlimited";
    csvExportEnabled: boolean;
    removeAds: boolean;
  };
  subscribersCount: number;
  updatedAt: string;
}

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-free",
    name: "Free Investor",
    tierKey: "free",
    priceMonthlyNpr: 0,
    priceYearlyNpr: 0,
    periodLabel: "Forever Free",
    badge: "STARTER",
    description: "Essential portfolio ledger, basic market feed & standard calculations for individual retail investors.",
    isActive: true,
    features: [
      "1 Personal Portfolio & 25 Transactions",
      "Standard NEPSE Fee & WACC Calculator",
      "End-of-Day Market Price Updates",
      "Basic Financial News & Sector Sentiment",
      "Standard Technical Charting (Daily)",
    ],
    quotas: {
      aiQueriesPerDay: 5,
      maxWatchlistSymbols: 10,
      realtimeStream: false,
      institutionalOrderFlow: false,
      scannersCount: 3,
      backtestingSimulations: 3,
      csvExportEnabled: false,
      removeAds: false,
    },
    subscribersCount: 1420,
    updatedAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "plan-pro",
    name: "Pro Quantitative Trader",
    tierKey: "pro",
    priceMonthlyNpr: 1499,
    priceYearlyNpr: 14990,
    periodLabel: "per month",
    badge: "MOST POPULAR",
    isPopular: true,
    description: "Full AI stock recommendations, 9x live scanners, smart averaging assistant & priority trading tools.",
    isActive: true,
    features: [
      "Unlimited Custom Portfolios & Auto-Sync",
      "Verified Live NEPSE Streaming Feed (0-delay)",
      "9x Advanced Quantitative Breakout Scanners",
      "AI Stock Radar & Smart Exit Advisor",
      "Intelligent Averaging Down Engine",
      "Full Trading Journal with Behavioral Analytics",
      "Complete Ad-Free Professional Workspace",
    ],
    quotas: {
      aiQueriesPerDay: 100,
      maxWatchlistSymbols: 50,
      realtimeStream: true,
      institutionalOrderFlow: false,
      scannersCount: 9,
      backtestingSimulations: 50,
      csvExportEnabled: true,
      removeAds: true,
    },
    subscribersCount: 486,
    updatedAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "plan-premium",
    name: "Institutional Alpha",
    tierKey: "premium",
    priceMonthlyNpr: 3999,
    priceYearlyNpr: 39990,
    periodLabel: "per month",
    badge: "INSTITUTIONAL",
    description: "Broker floor-sheet block trade detection, multi-agent neural consensus, Monte Carlo simulations & API keys.",
    isActive: true,
    features: [
      "Everything in Pro Tier Included",
      "Institutional Floor Sheet Block Transaction Radar",
      "Multi-Agent AI Neural Consensus (5 Specialized Agents)",
      "Monte Carlo 1,000-Path Price Target Probability Trajectories",
      "SEBON & CDSC Regulatory Compliance Auditor",
      "Personalized Daily AI Research Executive Briefs",
      "High-Frequency REST & WebSocket API Access Keys",
    ],
    quotas: {
      aiQueriesPerDay: "unlimited",
      maxWatchlistSymbols: "unlimited",
      realtimeStream: true,
      institutionalOrderFlow: true,
      scannersCount: 9,
      backtestingSimulations: "unlimited",
      csvExportEnabled: true,
      removeAds: true,
    },
    subscribersCount: 124,
    updatedAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "plan-enterprise",
    name: "Hedge Fund & Merchant Bank",
    tierKey: "enterprise",
    priceMonthlyNpr: 12500,
    priceYearlyNpr: 125000,
    periodLabel: "per month",
    badge: "ENTERPRISE",
    description: "Bespoke factor models, dedicated cloud infrastructure, direct broker integration & priority desk support.",
    isActive: true,
    features: [
      "Dedicated High-Throughput VPC Instance",
      "Direct FIX Broker API Bridge (Broker 58, 45, 49)",
      "Custom Deep Learning Factor Weights Training",
      "Bespoke Portfolio Risk Optimization & Tail-Risk Hedging",
      "Multi-User Seat Allocation & Role Hierarchy",
      "Dedicated Senior Quant Support Manager (24/7)",
    ],
    quotas: {
      aiQueriesPerDay: "unlimited",
      maxWatchlistSymbols: "unlimited",
      realtimeStream: true,
      institutionalOrderFlow: true,
      scannersCount: 9,
      backtestingSimulations: "unlimited",
      csvExportEnabled: true,
      removeAds: true,
    },
    subscribersCount: 18,
    updatedAt: "2026-11-01T10:00:00Z",
  },
];

// ----------------------------------------------------------------------------
// 3. Ad & Promotional Campaign Management Types
// ----------------------------------------------------------------------------

export interface AdCampaign {
  id: string;
  title: string;
  sponsorName: string;
  sponsorCategory: "Brokerage" | "Merchant Bank" | "FinTech" | "Insurance" | "Mutual Fund" | "Crypto/Forex Warning";
  placement: "top-announcement" | "sidebar-banner" | "dashboard-native" | "copilot-sponsor" | "first-visit-popup";
  targetAudience: "free-only" | "all-users" | "pro-only";
  headline: string;
  subtext: string;
  callToAction: string;
  targetUrl: string;
  badgeLabel?: string;
  backgroundColor: string;
  accentColor: string;
  isActive: boolean;
  impressionsCount: number;
  clicksCount: number;
  startDate: string;
  endDate: string;
}

export const INITIAL_AD_CAMPAIGNS: AdCampaign[] = [
  {
    id: "ad-1",
    title: "Broker No. 58 - Himalayan Securities Zero Demat AMC",
    sponsorName: "Himalayan Securities (Broker 58)",
    sponsorCategory: "Brokerage",
    placement: "top-announcement",
    targetAudience: "free-only",
    headline: "Trade NEPSE with Broker 58: Flat 0.27% Institutional Slab & Instant Collateral Credit",
    subtext: "Open free TMS account online in 5 minutes with seamless ConnectIPS & eSewa fund load.",
    callToAction: "Open Online Account",
    targetUrl: "https://broker58.com.np",
    badgeLabel: "SPONSORED BROKER",
    backgroundColor: "from-blue-900/60 to-indigo-950/80",
    accentColor: "border-blue-500/50 text-blue-400",
    isActive: true,
    impressionsCount: 28450,
    clicksCount: 1342,
    startDate: "2026-11-01",
    endDate: "2026-12-31",
  },
  {
    id: "ad-2",
    title: "Nabil Investment Banking Dynamic PMS",
    sponsorName: "Nabil Investment Banking Ltd",
    sponsorCategory: "Merchant Bank",
    placement: "dashboard-native",
    targetAudience: "free-only",
    headline: "Supercharge Wealth with Nabil Balanced Portfolio Management (PMS)",
    subtext: "Let institutional fund managers grow your NEPSE capital with disciplined risk parity.",
    callToAction: "Explore PMS Returns",
    targetUrl: "https://nabilinvest.com.np",
    badgeLabel: "SEBON LICENSED PMS",
    backgroundColor: "from-amber-950/50 via-slate-900 to-amber-900/40",
    accentColor: "border-amber-500/40 text-amber-400",
    isActive: true,
    impressionsCount: 14210,
    clicksCount: 680,
    startDate: "2026-10-15",
    endDate: "2026-12-15",
  },
  {
    id: "ad-3",
    title: "eSewa 1-Click MeroShare & Demat Renewal",
    sponsorName: "eSewa Digital Wallet",
    sponsorCategory: "FinTech",
    placement: "sidebar-banner",
    targetAudience: "free-only",
    headline: "Renew Your MeroShare & Demat with eSewa",
    subtext: "Never miss an IPO allocation. Instant annual renewal with zero transaction surcharge.",
    callToAction: "Renew Now (NPR 150)",
    targetUrl: "https://esewa.com.np",
    badgeLabel: "FAST PAY",
    backgroundColor: "from-emerald-950/60 to-slate-900",
    accentColor: "border-emerald-500/40 text-emerald-400",
    isActive: true,
    impressionsCount: 39120,
    clicksCount: 2190,
    startDate: "2026-11-01",
    endDate: "2027-01-31",
  },
];

// ----------------------------------------------------------------------------
// 4. Client & Subscriber Management Types
// ----------------------------------------------------------------------------

export interface ClientSubscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  dematNumber: string;
  currentTier: "Free" | "Pro" | "Premium" | "Enterprise";
  status: "Active" | "Expired" | "Suspended" | "Trial";
  billingCycle: "Monthly" | "Yearly" | "Complimentary";
  registeredAt: string;
  expiresAt: string;
  totalPaidNpr: number;
  paymentGateway: "eSewa" | "Khalti" | "ConnectIPS" | "FonePay" | "Direct Bank";
  portfolioValuationNpr: number;
  tradesLogged: number;
  lastLoginAt: string;
}

export const INITIAL_CLIENT_SUBSCRIBERS: ClientSubscriber[] = [
  {
    id: "cli-101",
    name: "Rajan Shrestha",
    email: "rajan.shrestha@gmail.com",
    phone: "+977-9841234567",
    dematNumber: "1301090000492811",
    currentTier: "Premium",
    status: "Active",
    billingCycle: "Yearly",
    registeredAt: "2025-02-14",
    expiresAt: "2027-02-14",
    totalPaidNpr: 39990,
    paymentGateway: "ConnectIPS",
    portfolioValuationNpr: 4850000,
    tradesLogged: 142,
    lastLoginAt: "10 mins ago",
  },
  {
    id: "cli-102",
    name: "Sunita Bhattarai",
    email: "sunita.b@yahoo.com",
    phone: "+977-9851098765",
    dematNumber: "1301280000128456",
    currentTier: "Pro",
    status: "Active",
    billingCycle: "Monthly",
    registeredAt: "2025-08-20",
    expiresAt: "2026-12-20",
    totalPaidNpr: 5996,
    paymentGateway: "eSewa",
    portfolioValuationNpr: 1950000,
    tradesLogged: 68,
    lastLoginAt: "1 hour ago",
  },
  {
    id: "cli-103",
    name: "Bikash Gurung",
    email: "bgurung.trader@gmail.com",
    phone: "+977-9803456789",
    dematNumber: "1301450000781290",
    currentTier: "Free",
    status: "Active",
    billingCycle: "Complimentary",
    registeredAt: "2026-01-05",
    expiresAt: "2028-01-01",
    totalPaidNpr: 0,
    paymentGateway: "FonePay",
    portfolioValuationNpr: 420000,
    tradesLogged: 14,
    lastLoginAt: "Yesterday",
  },
  {
    id: "cli-104",
    name: "Apex Alpha Capital (PMS)",
    email: "quant@apexalpha.com.np",
    phone: "+977-01-4428900",
    dematNumber: "1301010000000582",
    currentTier: "Enterprise",
    status: "Active",
    billingCycle: "Yearly",
    registeredAt: "2024-11-01",
    expiresAt: "2027-11-01",
    totalPaidNpr: 250000,
    paymentGateway: "Direct Bank",
    portfolioValuationNpr: 185000000,
    tradesLogged: 1240,
    lastLoginAt: "Just now",
  },
  {
    id: "cli-105",
    name: "Kripa Thapa",
    email: "kripa.thapa@hotmail.com",
    phone: "+977-9867112233",
    dematNumber: "1301120000994321",
    currentTier: "Pro",
    status: "Expired",
    billingCycle: "Monthly",
    registeredAt: "2026-03-10",
    expiresAt: "2026-10-10",
    totalPaidNpr: 4497,
    paymentGateway: "Khalti",
    portfolioValuationNpr: 890000,
    tradesLogged: 32,
    lastLoginAt: "5 days ago",
  },
  {
    id: "cli-106",
    name: "Dinesh Silwal",
    email: "dinesh.silwal@outlook.com",
    phone: "+977-9849988776",
    dematNumber: "1301550000332211",
    currentTier: "Free",
    status: "Suspended",
    billingCycle: "Complimentary",
    registeredAt: "2026-04-12",
    expiresAt: "2026-09-01",
    totalPaidNpr: 0,
    paymentGateway: "eSewa",
    portfolioValuationNpr: 120000,
    tradesLogged: 5,
    lastLoginAt: "2 weeks ago",
  },
];

// ----------------------------------------------------------------------------
// 5. System Telemetry & Audit Logs
// ----------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Suspended" | "Pending";
  tier: "Free" | "Pro" | "Premium";
  createdAt: string;
}

export interface DataProviderStatus {
  name: string;
  endpoint: string;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  latencyMs: number;
  lastSync: string;
  recordsSyncedToday: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  category: "FEE_SCHEDULE" | "USER_MANAGEMENT" | "AI_MODEL" | "SECURITY" | "SUBSCRIPTION_PLAN" | "AD_CAMPAIGN" | "FLOORSHEET" | "BROKER_INTELLIGENCE";
  previousValue?: string;
  newValue?: string;
}

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr-1",
    name: "Siddhartha Sharma",
    email: "superadmin@nepseintelligence.ai",
    role: "Super Admin",
    status: "Active",
    tier: "Premium",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "usr-2",
    name: "Aarav Adhikari",
    email: "risk@nepseintelligence.ai",
    role: "Financial Analyst",
    status: "Active",
    tier: "Premium",
    createdAt: "2024-03-12T00:00:00Z",
  },
  {
    id: "usr-3",
    name: "Prashant Karki",
    email: "compliance@nepseintelligence.ai",
    role: "Trader",
    status: "Active",
    tier: "Pro",
    createdAt: "2024-05-18T00:00:00Z",
  },
];

export const INITIAL_DATA_PROVIDERS: DataProviderStatus[] = [
  {
    name: "NEPSE Official Market Data Stream",
    endpoint: "wss://api.nepalstock.com/v1/live",
    status: "ONLINE",
    latencyMs: 38,
    lastSync: "Verified Live (0s)",
    recordsSyncedToday: 68420,
  },
  {
    name: "SEBON Company Disclosures Gateway",
    endpoint: "https://disclosures.sebon.gov.np/feed",
    status: "ONLINE",
    latencyMs: 94,
    lastSync: "1 min ago",
    recordsSyncedToday: 1840,
  },
  {
    name: "CDSC Clearing & Settlement Registry",
    endpoint: "https://dp.cdsc.com.np/api/v2",
    status: "ONLINE",
    latencyMs: 52,
    lastSync: "3 mins ago",
    recordsSyncedToday: 9120,
  },
  {
    name: "Nepal Rastra Bank (NRB) Monetary Liquidity Feed",
    endpoint: "https://nrb.org.np/api/macro/liquidity",
    status: "ONLINE",
    latencyMs: 120,
    lastSync: "10 mins ago",
    recordsSyncedToday: 420,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-11-12T08:30:00+05:45",
    adminEmail: "superadmin@nepseintelligence.ai",
    action: "Updated SEBON regulatory fee schedule to 0.015%",
    category: "FEE_SCHEDULE",
    previousValue: "0.015%",
    newValue: "0.015% (Audited & Verified)",
  },
  {
    id: "log-2",
    timestamp: "2026-11-12T07:15:00+05:45",
    adminEmail: "superadmin@nepseintelligence.ai",
    action: "Deployed Multi-Agent Neural Consensus Engine v3.8",
    category: "AI_MODEL",
    previousValue: "Single-ensemble v3.4",
    newValue: "5-Agent Consensus with Monte Carlo simulation",
  },
  {
    id: "log-3",
    timestamp: "2026-11-11T16:45:00+05:45",
    adminEmail: "superadmin@nepseintelligence.ai",
    action: "Approved Broker 58 Top Banner Ad Campaign",
    category: "AD_CAMPAIGN",
    previousValue: "Draft",
    newValue: "Live (Target: Free Tier)",
  },
  {
    id: "log-4",
    timestamp: "2026-11-10T11:20:00+05:45",
    adminEmail: "superadmin@nepseintelligence.ai",
    action: "Upgraded client Rajan Shrestha to Institutional Alpha",
    category: "SUBSCRIPTION_PLAN",
    previousValue: "Pro Plan",
    newValue: "Institutional Alpha (Paid via ConnectIPS)",
  },
];

// ----------------------------------------------------------------------------
// Local Storage Persistence Helpers
// ----------------------------------------------------------------------------

const STORAGE_KEYS = {
  ADMIN_SESSION: "nepse_admin_session_v1",
  PLANS: "nepse_subscription_plans_v1",
  ADS: "nepse_ad_campaigns_v1",
  CLIENTS: "nepse_clients_v1",
  AUDIT: "nepse_audit_logs_v1",
  USER_TIER: "nepse_active_user_tier_v1",
};

export function loadSavedSession(): AdminSession {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null, token: null, expiresAt: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load admin session", e);
  }
  return { isAuthenticated: false, user: null, token: null, expiresAt: null };
}

export function saveSession(session: AdminSession) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save admin session", e);
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  } catch (e) {
    console.error("Failed to clear admin session", e);
  }
}

export function loadSubscriptionPlans(): SubscriptionPlan[] {
  if (typeof window === "undefined") return INITIAL_SUBSCRIPTION_PLANS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load plans", e);
  }
  return INITIAL_SUBSCRIPTION_PLANS;
}

export function saveSubscriptionPlans(plans: SubscriptionPlan[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error("Failed to save plans", e);
  }
}

export function loadAdCampaigns(): AdCampaign[] {
  if (typeof window === "undefined") return INITIAL_AD_CAMPAIGNS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load ads", e);
  }
  return INITIAL_AD_CAMPAIGNS;
}

export function saveAdCampaigns(ads: AdCampaign[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
  } catch (e) {
    console.error("Failed to save ads", e);
  }
}

export function loadClients(): ClientSubscriber[] {
  if (typeof window === "undefined") return INITIAL_CLIENT_SUBSCRIBERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load clients", e);
  }
  return INITIAL_CLIENT_SUBSCRIBERS;
}

export function saveClients(clients: ClientSubscriber[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error("Failed to save clients", e);
  }
}

export function loadUserTier(): "free" | "pro" | "premium" {
  if (typeof window === "undefined") return "free";
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_TIER);
    if (raw === "pro" || raw === "premium" || raw === "free") return raw;
  } catch (e) {
    console.error("Failed to load user tier", e);
  }
  return "free";
}

export function saveUserTier(tier: "free" | "pro" | "premium") {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_TIER, tier);
  } catch (e) {
    console.error("Failed to save user tier", e);
  }
}
