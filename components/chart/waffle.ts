import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { getAssetPath } from "../../lib/util/paths.ts"
import { clone } from "../../lib/util/clone.ts";
import { VisualisationHolder } from '../../lib/holder.js';
import { Colour, ColourScale } from "../../lib/colour/colours.ts";
import { getBackgroundColour } from "../../lib/colour/colour.ts";
import type { AxisOptions, SeriesOptions } from "./types.ts";
import { getFontFamily, getFontWeight, getFontSize } from '../../lib/font/fonts.ts';
import { Marker } from './legacy/marker.js';
import { KeyItem } from './legacy/keyitem.js';

const defaultbg = getBackgroundColour();
const fontFamily = getFontFamily();
const fontWeight = getFontWeight();
const fontSize = getFontSize();


export const css = `
/* OI waffle chart component */
.oi-waffle-chart { text-align: center; }
.oi-waffle-chart .marker:hover, .oi-waffle-chart .marker:focus { outline: 4px solid black; }
`;


type WaffleChartOptions = {
	/** The data holding the values to be used */
	data: { [key: string]: unknown }[];
	/** Configuration of each of the series (mandatory) */
	series: Partial<SeriesOptions>[];
	size?: number | [number, number];
	max?: number | string;
	gravity?: string;
	icon?: string;
	rounding?: string;
	legend?: { show: boolean, position?: string };
}

/**
 * @param options Options to validate
 */
function checkOptions(options: WaffleChartOptions): void {
	if(options.data === undefined) throw new TypeError("Waffle chart: data not provided.");
	if(options.data.length === 0) throw new TypeError("Waffle chart: data provided has no entries.");
	if(options.series === undefined) throw new TypeError("Waffle chart: series not provided.");
	if(options.series.length === 0) throw new TypeError("Waffle chart: series has no entries.");
	if(typeof options.size !== "number" && !Array.isArray(options.size)) throw new TypeError("Waffle chart: 'size' is not a number or array of numbers.");
	if(typeof options.total !== "number" && typeof options.total !== "string") throw new TypeError("Waffle chart: 'total' is not a number or reference to a data key.");
	if(typeof options.total === "string" && typeof options.data[0][options.total] !== "number") throw new TypeError("Waffle chart: 'total' is not data key.");
	if(typeof options.icon !== "string") throw new TypeError("Waffle chart: 'icon' is not a string.");
	if(typeof options.rounding !== "string") throw new TypeError("Waffle chart: 'rounding' is not a string.");
	if(typeof Math[options.rounding] !== "function") throw new TypeError("Waffle chart: unknown rounding type.");
	if(typeof options.gravity !== "string") throw new TypeError("Waffle chart: 'gravity' is not a string.");
	if(options.gravity !== "bottom" && options.gravity !== "top" && options.gravity !== "left" && options.gravity !== "right") throw new TypeError("Waffle chart: 'gravity' is not one of bottom/left/top/right.");
	if(typeof options.direction !== "string") throw new TypeError("Waffle chart: 'direction' is not a string.");
	if(options.direction !== "ltr" && options.direction !== "rtl") throw new TypeError("Waffle chart: 'direction' is not one of ltr/rtl.");
}


export default function (input: {
	config: Partial<WaffleChartOptions>;
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
	const defaults: Partial<WaffleChartOptions> = {
		size: 10,
		icon: 'square',
		total: 100,
		gravity: 'bottom',
		direction: 'ltr',
		rounding: 'round',
		legend: { show: false }
	};
	// This might be a fragile merge!
	const options = {
		...defaults,
		...config,
	} as WaffleChartOptions;

	// Error checking
	checkOptions(options);

	return WaffleChart(options);
}


function WaffleChart(config: Partial<WaffleChartOptions>): unknown {

	// Turn a 'size' from a number to an array of two numbers
	// one for the x and one for the y direction
	if(typeof config.size==="number") config.size = [config.size,config.size];

	if(typeof config.total==="string") config.total = config.data[0][config.total];

	let size = config.size;
	let cols = size[0];	// Number of columns
	let rows = size[1];	// Number of rows
	let bins = new Array(size[0]*size[1]);
	let icon;
	let bin = 0;
	let nbins = bins.length;
	let defaultmark = {'marker':'square'};

	for(let s = 0; s < config.series.length; s++){
		if(!config.series[s].points) config.series[s].points = clone(defaultmark);
	}

	// Loop over series and create the bins
	for(let s = 0; s < config.series.length; s++){

		let v = config.data[0][config.series[s].value];
		if(typeof v !== "number") throw new TypeError('Data for row '+s+' with value "'+config.series[s].value+'" is not a number.');

		// Find out how many bins to show
		v = Math[config.rounding].call(this, nbins * config.data[0][config.series[s].value] / config.total);

		// For this series, create the bins
		for(let i = 0; i < v; i++){
			icon = config.series[s].icon||config.icon;
			bins[bin] = {'series':s,'icon':icon,'colour':config.series[s].colour||defaultbg,'tooltip':config.data[0][config.series[s].tooltip]||((config.series[s].title||config.series[s].value)+":\n"+config.data[0][config.series[s].value]),'data':true,'point':clone(config.series[s].points)};
			bin++;
		}

	}


	// Fill up the rest of the bins
	for(let i = bin; i < bins.length; i++) bins[i] = {'series':-1,'icon':icon,'colour':defaultbg,'tooltip':'','data':false,'point':clone(defaultmark)};

	let w = config.width || 1080;
	let h = config.height || (w*size[1]/size[0]);
	let p = config.padding || 4;	// Set the default spacing between bins

	// Work out the width and height of each bin minus any spacing
	let dw = (w - p*(cols - 1))/cols;
	let dh = (h - p*(rows - 1))/rows;

	let svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="width:'+w+'px;max-width:100%;height:'+h+'px" viewBox="0 0 '+w.toFixed(3)+' '+h.toFixed(3)+'" vector-effect="non-scaling-stroke" preserveAspectRatio="xMidYMin meet" overflow="visible" class="oi-chart-main" data-type="waffle-chart" data-gravity="'+config.gravity+'">';
	let x,y,i,j,r,c,dw2;

	// Scale by the diagonal
	dw2 = dw * Math.sqrt(2);

	for(let b = 0; b < bins.length; b++){


		r = Math.floor(b / cols);
		c = b % cols;

		if(config.gravity=="bottom"){

			i = (config.direction=="ltr" ? (b % cols) : (cols - 1 -(b % cols)) );
			j = rows - 1 -Math.floor(b / cols);

		}else if(config.gravity=="top"){

			i = (config.direction=="ltr" ? (b % cols) : (cols - 1 - (b % cols)) );
			j = Math.floor(b / cols);

		}else if(config.gravity=="left"){

			i = Math.floor(b / cols);
			j = (config.direction=="ltr" ? (b % cols) : (cols - 1 - (b % cols)) );

		}else if(config.gravity=="right"){

			i = rows - 1 - Math.floor(b / cols);
			j = (config.direction=="ltr" ? (cols - 1 - (b % cols)) : (b % cols) );

		}

		x = i*dw + Math.max(0,i*p) + dw/2;
		y = j*dh + Math.max(0,j*p) + dh/2;

		let s = bins[b].series+1;

		if(!bins[b].point.size){
			if(bins[b].point.marker=="square") bins[b].point.size = dw2;
			else bins[b].point.size = dw;
		}

		let mark = new Marker(bins[b].point);

		mark.setAttr({'tabindex':0,'data-series':s,'fill':(bins[b].colour||defaultbg)}); // Update the point
		mark.addClass('marker');
		mark.setPosition(x,y);
		mark.setTitle(bins[b].tooltip ? bins[b].tooltip : '');

		if(b==0 || (b > 0 && bins[b].series!=bins[b-1].series)) svg += '<g class="series" data-series="'+s+'"><path class="marker" data-series="'+s+'" fill="'+(bins[b].colour||defaultbg)+'" d="';
		svg += mark.getPath()+' ';
		if(b == bins.length-1 || (b > 0 && b < bins.length-1 && bins[b+1].series!=bins[b].series)) svg += '">' + (bins[b].tooltip ? '<title>'+bins[b].tooltip+'</title>' : '') + '</path></g>';

	}

	svg += '</svg>';



	// Create a legend for the chart
	if(config.legend.show){

		if(!config.legend.items) config.legend.items = new Array(config.series.length);

		// Create the legend items
		for(let s = 0; s < config.series.length; s++){

			config.series[s].points.color = config.series[s].colour||defaultbg;
			let keyitem = new KeyItem({
				'type':'waffle',
				'title':config.series[s].title||config.series[s].value,
				'class':'',
				's':s,
				'fontSize': fontSize,
				'itemWidth': 1,
				'points':config.series[s].points,
				'line':config.series[s].line||{}
			});
			if(!config.legend.items[s]) config.legend.items[s] = {};
			config.legend.items[s].colour = config.series[s].colour||defaultbg;
			config.legend.items[s].label = keyitem.label;

			config.legend.items[s].icon = keyitem.getSVG();
		}
	}


	var holder = new VisualisationHolder(config);
	holder.addDependencies(['/js/chart.js','/css/charts.css','/js/tooltip.js']);
	holder.addClasses(['oi-chart','oi-waffle-chart']);

	return holder.wrap(svg);
}