import { renderBarChart } from "./helpers.ts";
import type { AxisOptions, SeriesOptions } from "./types.ts";
import { getAssetPath } from "../../lib/util/paths.ts"

/**
 * Options provided to the Bar Chart
 */
export interface BarChartOptions {
  /** Whether the bar chart is stacked or not */
  stacked: boolean;
  /** Data provided to the chart is expected to be an array of objects (mandatory) */
  data: { [property: number]: unknown }[] | string;
  /** Name of the category (mandatory) */
  category: string;
  /** Configuration of each of the series (mandatory) */
  series: Partial<SeriesOptions>[];
  /** Configuration of the axes */
  axis: {
    x: Partial<AxisOptions>;
  };
}

/*
data: monthly_count.rows,
legend: {
  show: true,
  position: "top right"
},
axis: {
  x: {
    title: {
      label: "Count of articles"
    },
    "font-weight": "normal",
    min: 0, max: 450,
    grid: {
      "stroke-dasharray": "2 4",
      "stroke-width": 1
    },
    ticks: [
      { label: '0', value: 0, 'font-weight': 'normal' },
      { label: '100', value: 100, 'font-weight': 'normal' },
      { label: '200', value: 200, 'font-weight': 'normal' },
      { label: '300', value: 300, 'font-weight': 'normal' },
      { label: '400', value: 400, 'font-weight': 'normal' }
    ]
  },
  y: {
    title: {
      label: "Month"
    },
    "font-weight": "normal",
    grid: {
      "stroke-width": 0.5
    }
  }
*/


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

function banana() {
  throw new Error("Function not implemented.");
}
