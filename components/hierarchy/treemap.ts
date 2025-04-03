import { ColourScale } from "../../lib/colour/colour-scale.ts";
import { thingOrNameOfThing } from "../../lib/helpers.ts";
import { getUniqueItemsFromArray } from "../../lib/util/array.ts";
import { getAssetPath } from "../../lib/util/paths.ts";
import { TableData, UsefulFunction } from "./lib/hierarchy-visualisation.ts";
import { TreeMap, TreeMapOptions } from "./lib/tree-map.ts";
import { addVirtualColumns } from "../../lib/helpers.ts";
import { applyReplacementFilters } from '../../lib/util.js';
import { getBackgroundColour } from "../../lib/colour/colour.ts";
import { getFontSize, getFontWeight, getFontFamily } from "../../lib/font/fonts.ts";
import { VisualisationHolder } from '../../lib/holder.js';

const defaultbg = getBackgroundColour();
const fontFamily = getFontFamily();
const fontWeight = getFontWeight();
const fontSize = getFontSize();

export const css = `
/* OI tree map */
.oi-tree-map foreignObject div { color: white; font-size:${fontSize}px; font-family:${fontFamily}; padding: 0.25em; border:none; }
`;

interface ColourOptions {
  colour: string;
  scale?: string;
}

interface TooltipOptions {
  tooltip: string;
}

type TreemapLevelData = {
  colour: (d: unknown) => string;
  original: Record<string, unknown>[];
} & {
  [valueKey: string]: number;
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
  & TooltipOptions
  & {
    grouping: string[];
  };

/**
 * Wrapper around the TreeMap class which implements the visualisation
 * @param options
 * @returns
 */
export default function (options: { config: TreemapComponentOptions }) {
  // Get colour, scale and tooltip from the passed in config
  const { colour = "colour", scale, tooltip } = options.config;

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
      data[config.value] = d
        .map(
          (v: Record<string, unknown>) => v[config.value as string] as number,
        )
        .reduce((total: number, current: number) => total + current, 0);
    }
    if (typeof colour == 'function') {
      data.colour = colour;
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
    colourMapper: (d) => d.data.colour(d) || defaultbg,
    dataMapper: hierarchyMapper,
    grouping: grouperMaker(options.config.grouping || ["name"]),
    height: options.config.height || 720,
    description: options.config.description || ((d) => d.name),
    padding: options.config.padding || 2,
    reduce: hierarchyReducer,
    width: options.config.width || 1080,
  };

  // Convert references into actual objects
  config.data = thingOrNameOfThing<TableData<string | number>>(
    options.config.data,
    options,
  );

  // Create any defined columns
  config.data = addVirtualColumns(config);

  if (tooltip) {
	config.description = function (d) {
		if(tooltip in d.data.original[0]){
			return d.data.original[0][tooltip];
		}else{
			let options = JSON.parse(JSON.stringify(d.data.original[0]));
			return applyReplacementFilters(tooltip,options);
		}
		return d.name;
	};
  } else {
    config.description = thingOrNameOfThing<UsefulFunction>(
      config.description,
      options,
    );
  }
  
  const treemap = new TreeMap(config);


  var holder = new VisualisationHolder(config,{'name':'treemap'});
  holder.addDependencies(['/js/tooltip.js','/js/tree-map.js']);
  holder.addClasses(['oi-tree-map']);
  return holder.wrap(treemap.render());
}
