import { SCALING_UNIT } from "../../lib/config.ts";
import scale from "../../lib/util/scale.ts";
import zip from "../../lib/util/zip.ts";
import { AxisOptions, drawAxes } from "../../lib/chart-parts/axis.ts";
import { everyNth } from "../../lib/util/every-nth.ts";
import { getAssetPath } from "../../lib/util/paths.ts"
import {
  MarkerFunction,
  markerFunctions,
  MarkerOptions,
} from "../../lib/chart-parts/marker.ts";

export const css = `
/* OI graph component */
.oi-graph { --colour: #444; --plot-background: unset; background: var(--plot-background); vector-effect: non-scaling-stroke; stroke-linecap: round; }
.oi-graph text { fill: var(--colour); stroke: none; }
.oi-graph .title { text-anchor: middle; dominant-baseline: hanging; }
.oi-graph .label { text-anchor: middle; dominant-baseline: central; }
.oi-graph .x-axis.rotated .tick-label { text-anchor: end; }
.oi-graph .legend-container { --width: 20rem; overflow: visible; width: 1px; height: 1px; }
.oi-graph .legend-container * { margin: 0; }
.oi-graph .legend { width: var(--width); display: block; padding: 0.5rem; list-style: none; }
.oi-graph .legend .legend-item { display: flex; align-items: center; cursor: pointer; }
.oi-graph .legend .series { flex-shrink: 0; }
`;

type PlotOptions = {
  xMax: number;
  xMin: number;
  yMin: number;
  yMax: number;
  colour?: string;
};

type Series = {
  id: string;
  label: string;
  xValues: number[];
  yValues: number[];
  colour: string;
  marker: string | MarkerFunction;
  markerOptions?: MarkerOptions;
};

type PlotTextOptions = {
  colour?: string;
};

type LineChartOptions = {
  plotArea?: Partial<PlotOptions>;
  text?: Partial<PlotTextOptions>;
  series: Partial<Series>[];
  categories: string[];
  width?: number;
  height?: number;
  padding?: Partial<Padding>;
  xAxis: Partial<AxisOptions>;
  yAxis: Partial<AxisOptions>;
  title: string;
  titleOffset: number;
  legend: Partial<LegendOptions>;
};

type LegendOptions = {
  width: string;
};

type Padding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export default ({ config }: {config: LineChartOptions}) => {
  const {
    width = 24,
    height = 18,
    series,
    categories,
    title,
    titleOffset = 1,
  } = config;

  if (categories === undefined) throw "No categories provided";
  if (series === undefined) throw "No series provided";

  // Construct plotarea from defaults
  const plotArea: PlotOptions = {
    xMin: 0,
    yMin: 0,
    // TODO(@gilesdring) Make max based on range
    xMax: 100,
    yMax: 100,
    ...config.plotArea,
  };

  // Set padding in relative
  const padding: Padding = {
    top: (title !== undefined) ? 2 : 1,
    bottom: 2.5,
    left: 2.5,
    right: 1,
    ...config.padding,
  };

  const xAxisOptions: AxisOptions = {
    majorTick: 1,
    titleOffset: 2,
    formatter: (x: string | number) => x.toString(),
    ...config.xAxis,
  };

  const yAxisOptions: AxisOptions = {
    majorTick: 10,
    titleOffset: 2,
    formatter: (x) => x.toString(),
    ...config.yAxis,
  };

  const textOptions: PlotTextOptions = {
    ...config.text,
  };

  const legendOptions: LegendOptions = {
    width: "15rem",
    ...config.legend,
  };

  const scaleX = (c: number) =>
    scale(c, plotArea.xMin, plotArea.xMax, 0, width) * SCALING_UNIT;
  const scaleY = (c: number) =>
    (height - scale(c, plotArea.yMin, plotArea.yMax, 0, height)) * SCALING_UNIT;

  const origin: [number, number] = [
    scaleX(plotArea.xMin),
    scaleY(plotArea.yMin),
  ];

  const categoryWidth = plotArea.xMax / categories.length;
  const xValues = Array.from(Array(categories.length).keys())
    .map((x) => (x + 0.5) * categoryWidth)
    .map(scaleX);

  const getMarkerFunction = (series: Partial<Series>) => {
    // Pass some variables into the markerOptions
	if(series.colour && !series.markerOptions.colour) series.markerOptions.colour = series.colour;

    let { marker } = series;
    let markerFunction: MarkerFunction = markerFunctions.circle;
    if (typeof marker === "function") markerFunction = marker;
    if (typeof marker === "string") markerFunction = markerFunctions[marker];
    return markerFunction;
  };

  const lines = series.map((s,i) => {
    const yValues = s.yValues?.map(scaleY);
    if (yValues === undefined) throw "No yValues in series";
    const {
      id,
      colour,
      markerOptions = {},
    } = s;
	// Set the series number
	s.markerOptions.series = i+1;

    const markerFunction = getMarkerFunction(s);

    const points = <[number, number][]> zip(
      xValues,
      yValues.slice(0, categories.length),
    );

    // Create the line
    const line = `<path
      class='line'
	  stroke='${colour}'
	  fill='none'
      d='
        M ${points[0].join(",")}
        ${points.slice(1).map((p) => `L ${p.join(",")}`).join(" ")}
      '></path>
    `;
    const markers = points.map((p,i) => markerFunction(p, markerOptions, i)).join(
      "",
    );

    // TODO(@gilesdring) ID should include a uuid as well to distinguish from other chart series
    return `<g id='${id}' class='series' data-series='${i+1}'>${line}${markers}</g>`;
  }).join("");

  const xLabels = categories.map(xAxisOptions.formatter).map((
    label,
    index,
  ) => ({ x: scaleX((index + 0.5) * categoryWidth), label })).filter(
    everyNth(xAxisOptions.majorTick),
  );
  const yLabels = Array.from(
    Array(
      Math.floor((plotArea.yMax - plotArea.yMin) / yAxisOptions.majorTick) + 1,
    ).keys(),
  ).map((y) => ({
    label: (y * yAxisOptions.majorTick).toString(),
    y: scaleY(y * yAxisOptions.majorTick),
  }));

  const axes = drawAxes({
    origin,
    width: width * SCALING_UNIT,
    height: height * SCALING_UNIT,
    xLabels,
    xAxisOptions,
    yLabels,
    yAxisOptions,
  });

  const legend = `
    <foreignObject class='legend-container' style='--width: ${legendOptions.width};'><ul class='legend'>
      ${
    series.map((s,i) =>
      `<li class="data-series data-series-${i+1} legend-item">
        <svg viewbox='-15 -10 30 20' style="height: 2em;">
        <path class="line" d="M-10,0 h20" stroke="${s.colour}" fill="none" />
        ${getMarkerFunction(s)([0, 0], { ...s.markerOptions })}
        </svg>
        <span>${s.label}</span>
      </li>`
    ).join("")
  }
    </ul></foreignObject>
    `;
	
  const chart = `<svg class='line-chart' viewBox='
      ${-padding.left * SCALING_UNIT}
      ${-padding.top * SCALING_UNIT}
      ${(width + padding.left + padding.right) * SCALING_UNIT}
      ${(height + padding.top + padding.bottom) * SCALING_UNIT}
    ' role='document' preserveAspectRatio='xMidYMin meet' data-type='line-chart'>
    ${
    (title)
      ? `
      <title>${title}</title>
      <text class='title' x=${width * SCALING_UNIT / 2} dy='${
        -titleOffset * SCALING_UNIT
      }'>${title}</text>
    `
      : "<title>Line Chart</title>"
  }
    ${axes}
	<g class="data">
    ${lines}
	</g>
    ${legend}
  </svg>`;

  return `<div class="graph" data-dependencies="${ getAssetPath('/js/chart.js') }">${chart}</div>`;
};
