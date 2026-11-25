"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Sparkles,
  X,
  ShieldCheck,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  AdCampaign,
  loadAdCampaigns,
  saveAdCampaigns,
  loadUserTier,
} from "@/lib/admin/adminStore";

interface AdBannerWidgetProps {
  placement: "top-announcement" | "sidebar-banner" | "dashboard-native" | "copilot-sponsor";
  onUpgradeClick?: () => void;
  className?: string;
}

export function AdBannerWidget({
  placement,
  onUpgradeClick,
  className = "",
}: AdBannerWidgetProps) {
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [userTier, setUserTier] = useState<"free" | "pro" | "premium">("free");
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const loadedAds = loadAdCampaigns();
    setAds(loadedAds);
    setUserTier(loadUserTier());
  }, []);

  if (isDismissed) return null;

  // Filter ads for this placement & active status
  const matchingAds = ads.filter(
    (ad) =>
      ad.isActive &&
      ad.placement === placement &&
      (ad.targetAudience === "all-users" ||
        (ad.targetAudience === "free-only" && userTier === "free"))
  );

  if (matchingAds.length === 0) return null;

  // Pick the first active ad
  const activeAd = matchingAds[0];

  const handleAdClick = () => {
    // Record click
    const updated = ads.map((a) =>
      a.id === activeAd.id ? { ...a, clicksCount: a.clicksCount + 1 } : a
    );
    setAds(updated);
    saveAdCampaigns(updated);

    if (activeAd.targetUrl) {
      window.open(activeAd.targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Top Announcement Ribbon Style
  if (placement === "top-announcement") {
    return (
      <div
        className={`w-full bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-900/60 border-b border-gold/30 px-4 py-1.5 flex items-center justify-between text-xs text-white ${className}`}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <span className="flex-shrink-0 rounded bg-gold/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-gold border border-gold/40">
            {activeAd.badgeLabel || "SPONSORED"}
          </span>
          <p className="truncate font-medium text-slate-200">
            <span className="font-bold text-white mr-1.5">{activeAd.sponsorName}:</span>
            {activeAd.headline}
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
          <button
            onClick={handleAdClick}
            className="flex items-center space-x-1 rounded-lg bg-gold px-2.5 py-1 text-[11px] font-bold text-black hover:bg-gold/90 transition-all shadow-gold"
          >
            <span>{activeAd.callToAction}</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="hidden md:inline-flex items-center space-x-1 text-[10px] text-slate-400 hover:text-gold transition-colors"
              title="Remove ads by upgrading to Pro"
            >
              <Zap className="h-3 w-3 text-gold" />
              <span>Remove Ads</span>
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white transition-colors"
            title="Dismiss Announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Native Card Style
  if (placement === "dashboard-native") {
    return (
      <div
        className={`rounded-2xl border border-bronze bg-gradient-to-r ${activeAd.backgroundColor} p-5 shadow-xl transition-all relative overflow-hidden ${className}`}
      >
        <div className="absolute right-3 top-3 flex items-center space-x-2">
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="text-[10px] font-semibold text-slate-400 hover:text-gold transition-colors"
            >
              Pro removes ads
            </button>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="rounded bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/40">
                {activeAd.badgeLabel || "PARTNER SPOTLIGHT"}
              </span>
              <span className="text-xs font-bold text-slate-300">
                {activeAd.sponsorName}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              {activeAd.headline}
            </h3>
            <p className="text-xs text-slate-300">
              {activeAd.subtext}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAdClick}
              className="flex items-center space-x-1.5 rounded-xl gold-gradient-btn px-4 py-2 text-xs font-bold text-black shadow-gold hover:opacity-90 transition-all"
            >
              <span>{activeAd.callToAction}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Banner Style
  return (
    <div
      className={`rounded-xl border border-bronze/70 bg-gradient-to-b ${activeAd.backgroundColor} p-3 text-xs shadow-lg relative ${className}`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-gold border border-gold/30">
          {activeAd.badgeLabel || "SPONSORED"}
        </span>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <p className="font-bold text-white text-xs mt-1">{activeAd.headline}</p>
      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{activeAd.subtext}</p>

      <button
        onClick={handleAdClick}
        className="mt-2.5 w-full flex items-center justify-center space-x-1 rounded-lg bg-gold/20 border border-gold/40 py-1 text-[11px] font-bold text-gold hover:bg-gold hover:text-black transition-all"
      >
        <span>{activeAd.callToAction}</span>
        <ExternalLink className="h-3 w-3" />
      </button>
    </div>
  );
}
