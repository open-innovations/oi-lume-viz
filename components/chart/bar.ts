import { renderBarChart, resolveData, addVirtualColumns } from "./helpers.ts";
import type { AxisOptions, SeriesOptions } from "./types.ts";
import { getAssetPath } from "../../lib/util/paths.ts"
import { clone } from "../../lib/util/clone.ts";


export const css = `
.tooltip { color: black; margin-top: -0.75em; transition: left 0.03s linear, top 0.03s linear; white-space: nowrap; filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.7)); }
.tooltip .inner { padding: 1em; }
`;


/**
 * Options provided to the Bar Chart
 */
export interface BarChartOptions {
  /** Whether the bar chart is stacked or not */
  stacked: boolean;
  /** Data provided to the chart is expected to be an array of objects (mandatory) */
  data: Record<string, unknown>[] | string;
  /** Name of the category (mandatory) */
  category: string;
  /** Configuration of each of the series (mandatory) */
  series: Partial<SeriesOptions>[];
  /** Configuration of the axes */
  axis: {
    x: Partial<AxisOptions>;
  };
}


/**
 * @param options Options to validate
 */
function checkOptions(options: BarChartOptions): void {
  if (options.data === undefined) throw new TypeError("Data not provided");
  if (options.data.length === 0) {
    throw new TypeError("Data provided has no entries");
  }
}

export default function (input: {
  config: Partial<BarChartOptions>;
}): string {
  const config = clone(input.config);
  
  // If the data parameter is a string, resolve it from the input to this function
  // Lume components have access to entire build context (as do pages).
  if (typeof config.data === "string") {
    config.data = resolveData(config.data, input) as Record<string, unknown>[];
  }

  // Create any defined columns
  config.data = addVirtualColumns(config);

  // We can optionally set defaults in this
  const defaults: Partial<BarChartOptions> = {
    stacked: false,
    axis: {
      x: {},
    }
  };
  // This might be a fragile merge!
  const options = {
    ...defaults,
    ...config,
  } as BarChartOptions;

  // Error checking
  checkOptions(options);

  // Call the bar render function
  const chart = renderBarChart(options);

  return `<div class="chart" data-dependencies="${ getAssetPath('/js/chart.js') }">${chart}</div>`;
}
