import { renderBarChart } from "./helpers.ts";
import { SeriesOptions } from "./types.ts";

/**
 * Options provided to the Bar Chart
 */
export interface BarChartOptions {
  /** Data provided to the chart is expected to be an array of objects */
  data: { [property: number]: unknown }[] | string;
  /** Configuration of each of the series */
  series: Partial<SeriesOptions>[];
  /** Whether the bar chart is stacked or not */
  stacked: boolean;
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

export default function ({ config }: {
  config: Partial<BarChartOptions>;
}): string {
  // TODO(@giles) make this handle nested data references as as string
  if (typeof config.data === "string") {
    throw new Error("Can't read from a string... yet");
  }

  // We can optionally set defaults in this
  const defaults: Partial<BarChartOptions> = {
    stacked: false,
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

  return `<div class="chart" data-dependencies="/assets/js/chart.js">${chart}</div>`;
}

function banana() {
  throw new Error("Function not implemented.");
}
