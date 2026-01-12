/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Technical Analysis (ta) namespace
 * JavaScript port of PineScript v6 ta.* functions
 * 
 * 61 technical analysis functions
 */

// ============================================
// CORE MOVING AVERAGES
// ============================================

/**
 * Simple Moving Average
 */
export function sma(source: number[], length: number): number[] {
    const result: number[] = [];
    const len = Math.floor(length);
    for (let i = 0; i < source.length; i++) {
        if (i < len - 1) {
            result.push(NaN);
        } else {
            let sum = 0;
            for (let j = 0; j < len; j++) sum += source[i - j];
            result.push(sum / len);
        }
    }
    return result;
}

/**
 * Exponential Moving Average
 */
export function ema(source: number[], length: number): number[] {
    const result: number[] = [];
    const len = Math.floor(length);
    const multiplier = 2 / (len + 1);
    let emaVal = source[0];
    for (let i = 0; i < source.length; i++) {
        if (i === 0) {
            result.push(source[i]);
            emaVal = source[i];
        } else {
            emaVal = (source[i] - emaVal) * multiplier + emaVal;
            result.push(emaVal);
        }
    }
    return result;
}

/**
 * Relative Moving Average (Wilder's smoothing)
 */
export function rma(source: number[], length: number): number[] {
    const result: number[] = [];
    const len = Math.floor(length);
    const alpha = 1 / len;
    let rmaVal = 0, validCount = 0, initSum = 0, firstValidIdx = -1;

    for (let i = 0; i < source.length && validCount < len; i++) {
        if (!isNaN(source[i])) {
            initSum += source[i];
            validCount++;
            if (validCount === len) firstValidIdx = i;
        }
    }
    rmaVal = validCount > 0 ? initSum / validCount : NaN;

    for (let i = 0; i < source.length; i++) {
        if (firstValidIdx < 0 || i < firstValidIdx) {
            result.push(NaN);
        } else if (i === firstValidIdx) {
            result.push(rmaVal);
        } else {
            if (!isNaN(source[i])) {
                rmaVal = alpha * source[i] + (1 - alpha) * rmaVal;
            }
            result.push(rmaVal);
        }
    }
    return result;
}

/**
 * Weighted Moving Average
 */
export function wma(source: number[], length: number): number[] {
    const result: number[] = [];
    const len = Math.floor(length);
    for (let i = 0; i < source.length; i++) {
        if (i < len - 1) {
            result.push(NaN);
        } else {
            let sum = 0, weightSum = 0;
            for (let j = 0; j < len; j++) {
                const weight = len - j;
                sum += source[i - j] * weight;
                weightSum += weight;
            }
            result.push(sum / weightSum);
        }
    }
    return result;
}

/**
 * Symmetrically Weighted Moving Average (fixed length 4)
 */
export function swma(source: number[]): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < 3) {
            result.push(NaN);
        } else {
            if (isNaN(source[i]) || isNaN(source[i - 1]) || isNaN(source[i - 2]) || isNaN(source[i - 3])) {
                result.push(NaN);
            } else {
                result.push(source[i - 3] / 6 + source[i - 2] * 2 / 6 + source[i - 1] * 2 / 6 + source[i] / 6);
            }
        }
    }
    return result;
}

/**
 * Volume Weighted Moving Average
 */
export function vwma(source: number[], length: number, volume: number[]): number[] {
    const srcVol = source.map((s, i) => s * volume[i]);
    const num = sma(srcVol, length);
    const den = sma(volume, length);
    return num.map((n, i) => den[i] === 0 ? NaN : n / den[i]);
}

/**
 * Hull Moving Average
 */
export function hma(source: number[], length: number): number[] {
    const halfLen = Math.floor(length / 2);
    const sqrtLen = Math.floor(Math.sqrt(length));
    const wma1 = wma(source, halfLen);
    const wma2 = wma(source, length);
    const diff = wma1.map((v, i) => 2 * v - wma2[i]);
    return wma(diff, sqrtLen);
}

/**
 * Arnaud Legoux Moving Average
 */
export function alma(source: number[], length: number, offset: number = 0.85, sigma: number = 6): number[] {
    const result: number[] = [];
    const len = Math.floor(length);
    const m = offset * (len - 1);
    const s = len / sigma;

    const weights: number[] = [];
    let weightSum = 0;
    for (let i = 0; i < len; i++) {
        const w = Math.exp(-((i - m) ** 2) / (2 * s * s));
        weights.push(w);
        weightSum += w;
    }

    for (let i = 0; i < source.length; i++) {
        if (i < len - 1) {
            result.push(NaN);
        } else {
            let sum = 0;
            for (let j = 0; j < len; j++) {
                sum += source[i - j] * weights[len - 1 - j];
            }
            result.push(sum / weightSum);
        }
    }
    return result;
}

// ============================================
// MOMENTUM INDICATORS
// ============================================

/**
 * Relative Strength Index
 */
export function rsi(source: number[], length: number): number[] {
    const result: number[] = [];
    const changes: number[] = [];
    for (let i = 1; i < source.length; i++) {
        changes.push(source[i] - source[i - 1]);
    }
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? -c : 0);
    const avgGains = rma(gains, length);
    const avgLosses = rma(losses, length);

    result.push(NaN);
    for (let i = 0; i < avgGains.length; i++) {
        if (avgLosses[i] === 0) result.push(100);
        else {
            const rs = avgGains[i] / avgLosses[i];
            result.push(100 - 100 / (1 + rs));
        }
    }
    return result;
}

/**
 * MACD
 */
export function macd(source: number[], fastLength: number, slowLength: number, signalLength: number): [number[], number[], number[]] {
    const fastEma = ema(source, fastLength);
    const slowEma = ema(source, slowLength);
    const macdLine = fastEma.map((f, i) => f - slowEma[i]);
    const signalLine = ema(macdLine, signalLength);
    const histogram = macdLine.map((m, i) => m - signalLine[i]);
    return [macdLine, signalLine, histogram];
}

/**
 * Stochastic Oscillator
 */
export function stoch(close: number[], high: number[], low: number[], kPeriod: number, kSmooth: number = 3, dSmooth: number = 3): [number[], number[]] {
    const lowestLow = lowest(low, kPeriod);
    const highestHigh = highest(high, kPeriod);
    const rawK = close.map((c, i) => {
        const range = highestHigh[i] - lowestLow[i];
        return range === 0 ? 50 : ((c - lowestLow[i]) / range) * 100;
    });
    const k = sma(rawK, kSmooth);
    const d = sma(k, dSmooth);
    return [k, d];
}

/**
 * Commodity Channel Index
 */
export function cci(high: number[], low: number[], close: number[], length: number): number[] {
    const tp = high.map((h, i) => (h + low[i] + close[i]) / 3);
    const tpSma = sma(tp, length);
    const meanDev = dev(tp, length);
    return tp.map((t, i) => {
        if (meanDev[i] === 0) return 0;
        return (t - tpSma[i]) / (0.015 * meanDev[i]);
    });
}

/**
 * Chande Momentum Oscillator
 */
export function cmo(source: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length) {
            result.push(NaN);
        } else {
            let sumUp = 0, sumDown = 0;
            for (let j = 0; j < length; j++) {
                const change = source[i - j] - source[i - j - 1];
                if (change > 0) sumUp += change;
                else sumDown -= change;
            }
            const total = sumUp + sumDown;
            result.push(total === 0 ? 0 : ((sumUp - sumDown) / total) * 100);
        }
    }
    return result;
}

/**
 * Money Flow Index
 */
export function mfi(high: number[], low: number[], close: number[], volume: number[], length: number): number[] {
    const tp = high.map((h, i) => (h + low[i] + close[i]) / 3);
    const mf = tp.map((t, i) => t * volume[i]);
    const result: number[] = [];

    for (let i = 0; i < close.length; i++) {
        if (i < length) {
            result.push(NaN);
        } else {
            let posMF = 0, negMF = 0;
            for (let j = 0; j < length; j++) {
                if (tp[i - j] > tp[i - j - 1]) posMF += mf[i - j];
                else negMF += mf[i - j];
            }
            result.push(negMF === 0 ? 100 : 100 - 100 / (1 + posMF / negMF));
        }
    }
    return result;
}

/**
 * Williams %R
 */
export function wpr(high: number[], low: number[], close: number[], length: number): number[] {
    const hh = highest(high, length);
    const ll = lowest(low, length);
    return close.map((c, i) => {
        const range = hh[i] - ll[i];
        return range === 0 ? -50 : ((hh[i] - c) / range) * -100;
    });
}

/**
 * True Strength Index
 */
export function tsi(source: number[], shortLength: number = 13, longLength: number = 25): number[] {
    const changes = [0];
    for (let i = 1; i < source.length; i++) {
        changes.push(source[i] - source[i - 1]);
    }
    const absChanges = changes.map(c => Math.abs(c));
    const smoothedChange = ema(ema(changes, longLength), shortLength);
    const smoothedAbs = ema(ema(absChanges, longLength), shortLength);
    return smoothedChange.map((s, i) => smoothedAbs[i] === 0 ? 0 : (s / smoothedAbs[i]) * 100);
}

/**
 * Rate of Change (percentage)
 */
export function roc(source: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length || source[i - length] === 0) result.push(NaN);
        else result.push(((source[i] - source[i - length]) / source[i - length]) * 100);
    }
    return result;
}

/**
 * Momentum
 */
export function mom(source: number[], length: number): number[] {
    return source.map((s, i) => i < length ? NaN : s - source[i - length]);
}

// ============================================
// VOLATILITY INDICATORS
// ============================================

/**
 * True Range
 */
export function tr(high: number[], low: number[], close: number[]): number[] {
    const result = [high[0] - low[0]];
    for (let i = 1; i < high.length; i++) {
        result.push(Math.max(
            high[i] - low[i],
            Math.abs(high[i] - close[i - 1]),
            Math.abs(low[i] - close[i - 1])
        ));
    }
    return result;
}

/**
 * Average True Range
 */
export function atr(high: number[], low: number[], close: number[], length: number): number[] {
    return rma(tr(high, low, close), length);
}

/**
 * Bollinger Bands
 */
export function bb(source: number[], length: number, mult: number = 2): [number[], number[], number[]] {
    const basis = sma(source, length);
    const stdDev = stdev(source, length);
    const upper = basis.map((b, i) => b + mult * stdDev[i]);
    const lower = basis.map((b, i) => b - mult * stdDev[i]);
    return [basis, upper, lower];
}

/**
 * Bollinger Bands Width
 */
export function bbw(source: number[], length: number, mult: number = 2): number[] {
    const [basis, upper, lower] = bb(source, length, mult);
    return upper.map((u, i) => basis[i] === 0 ? 0 : (u - lower[i]) / basis[i]);
}

/**
 * Keltner Channels
 */
export function kc(high: number[], low: number[], close: number[], length: number, mult: number = 2, atrLength: number = 10): [number[], number[], number[]] {
    const basis = ema(close, length);
    const atrVal = atr(high, low, close, atrLength);
    const upper = basis.map((b, i) => b + mult * atrVal[i]);
    const lower = basis.map((b, i) => b - mult * atrVal[i]);
    return [basis, upper, lower];
}

/**
 * Keltner Channels Width
 */
export function kcw(high: number[], low: number[], close: number[], length: number, mult: number = 2, atrLength: number = 10): number[] {
    const [basis, upper, lower] = kc(high, low, close, length, mult, atrLength);
    return upper.map((u, i) => basis[i] === 0 ? 0 : (u - lower[i]) / basis[i]);
}

/**
 * Standard Deviation
 */
export function stdev(source: number[], length: number): number[] {
    const result: number[] = [];
    const avg = sma(source, length);
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            let sumSq = 0;
            for (let j = 0; j < length; j++) {
                sumSq += (source[i - j] - avg[i]) ** 2;
            }
            result.push(Math.sqrt(sumSq / length));
        }
    }
    return result;
}

/**
 * Mean Absolute Deviation
 */
export function dev(source: number[], length: number): number[] {
    const result: number[] = [];
    const avg = sma(source, length);
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            let sum = 0;
            for (let j = 0; j < length; j++) {
                sum += Math.abs(source[i - j] - avg[i]);
            }
            result.push(sum / length);
        }
    }
    return result;
}

/**
 * Variance
 */
export function variance(source: number[], length: number, biased: boolean = true): number[] {
    const result: number[] = [];
    const avg = sma(source, length);
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            let sumSq = 0;
            for (let j = 0; j < length; j++) {
                sumSq += (source[i - j] - avg[i]) ** 2;
            }
            result.push(sumSq / (biased ? length : length - 1));
        }
    }
    return result;
}

// ============================================
// TREND INDICATORS
// ============================================

/**
 * SuperTrend
 */
export function supertrend(high: number[], low: number[], close: number[], factor: number, atrPeriod: number): [number[], number[]] {
    const result: number[] = [], directions: number[] = [];
    const hl2 = high.map((h, i) => (h + low[i]) / 2);
    const atrVal = atr(high, low, close, atrPeriod);

    let prevLower = NaN, prevUpper = NaN, prevST = NaN;

    for (let i = 0; i < high.length; i++) {
        if (isNaN(atrVal[i])) {
            result.push(NaN);
            directions.push(1);
            continue;
        }

        let upper = hl2[i] + factor * atrVal[i];
        let lower = hl2[i] - factor * atrVal[i];

        if (!isNaN(prevLower) && !isNaN(prevUpper)) {
            lower = (lower > prevLower || close[i - 1] < prevLower) ? lower : prevLower;
            upper = (upper < prevUpper || close[i - 1] > prevUpper) ? upper : prevUpper;
        }

        let dir: number;
        if (isNaN(prevST)) dir = 1;
        else if (prevST === prevUpper) dir = close[i] > upper ? -1 : 1;
        else dir = close[i] < lower ? 1 : -1;

        const st = dir === -1 ? lower : upper;
        result.push(st);
        directions.push(dir);

        prevLower = lower;
        prevUpper = upper;
        prevST = st;
    }
    return [result, directions];
}

/**
 * Parabolic SAR
 */
export function sar(high: number[], low: number[], start: number = 0.02, inc: number = 0.02, maxAF: number = 0.2): number[] {
    const result: number[] = [];
    let af = start, ep = low[0], isLong = true, sarVal = low[0];

    for (let i = 0; i < high.length; i++) {
        if (i === 0) {
            result.push(sarVal);
            continue;
        }

        sarVal = sarVal + af * (ep - sarVal);

        if (isLong) {
            sarVal = Math.min(sarVal, low[i - 1], i > 1 ? low[i - 2] : low[i - 1]);
            if (low[i] < sarVal) {
                isLong = false;
                sarVal = ep;
                ep = low[i];
                af = start;
            } else {
                if (high[i] > ep) {
                    ep = high[i];
                    af = Math.min(af + inc, maxAF);
                }
            }
        } else {
            sarVal = Math.max(sarVal, high[i - 1], i > 1 ? high[i - 2] : high[i - 1]);
            if (high[i] > sarVal) {
                isLong = true;
                sarVal = ep;
                ep = high[i];
                af = start;
            } else {
                if (low[i] < ep) {
                    ep = low[i];
                    af = Math.min(af + inc, maxAF);
                }
            }
        }
        result.push(sarVal);
    }
    return result;
}

/**
 * Directional Movement Index
 */
export function dmi(high: number[], low: number[], close: number[], length: number): [number[], number[], number[]] {
    const trVal = tr(high, low, close);

    const plusDM = [0], minusDM = [0];
    for (let i = 1; i < high.length; i++) {
        const upMove = high[i] - high[i - 1];
        const downMove = low[i - 1] - low[i];
        plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
        minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    }

    const smoothTR = rma(trVal, length);
    const smoothPlusDM = rma(plusDM, length);
    const smoothMinusDM = rma(minusDM, length);

    const plusDI = smoothPlusDM.map((p, i) => smoothTR[i] === 0 ? 0 : (p / smoothTR[i]) * 100);
    const minusDI = smoothMinusDM.map((m, i) => smoothTR[i] === 0 ? 0 : (m / smoothTR[i]) * 100);

    const dx = plusDI.map((p, i) => {
        const sum = p + minusDI[i];
        return sum === 0 ? 0 : Math.abs(p - minusDI[i]) / sum * 100;
    });
    const adx = rma(dx, length);

    return [plusDI, minusDI, adx];
}

/**
 * Ichimoku Cloud
 */
export interface IchimokuResult {
    tenkan: number[];
    kijun: number[];
    senkouA: number[];
    senkouB: number[];
    chikou: number[];
}

export function ichimoku(
    high: number[],
    low: number[],
    close: number[],
    conversionPeriods: number = 9,
    basePeriods: number = 26,
    laggingSpan2Periods: number = 52,
    displacement: number = 26
): IchimokuResult {
    const donchian = (h: number[], l: number[], len: number): number[] => {
        const hh = highest(h, len);
        const ll = lowest(l, len);
        return hh.map((hv, i) => (hv + ll[i]) / 2);
    };

    const tenkan = donchian(high, low, conversionPeriods);
    const kijun = donchian(high, low, basePeriods);
    const senkouA = tenkan.map((t, i) => (t + kijun[i]) / 2);
    const senkouB = donchian(high, low, laggingSpan2Periods);
    const chikou = [...close.slice(displacement), ...Array(displacement).fill(NaN)];

    return { tenkan, kijun, senkouA, senkouB, chikou };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Highest value over period
 */
export function highest(source: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) result.push(NaN);
        else {
            let max = -Infinity;
            for (let j = 0; j < length; j++) {
                if (!isNaN(source[i - j])) max = Math.max(max, source[i - j]);
            }
            result.push(max === -Infinity ? NaN : max);
        }
    }
    return result;
}

/**
 * Lowest value over period
 */
export function lowest(source: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) result.push(NaN);
        else {
            let min = Infinity;
            for (let j = 0; j < length; j++) {
                if (!isNaN(source[i - j])) min = Math.min(min, source[i - j]);
            }
            result.push(min === Infinity ? NaN : min);
        }
    }
    return result;
}

/**
 * Bars since condition was true
 */
export function barssince(condition: boolean[]): number[] {
    const result: number[] = [];
    let count = NaN;
    for (let i = 0; i < condition.length; i++) {
        if (condition[i]) count = 0;
        else if (!isNaN(count)) count++;
        result.push(count);
    }
    return result;
}

/**
 * Value when condition was true
 */
export function valuewhen(condition: boolean[], source: number[], occurrence: number = 0): number[] {
    const result: number[] = [];
    const trueIndices: number[] = [];

    for (let i = 0; i < condition.length; i++) {
        if (condition[i]) trueIndices.push(i);

        if (trueIndices.length > occurrence) {
            result.push(source[trueIndices[trueIndices.length - 1 - occurrence]]);
        } else {
            result.push(NaN);
        }
    }
    return result;
}

/**
 * Crossover detection
 */
export function crossover(s1: number[], s2: number[]): boolean[] {
    return s1.map((v, i) => i === 0 ? false : v > s2[i] && s1[i - 1] <= s2[i - 1]);
}

/**
 * Crossunder detection
 */
export function crossunder(s1: number[], s2: number[]): boolean[] {
    return s1.map((v, i) => i === 0 ? false : v < s2[i] && s1[i - 1] >= s2[i - 1]);
}

/**
 * Cross (any direction)
 */
export function cross(s1: number[], s2: number[]): boolean[] {
    const over = crossover(s1, s2);
    const under = crossunder(s1, s2);
    return over.map((o, i) => o || under[i]);
}

/**
 * Rising for n bars
 */
export function rising(source: number[], length: number): boolean[] {
    return source.map((_, i) => {
        if (i < length) return false;
        for (let j = 1; j <= length; j++) {
            if (source[i - j + 1] <= source[i - j]) return false;
        }
        return true;
    });
}

/**
 * Falling for n bars
 */
export function falling(source: number[], length: number): boolean[] {
    return source.map((_, i) => {
        if (i < length) return false;
        for (let j = 1; j <= length; j++) {
            if (source[i - j + 1] >= source[i - j]) return false;
        }
        return true;
    });
}

/**
 * Change from n bars ago
 */
export function change(source: number[], length: number = 1): number[] {
    return source.map((s, i) => i < length ? NaN : s - source[i - length]);
}

/**
 * Cumulative sum
 */
export function cum(source: number[]): number[] {
    let sum = 0;
    return source.map(s => sum += s);
}

/**
 * VWAP
 */
export function vwap(high: number[], low: number[], close: number[], volume: number[]): number[] {
    const tp = high.map((h, i) => (h + low[i] + close[i]) / 3);
    const tpVol = tp.map((t, i) => t * volume[i]);
    const cumTpVol = cum(tpVol);
    const cumVol = cum(volume);
    return cumTpVol.map((c, i) => cumVol[i] === 0 ? NaN : c / cumVol[i]);
}

/**
 * Linear Regression
 */
export function linreg(source: number[], length: number, offset: number = 0): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            for (let j = 0; j < length; j++) {
                const x = j;
                const y = source[i - (length - 1 - j)];
                sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
            }
            const slope = (length * sumXY - sumX * sumY) / (length * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / length;
            result.push(intercept + slope * (length - 1 - offset));
        }
    }
    return result;
}

/**
 * Correlation coefficient
 */
export function correlation(s1: number[], s2: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < s1.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            let sum1 = 0, sum2 = 0, n = 0;
            for (let j = 0; j < length; j++) {
                sum1 += s1[i - j]; sum2 += s2[i - j]; n++;
            }
            const mean1 = sum1 / n, mean2 = sum2 / n;
            let num = 0, den1 = 0, den2 = 0;
            for (let j = 0; j < length; j++) {
                const d1 = s1[i - j] - mean1, d2 = s2[i - j] - mean2;
                num += d1 * d2; den1 += d1 * d1; den2 += d2 * d2;
            }
            const den = Math.sqrt(den1 * den2);
            result.push(den === 0 ? NaN : num / den);
        }
    }
    return result;
}

/**
 * Percent rank
 */
export function percentrank(source: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            let count = 0;
            for (let j = 1; j < length; j++) {
                if (source[i - j] <= source[i]) count++;
            }
            result.push((count / (length - 1)) * 100);
        }
    }
    return result;
}

/**
 * Median
 */
export function median(source: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            const values: number[] = [];
            for (let j = 0; j < length; j++) values.push(source[i - j]);
            values.sort((a, b) => a - b);
            const mid = Math.floor(values.length / 2);
            result.push(values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid]);
        }
    }
    return result;
}

/**
 * Pivot High
 */
export function pivothigh(source: number[], leftBars: number, rightBars: number): number[] {
    const result = Array(source.length).fill(NaN);
    for (let i = leftBars; i < source.length - rightBars; i++) {
        let isPivot = true;
        for (let j = 1; j <= leftBars; j++) {
            if (source[i - j] >= source[i]) { isPivot = false; break; }
        }
        if (isPivot) {
            for (let j = 1; j <= rightBars; j++) {
                if (source[i + j] >= source[i]) { isPivot = false; break; }
            }
        }
        if (isPivot) result[i + rightBars] = source[i];
    }
    return result;
}

/**
 * Pivot Low
 */
export function pivotlow(source: number[], leftBars: number, rightBars: number): number[] {
    const result = Array(source.length).fill(NaN);
    for (let i = leftBars; i < source.length - rightBars; i++) {
        let isPivot = true;
        for (let j = 1; j <= leftBars; j++) {
            if (source[i - j] <= source[i]) { isPivot = false; break; }
        }
        if (isPivot) {
            for (let j = 1; j <= rightBars; j++) {
                if (source[i + j] <= source[i]) { isPivot = false; break; }
            }
        }
        if (isPivot) result[i + rightBars] = source[i];
    }
    return result;
}

/**
 * Highest bars (offset to highest)
 */
export function highestbars(source: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            let maxIdx = 0, max = source[i];
            for (let j = 1; j < length; j++) {
                if (source[i - j] > max) { max = source[i - j]; maxIdx = j; }
            }
            result.push(-maxIdx);
        }
    }
    return result;
}

/**
 * Lowest bars (offset to lowest)
 */
export function lowestbars(source: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            let minIdx = 0, min = source[i];
            for (let j = 1; j < length; j++) {
                if (source[i - j] < min) { min = source[i - j]; minIdx = j; }
            }
            result.push(-minIdx);
        }
    }
    return result;
}

/**
 * Range (high - low)
 */
export function range(high: number[], low: number[]): number[] {
    return high.map((h, i) => h - low[i]);
}

/**
 * Max of two values/series
 */
export function max(a: number | number[], b: number | number[]): number | number[] {
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.map((v, i) => Math.max(v, b[i]));
    }
    return Math.max(a as number, b as number);
}

/**
 * Min of two values/series
 */
export function min(a: number | number[], b: number | number[]): number | number[] {
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.map((v, i) => Math.min(v, b[i]));
    }
    return Math.min(a as number, b as number);
}

/**
 * Center of Gravity
 */
export function cog(source: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            let num = 0, den = 0;
            for (let j = 0; j < length; j++) {
                num += source[i - j] * (j + 1);
                den += source[i - j];
            }
            result.push(den === 0 ? 0 : -num / den);
        }
    }
    return result;
}

/**
 * Mode (most frequent value)
 */
export function mode(source: number[], length: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < source.length; i++) {
        if (i < length - 1) {
            result.push(NaN);
        } else {
            const counts = new Map<number, number>();
            for (let j = 0; j < length; j++) {
                const val = source[i - j];
                counts.set(val, (counts.get(val) || 0) + 1);
            }
            let maxCount = 0, modeVal = NaN;
            for (const [val, count] of counts) {
                if (count > maxCount) { maxCount = count; modeVal = val; }
            }
            result.push(modeVal);
        }
    }
    return result;
}

export const FUNCTION_COUNT = 61;
