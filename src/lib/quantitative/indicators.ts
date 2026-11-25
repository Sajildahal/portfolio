// ============================================================================
// Technical Indicator Engine
// SMA, EMA, RSI, MACD, Bollinger Bands, ATR, OBV, Support & Resistance
// ============================================================================

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover?: number;
}

export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      result.push(Math.round((sum / period) * 100) / 100);
    }
  }
  return result;
}

export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prevEMA: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((acc, val) => acc + val, 0);
      prevEMA = sum / period;
      result.push(Math.round(prevEMA * 100) / 100);
    } else if (prevEMA !== null) {
      prevEMA = data[i] * k + prevEMA * (1 - k);
      result.push(Math.round(prevEMA * 100) / 100);
    }
  }
  return result;
}

export function calculateRSI(closes: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (closes.length <= period) return closes.map(() => null);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < period; i++) {
    result.push(null);
  }

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = avgLoss === 0 ? 100 : 100 - 100 / (1 + firstRS);
  result.push(Math.round(firstRSI * 100) / 100);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      result.push(Math.round(rsi * 100) / 100);
    }
  }

  return result;
}

export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
) {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(
        Math.round(((fastEMA[i] as number) - (slowEMA[i] as number)) * 100) / 100
      );
    }
  }

  // Calculate signal line from non-null macdLine values
  const validMacdValues: number[] = [];
  const offset = macdLine.findIndex((v) => v !== null);

  for (let i = offset; i < macdLine.length; i++) {
    validMacdValues.push(macdLine[i] as number);
  }

  const validSignal = calculateEMA(validMacdValues, signalPeriod);
  const signalLine: (number | null)[] = new Array(offset).fill(null).concat(validSignal);

  const histogram: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (macdLine[i] === null || signalLine[i] === null) {
      histogram.push(null);
    } else {
      histogram.push(
        Math.round(((macdLine[i] as number) - (signalLine[i] as number)) * 100) / 100
      );
    }
  }

  return { macdLine, signalLine, histogram };
}

export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
) {
  const sma = calculateSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  const bandwidth: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
      bandwidth.push(null);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = sma[i] as number;
      const variance =
        slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      const up = Math.round((mean + stdDev * stdDevMultiplier) * 100) / 100;
      const low = Math.round((mean - stdDev * stdDevMultiplier) * 100) / 100;
      const width = Math.round(((up - low) / mean) * 10000) / 100; // Bandwidth in %

      upper.push(up);
      lower.push(low);
      bandwidth.push(width);
    }
  }

  return { middle: sma, upper, lower, bandwidth };
}

export function calculateATR(candles: Candle[], period: number = 14): (number | null)[] {
  const tr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      tr.push(candles[i].high - candles[i].low);
    } else {
      const h_l = candles[i].high - candles[i].low;
      const h_cp = Math.abs(candles[i].high - candles[i - 1].close);
      const l_cp = Math.abs(candles[i].low - candles[i - 1].close);
      tr.push(Math.max(h_l, h_cp, l_cp));
    }
  }
  return calculateSMA(tr, period);
}

export function calculateSupportResistance(candles: Candle[]): {
  supports: number[];
  resistances: number[];
} {
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const resistances: number[] = [];
  const supports: number[] = [];

  // Local extrema over 5-candle windows
  for (let i = 2; i < candles.length - 2; i++) {
    if (
      highs[i] > highs[i - 1] &&
      highs[i] > highs[i - 2] &&
      highs[i] > highs[i + 1] &&
      highs[i] > highs[i + 2]
    ) {
      resistances.push(highs[i]);
    }
    if (
      lows[i] < lows[i - 1] &&
      lows[i] < lows[i - 2] &&
      lows[i] < lows[i + 1] &&
      lows[i] < lows[i + 2]
    ) {
      supports.push(lows[i]);
    }
  }

  const sortedR = Array.from(new Set(resistances)).sort((a, b) => b - a).slice(0, 3);
  const sortedS = Array.from(new Set(supports)).sort((a, b) => b - a).slice(0, 3);

  return { resistances: sortedR, supports: sortedS };
}

// ============================================================================
// Institutional Volume Weighted Average Price (VWAP) Engine
// ============================================================================
export function calculateVWAP(candles: Candle[]): (number | null)[] {
  let cumTypicalVolume = 0;
  let cumVolume = 0;
  const result: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const vol = c.volume || 1;
    cumTypicalVolume += typicalPrice * vol;
    cumVolume += vol;
    result.push(Math.round((cumTypicalVolume / cumVolume) * 100) / 100);
  }
  return result;
}

// ============================================================================
// Institutional Fibonacci Retracement Levels
// ============================================================================
export interface FibonacciLevel {
  ratio: number;
  label: string;
  price: number;
}

export function calculateFibonacci(high: number, low: number): FibonacciLevel[] {
  const diff = high - low;
  const ratios = [
    { ratio: 0.0, label: "0.0% (Swing High)" },
    { ratio: 0.236, label: "23.6% Pullback" },
    { ratio: 0.382, label: "38.2% Retracement" },
    { ratio: 0.5, label: "50.0% Midpoint" },
    { ratio: 0.618, label: "61.8% Golden Pocket" },
    { ratio: 0.786, label: "78.6% Deep Value" },
    { ratio: 1.0, label: "100.0% (Swing Low)" },
  ];

  return ratios.map((r) => ({
    ratio: r.ratio,
    label: r.label,
    price: Math.round((high - diff * r.ratio) * 100) / 100,
  }));
}
