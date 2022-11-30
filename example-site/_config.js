import * as path from 'std/path/mod.ts';
import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";

import oiComponents from '../mod.ts';
import autoDependency from 'https://cdn.jsdelivr.net/gh/open-innovations/oi-lume-utils@0.2.0-pre/processors/auto-dependency.ts';

const site = lume({
  location: new URL("https://open-innovations.github.io/oi-lume-charts/"),
  src: '.',
});

site.loadAssets([".css"]);

site.use(oiComponents({
  assetPath: '/assets/oi',
  componentNamespace: 'oi',
}));
site.use(basePath());
site.process(['.html'], autoDependency);

console.log(path.resolve('README.md'));
site.remoteFile('_includes/README.md', path.resolve('README.md'));

// Map test data to local site
site.remoteFile('samples/chart/bar/_data/configs.yml', './test/data/bar-chart.yml');

export default site;
