// ============================================================================
// NEPSE Financial News & AI Intelligence Aggregator
// ============================================================================

import { NewsItem } from "@/types";

export const FINANCIAL_NEWS_FEED: NewsItem[] = [
  {
    id: "news-1",
    title: "NEPSE Index Surges Past 2,640 Mark With NPR 6.84 Arba Turnover in High-Volume Rally",
    summary:
      "The Nepal Stock Exchange (NEPSE) witnessed bullish momentum today as benchmark index advanced 28.62 points to close at 2,642.45. Heavy institutional participation was noted across Hydropower, Commercial Banking, and Non-Life Insurance sectors.",
    source: "ShareSansar",
    url: "https://www.sharesansar.com/newsdetail/nepse-index-rallies",
    publishedAt: "2 hours ago",
    sentiment: "Bullish",
    impactScore: 5,
    relatedSymbols: ["NABIL", "CHCL", "HRL", "GBIME"],
    sector: "Commercial Banks",
    isVerified: true,
  },
  {
    id: "news-2",
    title: "Nabil Bank Proposes 12.5% Cash Dividend and 10% Bonus Share For Fiscal Year",
    summary:
      "The Board of Directors of Nabil Bank Limited (NABIL) has recommended a combined 22.5% dividend (10% bonus share and 12.5% cash including tax) from profits of the last fiscal year, subject to NRB and AGM approval.",
    source: "Bizmandu",
    url: "https://bizmandu.com/content/nabil-bank-dividend-announcement",
    publishedAt: "4 hours ago",
    sentiment: "Bullish",
    impactScore: 4,
    relatedSymbols: ["NABIL"],
    sector: "Commercial Banks",
    isVerified: true,
  },
  {
    id: "news-3",
    title: "Nepal Rastra Bank Reviews Monetary Policy: Flexible Liquidity Support Maintained",
    summary:
      "The central bank published its quarterly monetary review, keeping the policy rate stable while easing credit conditions for productive commercial sectors, creating favorable borrowing headroom for listed enterprises.",
    source: "NEPSE Alpha",
    url: "https://nepsealpha.com/news/nrb-quarterly-review",
    publishedAt: "6 hours ago",
    sentiment: "Bullish",
    impactScore: 4,
    relatedSymbols: ["GBIME", "NICA", "SCB"],
    sector: "Commercial Banks",
    isVerified: true,
  },
  {
    id: "news-4",
    title: "Chilime Hydropower (CHCL) Reports 18% Net Profit Expansion in Q1 Financials",
    summary:
      "Chilime Hydropower Co. Ltd. posted strong operational efficiency with quarterly net earnings rising to NPR 28.4 Crore. Electricity generation from subsidiary projects remained steady post-monsoon.",
    source: "MeroLagani",
    url: "https://merolagani.com/NewsDetail.aspx?newsID=chcl-q1-report",
    publishedAt: "8 hours ago",
    sentiment: "Bullish",
    impactScore: 3,
    relatedSymbols: ["CHCL", "SHPC"],
    sector: "Hydro Power",
    isVerified: true,
  },
  {
    id: "news-5",
    title: "SEBON Issues Directive on Stricter Disclosure Norms for Right Share Issuances",
    summary:
      "Securities Board of Nepal (SEBON) mandates listed hydropower and insurance entities to present complete project utilization and debt repayment schedules before submitting rights share applications.",
    source: "NEPSE Disclosure",
    url: "https://sebon.gov.np/notices/rights-share-directive",
    publishedAt: "1 day ago",
    sentiment: "Neutral",
    impactScore: 3,
    relatedSymbols: ["UPPER", "HDHPC"],
    sector: "Hydro Power",
    isVerified: true,
  },
];
