import * as path from 'std/path/mod.ts';
import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import oiComponents from '../mod.ts';
import { stringify as yamlStringify } from 'std/encoding/yaml.ts';
import { getColourScale } from '../lib/colour/colour-scale.ts';
import { Colour } from '../lib/colour/colours.ts';

import csvLoader from 'https://deno.land/x/oi_lume_utils@v0.2.0/loaders/csv-loader.ts'

// Code highlighting
import code_highlight from "lume/plugins/code_highlight.ts";
// import your favorite language(s)
import lang_javascript from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/javascript.min.js";
import lang_json from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/json.min.js";
import lang_powershell from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/powershell.min.js";
import lang_bash from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/bash.min.js";

import autoDependency from 'https://cdn.jsdelivr.net/gh/open-innovations/oi-lume-utils@0.2.0-pre/processors/auto-dependency.ts';


const site = lume({
  location: new URL("https://open-innovations.github.io/oi-lume-charts/"),
  src: '.',
});


site.loadAssets([".css"]);
site.loadData(['.csv'], csvLoader);


// TODO(@giles) Make this work in all the places!
site.use(oiComponents({
  assetPath: '/assets',
  componentNamespace: 'oi',
  colour: {
    scales: {
      'example': '#ff0000 0%, #0000ff 100%',
    }
  }
}));

// The autodependency processor needs to be registered before the base path plugin,
// or else the autodepended paths will not be rewritten to include the path prefix
// set in location passed to the lume constructor (above)
site.process(['.html'], autoDependency);
site.use(basePath());

site.remoteFile('index.md', path.resolve('README.md'));

// Map test data to local site
site.remoteFile('samples/chart/bar/_data/examples.yml', './test/data/bar-chart.yml', 'samples/chart/line/_data/examples.yml',);

// Add filters
site.filter('yaml', (value, options = {}) => { let str = yamlStringify(value, options); str = str.replace(/(\s)\'y\': /g,function(m,p1){ return p1+"y: ";}); return str; });
site.filter('match', (value, regex) => { const re = new RegExp(regex); return value.match(re); });
site.filter('colourScaleGradient', (value, options = {}) => { return getColourScale(value)||""; });
site.filter('contrastColour', (value, options = {}) => { let cs = Colour(value); return cs.contrast||value; });



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


export default site;
