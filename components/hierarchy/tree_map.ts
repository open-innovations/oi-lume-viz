import { thingOrNameOfThing } from "../../lib/helpers.ts";
import { UsefulFunction } from "./lib/hierarchy-visualisation.ts";
import { TreeMap, TreeMapOptions } from "./lib/tree-map.ts";

/**
 * Wrapper around the TreeMap class which implements the visualisation
 * @param options 
 * @returns 
 */
export default function (options: {
  config: TreeMapOptions
}) {
  // Clone the data table to avoid breaking the global context
  options.config.table = structuredClone(options.config.table);

  // Convert references into actual objects
  // These are for the Hierarchy Visualisation base class
  options.config.grouping = thingOrNameOfThing<UsefulFunction[]>(options.config.grouping, options);
  options.config.reduce = thingOrNameOfThing<UsefulFunction>(options.config.reduce, options);
  if (options.config.dataMapper)
    options.config.dataMapper = thingOrNameOfThing<UsefulFunction>(options.config.dataMapper, options);

  // These are for the TreeMap class
  options.config.nameMapper = thingOrNameOfThing<UsefulFunction>(options.config.nameMapper, options);
  options.config.colourMapper = thingOrNameOfThing<UsefulFunction>(options.config.colourMapper, options);

  const treemap = new TreeMap(options.config);
  return treemap.render();
}
