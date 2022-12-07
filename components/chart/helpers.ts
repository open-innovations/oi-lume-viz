import type { BarChartOptions } from './bar.ts';
import { BarChart } from './legacy/bar.js';
import { StackedBarChart } from './legacy/stacked-bar.js';
import { getAllKeysFromArrayOfRecords, getValuesInColumnOfArrayOfRecords } from '../../lib/util/object.ts';

import { _InternalSeriesControlStructure } from "./types.ts";

/**
 * Legacy wrapper to help construct objects that replace provision of a full csv object
 * 
 * @param series 
 * @param data 
 * @returns 
 */
// deno-lint-ignore no-explicit-any
export function getSeriesDetails(series: _InternalSeriesControlStructure, options: any) {
  const columnNames = getAllKeysFromArrayOfRecords(options.data);
  const xValues = getValuesInColumnOfArrayOfRecords(series.x, options.data);
  const yValues = getValuesInColumnOfArrayOfRecords(series.y, options.data);
  const tooltips = getValuesInColumnOfArrayOfRecords(series.tooltip, options.data);
  const value = getValuesInColumnOfArrayOfRecords(series.value, options.data);
  const category = getValuesInColumnOfArrayOfRecords(options.category, options.data);
  return {
    columnNames, xValues, yValues, tooltips, category, value,
  }
}

// Simple wrapper around existing legacy
export function renderBar(config: BarChartOptions) {
  const csv = explodeObjectArray(config.data);
  if (config.stacked === true) {
    const chart = new StackedBarChart(config, csv);
    return chart.getSVG();
  }
  const chart = new BarChart(config);
  return chart.getSVG();
}

function explodeObjectArray(objectArray: Record<string, unknown>[]) {
  const columnNames = [...new Set(objectArray.map(x => Object.keys(x)).flat())];
  const columns = columnNames.reduce<Record<string, unknown>>((result, name) => ({
    ...result,
    [name]: objectArray.map(x => x[name]),
  }), {});
  // This is the minimum viable csv structure
  return {
    // TODO(@giles) does this need to be cloned?
    rows: objectArray,
    columns,
  }
}
