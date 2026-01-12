/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Subject } from 'rxjs';

/**
 * Drawing types supported by chartScriptJS
 */
export type ChartScriptDrawingType = 'line' | 'box' | 'label' | 'polyline' | 'linefill';

/**
 * Line style options
 */
export type LineStyle = 'solid' | 'dashed' | 'dotted';

/**
 * Line extension modes
 */
export type LineExtend = 'none' | 'left' | 'right' | 'both';

/**
 * Label style modes
 */
export type LabelStyle = 'label_up' | 'label_down' | 'none';

/**
 * Base drawing interface
 */
export interface ChartScriptDrawing {
    id: string;
    type: ChartScriptDrawingType;
    visible: boolean;
}

/**
 * Point for polylines - can use either bar index or timestamp
 */
export interface ChartScriptPoint {
    index?: number;
    timestamp?: number;
    price: number;
}

/**
 * Line drawing (2-point line)
 */
export interface ChartScriptLine extends ChartScriptDrawing {
    type: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    width: number;
    style: LineStyle;
    extend: LineExtend;
}

/**
 * Box/rectangle drawing
 */
export interface ChartScriptBox extends ChartScriptDrawing {
    type: 'box';
    left: number;
    top: number;
    right: number;
    bottom: number;
    bgcolor: string;
    borderColor: string;
    borderWidth: number;
    borderStyle: LineStyle;
    text?: string;
    textColor?: string;
    textSize?: number;
}

/**
 * Label drawing
 */
export interface ChartScriptLabel extends ChartScriptDrawing {
    type: 'label';
    x: number;
    y: number;
    text: string;
    color: string;
    textColor: string;
    size: number | 'tiny' | 'small' | 'normal' | 'large' | 'huge';
    style: LabelStyle;
}

/**
 * Polyline drawing (multiple connected points)
 */
export interface ChartScriptPolyline extends ChartScriptDrawing {
    type: 'polyline';
    points: ChartScriptPoint[];
    color: string;
    width: number;
    style: LineStyle;
    closed: boolean;
    fillColor?: string;
}

/**
 * Linefill drawing (filled area between two lines)
 */
export interface ChartScriptLinefill extends ChartScriptDrawing {
    type: 'linefill';
    line1Id: string;
    line2Id: string;
    color: string;
}

/**
 * Union type for all drawing types
 */
export type AnyChartScriptDrawing = ChartScriptLine | ChartScriptBox | ChartScriptLabel | ChartScriptPolyline | ChartScriptLinefill;

/**
 * Model to hold all chartScriptJS drawings
 * Emits changes for redraw triggers
 */
export class ChartScriptDrawingsModel {
    private drawings: Map<string, AnyChartScriptDrawing> = new Map();

    /**
     * Subject that emits when drawings change
     */
    public readonly changed: Subject<void> = new Subject();

    /**
     * Add or update a drawing
     */
    add(drawing: AnyChartScriptDrawing): void {
        this.drawings.set(drawing.id, drawing);
        this.changed.next();
    }

    /**
     * Update an existing drawing
     */
    update(drawing: AnyChartScriptDrawing): void {
        if (this.drawings.has(drawing.id)) {
            this.drawings.set(drawing.id, drawing);
            this.changed.next();
        }
    }

    /**
     * Remove a drawing by ID
     */
    remove(id: string): void {
        if (this.drawings.delete(id)) {
            this.changed.next();
        }
    }

    /**
     * Clear all drawings
     */
    clear(): void {
        if (this.drawings.size > 0) {
            this.drawings.clear();
            this.changed.next();
        }
    }

    /**
     * Get a drawing by ID
     */
    get(id: string): AnyChartScriptDrawing | undefined {
        return this.drawings.get(id);
    }

    /**
     * Get all drawings
     */
    getAll(): AnyChartScriptDrawing[] {
        return Array.from(this.drawings.values());
    }

    /**
     * Get all drawings of a specific type
     */
    getByType<T extends AnyChartScriptDrawing>(type: ChartScriptDrawingType): T[] {
        return this.getAll().filter(d => d.type === type) as T[];
    }

    /**
     * Check if a drawing exists
     */
    has(id: string): boolean {
        return this.drawings.has(id);
    }

    /**
     * Get the number of drawings
     */
    get size(): number {
        return this.drawings.size;
    }
}
