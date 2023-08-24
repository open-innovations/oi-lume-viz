import {
	hexToRGB,
	hslToHex,
	hslToRgb,
	rgbToHex,
	rgbToHsl,
} from "./converters.ts";
import { splitStringToNumbers } from "./split-string-to-numbers.ts";
import { Colour } from "./types.ts";
import { getBackgroundColour } from "./colour.ts";
import { replaceNamedColours } from "./colours.ts";

export function validateNumberList(list: number[], options: {
	expectedLength?: number;
	maxValues?: number[];
} = {}) {
	const { expectedLength, maxValues } = {
		expectedLength: 3,
		maxValues: [255, 255, 255],
		...options,
	};
	if (list.length < expectedLength) throw new TypeError("Too few bits");
	if (list.length > expectedLength) throw new TypeError("Too many bits");
	for (let i = 0; i < expectedLength; i++) {
		if (list[i] < 0) throw new RangeError("Number too small");
	}
	for (let i = 0; i < Math.min(maxValues.length, expectedLength); i++) {
		if (list[i] > maxValues[i]) throw new RangeError("Number too big");
	}
}

export function parseColourString(
	input: string
): Pick<Colour, "hsl" | "rgb" | "hex"> {
	if (typeof input !== "string"){
		console.warn('WARNING: Trying to pass non-string to OI Lume Viz: hex cartogram: parseColourString',input,typeof input);
		input = getBackgroundColour();
	}

	input = replaceNamedColours(input);
	let expectedLength = 3;
	let maxValues = [255, 255, 255];
	if (input.toLowerCase().indexOf("hsl") == 0) {
		const str = input.replace(/hsla?\(/i, "").replace(/\)/, "");
		maxValues = [360, 100, 100];
		if (input[3].toLowerCase() === "a") {
			expectedLength = 4;
			maxValues.push(1);
		}
		const hsl = splitStringToNumbers(str);
		validateNumberList(hsl, {
			expectedLength: expectedLength,
			maxValues: maxValues,
		});
		const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
		const hex = hslToHex(hsl[0], hsl[1], hsl[2]);
		return { rgb, hex, hsl };
	}else if (input.toLowerCase().indexOf("rgb") == 0) {
		const str = input.replace(/rgba?\(/i, "").replace(/\)/, "");
		const rgb = splitStringToNumbers(str);
		if (input[3].toLowerCase() === "a") {
			expectedLength = 4;
			maxValues.push(1);
		}
		validateNumberList(rgb, {
			expectedLength: expectedLength,
			maxValues: maxValues,
		});
		const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
		const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
		return { rgb, hex, hsl };
	}else if (input.indexOf("#") == 0) {
		const hex = input;
		const rgb = hexToRGB(hex);
		const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
		return { rgb, hex, hsl };
	}else{
		console.log('Attempting to parse '+input);
	}
	throw "Unable to parse colour string";
}
