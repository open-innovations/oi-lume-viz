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

export interface AxisOptions {
  /* Minimum number on axis. Defaults to smallest of 0 or minimum value of presented of data. */
  min: number;
  /* Maxiumum number on axis. Defaults to largest of 0 or maximum value of presented of data. */
  max: number;
}

export interface _InternalSeriesControlStructure extends SeriesOptions {
  x: string;
  y: string;
  tooltip: string;
}
