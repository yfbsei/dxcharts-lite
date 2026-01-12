/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * String namespace
 * JavaScript port of PineScript v6 str.* functions
 * 
 * 20 functions
 */

export const length = (s: string): number => s.length;
export const contains = (s: string, substr: string): boolean => s.includes(substr);
export const startswith = (s: string, prefix: string): boolean => s.startsWith(prefix);
export const endswith = (s: string, suffix: string): boolean => s.endsWith(suffix);
export const pos = (s: string, substr: string): number => s.indexOf(substr);
export const substring = (s: string, start: number, end?: number): string => s.substring(start, end);
export const lower = (s: string): string => s.toLowerCase();
export const upper = (s: string): string => s.toUpperCase();
export const trim = (s: string): string => s.trim();
export const trimLeft = (s: string): string => s.trimStart();
export const trimRight = (s: string): string => s.trimEnd();
export const split = (s: string, sep: string): string[] => s.split(sep);
export const replace = (s: string, from: string | RegExp, to: string): string => s.replace(from, to);
export const replace_all = (s: string, from: string, to: string): string => s.split(from).join(to);
export const concat = (...args: (string | number)[]): string => args.join('');
export const charAt = (s: string, idx: number): string => s.charAt(idx);
export const match = (s: string, regex: RegExp): RegExpMatchArray | null => s.match(regex);
export const tonumber = (s: string): number => parseFloat(s);
export const tostring = (val: unknown): string => String(val);

/**
 * Format string with arguments
 * @param formatStr - Format string with {0}, {1}, etc.
 * @param args - Arguments to substitute
 * @returns string
 */
export function format(formatStr: string, ...args: unknown[]): string {
    return formatStr.replace(/\{(\d+)\}/g, (match, idx) => {
        return args[parseInt(idx)] !== undefined ? String(args[parseInt(idx)]) : match;
    });
}

/**
 * Format timestamp with PineScript format specifiers
 * @param timestamp - Unix timestamp (ms)
 * @param formatStr - Format string
 * @param timezone - Timezone
 * @returns string
 */
export function format_time(timestamp: number, formatStr: string = 'yyyy-MM-dd HH:mm:ss', _timezone: string = 'UTC'): string {
    const date = new Date(timestamp);

    const pad = (n: number, len: number = 2): string => String(n).padStart(len, '0');

    const replacements: Record<string, string | number> = {
        'yyyy': date.getUTCFullYear(),
        'yy': String(date.getUTCFullYear()).slice(-2),
        'MM': pad(date.getUTCMonth() + 1),
        'M': date.getUTCMonth() + 1,
        'dd': pad(date.getUTCDate()),
        'd': date.getUTCDate(),
        'HH': pad(date.getUTCHours()),
        'H': date.getUTCHours(),
        'mm': pad(date.getUTCMinutes()),
        'm': date.getUTCMinutes(),
        'ss': pad(date.getUTCSeconds()),
        's': date.getUTCSeconds(),
    };

    let result = formatStr;
    for (const [key, value] of Object.entries(replacements)) {
        result = result.replace(key, String(value));
    }
    return result;
}

export const FUNCTION_COUNT = 20;
