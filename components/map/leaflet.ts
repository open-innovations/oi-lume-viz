import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { applyReplacementFilters } from "../../lib/util.js";
import { counter } from "../../lib/util/counter.ts";
import { clone } from "../../lib/util/clone.ts";
import { isEven } from "../../lib/util/is-even.ts";
import { Colour, ColourScale } from "../../lib/colour/colours.ts";
import { getAssetPath } from "../../lib/util/paths.ts";
import { LeafletMap } from "./legacy/map.js";


// This is a simple scale which returns the same value it was sent
// Useful if the hexmap has a colour attribute
const identityColourScale = (s: string) => s;

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
 * Leaflet map styles
 */
export const css = `
	.map { position: relative; }
	.map .tooltip { margin-top: -0.75em; transition: left 0.03s linear; filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.7)); }
	.map .tooltip .inner { padding: 1em; }
	.map .legend { text-align: left; color: #555; background: rgba(0,0,0,0.05); padding: 1em; }
	.map .legend .legend-item { line-height: 1.25em; margin-bottom: 1px; display: grid; grid-template-columns: auto 1fr; }
	.map .legend i { display: inline-block; width: 1.25em; height: 1.25em; margin-right: 0.25em; opacity: 1; }
	.map.leaflet-map .marker:focus { outline: none; }

	.map .leaflet { width: 100%; aspect-ratio: 16 / 9; background: transparent; position: relative; }
	.map .leaflet a { background-image: none!important; color: inherit!important; }
	.map .leaflet-popup-content-wrapper { border-radius: 0; }
	.map .leaflet-popup-content { margin: 1em; }
	.map .leaflet-container, .map .leaflet-popup-content-wrapper, .map .leaflet-popup-content { font-size: 1em; font-family: "CenturyGothicStd", "Century Gothic", Helvetica, sans-serif; line-height: inherit; }
	.map .leaflet-popup-content-wrapper, .map .leaflet-popup-tip { box-shadow: none; }
	.map .leaflet-popup { filter: drop-shadow(0 1px 1px rgba(0,0,0,0.7)); }
	.map .leaflet-container a.leaflet-popup-close-button { color: inherit; }
	.map .leaflet-control { z-index: 400; }
	.map .leaflet-top, .leaflet-bottom { position: absolute; z-index: 400; pointer-events: none; }
	.map.leaflet-map .place-name > svg { position: absolute; transform: translate3d(-50%,-50%,0); left: 50%; top: 50%; }
	.leaflet-div-icon { background: transparent!important; border: 0!important; }
	.leaflet-control-attribution { font-size: 0.75em; }
	.leaflet-div-icon svg { width: 100%; height: 100%; }
	.leaflet-top { top: 0; }
	.leaflet-right { right: 0; }
	.leaflet-bottom { bottom: 0; }
	.leaflet-left { left: 0; }
`;

interface GeoJson { type: string; features: unknown };

type ColourScaleDefinition = string |
	((property: string) => string) |
	((numeric: number) => string);

type LeafletmapOptions = {
	bgColour: string;
	scale: ColourScaleDefinition;
	min: number;
	max: number;
	data?: Record<string, unknown>[];
	geojson: GeoJson;
	label?: string;
	tooltip?: string;
	margin: number;
	matchKey?: string;
	title?: string;
	titleProp: string;
	valueProp: string;
	colourValueProp?: string;
	legend: { position: string; items: Record<number, string> };
};

// TODO(@gilesdring) set hex to something close to rems
/**
 * Function to render a hexmap
 *
 * @param options LeafletmapOptions object
 */
export default function (input: { config: LeafletmapOptions }) {

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
		title = "Leafletmap",
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

	// Create any defined columns
	config.data = addVirtualColumns(config);

	// Set up some variables
	let max = config.max;

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

	if(config.background){
		// Handle background / data as string references
		let background = clone(config.background);
		if(typeof background.data === 'string'){
			background.data = thingOrNameOfThing<TableData<string | number>>(
				background.data,
				input,
			);
		}
		config.background = background;
	}
	
	
	// Resolve data if this is a string
	let data;
	if (config.data) {
		data = clone(config.data);
		// Convert references into actual objects
		data = thingOrNameOfThing<TableData<string | number>>(
			data,
			input,
		);

		// In case it was a CSV file loaded
		if(config.data.rows) config.data = config.data.rows;

		// Create any defined columns
		data.data = addVirtualColumns(data);

	}

	const map = new LeafletMap(config);

	return map.getHTML();
}
