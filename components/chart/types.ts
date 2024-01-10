type FontWeightOptions = "normal" | "bold";

export interface SeriesOptions {
  /** Title for the series */
  title: string;
  /** Value to use from the provided data */
  value: string;
  line: { show: boolean; color: string };
  points: { show: boolean; size: number; color: string, marker: string; };
  bars: { show: boolean; color: string };
  errorbars: { stroke?: string; "stroke-width": number };
}


export interface TickOptions {
	spacing?: number|string;
	type?: string;
	format?: string;
	size?: number;
}
export interface TickArray {
  /** Position on the axis of the tick */
  value: number;
  /** Label for the tick */
  label: string;
  /** Font weight for the label */
  'font-weight'?: FontWeightOptions;
}

export interface AxisOptions {
  /** Minimum number on axis. Defaults to smallest of 0 or minimum value of presented of data. */
  min: number;
  /** Maxiumum number on axis. Defaults to largest of 0 or maximum value of presented of data. */
  max: number;
  /** Size of ticks for auto generated or rounding */
  tick: TickOptions;
  /** Ticks to display on axis. Auto generated if ommitted and tick.spacing provided. Otherwise defaults to empty. */
  ticks: TickArray[];
  /** Font weight for the axis */
  "font-weight": FontWeightOptions;
}

export interface GradientOptions {
  /** A name for the gradient that is unique */
  name: string;
  value: string;
}

export interface _InternalSeriesControlStructure extends SeriesOptions {
  x: string;
  y: string;
  tooltip: string;
}
