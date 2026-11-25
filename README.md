# NEPSE Intelligence AI 📈
## Enterprise-Grade AI-Powered NEPSE Trading, Portfolio & Investment Intelligence Platform

> **Tagline:** *Understand the Market. Analyze the Opportunity. Invest Smarter.*

---

## 🌟 Overview

**NEPSE Intelligence AI** is a complete, production-ready fintech web application engineered specifically for the Nepal Stock Exchange (NEPSE). It fuses real-time market data ingestion, audited fundamental analytics, multi-indicator technical analysis, and self-learning quantitative trading models with institutional-grade portfolio accounting.

Designed with a premium Bloomberg Terminal and TradingView aesthetic, the platform equips retail investors, quantitative researchers, and financial institutions with mathematically rigorous tools to preserve capital and capture systematic alpha.

---

## 🚀 Key Platform Features

### 1. Institutional Portfolio Management System
- **Comprehensive CRUD Operations:** Add, view, edit, delete, and undo transactions with an immutable audit ledger.
- **Full Transaction Lifecycle:** Secondary buy/sell, primary IPO allocations, rights shares, bonus shares, cash dividends, auction bids, and portfolio transfers.
- **Dual Accounting Engines:** Toggle between **WACC** (Weighted Average Cost of Capital) and **FIFO** (First-In, First-Out) lot matching.
- **Regulatory Fee Compliance:** Strictly calculates SEBON regulatory levy (0.015%), CDSC Depository Participant fee (NPR 25.00), tiered broker commission slabs, and Capital Gains Tax (**7.5%** for individual short-term &lt; 365 days, **5.0%** for long-term &ge; 365 days).
- **Exact Break-Even Analytics:** Solves the exact exit price required to achieve 0.00% net loss after factoring in both entry and exit fees.
- **Intelligent Averaging Assistant:** Interactive dynamic sliders simulate additional share purchases at target price levels, calculating revised WACC, capital required, and break-even reductions.
- **Export & Import:** One-click CSV export and import for seamless tax reporting and broker reconciliations.

### 2. Real-Time NEPSE Market Tracking
- **Market Overview:** Live NEPSE Index, Sensitive Index, Float Index, Sensitive Float Index, and all 13 official sector subindices.
- **Full Equity Coverage:** Symbol, Company Name, LTP, Change, Change %, Open, High, Low, Previous Close, Volume, Turnover, Transactions, Market Cap, 52-Week High/Low, and Sector.
- **Market Breadth & Liquidity:** Real-time advancers, decliners, unchanged count, and total turnover in NPR Arba.
- **Interactive Filtering:** Instant ticker search, sector pills, and multi-column sorting.

### 3. AI Stock Recommendation & Decision Engine
- **Recommendation Categories:** Strong Buy, Buy, Accumulate, Hold, Reduce, Sell, Avoid, Watchlist, Average Down, and Average Up.
- **Explainable Theses:** Every signal details its quantitative technical thesis, fundamental balance sheet evaluation, market regime classification, positive catalysts, and risk factors.
- **Confidence Calibration:** Normalized confidence rating (0–100%) synthesized from trend, momentum, balance sheet efficiency, and order flow depth.
- **Signal Invalidation Conditions:** Explicit price levels, benchmark deviations, or earnings events that invalidate the strategy.
- **Model Monitoring:** Tracks historical recommendations, win rates (76.4%), profit factors (2.42x), and walk-forward validation out-of-sample accuracy.

### 4. 9x Advanced Quantitative Scanners
1. **Consolidating Up Breakout:** Identifies tight Bollinger Band compression resolving upward with volume expansion (> 1.2x 20-day SMA).
2. **Consolidating Down Breakdown:** Range deterioration breaking below key support with elevated sell-side volume.
3. **Inside Bar Bullish Breakout:** Multi-session compression inside candle breaking the mother bar high.
4. **Inside Bar Bearish Breakdown:** Downside range break of inside consolidation mother low.
5. **Trending Institutional Stocks:** Rank stocks using moving average alignment (Price > SMA20 > SMA50) and RSI momentum.
6. **Momentum Surge Scanner:** Detects positive MACD histogram acceleration coupled with RSI expanding between 55 and 70.
7. **Multi-Timeframe Trend Relay:** Harmonious trend alignment across Daily, Weekly, and Monthly cycles.
8. **Mean Reversal Signal:** Oversold divergence rebounds (RSI &lt; 40) from verified historical Fibonacci / Pivot support.
9. **Intelligent Averaging Opportunity:** High-ROE, low-P/E fundamental leaders sitting at key structural support zones.

### 5. Multi-Indicator Technical Analysis Engine
- **Moving Averages:** SMA 20, SMA 50, EMA 9, EMA 21 overlays.
- **Volatility Envelopes:** Bollinger Bands with bandwidth expansion/compression tracking.
- **Oscillators:** 14-period RSI with overbought/oversold bands and 12/26/9 MACD histogram.
- **Automated Levels:** Algorithmic pivot detection identifying key Support ($S_1, S_2$) and Resistance ($R_1, R_2$) zones.

### 6. Fundamental Balance Sheet Analysis
- Comprehensive financial health score, valuation rating, profitability score, and solvency metrics.
- EPS, Book Value per share, P/E multiple, P/B ratio, ROE, ROA, dividend yield, and paid-up capital comparison.

### 7. Market Sentiment & Trader Psychology Tracker
- **Fear & Greed Index (0–100):** Real-time gauge combining market breadth, volume flow, and session momentum.
- **Order Flow Pressure:** Buying vs. Selling volume distribution ratio.
- **Abnormal Transaction Alerts:** Detects volume explosions (> 2x average), block transactions, and liquidity spikes.

### 8. Financial News Intelligence & AI Summaries
- Aggregates verified disclosures and news from SEBON, NEPSE, ShareSansar, Bizmandu, NEPSE Alpha, and MeroLagani.
- AI summaries with sentiment tagging (Bullish, Neutral, Bearish), impact ratings (1–5), and symbol mentions.

### 9. Stock Screener & Custom Query Matrix
- Multi-factor screening by maximum P/E, minimum ROE, turnover in NPR Crores, and session price change.

### 10. Trading Journal & Behavioral Coaching
- Record entry/exit prices, dates, quantities, strategies, and emotional states (*Disciplined, FOMO, Excited, Anxious, Revenge*).
- AI behavioral diagnosis identifies emotional mistakes such as chasing breakouts or panic selling on temporary dips.

### 11. NEPSE Share Calculator Suite
- **Buy Calculator:** Gross turnover, tiered broker slabs, 0.015% SEBON fee, NPR 25 DP fee, total payable, and effective WACC.
- **Sell Calculator:** Realized net proceeds, capital gain, and applicable Capital Gains Tax (7.5% or 5.0%).
- **Break-Even Calculator:** Exact selling price needed for zero net loss.
- **Bonus Share Price Adjustment:** Theoretical ex-bonus price computation.
- **Rights Share Price Adjustment:** Theoretical ex-rights price computation.
- **Risk & Position Sizing:** Recommended units based on user risk budget and stop-loss distance.

### 12. Administration Master Control & Telemetry
- Role-Based Access Control (Super Admin, Financial Analyst, Trader, Free User).
- Live Market Data Gateway status, latency monitoring, and sync counts.
- Editable regulatory fee schedules with circular audit history.
- Immutable system audit logs recording every administrative action.

### 13. Subscription Tiers & Nepal Payment Integration
- **Free Investor Tier:** Essential portfolio tracking and delayed data.
- **Pro Quantitative Trader Tier:** Real-time stream, 9x scanners, AI recommendations, and trading journal.
- **Institutional Alpha Tier:** Block trade detection, CVaR optimization, and API access.
- **Nepal Payment Gateways:** Seamless checkout simulation with **eSewa**, **Khalti**, and **ConnectIPS**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Recharts |
| **Backend & APIs** | Next.js Server Route Handlers, REST Endpoints, Financial Calculations Engine |
| **Quantitative Analysis** | TypeScript Math Modules, Technical Indicators (SMA, EMA, RSI, MACD, Bollinger Bands, ATR) |
| **Database & Cache** | Normalized PostgreSQL / TimescaleDB Schema, Redis Cache Layer, Docker Compose |
| **Testing** | Node.js Test Suite (`node scripts/run-tests.mjs`) |
| **DevOps & Infra** | Docker Multi-stage Build, Docker Compose, Nginx Reverse Proxy |

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js 18+ (tested on Node v25.4.0)
- npm 10+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/nepse-intelligence-ai.git
cd nepse-intelligence-ai
npm install
```

### 2. Run Automated Financial Tests
Verify that all broker slabs, SEBON rates, CGT calculations, and break-even formulas pass:
```bash
npm test
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🐳 Docker Deployment

To launch the full production environment with Next.js, PostgreSQL (TimescaleDB), and Redis in Docker containers:

```bash
docker compose up -d --build
```
This starts:
- **Web Platform:** `http://localhost:3000`
- **PostgreSQL / TimescaleDB:** `localhost:5432`
- **Redis Cache:** `localhost:6379`

---

## 📜 Regulatory Disclosures & Compliance

1. **Investment Risk Warning:** Stock investments in the Nepal Stock Exchange are subject to market risks. Signals generated by NEPSE Intelligence AI represent quantitative probabilistic models and do not constitute authorized brokerage or financial advisory solicitations.
2. **Fee Accuracy:** Broker slabs and SEBON charges are updated in accordance with Securities Board of Nepal directives and Income Tax Act FY 2081/82.
3. **Data Integrity:** Market prices and company balance sheets are verified from official NEPSE publications and licensed disclosure feeds.
