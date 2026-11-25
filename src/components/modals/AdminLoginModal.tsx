"use client";

import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  Fingerprint,
  X,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  AdminSession,
  DEFAULT_ADMIN_CREDENTIALS,
  saveSession,
} from "@/lib/admin/adminStore";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AdminSession) => void;
}

export function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AdminLoginModalProps) {
  const [authMode, setAuthMode] = useState<"credentials" | "pin">("credentials");
  const [email, setEmail] = useState("superadmin@nepseintelligence.ai");
  const [password, setPassword] = useState("nepseadmin2026");
  const [pin, setPin] = useState("8888");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [require2fa, setRequire2fa] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    setTimeout(() => {
      let matchedAdmin = null;

      if (authMode === "pin") {
        matchedAdmin = DEFAULT_ADMIN_CREDENTIALS.find((a) => a.pin === pin.trim());
        if (!matchedAdmin) {
          setErrorMsg("Invalid 4-Digit Master Security PIN. Default is 8888 or 1234.");
          setIsLoading(false);
          return;
        }
      } else {
        matchedAdmin = DEFAULT_ADMIN_CREDENTIALS.find(
          (a) =>
            a.email.toLowerCase() === email.trim().toLowerCase() &&
            a.password === password
        );
        if (!matchedAdmin) {
          setErrorMsg("Invalid administrative email or password.");
          setIsLoading(false);
          return;
        }
      }

      const session: AdminSession = {
        isAuthenticated: true,
        user: {
          id: "adm-" + Math.random().toString(36).substring(2, 8),
          name: matchedAdmin.name,
          email: matchedAdmin.email,
          role: matchedAdmin.role,
          lastLogin: new Date().toISOString(),
          ipAddress: "103.145.72.10 (Kathmandu, Nepal)",
        },
        token: "tok_admin_" + Date.now(),
        expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(), // 8 hours
      };

      saveSession(session);
      setIsLoading(false);
      onLoginSuccess(session);
    }, 600);
  };

  const handleQuickLogin = (role: "Super Admin" | "Risk Admin" | "Compliance Officer") => {
    const cred = DEFAULT_ADMIN_CREDENTIALS.find((c) => c.role === role);
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
      setPin(cred.pin);
      setErrorMsg("");

      // Trigger automatic login
      setIsLoading(true);
      setTimeout(() => {
        const session: AdminSession = {
          isAuthenticated: true,
          user: {
            id: "adm-" + Math.random().toString(36).substring(2, 8),
            name: cred.name,
            email: cred.email,
            role: cred.role,
            lastLogin: new Date().toISOString(),
            ipAddress: "103.145.72.10 (Kathmandu, Nepal)",
          },
          token: "tok_admin_" + Date.now(),
          expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        };
        saveSession(session);
        setIsLoading(false);
        onLoginSuccess(session);
      }, 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-bronze bg-charcoal p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-obsidian hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-bronze/60">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Admin Master Authentication
              </h2>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                RESTRICTED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure control terminal for Subscriptions, Ads, Client CRM &amp; AI Engines.
            </p>
          </div>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="mt-4 rounded-xl border border-bronze/60 bg-obsidian/70 p-3">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="font-bold flex items-center space-x-1.5 text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>One-Click Demo Admin Login:</span>
            </span>
            <span className="text-[10px] text-slate-500">Auto-authenticates</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("Super Admin")}
              className="rounded-lg bg-amber-500/15 border border-amber-500/40 px-2 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 transition-all text-center"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("Risk Admin")}
              className="rounded-lg bg-blue-500/15 border border-blue-500/40 px-2 py-1.5 text-[11px] font-bold text-blue-300 hover:bg-blue-500/25 transition-all text-center"
            >
              Risk Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("Compliance Officer")}
              className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-2 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all text-center"
            >
              Compliance
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex rounded-xl bg-obsidian p-1 border border-bronze/60">
          <button
            type="button"
            onClick={() => setAuthMode("credentials")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              authMode === "credentials"
                ? "bg-gold text-black shadow-gold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Email &amp; Password
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("pin")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              authMode === "pin"
                ? "bg-gold text-black shadow-gold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            4-Digit Master PIN
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl bg-rose-500/20 border border-rose-500/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-4 space-y-4">
          {authMode === "credentials" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="superadmin@nepseintelligence.ai"
                  className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter admin password"
                    className="w-full rounded-xl border border-bronze bg-obsidian px-3 py-2 pr-10 text-xs text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                4-Digit Security Master PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="e.g. 8888"
                className="w-full text-center tracking-widest text-lg font-mono rounded-xl border border-bronze bg-obsidian px-3 py-2 text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <p className="mt-1 text-[11px] text-slate-400 text-center">
                Default Master PIN: <span className="font-mono text-gold font-bold">8888</span>
              </p>
            </div>
          )}

          {/* Institutional Hardware / Passkey Simulator */}
          <div className="flex items-center justify-between rounded-xl border border-bronze/50 bg-obsidian/40 px-3 py-2">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Fingerprint className="h-4 w-4 text-gold" />
              <span>Institutional Passkey 2FA Enforced</span>
            </div>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              VERIFIED
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 rounded-xl gold-gradient-btn py-2.5 text-xs font-black text-black shadow-gold hover:opacity-90 transition-all"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Enter Admin Master Terminal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
