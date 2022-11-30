import { render } from "./legacy/bar.js";
import { SeriesOptions } from "./types.ts";

/**
 * Options provided to the Bar Chart
 */
export interface BarChartOptions {
  /** Data provided to the chart is expected to be an array of objects */
  data: { [property: number]: unknown }[];
  /** Configuration of each of the series */
  series: Partial<SeriesOptions>[];
}

/**
 * 
 * @param options Options to validate
 */
function checkOptions(options: BarChartOptions): void {
  if (options.data === undefined) throw new TypeError("Data not provided");
  if (options.data.length === 0) throw new TypeError("Data provided has no entries");
}

export default function (config: Partial<BarChartOptions>): string {
  // We can optionally set defaults in this 
  const defaults: Partial<BarChartOptions> = {};
  // This might be a fragile merge!
  const options = {
    ...defaults,
    ...config,
  } as BarChartOptions;

  // Error checking
  checkOptions(options);

  // Call the bar render function
  const chart = render(options);

  return `<div class="chart" data-dependencies="/assets/js/chart.js">${chart}</div>`;
}
