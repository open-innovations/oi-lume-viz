import { Colour } from "./colour.ts";
import type { Colour as ColourType } from "./types.ts";

interface ColourScaleStop {
  v: number;
  c: ColourType;
  aspercent: boolean;
}

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
      if (p1.match("%")) aspercent = true;
      v = parseFloat(p1);
      return "";
    });
    cs.push({ v, c: Colour(stops[i]), aspercent });
  }

  return cs;
}
