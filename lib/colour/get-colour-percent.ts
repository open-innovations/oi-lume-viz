import { Colour as ColourType } from "./types.ts";

type ColourMapInput = Pick<ColourType, "rgb" | "alpha">
type ColourMapResult = { r: number, g: number, b: number, alpha: number, toString: () => string };

export function getColourPercent(
	pc: number,
	a: ColourMapInput,
	b: ColourMapInput): ColourMapResult {
	pc /= 100;
	if(typeof a.alpha !== "number") a.alpha = 1;
	if(typeof b.alpha !== "number") b.alpha = 1;
	const c = {
		"r": (a.rgb[0] + (b.rgb[0] - a.rgb[0]) * pc),
		"g": (a.rgb[1] + (b.rgb[1] - a.rgb[1]) * pc),
		"b": (a.rgb[2] + (b.rgb[2] - a.rgb[2]) * pc),
		"alpha": ((b.alpha - a.alpha) * pc + a.alpha),
	};
	// Rather than providing an extra parameter, providing a standard
	// toString method on the object means that it can be called in a
	// string context (or explicitly) to render the RGBA string.
	c.toString = function() {
		return "rgb" + (c.alpha && c.alpha < 1 ? "a" : "") + "(" + c.r + "," +
		c.g + "," + c.b + (c.alpha && c.alpha < 1 ? "," + c.alpha : "") + ")";
	};
	return c;
}
