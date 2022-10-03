import scale from "../../lib/util/scale.ts";
import zip from "../../lib/util/zip.ts";

export const css = `
.chart {
  --colour: #444;
  vector-effect: non-scaling-stroke;
  stroke-linecap: round
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
.chart .x-axis text {
  text-anchor: middle;
  dominant-baseline: hanging;
}
.chart .y-axis text {
  text-anchor: end;
  dominant-baseline: middle;
}
.chart .y-axis .label {
  text-anchor: end;
  dominant-baseline: middle;
  transform: rotate(-90deg);
  transform-box: fill-box;
  transform-origin: center center;
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
`;

/*
 * UTILITY FUNCTIONS
 */
/**
 * Creates a filter to select every nth item in an array
 */
const everyNth = (n: number) => (_: unknown, i: number) => i % n === 0;

const axes = ({
  origin,
  width,
  height,
  xLabels,
  xAxisOptions,
  yLabels,
  yAxisOptions,
  tickSize = 10,
}: {
  origin: [number, number],
  width: number,
  height: number,
  xLabels: { x: number, label: string }[];
  xAxisOptions: AxisOptions;
  yLabels: { y: number, label: string }[];
  yAxisOptions: AxisOptions;
  tickSize?: number;
}) => {
  const defaultLabelOffset = 40;
  const yTickPath = yLabels.map(({ y }) => `M${origin[0]},${y}h${-tickSize}`).join('');
  let yLabel = '';
  if (yAxisOptions.label !== undefined)
    yLabel = `
        <text class='label'
          x=${origin[0]} dx=${-(yAxisOptions.labelOffset || defaultLabelOffset)}
          y=${height / 2}>
            ${yAxisOptions.label}
        </text>
    `;

  const xTickPath = xLabels.map(({ x }) => `M${x},${origin[1]}v${tickSize}`).join('');
  let xLabel = '';
  if (xAxisOptions.label !== undefined)
    xLabel = `
        <text class='label'
          x=${width / 2}
          y=${origin[1]} dy=${xAxisOptions.labelOffset || defaultLabelOffset}>
            ${xAxisOptions.label}
        </text>
    `;

  return `
    <g class='axis'>
      <g class='y-axis'>
        <title>Y Axis</title>
        <path d='M ${origin.join(',')} v -${height}'/>
        <path d='${yTickPath}'/>
        ${yLabels.map(({ y, label }) => `<text class='tick-label' x=${origin[0]} y=${y} dx=${- tickSize * 2}>${label}</text>`).join('')}
        ${yLabel}
      </g>
      <g class='x-axis'>
        <title>X Axis</title>
        <path d='M ${origin.join(',')} h ${width}'/>
        <path d='${xTickPath}'/>
        ${xLabels.map(({ x, label }) => `<text class='tick-label' x=${x} y=${origin[1]} dy=${tickSize * 2}>${label}</text>`).join('')}
        ${xLabel}
      </g>
    </g>
  `;
};

const markerFunctions: { [name: string]: MarkerFunction } = {
  circle: ([x, y], { r = 2, filled = true }) => `<circle class='marker ${filled && 'filled'}' cx=${x} cy=${y} r=${r} />`,
  square: ([x, y], { s = 2, filled = true }) => `<path class='marker ${filled && 'filled'}' d='M ${x},${y} m${-s},${-s} h ${2 * <number>s} v${2 * <number>s} h${-2 * <number>s} Z' />`
}

/*
 * END OF UTILITY FUNCTIONS
 */

type PlotDimensions = {
  xMax: number;
  xMin: number;
  yMin: number;
  yMax: number;
};

type Series = {
  id: string;
  xValues: number[];
  yValues: number[];
  colour: string;
  marker: string | MarkerFunction;
  markerOptions?: MarkerOptions;
};

type LineChartOptions = {
  plotArea?: Partial<PlotDimensions>;
  series: Partial<Series>[];
  categories: string[];
  width?: number;
  height?: number;
  padding?: Partial<Padding>;
  xAxis: Partial<AxisOptions>;
  yAxis: Partial<AxisOptions>;
  title: string,
  titleOffset: number,
};

type Padding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
type MarkerOptions = { [k: string]: (number | string | boolean) };
type MarkerFunction = ((pos: [number, number], options: MarkerOptions) => string);
type AxisOptions = {
  label?: string;
  labelOffset?: number;
  majorTick: number;
}

const SCALING_UNIT = 30;

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
  const plotArea: PlotDimensions = {
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
    labelOffset: 40,
    ...config.xAxis,
  };

  const yAxisOptions: AxisOptions = {
    majorTick: 10,
    labelOffset: 40,
    ...config.yAxis,
  };

  const scaleX = (c: number) => scale(c, plotArea.xMin, plotArea.xMax, 0, width) * SCALING_UNIT;
  const scaleY = (c: number) => (height - scale(c, plotArea.yMin, plotArea.yMax, 0, height)) * SCALING_UNIT;

  const origin: [number, number] = [scaleX(plotArea.xMin), scaleY(plotArea.yMin)];

  const categoryWidth = plotArea.xMax / categories.length;
  const xValues = Array.from(Array(categories.length).keys())
    .map(x => (x + 0.5) * categoryWidth)
    .map(scaleX);

  const lines = series.map(s => {
    const yValues = s.yValues?.map(scaleY);
    if (yValues === undefined) throw 'No yValues in series';
    const {
      id,
      colour,
      marker = markerFunctions.circle,
      markerOptions = {},
    } = s;

    let markerFunction: MarkerFunction;
    if (typeof marker === 'function') markerFunction = marker;
    if (typeof marker === 'string') markerFunction = markerFunctions[marker];

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

  const xLabels = categories.filter(everyNth(xAxisOptions.majorTick)).map((label, index) => ({ x: scaleX((index + 0.5) * categoryWidth), label }))
  const yLabels = Array.from(Array(Math.floor((plotArea.yMax - plotArea.yMin) / yAxisOptions.majorTick) + 1).keys()).map(y => ({
    label: (y * yAxisOptions.majorTick).toString(),
    y: scaleY((y * yAxisOptions.majorTick))
  }));

  return `<svg class='chart' viewBox='
      ${-padding.left * SCALING_UNIT}
      ${-padding.top * SCALING_UNIT}
      ${(width + padding.left + padding.right) * SCALING_UNIT}
      ${(height + padding.top + padding.bottom) * SCALING_UNIT}
    ' role='document'>
    ${ (title) && `
      <title>${title}</title>
      <text class='title' x=${width * SCALING_UNIT / 2} dy='${ -titleOffset * SCALING_UNIT }'>${ title }</text>
    `}
    ${axes({
      origin,
      width: width * SCALING_UNIT,
      height: height * SCALING_UNIT,
      xLabels,
      xAxisOptions,
      yLabels,
      yAxisOptions,
    })}
    ${lines}
  </svg>`;

}