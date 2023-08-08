import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { applyReplacementFilters } from "../../lib/util.js";
import { counter } from "../../lib/util/counter.ts";
import { clone } from "../../lib/util/clone.ts";
import { isEven } from "../../lib/util/is-even.ts";
import { Colour, ColourScale } from "../../lib/colour/colours.ts";
import { getColourScale } from "../../lib/colour/colour-scale.ts";
import { getAssetPath } from "../../lib/util/paths.ts";
import { getBackgroundColour } from "../../lib/colour/colour.ts";
import { VisualisationHolder } from '../../lib/holder.js';

const defaultbg = getBackgroundColour();

function roundNumber(v){
	if(typeof v==="number") return parseFloat(v.toFixed(3));
	else return v;
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
	bgColour: string;
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

	// Take a copy of parameters as constants, with defaults.
	// NB these are not cloned at this stage, as this loses information about functions passed in
	let {
		bgColour = "none",
		scale = "Viridis",
		hexScale = 1,
		width,
		margin: marginScale = 0.25,
		label = '',
		matchKey,
		tooltip = (label: string, value) => `${label}`,
		title = "Hexmap",
		titleProp = "n",
		value = "",
		colourValueProp,
		legend,
		tools,
	} = input.config;

	// Set up some variables
	let min = input.config.min;
	let max = input.config.max;

	// Handle hexjson / data as string references
	// Resolve hexjson if this is a string
	let hexjson = clone(input.config.hexjson);
	if (typeof hexjson === 'string') {
		// Convert references into actual objects
		hexjson = thingOrNameOfThing<TableData<string | number>>(
			hexjson,
			input,
		);
	}


	// Capture the layout and hexes from the hexjson
	const layout = hexjson.layout;
	const hexes = clone(hexjson.hexes);

	// Calculate hexCadence - the narrowest dimension of the hex
	const hexCadence = hexScale * 75;
	// The margin is a multiple of the hexSize
	const margin = marginScale * hexCadence;

	// Generate a UUID to identify the hexes
	const uuid = crypto.randomUUID().substr(0,8);

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
		if(copyconfig.data.rows) copyconfig.data = input.config.data.rows;

	}

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

	const hexCounter = counter();

	const drawHex = (config: HexDefinition) => {
		const hexId = hexCounter();
		const { x, y } = getCentre(config);
		const valuecol = <number> config[value] || 0;

		const labelProp = <string> config[titleProp];
		let labelText = labelProcessor(config, <string> (typeof label==="function" ? label(labelProp) : label));
		let tooltipText = tooltipProcessor(config, <string> (typeof tooltip==="function" ? tooltip(labelProp, valuecol) : tooltip));

		const colourValue =
			<number | string> config[colourValueProp || value] || valuecol;

		// Calculate the path based on the layout
		let hexPath: string | undefined = undefined;
		switch (layout) {
			case "odd-r":
			case "even-r":
				hexPath = "M "+roundNumber(hexCadence / 2)+","+roundNumber(-hexSide / 2)+" v "+roundNumber(hexSide)+" l "+roundNumber(-hexCadence / 2)+","+roundNumber(hexSide / 2)+" l "+roundNumber(-hexCadence / 2)+","+roundNumber(-hexSide / 2)+" v "+roundNumber(-hexSide)+" l "+roundNumber(hexCadence / 2)+","+roundNumber(-hexSide / 2)+" Z";
				break;
			case "odd-q":
			case "even-q":
				hexPath = "M "+roundNumber(-hexSide / 2)+","+roundNumber(-hexCadence / 2)+" h "+roundNumber(hexSide)+" l "+roundNumber(hexSide / 2)+","+roundNumber(hexCadence / 2)+" l "+roundNumber(-hexSide / 2)+","+roundNumber(hexCadence / 2)+" h "+roundNumber(-hexSide)+" l "+roundNumber(-hexSide / 2)+","+roundNumber(-hexCadence / 2)+" Z";
				break;
			default:
				throw new TypeError("Unsupported layout");
		}
		// TODO(@giles) Work out what the heck is going on!
		let fill = fillColour(colourValue as never);
		if(typeof fill!=="string") fill = defaultbg;

		// TODO(@gilesdring) this only supports pointy-top hexes at the moment
		return `<g
					id="${uuid}-hex-${hexId}"
					class="hex"
					transform="translate(${roundNumber(x)} ${roundNumber(y)})"
			data-value="${valuecol}"
			data-id="${config._id}"
					role="listitem"
					aria-label="${labelProp} value ${valuecol}"
				>
				<path fill="${fill}" d="${hexPath}"><title>${tooltipText}</title></path>
				<text
				fill="${(Colour(fill)).contrast}"
				text-anchor="middle"
					dominant-baseline="middle"
					aria-hidden="true"
					>${labelText}</text>
			</g>`;
	};

	// Make the legend here
	let legendDiv = '';
	if(legend){
		let position = legend.position||"bottom right";
		position = position.replace(/(^| )/g,function(m,p1){ return p1+'leaflet-'; });
		legendDiv = '<div class="'+position+'">';
		var l = '<div class="oi-legend leaflet-control">';
		if(typeof legend.title==="string") l += '<h3>'+legend.title+'</h3>';
		if(legend.items){
			for(var i = 0; i < legend.items.length; i++){
				l += '<div class="legend-item"><i style="background:'+fillColour(legend.items[i].value)+'" title="'+legend.items[i].value+'"></i> ' + legend.items[i].label + '</div>';
			}
		}
		l += '</div>';
		legendDiv += l+'</div>';
	}

	var holder = new VisualisationHolder(input.config);
	holder.addDependencies(['/js/map.js','/css/maps.css','/js/tooltip.js']);
	holder.addClasses('oi-map oi-map-hex');

	var html = `<div class="oi-map-holder"><div class="oi-map-inner"><svg
			id="hexes-${uuid}"
			class="oi-map-inner"
			viewBox="
				${-margin - qWidth / 2} ${-margin - hexSide}
				${widthSVG + qWidth + 2 * margin} ${heightSVG + 2 * hexSide + 2 * margin}
			"
			preserveAspectRatio="xMidYMin meet"
			style="width:${width ? `${width}px`:"100%"};max-width:100%;margin:auto;${bgColour ? `background: ${bgColour}` : ""}"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
		data-type="hex-map"
		vector-effect="non-scaling-stroke"
			aria-labelledby="title-${uuid}"
		>
			<title id="title-${uuid}">${title}.</title>
		<g class="data-layer" role="list">
			${Object.values(hexes).map(drawHex).join("")}
		</g></svg>`;
	html += '</div>';

	if(!tools) tools = {};
	if(tools.filter){
		holder.addDependencies(['/js/map-filter.js']);
		var filterdata = {};
		for(var id in hexes){
			filterdata[id] = (tools.filter.label && tools.filter.label in hexes[id] ? hexes[id][tools.filter.label] : '');
		}
		html += '<script>(function(root){ OI.FilterMap('+JSON.stringify(tools.filter)+','+JSON.stringify(filterdata)+'); })(window || this);</script>\n';
	}
	if(tools.slider){
		holder.addDependencies(['/js/map-slider.js','/js/colours.js']);
		html += '<script>(function(root){ OI.SliderMap({"width":'+(tools.slider.width ? '"'+tools.slider.width+'"' : '"100%"')+',"value":\"'+value+'\","key":\"'+matchKey+'\"'+(typeof input.min==="number" ? ',"min":'+input.min : '')+(typeof input.max==="number" ? ',"max":'+input.max : '')+',"colours":{"background":"'+defaultbg+'","scale":"'+getColourScale(scale)+'"},"tooltip": '+JSON.stringify(tooltip)+',"columns":'+JSON.stringify(tools.slider.columns||[])+',"data":'+JSON.stringify(hexes)+'}); })(window || this);</script>';
	}

	html += '</div>';

	return holder.wrap(html);
}
