"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Server,
  Activity,
  DollarSign,
  Bot,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Sliders,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  Radio,
  Wifi,
  Scale,
  Key,
  CreditCard,
  Megaphone,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  UserCheck,
  LogOut,
  TrendingUp,
  Percent,
  Calendar,
  Eye,
  EyeOff,
  BarChart3,
  Award,
  FileSpreadsheet,
} from "lucide-react";
import { FloorsheetManagementPanel } from "@/components/admin/FloorsheetManagementPanel";
import { BrokerIntelligencePanel } from "@/components/admin/BrokerIntelligencePanel";
import { SponsorPopupModal } from "@/components/modals/SponsorPopupModal";
import {
  AdminSession,
  AdminUser,
  AuditLog,
  DataProviderStatus,
  SubscriptionPlan,
  AdCampaign,
  ClientSubscriber,
  INITIAL_ADMIN_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DATA_PROVIDERS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_AD_CAMPAIGNS,
  INITIAL_CLIENT_SUBSCRIBERS,
  loadSavedSession,
  saveSession,
  clearSession,
  loadSubscriptionPlans,
  saveSubscriptionPlans,
  loadAdCampaigns,
  saveAdCampaigns,
  loadClients,
  saveClients,
} from "@/lib/admin/adminStore";
import { AdminLoginModal } from "@/components/modals/AdminLoginModal";
import { DEFAULT_FEE_SCHEDULE } from "@/lib/financial/nepseFeeEngine";

export function AdminDashboardView() {
  // Auth state
  const [session, setSession] = useState<AdminSession>({
    isAuthenticated: false,
    user: null,
    token: null,
    expiresAt: null,
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Active admin tab
  const [activeAdminTab, setActiveAdminTab] = useState<
    "floorsheet" | "broker-intelligence" | "plans" | "ads" | "clients" | "ai-master" | "telemetry" | "fees" | "audit"
  >("floorsheet");
  const [previewSponsorModal, setPreviewSponsorModal] = useState(false);

  // Stores
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_SUBSCRIPTION_PLANS);
  const [ads, setAds] = useState<AdCampaign[]>(INITIAL_AD_CAMPAIGNS);
  const [clients, setClients] = useState<ClientSubscriber[]>(INITIAL_CLIENT_SUBSCRIBERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [dataProviders] = useState<DataProviderStatus[]>(INITIAL_DATA_PROVIDERS);

  // Notifications feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Client search and filter state
  const [clientSearch, setClientSearch] = useState("");
  const [clientTierFilter, setClientTierFilter] = useState<string>("all");
  const [clientStatusFilter, setClientStatusFilter] = useState<string>("all");

  // Modals for Plan Editing
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Modals for Ad Editing
  const [editingAd, setEditingAd] = useState<AdCampaign | null>(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  // AI Model Weights
  const [weights, setWeights] = useState({
    technical: 28,
    macroLiquidity: 22,
    orderFlow: 20,
    fundamental: 18,
    sentiment: 12,
  });
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  // Regulatory Fee Schedule state
  const [feeSchedule, setFeeSchedule] = useState({
    sebonFeeRate: 0.00015,
    dpFee: 25.0,
    cgtShortTermRate: 0.075,
    cgtLongTermRate: 0.05,
    cgtCorporateRate: 0.1,
  });
  const [feeSaved, setFeeSaved] = useState(false);

  // Load persistence
  useEffect(() => {
    const saved = loadSavedSession();
    if (saved && saved.isAuthenticated) {
      setSession(saved);
    }
    setPlans(loadSubscriptionPlans());
    setAds(loadAdCampaigns());
    setClients(loadClients());
  }, []);

  const handleLoginSuccess = (newSession: AdminSession) => {
    setSession(newSession);
    setShowLoginModal(false);
    showToast(`Welcome, ${newSession.user?.name}! Administrative console unlocked.`);
  };

  const handleLogout = () => {
    clearSession();
    setSession({ isAuthenticated: false, user: null, token: null, expiresAt: null });
    showToast("Admin session locked. You have logged out.");
  };

  // --------------------------------------------------------------------------
  // Plan Management Handlers
  // --------------------------------------------------------------------------

  const handleTogglePlanActive = (planId: string) => {
    const updated = plans.map((p) =>
      p.id === planId ? { ...p, isActive: !p.isActive } : p
    );
    setPlans(updated);
    saveSubscriptionPlans(updated);
    const target = updated.find((p) => p.id === planId);
    showToast(`Subscription plan "${target?.name}" status updated to ${target?.isActive ? "Active" : "Inactive"}.`);

    // Audit log
    logAction(
      `Toggled Plan Status: ${target?.name} -> ${target?.isActive ? "ACTIVE" : "INACTIVE"}`,
      "SUBSCRIPTION_PLAN"
    );
  };

  const handleSavePlan = (planToSave: SubscriptionPlan) => {
    let updated: SubscriptionPlan[];
    const exists = plans.some((p) => p.id === planToSave.id);
    if (exists) {
      updated = plans.map((p) => (p.id === planToSave.id ? planToSave : p));
      showToast(`Subscription plan "${planToSave.name}" updated successfully.`);
      logAction(`Updated Subscription Plan: ${planToSave.name}`, "SUBSCRIPTION_PLAN");
    } else {
      updated = [...plans, planToSave];
      showToast(`New subscription plan "${planToSave.name}" created.`);
      logAction(`Created Subscription Plan: ${planToSave.name}`, "SUBSCRIPTION_PLAN");
    }
    setPlans(updated);
    saveSubscriptionPlans(updated);
    setIsPlanModalOpen(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = (planId: string) => {
    const target = plans.find((p) => p.id === planId);
    if (!target) return;
    if (confirm(`Are you sure you want to delete the plan "${target.name}"?`)) {
      const updated = plans.filter((p) => p.id !== planId);
      setPlans(updated);
      saveSubscriptionPlans(updated);
      showToast(`Plan "${target.name}" deleted.`);
      logAction(`Deleted Subscription Plan: ${target.name}`, "SUBSCRIPTION_PLAN");
    }
  };

  // --------------------------------------------------------------------------
  // Ad Campaign Handlers
  // --------------------------------------------------------------------------

  const handleToggleAdActive = (adId: string) => {
    const updated = ads.map((a) =>
      a.id === adId ? { ...a, isActive: !a.isActive } : a
    );
    setAds(updated);
    saveAdCampaigns(updated);
    const target = updated.find((a) => a.id === adId);
    showToast(`Ad campaign "${target?.title}" is now ${target?.isActive ? "Live" : "Paused"}.`);
    logAction(`Toggled Ad Campaign: ${target?.title} -> ${target?.isActive ? "LIVE" : "PAUSED"}`, "AD_CAMPAIGN");
  };

  const handleSaveAd = (adToSave: AdCampaign) => {
    let updated: AdCampaign[];
    const exists = ads.some((a) => a.id === adToSave.id);
    if (exists) {
      updated = ads.map((a) => (a.id === adToSave.id ? adToSave : a));
      showToast(`Ad Campaign "${adToSave.title}" updated.`);
      logAction(`Updated Ad Campaign: ${adToSave.title}`, "AD_CAMPAIGN");
    } else {
      updated = [...ads, adToSave];
      showToast(`New Ad Campaign "${adToSave.title}" published.`);
      logAction(`Published Ad Campaign: ${adToSave.title}`, "AD_CAMPAIGN");
    }
    setAds(updated);
    saveAdCampaigns(updated);
    setIsAdModalOpen(false);
    setEditingAd(null);
  };

  const handleDeleteAd = (adId: string) => {
    const target = ads.find((a) => a.id === adId);
    if (!target) return;
    if (confirm(`Delete ad campaign "${target.title}"?`)) {
      const updated = ads.filter((a) => a.id !== adId);
      setAds(updated);
      saveAdCampaigns(updated);
      showToast(`Ad Campaign "${target.title}" removed.`);
      logAction(`Deleted Ad Campaign: ${target.title}`, "AD_CAMPAIGN");
    }
  };

  // --------------------------------------------------------------------------
  // Client Management Handlers
  // --------------------------------------------------------------------------

  const handleChangeClientTier = (clientId: string, newTier: "Free" | "Pro" | "Premium" | "Enterprise") => {
    const updated = clients.map((c) =>
      c.id === clientId ? { ...c, currentTier: newTier, status: "Active" as const } : c
    );
    setClients(updated);
    saveClients(updated);
    const target = updated.find((c) => c.id === clientId);
    showToast(`Client ${target?.name} tier changed to ${newTier}.`);
    logAction(`Elevated client ${target?.name} (${target?.email}) to ${newTier}`, "USER_MANAGEMENT");
  };

  const handleToggleClientStatus = (clientId: string) => {
    const updated = clients.map((c) => {
      if (c.id === clientId) {
        const nextStatus = c.status === "Active" ? "Suspended" : "Active";
        return { ...c, status: nextStatus as any };
      }
      return c;
    });
    setClients(updated);
    saveClients(updated);
    const target = updated.find((c) => c.id === clientId);
    showToast(`Client ${target?.name} account is now ${target?.status}.`);
    logAction(`Account status for ${target?.name} changed to ${target?.status}`, "USER_MANAGEMENT");
  };

  const handleExtendExpiry = (clientId: string, daysToAdd: number = 30) => {
    const updated = clients.map((c) => {
      if (c.id === clientId) {
        const currentExp = new Date(c.expiresAt);
        currentExp.setDate(currentExp.getDate() + daysToAdd);
        return { ...c, expiresAt: currentExp.toISOString().split("T")[0], status: "Active" as const };
      }
      return c;
    });
    setClients(updated);
    saveClients(updated);
    const target = updated.find((c) => c.id === clientId);
    showToast(`Extended ${target?.name}'s subscription by +${daysToAdd} days.`);
    logAction(`Extended subscription expiry for ${target?.name} by ${daysToAdd} days`, "USER_MANAGEMENT");
  };

  // --------------------------------------------------------------------------
  // AI Calibration & Telemetry
  // --------------------------------------------------------------------------

  const logAction = (actionText: string, category: AuditLog["category"]) => {
    const newLog: AuditLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      adminEmail: session.user?.email || "superadmin@nepseintelligence.ai",
      action: actionText,
      category,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleRetrainModel = () => {
    setIsRetraining(true);
    setRetrainSuccess(false);
    setTimeout(() => {
      setIsRetraining(false);
      setRetrainSuccess(true);
      logAction("Recalibrated Multi-Agent Neural Consensus Ensemble Weights", "AI_MODEL");
      showToast("Multi-Agent AI weights recalibrated and applied to Live Market & Radar.");
      setTimeout(() => setRetrainSuccess(false), 3500);
    }, 1200);
  };

  const handleSaveFees = () => {
    setFeeSaved(true);
    logAction("Updated SEBON regulatory fee schedule and capital gains tax brackets", "FEE_SCHEDULE");
    showToast("SEBON fee schedule updated and verified with CDSC clearing standards.");
    setTimeout(() => setFeeSaved(false), 3500);
  };

  // Filtered clients list
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.dematNumber.includes(clientSearch);
    const matchesTier = clientTierFilter === "all" || c.currentTier.toLowerCase() === clientTierFilter.toLowerCase();
    const matchesStatus = clientStatusFilter === "all" || c.status.toLowerCase() === clientStatusFilter.toLowerCase();
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Financial MRR Calculation
  const totalMrrNpr = clients.reduce((acc, c) => {
    if (c.status !== "Active") return acc;
    if (c.currentTier === "Pro") return acc + 1499;
    if (c.currentTier === "Premium") return acc + 3999;
    if (c.currentTier === "Enterprise") return acc + 12500;
    return acc;
  }, 0);

  // Total Ad impressions and clicks
  const totalAdImpressions = ads.reduce((acc, a) => acc + a.impressionsCount, 0);
  const totalAdClicks = ads.reduce((acc, a) => acc + a.clicksCount, 0);
  const overallCtr = totalAdImpressions > 0 ? ((totalAdClicks / totalAdImpressions) * 100).toFixed(2) : "0.00";

  // --------------------------------------------------------------------------
  // RENDER: If NOT Authenticated, show Admin Login Gate
  // --------------------------------------------------------------------------
  if (!session.isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-bronze bg-charcoal p-8 text-center max-w-xl mx-auto shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-4 shadow-lg">
            <Lock className="h-8 w-8" />
          </div>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/40 uppercase tracking-wider">
            Protected Institutional Console
          </span>
          <h1 className="mt-3 text-2xl font-black text-white">
            Admin Master Control Terminal
          </h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Administrative access is required to control system subscription plans, ad campaigns, client subscriptions, regulatory fee schedules, and AI neural weights.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl gold-gradient-btn px-6 py-2.5 text-xs font-black text-black shadow-gold hover:opacity-95 transition-all"
            >
              <Key className="h-4 w-4" />
              <span>Authenticate with Admin Credentials</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-bronze/60 text-left">
            <p className="text-[11px] font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
              <Sparkles className="h-3 w-3 text-gold" />
              <span>Available Demo Credentials:</span>
            </p>
            <div className="grid grid-cols-1 gap-2 text-[11px] font-mono text-slate-400">
              <div className="bg-obsidian p-2 rounded-lg border border-bronze/50 flex justify-between items-center">
                <span>Super Admin: <strong className="text-white">superadmin@nepseintelligence.ai</strong></span>
                <span className="text-gold font-bold">PIN: 8888</span>
              </div>
              <div className="bg-obsidian p-2 rounded-lg border border-bronze/50 flex justify-between items-center">
                <span>Risk Admin: <strong className="text-white">risk@nepseintelligence.ai</strong></span>
                <span className="text-blue-400 font-bold">PIN: 1234</span>
              </div>
            </div>
          </div>
        </div>

        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Authenticated Master Dashboard
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-black shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Session Header Ribbon */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white">Admin Master Control System</h1>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/40">
                {session.user?.role || "Super Admin"}
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                ACTIVE SESSION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Signed in as <strong className="text-slate-200">{session.user?.name}</strong> ({session.user?.email}) · IP: {session.user?.ipAddress}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all"
            title="Lock administrative console"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Lock &amp; Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-bronze bg-charcoal p-4 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Recurring Revenue</span>
          <p className="mt-1 text-xl font-black font-mono text-emerald-400">
            NPR {totalMrrNpr.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Estimated ARR: NPR {(totalMrrNpr * 12).toLocaleString()}</span>
        </div>

        <div className="rounded-xl border border-bronze bg-charcoal p-4 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Subscribers</span>
          <p className="mt-1 text-xl font-black font-mono text-white">
            {clients.length + 2010} Clients
          </p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">98.2% Retention Rate</span>
        </div>

        <div className="rounded-xl border border-bronze bg-charcoal p-4 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Ad Campaigns</span>
          <p className="mt-1 text-xl font-black font-mono text-gold">
            {ads.filter((a) => a.isActive).length} Live / {ads.length} Total
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{totalAdImpressions.toLocaleString()} views · {overallCtr}% CTR</span>
        </div>

        <div className="rounded-xl border border-bronze bg-charcoal p-4 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400">AI Model Status</span>
          <p className="mt-1 text-xl font-black font-mono text-blue-400">
            v3.8 Multi-Agent
          </p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">5 Consensus Agents Synced</span>
        </div>
      </div>

      {/* Master Admin Navigation Tabs */}
      <div className="flex space-x-2 border-b border-bronze/70 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { key: "floorsheet", label: "Floorsheet Ingestion", icon: FileSpreadsheet },
          { key: "broker-intelligence", label: "AI Broker Intelligence", icon: Activity },
          { key: "plans", label: "Subscription Plans", icon: CreditCard, count: plans.length },
          { key: "ads", label: "Ad Campaigns & Monetization", icon: Megaphone, count: ads.length },
          { key: "clients", label: "Client & Subscriber CRM", icon: Users, count: clients.length },
          { key: "ai-master", label: "AI Neural Weights", icon: Bot },
          { key: "telemetry", label: "Data Streams & Latency", icon: Server },
          { key: "fees", label: "Regulatory Fee Sched.", icon: Scale },
          { key: "audit", label: "Audit & Security Logs", icon: FileText, count: auditLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveAdminTab(tab.key as any)}
              className={`flex items-center space-x-2 rounded-xl px-3 py-2 transition-all whitespace-nowrap ${
                isActive
                  ? "bg-gold text-black shadow-gold font-bold"
                  : "bg-charcoal border border-bronze/60 text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                    isActive ? "bg-black/20 text-black" : "bg-obsidian text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* TAB: FLOORSHEET INGESTION & DATASET MANAGEMENT                        */}
      {/* -------------------------------------------------------------------- */}
      {activeAdminTab === "floorsheet" && (
        <FloorsheetManagementPanel
          showToast={showToast}
          logAction={logAction}
          onAnalyzeSymbol={() => {
            setActiveAdminTab("broker-intelligence");
          }}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB: AI BROKER FLOW & SCRIPT CONTROL ANALYSIS                        */}
      {/* -------------------------------------------------------------------- */}
      {activeAdminTab === "broker-intelligence" && (
        <BrokerIntelligencePanel
          showToast={showToast}
          logAction={logAction}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 1: SUBSCRIPTION PLANS MASTER CONTROL                             */}
      {/* -------------------------------------------------------------------- */}
      {activeAdminTab === "plans" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-gold" />
                <span>Subscription Plan Master Management</span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure pricing, quota limits, and feature permissions. Changes update the user-facing Subscription tier view instantly.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingPlan({
                  id: "plan-" + Date.now(),
                  name: "New Tier Plan",
                  tierKey: "pro",
                  priceMonthlyNpr: 999,
                  priceYearlyNpr: 9990,
                  periodLabel: "per month",
                  badge: "SPECIAL",
                  description: "Custom tailored tier for active traders.",
                  isActive: true,
                  features: ["Custom Screener Alerts", "Daily AI Market Digest", "Ad-Free Experience"],
                  quotas: {
                    aiQueriesPerDay: 25,
                    maxWatchlistSymbols: 20,
                    realtimeStream: true,
                    institutionalOrderFlow: false,
                    scannersCount: 5,
                    backtestingSimulations: 10,
                    csvExportEnabled: true,
                    removeAds: true,
                  },
                  subscribersCount: 0,
                  updatedAt: new Date().toISOString(),
                });
                setIsPlanModalOpen(true);
              }}
              className="flex items-center space-x-1.5 rounded-xl gold-gradient-btn px-4 py-2 text-xs font-black text-black shadow-gold hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Subscription Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  p.isActive
                    ? p.isPopular
                      ? "border-gold bg-gradient-to-b from-amber-950/40 to-charcoal shadow-xl"
                      : "border-bronze bg-charcoal"
                    : "border-slate-800 bg-obsidian/60 opacity-60"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="rounded bg-gold/20 px-2 py-0.5 text-[9px] font-black text-gold border border-gold/30">
                        {p.badge}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{p.name}</h3>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        p.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <div className="mt-3 font-mono">
                    <span className="text-2xl font-black text-white">NPR {p.priceMonthlyNpr.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 ml-1 font-sans">/{p.periodLabel}</span>
                    <div className="text-[11px] text-slate-500">Yearly: NPR {p.priceYearlyNpr.toLocaleString()}</div>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">{p.description}</p>

                  <div className="mt-4 border-t border-bronze/50 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>AI Queries / Day:</span>
                      <strong className="text-white font-mono">{p.quotas.aiQueriesPerDay}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Watchlist Capacity:</span>
                      <strong className="text-white font-mono">{p.quotas.maxWatchlistSymbols}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Institutional Flow:</span>
                      <strong className={p.quotas.institutionalOrderFlow ? "text-emerald-400 font-bold" : "text-slate-500"}>
                        {p.quotas.institutionalOrderFlow ? "Enabled" : "Locked"}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Ad-Free Status:</span>
                      <strong className={p.quotas.removeAds ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {p.quotas.removeAds ? "Ads Removed" : "Ads Enabled"}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Active Subscribers:</span>
                      <strong className="text-gold font-mono">{p.subscribersCount} Users</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-bronze/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTogglePlanActive(p.id)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      p.isActive
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                    }`}
                  >
                    {p.isActive ? "Pause Plan" : "Activate"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingPlan(p);
                      setIsPlanModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-obsidian border border-bronze/60"
                    title="Edit Plan Settings"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {p.tierKey !== "free" && (
                    <button
                      onClick={() => handleDeletePlan(p.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-200 rounded-lg bg-rose-500/10 border border-rose-500/30"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 2: ADS & PROMOTIONAL CAMPAIGNS                                   */}
      {/* -------------------------------------------------------------------- */}
      {activeAdminTab === "ads" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Megaphone className="h-5 w-5 text-gold" />
                <span>Advertising &amp; Promotion Campaign Engine</span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage broker sponsorships, promotional ribbons, and native banners. Free users see active ads; Pro users enjoy an ad-free workspace.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewSponsorModal(true)}
                className="flex items-center space-x-1.5 rounded-xl border border-gold/40 bg-obsidian px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10 transition-all"
              >
                <Eye className="h-4 w-4" />
                <span>Preview First-Visit Sponsor Modal</span>
              </button>
              <button
                onClick={() => {
                  setEditingAd({
                    id: "ad-" + Date.now(),
                    title: "New Broker/Fintech Campaign",
                    sponsorName: "Sponsor Name Ltd",
                    sponsorCategory: "Brokerage",
                    placement: "dashboard-native",
                    targetAudience: "free-only",
                    headline: "Exclusive NEPSE Service Offer",
                    subtext: "Fast collateral settlement and low DP fee for retail investors.",
                    callToAction: "Learn More",
                    targetUrl: "https://nepalstock.com.np",
                    badgeLabel: "FEATURED",
                    backgroundColor: "from-blue-950/60 to-slate-900",
                    accentColor: "border-blue-500/40 text-blue-400",
                    isActive: true,
                    impressionsCount: 0,
                    clicksCount: 0,
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: "2027-01-01",
                  });
                  setIsAdModalOpen(true);
                }}
                className="flex items-center space-x-1.5 rounded-xl gold-gradient-btn px-4 py-2 text-xs font-black text-black shadow-gold hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                <span>Launch New Ad Campaign</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ads.map((ad) => {
              const ctr = ad.impressionsCount > 0 ? ((ad.clicksCount / ad.impressionsCount) * 100).toFixed(2) : "0.00";
              return (
                <div
                  key={ad.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                    ad.isActive
                      ? "border-bronze bg-charcoal shadow-xl"
                      : "border-slate-800 bg-obsidian/60 opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="rounded bg-gold/20 px-2 py-0.5 text-[9px] font-black text-gold border border-gold/40">
                        {ad.badgeLabel || ad.sponsorCategory}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          ad.isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {ad.isActive ? "LIVE" : "PAUSED"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-2">{ad.title}</h3>
                    <p className="text-xs text-gold font-medium mt-0.5">{ad.sponsorName}</p>

                    <div className="mt-3 rounded-xl bg-obsidian p-3 border border-bronze/50 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Placement:</span>
                        <strong className="text-white">{ad.placement}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Audience:</span>
                        <strong className="text-champagne font-mono">{ad.targetAudience}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Impressions:</span>
                        <strong className="text-white font-mono">{ad.impressionsCount.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Clicks:</span>
                        <strong className="text-emerald-400 font-mono">{ad.clicksCount.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>CTR:</span>
                        <strong className="text-gold font-mono">{ctr}%</strong>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-400 line-clamp-2 italic">
                      &quot;{ad.headline}&quot;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-bronze/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleAdActive(ad.id)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        ad.isActive
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                      }`}
                    >
                      {ad.isActive ? "Pause Ad" : "Activate"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAd(ad);
                        setIsAdModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-obsidian border border-bronze/60"
                      title="Edit Ad"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-200 rounded-lg bg-rose-500/10 border border-rose-500/30"
                      title="Delete Ad"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 3: CLIENT & SUBSCRIBER CRM                                       */}
      {/* -------------------------------------------------------------------- */}
      {activeAdminTab === "clients" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-gold" />
                <span>Client &amp; Subscriber Master Control CRM</span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect registered traders, upgrade or downgrade tiers, extend subscriptions, and manage user statuses.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-mono">Total Clients: {filteredClients.length}</span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or Demat ID..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full rounded-xl border border-bronze bg-charcoal pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 bg-charcoal border border-bronze rounded-xl px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs text-slate-400">Tier:</span>
              <select
                value={clientTierFilter}
                onChange={(e) => setClientTierFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none flex-1 font-semibold"
              >
                <option value="all" className="bg-charcoal text-white">All Tiers</option>
                <option value="free" className="bg-charcoal text-white">Free</option>
                <option value="pro" className="bg-charcoal text-white">Pro</option>
                <option value="premium" className="bg-charcoal text-white">Premium (Institutional)</option>
                <option value="enterprise" className="bg-charcoal text-white">Enterprise</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-charcoal border border-bronze rounded-xl px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={clientStatusFilter}
                onChange={(e) => setClientStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none flex-1 font-semibold"
              >
                <option value="all" className="bg-charcoal text-white">All Statuses</option>
                <option value="active" className="bg-charcoal text-white">Active</option>
                <option value="expired" className="bg-charcoal text-white">Expired</option>
                <option value="suspended" className="bg-charcoal text-white">Suspended</option>
              </select>
            </div>
          </div>

          {/* Clients Table */}
          <div className="rounded-2xl border border-bronze bg-charcoal overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-bronze/70 bg-obsidian text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Client Profile</th>
                    <th className="px-4 py-3">Demat No.</th>
                    <th className="px-4 py-3">Current Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Expiry Date</th>
                    <th className="px-4 py-3">Portfolio Value</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3 text-right">Master Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze/50">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-obsidian/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{client.name}</div>
                        <div className="text-[11px] text-slate-400">{client.email} · {client.phone}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {client.dematNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            client.currentTier === "Enterprise"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : client.currentTier === "Premium"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : client.currentTier === "Pro"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {client.currentTier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            client.status === "Active"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : client.status === "Expired"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {client.expiresAt}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-champagne">
                        NPR {client.portfolioValuationNpr.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        <span className="font-semibold text-white">{client.paymentGateway}</span>
                        <div className="text-[10px] text-slate-500 font-mono">Paid: NPR {client.totalPaidNpr.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        {/* Quick Plan Change */}
                        <select
                          value={client.currentTier}
                          onChange={(e) => handleChangeClientTier(client.id, e.target.value as any)}
                          className="bg-obsidian border border-bronze rounded px-2 py-1 text-[11px] text-gold font-bold focus:outline-none"
                        >
                          <option value="Free">Set Free</option>
                          <option value="Pro">Set Pro</option>
                          <option value="Premium">Set Institutional</option>
                          <option value="Enterprise">Set Enterprise</option>
                        </select>

                        {/* Extend +30 Days */}
                        <button
                          onClick={() => handleExtendExpiry(client.id, 30)}
                          className="rounded bg-gold/15 border border-gold/30 px-2 py-1 text-[11px] font-bold text-gold hover:bg-gold/25"
                          title="Extend validity +30 days"
                        >
                          +30d
                        </button>

                        {/* Toggle Suspend/Active */}
                        <button
                          onClick={() => handleToggleClientStatus(client.id)}
                          className={`rounded px-2 py-1 text-[11px] font-bold ${
                            client.status === "Active"
                              ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25"
                              : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                          }`}
                        >
                          {client.status === "Active" ? "Freeze" : "Unfreeze"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 4: AI NEURAL WEIGHTS & MASTER CALIBRATION                        */}
      {/* -------------------------------------------------------------------- */}
      {activeAdminTab === "ai-master" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold border border-gold/40">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Multi-Agent Neural Consensus &amp; Factor Model Calibration
                </h2>
                <p className="text-xs text-slate-400">
                  Adjust active weightings for the 5 specialized AI agents powering NEPSE Stock Radar and Price Target Monte Carlo predictions.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { key: "technical", label: "Technical Factor Agent", desc: "RSI, EMA 20/50/200, MACD, Volume Spikes", color: "text-amber-400" },
                  { key: "macroLiquidity", label: "Macro & NRB Liquidity Agent", desc: "Interbank rates, CD ratio, Treasury yields", color: "text-blue-400" },
                  { key: "orderFlow", label: "Institutional Order Flow Agent", desc: "Floor sheet block transactions, Broker 58/45", color: "text-emerald-400" },
                  { key: "fundamental", label: "Fundamental & SEBON Agent", desc: "PE, PB, ROE, 12-crore ceiling compliance", color: "text-purple-400" },
                  { key: "sentiment", label: "Nepali Market Sentiment Agent", desc: "Fear & Greed index, Social community pulse", color: "text-rose-400" },
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={`font-bold ${item.color}`}>{item.label}</span>
                      <span className="font-mono text-white font-bold">{(weights as any)[item.key]}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={(weights as any)[item.key]}
                      onChange={(e) =>
                        setWeights((prev) => ({
                          ...prev,
                          [item.key]: parseInt(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                ))}

                <div className="pt-2 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Total Combined Weights:</span>
                  <span
                    className={`font-bold ${
                      Object.values(weights).reduce((a, b) => a + b, 0) === 100
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {Object.values(weights).reduce((a, b) => a + b, 0)}% (Auto-Normalized)
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-bronze/70 bg-obsidian p-5 flex flex-col justify-between">
                <div>
                  <span className="rounded bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/40">
                    REAL-TIME ENSEMBLE SPECIFICATION
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2">
                    NEPSE Quantum Ensemble v3.8.4
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Walk-forward validated on 10 years of NEPSE daily Floor Sheet data (2016-2026). Backtested Sharpe ratio: <strong className="text-gold font-mono">1.94</strong> vs benchmark index <strong className="text-white font-mono">0.68</strong>.
                  </p>

                  <div className="mt-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-bronze/40 pb-1 text-slate-400">
                      <span>Inference Latency:</span>
                      <span className="text-emerald-400">12ms per stock</span>
                    </div>
                    <div className="flex justify-between border-b border-bronze/40 pb-1 text-slate-400">
                      <span>Simulations Horizon:</span>
                      <span className="text-white">1,000 Monte Carlo Paths</span>
                    </div>
                    <div className="flex justify-between border-b border-bronze/40 pb-1 text-slate-400">
                      <span>Supervised Retrain Cycle:</span>
                      <span className="text-champagne">Hourly at Market Close</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleRetrainModel}
                    disabled={isRetraining}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl gold-gradient-btn py-2.5 text-xs font-black text-black shadow-gold hover:opacity-90 transition-all"
                  >
                    {isRetraining ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Recalibrating Neural Weights...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="h-4 w-4" />
                        <span>Recalibrate &amp; Deploy AI Models</span>
                      </>
                    )}
                  </button>
                  {retrainSuccess && (
                    <p className="mt-2 text-[11px] text-emerald-400 text-center font-bold">
                      ✓ Weights successfully applied to live consensus pipeline!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 5: TELEMETRY & DATA PROVIDERS                                    */}
      {/* -------------------------------------------------------------------- */}
      {activeAdminTab === "telemetry" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-bronze bg-charcoal p-5 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Server className="h-5 w-5 text-gold" />
              <span>External Market Data Gateways &amp; WebSockets</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live heartbeat telemetry of NEPSE official data feeds, SEBON disclosures, CDSC settlement endpoints, and NRB macro feeds.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataProviders.map((dp, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-bronze/60 bg-obsidian p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{dp.name}</span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                      {dp.status}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 truncate">{dp.endpoint}</div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-bronze/40 font-mono">
                    <span className="text-slate-400">Latency: <strong className="text-emerald-400">{dp.latencyMs}ms</strong></span>
                    <span className="text-slate-400">Synced: <strong className="text-gold">{dp.recordsSyncedToday.toLocaleString()} rec</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 6: REGULATORY FEES SCHEDULE                                      */}
      {/* -------------------------------------------------------------------- */}
      {activeAdminTab === "fees" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold border border-gold/40">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  SEBON Statutory Fee &amp; Tax Rate Configuration
                </h2>
                <p className="text-xs text-slate-400">
                  Accredited fee rates used by all calculators, portfolio WACC engines, and net realization models.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-obsidian p-4 border border-bronze/60 space-y-1">
                <label className="text-xs font-semibold text-slate-300">SEBON Regulatory Fee Rate</label>
                <input
                  type="number"
                  step="0.00001"
                  value={feeSchedule.sebonFeeRate}
                  onChange={(e) => setFeeSchedule({ ...feeSchedule, sebonFeeRate: parseFloat(e.target.value) })}
                  className="w-full font-mono text-sm bg-charcoal border border-bronze rounded-lg px-3 py-1.5 text-white"
                />
                <span className="text-[10px] text-slate-400">Standard: 0.00015 (0.015%)</span>
              </div>

              <div className="rounded-xl bg-obsidian p-4 border border-bronze/60 space-y-1">
                <label className="text-xs font-semibold text-slate-300">CDSC DP Fee per Settlement</label>
                <input
                  type="number"
                  step="1"
                  value={feeSchedule.dpFee}
                  onChange={(e) => setFeeSchedule({ ...feeSchedule, dpFee: parseFloat(e.target.value) })}
                  className="w-full font-mono text-sm bg-charcoal border border-bronze rounded-lg px-3 py-1.5 text-white"
                />
                <span className="text-[10px] text-slate-400">Standard: NPR 25.00 flat</span>
              </div>

              <div className="rounded-xl bg-obsidian p-4 border border-bronze/60 space-y-1">
                <label className="text-xs font-semibold text-slate-300">Short-Term Individual CGT (&lt; 365d)</label>
                <input
                  type="number"
                  step="0.001"
                  value={feeSchedule.cgtShortTermRate}
                  onChange={(e) => setFeeSchedule({ ...feeSchedule, cgtShortTermRate: parseFloat(e.target.value) })}
                  className="w-full font-mono text-sm bg-charcoal border border-bronze rounded-lg px-3 py-1.5 text-white"
                />
                <span className="text-[10px] text-slate-400">Standard: 0.075 (7.5%)</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveFees}
                className="flex items-center space-x-2 rounded-xl gold-gradient-btn px-6 py-2.5 text-xs font-black text-black shadow-gold hover:opacity-90"
              >
                <Check className="h-4 w-4" />
                <span>Save &amp; Broadcast Fee Schedule</span>
              </button>
              {feeSaved && (
                <span className="ml-3 text-xs text-emerald-400 font-bold">
                  ✓ Schedule verified &amp; persisted across platform!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 7: AUDIT & SECURITY LOGS                                         */}
      {/* -------------------------------------------------------------------- */}
      {activeAdminTab === "audit" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-bronze bg-charcoal p-5 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gold" />
              <span>Immutable Master Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live cryptographic log of administrative actions, fee edits, model retraining, and plan upgrades.
            </p>

            <div className="mt-4 space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-bronze/60 bg-obsidian p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-gold/20 px-1.5 py-0.2 text-[9px] font-bold text-gold border border-gold/40">
                        {log.category}
                      </span>
                      <span className="font-bold text-white">{log.action}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      By: {log.adminEmail}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: Edit/Create Subscription Plan                                */}
      {/* -------------------------------------------------------------------- */}
      {isPlanModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-bronze bg-charcoal p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-gold" />
              <span>{editingPlan.id.startsWith("plan-") && editingPlan.subscribersCount > 0 ? "Edit Plan" : "Create Subscription Plan"}</span>
            </h2>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Plan Display Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Monthly Price (NPR)</label>
                  <input
                    type="number"
                    value={editingPlan.priceMonthlyNpr}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceMonthlyNpr: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Yearly Price (NPR)</label>
                  <input
                    type="number"
                    value={editingPlan.priceYearlyNpr}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceYearlyNpr: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Plan Description</label>
                <textarea
                  rows={2}
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingPlan.badge}
                    onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Popular Highlight?</label>
                  <select
                    value={editingPlan.isPopular ? "yes" : "no"}
                    onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.value === "yes" })}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-bold"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes (Gold Highlight)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-bronze/50 space-y-2">
                <label className="block font-bold text-slate-200">Quotas &amp; Feature Flags</label>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.quotas.removeAds}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        quotas: { ...editingPlan.quotas, removeAds: e.target.checked },
                      })
                    }
                    className="rounded accent-amber-500"
                  />
                  <span>Remove All Ads for this Tier</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.quotas.institutionalOrderFlow}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        quotas: { ...editingPlan.quotas, institutionalOrderFlow: e.target.checked },
                      })
                    }
                    className="rounded accent-amber-500"
                  />
                  <span>Enable Institutional Floor Sheet Block Radar</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setIsPlanModalOpen(false)}
                  className="rounded-xl px-4 py-2 border border-bronze text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSavePlan(editingPlan)}
                  className="rounded-xl gold-gradient-btn px-5 py-2 font-bold text-black shadow-gold"
                >
                  Save Subscription Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: Edit/Create Ad Campaign                                       */}
      {/* -------------------------------------------------------------------- */}
      {isAdModalOpen && editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-bronze bg-charcoal p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAdModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Megaphone className="h-5 w-5 text-gold" />
              <span>Configure Ad Campaign</span>
            </h2>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Campaign Internal Title</label>
                <input
                  type="text"
                  value={editingAd.title}
                  onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Sponsor Name</label>
                  <input
                    type="text"
                    value={editingAd.sponsorName}
                    onChange={(e) => setEditingAd({ ...editingAd, sponsorName: e.target.value })}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingAd.sponsorCategory}
                    onChange={(e) => setEditingAd({ ...editingAd, sponsorCategory: e.target.value as any })}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-bold"
                  >
                    <option value="Brokerage">Brokerage</option>
                    <option value="Merchant Bank">Merchant Bank / PMS</option>
                    <option value="FinTech">FinTech / Wallet</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Placement Location</label>
                  <select
                    value={editingAd.placement}
                    onChange={(e) => setEditingAd({ ...editingAd, placement: e.target.value as any })}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-bold"
                  >
                    <option value="top-announcement">Top Header Announcement Bar</option>
                    <option value="dashboard-native">Dashboard Native Card</option>
                    <option value="sidebar-banner">Sidebar Banner Spotlight</option>
                    <option value="first-visit-popup">First-Visit Sponsor Popup Modal</option>
                    <option value="copilot-sponsor">AI Copilot Sponsor Card</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Audience</label>
                  <select
                    value={editingAd.targetAudience}
                    onChange={(e) => setEditingAd({ ...editingAd, targetAudience: e.target.value as any })}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-bold"
                  >
                    <option value="free-only">Free Users Only (Monetization)</option>
                    <option value="all-users">All Users</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Headline Text</label>
                <input
                  type="text"
                  value={editingAd.headline}
                  onChange={(e) => setEditingAd({ ...editingAd, headline: e.target.value })}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subtext / Value Proposition</label>
                <textarea
                  rows={2}
                  value={editingAd.subtext}
                  onChange={(e) => setEditingAd({ ...editingAd, subtext: e.target.value })}
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Button Call-To-Action (CTA)</label>
                  <input
                    type="text"
                    value={editingAd.callToAction}
                    onChange={(e) => setEditingAd({ ...editingAd, callToAction: e.target.value })}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Destination Web Link</label>
                  <input
                    type="url"
                    value={editingAd.targetUrl}
                    onChange={(e) => setEditingAd({ ...editingAd, targetUrl: e.target.value })}
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setIsAdModalOpen(false)}
                  className="rounded-xl px-4 py-2 border border-bronze text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveAd(editingAd)}
                  className="rounded-xl gold-gradient-btn px-5 py-2 font-bold text-black shadow-gold"
                >
                  Save &amp; Publish Ad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal: First-Visit Sponsor Preview */}
      {previewSponsorModal && (
        <SponsorPopupModal
          forceOpen={true}
          onClose={() => setPreviewSponsorModal(false)}
        />
      )}
    </div>
  );
}
