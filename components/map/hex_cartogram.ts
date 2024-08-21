import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { applyReplacementFilters } from "../../lib/util.js";
import { counter } from "../../lib/util/counter.ts";
import { clone } from "../../lib/util/clone.ts";
import { isEven } from "../../lib/util/is-even.ts";
import { Colour, ColourScale, Colours } from "../../lib/colour/colours.ts";
import { defaultColourScale, getColourScale } from "../../lib/colour/colour-scale.ts";
import { getAssetPath } from "../../lib/util/paths.ts";
import { getBackgroundColour } from "../../lib/colour/colour.ts";
import { VisualisationHolder } from '../../lib/holder.js';

const defaultbg = getBackgroundColour();

function roundNumber(v,prec){
	if(typeof prec!=="number") prec = 2;
	if(typeof v==="number") return parseFloat(v.toFixed(prec));
	else return v;
}
function roundTo(v,prec){
	if(typeof v==="number") v = v.toFixed(prec);
	return v.replace(/\.([0-9]+)0+$/,function(m,p1){ return "."+p1; }).replace(/\.0+$/,"");
}

function addTspan(str: string) {
	// If string has no newlines, just return it
	if (!str.includes("\n")) return str;

	const tspan = str.split(/\n/);
	// Build a new string
	let newString = "";
	for (let s = 0; s < tspan.length; s++) {
		const dy = 3 * ((s + 0.5) - (tspan.length / 2));
		newString += '<tspan y="' + dy + '%" x="0">' + tspan[s] + "</tspan>";
	}
	return newString;
}

/**
 * Hexmap styles
 */
export const css = `
/* OI hex cartogram component */
.oi-map-hex .hex:focus, .oi-map-hex .hex path:focus { outline: none; }
.oi-map-hex .hex.outline path { stroke: black; stroke-width: 4px; }
`;

interface HexJson { layout: string; hexes: Record<string, HexDefinition> };

type HexDefinition = {
	q: number;
	r: number;
	n: string;
	[key: string]: unknown;
};

type ColourScaleDefinition = string |
	((property: string) => string) |
	((numeric: number) => string);

type HexmapOptions = {
	bgColour?: string;
	scale: ColourScaleDefinition;
	min: number;
	max: number;
	data?: Record<string, unknown>[];
	hexjson: HexJson;
	hexScale: number;
	label?: string;
	tooltip?: string;
	margin: number;
	matchKey?: string;
	title?: string;
	titleProp: string;
	desc?: string;
	value?: string;
	colourValueProp?: string;
	tools?: { filter?: { label?: string; }, slider?: boolean; };
	legend: { position: string; items: Record<number, string> };
};

// TODO(@gilesdring) set hex to something close to rems
/**
 * Function to render a hexmap
 *
 * @param options HexmapOptions object
 */
export default function (input: { config: HexmapOptions }) {

	if(!input || !input.config){
		throw new TypeError('No options provided for hex cartogram');
	}

	// Take a copy of parameters as constants, with defaults.
	// NB these are not cloned at this stage, as this loses information about functions passed in
	let {
		bgColour = "none",
		scale = defaultColourScale(),
		hexScale = 1,
		width,
		margin: marginScale = 0.25,
		label = '',
		matchKey,
		tooltip = (label: string, value) => `${label}`,
		title = "Hexmap",
		desc = "",
		titleProp = "n",
		value = "",
		colourValueProp,
		legend,
		tools,
	} = input.config;

	// Set up some variables
	let min = input.config.min;
	let max = input.config.max;

	// Resolve data if this is a string
	let data;
	let copyconfig = clone(input.config);

	if (copyconfig.data) {

		// Convert references into actual objects
		copyconfig.data = thingOrNameOfThing<TableData<string | number>>(
			copyconfig.data,
			input,
		);

		// In case it was a CSV file loaded
		if(copyconfig.data.rows) copyconfig.data = copyconfig.data.rows;
	}
	// Handle hexjson / data as string references
	// Resolve hexjson if this is a string
	if (typeof copyconfig.hexjson === 'string') {
		// Convert references into actual objects
		copyconfig.hexjson = thingOrNameOfThing<TableData<string | number>>(
			copyconfig.hexjson,
			input,
		);
	}

	// Define some colours
	const namedColours = Colours(copyconfig.colours);

	let hexjson = clone(copyconfig.hexjson);

	// Capture the layout and hexes from the hexjson
	const layout = hexjson.layout;
	const hexes = clone(hexjson.hexes);

	// Calculate hexCadence - the narrowest dimension of the hex
	const hexCadence = hexScale * 75;
	// The margin is a multiple of the hexSize
	const margin = marginScale * hexCadence;

	// Generate a UUID to identify the hexes
	const uuid = crypto.randomUUID().substr(0,8);


	// If there is no data specified we will build it from the hexes
	if(!copyconfig.data){
		copyconfig.data = [];
		for(var id in hexes){
			let hexdata = clone(hexes[id]);
			// Keep a copy of the ID
			hexdata._id = id;
			copyconfig.data.push(hexdata);
		}
		if(!matchKey) matchKey = '_id';
	}else{
		// Merge data from hexes into data
		for(let d = 0; d < copyconfig.data.length; d++){
			let f = copyconfig.data[d][matchKey];
			if(hexes[f]){
				copyconfig.data[d] = { ...copyconfig.data[d], ...hexes[f] };
			}
		}
	}

	// Create any defined columns
	data = addVirtualColumns(copyconfig);

	let labelProcessor = function(props,key){
		var txt = key;
		// See if this is just a straightforward key
		if(typeof props[key]==="string") txt = props[key];

		if(label){
			// Process replacement filters 
			txt = applyReplacementFilters(txt,props);
		}else{
			// The label is empty so keep it that way
			txt = "";
		}
		return txt;
	}
	let tooltipProcessor = function(props,key){
		var txt = key;
		// See if this is just a straightforward key
		if(typeof props[key]==="string") txt = props[key];

		// Keep a dummy version of the value key
		props._value = copyconfig.value;

		if(tooltip){
			// Process replacement filters 
			txt = applyReplacementFilters(txt,props);
		}else{
			// The label is empty so keep it that way
			txt = "";
		}
		return txt;
	}

	// Merge data into hexes
	// If the matchKey and data are defined
	if (matchKey && data) {
		// Iterate over the data, accessing each entry as `record`
		data.forEach((record) => {
			// Get the key from the key field from the record
			const key = record[matchKey] as string;
			// If the key field is not one of the entries in the hexes, finish
			if (!(key in hexes)) return;
			// Otherwise update the relevant hex data with the entries in the record, but the hexes win - to avoid overwriting the critical fields
			hexes[key] = { ...record, ...hexes[key] };
		});
	}

	// Add IDs to hexes
	for(var key in hexes){
		hexes[key]["_id"] = key;
	}

	// TODO All this colourscale handling needs to be placed in a utlity function or class
	const cs = (typeof scale==="string") ? ColourScale(scale) : scale;

	if (typeof max !== "number") {
		// Find the biggest value in the hex map
		max = Object.values(hexes).map((h) => {
			let v = 0;
			if (typeof h[value] === "string") v = parseFloat(h[value]);
			else if (typeof h[value] === "number") v = h[value];
			else v = -Infinity;
			return v;
		}).reduce((result, current) => Math.max(result, current), -Infinity);
	}

	if (typeof min !== "number") {
		// Find the smallest value in the hex map
		min = Object.values(hexes).map((h) => {
			let v = 0;
			if (typeof h[value] === "string") v = parseFloat(h[value]);
			else if (typeof h[value] === "number") v = h[value];
		else v = Infinity;
			return v;
		}).reduce((result, current) => Math.min(result, current), Infinity);
	}

	const fillColour = (input: number | string) => {
		let colour = undefined;
		if (typeof input === "string") colour = input;
		else if (typeof input === "number"){
			if(min != Infinity && max != -Infinity){
				let c = (input - min) / (max - min);
				if(c < 0) c = 0;
				if(!isNaN(c)) colour = cs(c);
			}
		}else{
			// How did we get here???
			throw new TypeError("Invalid type provided to fillColour function");
		}
		return colour;
	};

	// Function to calculate if a given row should be shifted to the right
	const isShiftedRow = (r: number) => {
		if (layout === "even-r" && isEven(r)) return true;
		if (layout === "odd-r" && !isEven(r)) return true;
		return false;
	};

	// Calculate the left, right, top and bottom
	const dimensions = Object.values<HexDefinition>(hexes)
		.map(({ q, r }) => ({ q, r }))
		.reduce(
			({ left, right, top, bottom }, { q, r }) => ({
				left: Math.min(q, left),
				right: Math.max(q, right),
				top: Math.min(r, top),
				bottom: Math.max(r, bottom),
			}),
			{
				left: Infinity,
				right: -Infinity,
				top: Infinity,
				bottom: -Infinity,
			},
		);

	// Length of side = width * tan(30deg)
	const hexSide = hexCadence * Math.tan(Math.PI / 6);

	// Calculate row height and quolum width
	let rHeight: number;
	let qWidth: number;
	switch (layout) {
		case "odd-r":
		case "even-r":
			// Row height is 1 and a half - there is a half a side length overlap
			rHeight = 1.5 * hexSide;
			// Column width is set by the hexWidth for point top hexes
			qWidth = hexCadence;
			break;
		case "odd-q":
		case "even-q":
			rHeight = hexCadence;
			qWidth = 1.5 * hexSide;
			break;
		default:
			throw new TypeError("Unsupported layout");
	}

	const getShim = () => {
		// Amount to shift the whole hexmap by in a horizontal direction
		let x = 0;
		// Amount to shift the whole hexmap by in a vertical direction
		let y = 0;
		// Amount to adjust the width of the hexmap plot area
		let width = 0;

		if (layout === "odd-r" || layout === "even-r") {
			// Work out if the left-hand column has only shifted rows. i.e. Left Outy Shift
			// If so, move left by half a quoloum
			const unshiftedRowsInTheLeftColumn = Object.values<HexDefinition>(hexes)
				.filter((
					{ q, r },
				) => (q === dimensions.left) && !isShiftedRow(r));
			if (unshiftedRowsInTheLeftColumn.length === 0) {
				x = -0.5;
				// Work out if the right-hand column has only unshifted rows. i.e. Right Inny Shift
				// If so, adjust width to account for extra
				const shiftedRowsInTheRightColumn = Object.values<HexDefinition>(hexes)
					.filter((
						{ q, r },
					) => (q === dimensions.right) && isShiftedRow(r));
				if (shiftedRowsInTheRightColumn.length === 0) {
					width = -0.5;
				}
			}else{
				x = -0.25;
			}
		}

		if (
			(isEven(dimensions.top) && layout === "even-q") ||
			(!isEven(dimensions.left) && layout === "odd-q")
		) y = 0.5;

		return { x, y, width };
	};
	const shim = getShim();

	// Overall width of svg (from centre of left-most to centre of right-most)
	const widthSVG = (dimensions.right - dimensions.left + shim.width) * qWidth;

	// Overall height of svg (from centre of top-most to centre of bottom-most)
	const heightSVG = (dimensions.bottom - dimensions.top) * rHeight;

	/**
	 * Calculate the row offset given the prevailing layout
	 *
	 * @param r row to calculate offset for
	 * @returns
	 */
	const rOffset = (r: number) => {
		if (isShiftedRow(r)) return 0.5;
		return 0;
	};

	/**
	 * Calculate the quolom offset given the prevailing layout
	 *
	 * @param q row to calculate offset for
	 * @returns
	 */
	const qOffset = (q: number) => {
		if (layout === "odd-q") return isEven(q) ? 0 : 0.5;
		if (layout === "even-q") return isEven(q) ? 0.5 : 0;
		return 0;
	};

	/**
	 * Calculate the centre of a hex given a q and r value.
	 *
	 * Uses rOffset formula to decide which to shift
	 *
	 * @param hexConfig - { q: number, r: number }
	 * @returns
	 */
	function getCentre({ q, r }: HexDefinition) {
		const x = (q - dimensions.left + rOffset(r) + shim.x) * qWidth;
		const y = heightSVG - (r - dimensions.top + qOffset(q) + shim.y) * rHeight;
		return { x, y };
	}
	function getEdge(h: HexDefinition){
		let hexPath,cs,ss,p,edges,positive,e;
		// Work out sizes
		switch (layout) {
			case "odd-r":
			case "even-r":
				cs = hexCadence / 2;
				ss = hexSide / 2;
				break;
			case "odd-q":
			case "even-q":
				cs = hexSide / 2;
				ss = hexCadence / 2;
				break;
			default:
				throw new TypeError("Unsupported layout");
		}

		// Is the edge a positive number?
		positive = (h.e >= 0);

		// Get the positive version of the edge number
		e = Math.abs(h.e);

		if(typeof h.q==="number" && typeof h.r==="number" && typeof e==="number" && e >= 1 && e <= 6){
			// Move to centre of first hexagon
			const { x, y } = getCentre(h);
			switch (layout) {
				case "odd-r":
				case "even-r":
					// Pointy-topped hex edges
					edges = [
						[x,(y-2*ss),cs,ss],
						[(x+cs),(y-ss),0,(2*ss)],
						[(x+cs),(y+ss),-cs,ss],
						[x,(y+2*ss),-cs,-ss],
						[(x-cs),(y+ss),0,(-2*ss)],
						[(x-cs),(y-ss),cs,-ss]
					];
					break;
				case "odd-q":
				case "even-q":
					// Flat-topped hex edges
					edges = [
						[(x-ss),(y-cs),(2*ss),0],
						[(x+ss),y-cs,ss,cs],
						[(x+2*ss),y,-ss,cs],
						[(x+ss),(y+cs),(-2*ss),0],
						[(x-ss),y+cs,-ss,-cs],
						[(x-2*ss),y,ss,-cs]
					];
					break;
			}
			e = edges[e-1];
			e[4] = e[0]+e[2];
			e[5] = e[1]+e[3];
			if(!positive) e = [e[4],e[5],-e[2],-e[3],e[0],e[1]];
			// Round numbers to avoid floating point uncertainty
			e[0] = roundTo(e[0],2);
			e[1] = roundTo(e[1],2);
			e[4] = roundTo(e[4],2);
			e[5] = roundTo(e[5],2);
			return e;
		}

		return null;
	};

	const hexCounter = counter();

	const drawHex = (config: HexDefinition) => {
		const hexId = hexCounter();
		const { x, y } = getCentre(config);
		const valuecol = <number> config[value]||0;
		
		const labelProp = <string> config[titleProp];
		let labelText = labelProcessor(config, <string> (typeof label==="function" ? label(labelProp) : label));
		let tooltipText = tooltipProcessor(config, <string> (typeof tooltip==="function" ? tooltip(labelProp, valuecol) : (config[value]===undefined ? "" : tooltip)));

		const colourValue = <number | string> config[colourValueProp || value] || valuecol;

		// Calculate the path based on the layout
		let hexPath: string | undefined = undefined;
		switch (layout) {
			case "odd-r":
			case "even-r":
				hexPath = "M"+roundNumber(hexCadence / 2)+","+roundNumber(-hexSide / 2)+"v"+roundNumber(hexSide)+"l"+roundNumber(-hexCadence / 2)+","+roundNumber(hexSide / 2)+"l"+roundNumber(-hexCadence / 2)+","+roundNumber(-hexSide / 2)+"v"+roundNumber(-hexSide)+"l"+roundNumber(hexCadence / 2)+","+roundNumber(-hexSide / 2)+"Z";
				break;
			case "odd-q":
			case "even-q":
				hexPath = "M"+roundNumber(-hexSide / 2)+","+roundNumber(-hexCadence / 2)+"h"+roundNumber(hexSide)+"l"+roundNumber(hexSide / 2)+","+roundNumber(hexCadence / 2)+"l"+roundNumber(-hexSide / 2)+","+roundNumber(hexCadence / 2)+"h"+roundNumber(-hexSide)+"l"+roundNumber(-hexSide / 2)+","+roundNumber(-hexCadence / 2)+"Z";
				break;
			default:
				throw new TypeError("Unsupported layout");
		}
		let fill;

		// If the value property is a named colour, use that
		if(namedColours.get(colourValueProp)) fill = namedColours.get(colourValueProp);
		else if(namedColours.get(value)) fill = namedColours.get(value);
		else if(namedColours.get(colourValue)) fill = namedColours.get(colourValue); 
		else{
			// If the value is undefined we use the default background colour
			if(typeof config[colourValueProp || value]==="undefined"){
				fill = defaultbg;
			}else if(typeof config[colourValueProp || value]==="string"){
				fill = fillColour(colourValue as never);
			}else if(typeof config[colourValueProp || value]==="number"){
				if(isNaN(config[colourValueProp || value])) fill = defaultbg;
				else fill = fillColour(colourValue as never);
			}
			if(typeof fill==="string"){
				if(fill.indexOf('NaN')>0){
					console.log(colourValueProp,value,config[colourValueProp || value],typeof config[colourValueProp || value],fill);
				}
			}
		}

		// Make sure it is a valid colour at this point - defaults to background colour
		fill = Colour(fill);

		// TODO(@gilesdring) this only supports pointy-top hexes at the moment
		var html = `<g class="hex" data-q="${config.q}" data-r="${config.r}" transform="translate(${roundNumber(x)} ${roundNumber(y)})" data-id="${config._id}" role="cell">`;
		html += `<path fill="${fill.hex}" d="${hexPath}"><title>${tooltipText}</title></path>`;
		if(labelText) html += `<text fill="${fill.contast}" text-anchor="middle" dominant-baseline="middle" aria-hidden="true">${labelText}</text>`;
		html += `</g>`;
		return html;
	};
	
	let lines = "";

	if(copyconfig.boundaries){
		let n,n2,s,d,prevedge,edge,join,p,bname,bstyle;
		let boundarystyles = copyconfig.boundaries;
		// Loop over boundarystyles and build any
		for(n in boundarystyles){
			n2 = boundarystyles[n];
			if(typeof n2==="string" && n2 in boundarystyles) boundarystyles[n] = boundarystyles[n2];
		}
		
		let boundaries = hexjson.boundaries;
		for(n in boundaries){
			// Work out the boundary style to use. It will either be explicit or defined using the boundary.type
			bname = n;
			if("type" in boundaries[n] && boundaries[n].type in boundarystyles) bname = boundaries[n].type;
			if(bname in boundarystyles){
				d = "";
				prevedge = null;
				// Do we have edges?
				if(boundaries[n].edges){
					for(s = 0; s < boundaries[n].edges.length; s++){
						edge = getEdge(boundaries[n].edges[s]);
						if(edge){
							join = (prevedge && (edge[0]==prevedge[4] && edge[1]==prevedge[5])) ? 'L' : 'M';
							d += join+roundTo(edge[0],2)+' '+roundTo(edge[1],2)+'l'+roundTo(edge[2],2)+' '+roundTo(edge[3],2);
							prevedge = edge;
						}
					}
				}
				if(d){
					lines += '<path data-name="'+n+'" d="'+d+'" fill="transparent" vector-effect="non-scaling-stroke"';
					for(p in boundarystyles[bname]){
						if(p in boundarystyles[bname]){
							lines += ' '+p+'="'+boundarystyles[bname][p]+'"';
						}
					}
					lines += '></path>';
				}
			}
		}
	}


	var holder = new VisualisationHolder(input.config,{'name':'hex cartogram'});
	holder.addDependencies(['/js/map.js','/css/maps.css','/js/tooltip.js']);
	holder.addClasses('oi-map oi-map-hex');

	var html = `<div class="oi-map-holder"><div class="oi-map-inner"><svg
			id="hexes-${uuid}"
			class="oi-map-map"
			overflow="visible"
			viewBox="
				${-margin - qWidth / 2} ${-margin - hexSide}
				${widthSVG + qWidth + 2 * margin} ${heightSVG + 2 * hexSide + 2 * margin}
			"
			preserveAspectRatio="xMidYMin meet"
			style="width:${width ? `${width}px`:"100%"};max-width:100%;max-height:100%;margin:auto;${bgColour ? `background: ${bgColour}` : ""}"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			data-type="hex-map"
			vector-effect="non-scaling-stroke"
			aria-labelledby="title-${uuid} desc-${uuid}">
			<title id="title-${uuid}">${title}</title>
			<desc id="desc-${uuid}">${desc}</desc>`;
	html += '<g class="data-layer" role="table"><g class="series" role="row" tabindex="0" aria-label="Hexagons">';
	// Sort by name
	let sorted = sortBy(Object.values(hexes),'n',true);
	for(let i = 0; i < sorted.length; i++) html += drawHex(sorted[i])+"\n";
	html += '</g></g>';
	if(lines){
		html += '<g class="boundaries">'+lines+'</g>';
	}
	html += '</svg>';
	html += '</div>';
	if(!tools) tools = {};
	if(tools.filter){
		if(!tools.filter.position) tools.filter.position = "top left";
		holder.addDependencies(['/js/map-filter.js']);
		var filterdata = {};
		// We want to use a sorted version of the data that is filtered to just what we need
		for(let i = 0; i < sorted.length; i++){
			let id = sorted[i]._id;
			if(tools.filter.label && tools.filter.label in hexes[id]){
				filterdata[id] = hexes[id][tools.filter.label];
			}
		}
		// Add a Filter object to the current script's node with the config and data
		html += '<script>OI.FilterMap.add("'+uuid+'",document.currentScript.parentNode,'+JSON.stringify(tools.filter)+','+JSON.stringify(filterdata)+');</script>\n';
	}
	if(tools.slider){
		holder.addDependencies(['/js/map-slider.js','/js/colours.js']);

		// We don't need to send every field in the dataset
		let fields = [];

		// 1. Extract which keys used for the tooltip
		if(typeof tooltip!=="string"){
			console.warn('Warning: No "tooltip" variable has been set for hex cartogram: ',input.config.hexjson);
		}else{
			fields = tooltip.match(/\{\{ *([^\}]*) *\}\}/g);
			for(let m = 0; m < fields.length; m++){
				fields[m] = fields[m].replace(/\{\{/g,"").replace(/\}\}/g,"").replace(/(^\s+|\s+$)/g,"").replace(/ \|.*/g,"");
			}
		}
		// 2. Add the value field (so that we can work out the colour for each hex)
		fields.push(value);
		// 3. Add the _id (just in case)
		fields.push('_id');
		// 4. Add on the columns used for the slider
		if(typeof tools.slider.columns!=="object"){
			console.warn('No "columns" set for slider.');
		}else{
			fields = fields.concat(tools.slider.columns);
		}
		// Limit to unique fields
		fields = Array.from(new Set(fields));

		// Remove any _value (because this will be calculated in the front-end
		const index = fields.indexOf('_value');
		if(index > -1) fields.splice(index, 1);

		// Compress the data to save bandwidth
		let temphexes = {};
		let i = 0;

		for(let hex in hexes){
			temphexes[hex] = [];
			for(let f = 0; f < fields.length; f++){
				temphexes[hex].push(hexes[hex][fields[f]]);
			}
			i++;
		}
		html += '<script>(function(root){ OI.SliderMap({"position":"'+(tools.slider.position || 'bottom')+'","width":'+(tools.slider.width ? '"'+tools.slider.width+'"' : '"100%"')+',"defaultbg":'+JSON.stringify(defaultbg)+',"value":\"'+value+'\","key":\"'+matchKey+'\"'+(typeof input.config.min==="number" ? ',"min":'+input.config.min : '')+(typeof input.config.max==="number" ? ',"max":'+input.config.max : '')+',"colours":{"background":"'+defaultbg+'",'+(scale ? '"scale":"'+(getColourScale(scale)||scale)+'"' : '')+',"named":'+JSON.stringify(namedColours.getCustom()||{})+'},"tooltip": '+JSON.stringify(tooltip)+',"columns":'+JSON.stringify(tools.slider.columns||[])+',"compresseddata":'+JSON.stringify(temphexes)+',"fields":'+JSON.stringify(fields)+'}); })(window || this);</script>';
	}
	html += '</div>';

	return holder.wrap(html);
}

function sortBy(arr,i,reverse){
	return arr.sort(function (a, b) {
		return (reverse ? -1 : 1)*(a[i] < b[i] ? 1 : -1);
	});
}
