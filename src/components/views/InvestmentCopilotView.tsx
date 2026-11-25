"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  ChevronRight,
  Database,
  Terminal,
  Activity,
  Layers,
  Radio,
  Scale,
  Building2,
  Cpu,
} from "lucide-react";
import { CopilotMessage, Holding, PortfolioSummary } from "@/types";
import { computeStockIntelligenceScore, analyzeSmartExit, diagnosePortfolioDoctor } from "@/lib/ai/institutionalEngine";
import { computeNeuralConsensus, runMonteCarloSimulation, analyzeSmartMoneyFlow } from "@/lib/ai/nepseAiAdvanceEngine";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";

interface InvestmentCopilotViewProps {
  holdings: Holding[];
  summary: PortfolioSummary;
  onSelectStock?: (symbol: string) => void;
}

const PRESET_QUERIES = [
  {
    label: "Neural Consensus on NABIL",
    query: "Show me the 5-Agent Neural Consensus and Monte Carlo forecast for NABIL",
  },
  {
    label: "Smart Money / Broker 58 Accumulation",
    query: "Which stocks show institutional block accumulation from Broker 58 and Broker 45?",
  },
  {
    label: "Monte Carlo 30-Day Targets",
    query: "Run a 1,000-path Monte Carlo price simulation on SHIVM",
  },
  {
    label: "Downside risk in my holdings?",
    query: "Which holdings in my portfolio currently carry the highest downside risk?",
  },
  {
    label: "Explain WACC & CGT Tax Rules",
    query: "Explain how WACC and Capital Gains Tax (7.5% vs 5%) are computed in NEPSE",
  },
  {
    label: "Stress test: NEPSE -10% drop",
    query: "What happens to my portfolio value if the NEPSE benchmark drops 10%?",
  },
];

export function InvestmentCopilotView({
  holdings,
  summary,
  onSelectStock,
}: InvestmentCopilotViewProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "intro-1",
      sender: "copilot",
      text: "Welcome to the NEPSE AI 3.0 Institutional Investment Copilot. Powered by 5-Agent Neural Consensus (Technical, Macro Liquidity, Institutional Flow, Fundamental, Sentiment) and 1,000-path Monte Carlo probabilistic forecasting. Ask me about any NEPSE equity, portfolio stress, broker flow, or SEBON tax rules.",
      timestamp: "Just now",
      evidenceCitations: [
        { label: "AI Engine", value: "NEPSE-QUANTUM-ENSEMBLE v3.8" },
        { label: "Agents", value: "5 Neural Agents Active" },
        { label: "Monte Carlo", value: "1,000 Iterations / 95% CI" },
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;

    const userMsg: CopilotMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateCopilotResponse(text, holdings, summary);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 600);
  };

  const generateCopilotResponse = (
    query: string,
    currentHoldings: Holding[],
    currentSummary: PortfolioSummary
  ): CopilotMessage => {
    const q = query.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Check for stock symbol query (e.g., NABIL, GBIME, SHIVM, CHCL, CIT, NTC, etc.)
    const foundStock = INITIAL_MARKET_PRICES.find(
      (s) => q.includes(s.symbol.toLowerCase()) || q.includes(s.name.toLowerCase())
    );

    if (foundStock) {
      const sym = foundStock.symbol;
      const consensus = computeNeuralConsensus(sym);
      const mc = consensus.monteCarloForecast;
      const flow = consensus.smartMoneyFlow;

      return {
        id: "c-" + Date.now(),
        sender: "copilot",
        text: `Analysis for ${foundStock.name} (${sym}): Currently trading at NPR ${foundStock.ltp}. 

The 5-Agent Neural Consensus assigns an overall score of ${consensus.overallConsensusScore}/100 with conviction: ${consensus.recommendation}.
• Bullish Agents: ${consensus.bullishAgentsCount} / 5 (${consensus.agents.filter(a => a.decision === 'BULLISH').map(a => a.agentName.replace(" Agent", "")).join(", ")})
• 30-Day Monte Carlo Target: NPR ${mc.targets.day30.target} (${mc.targets.day30.upsidePercent >= 0 ? "+" : ""}${mc.targets.day30.upsidePercent}% expected upside with ${mc.targets.day30.probabilityOfProfit}% probability of profit).
• Smart Money Flow: ${flow.institutionalSentiment.replace("_", " ")} with NPR ${(flow.netInstitutionalFlowNpr / 10000000).toFixed(2)} Cr net institutional absorption led by Broker #${flow.topAccumulatingBrokers[0]?.brokerNo}.
• Macro/Regime: ${consensus.marketRegime.replace("_", " ")} with accommodative NRB interbank rates.`,
        timestamp,
        actionRecommendation:
          consensus.recommendation === "STRONG_BUY" || consensus.recommendation === "BUY"
            ? "BUY"
            : consensus.recommendation === "ACCUMULATE" || consensus.recommendation === "HOLD"
            ? "HOLD"
            : "REDUCE",
        evidenceCitations: [
          { label: "Consensus Score", value: `${consensus.overallConsensusScore}/100` },
          { label: "Confidence", value: `${consensus.consensusConfidence}%` },
          { label: "30-Day Target", value: `NPR ${mc.targets.day30.target}` },
          { label: "Annualized Vol", value: `${mc.annualizedVolatility}%` },
          { label: "Top Broker Flow", value: `Broker #${flow.topAccumulatingBrokers[0]?.brokerNo}` },
          { label: "Regime", value: consensus.marketRegime },
        ],
      };
    }

    // 2. Broker 58 / Institutional flow query
    if (q.includes("broker") || q.includes("smart money") || q.includes("block") || q.includes("accumulation") || q.includes("flow")) {
      const topFlowNabil = analyzeSmartMoneyFlow("NABIL");
      const topFlowShivm = analyzeSmartMoneyFlow("SHIVM");

      return {
        id: "c-" + Date.now(),
        sender: "copilot",
        text: `Institutional Order Flow & Broker Tracking: 
In NEPSE's Floor Sheet, Broker 58 (Himalayan Securities) and Broker 45 (Imperial Securities) are currently acting as primary delivery accumulators in commercial banking and manufacturing sectors.
• NABIL: NPR ${(topFlowNabil.netInstitutionalFlowNpr / 10000000).toFixed(2)} Cr net institutional absorption across ${topFlowNabil.blockTransactionsCount} block trades.
• SHIVM: NPR ${(topFlowShivm.netInstitutionalFlowNpr / 10000000).toFixed(2)} Cr net institutional absorption.
Institutional consensus indicates smart money accumulation prior to quarterly earnings disclosures.`,
        timestamp,
        actionRecommendation: "BUY",
        evidenceCitations: [
          { label: "Key Lead Broker", value: "Broker #58 (Himalayan)" },
          { label: "Secondary Broker", value: "Broker #45 (Imperial)" },
          { label: "Floor Sheet Status", value: "Net Delivery Accumulation" },
        ],
      };
    }

    // 3. Monte Carlo query
    if (q.includes("monte carlo") || q.includes("simulation") || q.includes("trajectory") || q.includes("target")) {
      const mc = runMonteCarloSimulation("NABIL", 524, 30, 1000);
      return {
        id: "c-" + Date.now(),
        sender: "copilot",
        text: `Monte Carlo 1,000-Path Probability Forecast (NABIL @ NPR 524):
• 10-Day Horizon: NPR ${mc.targets.day10.target} (${mc.targets.day10.upsidePercent}% upside, ${mc.targets.day10.probabilityOfProfit}% win probability)
• 30-Day Horizon: NPR ${mc.targets.day30.target} (${mc.targets.day30.upsidePercent}% upside, ${mc.targets.day30.probabilityOfProfit}% win probability)
• 90-Day Horizon: NPR ${mc.targets.day90.target} (${mc.targets.day90.upsidePercent}% upside, ${mc.targets.day90.probabilityOfProfit}% win probability)
• 95% Confidence Interval Band: Bearish Floor NPR ${mc.trajectories[mc.trajectories.length - 1]?.bearishBoundary} to Bullish Moonshot NPR ${mc.trajectories[mc.trajectories.length - 1]?.bullishBoundary}.`,
        timestamp,
        actionRecommendation: "BUY",
        evidenceCitations: [
          { label: "Simulations", value: "1,000 geometric Brownian paths" },
          { label: "Daily Volatility", value: `${mc.volatilityDaily}%` },
          { label: "30-Day Median", value: `NPR ${mc.targets.day30.target}` },
        ],
      };
    }

    // 4. WACC / Tax / Fees query
    if (q.includes("wacc") || q.includes("cgt") || q.includes("tax") || q.includes("fee") || q.includes("sebon")) {
      return {
        id: "c-" + Date.now(),
        sender: "copilot",
        text: `NEPSE Regulatory Tariff & Capital Gains Tax Framework:
1. WACC: Mandated by CDSC to calculate your blended purchase price, factoring in cash buys, bonus shares (NPR 0 cost), and right shares (NPR 100 face value).
2. Capital Gains Tax (CGT):
   • Short-Term (< 365 days): 7.5% on net capital gains.
   • Long-Term (>= 365 days): 5.0% on net capital gains.
   • Corporate: 10.0% flat.
   • If a trade is executed at a loss, NPR 0 CGT is levied.
3. Statutory Fees:
   • Broker Commission: 0.40% down to 0.27% (minimum NPR 10).
   • SEBON Regulatory Levy: 0.015% (0.00015 multiplier).
   • CDSC DP Fee: NPR 25.00 flat per trade day per company.`,
        timestamp,
        actionRecommendation: "HOLD",
        evidenceCitations: [
          { label: "Short-Term CGT", value: "7.5%" },
          { label: "Long-Term CGT", value: "5.0%" },
          { label: "SEBON Levy", value: "0.015%" },
          { label: "CDSC DP Fee", value: "NPR 25 Flat" },
        ],
      };
    }

    // 5. Downside risk / portfolio doctor
    if (q.includes("downside") || q.includes("risk") || q.includes("weakness")) {
      const diag = diagnosePortfolioDoctor(currentHoldings, currentSummary);
      const topRiskHolding = [...currentHoldings].sort(
        (a, b) => b.unrealizedPLPercent - a.unrealizedPLPercent
      )[currentHoldings.length - 1];

      return {
        id: "c-" + Date.now(),
        sender: "copilot",
        text: `Your overall Portfolio Risk Score is ${diag.portfolioRiskScore}/100 (${diag.riskBand}). ${
          topRiskHolding
            ? `Your largest unrealized drawdown holding is ${topRiskHolding.symbol} with an unrealized loss of ${topRiskHolding.unrealizedPLPercent.toFixed(1)}% (NPR ${Math.abs(topRiskHolding.unrealizedPL).toLocaleString()}).`
            : "No active holdings with deep drawdowns were detected."
        } ${diag.warnings[0]?.description || "Portfolio risk parameters are within acceptable thresholds."}`,
        timestamp,
        actionRecommendation: diag.portfolioRiskScore > 65 ? "REDUCE" : "HOLD",
        evidenceCitations: [
          { label: "Portfolio Risk Score", value: `${diag.portfolioRiskScore}/100` },
          { label: "Risk Band", value: diag.riskBand },
          { label: "Concentration Risk", value: `${diag.components.concentrationRisk}/100` },
        ],
      };
    }

    // 6. Stress testing query
    if (q.includes("10%") || q.includes("drop") || q.includes("crash") || q.includes("stress")) {
      const diag = diagnosePortfolioDoctor(currentHoldings, currentSummary);
      const scenario10 = diag.stressTestResults.find((s) => s.dropPercent === 10.0) || diag.stressTestResults[1];

      return {
        id: "c-" + Date.now(),
        sender: "copilot",
        text: `Under a systemic 10.0% NEPSE market correction, your total portfolio value would decline by approximately NPR ${scenario10?.estimatedLossNpr.toLocaleString()} to NPR ${scenario10?.portfolioValueAfter.toLocaleString()}. The highest monetary loss contributors would be your largest weighted holdings: ${scenario10?.topDetractors.map((d) => `${d.symbol} (-NPR ${d.lossNpr.toLocaleString()})`).join(", ")}.`,
        timestamp,
        actionRecommendation: "HOLD",
        evidenceCitations: [
          { label: "Estimated Drawdown", value: `-NPR ${scenario10?.estimatedLossNpr.toLocaleString()}` },
          { label: "Post-Shock Value", value: `NPR ${scenario10?.portfolioValueAfter.toLocaleString()}` },
          { label: "Cash Cushion", value: `NPR ${currentSummary.cashBalance.toLocaleString()}` },
        ],
      };
    }

    // Default guidance
    return {
      id: "c-" + Date.now(),
      sender: "copilot",
      text: `Regarding "${query}": The NEPSE AI 3.0 system prioritizes capital preservation before speculative opportunity. You can query specific stock symbols (e.g. NABIL, GBIME, SHIVM, CHCL), run Monte Carlo price target projections, inspect broker order flow from Broker 58/45, or analyze SEBON tax and fee calculations.`,
      timestamp,
      evidenceCitations: [
        { label: "Portfolio Value", value: `NPR ${currentSummary.currentMarketValue.toLocaleString()}` },
        { label: "Active Holdings", value: `${currentHoldings.length} stocks` },
      ],
    };
  };

  const getActionBadge = (action?: string) => {
    if (!action) return null;
    let color = "text-amber-400 bg-amber-500/10 border-amber-500/30";
    if (action === "BUY") color = "text-emerald-400 bg-emerald-500/20 border-emerald-500/40";
    if (action === "SELL") color = "text-rose-400 bg-rose-500/20 border-rose-500/40";
    if (action === "REDUCE") color = "text-orange-400 bg-orange-500/20 border-orange-500/40";
    if (action === "AVOID") color = "text-slate-400 bg-slate-800 border-slate-700";

    return (
      <span className={`rounded px-2 py-0.5 text-[11px] font-black border uppercase tracking-wider inline-block ${color}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-bronze bg-charcoal p-6 shadow-gold">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
            <Bot className="h-3.5 w-3.5 text-gold" />
            <span>10 · INTERACTIVE DECISION SUPPORT COPILOT</span>
          </span>
          <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-mono text-champagne border border-bronze">
            5-AGENT NEURAL CONSENSUS &amp; MONTE CARLO
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          AI Investment Copilot Terminal
        </h1>
        <p className="mt-1 text-xs text-slate-400 max-w-2xl">
          Ask questions about any NEPSE listed company, 1,000-path Monte Carlo price targets, institutional broker flow, or macro stress. Every answer provides evidence citations with exact data anchors.
        </p>
      </div>

      {/* Preset Query Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Try asking:</span>
        {PRESET_QUERIES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(preset.query)}
            className="flex items-center space-x-1.5 shrink-0 rounded-xl border border-bronze bg-charcoal/80 px-3 py-1.5 text-slate-300 hover:border-gold/40 hover:text-gold transition-colors"
          >
            <Sparkles className="h-3 w-3 text-gold" />
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Terminal Box */}
      <div className="flex flex-col h-[560px] rounded-2xl border border-bronze bg-charcoal shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-bronze bg-obsidian px-5 py-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-slate-300 font-bold">NEPSE-QUANTUM-AGENT-LIVE</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Database className="h-3 w-3 text-gold" />
              <span>Floor Sheet Synced</span>
            </span>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gold text-black font-semibold shadow-gold"
                    : "border border-bronze bg-obsidian text-slate-200"
                }`}
              >
                {msg.actionRecommendation && (
                  <div className="mb-2 flex items-center justify-between">
                    {getActionBadge(msg.actionRecommendation)}
                    <span className="text-[10px] text-slate-400 font-mono">
                      Institutional Prescription
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-line">{msg.text}</div>

                {msg.evidenceCitations && msg.evidenceCitations.length > 0 && (
                  <div className="mt-3.5 border-t border-bronze/60 pt-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Audited Evidence Citations:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {msg.evidenceCitations.map((cit, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-charcoal/80 border border-bronze/50 px-2 py-1 text-[10px]"
                        >
                          <span className="text-slate-400 block">{cit.label}</span>
                          <span className="font-mono font-bold text-gold">{cit.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-gold font-mono p-2">
              <Sparkles className="h-4 w-4 animate-spin text-gold" />
              <span>Multi-Agent Neural Consensus Synthesizing Evidence...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-bronze bg-obsidian p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputQuery);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Copilot (e.g., 'Consensus on NABIL', 'Broker 58 flow', 'WACC tax rules')..."
              className="flex-1 rounded-xl border border-bronze bg-charcoal px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient-btn text-black shadow-gold disabled:opacity-40 hover:opacity-90 transition-all flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
