import { Dashboard } from '../lib/dashboard.js';
import { loadDataFile } from '../lib/util.js';


export const css = `
.dashboard {
	--auto-dashboard-min-size: 200px;
	width: 100%;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--auto-dashboard-min-size)), 1fr));
	grid-gap: 1em;
}
.dashboard .panel h3 { color: inherit!important; font-weight: normal; font-size: 1em; }
.panel { background: #efefef; padding: 1em; }
.dashboard .bignum { font-size: 4em; line-height: 1.25em; font-weight: bold; text-align: center; display: block; margin-top: 0; }
.dashboard .footnote { font-size: 0.7em; text-align: center; display: block; }
@media screen and (max-width: 1200px) {
	.dashboard { grid-gap: 1.5vw; }
	.dashboard .panel { font-size: max(10px, 1.5vw); }
	.dashboard .footnote { font-size: max(10px, 0.7em); }
}
`;

function clone(a){ return JSON.parse(JSON.stringify(a)); }

export default function ({ config, sources }) {

	// Load the data from the sources
	const csv = loadDataFile(config, sources);

	// Set the output to "?" as a default
	let html = "?";

	if(csv){

		// Make a clone of the original config to avoid updating the contents elsewhere
		const configcopy = clone(config);

		// Create a new Line Chart
		let dashboard = new Dashboard(configcopy,csv);

		// Get the output
		if(dashboard) html = dashboard.getHTML();

	}else{

		console.warn('WARNING: No CSV contents at '+config.file);

	}

	return html;
}