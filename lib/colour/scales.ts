// TODO find the Leeds 2023 colour discussion I had with Stuart and integrate here
/**
 * A colour scale is either a named string, or a ColourScaleGenerator
 */
export type ColourScale = string | ColourScaleGenerator;
/**
 * A ColourScaleGenerator takes an optional max value, and returns a ColourScaleFunction.
 * This allows the scale function to automatically alter the value
 */
export type ColourScaleGenerator = (max?: number) => ColourScaleFunction;
/**
 * A colour scale function takes the context, and a value key and returns a string.
 * This string represents the CSS / HTML colour.
 */
export type ColourScaleFunction = (context: { [name: string]: unknown }, valueKey: string) => string;

/**
 * Resolve a Colour scale to a Generator Function.
 * If the scale provided is a string, it will be looked up.
 * It the scale is not a string, it will be returned directly, assumed to be a ColourScaleGenerator.
 * @param scale - the scale for which to return a Generator
 * @returns A ColourScaleGenerator function
 */
export const getColourScale = (
  scale: ColourScale
): ColourScaleGenerator => {
  if (typeof scale == 'string') {
    if (!(scale in colourScales)) throw 'Unknown colour scale';
    return colourScales[scale as string];
  }
  return scale;
}

/**
 * 
 */
 export const colourScales: { [name: string]: ColourScaleGenerator } = {
  mapColour: () => (context: { [name: string]: unknown }, valueKey: string) => {
    return context[valueKey] as string;
  },
}
