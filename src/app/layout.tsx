import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEPSE Intelligence AI — Enterprise-Grade Nepal Stock Trading & Portfolio Platform",
  description:
    "Understand the Market. Analyze the Opportunity. Invest Smarter. Real-time NEPSE tracking, AI recommendations, quantitative scanners, and portfolio intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0F19] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
