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

	// Build the layer structure
	var config = buildLayers(input);

	const map = new ZoomableMap(config);

	return map.getHTML();
}
