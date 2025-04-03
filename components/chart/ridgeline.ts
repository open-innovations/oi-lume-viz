import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { renderRidgeLineChart } from "./helpers.ts";
import { VisualisationHolder } from '../../lib/holder.js';
import type { AxisOptions, SeriesOptions } from "./types.ts";
import { getAssetPath } from "../../lib/util/paths.ts"
import { clone } from "../../lib/util/clone.ts";


/**
 * Options provided to the Line Chart
 */
export interface RidgeLineChartOptions {
  /** Data provided to the chart is expected to be an array of objects (mandatory) */
  data: Record<string, unknown>[] | string;
  /** Name of a common x-axis category - over-rided by 'x' set in an individual series  */
  category?: string;
  gradient?: Partial<GradientOptions>[];
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
function checkOptions(options: RidgeLineChartOptions): void {
  if (options.data === undefined) throw new TypeError("Data not provided");
  if (options.data.length === 0) {
    throw new TypeError("Data provided has no entries");
  }
}

export default function (input: {
  config: Partial<RidgeLineChartOptions>;
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
  const defaults: Partial<RidgeLineChartOptions> = {
    axis: {
      x: {},
      y: {},
    }
  };
  // This might be a fragile merge!
  const options = {
    ...defaults,
    ...config,
  } as RidgeLineChartOptions;

  // Error checking
  checkOptions(options);

  // Call the line render function
  const chart = renderRidgeLineChart(options);

  var holder = new VisualisationHolder(options,{'name':'ridgeline chart'});
  holder.addDependencies(['/js/tooltip.js','/js/chart.js']);
  holder.addClasses(['oi-chart','oi-chart-ridgeline']);
  return holder.wrap(chart);
}
