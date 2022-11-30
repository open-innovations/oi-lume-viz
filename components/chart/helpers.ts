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
