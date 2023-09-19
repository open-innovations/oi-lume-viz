import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { getAssetPath } from "../../lib/util/paths.ts"
import { clone } from "../../lib/util/clone.ts";
import { VisualisationHolder } from '../../lib/holder.js';
import { Colour, ColourScale,Colours } from "../../lib/colour/colours.ts";
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
.oi-waffle-chart .marker-group:hover, .oi-waffle-chart .marker-group:focus { outline: none; stroke-width: 4px; stroke: black; }
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
	// Define some colours
	const namedColours = Colours(config.colours);

	// Add default points
	for(let s = 0; s < config.series.length; s++){
		if(!config.series[s].points) config.series[s].points = clone(defaultmark);
	}

	// Loop over series and create the bins
	for(let s = 0; s < config.series.length; s++){

		if(config.series[s].value && config.series[s].value in config.data[0]){
			let v = config.data[0][config.series[s].value];
			if(typeof v !== "number") throw new TypeError('Data for row '+s+' with value "'+config.series[s].value+'" is not a number.');

			// Find out how many bins to show
			v = Math[config.rounding].call(this, nbins * config.data[0][config.series[s].value] / config.total);

			// For this series, create the bins
			for(let i = 0; i < v; i++){
				icon = config.series[s].icon||config.icon;
				bins[bin] = {'series':s,'icon':icon,'colour':namedColours.get(config.series[s].colour)||defaultbg,'tooltip':config.data[0][config.series[s].tooltip]||((config.series[s].title||config.series[s].value)+":\n"+config.data[0][config.series[s].value]),'data':true,'point':clone(config.series[s].points)};
				bin++;
			}
		}

	}

	let defaultbin = {'series':-1,'icon':icon,'colour':defaultbg,'tooltip':'','data':false,'point':clone(defaultmark)};
	let lst = config.series.length-1;
	if(config.series.length > 0 && !config.series[lst].value){
		if(config.series[lst].colour) defaultbin.colour = namedColours.get(config.series[lst].colour);
		if(config.series[lst].tooltip) defaultbin.tooltip = config.data[0][config.series[lst].tooltip];
		if(config.series[lst].points) defaultbin.point = clone(config.series[lst].points);
	}
	

	// Fill up the rest of the bins
	for(let i = bin; i < bins.length; i++) bins[i] = clone(defaultbin);

	let w = config.width || 1080;
	let h = config.height || (w*size[1]/size[0]);
	let p = config.padding || 4;	// Set the default spacing between bins

	// Work out the width and height of each bin minus any spacing
	let dw = (w - p*(cols - 1))/cols;
	let dh = (h - p*(rows - 1))/rows;

	let svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="width:'+w+'px;max-width:100%;height:'+h+'px" viewBox="0 0 '+w.toFixed(3)+' '+h.toFixed(3)+'" vector-effect="non-scaling-stroke" preserveAspectRatio="xMidYMin meet" overflow="visible" class="oi-chart-main" data-type="waffle-chart" data-gravity="'+config.gravity+'">';
	let x,y,i,j,r,c,dw2,grid;

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
		let startSeries = (b==0 || (b > 0 && bins[b].series!=bins[b-1].series));
		let endSeries = (b == bins.length-1 || (b > 0 && b < bins.length-1 && bins[b+1].series!=bins[b].series));

		mark.setAttr({'fill':(namedColours.get(bins[b].colour)||defaultbg)}); // Update the point
		mark.setPosition(x,y);

		if(startSeries){
			grid = new Grid(cols,rows);
			svg += '<g class="series" data-series="'+s+'">';
		}

		grid.fill(i,j);

		svg += mark.el.outerHTML;

		if(endSeries){
			svg += '<path class="marker marker-group" data-series="'+s+'" d="'+grid.getBoundary(w/cols)+'" fill="transparent" data-fill="'+(namedColours.get(bins[b].colour)||defaultbg)+'">';
			svg += (bins[b].tooltip ? '<title>'+bins[b].tooltip+'</title>' : '');
			svg += '</path>';
		}
		if(endSeries) svg += '</g>';

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
				'points':config.series[s].points||defaultmark,
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

function Grid(cols,rows){
	this.cell = new Array(rows);
	for(let r = 0; r < rows; r++){
		this.cell[r] = new Array(cols);
		for(let c = 0;c < cols; c++){
			this.cell[r][c] = 0;
		}
	}

	this.fill = function(c,r){
		this.cell[r][c] = 1;
	};

	this.getBoundary = function(size,pad){
		return getPathFromValue(this.cell,1,size,pad);
	};
	return this;
}

// Adapted from https://github.com/kazuhikoarase/qrcode-generator/blob/master/js/qrcode.js
// Released under MIT licence
function getPathFromValue(pattern,v,cellSize,pad){
	var pointEquals = function (a, b) { return a[0] === b[0] && a[1] === b[1]; };
	if(typeof cellSize!=="number") cellSize = 1;
	if(!pad) pad = {};
	if(typeof pad.left!=="number") pad.left = 0;
	if(typeof pad.top!=="number") pad.top = 0;

	// Mark all four edges of each square in clockwise drawing direction
	let edges = [];
	let row,col,x0,y0,x1,y1,i,j,k,l,d,polygons,polygon,edge,foundEdge,p1,p2,p3,point,polygon2,point2;
	for (row = 0; row < pattern.length; row++) {
		for (col = 0; col < pattern[row].length; col++) {
			if (pattern[row][col]==v){
				x0 = col * cellSize + (col > 0 ? pad.left : 0);
				y0 = row * cellSize + (row > 0 ? pad.top : 0);
				x1 = (col + 1) * cellSize + pad.left;
				y1 = (row + 1) * cellSize + pad.top;
				edges.push([[x0, y0], [x1, y0]]);	 // top edge (to right)
				edges.push([[x1, y0], [x1, y1]]);	 // right edge (down)
				edges.push([[x1, y1], [x0, y1]]);	 // bottom edge (to left)
				edges.push([[x0, y1], [x0, y0]]);	 // left edge (up)
			}
		}
	}

	// Edges that exist in both directions cancel each other (connecting the rectangles)
	for (i = edges.length - 1; i >= 0; i--) {
		for (j = i - 1; j >= 0; j--) {
			if (pointEquals(edges[i][0], edges[j][1]) &&
				pointEquals(edges[i][1], edges[j][0])) {
				// First remove index i, it's greater than j
				edges.splice(i, 1);
				edges.splice(j, 1);
				i--;
				break;
			}
		}
	}

	polygons = [];
	while (edges.length > 0) {
		// Pick a random edge and follow its connected edges to form a path (remove used edges)
		// If there are multiple connected edges, pick the first
		// Stop when the starting point of this path is reached
		polygon = [];
		polygons.push(polygon);
		edge = edges.splice(0, 1)[0];
		polygon.push(edge[0]);
		polygon.push(edge[1]);
		do {
			foundEdge = false;
			for (i = 0; i < edges.length; i++) {
				if (pointEquals(edges[i][0], edge[1])) {
					// Found an edge that starts at the last edge's end
					foundEdge = true;
					edge = edges.splice(i, 1)[0];
					p1 = polygon[polygon.length - 2];	 // polygon's second-last point
					p2 = polygon[polygon.length - 1];	 // polygon's current end
					p3 = edge[1];	 // new point
					// Extend polygon end if it's continuing in the same direction
					if (p1[0] === p2[0] &&	 // polygon ends vertical
						p2[0] === p3[0]) {	 // new point is vertical, too
						polygon[polygon.length - 1][1] = p3[1];
					}
					else if (p1[1] === p2[1] &&	 // polygon ends horizontal
						p2[1] === p3[1]) {	 // new point is horizontal, too
						polygon[polygon.length - 1][0] = p3[0];
					}
					else {
						polygon.push(p3);	 // new direction
					}
					break;
				}
			}
			if (!foundEdge)
				throw new Error("no next edge found at", edge[1]);
		}
		while (!pointEquals(polygon[polygon.length - 1], polygon[0]));
		
		// Move polygon's start and end point into a corner
		if (polygon[0][0] === polygon[1][0] &&
			polygon[polygon.length - 2][0] === polygon[polygon.length - 1][0]) {
			// start/end is along a vertical line
			polygon.length--;
			polygon[0][1] = polygon[polygon.length - 1][1];
		}
		else if (polygon[0][1] === polygon[1][1] &&
			polygon[polygon.length - 2][1] === polygon[polygon.length - 1][1]) {
			// start/end is along a horizontal line
			polygon.length--;
			polygon[0][0] = polygon[polygon.length - 1][0];
		}
	}
	// Repeat until there are no more unused edges

	// If two paths touch in at least one point, pick such a point and include one path in the other's sequence of points
	for (i = 0; i < polygons.length; i++) {
		polygon = polygons[i];
		for (j = 0; j < polygon.length; j++) {
			point = polygon[j];
			for (k = i + 1; k < polygons.length; k++) {
				polygon2 = polygons[k];
				for (l = 0; l < polygon2.length - 1; l++) {	 // exclude end point (same as start)
					point2 = polygon2[l];
					if (pointEquals(point, point2)) {
						// Embed polygon2 into polygon
						if (l > 0) {
							// Touching point is not other polygon's start/end
							polygon.splice.apply(polygon, [j + 1, 0].concat(
								polygon2.slice(1, l + 1)));
						}
						polygon.splice.apply(polygon, [j + 1, 0].concat(
							polygon2.slice(l + 1)));
						polygons.splice(k, 1);
						k--;
						break;
					}
				}
			}
		}
	}

	// Generate SVG path data
	d = "";
	for (i = 0; i < polygons.length; i++) {
		polygon = polygons[i];
		d += "M" + polygon[0][0] + "," + polygon[0][1];
		for (j = 1; j < polygon.length; j++) {
			if (polygon[j][0] === polygon[j - 1][0])
				d += "v" + (polygon[j][1] - polygon[j - 1][1]);
			else
				d += "h" + (polygon[j][0] - polygon[j - 1][0]);
		}
		d += "z";
	}
	return d;
}