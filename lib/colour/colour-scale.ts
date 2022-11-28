import { Colour } from "./colour.ts";
import type { Colour as ColourType } from "./types.ts";

export type ColourScale = {
  (value: number): string;
  orig: string;
  gradient: string;
};

type ColourScaleStop = {
  v: number;
  c: ColourType;
  aspercent: boolean;
};

export function extractColours(gradient: string): ColourScaleStop[] {
  const stops = gradient.match(
    /(([a-z]{3,4}\([^\)]+\)|#[A-Fa-f0-9]{6}) \d+\%?)/g,
  );
  if (stops === null) throw "Can't parse gradient string";
  const cs: ColourScaleStop[] = [];
  for (let i = 0; i < stops.length; i++) {
    let v = Infinity;
    let aspercent = false;
    stops[i].replace(/ (\d+\%?)$/, function (_, p1) {
      if (p1.contains("%")) aspercent = true;
      v = parseFloat(p1);
      return "";
    });
    cs.push({ v, "c": Colour(stops[i]), aspercent });
  }

  return cs;
}

function getColourPercent(
  pc: number,
  a: Pick<ColourType, "rgb" | "alpha">,
  b: Pick<ColourType, "rgb" | "alpha">,
) {
  pc /= 100;
  if (typeof a.alpha !== "number") a.alpha = 1;
  if (typeof b.alpha !== "number") b.alpha = 1;
  const c = {
    "r": (a.rgb[0] + (b.rgb[0] - a.rgb[0]) * pc),
    "g": (a.rgb[1] + (b.rgb[1] - a.rgb[1]) * pc),
    "b": (a.rgb[2] + (b.rgb[2] - a.rgb[2]) * pc),
    "alpha": ((b.alpha - a.alpha) * pc + a.alpha),
  };
  // Rather than providing an extra parameter, providing a standard
  // toString method on the object means that it can be called in a
  // string context (or explicitly) to render the RGBA string.
  c.toString = function () {
    return "rgb" + (c.alpha && c.alpha < 1 ? "a" : "") + "(" + c.r + "," +
      c.g + "," + c.b + (c.alpha && c.alpha < 1 ? "," + c.alpha : "") + ")";
  };
  return c;
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
      cfinal.alpha + ")";
  }
  getColour.orig = gradient;
  getColour.gradient = "background: -moz-linear-gradient(left, " + gradient +
    ");background: -webkit-linear-gradient(left, " + gradient +
    ");background: linear-gradient(to right, " + gradient + ");";

  return getColour;
}
