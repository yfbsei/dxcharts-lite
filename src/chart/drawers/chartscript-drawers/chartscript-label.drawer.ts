/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CanvasModel } from '../../model/canvas.model';
import { ChartScriptLabel, ChartScriptDrawingsModel } from '../../model/chartscript-drawings.model';
import { Drawer } from '../drawing-manager';
import { ScaleModel } from '../../model/scale.model';
import { Bounds } from '../../model/bounds.model';

/**
 * Native drawer for chartScriptJS labels
 * Renders labels with text, background, and arrow pointers
 */
export class ChartScriptLabelDrawer implements Drawer {
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
        const labels = this.drawingsModel.getByType<ChartScriptLabel>('label');
        if (labels.length === 0) return;

        const ctx = this.canvasModel.ctx;
        const bounds = this.getBounds();

        ctx.save();

        // Clip to chart bounds
        ctx.beginPath();
        ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.clip();

        for (const label of labels) {
            if (!label.visible) continue;
            this.drawLabel(ctx, label);
        }

        ctx.restore();
    }

    private drawLabel(ctx: CanvasRenderingContext2D, label: ChartScriptLabel): void {
        const x = this.scale.toX(label.x);
        const y = this.scale.toY(label.y);

        const fontSize = this.getFontSize(label.size);
        ctx.font = `${fontSize}px Arial`;

        const padding = 4;
        const textWidth = ctx.measureText(label.text).width;

        // Calculate background position
        const bgX = x - textWidth / 2 - padding;
        const bgHeight = fontSize + padding * 2;
        const bgY = label.style === 'label_up' ? y : y - bgHeight;
        const bgWidth = textWidth + padding * 2;

        // Draw label background with arrow
        ctx.fillStyle = label.color;
        ctx.beginPath();
        ctx.moveTo(bgX, bgY);
        ctx.lineTo(bgX + bgWidth, bgY);
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight);

        if (label.style === 'label_up') {
            ctx.lineTo(x + 5, bgY + bgHeight);
            ctx.lineTo(x, bgY + bgHeight + 6);
            ctx.lineTo(x - 5, bgY + bgHeight);
        }

        ctx.lineTo(bgX, bgY + bgHeight);

        if (label.style === 'label_down') {
            ctx.lineTo(x - 5, bgY);
            ctx.lineTo(x, bgY - 6);
            ctx.lineTo(x + 5, bgY);
        }

        ctx.closePath();
        ctx.fill();

        // Draw text
        ctx.fillStyle = label.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label.text, x, bgY + bgHeight / 2);
    }

    private getFontSize(size: number | string): number {
        if (typeof size === 'number') return size;

        switch (size) {
            case 'tiny': return 8;
            case 'small': return 10;
            case 'normal': return 12;
            case 'large': return 16;
            case 'huge': return 20;
            default: return 12;
        }
    }
}
