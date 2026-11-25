"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  Lock,
  RefreshCw,
  Award,
  Wallet,
} from "lucide-react";
import {
  SubscriptionPlan,
  loadSubscriptionPlans,
  loadUserTier,
  saveUserTier,
} from "@/lib/admin/adminStore";

export function SubscriptionView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentTier, setCurrentTier] = useState<"free" | "pro" | "premium">("free");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan-pro");
  const [paymentProvider, setPaymentProvider] = useState<"esewa" | "khalti" | "connectips" | "fonepay">("esewa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setPlans(loadSubscriptionPlans().filter((p) => p.isActive));
    setCurrentTier(loadUserTier());
  }, []);

  const handleSelectUpgrade = (plan: SubscriptionPlan) => {
    if (plan.tierKey === currentTier) return;
    setSelectedPlanId(plan.id);

    if (plan.tierKey === "free") {
      saveUserTier("free");
      setCurrentTier("free");
      setToastMsg("Switched to Free Investor tier.");
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    // Process simulated gateway payment
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutSuccess(true);
      const newTier = plan.tierKey === "enterprise" ? "premium" : (plan.tierKey as "pro" | "premium");
      saveUserTier(newTier);
      setCurrentTier(newTier);
      setToastMsg(`Congratulations! Upgraded to ${plan.name} via ${paymentProvider.toUpperCase()}.`);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setToastMsg(null);
      }, 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-black shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-8 text-center max-w-3xl mx-auto shadow-2xl">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold border border-gold/40">
          <Sparkles className="h-3.5 w-3.5" />
          <span>NEPSE INSTITUTIONAL COMMERCIAL SUITE</span>
        </span>
        <h1 className="mt-3 text-3xl font-black text-white">Choose Your Edge in NEPSE</h1>
        <p className="mt-2 text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          Unlock verified real-time tick streaming, 9x breakout quantitative scanners, multi-agent AI neural consensus, and institutional order book block trade radar.
        </p>

        {/* Current Tier Badge */}
        <div className="mt-4 inline-flex items-center space-x-2 rounded-xl bg-obsidian px-3 py-1.5 border border-bronze/60 text-xs">
          <span className="text-slate-400">Your Active Tier:</span>
          <span className="font-bold text-gold uppercase">{currentTier} TIER</span>
          <span className="rounded bg-emerald-500/20 px-2 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
            ACTIVE
          </span>
        </div>

        {/* Billing Cycle Switcher */}
        <div className="mt-6 inline-flex rounded-xl bg-obsidian p-1 border border-bronze/60">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              billingCycle === "monthly"
                ? "bg-gold text-black shadow-gold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
              billingCycle === "yearly"
                ? "bg-gold text-black shadow-gold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="rounded bg-emerald-500 px-1.5 py-0.2 text-[9px] font-extrabold text-black">
              SAVE 17%
            </span>
          </button>
        </div>
      </div>

      {/* Payment Gateway Selector */}
      <div className="max-w-xl mx-auto rounded-xl border border-bronze/70 bg-charcoal p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-300 font-semibold flex items-center space-x-2">
          <Wallet className="h-4 w-4 text-gold" />
          <span>Nepal Payment Gateway:</span>
        </span>
        <div className="flex space-x-2">
          {[
            { id: "esewa", label: "eSewa" },
            { id: "khalti", label: "Khalti" },
            { id: "connectips", label: "ConnectIPS" },
            { id: "fonepay", label: "FonePay" },
          ].map((gw) => (
            <button
              key={gw.id}
              onClick={() => setPaymentProvider(gw.id as any)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                paymentProvider === gw.id
                  ? "bg-gold text-black shadow-gold"
                  : "bg-obsidian border border-bronze/60 text-slate-400 hover:text-white"
              }`}
            >
              {gw.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.tierKey === currentTier;
          const price = billingCycle === "monthly" ? plan.priceMonthlyNpr : plan.priceYearlyNpr;
          const periodText = billingCycle === "monthly" ? "/month" : "/year";

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 transition-all flex flex-col justify-between relative ${
                plan.isPopular
                  ? "border-2 border-gold bg-gradient-to-b from-amber-950/40 via-charcoal to-obsidian shadow-2xl"
                  : "border border-bronze bg-charcoal"
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-gold">
                  {plan.badge}
                </span>
              )}

              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  {!plan.isPopular && (
                    <span className="rounded bg-obsidian border border-bronze/60 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.description}</p>

                <div className="mt-4 font-mono">
                  <span className="text-2xl font-black text-white">NPR {price.toLocaleString()}</span>
                  <span className="text-slate-400 text-xs ml-1 font-sans">{periodText}</span>
                </div>

                {/* Quotas Box */}
                <div className="mt-4 rounded-xl bg-obsidian p-2.5 border border-bronze/50 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>AI Queries:</span>
                    <strong className="text-white font-mono">{plan.quotas.aiQueriesPerDay}/day</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Feed:</span>
                    <strong className={plan.quotas.realtimeStream ? "text-emerald-400" : "text-slate-400"}>
                      {plan.quotas.realtimeStream ? "Verified Live (0s)" : "EOD Delayed"}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Ads:</span>
                    <strong className={plan.quotas.removeAds ? "text-emerald-400 font-bold" : "text-amber-400"}>
                      {plan.quotas.removeAds ? "100% Ad-Free" : "Sponsored Ads"}
                    </strong>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-4 space-y-2 text-xs border-t border-bronze/50 pt-3">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <Check className="h-3.5 w-3.5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-[11px]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-bronze/60">
                <button
                  onClick={() => handleSelectUpgrade(plan)}
                  disabled={isCurrent || isProcessing}
                  className={`w-full py-2.5 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 ${
                    isCurrent
                      ? "bg-slate-800 text-slate-400 cursor-default border border-slate-700"
                      : plan.isPopular
                      ? "gold-gradient-btn text-black shadow-gold hover:opacity-90"
                      : "bg-obsidian border border-gold/40 text-gold hover:bg-gold hover:text-black"
                  }`}
                >
                  {isProcessing && selectedPlanId === plan.id ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Connecting {paymentProvider}...</span>
                    </>
                  ) : isCurrent ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Current Active Plan</span>
                    </>
                  ) : (
                    <>
                      <span>Upgrade with {paymentProvider.toUpperCase()}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guarantee & Institutional Trust Ribbon */}
      <div className="rounded-2xl border border-bronze/70 bg-charcoal p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="h-8 w-8 text-gold flex-shrink-0" />
          <div>
            <h4 className="font-bold text-white">SEBON Compliant Tariffs</h4>
            <p className="text-slate-400 text-[11px]">Calculations audited with official SEBON commission rules.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Lock className="h-8 w-8 text-gold flex-shrink-0" />
          <div>
            <h4 className="font-bold text-white">Bank-Grade 256-Bit SSL</h4>
            <p className="text-slate-400 text-[11px]">Instant settlement via ConnectIPS, eSewa &amp; Khalti gateways.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-gold flex-shrink-0" />
          <div>
            <h4 className="font-bold text-white">Institutional Support</h4>
            <p className="text-slate-400 text-[11px]">Direct broker API bridges for hedge funds and merchant desks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
