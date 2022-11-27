import { SCALING_UNIT } from '../../lib/config.ts';
import scale from "../../lib/util/scale.ts";
import zip from "../../lib/util/zip.ts";
import { AxisOptions, drawAxes } from '../../lib/chart-parts/axis.ts';
import { everyNth } from '../../lib/util/every-nth.ts';
import { MarkerFunction, markerFunctions, MarkerOptions } from '../../lib/chart-parts/marker.ts';

export const css = `
.chart {
  --colour: #444;
  --plot-background: unset;
  background: var(--plot-background);
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
}
.chart text {
  fill: var(--colour);
  stroke: none;
}
.chart .title {
  text-anchor: middle;
  dominant-baseline: hanging;
}
.chart .axis {
  stroke: var(--colour);
}
.chart .label {
  text-anchor: middle;
  dominant-baseline: central;
}
.chart .x-axis .tick-label {
  text-anchor: middle;
  dominant-baseline: hanging;
}
.chart .x-axis.rotated .tick-label {
  text-anchor: end;
}
.chart .y-axis .tick-label {
  text-anchor: end;
  dominant-baseline: middle;
}
.series .line {
  fill: none;
  stroke: var(--colour);
}
.series .marker {
  stroke: var(--colour);
  fill: none;
}
.series .marker.filled {
  fill: var(--colour);
  stroke: none;
}
.chart .legend-container {
  --width: 20rem;
  overflow: visible;
  width: 1px;
  height: 1px;
}
.chart .legend-container * {
  margin: 0;
}
.chart .legend {
  width: var(--width);
  display: block;
  color: var(--colour);
  padding: 0.5rem;
  list-style: none;
}
.chart .legend li {
  display: flex;
  align-items: center;
}
.chart .legend .series {
  flex-shrink: 0;
}
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
}

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
  title: string,
  titleOffset: number,
  legend: Partial<LegendOptions>,
};

type LegendOptions = {
  width: string;
}

type Padding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export default (config: LineChartOptions) => {
  const {
    width = 24,
    height = 18,
    series,
    categories,
    title,
    titleOffset = 1,
  } = config;

  if (categories === undefined) throw 'No categories provided';
  if (series === undefined) throw 'No series provided';

  // Construct plotarea from defaults
  const plotArea: PlotOptions = {
    xMin: 0,
    yMin: 0,
    // TODO Make max based on range
    xMax: 100,
    yMax: 100,
    ...config.plotArea
  }

  // Set padding in relative
  const padding: Padding = {
    top: (title !== undefined) ? 2 : 1,
    bottom: 2.5,
    left: 2.5,
    right: 1,
    ...config.padding
  };

  const xAxisOptions: AxisOptions = {
    majorTick: 1,
    titleOffset: 2,
    formatter: (x) => x.toString(),
    ...config.xAxis,
  };

  const yAxisOptions: AxisOptions = {
    majorTick: 10,
    titleOffset: 2,
    formatter: (x) => x.toString(),
    ...config.yAxis,
  };

  const textOptions: PlotTextOptions = {
    ...config.text
  };

  const legendOptions: LegendOptions = {
    width: '15rem',
    ...config.legend,
  }

  const scaleX = (c: number) => scale(c, plotArea.xMin, plotArea.xMax, 0, width) * SCALING_UNIT;
  const scaleY = (c: number) => (height - scale(c, plotArea.yMin, plotArea.yMax, 0, height)) * SCALING_UNIT;

  const origin: [number, number] = [scaleX(plotArea.xMin), scaleY(plotArea.yMin)];

  const categoryWidth = plotArea.xMax / categories.length;
  const xValues = Array.from(Array(categories.length).keys())
    .map(x => (x + 0.5) * categoryWidth)
    .map(scaleX);

  const getMarkerFunction = (series: Partial<Series>) => {
    const { marker } = series;
    let markerFunction: MarkerFunction = markerFunctions.circle;
    if (typeof marker === 'function') markerFunction = marker;
    if (typeof marker === 'string') markerFunction = markerFunctions[marker];
    return markerFunction;
  }

  const lines = series.map(s => {
    const yValues = s.yValues?.map(scaleY);
    if (yValues === undefined) throw 'No yValues in series';
    const {
      id,
      colour,
      markerOptions = {},
    } = s;

    const markerFunction = getMarkerFunction(s);

    const points = <[number, number][]>zip(xValues, yValues.slice(0, categories.length));

    let style = '';
    if (colour !== undefined) style += `--colour: ${colour}`;
    if (style !== '') style = `style="${style}"`;

    // Create the line
    const line = `<path
      class='line'
      d='
        M ${points[0].join(',')}
        ${points.slice(1).map(p => `L ${p.join(',')}`).join(' ')}
      '></path>
    `;
    const markers = points.map((p) => markerFunction(p, markerOptions)).join('')

    // TODO ID should include a uuid as well to distinguish from other chart series
    return `<g ${style} id='${id}' class='series'>${line}${markers}</g>`;
  }).join('')

  const xLabels = categories.map(xAxisOptions.formatter).map((label, index) => ({ x: scaleX((index + 0.5) * categoryWidth), label })).filter(everyNth(xAxisOptions.majorTick));
  const yLabels = Array.from(Array(Math.floor((plotArea.yMax - plotArea.yMin) / yAxisOptions.majorTick) + 1).keys()).map(y => ({
    label: (y * yAxisOptions.majorTick).toString(),
    y: scaleY((y * yAxisOptions.majorTick))
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
      ${series.map((s) => `<li>
        <svg viewbox='-15 -10 30 20' class="series" style="height: 2em; --colour: ${s.colour}">
        <path class="line" d="M-10,0 h20"/>
        ${getMarkerFunction(s)([0, 0], { ...s.markerOptions, s: 3 })}
        </svg>
        <span>${s.label}</span>
      </li>`).join('')}
    </ul></foreignObject>
    `

  return `<svg class='chart' style='${plotArea.colour && `--plot-background:${plotArea.colour};`
    }${textOptions.colour && `--colour:${textOptions.colour};`
    }' viewBox='
      ${-padding.left * SCALING_UNIT}
      ${-padding.top * SCALING_UNIT}
      ${(width + padding.left + padding.right) * SCALING_UNIT}
      ${(height + padding.top + padding.bottom) * SCALING_UNIT}
    ' role='document'>
    ${(title) ? `
      <title>${title}</title>
      <text class='title' x=${width * SCALING_UNIT / 2} dy='${-titleOffset * SCALING_UNIT}'>${title}</text>
    ` : '<title>Line Chart</title>'}
    ${axes}
    ${lines}
    ${legend}
  </svg>`;

}