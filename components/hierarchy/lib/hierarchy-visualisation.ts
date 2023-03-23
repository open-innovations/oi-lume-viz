import d3, { d3types } from "../../../lib/external/d3.ts";

export type TableData<T> = Record<string, T>[];
export type UsefulFunction = (d: unknown) => unknown;

export interface HierarchyVisualisationOptions {
  table: TableData<string | number>;
  reduce: UsefulFunction;
  grouping: UsefulFunction[];
  dataMapper?: UsefulFunction;
}

export abstract class HierarchyVisualisation {
  readonly options: HierarchyVisualisationOptions;
  root: d3types.HierarchyNode<unknown>;
  constructor(options: HierarchyVisualisationOptions) {
    if (options.table === undefined) {
      throw new Error("Treemap options does not include a table");
    }

    this.options = {
      ...options,
      table: structuredClone(options.table),
    };

    try {
      this.root = d3.hierarchy(
        d3.rollup(
          this.options.table,
          this.options.reduce,
          ...this.options.grouping,
        ),
      );
    } catch (e) {
      console.error(e.message);
      throw new Error(
        "Unable to create root for treemap. Did you provide table, reducer and grouping functions?",
      );
    }
    if (this.options.dataMapper) this.root.each(this.options.dataMapper);
  }
  abstract render(): string;
}
