# OI Lume Viz

At Open Innovations, we've started using the [Lume](https://lume.land) Static Site Generator to build
data microsites for people. This gives us the benefits of a static HTML site, with associated manageability,
efficiency, and maintainability benefits, whilst giving us a framework for extending.

To support some of the more complex visualisations we undertake, we've encapsulated a number of our charting libraries in this. With each visualisation type we aim to:

  * keep bandwidth use down
  * only use limited front-end Javascript to add some interactivity (and limit what is loaded to what is needed)
  * keep visualisations as accessible as possible

## Using the library

To use this in your Lume project, include the following in your Lume `_config.js` or `_config.ts` file.
*WARNING*! This is strictly a pre-release version, and interfaces are very likely to change.

You can include your config directly in your Lume `_config.js` or `_config.ts` file:

```js
import oiLumeViz from "https://deno.land/x/oi_lume_viz/mod.ts";

site.use(oiLumeViz({
  assetPath: 'assets/oi',
  componentNamespace: 'oi',
}));
```

Or move the OI Lume Viz config into an external file using:

```js
import oiLumeViz from "https://deno.land/x/oi_lume_viz/mod.ts";

import oiVizConfig from "./oi-viz-config.ts";
site.use(oiLumeViz(oiVizConfig));
```

Then, in `oi-viz-config.ts` you'd include your config e.g.:

```js
export default {
	"assetPath": '/assets',
	"componentNamespace": 'oi',
	"colour": {
		"names": {
			"gold": "#F7AB3D",
			"orange": "#E55912",
			"turquoise": "#69C2C9",
			"cherry": "#E52E36",
			"chartreuse": "#C7B200",
			"plum": "#7D2248",
			"grey": "#B2B2B2",
			"blue": "#005776",
			"raisin": "#874245",
			"rose": "#FF808B",
			"forest": "#4A783C",
			"richblack": "#000000",
		},
		"scales": {
			"example": "#ff0000 0%, #0000ff 100%",
		}
	}
}
```


You can provide the following options:

* `assetPath` path to locate the Javascript assets that are loaded (**default:** `/assets`)
* `componentNamespace` namespace where the charts are accessible e.g. `comp.oi.dashboard()` (**default:** `oi`)
* `colour` - site-wide [colours](https://open-innovations.github.io/oi-lume-viz/documentation/colours/) by name, series, and scale
* `font` - site-wide [fonts](https://open-innovations.github.io/oi-lume-viz/documentation/fonts/)
* `map` - site-wide [map tile layers](https://open-innovations.github.io/oi-lume-viz/documentation/maps/).

## Visualisation types

We have a variety of visualisation types available:

* [Tables](https://open-innovations.github.io/oi-lume-viz/samples/table)
* [Dashboards](https://open-innovations.github.io/oi-lume-viz/samples/dashboard)
* [Treemaps](https://open-innovations.github.io/oi-lume-viz/samples/hierarchy/treemap)
* Charts:
  * [Bar charts](https://open-innovations.github.io/oi-lume-viz/samples/chart/bar)
  * [Scatter charts](https://open-innovations.github.io/oi-lume-viz/samples/chart/scatter)
  * [Line charts](https://open-innovations.github.io/oi-lume-viz/samples/chart/line)
  * [Calendar charts](https://open-innovations.github.io/oi-lume-viz/samples/chart/calendar)
  * [Ridgeline charts](https://open-innovations.github.io/oi-lume-viz/samples/chart/ridgeline)
  * [Ranking charts](https://open-innovations.github.io/oi-lume-viz/samples/chart/ranking)
  * [Waffle charts](https://open-innovations.github.io/oi-lume-viz/samples/chart/waffle)
* Maps:
  * [Zoomable maps](https://open-innovations.github.io/oi-lume-viz/samples/map/leaflet)
  * [SVG maps](https://open-innovations.github.io/oi-lume-viz/samples/map/svg)
  * [Hex cartograms](https://open-innovations.github.io/oi-lume-viz/samples/map/hex-cartogram)

