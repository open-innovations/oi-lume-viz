import { extractColours } from "./extract-colours.ts";
import { getColourPercent } from "./get-colour-percent.ts";

export interface ColourScale {
  (value: number): string;
  orig: string;
  gradient: string;
}

/**
 * A ColourScale function can be created with:
 *
 *   ColourScale('hsl(87, 57%, 86%) 0%, hsl(191, 57%, 15%) 100%')
 *
 * The ColourScale object will, by default, return a colour given a
 * value in the range 0 to 1. It is also possible to return:
 *
 *   ColourScale.orig - the original colour stops string
 *   ColourScale.gradient - a string for the CSS linear gradient
 */
export function ColourScale(gradient: string): ColourScale {
  const min = 0;
  const max = 1;
  const stops = extractColours(gradient);

  function getColour(v: number) {
    const v2 = 100 * (v - min) / (max - min);
    let cfinal: {
      r?: number;
      g?: number;
      b?: number;
      alpha?: number;
    } = {};
    if (v == max) {
      cfinal = {
        "r": stops[stops.length - 1].c.rgb[0],
        "g": stops[stops.length - 1].c.rgb[1],
        "b": stops[stops.length - 1].c.rgb[2],
        "alpha": stops[stops.length - 1].c.alpha,
      };
    } else {
      if (stops.length == 1) {
        cfinal = {
          "r": stops[0].c.rgb[0],
          "g": stops[0].c.rgb[1],
          "b": stops[0].c.rgb[2],
          "alpha": parseFloat((v2 / 100).toFixed(3)),
        };
      } else {
        for (let c = 0; c < stops.length - 1; c++) {
          if (v2 >= stops[c].v && v2 <= stops[c + 1].v) {
            // On this colour stop
            let pc = 100 * (v2 - stops[c].v) / (stops[c + 1].v - stops[c].v);
            if (pc > 100) pc = 100; // Don't go above colour range
            cfinal = getColourPercent(pc, stops[c].c, stops[c + 1].c);
            continue;
          }
        }
      }
    }

    // If no red value is set and the value is greater than the max value, we'll default to the max colour
    if (typeof cfinal.r !== "number" && v > max) {
      cfinal = {
        "r": stops[stops.length - 1].c.rgb[0],
        "g": stops[stops.length - 1].c.rgb[1],
        "b": stops[stops.length - 1].c.rgb[2],
        "alpha": stops[stops.length - 1].c.alpha,
      };
    }

    return "rgba(" + cfinal.r + "," + cfinal.g + "," + cfinal.b + "," +
      (typeof cfinal.alpha==="number" ? cfinal.alpha : 1) + ")";
  }
  getColour.orig = gradient;
  getColour.gradient = "background: -moz-linear-gradient(left, " + gradient +
    ");background: -webkit-linear-gradient(left, " + gradient +
    ");background: linear-gradient(to right, " + gradient + ");";

  return getColour;
}
