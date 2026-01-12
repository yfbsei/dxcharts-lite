/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * DXCharts Integration Layer
 * Provides legacy-compatible API bridge to native ChartScriptComponent
 */

import ChartBootstrap from '../bootstrap';
import type { ChartScriptPolyline, ChartScriptPoint } from '../model/chartscript-drawings.model';

/**
 * ChartContext - A wrapper around the native ChartScriptComponent
 * Provides legacy chartScriptJS-compatible API
 */
export class ChartContext {
    private chart: ChartBootstrap;
    private _candles: any[];
    public drawingManager: DrawingManagerProxy;

    constructor(chart: ChartBootstrap, candles: any[] = [], _container: HTMLElement | null = null) {
        this.chart = chart;
        this._candles = candles;
        this.drawingManager = new DrawingManagerProxy(chart);
    }

    setCandles(candles: any[]): void {
        this._candles = candles;
        this.drawingManager.setCandles(candles);
    }

    get open(): number[] { return this._candles.map((c: any) => c.open); }
    get high(): number[] { return this._candles.map((c: any) => c.high); }
    get low(): number[] { return this._candles.map((c: any) => c.low); }
    get close(): number[] { return this._candles.map((c: any) => c.close); }
    get volume(): number[] { return this._candles.map((c: any) => c.volume || 0); }

    render(): void {
        // Native drawers auto-render on chart redraw
    }

    clearDrawings(): void {
        if (this.chart?.chartScriptComponent) {
            this.chart.chartScriptComponent.clearDrawings();
        }
    }

    dispose(): void {
        this.clearDrawings();
    }
}

/**
 * DrawingManagerProxy - Bridges legacy drawing calls to native ChartScriptComponent
 */
export class DrawingManagerProxy {
    private chart: ChartBootstrap;
    public drawings: Map<string, any> = new Map();

    constructor(chart: ChartBootstrap) {
        this.chart = chart;
    }

    setCandles(_candles: any[]): void {
        // Candles are managed at chart level, no-op here
    }

    addPolyline(polylineData: any): void {
        if (this.chart?.chartScriptComponent) {
            const id = polylineData.id || `polyline_${Date.now()}`;
            const points: ChartScriptPoint[] = polylineData.points || [];
            const color = polylineData.color || '#2962ff';
            const width = polylineData.width || 2;
            this.chart.chartScriptComponent.addPolyline(id, points, color, width, {
                closed: polylineData.closed || false,
                fillColor: polylineData.fill,
            });
        }
    }

    removeDrawing(id: string): void {
        if (this.chart?.chartScriptComponent) {
            this.chart.chartScriptComponent.removeDrawing(id);
        }
        this.drawings.delete(id);
    }

    render(): void {
        // Sync all drawings to native component
        if (this.chart?.chartScriptComponent) {
            // Get all current native drawing IDs to track which ones to remove
            const nativeDrawings = this.chart.chartScriptComponent.getAllDrawings();
            const nativeIds = new Set(nativeDrawings.map(d => d.id));
            const currentIds = new Set(this.drawings.keys());

            // Remove drawings that are no longer in our map
            for (const nativeId of nativeIds) {
                if (!currentIds.has(nativeId)) {
                    this.chart.chartScriptComponent.removeDrawing(nativeId);
                }
            }

            // Add/update each drawing
            for (const [id, drawing] of this.drawings) {
                if (drawing._type === 'polyline') {
                    const existingDrawing = this.chart.chartScriptComponent.getDrawing(id);
                    if (existingDrawing) {
                        // Update existing polyline - rebuild with all props
                        const updated: ChartScriptPolyline = {
                            id,
                            type: 'polyline',
                            visible: true,
                            points: drawing.points,
                            color: drawing.color || '#2962ff',
                            width: drawing.width || 2,
                            style: 'solid',
                            closed: drawing.closed || false,
                            fillColor: drawing.fill,
                        };
                        this.chart.chartScriptComponent.updateDrawing(updated);
                    } else {
                        // Add new polyline
                        this.chart.chartScriptComponent.addPolyline(
                            id,
                            drawing.points,
                            drawing.color || '#2962ff',
                            drawing.width || 2,
                            { closed: drawing.closed || false, fillColor: drawing.fill }
                        );
                    }
                }
            }

            // Force chart redraw
            this.chart.drawingManager.forceDraw();
        }
    }

    clear(): void {
        this.drawings.clear();
        if (this.chart?.chartScriptComponent) {
            this.chart.chartScriptComponent.clearDrawings();
        }
    }
}

/**
 * Bind chartScriptJS context to an existing DXCharts instance
 * Legacy-compatible API
 */
export function bindToChart(chart: ChartBootstrap, candles: any[] = [], container: HTMLElement | null = null): ChartContext {
    return new ChartContext(chart, candles, container);
}

/**
 * Create a new DXCharts instance with chartScript context
 * Legacy-compatible API
 */
export function createChart(_container: HTMLElement, _config?: any): Promise<any> {
    // This would need dynamic DXChart import
    throw new Error('createChart is not supported in native mode. Use DXChart.createChart directly.');
}
