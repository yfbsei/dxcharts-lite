/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Color namespace
 * JavaScript port of PineScript v6 color.* functions
 * 
 * 8 functions + constants
 */

// Color constants
export const red = '#ff0000';
export const green = '#00ff00';
export const blue = '#0000ff';
export const yellow = '#ffff00';
export const orange = '#ff6600';
export const purple = '#9c27b0';
export const white = '#ffffff';
export const black = '#000000';
export const gray = '#808080';
export const silver = '#c0c0c0';
export const teal = '#00bcd4';
export const navy = '#000080';
export const maroon = '#800000';
export const olive = '#808000';
export const lime = '#00ff00';
export const aqua = '#00ffff';
export const fuchsia = '#ff00ff';

/**
 * Create RGB color string
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @param transp - Transparency (0-100)
 * @returns string
 */
export function rgb(r: number, g: number, b: number, transp: number = 0): string {
    const a = 1 - transp / 100;
    if (a === 1) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Create color from hex string
 * @param hex - Hex color string (#RRGGBB or #RGB)
 * @returns string
 */
export function from_hex(hex: string): string {
    // Normalize to #RRGGBB format
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
}

/**
 * Create new color with transparency
 * @param baseColor - Base color
 * @param transp - Transparency (0-100)
 * @returns string
 */
export function new_color(baseColor: string, transp: number = 0): string {
    const rVal = parseInt(baseColor.slice(1, 3), 16);
    const gVal = parseInt(baseColor.slice(3, 5), 16);
    const bVal = parseInt(baseColor.slice(5, 7), 16);
    return rgb(rVal, gVal, bVal, transp);
}

// Alias for PineScript compatibility
export { new_color as color };

/**
 * Extract red component
 * @param colorStr - Color string
 * @returns number
 */
export function r(colorStr: string): number {
    if (colorStr.startsWith('#')) {
        return parseInt(colorStr.slice(1, 3), 16);
    }
    const match = colorStr.match(/rgba?\((\d+)/);
    return match ? parseInt(match[1]) : 0;
}

/**
 * Extract green component
 * @param colorStr - Color string
 * @returns number
 */
export function g(colorStr: string): number {
    if (colorStr.startsWith('#')) {
        return parseInt(colorStr.slice(3, 5), 16);
    }
    const match = colorStr.match(/rgba?\(\d+,\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

/**
 * Extract blue component
 * @param colorStr - Color string
 * @returns number
 */
export function b(colorStr: string): number {
    if (colorStr.startsWith('#')) {
        return parseInt(colorStr.slice(5, 7), 16);
    }
    const match = colorStr.match(/rgba?\(\d+,\s*\d+,\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

/**
 * Extract transparency component (0-100)
 * @param colorStr - Color string
 * @returns number
 */
export function t(colorStr: string): number {
    const match = colorStr.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
    if (match) {
        return Math.round((1 - parseFloat(match[1])) * 100);
    }
    return 0;
}

/**
 * Create color from gradient between two colors
 * @param value - Value (0-1)
 * @param low - Low bound
 * @param high - High bound
 * @param color1 - Start color
 * @param color2 - End color
 * @returns string
 */
export function from_gradient(value: number, low: number, high: number, color1: string, color2: string): string {
    const pct = Math.max(0, Math.min(1, (value - low) / (high - low)));
    const r1 = r(color1), g1 = g(color1), b1 = b(color1);
    const r2 = r(color2), g2 = g(color2), b2 = b(color2);
    return rgb(
        Math.round(r1 + (r2 - r1) * pct),
        Math.round(g1 + (g2 - g1) * pct),
        Math.round(b1 + (b2 - b1) * pct)
    );
}

export const FUNCTION_COUNT = 8;
