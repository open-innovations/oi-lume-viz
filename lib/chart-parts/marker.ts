export type MarkerOptions = { s?: number, [k: string]: (number | string | boolean | undefined), colour?: string, title?: string, series?: number };
export type MarkerFunction = ((pos: [number, number], options: MarkerOptions, i?: number) => string);

export const markerFunctions: { [name: string]: MarkerFunction } = {
  // Trying to keep as much of the styling inherent to SVG tags so that it works when CSS support is limited
  circle: ([x, y], { s = 2, filled = true, colour = 'black', title = 'insert tooltip here', series = 0 }, i = 0) => `<circle class='marker ${filled && 'filled'}' fill='${colour}' cx=${x} cy=${y} r=${s} data-i='${i}' data-series='${series}'><title>${title}</title></circle>`,
  square: ([x, y], { s = 2, filled = true, colour = 'black', title = 'insert tooltip here', series = 0 }, i = 0) => `<path class='marker ${filled && 'filled'}' fill='${colour}' d='M ${x},${y} m${-s},${-s} h ${2 * <number>s} v${2 * <number>s} h${-2 * <number>s} Z' data-i='${i}' data-series='${series}'><title>${title}</title></path>`
}
