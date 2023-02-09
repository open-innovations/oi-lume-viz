import { renderBarChart } from "./helpers.ts";
import type { AxisOptions, SeriesOptions } from "./types.ts";
import { getAssetPath } from "../../lib/util/paths.ts"
import { clone } from "../../lib/util/clone.ts";


export const css = `
.tooltip { color: black; margin-top: -0.75em; transition: left 0.03s linear, top 0.03s linear; white-space: nowrap; font-family: CenturyGothicStd, 'Century Gothic', sans-serif; filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.7)); }
.tooltip .inner { padding: 1em; }
`;


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
    grid: {
      "stroke-dasharray": "2 4",
      "stroke-width": 1
    },
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

export default function (input: {
  config: Partial<BarChartOptions>;
}): string {
  const config = clone(input.config);
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
