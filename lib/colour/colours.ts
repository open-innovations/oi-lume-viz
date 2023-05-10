/**
 * Colours v0.5.1
 */
export { Colour } from "./colour.ts";
export { ColourScale } from "./colour-scale.ts";

import { updateColourScales } from './colour-scale.ts';
import { updateNamedColours } from './parse-colour-string.ts';
import { setBackgroundColour, setSeriesColours } from "./colour.ts";

export function setDefaultColours({
	background, names, scales, series,
}: {
	background?: string;
	series?: [string];
	names?: Record<string, string>;
	scales?: Record<string, string>;
}) {

	// If colour scales provided when instantiating the plugin, map these into the default scales provided.
	if (scales) {
		for(const [key, value] of Object.entries(scales) ) {
				updateColourScales(key, value);
		}
	}

	// If colour names are provided when instantiating the plugin, map these into the default named colours.
	if (names) {
		for(const [key, value] of Object.entries(names) ) {
				updateNamedColours(key, value);
		}
	}

	// If an array of series colours are provided when instantiating the plugin, map these into the default series colours.
	if (series) setSeriesColours(series);

	// If background colour, update the site-wide default with this
	if (background) setBackgroundColour(background);


}