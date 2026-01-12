/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CanvasModel } from '../../model/canvas.model';
import { ChartScriptLine, ChartScriptDrawingsModel } from '../../model/chartscript-drawings.model';
import { Drawer } from '../drawing-manager';
import { ScaleModel } from '../../model/scale.model';
import { Bounds } from '../../model/bounds.model';

/**
 * Native drawer for chartScriptJS lines
 * Renders 2-point lines with extensions and styles
 */
export class ChartScriptLineDrawer implements Drawer {
    constructor(
        private canvasModel: CanvasModel,
        private drawingsModel: ChartScriptDrawingsModel,
        private scale: ScaleModel,
        private getBounds: () => Bounds,
    ) { }

    getCanvasIds(): string[] {
        return [this.canvasModel.canvasId];
    }

    draw(): void {
        const lines = this.drawingsModel.getByType<ChartScriptLine>('line');
        if (lines.length === 0) return;

        const ctx = this.canvasModel.ctx;
        const bounds = this.getBounds();

        ctx.save();

        // Clip to chart bounds
        ctx.beginPath();
        ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.clip();

        for (const line of lines) {
            if (!line.visible) continue;
            this.drawLine(ctx, line, bounds);
        }

        ctx.restore();
    }

    private drawLine(ctx: CanvasRenderingContext2D, line: ChartScriptLine, bounds: Bounds): void {
        let x1 = this.scale.toX(line.x1);
        let y1 = this.scale.toY(line.y1);
        let x2 = this.scale.toX(line.x2);
        let y2 = this.scale.toY(line.y2);

        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        this.setLineStyle(ctx, line.style);

        // Handle extensions
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (line.extend === 'left' || line.extend === 'both') {
            if (dx !== 0) {
                const slope = dy / dx;
                const extX = bounds.x;
                const extY = y1 + slope * (extX - x1);
                x1 = extX;
                y1 = extY;
            }
        }

        if (line.extend === 'right' || line.extend === 'both') {
            if (dx !== 0) {
                const slope = dy / dx;
                const extX = bounds.x + bounds.width;
                const extY = y2 + slope * (extX - x2);
                x2 = extX;
                y2 = extY;
            }
        }

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
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
