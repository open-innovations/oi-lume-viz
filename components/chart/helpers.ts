import type { BarChartOptions } from "./bar.ts";
import type { AxisOptions, TickOptions } from "./types.ts";
import { BarChart } from "./legacy/bar.js";
import { StackedBarChart } from "./legacy/stacked-bar.js";

const arraySum = (array: number[]) => array.reduce((a, b) => a + b, 0);
const findSmallest = (a: number, v: number[]) => Math.min(a, ...v);
const findLargest = (a: number, v: number[]) => Math.max(a, ...v);

function calculateRange(config: BarChartOptions) {
  const values = config.series.map(s => s.value!).map(v => (config.data as Record<string, unknown>[]).map(d => d[v] as number));
  if (config.stacked) {
    return {
      min: Math.min(...values.map(arraySum), 0),
      max: Math.max(...values.map(arraySum), 0),
    }
  }
  return {
    min: values.reduce(findSmallest, 0),
    max: values.reduce(findLargest, 0),
  }
}

function generateTicks(config: AxisOptions): TickOptions[] {
  const { tickSize } = config;
  if (tickSize === undefined) return [];
  const max = Math.floor(config.max / tickSize) * tickSize;
  const min = Math.floor(config.min / tickSize) * tickSize;
  const tickCount = ((max - min) / tickSize) + 1;
  const ticks = Array.from(new Array(tickCount)).map<TickOptions>((_, i) => {
    const v = i * tickSize;
    return {
      value: v,
      label: v.toString(),
      "font-weight": "normal",
    }
  });
  return ticks;
}

// Simple wrapper around existing legacy
export function renderBarChart(config: BarChartOptions) {
  // Auto set range for x axis
  const range = calculateRange(config);
  if (config.axis.x.min === undefined) config.axis.x.min = range.min;
  if (config.axis.x.max === undefined) config.axis.x.max = range.max;

  // Auto generate ticks if not provided
  if (config.axis.x.ticks === undefined) config.axis.x.ticks = generateTicks(config.axis.x as AxisOptions);

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
