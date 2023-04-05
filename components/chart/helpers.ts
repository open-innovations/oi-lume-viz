import { applyReplacementFilters } from "../../lib/util.js";
import type { LineChartOptions } from "./line.ts";
import type { ScatterChartOptions } from "./scatter.ts";
import type { BarChartOptions } from "./bar.ts";
import type { AxisOptions, TickOptions } from "./types.ts";
import { LineChart } from "./legacy/line.js";
import { ScatterChart } from "./legacy/scatter.js";
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
  // Initialise the result to be the whole context.
  // If we provide no key, we should return the whole thing!
  let result = context;
  // Split the ref by the '.' character and iterate over the resulting array
  for (const key of ref.split('.')) {
    result = result[key] as Record<string, unknown>;
  }
  return result;
}

export function addVirtualColumns (
  config: unknown
) {
	let c,r,v;
	if(config.columns && config.columns.length > 0 && typeof config.data==="object" && config.data.length > 0){
		for(r = 0; r < config.data.length; r++){
			for(c = 0; c < config.columns.length; c++){
				if(config.columns[c].template){
					v = applyReplacementFilters(config.columns[c].template,config.data[r]);
					config.data[r][config.columns[c].name] = v;
				}
			}
		}
	}
	return config.data;
}

export function updateAxis (
  config: Partial<BarChartOptions|LineChartOptions|ScatterChartOptions>,
) {

	let ncategories = 0;

	// Process each axis
	for(const ax in config.axis){

		// If either the min or max value for this axis aren't set, we will calculate them
		if (config.axis[ax].min === undefined || config.axis[ax].max === undefined){
			let range = {'min':Infinity,'max':-Infinity};

			// For each series we find the min/max for each axis
			for(let s = 0; s < config.series.length; s++){
				
				let key = undefined;
				if(typeof config.series[s].value !== "undefined"){
					key = config.series[s].value[ax];
				}else{
					key = config.series[s][ax];
				}
				if(key){
					for(let i = 0; i < config.data.length; i++){
						let v = config.data[i][key];
						if(typeof v==="number"){
							range.min = Math.min(range.min,v);
							range.max = Math.max(range.max,v);
						}else{
							ncategories = config.data.length;
						}
					}
				}
			}

			// Check we have a number of categories and no valid range set, we will use a dummy range
			if(ncategories > 0 && range.min>range.max){
				range.min = 0;
				range.max = ncategories;
			}

			// Update the min.max values 
			if(typeof config.axis[ax].tickSpacing==="number"){
				if (config.axis[ax].min === undefined) config.axis[ax].min = Math.floor(range.min/config.axis[ax].tickSpacing)*config.axis[ax].tickSpacing;
				if (config.axis[ax].max === undefined) config.axis[ax].max = Math.ceil(range.max/config.axis[ax].tickSpacing)*config.axis[ax].tickSpacing;
			}else{
				config.axis[ax].min = range.min;
				config.axis[ax].max = range.max;
				if (config.axis[ax].ticks === undefined) {
					config.axis[ax].ticks = [{'value':range.min,'label':'','grid':true}];
				}
			}
		}

		// Auto generate ticks if not provided
		if (config.axis[ax].ticks === undefined) {
			config.axis[ax].ticks = generateTicks(config.axis[ax] as AxisOptions);
			// If the grid→show property is set we will make sure that each generated tick has grid set to true
			if(config.axis[ax].grid && config.axis[ax].grid.show){
				for(let t = 0; t < config.axis[ax].ticks.length; t++) config.axis[ax].ticks[t].grid = true;
			}
		}
	}

	return config;
}

export function calculateRange(
  config: Partial<BarChartOptions|LineChartOptions|ScatterChartOptions>,
  tickSpacing: number | undefined = undefined,
) {

  const seriesKeys = config.series!.map((s) => s.value!);
  const values = (config.data as Record<string, unknown>[]).map((d) =>
    seriesKeys.map((v) => d[v] as number)
  );

  // TODO(@giles) Round up / down is based on whether it's max or min, not above or below zero
  const roundToTickSize = (value: number) => {
    const rounder = value > 0 ? Math.ceil : Math.floor;
    if (!tickSpacing) return value;
    return rounder(value / tickSpacing) * tickSpacing;
  };
  if (config.stacked){
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

// Simple function to count the number of decimals in a number
function countDecimals(value) {
	if(Math.floor(value) === value) return 0;
	return value.toString().split(".")[1].length || 0;
}

export function generateTicks(config: AxisOptions): TickOptions[] {
  const { tickSpacing } = config;
  if (tickSpacing === undefined) return [];
  // If tickSpacing undefined, set a sensible default based on max and min
  const max = Math.floor(config.max / tickSpacing) * tickSpacing;
  const min = Math.floor(config.min / tickSpacing) * tickSpacing;
  const tickCount = ((max - min) / tickSpacing) + 1;

  // Find the precision of the tickSpacing
  var precision = countDecimals(tickSpacing);

  const ticks = Array.from(new Array(tickCount)).map<TickOptions>((_, i) => {
	// Round the value to the required precision
    const v = (i * tickSpacing + min).toFixed(precision);
    return {
      value: parseFloat(v),
      label: v,
      "font-weight": "normal",
    };
  });
  return ticks;
}

// Simple wrapper around existing legacy
export function renderLineChart(config: LineChartOptions) {

	// Auto set range for x axis
	config = updateAxis(config);

	const csv = explodeObjectArray(config.data as Record<string, unknown>[]);

	const chart = new LineChart(config, csv);

	return chart.getSVG();
}

// Simple wrapper around existing legacy
export function renderScatterChart(config: ScatterChartOptions) {

	// Auto set range for x axis
	config = updateAxis(config);

	const csv = explodeObjectArray(config.data as Record<string, unknown>[]);

	const chart = new ScatterChart(config, csv);

	return chart.getSVG();
}

// Simple wrapper around existing legacy
export function renderBarChart(config: BarChartOptions) {
  // Auto set range for x axis
  const range = calculateRange(config, config.axis.x.tickSpacing);
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
