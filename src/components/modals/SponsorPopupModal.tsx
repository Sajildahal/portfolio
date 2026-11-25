// ============================================================================
// Institutional Sponsor & Partner First-Visit Popup Modal
// Displays verified partner announcements with customizable dismissal intervals
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ExternalLink,
  X,
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  AdCampaign,
  loadAdCampaigns,
  saveAdCampaigns,
  loadUserTier,
} from "@/lib/admin/adminStore";

interface SponsorPopupModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function SponsorPopupModal({ forceOpen = false, onClose }: SponsorPopupModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAd, setActiveAd] = useState<AdCampaign | null>(null);
  const [dismissDurationDays, setDismissDurationDays] = useState<number>(1);
  const [doNotShowAgain, setDoNotShowAgain] = useState(true);

  useEffect(() => {
    // If user is Pro/Premium/Enterprise, skip sponsor modal
    const userTier = loadUserTier();
    if (!forceOpen && (userTier === "pro" || userTier === "premium" || (userTier as any) === "enterprise")) {
      return;
    }

    // Check dismissal cookie/localStorage
    if (!forceOpen && typeof window !== "undefined") {
      const dismissedUntil = localStorage.getItem("nepse_sponsor_dismissed_until");
      if (dismissedUntil && parseInt(dismissedUntil, 10) > Date.now()) {
        return;
      }
    }

    // Load campaigns
    const ads = loadAdCampaigns();
    // Look for first-visit-popup placement first, else active prominent campaign
    let target = ads.find((a) => a.isActive && (a.placement as string) === "first-visit-popup");
    if (!target) {
      target = ads.find((a) => a.isActive);
    }

    if (target || forceOpen) {
      setActiveAd(
        target || {
          id: "ad-default-sponsor",
          title: "Licensed NEPSE Clearing Brokerage",
          sponsorName: "Himalayan Securities (Broker 58)",
          sponsorCategory: "Brokerage",
          placement: "first-visit-popup" as any,
          targetAudience: "all-users",
          headline: "Zero Demat AMC & Direct High-Speed TMS Trading Execution",
          subtext:
            "Experience sub-second order placement, instant collateral top-up via ConnectIPS, and verified institutional research commentary directly in your trading portal.",
          callToAction: "Open Online Account (Zero AMC)",
          targetUrl: "https://broker58.com.np",
          badgeLabel: "EXCLUSIVE PARTNER",
          backgroundColor: "#0d1322",
          accentColor: "#D4AF37",
          isActive: true,
          impressionsCount: 1540,
          clicksCount: 89,
          startDate: "2026-11-01",
          endDate: "2026-12-31",
        }
      );

      // Increment impressions count
      if (target) {
        const updated = ads.map((a) =>
          a.id === target.id ? { ...a, impressionsCount: a.impressionsCount + 1 } : a
        );
        saveAdCampaigns(updated);
      }

      // Small delay on first visit for smooth entrance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, forceOpen ? 50 : 800);

      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleDismiss = () => {
    if (doNotShowAgain && typeof window !== "undefined") {
      const expiry = Date.now() + dismissDurationDays * 24 * 60 * 60 * 1000;
      localStorage.setItem("nepse_sponsor_dismissed_until", expiry.toString());
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleActionClick = () => {
    if (activeAd) {
      const ads = loadAdCampaigns();
      const updated = ads.map((a) =>
        a.id === activeAd.id ? { ...a, clicksCount: a.clicksCount + 1 } : a
      );
      saveAdCampaigns(updated);

      if (activeAd.targetUrl) {
        window.open(activeAd.targetUrl, "_blank", "noopener,noreferrer");
      }
    }
    handleDismiss();
  };

  if (!isOpen || !activeAd) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-gold/40 bg-gradient-to-b from-[#111726] to-[#0A0E17] p-6 sm:p-7 shadow-2xl shadow-gold/10 overflow-hidden text-white">
        {/* Glow ambient background effect */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-all z-10"
          title="Close announcement"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Category & Verified Badge */}
        <div className="flex items-center space-x-2 text-xs mb-3">
          <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-gold border border-gold/40 flex items-center space-x-1">
            <Sparkles className="h-3 w-3 mr-1" />
            <span>{activeAd.badgeLabel || "SPONSORED PARTNER"}</span>
          </span>
          <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Verified SEBON Licensed Entity</span>
          </span>
        </div>

        {/* Sponsor Name & Headline */}
        <div className="space-y-2 mt-1">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {activeAd.sponsorName}
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {activeAd.headline}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            {activeAd.subtext}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="my-5 grid grid-cols-2 gap-2.5 rounded-xl border border-bronze/60 bg-obsidian/70 p-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/20 text-gold font-bold">
              ✓
            </div>
            <span className="text-slate-200 font-medium">Direct TMS Bridge</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 font-bold">
              ✓
            </div>
            <span className="text-slate-200 font-medium">Instant Collateral</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-400 font-bold">
              ✓
            </div>
            <span className="text-slate-200 font-medium">Zero Demat AMC</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-400 font-bold">
              ✓
            </div>
            <span className="text-slate-200 font-medium">Institutional Research</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleActionClick}
            className="w-full flex items-center justify-center space-x-2 rounded-xl gold-gradient-btn py-3 text-sm font-black text-black shadow-gold hover:opacity-95 transition-all"
          >
            <span>{activeAd.callToAction}</span>
            <ExternalLink className="h-4 w-4" />
          </button>

          {/* Dismiss Options */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-bronze/50 gap-2 text-[11px] text-slate-400">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={doNotShowAgain}
                onChange={(e) => setDoNotShowAgain(e.target.checked)}
                className="rounded accent-amber-500 h-3.5 w-3.5"
              />
              <span>Don't show this announcement for:</span>
              <select
                value={dismissDurationDays}
                onChange={(e) => setDismissDurationDays(parseInt(e.target.value, 10))}
                className="bg-obsidian border border-bronze rounded px-1.5 py-0.5 text-white font-bold text-[10px]"
              >
                <option value={1}>24 Hours</option>
                <option value={3}>3 Days</option>
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </label>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors underline font-medium"
            >
              Continue to NEPSE Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
