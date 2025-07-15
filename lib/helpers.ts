import { applyReplacementFilters } from "./util.js";

/**
 * Recursive function to resolve data from a given context
 *
 * @param ref dot-separated reference to the dataset
 * @param context the context in which to search for the data
 * @returns
 */
export function resolveData<T = unknown>(
  ref: string,
  context: Record<string, T>,
): T {
  // Initialise the result to be the whole context.
  // If we provide no key, we should return the whole thing!
  let result = context;
  // Split the ref by the '.' character and iterate over the resulting array
  for (const key of ref.split('.')) {
    result = result[key] as Record<string, T>;
  }
  return result as T;
}

/**
 * Wrapper around resolveData which checks if the ref is a string.
 * If it is the function returns the resolved version.
 * If not a string, returns the original object.
 * 
 * @param thingOrName an object or a string which refers to the object
 * @returns an object
 */
export function thingOrNameOfThing<T = unknown>(thingOrName: string | T, context: Record<string, unknown> ): T {
  if (typeof thingOrName !== 'string') return thingOrName as T;
  return resolveData(thingOrName as string, context) as T;
}



export function addVirtualColumns (
  config: unknown
) {
	let c,r,v,v2,f;
	if(config.columns && typeof config.columns.length!=="number"){
		console.log('Columns:',config.columns);
		throw new TypeError('The columns should be an array.');
	}
	if(config.columns && config.columns.length > 0 && typeof config.data==="object" && config.data.length > 0){
		for(r = 0; r < config.data.length; r++){

			if(config.geojson){
				let geo = config.geojson;
				if(geo.data.features){
					for(f = 0; f < geo.data.features.length; f++){
						if(geo.data.features[f].properties[geo.key]==config.data[r][config.key]){
							config.data[r]['geojson'] = JSON.parse(JSON.stringify(geo.data.features[f]));
						}
					}
				}
			}

			for(c = 0; c < config.columns.length; c++){
				if(config.columns[c].template && config.columns[c].name){
					v = applyReplacementFilters(config.columns[c].template,config.data[r]);
					// Convert to a float?
					if(typeof v==="string"){
						v2 = parseFloat(v);
						if(v!="" && v == v2+"") v = v2;
					}
					config.data[r][config.columns[c].name] = v;
				}
			}
		}
	}
	return config.data;
}
