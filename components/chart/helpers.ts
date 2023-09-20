import { applyReplacementFilters } from "../../lib/util.js";
import type { LineChartOptions } from "./line.ts";
import type { RidgeLineChartOptions } from "./ridgeline.ts";
import type { ScatterChartOptions } from "./scatter.ts";
import type { BarChartOptions } from "./bar.ts";
import type { AxisOptions, TickArray } from "./types.ts";
import { LineChart } from "./legacy/line.js";
import { RidgeLineChart } from "./legacy/ridgeline.js";
import { ScatterChart } from "./legacy/scatter.js";
import { BarChart } from "./legacy/bar.js";
import { StackedBarChart } from "./legacy/stacked-bar.js";
import { getTimeTicks } from "../../lib/external/DateMaths.js";

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

export function updateAxis (
  config: Partial<BarChartOptions|LineChartOptions|RidgeLineChartOptions|ScatterChartOptions>,
) {

	let ncategories = 0;

	// Process each axis
	for(const ax in config.axis){

		if(!config.axis[ax].tick){ config.axis[ax].tick = {}; }

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
						// Convert dates to dummy dates
						if(typeof v==="string" && v.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)){
							v = parseInt(v.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2})/,function(m,p1){ return (new Date(p1)).getTime(); }));
							if(!config.data[i][key+'__dummy']) config.data[i][key+'__dummy'] = v;
						}
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
			if(typeof config.axis[ax].tick.type==="string"){
				config.axis[ax].min = range.min;
				config.axis[ax].max = range.max;
			}else{
				if(typeof config.axis[ax].tick.spacing==="number"){
					if (config.axis[ax].min === undefined) config.axis[ax].min = Math.floor(range.min/config.axis[ax].tick.spacing)*config.axis[ax].tick.spacing;
					if (config.axis[ax].max === undefined) config.axis[ax].max = Math.ceil(range.max/config.axis[ax].tick.spacing)*config.axis[ax].tick.spacing;
				}else{
					config.axis[ax].min = range.min;
					config.axis[ax].max = range.max;
					// Only create a default tick if none have been defined and this isn't a ridgeline plot
					if (config.axis[ax].ticks === undefined && config.type!=="ridgeline") {
						config.axis[ax].ticks = [{'value':range.min,'label':'','grid':true}];
					}
				}
			}
		}

		// Auto generate ticks if not provided
		if (typeof config.axis[ax].ticks === "undefined") {
			config.axis[ax].ticks = generateTicks(config.axis[ax] as AxisOptions);
			// If the grid→show property is set we will make sure that each generated tick has grid set to true
			if(config.axis[ax].grid && config.axis[ax].grid.show){
				for(let t = 0; t < config.axis[ax].ticks.length; t++) config.axis[ax].ticks[t].grid = true;
			}else if(config.axis[ax].line && config.axis[ax].line.show){
				// If the line is set, enable the grid line for the first tick mark
				config.axis[ax].ticks[0].grid = true;
			}
		}
	}

	return config;
}

export function calculateRange(
  config: Partial<BarChartOptions|LineChartOptions|RidgeLineChartOptions|ScatterChartOptions>,
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

export function generateTicks(config: AxisOptions): TickArray[] {
	let ticks = [];

	if(!config.tick){ config.tick = {}; }

	if(typeof config.tick.type==="string"){

		let rtn = getTimeTicks(config);
		config.min = rtn.min.toValue();
		config.max = rtn.max.toValue();
		ticks = rtn.ticks;
		for(let t = 0; t < ticks.length; t++) ticks[t]["font-weight"] = "normal";

	}else{

		if(config.tick.spacing === undefined) return [];

		// If config.tick.spacing undefined, set a sensible default based on max and min
		const max = Math.floor(config.max / config.tick.spacing) * config.tick.spacing;
		const min = Math.floor(config.min / config.tick.spacing) * config.tick.spacing;

		// Make sure to round the tickCount to the nearest integer
		// to avoid floating point precision errors
		const tickCount = Math.round(((max - min) / config.tick.spacing) + 1);

		// Find the precision of the config.tick.spacing
		var precision = countDecimals(config.tick.spacing);

		ticks = Array.from(new Array(tickCount)).map<TickArray>((_, i) => {
			// Round the value to the required precision
			let v = (i * config.tick.spacing + min).toFixed(precision);
			let label =  (config.tick.abels ? config.tick.labels[Math.floor(config.tick.labels.length*i/tickCount)] : v);
			if(typeof config.tick.format==="function"){
				label = config.tick.format.call(this,i * config.tick.spacing + min);
			}
			return {
				value: parseFloat(v),
				label: label,
				"font-weight": "normal",
			};
		});
	}
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
export function renderRidgeLineChart(config: RidgeLineChartOptions) {

	// Pass in the type so we can do special things in updateAxis()
	config.type = "ridgeline";

	// Auto set range for x axis
	config = updateAxis(config);

	const csv = explodeObjectArray(config.data as Record<string, unknown>[]);

	const chart = new RidgeLineChart(config, csv);

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
  if(!config.axis.x.tick) config.axis.x.tick = {};
  // Auto set range for x axis
  const range = calculateRange(config, config.axis.x.tick.spacing);
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
