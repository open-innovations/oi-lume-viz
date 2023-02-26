import type { BarChartOptions } from "./bar.ts";
import type { AxisOptions, TickOptions } from "./types.ts";
import { BarChart } from "./legacy/bar.js";
import { StackedBarChart } from "./legacy/stacked-bar.js";

const arraySum = (array: number[]) => array.reduce((a, b) => a + b, 0);
const findSmallest = (a: number, v: number[]) => Math.min(a, ...v);
const findLargest = (a: number, v: number[]) => Math.max(a, ...v);

/**
 * Recursive function to resolve data from a given context
 *
 * @param ref dot-separated reference to the dataset
 * @param context the context in which to search for the data
 * @returns
 */
export function resolveData(
  ref: string,
  context: Record<string, unknown>,
): unknown {
  // Find first . in ref
  const cutMark = ref.indexOf('.');
  // If no ., we're done: return the reference
  if (cutMark === -1) return context[ref];
  // Work out the current key
  const key = ref.slice(0, cutMark);
  // ...and the rest
  const rest = ref.slice(cutMark + 1);
  // Return the result of calling this function using these
  return resolveData(rest, context[key] as Record<string, unknown>);
}

export function calculateRange(
  config: Partial<BarChartOptions>,
  tickSize: number | undefined = undefined,
) {
  const seriesKeys = config.series!.map((s) => s.value!);
  const values = (config.data as Record<string, unknown>[]).map((d) =>
    seriesKeys.map((v) => d[v] as number)
  );

  // TODO(@giles) Round up / down is based on whether it's max or min, not above or below zero
  const roundToTickSize = (value: number) => {
    const rounder = value > 0 ? Math.ceil : Math.floor;
    if (!tickSize) return value;
    return rounder(value / tickSize) * tickSize;
  };
  if (config.stacked) {
    return {
      min: roundToTickSize(Math.min(...values.map(arraySum), 0)),
      max: roundToTickSize(Math.max(...values.map(arraySum), 0)),
    };
  }
  // TODO(@giles) use Math.max(...values.flat(), 0) ertc
  return {
    min: roundToTickSize(values.reduce(findSmallest, 0)),
    max: roundToTickSize(values.reduce(findLargest, 0)),
  };
}

export function generateTicks(config: AxisOptions): TickOptions[] {
  const { tickSize } = config;
  if (tickSize === undefined) return [];
  // If tickSize undefined, set a sensible default based on max and min
  const max = Math.floor(config.max / tickSize) * tickSize;
  const min = Math.floor(config.min / tickSize) * tickSize;
  const tickCount = ((max - min) / tickSize) + 1;
  const ticks = Array.from(new Array(tickCount)).map<TickOptions>((_, i) => {
    const v = i * tickSize;
    return {
      value: v,
      label: v.toString(),
      "font-weight": "normal",
    };
  });
  return ticks;
}

// Simple wrapper around existing legacy
export function renderBarChart(config: BarChartOptions) {
  // Auto set range for x axis
  const range = calculateRange(config, config.axis.x.tickSize);
  if (config.axis.x.min === undefined) config.axis.x.min = range.min;
  if (config.axis.x.max === undefined) config.axis.x.max = range.max;

  // Auto generate ticks if not provided
  if (config.axis.x.ticks === undefined) {
    config.axis.x.ticks = generateTicks(config.axis.x as AxisOptions);
  }

  const csv = explodeObjectArray(config.data as Record<string, unknown>[]);
  if (config.stacked === true) {
    const chart = new StackedBarChart(config, csv);
    return chart.getSVG();
  }
  const chart = new BarChart(config, csv);
  return chart.getSVG();
}

/* TODO(@giles) Potentially rely on code from CSV loader */
function explodeObjectArray(objectArray: Record<string, unknown>[]) {
  const columnNames = [
    ...new Set(objectArray.map((x) => Object.keys(x)).flat()),
  ];
  const columns = columnNames.reduce<Record<string, unknown>>(
    (result, name) => ({
      ...result,
      [name]: objectArray.map((x) => x[name]),
    }),
    {},
  );
  // This is the minimum viable csv structure
  return {
    // TODO(@giles) does this need to be cloned?
    rows: objectArray,
    columns,
  };
}
