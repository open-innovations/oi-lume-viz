import { SVGMap } from "./legacy/map.js";
import { buildLayers } from "./legacy/layers.ts";
import { Bounds, ColourScaleDefinition, GeoJson, dataLayer, backLayer, gratLayer, lablLayer, markLayer } from "./types.ts";


type layersDef = dataLayer | backLayer | gratLayer | lablLayer | markLayer;


type SVGmapOptions = {
	data?: Record<string, unknown>[] | string;
	geojson?: { key?: string, data: string | GeoJson };
	key?: string;
	scale?: ColourScaleDefinition;
	tooltip?: string;
	value?: string;
	min?: number;
	max?: number;
	places?: {
		name: string,
		latitude?: number,
		longitude?: number,
		"text-anchor"?: string,
		colour?: string,
		border?: string,
		"font-size"?: number,
		"font-weight"?: string,
		"font-family"?: string,
	}[];
	markers?: {
		icon: string | { svg: string, size?: [number, number], anchor?: [number, number] },
		latitude?: number,
		longitude?: number,
		colour?: string,
		tooltip?: string,
	}[];
	background?: {
		geojson?: string | GeoJson,
		colour?: string,
	};
	columns?: {
		name: string,
		template: string
	}[];
	bounds?: Bounds;
	graticule?: {
		step?: [number, number]
	};
	legend?: {
		position: string,
		items: { value: number, label: string }[]
	};
	projection?: {
		name: string,
		lat?: number,
		lon?: number,
	};
	layers?: layersDef[];
};


/**
 * Function to render an SVG map
 *
 * @param options SVGmapOptions object
 */
export default function (input: { config: SVGmapOptions }) {

	// Build the layer structure
	var config = buildLayers(input);

	if(config.debug) console.log('Input config',config);

	const map = new SVGMap(config);

	return map.getHTML();
}
