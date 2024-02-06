# OI Lume Viz

At Open Innovations, we've started using the [Lume](https://lume.land) Static Site Generator to build
data microsites for people. This gives us the benefits of a static HTML site, with associated manageability,
efficiency, and maintainability benefits, whilst giving us a framework for extending.

To support some of the more complex visualisations we undertake, we've encapsulated a number of our charting libraries in this. With each one we aim to keep bandwidth use down, only use limited front-end Javascript to add some interactivity, and keep visualisations as accessible as possible.

## Using the library

To use this in your Lume project, include the following in your Lume `_config.js` or `_config.ts` file.
*WARNING*! This is strictly a pre-release version, and interfaces are very likely to change.

```js
import oiLumeViz from "https://deno.land/x/oi_lume_viz@v0.13.14/mod.ts";

site.use(oiLumeViz({
  assetPath: 'assets/oi',
  componentNamespace: 'oi',
}));
```

You can provide the following options:

* `assetPath` path to locate the Javascript assets that are loaded (**default:** `/assets`)
* `componentNamespace` namespace where the charts are accessible e.g. `comp.oi.dashboard()` (**default:** `oi`)

You can also set site-wide [colours](/documentation/colours/), [fonts](/documentation/fonts/), and [map tile layers](/documentation/maps/).

## Visualisation types

We have a variety of visualisation types available:

* [Tables](/samples/table)
* [Dashboards](/samples/dashboard)
* [Treemaps](/samples/hierarchy/treemap)
* [Bar charts](/samples/chart/bar)
* [Scatter charts](/samples/chart/scatter)
* [Line charts](/samples/chart/line)
* [Calendar charts](/samples/chart/calendar)
* [Ridgeline charts](/samples/chart/ridgeline)
* [Ranking charts](/samples/chart/ranking)
* [Waffle charts](/samples/chart/waffle)
* Maps:
  * [Zoomable maps](/samples/map/leaflet)
  * [SVG maps](/samples/map/svg)
  * [Hex cartograms](/samples/map/hex-cartogram)

## Testing

Run a test with the following command. Replace the file path with the tests you want to run.
If you provide a directory path and Deno will find any test files in the directory and it's sub-directories.

```powershell
deno test --unstable --allow-read --no-check components/chart/bar.test.ts
```

To make Deno continually run these tests, add the `--watch` flag. This will then run each time the input files change.

```powershell
deno test --unstable --allow-read --no-check --watch components/chart/bar.test.ts
```

