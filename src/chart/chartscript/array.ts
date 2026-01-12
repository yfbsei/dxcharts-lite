/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Array namespace
 * JavaScript port of PineScript v6 array.* functions
 * 
 * 62 functions
 */

// Array creation
export const new_array = <T>(size: number = 0, val: T = NaN as T): T[] => Array(size).fill(val);
export const new_float = (size: number = 0, val: number = NaN): number[] => Array(size).fill(val);
export const new_int = (size: number = 0, val: number = 0): number[] => Array(size).fill(val);
export const new_bool = (size: number = 0, val: boolean = false): boolean[] => Array(size).fill(val);
export const new_string = (size: number = 0, val: string = ''): string[] => Array(size).fill(val);
export const new_color = (size: number = 0, val: string = '#000000'): string[] => Array(size).fill(val);
export const new_line = <T>(size: number = 0): (T | null)[] => Array(size).fill(null);
export const new_box = <T>(size: number = 0): (T | null)[] => Array(size).fill(null);
export const new_label = <T>(size: number = 0): (T | null)[] => Array(size).fill(null);
export const new_linefill = <T>(size: number = 0): (T | null)[] => Array(size).fill(null);
export const newtype = new_array;

// Basic operations
export const size = <T>(arr: T[]): number => arr.length;
export const get = <T>(arr: T[], idx: number): T => arr[idx];
export const set = <T>(arr: T[], idx: number, val: T): T[] => { arr[idx] = val; return arr; };
export const push = <T>(arr: T[], val: T): T[] => { arr.push(val); return arr; };
export const pop = <T>(arr: T[]): T | undefined => arr.pop();
export const shift = <T>(arr: T[]): T | undefined => arr.shift();
export const unshift = <T>(arr: T[], val: T): T[] => { arr.unshift(val); return arr; };
export const insert = <T>(arr: T[], idx: number, val: T): T[] => { arr.splice(idx, 0, val); return arr; };
export const remove = <T>(arr: T[], idx: number): T => arr.splice(idx, 1)[0];
export const clear = <T>(arr: T[]): T[] => { arr.length = 0; return arr; };
export const first = <T>(arr: T[]): T => arr[0];
export const last = <T>(arr: T[]): T => arr[arr.length - 1];

// Search
export const includes = <T>(arr: T[], val: T): boolean => arr.includes(val);
export const indexof = <T>(arr: T[], val: T): number => arr.indexOf(val);
export const lastindexof = <T>(arr: T[], val: T): number => arr.lastIndexOf(val);
export const binary_search = (arr: number[], val: number): number => {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] === val) return mid;
        if (arr[mid] < val) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
};
export const binary_search_leftmost = (arr: number[], val: number): number => {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] < val) lo = mid + 1;
        else hi = mid;
    }
    return lo;
};
export const binary_search_rightmost = (arr: number[], val: number): number => {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] <= val) lo = mid + 1;
        else hi = mid;
    }
    return lo - 1;
};

// Manipulation
export const copy = <T>(arr: T[]): T[] => [...arr];
export const concat = <T>(arr1: T[], arr2: T[]): T[] => [...arr1, ...arr2];
export const slice = <T>(arr: T[], start: number, end?: number): T[] => arr.slice(start, end);
export const from = <T>(arr: T[]): T[] => [...arr];
export const fill = <T>(arr: T[], val: T, start: number = 0, end: number = arr.length): T[] => { arr.fill(val, start, end); return arr; };
export const reverse = <T>(arr: T[]): T[] => { arr.reverse(); return arr; };
export const sort = (arr: number[], order: 'asc' | 'desc' = 'asc'): number[] => {
    arr.sort((a, b) => order === 'asc' ? a - b : b - a);
    return arr;
};
export const sort_indices = (arr: number[], order: 'asc' | 'desc' = 'asc'): number[] => {
    return arr.map((_, i) => i).sort((a, b) =>
        order === 'asc' ? arr[a] - arr[b] : arr[b] - arr[a]
    );
};
export const join = <T>(arr: T[], sep: string = ''): string => arr.join(sep);

// Logic
export const every = <T>(arr: T[], fn: (v: T, i: number) => boolean): boolean => arr.every(fn);
export const some = <T>(arr: T[], fn: (v: T, i: number) => boolean): boolean => arr.some(fn);

// Statistics
export const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);
export const avg = (arr: number[]): number => sum(arr) / arr.length;
export const min = (arr: number[]): number => Math.min(...arr);
export const max = (arr: number[]): number => Math.max(...arr);
export const range = (arr: number[]): number => max(arr) - min(arr);
export const median = (arr: number[]): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
};
export const mode = (arr: number[]): number => {
    const counts = new Map<number, number>();
    for (const v of arr) counts.set(v, (counts.get(v) || 0) + 1);
    let maxCount = 0, modeVal = NaN;
    for (const [v, c] of counts) {
        if (c > maxCount) { maxCount = c; modeVal = v; }
    }
    return modeVal;
};
export const stdev = (arr: number[]): number => {
    const mean = avg(arr);
    return Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
};
export const variance = (arr: number[]): number => {
    const mean = avg(arr);
    return arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
};
export const covariance = (arr1: number[], arr2: number[]): number => {
    const mean1 = avg(arr1), mean2 = avg(arr2);
    let total = 0;
    for (let i = 0; i < arr1.length; i++) {
        total += (arr1[i] - mean1) * (arr2[i] - mean2);
    }
    return total / arr1.length;
};
export const abs = (arr: number[]): number[] => arr.map(Math.abs);
export const standardize = (arr: number[]): number[] => {
    const mean = avg(arr), std = stdev(arr);
    return arr.map(v => std === 0 ? 0 : (v - mean) / std);
};
export const percentile_linear_interpolation = (arr: number[], pct: number): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (pct / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const frac = idx - lower;
    return sorted[lower] + frac * (sorted[upper] - sorted[lower]);
};
export const percentile_nearest_rank = (arr: number[], pct: number): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((pct / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
};
export const percentrank = (arr: number[], val: number): number => {
    let count = 0;
    for (const v of arr) if (v <= val) count++;
    return (count / arr.length) * 100;
};

export const FUNCTION_COUNT = 62;
