import { ColourScale } from "../../lib/colour/colour-scale.ts";
import { thingOrNameOfThing } from "../../lib/helpers.ts";
import { getUniqueItemsFromArray } from "../../lib/util/array.ts";
import { getAssetPath } from "../../lib/util/paths.ts";
import { TableData, UsefulFunction } from "./lib/hierarchy-visualisation.ts";
import { TreeMap, TreeMapOptions } from "./lib/tree-map.ts";

interface ColourOptions {
  colour: string;
  scale?: string;
}

interface TreemapLevelData {
  colour: (d: unknown) => string;
  original: Record<string, unknown>[];
  value: number;
}

const grouperMaker = (grouperKeys: string[]) => {
  const types = getUniqueItemsFromArray(grouperKeys.map((x) => typeof x));
  if (types.length > 1) {
    throw new TypeError("Different types of grouper passed.");
  }
  if (types[0] !== "string") {
    throw new TypeError("Grouping not passed strings.");
  }
  return grouperKeys.map((g) => (d) => d[g]);
};

type TreemapComponentOptions =
  & Pick<TreeMapOptions, "data">
  & Partial<
    Omit<TreeMapOptions, "colourMapper" | "reduce" | "grouping" | "dataMapper">
  >
  & ColourOptions
  & {
    grouping: string[];
  };

/**
 * Wrapper around the TreeMap class which implements the visualisation
 * @param options
 * @returns
 */
export default function (options: { config: TreemapComponentOptions }) {
  // Get colour and scale from the passed in config
  const { colour = "colour", scale } = options.config;

  // This is a utility function to map grouped data for processing
  const hierarchyReducer = (d) => {
    const data: TreemapLevelData = {
      // We just take the first entry and use the colour.
      // If the grouping is unique (i.e. one item), this if fine.
      // If the grouping has multiple entries per group, we will ignore the rest.
      colour: () => d[0][colour],
      original: d,
      value: d.length,
    };
    if (scale !== undefined) {
      const colourScale = ColourScale(scale);
      data.colour = () => colourScale(d[0][colour]);
    }
    if (config.value !== undefined) {
      data.value = d
        .map(
          (v: Record<string, unknown>) => v[config.value as string] as number,
        )
        .reduce((total: number, current: number) => total + current, 0);
    }
    return data;
  };

  // This is a utility function to convert the hierarchy into a structure that is easier to work with
  const hierarchyMapper = (d) => {
    const [name = ":ROOT:", data] = d.data;
    if (typeof name !== "string") {
      throw new TypeError(
        "Grouping function for Treemap has not generated a string for a hierarchy level.",
      );
    }
    d.data = { name, ...data };
    d.name = d.data.name;
  };

  // Clone the data table to avoid breaking the global context and set defaults
  const config: TreeMapOptions = {
    ...options.config,
    colourMapper: (d) => d.data.colour(d) || "#aaaaaa",
    dataMapper: hierarchyMapper,
    grouping: grouperMaker(options.config.grouping || ["name"]),
    height: options.config.height || 400,
    description: options.config.description || ((d) => d.name),
    padding: options.config.padding || 2,
    reduce: hierarchyReducer,
    width: options.config.width || 600,
  };

  // Convert references into actual objects
  config.data = thingOrNameOfThing<TableData<string | number>>(
    options.config.data,
    options,
  );

  config.description = thingOrNameOfThing<UsefulFunction>(
    config.description,
    options,
  );

  const treemap = new TreeMap(config);
  const dependencies = `data-dependencies="${ getAssetPath('/js/treemap-popup.js') }"`;
  return `<div class="chart" ${dependencies}>${treemap.render()}</div>`;
}
