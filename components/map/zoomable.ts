import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { applyReplacementFilters } from "../../lib/util.js";
import { counter } from "../../lib/util/counter.ts";
import { clone } from "../../lib/util/clone.ts";
import { isEven } from "../../lib/util/is-even.ts";
import { Colour, ColourScale } from "../../lib/colour/colours.ts";
import { getAssetPath } from "../../lib/util/paths.ts";
import { ZoomableMap } from "./legacy/map.js";
import { getBackgroundColour } from "../../lib/colour/colour.ts";
import { getFontFamily } from '../../lib/font/fonts.ts';
import { buildLayers } from "./legacy/layers.ts";
import { GeoJson, dataLayer, backLayer, gratLayer, lablLayer, markLayer } from "./types.ts";

const defaultbg = getBackgroundColour();
const fontFamily = getFontFamily();

// This is a simple scale which returns the same value it was sent
// Useful if the hexmap has a colour attribute
const identityColourScale = (s: string) => s;


type ZoomablemapOptions = {
	bgColour: string;
	scale: ColourScaleDefinition;
	min: number;
	max: number;
	data?: Record<string, unknown>[];
	geojson?: GeoJson;
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
 * @param options ZoomablemapOptions object
 */
export default function (input: { config: ZoomablemapOptions }) {

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
		title = "Zoomablemap",
		titleProp = "n",
		valueProp = "colour",
		colourValueProp,
		legend,
	} = input.config;
	
	// Build the layer structure
	var config = buildLayers(input);

console.log('zoomable layers='+config.layers.length+' (using '+input.layout+')');

	const map = new ZoomableMap(config);

	return map.getHTML();
}
