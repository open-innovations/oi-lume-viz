import { dashboard, DashboardOptions } from "../lib/dashboard.ts";
import { getBackgroundColour, Colour } from "../lib/colour/colour.ts";
import { addVirtualColumns, thingOrNameOfThing } from "../lib/helpers.ts";
import { clone } from "../lib/util/clone.ts";
import { VisualisationHolder } from '../lib/holder.js';

const defaultbg = getBackgroundColour();
const defaultbgcontrast = Colour(defaultbg).contrast;

export const css = `
/* OI dashboard component */
.oi-dashboard { --auto-dashboard-min-size: 200px; width: 100%; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--auto-dashboard-min-size)), 1fr)); grid-gap: 1em; }
.oi-dashboard .panel h3 { color: inherit!important; font-weight: normal; font-size: 1em; }
.oi-dashboard .panel { background: ${defaultbg}; color: ${defaultbgcontrast}; padding: 1em; }
.oi-dashboard .bignum { font-size: 4em; line-height: 1.25em; font-weight: bold; text-align: center; display: block; margin-top: 0; }
.oi-dashboard .footnote { font-size: 0.7em; text-align: center; display: block; }
@media screen and (max-width: 1200px) {
	.oi-dashboard { grid-gap: 1.5vw; }
	.oi-dashboard .panel { font-size: max(10px, 1.5vw); }
	.oi-dashboard .footnote { font-size: max(10px, 0.7em); }
}
`;

export default function (input: {
	config: DashboardOptions;
}): string {

	const config = clone(input.config);

	if (!config.data) throw "No data source provided";

	// Convert references into actual objects
	config.data = thingOrNameOfThing<TableData<string | number>>(
		config.data,
		input,
	);

	// In case it was a CSV file loaded
	if(config.data.rows) config.data = config.data.rows;

	// Create any defined columns
	config.data = addVirtualColumns(config);

	const html = dashboard(config);

	var holder = new VisualisationHolder(config,{'name':'dashboard'});
	return holder.wrap(html);
}
