/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { FullChartConfig } from '../../chart.config';
import { DataSeriesModel, VisualSeriesPoint } from '../../model/data-series.model';
import { flat } from '../../utils/array.utils';
import { HTSeriesDrawerConfig, SeriesDrawer } from '../data-series.drawer';
import VisualCandle from '../../model/visual-candle';

const POINT_RANGE_RADIUS = 2;

export interface PointRangeStyle {
    mainColor: string;
}

export class PointRangeDrawer implements SeriesDrawer {
    constructor(
        private config: FullChartConfig,
        private colorConfig: PointRangeStyle,
    ) { }

    public draw(
        ctx: CanvasRenderingContext2D,
        points: VisualSeriesPoint[][],
        model: DataSeriesModel,
        hitTestDrawerConfig: HTSeriesDrawerConfig,
    ) {
        const interval = this.config.components.chart.pointRange?.interval ?? 10;
        const radius = hitTestDrawerConfig.hoverWidth ? hitTestDrawerConfig.hoverWidth / 2 : POINT_RANGE_RADIUS;
        const color = hitTestDrawerConfig.color ?? this.colorConfig.mainColor;

        ctx.fillStyle = color;

        for (const visualPoint of flat(points)) {
            // Cast to VisualCandle to access high/low
            const visualCandle = visualPoint as VisualCandle;
            if (!visualCandle.high || !visualCandle.low) {
                // Fallback: just draw a single dot at close price
                ctx.beginPath();
                const lineX = model.view.toX(visualCandle.centerUnit);
                const closeY = model.view.toY(visualCandle.close);
                ctx.arc(lineX, closeY, radius, 0, Math.PI * 2, true);
                ctx.fill();
                continue;
            }

            const highPrice = visualCandle.high;
            const lowPrice = visualCandle.low;
            const lineX = model.view.toX(visualCandle.centerUnit);

            // Calculate the first price level at or above lowPrice that is a multiple of interval
            const startLevel = Math.ceil(lowPrice / interval) * interval;

            // Draw dots at each interval level within the candle's range
            for (let priceLevel = startLevel; priceLevel <= highPrice; priceLevel += interval) {
                ctx.beginPath();
                const y = model.view.toY(priceLevel);
                ctx.arc(lineX, y, radius, 0, Math.PI * 2, true);
                ctx.fill();
            }
        }
    }
}
