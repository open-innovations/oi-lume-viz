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

export interface _InternalSeriesControlStructure extends SeriesOptions {
  x: string;
  y: string;
  tooltip: string;
}