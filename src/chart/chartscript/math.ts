/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Math namespace
 * JavaScript port of PineScript v6 math.* functions
 * 
 * 24 functions + constants
 */

// Constants
export const pi = Math.PI;
export const e = Math.E;
export const phi = 1.618033988749895;  // Golden ratio
export const rphi = 0.6180339887498949; // Reciprocal of golden ratio

// Basic operations
export const abs = Math.abs;
export const ceil = Math.ceil;
export const floor = Math.floor;
export const round = (x: number, precision: number = 0): number => {
    const mult = Math.pow(10, precision);
    return Math.round(x * mult) / mult;
};
export const sign = Math.sign;
export const sqrt = Math.sqrt;
export const pow = Math.pow;
export const exp = Math.exp;
export const log = Math.log;
export const log10 = Math.log10;

// Trigonometry
export const sin = Math.sin;
export const cos = Math.cos;
export const tan = Math.tan;
export const asin = Math.asin;
export const acos = Math.acos;
export const atan = Math.atan;
export const todegrees = (radians: number): number => radians * (180 / Math.PI);
export const toradians = (degrees: number): number => degrees * (Math.PI / 180);

// Aggregation
export const max = (...args: number[]): number => Math.max(...args);
export const min = (...args: number[]): number => Math.min(...args);
export const avg = (...args: number[]): number => args.reduce((a, b) => a + b, 0) / args.length;
export const sum = (...args: number[]): number => args.reduce((a, b) => a + b, 0);

// Utility
export const random = (min: number = 0, max: number = 1, _seed: number | null = null): number => {
    // Note: seed parameter not implemented - uses Math.random
    return min + Math.random() * (max - min);
};

export const round_to_mintick = (price: number, mintick: number = 0.01): number => {
    return Math.round(price / mintick) * mintick;
};

export const FUNCTION_COUNT = 24;
