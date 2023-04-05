import { thingOrNameOfThing } from "../../lib/helpers.ts";
import { TableData, UsefulFunction } from "./lib/hierarchy-visualisation.ts";
import { TreeMap, TreeMapOptions } from "./lib/tree-map.ts";

/**
 * Wrapper around the TreeMap class which implements the visualisation
 * @param options 
 * @returns 
 */
export default function (options: {
  config: Partial<TreeMapOptions> & Pick<TreeMapOptions, 'data'>
}) {
  const hierarchyReducer = (d) => {
    if (config.valueKey === undefined) return {};
    const value = d.reduce((result, current) => result + current[config.valueKey], 0);
    return { value };
  };
  const hierarchyMapper = d => {
    const [ name = ':ROOT:', data ] = d.data;
    if (typeof name !== 'string')
    throw new TypeError('Grouping function for Treemap has not generated a string for a hierarchy level.');
    d.data = { [config.nameKey]: name, ...data };
    d.name = d.data[config.nameKey];
  };

  // Clone the data table to avoid breaking the global context and set defaults
  const config: TreeMapOptions = {
    ...options.config,
    colourMapper: options.config.colourMapper || (() => '#aaaaaa'),
    dataMapper: options.config.dataMapper || hierarchyMapper,
    grouping: options.config.grouping || [(d) => d[config.nameKey]],
    height: options.config.height || 400,
    nameKey: options.config.nameKey || 'name',
    nameMapper: options.config.nameMapper || ((d) => d.name),
    padding: options.config.padding || 0,
    reduce: options.config.reduce || hierarchyReducer,
    width: options.config.width || 600,
  }

  // Convert references into actual objects
  // These are for the Hierarchy Visualisation base class
  config.data = thingOrNameOfThing<TableData<string | number>>(options.config.data, options);
  config.grouping = thingOrNameOfThing<UsefulFunction[]>(config.grouping, options);
  config.reduce = thingOrNameOfThing<UsefulFunction>(config.reduce, options);
  config.dataMapper = thingOrNameOfThing<UsefulFunction>(config.dataMapper, options);
  
  // These are for the TreeMap class
  config.nameMapper = thingOrNameOfThing<UsefulFunction>(config.nameMapper, options);
  config.colourMapper = thingOrNameOfThing<UsefulFunction>(config.colourMapper, options);

  const treemap = new TreeMap(config);
  return treemap.render();
}
