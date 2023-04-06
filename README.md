# OI Lume Viz

> Open Innovations charting in [Lume](https://lume.land)

At Open Innovations, we've started using the [Lume](https://lume.land) Static Site Generator to build
data microsites for people. This gives us the benefits of a static HTML site, with associated manageability,
efficiency, and maintainability benefits, whilst giving us a framework for extending.

To support some of the more complex visualisations we undertake, we've encapsulated a number of our charting
libraries in this

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

* `assetPath` path to locate the javascript assets that are loaded (**default:** `/assets`)
* `componentNamespace` namespace where the charts are accessible e.g. `comp.oi.dashboard()` (**default:** `oi`)

## Available Charts

TODO add some documentation!

### `dashboard`

Creates a simple panelled dashboard.

### `chart.line`

Creates a line chart.


## Colours

In many of the visualisations it is possible to set the colours of lines/points/polygons. You can set a colour as a hex code (e.g. `#396bad`), an RGB value (e.g. `rgba(255,0,0,1)`) or [a CSS color name](https://www.tutorialrepublic.com/css-reference/css-color-names.php).

Sometimes items can have their colour set using a colour `scale` value. These can either be provided in the style of a [CSS gradient string](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient) (e.g. `#03051A 0%, "#CB1B4F 50%, #FAEBDD 100%`) or using one of the following named colour scales: `Cividis`, `Heat`, `Inferno`, `Magma`, `Mako`, `ODI`, `Planck`, `Plasma`, `Rocket`, `Turbo`, `Viridis`.

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

