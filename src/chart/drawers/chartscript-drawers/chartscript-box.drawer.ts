/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CanvasModel } from '../../model/canvas.model';
import { ChartScriptBox, ChartScriptDrawingsModel } from '../../model/chartscript-drawings.model';
import { Drawer } from '../drawing-manager';
import { ScaleModel } from '../../model/scale.model';
import { Bounds } from '../../model/bounds.model';

/**
 * Native drawer for chartScriptJS boxes/rectangles
 * Renders rectangles with fill, border, and optional text
 */
export class ChartScriptBoxDrawer implements Drawer {
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
        const boxes = this.drawingsModel.getByType<ChartScriptBox>('box');
        if (boxes.length === 0) return;

        const ctx = this.canvasModel.ctx;
        const bounds = this.getBounds();

        ctx.save();

        // Clip to chart bounds
        ctx.beginPath();
        ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.clip();

        for (const box of boxes) {
            if (!box.visible) continue;
            this.drawBox(ctx, box);
        }

        ctx.restore();
    }

    private drawBox(ctx: CanvasRenderingContext2D, box: ChartScriptBox): void {
        const x1 = this.scale.toX(box.left);
        const y1 = this.scale.toY(box.top);
        const x2 = this.scale.toX(box.right);
        const y2 = this.scale.toY(box.bottom);

        const width = x2 - x1;
        const height = y2 - y1;

        // Fill
        if (box.bgcolor) {
            ctx.fillStyle = box.bgcolor;
            ctx.fillRect(x1, y1, width, height);
        }

        // Border
        if (box.borderWidth > 0) {
            ctx.strokeStyle = box.borderColor;
            ctx.lineWidth = box.borderWidth;
            this.setLineStyle(ctx, box.borderStyle);
            ctx.strokeRect(x1, y1, width, height);
            ctx.setLineDash([]);
        }

        // Text
        if (box.text) {
            const fontSize = box.textSize ?? 12;
            ctx.fillStyle = box.textColor ?? '#ffffff';
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const tx = x1 + width / 2;
            const ty = y1 + height / 2;
            ctx.fillText(box.text, tx, ty);
        }
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
