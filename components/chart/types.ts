type FontWeightOptions = "normal" | "bold";

export interface SeriesOptions {
  /** Title for the series */
  title: string;
  /** Value to use from the provided data */
  value: string;
  line: { show: boolean; color: string };
  points: { show: boolean; size: number; color: string };
  bars: { show: boolean; color: string };
  errorbars: { stroke?: string; "stroke-width": number };
}

export interface TickOptions {
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
  tickSpacing: number;
  /** Ticks to display on axis. Auto generated if ommitted and tickSpacing provided. Otherwise defaults to empty. */
  ticks: TickOptions[];
  /** Font weight for the axis */
  "font-weight": FontWeightOptions;
}

export interface _InternalSeriesControlStructure extends SeriesOptions {
  x: string;
  y: string;
  tooltip: string;
}
