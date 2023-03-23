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
 * Wrapper around resolveContext which checks if the ref is a string.
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
