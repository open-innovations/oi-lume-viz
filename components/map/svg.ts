import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { applyReplacementFilters } from "../../lib/util.js";
import { counter } from "../../lib/util/counter.ts";
import { clone } from "../../lib/util/clone.ts";
import { isEven } from "../../lib/util/is-even.ts";
import { Colour, ColourScale } from "../../lib/colour/colours.ts";
import { getAssetPath } from "../../lib/util/paths.ts";
import { SVGMap } from "./legacy/map.js";


// This is a simple scale which returns the same value it was sent
// Useful if the hexmap has a colour attribute
const identityColourScale = (s: string) => s;

/**
 * SVG map styles
 */
export const css = `
/* OI svg map component */
.oi-map-svg svg { width: 100%; }
.oi-map-svg path:focus, .oi-map-svg .marker:focus { outline: none; }
.oi-map-svg .area.outline .selected { stroke: black; stroke-width: 4px; stroke-opacity: 1; outline: none; }
.oi-map-svg .line .selected { stroke-width: 0.4%; }
`;

interface GeoJson { type: string; features: unknown };

type ColourScaleDefinition = string |
	((property: string) => string) |
	((numeric: number) => string);

type SVGmapOptions = {
	bgColour: string;
	scale: ColourScaleDefinition;
	min?: number;
	max?: number;
	data?: Record<string, unknown>[];
	geojson: GeoJson;
	layers?: Record<number,unknown>[];
	label?: string;
	tooltip?: string;
	margin: number;
	matchKey?: string;
	title?: string;
	titleProp: string;
	valueProp: string;
	places?: [];
	markers?: [];
	colourValueProp?: string;
	legend: { position: string; items: Record<number, string> };
};

/**
 * Function to render an SVG map
 *
 * @param options SVGmapOptions object
 */
export default function (input: { config: SVGmapOptions }) {

	// Take a copy of parameters as constants, with defaults.
	// NB these are not cloned at this stage, as this loses information about functions passed in
	const {
		bgColour = "none",
		scale = identityColourScale,
		min = 0,
		hexScale = 1,
		margin: marginScale = 0.25,
		label = (key: string) => key.slice(0, 3),
		matchKey,
		tooltip = (label: string, value) => `${label}: ${value}`,
		title = "SVGmap",
		titleProp = "n",
		valueProp = "colour",
		colourValueProp,
		legend,
	} = input.config;
	
	var config = clone(input.config);

	// Convert references into actual objects
	config.data = thingOrNameOfThing<TableData<string | number>>(
		config.data,
		input,
	);


	// If we don't have data, create an empty array
	if(typeof config.data==="undefined") config.data = [];

	// Simplify our complicated CSV structure
	if(typeof config.data.rows==="object") config.data = config.data.rows;


	// We need to update the GeoJSON in case we need to call on values
	let geojson = clone(config.geojson);
	// Handle geojson / data as string references
	if(typeof geojson.data === 'string'){
		geojson.data = thingOrNameOfThing<TableData<string | number>>(
			geojson.data,
			input,
		);
	}
	// If the GeoJSON object doesn't contain a type: FeatureCollection we stop
	if(!geojson.data.type || geojson.data.type !== "FeatureCollection"){
		console.error(geojson);
		throw new Error("No FeatureCollection in the GeoJSON");
	}
	config.geojson = geojson;


	// Create any defined columns
	config.data = addVirtualColumns(config);

	// Set up some variables
	let max = config.max;

	// Build the layer structure
	config = buildLayers(config,input);

	const map = new SVGMap(config);

	return map.getHTML();
}

function buildLayers(config,input){

	let l,lyrs = [];

	if(typeof config.layers!=="object"){

		// Add the background layer
		if(config.background){
			l = config.background;
			l.type = "background";
			lyrs.push(l);
		}

		// Add the data layer
		l = {'type':'data'};
		if(typeof config.key==="string") l.key = config.key;
		if(typeof config.value==="string") l.value = config.value;
		if(typeof config.tooltip==="string") l.tooltip = config.tooltip;
		if(typeof config.min=="number") l.min = config.min;
		if(typeof config.max=="number") l.max = config.max;
		l.data = config.geojson.data;
		lyrs.push(l);


		// Add any graticule layer
		if(config.graticule){
			l = config.graticule;
			l.type = "graticule";
			lyrs.push(l);
		}

		// Add labels
		if(typeof config.places==="object" && config.places.length > 0){
			l = {};
			l.type = "labels";
			l.labels = config.places;
			lyrs.push(l);
		}

		// Add markers
		if(typeof config.markers==="object" && config.markers.length > 0){
			l = {};
			l.type = "markers";
			l.markers = config.markers;
			lyrs.push(l);
		}
		config.layers = lyrs;
	}

	// Load any "data" attributes
	for(let l = 0; l < config.layers.length; l++){
		if(config.layers[l].type=="data" && typeof config.layers[l].data==="undefined"){
			config.layers[l].data = clone(config.geojson.data);
		}
		if(typeof config.layers[l].data==="string"){
			config.layers[l].data = clone(thingOrNameOfThing<TableData<string | number>>(
				config.layers[l].data,
				input
			));
		}
	}

	return config;
}