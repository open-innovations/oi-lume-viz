export type MarkerOptions = { s?: number, [k: string]: (number | string | boolean | undefined) };
export type MarkerFunction = ((pos: [number, number], options: MarkerOptions) => string);

export const markerFunctions: { [name: string]: MarkerFunction } = {
  circle: ([x, y], { s = 2, filled = true }) => `<circle class='marker ${filled && 'filled'}' cx=${x} cy=${y} r=${s} />`,
  square: ([x, y], { s = 2, filled = true }) => `<path class='marker ${filled && 'filled'}' d='M ${x},${y} m${-s},${-s} h ${2 * <number>s} v${2 * <number>s} h${-2 * <number>s} Z' />`
}
