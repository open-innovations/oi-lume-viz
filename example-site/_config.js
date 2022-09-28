import lume from "lume/mod.ts";

import charts from '../mod.ts';

const site = lume({
  src: '.',
});

site.use(charts({
  assetPath: 'assets/oi',
  componentNamespace: 'oi.charts',
}));

export default site;
