/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Polyline drawing primitives
 * Legacy-compatible API
 */

export interface PolylinePoint {
    timestamp?: number;
    index?: number;
    price: number;
}

export interface PolylineOptions {
    color?: string;
    width?: number;
    closed?: boolean;
    fill?: string;
}

export interface Polyline {
    id: string;
    _type: 'polyline';
    points: PolylinePoint[];
    color: string;
    width: number;
    closed: boolean;
    fill?: string;
}

let polylineCounter = 0;

/**
 * Create a polyline drawing
 */
export function create(points: PolylinePoint[], options: PolylineOptions = {}): Polyline {
    const id = `polyline_${++polylineCounter}`;
    return {
        id,
        _type: 'polyline',
        points,
        color: options.color || '#2962ff',
        width: options.width || 2,
        closed: options.closed || false,
        fill: options.fill,
    };
}
