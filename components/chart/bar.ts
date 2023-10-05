import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { renderBarChart } from "./helpers.ts";
import { VisualisationHolder } from '../../lib/holder.js';
import type { AxisOptions, SeriesOptions } from "./types.ts";
import { getAssetPath } from "../../lib/util/paths.ts"
import { clone } from "../../lib/util/clone.ts";


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
	for(let ax in options.axis){
		if(options.axis[ax].tick === undefined){
			options.axis[ax].tick = {};
		}
		if(typeof options.axis[ax].tick.size!=="number"){
			options.axis[ax].tick.size = 5;
		}
	}
}

export default function (input: {
  config: Partial<BarChartOptions>;
}): string {
  const config = clone(input.config);
  
  // Convert references into actual objects
  config.data = thingOrNameOfThing<TableData<string | number>>(
    config.data,
    input,
  );

  // In case it was a CSV file loaded
  if(config.data.rows) config.data = config.data.rows;

  // Optionally use normalised (to 100%) values
  if(config.stacked && config.percent){
    
    // Find the totals for each category
    var totals = new Array(config.data.length);
    for(let r = 0; r < config.data.length; r++){
      totals[r] = 0;
      for(let s = 0; s < config.series.length; s++){
        totals[r] += config.data[r][config.series[s].value];
      }
    }

    // For each series create a percentage-based version
    for(let s = 0; s < config.series.length; s++){
      // Construct a new series ID
      let id = config.series[s].value+"_percent";
      // If the new series doesn't exist in the data...
      if(!config.data[0][id]){
        // For each row in the data
        for(let r = 0; r < config.data.length; r++){
          config.data[r][id] = (100*config.data[r][config.series[s].value]/totals[r]);
        }
        // Replace the series reference to the dummy column we have created
        config.series[s].value = id;
      }
    }
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

  var holder = new VisualisationHolder(options,{'name':'bar chart'});
  holder.addDependencies(['/js/chart.js','/css/charts.css','/js/tooltip.js']);
  holder.addClasses(['oi-chart','oi-chart-bar']);
  return holder.wrap(chart);
}
