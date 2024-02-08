import { extractColours } from "./extract-colours.ts";
import { getColourPercent } from "./get-colour-percent.ts";

// Cividis/Inferno/Magma/Plasma/Turbo/Viridis come from Plotly https://github.com/plotly/plotly.py/blob/master/packages/python/plotly/_plotly_utils/colors/sequential.py (MIT)
// Rocket comes from the Seaborn statistical data visualization package for Python
// Mako comes from https://github.com/sjmgarnier/viridisLite/blob/master/tests/testthat/test-palettes.R
// PiPG/PRGn/PuOr/RdBu come from ColorBrewer 2.0 https://github.com/axismaps/colorbrewer/blob/9a37cbbfe7cde61c060c68ecdd1fd3a5095ef4a5/export/colorbrewer.js
const namedColourScales: Record<string, string> = {
	'Cividis': '#00224e 0%, #123570 11.1%, #3b496c 22.222%, #575d6d 33.333%, #707173 44.444%, #8a8678 55.555%, #a59c74 66.666%, #c3b369 77.777%, #e1cc55 88.888%, #fee838 100%',
	'Heat': 'rgb(0,0,0) 0%, rgb(128,0,0) 25%, rgb(255,128,0) 50%, rgb(255,255,128) 75%, rgb(255,255,255) 100%',
	'Inferno': '#000004 0%, #1b0c41 11.1%, #4a0c6b 22.222%, #781c6d 33.333%, #a52c60 44.444%, #cf4446 55.555%, #ed6925 66.666%, #fb9b06 77.777%, #f7d13d 88.888%, #fcffa4 100%',
	'Magma': '#000004 0%, #180f3d 11.1%, #440f76 22.222%, #721f81 33.333%, #9e2f7f 44.444%, #cd4071 55.555%, #f1605d 66.666%, #fd9668 77.777%, #feca8d 88.888%, #fcfdbf 100%',
	'Mako': '#0B0405 0%, #357BA2 50%, #DEF5E5 100%',
	'Planck': 'rgb(0,0,255) 0%, rgb(0,112,255) 16.666%, rgb(0,221,255) 33.3333%, rgb(255,237,217) 50%, rgb(255,180,0) 66.666%, rgb(255,75,0) 100%',
	'Plasma': '#0d0887 0%, #46039f 11.1%, #7201a8 22.222%, #9c179e 33.333%, #bd3786 44.444%, #d8576b 55.555%, #ed7953 66.666%, #fb9f3a 77.777%, #fdca26 88.888%, #f0f921 100%',
	'Rocket': '#03051A 0%, #CB1B4F 50%, #FAEBDD 100%',	
	'Turbo': '#30123b 0%, #4145ab 7.143%, #4675ed 14.286%, #39a2fc 21.429%, #1bcfd4 28.571%, #24eca6 35.714%, #61fc6c 42.857%, #a4fc3b 50%, #d1e834 57.143%, #f3c63a 64.286%, #fe9b2d 71.429%, #f36315 78.571%, #d93806 85.714%, #b11901 92.857%, #7a0402 100%',
	'Viridis': '#440154 0%, #482878 11.1%, #3e4989 22.2%, #31688e 33.333%, #26828e 44.444%, #1f9e89 55.555%, #35b779 66.666%, #6ece58 77.777%, #b5de2b 88.888%, #fde725 100%',
	'Viridis-light': 'rgb(122,76,139) 0%, rgb(124,109,168) 12.5%, rgb(115,138,177) 25%, rgb(107,164,178) 37.5%, rgb(104,188,170) 50%, rgb(133,211,146) 62.5%, rgb(189,229,97) 75%, rgb(254,240,65) 87.5%, rgb(254,240,65) 100%',
	'PiPG': '#8e0152 0%, #c51b7d 10%, #de77ae 20%, #f1b6da 30%, #fde0ef 40%, #f7f7f7 50%, #e6f5d0 60%, #b8e186 70%, #7fbc41 80%, #4d9221 90%, #276419 100%',
	'PRGn': '#40004b 0%, #762a83 10%, #9970ab 20%, #c2a5cf 30%, #e7d4e8 40%, #f7f7f7 50%, #d9f0d3 60%, #a6dba0 70%, #5aae61 80%, #1b7837 90%, #00441b 100%',
	'PuOr': '#7f3b08 0%, #b35806 10%, #e08214 20%, #fdb863 30%, #fee0b6 40%, #f7f7f7 50%, #d8daeb 60%, #b2abd2 70%, #8073ac 80%, #542788 90%, #2d004b 100%',
	'RdBu': '#67001f 0%, #b2182b 10%, #d6604d 20%, #f4a582 30%, #fddbc7 40%, #f7f7f7 50%, #d1e5f0 60%, #92c5de 70%, #4393c3 80%, #2166ac 90%, #053061 100%',
};

/**
 * Function to update the colour scales available to the site
 * @param key Key of the new scale
 * @param scale The CSS code of the new scale
 */
export function updateColourScales(key: string, scale: string) {
	namedColourScales[key] = scale;
	if(!namedColourScales[key+"_r"]){
		namedColourScales[key+"_r"] = reverseColourScale(namedColourScales[key]);
	}
}

export function getColourScales(): Record<string, string> {
	return namedColourScales;
}

export function getColourScale(key: string): string {
	try {
		return namedColourScales[key];
	} catch(e) {
		console.error(e.message);
		throw new Error('Invalid colour scale requested: ' + key);
	}
}

// Reverse a colour scale
function reverseColourScale(scale){
	var bits = scale.split(/\, +/);
	let positions = [];
	let colours = [];
	let b,bit;
	for(b = 0; b < bits.length; b++){
		bit = bits[b].split(/\s/);
		colours.push(bit[0]);
		positions.push(parseFloat(bit[1]));
	}
	colours.reverse();
	positions.reverse();
	scale = '';
	for(b = 0; b < colours.length; b++) scale += (b == 0 ? "" : ", ")+colours[b]+" "+(100-positions[b]).toFixed(2).replace(/\.0+/,"")+"%";
	return scale;
}

let scales = Object.keys(namedColourScales);
for(let s = 0; s < scales.length; s++){
	if(!namedColourScales[scales[s]+"_r"]){
		namedColourScales[scales[s]+"_r"] = reverseColourScale(namedColourScales[scales[s]]);
	}
}


export interface ColourScale {
	(value: number): string;
	orig: string;
	gradient: string;
}

/**
 * A ColourScale function can be created with:
 *
 *	 ColourScale('hsl(87, 57%, 86%) 0%, hsl(191, 57%, 15%) 100%')
 *
 * The ColourScale object will, by default, return a colour given a
 * value in the range 0 to 1. It is also possible to return:
 *
 *	 ColourScale.orig - the original colour stops string
 *	 ColourScale.gradient - a string for the CSS linear gradient
 */
export function ColourScale(gradient: string): ColourScale {
	const min = 0;
	const max = 1;
	if(namedColourScales[gradient]) gradient = namedColourScales[gradient];
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

		return "rgba(" + Math.round(cfinal.r) + "," + Math.round(cfinal.g) + "," + Math.round(cfinal.b) + "," +
			(typeof cfinal.alpha==="number" ? cfinal.alpha : 1) + ")";
	}
	getColour.orig = gradient;
	getColour.gradient = "background: -moz-linear-gradient(left, " + gradient +
		");background: -webkit-linear-gradient(left, " + gradient +
		");background: linear-gradient(to right, " + gradient + ");";

	return getColour;
}
