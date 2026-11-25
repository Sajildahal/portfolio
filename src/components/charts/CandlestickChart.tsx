// ============================================================================
// Institutional Multi-Mode Financial Charting Engine
// Japanese Candlesticks, Line, Area & OHLC Bars with VWAP, Fibonacci & SR Zones
// ============================================================================

"use client";

import React, { useState, useRef, useMemo } from "react";
import { FibonacciLevel } from "@/lib/quantitative/indicators";

export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ChartType = "candlestick" | "line" | "area" | "ohlc";

interface CandlestickChartProps {
  candles: CandleData[];
  height?: number;
  chartType?: ChartType;
  showSMA20?: boolean;
  showSMA50?: boolean;
  showBollinger?: boolean;
  showVolume?: boolean;
  showRSI?: boolean;
  showMACD?: boolean;
  showVWAP?: boolean;
  showFibonacci?: boolean;
  showSupportResistanceZones?: boolean;
  showSignals?: boolean;
  sma20?: (number | null)[];
  sma50?: (number | null)[];
  bbUpper?: (number | null)[];
  bbLower?: (number | null)[];
  rsi?: (number | null)[];
  macdHistogram?: (number | null)[];
  macdLine?: (number | null)[];
  signalLine?: (number | null)[];
  vwap?: (number | null)[];
  supports?: number[];
  resistances?: number[];
  fibonacciLevels?: FibonacciLevel[];
}

export function CandlestickChart({
  candles,
  height = 360,
  chartType = "candlestick",
  showSMA20 = true,
  showSMA50 = true,
  showBollinger = true,
  showVolume = true,
  showRSI = false,
  showMACD = false,
  showVWAP = false,
  showFibonacci = false,
  showSupportResistanceZones = false,
  showSignals = false,
  sma20,
  sma50,
  bbUpper,
  bbLower,
  rsi,
  macdHistogram,
  macdLine,
  signalLine,
  vwap,
  supports = [],
  resistances = [],
  fibonacciLevels = [],
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Layout parameters
  const paddingLeft = 10;
  const paddingRight = 65; // For right price axis & indicator tags
  const paddingTop = 25;
  const paddingBottom = showVolume ? 55 : 25;
  const subChartHeight = 85;

  const width = 800; // SVG viewBox coordinate width
  const mainChartHeight = height;

  // Min and Max price calculation across visible candles and indicators
  const { minPrice, maxPrice, maxVolume, avgVolume } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 100, maxPrice: 1000, maxVolume: 100000, avgVolume: 50000 };
    }
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;
    let totalVol = 0;

    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
      totalVol += c.volume;
    });

    if (showBollinger && bbUpper && bbLower) {
      bbUpper.forEach((val) => {
        if (val && val > max) max = val;
      });
      bbLower.forEach((val) => {
        if (val && val < min) min = val;
      });
    }

    // Add 2% buffer top and bottom
    const buffer = (max - min) * 0.03 || 5;
    return {
      minPrice: Math.max(1, min - buffer),
      maxPrice: max + buffer,
      maxVolume: maxVol || 1,
      avgVolume: totalVol / candles.length,
    };
  }, [candles, showBollinger, bbUpper, bbLower]);

  // Coordinate scales
  const chartDrawableWidth = width - paddingLeft - paddingRight;
  const chartDrawableHeight = mainChartHeight - paddingTop - paddingBottom;
  const candleCount = candles.length;
  const candleSpacing = chartDrawableWidth / Math.max(1, candleCount);
  const candleWidth = Math.max(3, Math.min(14, candleSpacing * 0.7));

  const getY = (price: number) => {
    return (
      paddingTop +
      (1 - (price - minPrice) / Math.max(1, maxPrice - minPrice)) *
        chartDrawableHeight
    );
  };

  const getX = (index: number) => {
    return paddingLeft + index * candleSpacing + candleSpacing / 2;
  };

  // Price ticks for right axis (5 intervals)
  const priceTicks = useMemo(() => {
    const ticks = [];
    const step = (maxPrice - minPrice) / 5;
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + i * step;
      ticks.push({
        price: Math.round(price),
        y: getY(price),
      });
    }
    return ticks;
  }, [minPrice, maxPrice, mainChartHeight]);

  // Selected or latest candle for HUD display
  const activeCandle =
    hoverIndex !== null && candles[hoverIndex]
      ? candles[hoverIndex]
      : candles[candles.length - 1];

  const activeIndex =
    hoverIndex !== null ? hoverIndex : candles.length - 1;

  const candleChange = activeCandle
    ? activeCandle.close - activeCandle.open
    : 0;
  const candleChangePct = activeCandle
    ? ((candleChange / activeCandle.open) * 100).toFixed(2)
    : "0.00";

  // Handle Mouse Movement inside SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Scale client coordinates to SVG viewBox coordinates
    const scaleX = width / rect.width;
    const scaleY =
      (mainChartHeight +
        (showRSI ? subChartHeight : 0) +
        (showMACD ? subChartHeight : 0)) /
      rect.height;

    const svgX = clientX * scaleX;
    const svgY = clientY * scaleY;

    setMousePos({ x: svgX, y: svgY });

    // Calculate nearest candle index
    const relativeX = svgX - paddingLeft;
    const idx = Math.floor(relativeX / candleSpacing);
    if (idx >= 0 && idx < candleCount) {
      setHoverIndex(idx);
    } else {
      setHoverIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setMousePos(null);
  };

  // Polyline generator helper
  const createPolylinePoints = (series?: (number | null)[]) => {
    if (!series) return "";
    return series
      .map((val, idx) => {
        if (val === null || val === undefined || isNaN(val) || val === 0) return null;
        return `${getX(idx)},${getY(val)}`;
      })
      .filter(Boolean)
      .join(" ");
  };

  // Area Path generator
  const areaPathD = useMemo(() => {
    if (chartType !== "area" || candles.length === 0) return "";
    const points = candles.map((c, i) => `${getX(i)},${getY(c.close)}`);
    const firstX = getX(0);
    const lastX = getX(candles.length - 1);
    const bottomY = mainChartHeight - paddingBottom;
    return `M ${firstX},${bottomY} L ${points.join(" L ")} L ${lastX},${bottomY} Z`;
  }, [candles, chartType, mainChartHeight, paddingBottom]);

  // Line Path generator
  const linePathD = useMemo(() => {
    if ((chartType !== "line" && chartType !== "area") || candles.length === 0) return "";
    return "M " + candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(" L ");
  }, [candles, chartType]);

  return (
    <div ref={containerRef} className="relative w-full select-none">
      {/* Top HUD: Real-time Candle Details Bar */}
      {activeCandle && (
        <div className="flex flex-wrap items-center justify-between border-b border-bronze/60 bg-obsidian px-3 py-1.5 text-[11px] font-mono text-slate-300">
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">{activeCandle.date}</span>
            <div className="flex items-center space-x-3">
              <span>
                <span className="text-slate-500">O:</span>{" "}
                <span className="text-white font-bold">{activeCandle.open}</span>
              </span>
              <span>
                <span className="text-slate-500">H:</span>{" "}
                <span className="text-emerald-400 font-bold">{activeCandle.high}</span>
              </span>
              <span>
                <span className="text-slate-500">L:</span>{" "}
                <span className="text-rose-400 font-bold">{activeCandle.low}</span>
              </span>
              <span>
                <span className="text-slate-500">C:</span>{" "}
                <span
                  className={`font-bold ${
                    activeCandle.close >= activeCandle.open
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {activeCandle.close}
                </span>
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded ${
                  candleChange >= 0
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {candleChange >= 0 ? "+" : ""}
                {candleChange} ({candleChange >= 0 ? "+" : ""}
                {candleChangePct}%)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[10px]">
            <span className="text-slate-400">
              VOL:{" "}
              <span className="text-champagne font-bold">
                {activeCandle.volume.toLocaleString()}
              </span>
            </span>
            {showSMA20 && sma20 && sma20[activeIndex] && (
              <span className="text-sky-400 font-semibold">
                SMA20: {sma20[activeIndex]?.toFixed(1)}
              </span>
            )}
            {showSMA50 && sma50 && sma50[activeIndex] && (
              <span className="text-gold font-semibold">
                SMA50: {sma50[activeIndex]?.toFixed(1)}
              </span>
            )}
            {showVWAP && vwap && vwap[activeIndex] && (
              <span className="text-fuchsia-400 font-semibold">
                VWAP: {vwap[activeIndex]?.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${width} ${
          mainChartHeight +
          (showRSI ? subChartHeight : 0) +
          (showMACD ? subChartHeight : 0)
        }`}
        className="w-full bg-obsidian cursor-crosshair overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="volGreenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="volRedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="areaGoldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Support & Resistance Zones (Shaded Horizontal Bands) */}
        {showSupportResistanceZones && (
          <g>
            {resistances.slice(0, 2).map((resPrice, idx) => {
              const bandY = getY(resPrice);
              const bandH = Math.max(8, chartDrawableHeight * 0.04);
              return (
                <g key={"res-" + idx}>
                  <rect
                    x={paddingLeft}
                    y={bandY - bandH / 2}
                    width={chartDrawableWidth}
                    height={bandH}
                    fill="#EF4444"
                    fillOpacity="0.12"
                    stroke="#EF4444"
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft + 6}
                    y={bandY - bandH / 2 + 7}
                    fill="#F87171"
                    fontSize="7.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    RESISTANCE ZONE R{idx + 1} (NPR {resPrice})
                  </text>
                </g>
              );
            })}

            {supports.slice(0, 2).map((supPrice, idx) => {
              const bandY = getY(supPrice);
              const bandH = Math.max(8, chartDrawableHeight * 0.04);
              return (
                <g key={"sup-" + idx}>
                  <rect
                    x={paddingLeft}
                    y={bandY - bandH / 2}
                    width={chartDrawableWidth}
                    height={bandH}
                    fill="#10B981"
                    fillOpacity="0.12"
                    stroke="#10B981"
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft + 6}
                    y={bandY + bandH / 2 - 2}
                    fill="#34D399"
                    fontSize="7.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    DEMAND SUPPORT S{idx + 1} (NPR {supPrice})
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Fibonacci Retracement Levels */}
        {showFibonacci && fibonacciLevels.length > 0 && (
          <g>
            {fibonacciLevels.map((fib, i) => {
              const y = getY(fib.price);
              if (y < paddingTop || y > mainChartHeight - paddingBottom) return null;
              const colors: { [key: number]: string } = {
                0.0: "#E2E8F0",
                0.236: "#38BDF8",
                0.382: "#34D399",
                0.5: "#FBBF24",
                0.618: "#D4AF37", // Golden Pocket
                0.786: "#FB7185",
                1.0: "#A78BFA",
              };
              const color = colors[fib.ratio] || "#94A3B8";

              return (
                <g key={"fib-" + i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke={color}
                    strokeDasharray="4 2"
                    strokeWidth={fib.ratio === 0.618 ? "1.4" : "0.9"}
                    opacity="0.85"
                  />
                  <text
                    x={width - paddingRight + 4}
                    y={y + 3}
                    fill={color}
                    fontSize="7.5"
                    fontWeight={fib.ratio === 0.618 ? "bold" : "normal"}
                    fontFamily="monospace"
                  >
                    {(fib.ratio * 100).toFixed(1)}% {fib.price}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Horizontal Grid Lines */}
        {priceTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={tick.y}
              x2={width - paddingRight}
              y2={tick.y}
              stroke="#2A2415"
              strokeDasharray="2 3"
              strokeWidth="0.8"
            />
            <text
              x={width - paddingRight + 8}
              y={tick.y + 3.5}
              fill="#94A3B8"
              fontSize="9"
              fontFamily="monospace"
            >
              {tick.price}
            </text>
          </g>
        ))}

        {/* Volume Sub-layer inside Main Chart */}
        {showVolume && (
          <g opacity="0.85">
            {candles.map((c, i) => {
              const x = getX(i) - candleWidth / 2;
              const maxVolH = 45;
              const volH = Math.max(2, (c.volume / maxVolume) * maxVolH);
              const y = mainChartHeight - paddingBottom + (maxVolH - volH);
              const isBull = c.close >= c.open;
              return (
                <rect
                  key={"v-" + i}
                  x={x}
                  y={y}
                  width={candleWidth}
                  height={volH}
                  fill={isBull ? "url(#volGreenGrad)" : "url(#volRedGrad)"}
                />
              );
            })}
          </g>
        )}

        {/* Bollinger Bands Envelopes */}
        {showBollinger && bbUpper && bbLower && (
          <g>
            <polyline
              fill="none"
              stroke="#A855F7"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.6"
              points={createPolylinePoints(bbUpper)}
            />
            <polyline
              fill="none"
              stroke="#A855F7"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.6"
              points={createPolylinePoints(bbLower)}
            />
          </g>
        )}

        {/* Moving Averages: SMA 20 (Cyan) and SMA 50 (Metallic Gold) */}
        {showSMA20 && sma20 && (
          <polyline
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.5"
            opacity="0.85"
            points={createPolylinePoints(sma20)}
          />
        )}
        {showSMA50 && sma50 && (
          <polyline
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.8"
            opacity="0.9"
            points={createPolylinePoints(sma50)}
          />
        )}

        {/* Volume-Weighted Average Price (VWAP) */}
        {showVWAP && vwap && (
          <polyline
            fill="none"
            stroke="#E879F9"
            strokeWidth="1.7"
            strokeDasharray="4 2"
            opacity="0.95"
            points={createPolylinePoints(vwap)}
          />
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PRICE SERIES ACCORDING TO SELECTED CHART TYPE                      */}
        {/* ------------------------------------------------------------------ */}

        {/* 1. AREA CHART */}
        {chartType === "area" && (
          <g>
            <path d={areaPathD} fill="url(#areaGoldGrad)" />
            <path
              d={linePathD}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* 2. LINE CHART */}
        {chartType === "line" && (
          <path
            d={linePathD}
            fill="none"
            stroke="#F5E6A8"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* 3. OHLC BARS */}
        {chartType === "ohlc" && (
          <g>
            {candles.map((c, i) => {
              const x = getX(i);
              const isBull = c.close >= c.open;
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const color = isBull ? "#10B981" : "#EF4444";
              const tickLen = candleWidth * 0.7;

              return (
                <g key={"ohlc-" + i}>
                  {/* High-Low Vertical Spine */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.3"
                  />
                  {/* Open Left Tick */}
                  <line
                    x1={x - tickLen}
                    y1={openY}
                    x2={x}
                    y2={openY}
                    stroke={color}
                    strokeWidth="1.3"
                  />
                  {/* Close Right Tick */}
                  <line
                    x1={x}
                    y1={closeY}
                    x2={x + tickLen}
                    y2={closeY}
                    stroke={color}
                    strokeWidth="1.3"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 4. CANDLESTICK SERIES (Wicks and Bodies) */}
        {chartType === "candlestick" && (
          <g>
            {candles.map((c, i) => {
              const x = getX(i);
              const isBull = c.close >= c.open;
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const openY = getY(c.open);
              const closeY = getY(c.close);

              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(1.5, Math.abs(openY - closeY));
              const color = isBull ? "#10B981" : "#EF4444";

              return (
                <g key={i}>
                  {/* Upper & Lower Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Candle Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    stroke={color}
                    strokeWidth="0.5"
                    rx="0.5"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* AI Chart Signals (Breakout, Accumulation, Divergence Markers) */}
        {showSignals && (
          <g>
            {candles.map((c, i) => {
              if (i < 2) return null;
              const x = getX(i);
              const isBull = c.close >= c.open;
              const pctChange = ((c.close - c.open) / c.open) * 100;
              const isVolSurge = c.volume > avgVolume * 1.7;

              // Breakout condition: High volume surge + strong upward push
              if (isVolSurge && pctChange >= 2.0) {
                return (
                  <g key={"sig-" + i}>
                    <polygon
                      points={`${x},${getY(c.high) - 14} ${x - 4},${getY(c.high) - 8} ${x + 4},${getY(c.high) - 8}`}
                      fill="#10B981"
                    />
                    <text
                      x={x}
                      y={getY(c.high) - 16}
                      fill="#10B981"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      BREAKOUT
                    </text>
                  </g>
                );
              }

              // Breakdown risk condition: High volume surge + sharp drop
              if (isVolSurge && pctChange <= -2.0) {
                return (
                  <g key={"sig-" + i}>
                    <polygon
                      points={`${x},${getY(c.low) + 14} ${x - 4},${getY(c.low) + 8} ${x + 4},${getY(c.low) + 8}`}
                      fill="#EF4444"
                    />
                    <text
                      x={x}
                      y={getY(c.low) + 22}
                      fill="#EF4444"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      RISK
                    </text>
                  </g>
                );
              }

              return null;
            })}
          </g>
        )}

        {/* Crosshair & Interactive Hover Guide */}
        {hoverIndex !== null && mousePos && (
          <g pointerEvents="none">
            {/* Vertical crosshair line */}
            <line
              x1={getX(hoverIndex)}
              y1={paddingTop}
              x2={getX(hoverIndex)}
              y2={mainChartHeight - paddingBottom}
              stroke="#D4AF37"
              strokeDasharray="2 2"
              strokeWidth="0.9"
              opacity="0.7"
            />
            {/* Horizontal crosshair line in main chart */}
            {mousePos.y <= mainChartHeight - paddingBottom && mousePos.y >= paddingTop && (
              <>
                <line
                  x1={paddingLeft}
                  y1={mousePos.y}
                  x2={width - paddingRight}
                  y2={mousePos.y}
                  stroke="#D4AF37"
                  strokeDasharray="2 2"
                  strokeWidth="0.9"
                  opacity="0.7"
                />
                {/* Price badge on right axis */}
                <rect
                  x={width - paddingRight + 2}
                  y={mousePos.y - 8}
                  width="58"
                  height="16"
                  fill="#D4AF37"
                  rx="3"
                />
                <text
                  x={width - paddingRight + 31}
                  y={mousePos.y + 3.5}
                  fill="#080807"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {(
                    minPrice +
                    (1 - (mousePos.y - paddingTop) / chartDrawableHeight) *
                      (maxPrice - minPrice)
                  ).toFixed(1)}
                </text>
              </>
            )}

            {/* Date badge on X-axis */}
            {candles[hoverIndex] && (
              <g>
                <rect
                  x={getX(hoverIndex) - 28}
                  y={mainChartHeight - paddingBottom + 4}
                  width="56"
                  height="14"
                  fill="#1E293B"
                  stroke="#2A2415"
                  rx="3"
                />
                <text
                  x={getX(hoverIndex)}
                  y={mainChartHeight - paddingBottom + 14}
                  fill="#F5E6A8"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {candles[hoverIndex].date.slice(5)}
                </text>
              </g>
            )}
          </g>
        )}

        {/* RSI Sub-Chart Panel */}
        {showRSI && rsi && (
          <g transform={`translate(0, ${mainChartHeight})`}>
            {/* Separator */}
            <line
              x1={paddingLeft}
              y1={0}
              x2={width - paddingRight}
              y2={0}
              stroke="#2A2415"
              strokeWidth="1.5"
            />
            {/* Background */}
            <rect
              x={paddingLeft}
              y={5}
              width={chartDrawableWidth}
              height={subChartHeight - 10}
              fill="#080807"
              stroke="#2A2415"
              strokeWidth="0.8"
            />
            {/* Overbought line (70) and Oversold line (30) */}
            <line
              x1={paddingLeft}
              y1={5 + (subChartHeight - 10) * 0.3}
              x2={width - paddingRight}
              y2={5 + (subChartHeight - 10) * 0.3}
              stroke="#EF4444"
              strokeDasharray="2 2"
              strokeWidth="0.8"
              opacity="0.6"
            />
            <text
              x={width - paddingRight + 8}
              y={5 + (subChartHeight - 10) * 0.3 + 3}
              fill="#EF4444"
              fontSize="8"
              fontFamily="monospace"
            >
              70
            </text>

            <line
              x1={paddingLeft}
              y1={5 + (subChartHeight - 10) * 0.7}
              x2={width - paddingRight}
              y2={5 + (subChartHeight - 10) * 0.7}
              stroke="#10B981"
              strokeDasharray="2 2"
              strokeWidth="0.8"
              opacity="0.6"
            />
            <text
              x={width - paddingRight + 8}
              y={5 + (subChartHeight - 10) * 0.7 + 3}
              fill="#10B981"
              fontSize="8"
              fontFamily="monospace"
            >
              30
            </text>

            {/* RSI Title & Value */}
            <text
              x={paddingLeft + 8}
              y={18}
              fill="#F5E6A8"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              RSI (14): {rsi[activeIndex] ? rsi[activeIndex]?.toFixed(1) : 50}
            </text>

            {/* RSI Polyline */}
            <polyline
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.4"
              points={rsi
                .map((val, idx) => {
                  if (!val) return null;
                  const x = getX(idx);
                  const y = 5 + (1 - val / 100) * (subChartHeight - 10);
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(" ")}
            />
          </g>
        )}

        {/* MACD Sub-Chart Panel */}
        {showMACD && macdHistogram && (
          <g
            transform={`translate(0, ${
              mainChartHeight + (showRSI ? subChartHeight : 0)
            })`}
          >
            {/* Separator */}
            <line
              x1={paddingLeft}
              y1={0}
              x2={width - paddingRight}
              y2={0}
              stroke="#2A2415"
              strokeWidth="1.5"
            />
            {/* Background */}
            <rect
              x={paddingLeft}
              y={5}
              width={chartDrawableWidth}
              height={subChartHeight - 10}
              fill="#080807"
              stroke="#2A2415"
              strokeWidth="0.8"
            />
            {/* Center Zero line */}
            <line
              x1={paddingLeft}
              y1={subChartHeight / 2}
              x2={width - paddingRight}
              y2={subChartHeight / 2}
              stroke="#64748B"
              strokeWidth="0.8"
            />
            <text
              x={width - paddingRight + 8}
              y={subChartHeight / 2 + 3}
              fill="#64748B"
              fontSize="8"
              fontFamily="monospace"
            >
              0.0
            </text>

            <text
              x={paddingLeft + 8}
              y={18}
              fill="#38BDF8"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              MACD (12, 26, 9) Hist:{" "}
              {macdHistogram[activeIndex]
                ? macdHistogram[activeIndex]?.toFixed(2)
                : 0}
            </text>

            {/* Histogram Bars */}
            {macdHistogram.map((hVal, idx) => {
              if (hVal === null || hVal === undefined || isNaN(hVal)) return null;
              const x = getX(idx) - candleWidth / 2;
              const zeroY = subChartHeight / 2;
              const maxHist = 15;
              const barH = Math.min(30, (Math.abs(hVal) / maxHist) * 30);
              const isPos = hVal >= 0;
              const y = isPos ? zeroY - barH : zeroY;

              return (
                <rect
                  key={"mh-" + idx}
                  x={x}
                  y={y}
                  width={candleWidth}
                  height={Math.max(1, barH)}
                  fill={isPos ? "#10B981" : "#EF4444"}
                  opacity="0.8"
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Date Axis Legend at bottom */}
      <div className="flex justify-between border-t border-bronze/60 bg-charcoal px-4 py-1 text-[9px] font-mono text-slate-500">
        <span>{candles[0]?.date}</span>
        <span>{candles[Math.floor(candles.length / 2)]?.date}</span>
        <span>{candles[candles.length - 1]?.date} (LATEST)</span>
      </div>
    </div>
  );
}
