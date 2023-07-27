# OI Lume Viz

> Open Innovations charting in [Lume](https://lume.land)

At Open Innovations, we've started using the [Lume](https://lume.land) Static Site Generator to build
data microsites for people. This gives us the benefits of a static HTML site, with associated manageability,
efficiency, and maintainability benefits, whilst giving us a framework for extending.

To support some of the more complex visualisations we undertake, we've encapsulated a number of our charting libraries in this. With each one we aim to keep bandwidth use down and only use limited front-end Javascript to add some interactivity.

## Using the library

To use this in your Lume project, include the following in your Lume `_config.js` or `_config.ts` file.
*WARNING*! This is strictly a pre-release version, and interfaces are very likely to change.

```js
import oiCharts from 'oi-lume-charts/mod.ts';

site.use(oiCharts({
  assetPath: 'assets/oi',
  componentNamespace: 'oi',
}));
```

You can provide the following options:

* `assetPath` path to locate the Javascript assets that are loaded (**default:** `/assets`)
* `componentNamespace` namespace where the charts are accessible e.g. `comp.oi.dashboard()` (**default:** `oi`)

## Visualisation types

TODO add some documentation!

### `dashboard`

Creates a simple panelled dashboard. See [dashboard samples](/samples/dashboard).

### `chart.bar`

Creates a simple horizontal bar chart. See [bar chart samples](/samples/chart/bar).

### `chart.calendar`

Creates a calendar chart to quickly see weekly or seasonal changes in data. See [calendar chart samples](/samples/chart/calendar).

### `chart.line`

Creates a line chart. See [line chart samples](/samples/chart/line).

### `chart.ranking`

<img src="img/ranking.svg" class="icon-inline" />A chart which shows how the rank of something varies. See [ranking chart samples](/samples/chart/ranking).

### `chart.scatter`

Similar to line charts but with lines turned off. See [scatter chart samples](/samples/chart/scatter).

### `chart.waffle`

A heat map style grid. See [waffle chart samples](/samples/chart/waffle).

### `hierarchy.treemap`

Creates a hierarchical treemap. See [treemap samples](/samples/hierarchy/treemap).

### `map.zoomable`

Creates a Leaflet-based, zoomable, slippy map. See [zoomable map samples](/samples/map/leaflet).

### `map.svg`

Creates a simple SVG-based map using a Web Mercator projection. See [SVG map samples](/samples/map/svg).

### `map.hex_cartogram`

Creates a hexagonal cartogram using [HexJSON layouts](https://open-innovations.org/projects/hexmaps/hexjson). See [hex cartogram samples](/samples/map/hex-cartogram).

### `table`

Create heat-map tables and easily merge across rows. See [table samples](/samples/table).

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

