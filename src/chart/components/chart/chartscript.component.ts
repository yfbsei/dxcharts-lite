/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Subscription } from 'rxjs';
import { ChartBaseElement } from '../../model/chart-base-element';
import { CanvasModel } from '../../model/canvas.model';
import {
    ChartScriptDrawingsModel,
    AnyChartScriptDrawing,
    ChartScriptLine,
    ChartScriptBox,
    ChartScriptLabel,
    ChartScriptPolyline,
    ChartScriptPoint
} from '../../model/chartscript-drawings.model';
import { ChartScriptPolylineDrawer } from '../../drawers/chartscript-drawers/chartscript-polyline.drawer';
import { ChartScriptLineDrawer } from '../../drawers/chartscript-drawers/chartscript-line.drawer';
import { ChartScriptBoxDrawer } from '../../drawers/chartscript-drawers/chartscript-box.drawer';
import { ChartScriptLabelDrawer } from '../../drawers/chartscript-drawers/chartscript-label.drawer';
import { DrawingManager } from '../../drawers/drawing-manager';
import { ScaleModel } from '../../model/scale.model';
import { ChartModel } from './chart.model';
import { Bounds } from '../../model/bounds.model';
import EventBus from '../../events/event-bus';

/**
 * ChartScriptComponent - Native integration for chartScriptJS drawings
 * 
 * Provides a public API for adding/removing drawings that are rendered
 * natively through DXCharts drawer system (no canvas overlay).
 */
export class ChartScriptComponent extends ChartBaseElement {
    public readonly drawingsModel: ChartScriptDrawingsModel;
    private subscription: Subscription | null = null;

    constructor(
        private canvasModel: CanvasModel,
        private drawingManager: DrawingManager,
        private scale: ScaleModel,
        private chartModel: ChartModel,
        private eventBus: EventBus,
        private getBounds: () => Bounds,
    ) {
        super();
        this.drawingsModel = new ChartScriptDrawingsModel();
    }

    protected doActivate(): void {
        // Register drawers
        const polylineDrawer = new ChartScriptPolylineDrawer(
            this.canvasModel,
            this.drawingsModel,
            this.scale,
            this.chartModel,
            this.getBounds,
        );
        this.drawingManager.addDrawer(polylineDrawer, 'CHARTSCRIPT_POLYLINE');

        const lineDrawer = new ChartScriptLineDrawer(
            this.canvasModel,
            this.drawingsModel,
            this.scale,
            this.getBounds,
        );
        this.drawingManager.addDrawer(lineDrawer, 'CHARTSCRIPT_LINE');

        const boxDrawer = new ChartScriptBoxDrawer(
            this.canvasModel,
            this.drawingsModel,
            this.scale,
            this.getBounds,
        );
        this.drawingManager.addDrawer(boxDrawer, 'CHARTSCRIPT_BOX');

        const labelDrawer = new ChartScriptLabelDrawer(
            this.canvasModel,
            this.drawingsModel,
            this.scale,
            this.getBounds,
        );
        this.drawingManager.addDrawer(labelDrawer, 'CHARTSCRIPT_LABEL');

        // Subscribe to model changes to trigger redraws
        this.subscription = this.drawingsModel.changed.subscribe(() => {
            this.eventBus.fireDraw([this.canvasModel.canvasId]);
        });
    }

    protected doDeactivate(): void {
        this.subscription?.unsubscribe();
        this.drawingManager.removeDrawerByName('CHARTSCRIPT_POLYLINE');
        this.drawingManager.removeDrawerByName('CHARTSCRIPT_LINE');
        this.drawingManager.removeDrawerByName('CHARTSCRIPT_BOX');
        this.drawingManager.removeDrawerByName('CHARTSCRIPT_LABEL');
    }

    // Public API

    /**
     * Add a drawing
     */
    addDrawing(drawing: AnyChartScriptDrawing): void {
        this.drawingsModel.add(drawing);
    }

    /**
     * Update a drawing
     */
    updateDrawing(drawing: AnyChartScriptDrawing): void {
        this.drawingsModel.update(drawing);
    }

    /**
     * Remove a drawing by ID
     */
    removeDrawing(id: string): void {
        this.drawingsModel.remove(id);
    }

    /**
     * Clear all drawings
     */
    clearDrawings(): void {
        this.drawingsModel.clear();
    }

    /**
     * Get a drawing by ID
     */
    getDrawing(id: string): AnyChartScriptDrawing | undefined {
        return this.drawingsModel.get(id);
    }

    /**
     * Get all drawings
     */
    getAllDrawings(): AnyChartScriptDrawing[] {
        return this.drawingsModel.getAll();
    }

    // Convenience methods for creating typed drawings

    /**
     * Create and add a polyline
     */
    addPolyline(
        id: string,
        points: ChartScriptPoint[],
        color: string = '#2196F3',
        width: number = 1,
        options: Partial<ChartScriptPolyline> = {}
    ): ChartScriptPolyline {
        const polyline: ChartScriptPolyline = {
            id,
            type: 'polyline',
            visible: true,
            points,
            color,
            width,
            style: options.style ?? 'solid',
            closed: options.closed ?? false,
            fillColor: options.fillColor,
        };
        this.addDrawing(polyline);
        return polyline;
    }

    /**
     * Create and add a line
     */
    addLine(
        id: string,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string = '#2196F3',
        options: Partial<ChartScriptLine> = {}
    ): ChartScriptLine {
        const line: ChartScriptLine = {
            id,
            type: 'line',
            visible: true,
            x1,
            y1,
            x2,
            y2,
            color,
            width: options.width ?? 1,
            style: options.style ?? 'solid',
            extend: options.extend ?? 'none',
        };
        this.addDrawing(line);
        return line;
    }

    /**
     * Create and add a box
     */
    addBox(
        id: string,
        left: number,
        top: number,
        right: number,
        bottom: number,
        options: Partial<ChartScriptBox> = {}
    ): ChartScriptBox {
        const box: ChartScriptBox = {
            id,
            type: 'box',
            visible: true,
            left,
            top,
            right,
            bottom,
            bgcolor: options.bgcolor ?? 'rgba(33, 150, 243, 0.2)',
            borderColor: options.borderColor ?? '#2196F3',
            borderWidth: options.borderWidth ?? 1,
            borderStyle: options.borderStyle ?? 'solid',
            text: options.text,
            textColor: options.textColor,
            textSize: options.textSize,
        };
        this.addDrawing(box);
        return box;
    }

    /**
     * Create and add a label
     */
    addLabel(
        id: string,
        x: number,
        y: number,
        text: string,
        options: Partial<ChartScriptLabel> = {}
    ): ChartScriptLabel {
        const label: ChartScriptLabel = {
            id,
            type: 'label',
            visible: true,
            x,
            y,
            text,
            color: options.color ?? '#2196F3',
            textColor: options.textColor ?? '#ffffff',
            size: options.size ?? 'normal',
            style: options.style ?? 'none',
        };
        this.addDrawing(label);
        return label;
    }
}
