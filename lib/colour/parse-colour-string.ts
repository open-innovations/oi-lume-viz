import {
  hexToRGB,
  hslToHex,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
} from "./converters.ts";
import { splitStringToNumbers } from "./splitStringToNumbers.ts";
import { Colour } from "./types.ts";

export function parseColourString(
  input: string,
): Pick<Colour, "hsl" | "rgb" | "hex"> {
  if (input.indexOf("hsl") == 0) {
    const str = input.replace(/hsl\(/, "").replace(/\)/, "");
    const hsl = splitStringToNumbers(str);
    const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    const hex = hslToHex(hsl[0], hsl[1], hsl[2]);
    return { rgb, hex, hsl };
  }
  if (input.indexOf("rgb") == 0) {
    const str = input.replace(/rgba?\(/, "").replace(/\)/, "");
    const rgb = splitStringToNumbers(str);
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    return { rgb, hex, hsl };
  }
  if (input.indexOf("#") == 0) {
    const hex = input;
    const rgb = hexToRGB(hex);
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return { rgb, hex, hsl };
  }
  throw "Unable to parse colour string";
}
