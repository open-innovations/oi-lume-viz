import * as path from 'std/path/mod.ts';
import lume from "lume/mod.ts";

import charts from '../mod.ts';

const site = lume({
  src: '.',
});

site.loadAssets([".css"]);

site.use(charts({
  assetPath: 'assets/oi',
  componentNamespace: 'oi.charts',
}));

console.log(path.resolve('README.md'));
site.remoteFile('index.md', path.resolve('README.md'));

export default site;
