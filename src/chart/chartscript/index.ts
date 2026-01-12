/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * ChartScript - Unified exports
 * Complete TypeScript port of chartScriptJS functions
 */

// Namespaces
export * as ta from './ta';
export * as math from './math';
export * as array from './array';
export * as matrix from './matrix';
export * as color from './color';
export * as str from './str';
export * as time from './time';

// Drawing primitives
export * as polyline from './polyline';

// Classes
export { Series, BarData } from './series';
export type { Candle } from './series';

// Integration layer (legacy chartScriptJS-compatible API)
export { bindToChart, createChart, ChartContext, DrawingManagerProxy } from './integration';

// Re-export drawing model types from existing location
export { ChartScriptDrawingsModel } from '../model/chartscript-drawings.model';
export type {
    ChartScriptLine,
    ChartScriptBox,
    ChartScriptLabel,
    ChartScriptPolyline,
    ChartScriptPoint,
    AnyChartScriptDrawing,
} from '../model/chartscript-drawings.model';

// Re-export component
export { ChartScriptComponent } from '../components/chart/chartscript.component';
