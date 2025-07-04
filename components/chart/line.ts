import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { renderLineChart } from "./helpers.ts";
import { VisualisationHolder } from '../../lib/holder.js';
import type { AxisOptions, SeriesOptions } from "./types.ts";
import { getAssetPath } from "../../lib/util/paths.ts"
import { clone } from "../../lib/util/clone.ts";


/**
 * Options provided to the Line Chart
 */
export interface LineChartOptions {
  /** Data provided to the chart is expected to be an array of objects (mandatory) */
  data: Record<string, unknown>[] | string;
  /** Name of a common x-axis category - over-rided by 'x' set in an individual series  */
  category?: string;
  /** Configuration of each of the series (mandatory) */
  series: Partial<SeriesOptions>[];
  /** Configuration of the axes */
  axis: {
    x: Partial<AxisOptions>;
    y: Partial<AxisOptions>;
  };
}


/**
 * @param options Options to validate
 */
function checkOptions(options: LineChartOptions): void {
  if (options.data === undefined) throw new TypeError("Data not provided");
  if (options.data.length === 0) {
    throw new TypeError("Data provided has no entries");
  }
}

export default function (input: {
  config: Partial<LineChartOptions>;
}): string {
  const config = clone(input.config);

  // Convert references into actual objects
  config.data = thingOrNameOfThing<TableData<string | number>>(
    config.data,
    input,
  );

  // In case it was a CSV file loaded
  if(config.data.rows) config.data = config.data.rows;

  // Create any defined columns
  config.data = addVirtualColumns(config);

  // We can optionally set defaults in this
  const defaults: Partial<LineChartOptions> = {
    axis: {
      x: {},
      y: {},
    }
  };
  // This might be a fragile merge!
  const options = {
    ...defaults,
    ...config,
  } as LineChartOptions;

  // Error checking
  checkOptions(options);

  // Call the line render function
  const chart = renderLineChart(options);

  const holder = new VisualisationHolder(options,{'name':'line chart'});
  holder.addDependencies(['/js/tooltip.js','/js/chart.js']);
  holder.addClasses(['oi-chart','oi-chart-line']);
  return holder.wrap(chart);
}
