import * as path from 'std/path/mod.ts';
import lume from "lume/mod.ts";

import oiComponents from '../mod.ts';
import autoDependency from 'https://cdn.jsdelivr.net/gh/open-innovations/oi-lume-utils@0.2.0-pre/processors/auto-dependency.ts';

const site = lume({
  src: '.',
});

site.loadAssets([".css"]);

site.use(oiComponents({
  assetPath: '/assets/oi',
  componentNamespace: 'oi',
}));

site.process(['.html'], autoDependency);

console.log(path.resolve('README.md'));
site.remoteFile('_includes/README.md', path.resolve('README.md'));

export default site;
