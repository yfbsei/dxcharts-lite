/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Series Class
 * Lazy evaluation wrapper for numeric arrays
 */
export class Series {
    private _data: number[];

    constructor(data: number[] | number = []) {
        this._data = Array.isArray(data) ? data : [];
    }

    get length(): number {
        return this._data.length;
    }

    get(index: number): number {
        return this._data[index];
    }

    set(index: number, value: number): this {
        this._data[index] = value;
        return this;
    }

    push(value: number): this {
        this._data.push(value);
        return this;
    }

    toArray(): number[] {
        return [...this._data];
    }

    materialize(): Series {
        return new Series([...this._data]);
    }

    // Arithmetic operations
    add(other: number | Series | number[]): Series {
        if (typeof other === 'number') {
            return new Series(this._data.map(v => v + other));
        }
        const otherData = other instanceof Series ? other._data : other;
        return new Series(this._data.map((v, i) => v + otherData[i]));
    }

    sub(other: number | Series | number[]): Series {
        if (typeof other === 'number') {
            return new Series(this._data.map(v => v - other));
        }
        const otherData = other instanceof Series ? other._data : other;
        return new Series(this._data.map((v, i) => v - otherData[i]));
    }

    mul(other: number | Series | number[]): Series {
        if (typeof other === 'number') {
            return new Series(this._data.map(v => v * other));
        }
        const otherData = other instanceof Series ? other._data : other;
        return new Series(this._data.map((v, i) => v * otherData[i]));
    }

    div(other: number | Series | number[]): Series {
        if (typeof other === 'number') {
            return new Series(this._data.map(v => v / other));
        }
        const otherData = other instanceof Series ? other._data : other;
        return new Series(this._data.map((v, i) => otherData[i] === 0 ? NaN : v / otherData[i]));
    }

    // Comparison
    gt(other: number | Series | number[]): Series {
        if (typeof other === 'number') {
            return new Series(this._data.map(v => v > other ? 1 : 0));
        }
        const otherData = other instanceof Series ? other._data : other;
        return new Series(this._data.map((v, i) => v > otherData[i] ? 1 : 0));
    }

    lt(other: number | Series | number[]): Series {
        if (typeof other === 'number') {
            return new Series(this._data.map(v => v < other ? 1 : 0));
        }
        const otherData = other instanceof Series ? other._data : other;
        return new Series(this._data.map((v, i) => v < otherData[i] ? 1 : 0));
    }

    gte(other: number | Series | number[]): Series {
        if (typeof other === 'number') {
            return new Series(this._data.map(v => v >= other ? 1 : 0));
        }
        const otherData = other instanceof Series ? other._data : other;
        return new Series(this._data.map((v, i) => v >= otherData[i] ? 1 : 0));
    }

    lte(other: number | Series | number[]): Series {
        if (typeof other === 'number') {
            return new Series(this._data.map(v => v <= other ? 1 : 0));
        }
        const otherData = other instanceof Series ? other._data : other;
        return new Series(this._data.map((v, i) => v <= otherData[i] ? 1 : 0));
    }

    // Iterator
    [Symbol.iterator](): Iterator<number> {
        return this._data[Symbol.iterator]();
    }

    map(fn: (v: number, i: number) => number): Series {
        return new Series(this._data.map(fn));
    }

    filter(fn: (v: number, i: number) => boolean): Series {
        return new Series(this._data.filter(fn));
    }

    slice(start?: number, end?: number): Series {
        return new Series(this._data.slice(start, end));
    }
}

/**
 * Candle interface
 */
export interface Candle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

/**
 * BarData - Versioned data wrapper for cache invalidation
 */
export class BarData {
    candles: Candle[];
    version: number;
    private _cache: Map<string, { value: unknown; version: number }>;

    constructor(candles: Candle[] = []) {
        this.candles = candles;
        this.version = 0;
        this._cache = new Map();
    }

    get length(): number {
        return this.candles.length;
    }

    get open(): Series { return new Series(this.candles.map(c => c.open)); }
    get high(): Series { return new Series(this.candles.map(c => c.high)); }
    get low(): Series { return new Series(this.candles.map(c => c.low)); }
    get close(): Series { return new Series(this.candles.map(c => c.close)); }
    get volume(): Series { return new Series(this.candles.map(c => c.volume || 0)); }
    get time(): Series { return new Series(this.candles.map(c => c.timestamp)); }
    get hl2(): Series { return this.high.add(this.low).div(2); }
    get hlc3(): Series { return this.high.add(this.low).add(this.close).div(3); }
    get ohlc4(): Series { return this.open.add(this.high).add(this.low).add(this.close).div(4); }

    update(newCandles: Candle[]): void {
        this.candles = newCandles;
        this.version++;
        this._cache.clear();
    }

    push(candle: Candle): void {
        this.candles.push(candle);
        this.version++;
        this._cache.clear();
    }

    updateLast(candle: Candle): void {
        if (this.candles.length > 0) {
            this.candles[this.candles.length - 1] = candle;
            this.version++;
            this._cache.clear();
        }
    }

    getCached<T>(key: string, compute: () => T): T {
        if (this._cache.has(key)) {
            const cached = this._cache.get(key)!;
            if (cached.version === this.version) {
                return cached.value as T;
            }
        }
        const value = compute();
        this._cache.set(key, { value, version: this.version });
        return value;
    }
}

export default Series;
