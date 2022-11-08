import * as path from 'std/path/mod.ts';
import lume from "lume/mod.ts";

import charts from '../mod.ts';
import autoDependency from 'https://cdn.jsdelivr.net/gh/open-innovations/oi-lume-utils@0.2.0-pre/processors/auto-dependency.ts';

const site = lume({
  src: '.',
});

site.loadAssets([".css"]);

site.use(charts({
  assetPath: '/assets/oi',
  componentNamespace: 'oi.charts',
}));

site.process(['.html'], autoDependency);

console.log(path.resolve('README.md'));
site.remoteFile('index.md', path.resolve('README.md'));

export default site;
