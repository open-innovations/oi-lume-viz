import * as path from 'std/path/mod.ts';
import lume from "lume/mod.ts";
import nunjucks from "lume/plugins/nunjucks.ts";
import basePath from "lume/plugins/base_path.ts";
import oiComponents from '../mod.ts';
import { stringify as yamlStringify } from 'std/encoding/yaml.ts';
import { Colour } from '../lib/colour/colours.ts';
import { getColourScale } from '../lib/colour/colour-scale.ts';
import { getSeriesColour } from '../lib/colour/colour.ts';
import sitemap from "lume/plugins/sitemap.ts";		// To build a site map

import autoDependency from "https://deno.land/x/oi_lume_utils@v0.4.0/processors/auto-dependency.ts";
import csvLoader from "https://deno.land/x/oi_lume_utils@v0.4.0/loaders/csv-loader.ts";
import jsonLoader from "lume/core/loaders/json.ts";

// Code highlighting
import code_highlight from "lume/plugins/code_highlight.ts";
// import your favorite language(s)
import lang_javascript from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/javascript.min.js";
import lang_json from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/json.min.js";
import lang_powershell from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/powershell.min.js";
import lang_bash from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/bash.min.js";


const site = lume({
	location: new URL("https://open-innovations.github.io/oi-lume-viz/"),
	src: '.',
});

/**
* Run a shell command and return stdout.
* Handles errors. Cannot handle pipes.
*/
function shell(command) {
    const [ exec, ...args ] = command.split(/\s+/);
    const process = new Deno.Command(exec, { args: args });
    const { code, stdout, stderr } = process.outputSync();
    const result = new TextDecoder().decode(stdout);
    if (code !== 0) {
        console.error(new TextDecoder().decode(stderr));
        throw new Error(`Failed to run "${command}"`);
    }
    return result;
}

// Call shell directly, and deal with strings
site.data('package_version', shell('git describe --tags').replace(/^v/,'').split('-')[0]);


site.use(nunjucks());
site.use(sitemap({
	query: "!draft"
}));
site.add([".css"]);
site.add([".js"]);
site.loadData(['.csv'], csvLoader({ basic: true }));
site.loadData([".geojson"], jsonLoader);

// Import lume viz
import oiVizConfig from "./oi-viz-config.ts";
site.use(oiComponents(oiVizConfig));

site.process([".html"], (pages) => pages.forEach(autoDependency));

site.use(basePath());

site.remoteFile('index.md', path.resolve('README.md'));

// Add filters
site.filter('yaml', (value, options = {}) => { let str = yamlStringify(value, options); str = str.replace(/(\s)\'y\': /g,function(m,p1){ return p1+"y: ";}); return str; });
site.filter('json', (value, options = {}) => { return JSON.stringify(value,null,'\t').replace(/\[\n\t+\{/g,"[{").replace(/\}\n\t+\]/g,"}]").replace(/\}\,\n\t+\{/g,"},{"); });
site.filter('match', (value, regex) => { const re = new RegExp(regex); return value.match(re); });
site.filter('parseColour', (value, options = {}) => { let cs = Colour(value); return cs.hex||value; });
site.filter('colourScaleGradient', (value, options = {}) => { return getColourScale(value)||""; });
site.filter('seriesColour', (value, options = {}) => { return getSeriesColour(value)||""; });
site.filter('contrastColour', (value, options = {}) => { let cs = Colour(value); return cs.contrast||value; });
// 1992-93
// 1992-3
// 2022-23
site.filter('parseEndYear', (value, options = {}) => {
	let bits = value.split(/-/);
	if(bits[0].length==4){
		let sy = bits[0].substr(0,2);
		let ey = bits[1];
		if(ey.length==1){
			ey = bits[0].substr(2,1)+ey;
		}
		return (sy+ey);
	}else{
		return "?";
	}
});



site.use(
	code_highlight({
		languages: {
			javascript: lang_javascript,
			json: lang_json,
			powershell: lang_powershell,
			bash: lang_bash,
		},
		options: {
			classPrefix: 'oi-'
		}
	})
);

site.add('styles/fonts/');

export default site;
