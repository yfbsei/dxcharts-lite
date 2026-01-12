/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Time namespace
 * JavaScript port of PineScript v6 time.* functions
 */

/**
 * Create timestamp from components
 * @param year
 * @param month - 1-12
 * @param day
 * @param hour
 * @param minute
 * @param second
 * @param timezone
 * @returns Unix timestamp in milliseconds
 */
export function time(
    year: number,
    month: number = 1,
    day: number = 1,
    hour: number = 0,
    minute: number = 0,
    second: number = 0,
    _timezone: string = 'UTC'
): number {
    return Date.UTC(year, month - 1, day, hour, minute, second);
}

/**
 * Create timestamp (alias for time)
 */
export const timestamp = time;

/**
 * Get current timestamp
 * @returns number
 */
export function now(): number {
    return Date.now();
}

export const FUNCTION_COUNT = 1;
