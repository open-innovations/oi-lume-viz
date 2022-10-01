export const css = `
.chart {
  --colour: black;
  vector-effect: non-scaling-stroke;
  stroke-linecap: round
}
.chart text {
  fill: var(--colour);
  stroke: none;
}
.chart .axis {
  stroke: black;
}
.chart .axis .x-axis {
  text-anchor: middle;
  dominant-baseline: hanging;
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
const scale = (
  n: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => ((n - inMin) * (outMax - outMin) / (inMax - inMin)) + outMin;

const axes = (
  origin: [number, number],
  width: number,
  height: number,
  xLabels: { x: number, label: string }[]
) => {
  const xTickSize = 10;
  return `
  <g class='axis'>
    <path d='M ${origin.join(',')} v -${height}'><title>Y Axis</title></path>
    ${xLabels.map(({ x, label }) => `
      <path d='M ${x},${origin[1]} v ${xTickSize}'></path>
      <text class='x-axis' x=${x} y=${origin[1]} dy=${xTickSize * 2}>${label}</text>
    `).join('')}
    <path d='M ${origin.join(',')} h ${width}'><title>X Axis</title></path>
  </g>`;
};

// deno-lint-ignore no-explicit-any
function zip(...iterables: any[]) {
  const maxLength = Math.max(...iterables.map(x => x.length));
  const zipped: unknown[] = []
  for (let i = 0; i < maxLength; i++) {
    zipped.push(iterables.map(x => x[i] || undefined));
  }
  return zipped;
}

const markerFunctions: { [name: string]: MarkerFunction } = {
  circle: ([x, y], { r = 2, filled = true }) => `<circle class='marker ${filled && 'filled'}' cx=${x} cy=${y} r=${r} />`
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
};

type Padding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
type MarkerOptions = { [k: string]: (number | string | boolean) };
type MarkerFunction = ((pos: [number, number], options: MarkerOptions) => string);

const SCALING_UNIT = 40;

export default (config: LineChartOptions) => {
  const {
    width = 24,
    height = 12,
    series,
    categories,
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
    top: 1,
    bottom: 1,
    left: 1,
    right: 1,
    ...config.padding
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
      marker: markerName = 'circle',
      markerOptions = {},
    } = s;

    let marker: MarkerFunction;
    if (typeof markerName === 'string') marker = markerFunctions[markerName];

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
    const markers = points.map((p) => marker(p, markerOptions)).join('')

    // TODO ID should include a uuid as well to distinguish from other chart series
    return `<g ${style} id='${id}' class='series'>${line}${markers}</g>`;
  }).join('')

  const xLabels = categories.map((label, index) => ({ x: scaleX((index + 0.5) * categoryWidth), label }))

  return `<svg class='chart' viewBox='
      ${-padding.left * SCALING_UNIT}
      ${-padding.top * SCALING_UNIT}
      ${(width + padding.left + padding.right) * SCALING_UNIT}
      ${(height + padding.top + padding.bottom) * SCALING_UNIT}
    ' role='document'>
    ${axes(origin, width * SCALING_UNIT, height * SCALING_UNIT, xLabels)}
    ${lines}
  </svg>`;

}