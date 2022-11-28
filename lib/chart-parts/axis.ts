import { SCALING_UNIT } from '../../lib/config.ts';

export type AxisOptions = {
  title?: string;
  titleOffset?: number;
  majorTick: number;
  labelRotate?: number;
  formatter: (value: string | number) => string;
}

export function drawAxes({
  origin, width, height, xLabels, xAxisOptions, yLabels, yAxisOptions, tickSize = 10,
}: {
  origin: [number, number];
  width: number;
  height: number;
  xLabels: { x: number; label: string; }[];
  xAxisOptions: AxisOptions;
  yLabels: { y: number; label: string; }[];
  yAxisOptions: AxisOptions;
  tickSize?: number;
}) {
  const defaultTitleOffset = 2;
  const yTickPath = yLabels.map(({ y }) => `M${origin[0]},${y}h${-tickSize}`).join('');
  let yLabel = '';
  if (yAxisOptions.title !== undefined)
    yLabel = `
        <text class='label'
          x=0 y=0
          transform="translate(${origin[0] - (yAxisOptions.titleOffset !== undefined ? yAxisOptions.titleOffset : defaultTitleOffset) * SCALING_UNIT} ${height / 2}) rotate(-90)"
          >
            ${yAxisOptions.title}
        </text>
    `;

  const xTickPath = xLabels.map(({ x }) => `M${x},${origin[1]}v${tickSize}`).join('');
  let xLabel = '';
  if (xAxisOptions.title !== undefined)
    xLabel = `
        <text class='label'
          x=${width / 2}
          y=${origin[1]} dy=${(xAxisOptions.titleOffset !== undefined ? xAxisOptions.titleOffset : defaultTitleOffset) * SCALING_UNIT}>
            ${xAxisOptions.title}
        </text>
    `;

  return `
    <g class='axis'>
      <g class='y-axis'>
        <title>Y Axis</title>
        <path d='M ${origin.join(',')} v -${height}'/>
        <path d='${yTickPath}'/>
        ${yLabels.map(({ y, label }) => `<text class='tick-label' x=${origin[0]} y=${y} dx=${-tickSize * 2}>${label}</text>`).join('')}
        ${yLabel}
      </g>
      <g class='x-axis${xAxisOptions.labelRotate ? ' rotated' : ''}'>
        <title>X Axis</title>
        <path d='M ${origin.join(',')} h ${width}'/>
        <path d='${xTickPath}'/>
        ${xLabels.map(({ x, label }) => `<text class='tick-label' x=0 y=0 transform="translate(${x} ${origin[1] + tickSize * 2}) ${xAxisOptions.labelRotate ? 'rotate(-' + xAxisOptions.labelRotate + ')' : ''}">${label}</text>`).join('')}
        ${xLabel}
      </g>
    </g>
  `;
}
