import d3, { d3types } from "../../../lib/external/d3.ts";

export type TableData<T> = Record<string, T>[];
export type UsefulFunction = (d: unknown) => unknown;

export interface HierarchyVisualisationOptions {
  data: TableData<string | number>;
  reduce: UsefulFunction;
  grouping: UsefulFunction[];
  dataMapper?: UsefulFunction;
}

export abstract class HierarchyVisualisation {
  readonly options: HierarchyVisualisationOptions;
  root: d3types.HierarchyNode<unknown>;
  constructor(options: HierarchyVisualisationOptions) {
    if (options.data === undefined) {
      throw new Error("Treemap options does not include a table");
    }

    this.options = {
      ...options,
      data: structuredClone(options.data),
    };

    try {
      const grouping = d3.rollup(
        this.options.data,
        this.options.reduce,
        ...this.options.grouping,
      );
      this.root = d3.hierarchy(grouping);
    } catch (e) {
      console.error(e.message);
      throw new Error(
        "Unable to create root for treemap. Did you provide data and grouping functions?",
      );
    }
    if (this.options.dataMapper) this.root.each(this.options.dataMapper);
  }
  abstract render(): string;
}
