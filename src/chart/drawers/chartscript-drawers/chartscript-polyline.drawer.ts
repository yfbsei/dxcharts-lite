/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CanvasModel } from '../../model/canvas.model';
import { ChartScriptPolyline, ChartScriptDrawingsModel } from '../../model/chartscript-drawings.model';
import { Drawer } from '../drawing-manager';
import { ScaleModel } from '../../model/scale.model';
import { ChartModel } from '../../components/chart/chart.model';
import { Bounds } from '../../model/bounds.model';

/**
 * Native drawer for chartScriptJS polylines
 * Renders multi-point lines with optional fill
 */
export class ChartScriptPolylineDrawer implements Drawer {
    constructor(
        private canvasModel: CanvasModel,
        private drawingsModel: ChartScriptDrawingsModel,
        private scale: ScaleModel,
        private chartModel: ChartModel,
        private getBounds: () => Bounds,
    ) { }

    getCanvasIds(): string[] {
        return [this.canvasModel.canvasId];
    }

    draw(): void {
        const polylines = this.drawingsModel.getByType<ChartScriptPolyline>('polyline');
        if (polylines.length === 0) return;

        const ctx = this.canvasModel.ctx;
        const bounds = this.getBounds();

        ctx.save();

        // Clip to chart bounds
        ctx.beginPath();
        ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.clip();

        for (const polyline of polylines) {
            if (!polyline.visible || !polyline.points || polyline.points.length < 2) continue;
            this.drawPolyline(ctx, polyline, bounds);
        }

        ctx.restore();
    }

    private drawPolyline(ctx: CanvasRenderingContext2D, polyline: ChartScriptPolyline, bounds: Bounds): void {
        const visiblePoints = this.getVisiblePoints(polyline, bounds);
        if (visiblePoints.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);

        for (let i = 1; i < visiblePoints.length; i++) {
            ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y);
        }

        if (polyline.closed) {
            ctx.closePath();
        }

        // Fill if has fill color
        if (polyline.fillColor) {
            ctx.fillStyle = polyline.fillColor;
            ctx.fill();
        }

        // Stroke
        ctx.strokeStyle = polyline.color;
        ctx.lineWidth = polyline.width;
        this.setLineStyle(ctx, polyline.style);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    private getVisiblePoints(polyline: ChartScriptPolyline, bounds: Bounds): { x: number; y: number }[] {
        const margin = 100;
        const result: { x: number; y: number }[] = [];
        const candles = this.chartModel.mainCandleSeries.dataPoints;

        // Binary search for visible range when dataset is large
        let startIdx = 0;
        let endIdx = polyline.points.length;

        if (polyline.points.length > 200) {
            // Find first visible point
            startIdx = this.binarySearchStart(polyline, bounds, margin);
            // Find last visible point
            endIdx = this.binarySearchEnd(polyline, bounds, margin, startIdx);
        }

        for (let i = startIdx; i < endIdx; i++) {
            const point = polyline.points[i];
            const x = this.pointToX(point, candles);
            const y = this.scale.toY(point.price);

            if (x >= bounds.x - margin && x <= bounds.x + bounds.width + margin) {
                result.push({ x, y });
            }
        }

        return result;
    }

    private pointToX(point: { index?: number; timestamp?: number }, candles: any[]): number {
        if (point.timestamp !== undefined) {
            // Find index by timestamp
            const idx = candles.findIndex(c => c.timestamp === point.timestamp);
            if (idx !== -1) {
                return this.scale.toX(idx);
            }
            // Interpolate for timestamps not in candles
            if (candles.length > 1) {
                const first = candles[0];
                const last = candles[candles.length - 1];
                const interval = (last.timestamp - first.timestamp) / (candles.length - 1);
                const estimatedIdx = (point.timestamp - first.timestamp) / interval;
                return this.scale.toX(estimatedIdx);
            }
            return 0;
        }
        return this.scale.toX(point.index ?? 0);
    }

    private binarySearchStart(polyline: ChartScriptPolyline, bounds: Bounds, margin: number): number {
        const candles = this.chartModel.mainCandleSeries.dataPoints;
        let left = 0;
        let right = polyline.points.length - 1;
        const targetX = bounds.x - margin;

        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            const x = this.pointToX(polyline.points[mid], candles);
            if (x < targetX) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return Math.max(0, left - 1);
    }

    private binarySearchEnd(polyline: ChartScriptPolyline, bounds: Bounds, margin: number, startIdx: number): number {
        const candles = this.chartModel.mainCandleSeries.dataPoints;
        let left = startIdx;
        let right = polyline.points.length - 1;
        const targetX = bounds.x + bounds.width + margin;

        while (left < right) {
            const mid = Math.ceil((left + right) / 2);
            const x = this.pointToX(polyline.points[mid], candles);
            if (x > targetX) {
                right = mid - 1;
            } else {
                left = mid;
            }
        }
        return Math.min(polyline.points.length, right + 2);
    }

    private setLineStyle(ctx: CanvasRenderingContext2D, style: string): void {
        switch (style) {
            case 'dashed':
                ctx.setLineDash([8, 4]);
                break;
            case 'dotted':
                ctx.setLineDash([2, 2]);
                break;
            default:
                ctx.setLineDash([]);
        }
    }
}
