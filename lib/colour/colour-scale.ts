import { extractColours } from "./extract-colours.ts";
import { getColourPercent } from "./get-colour-percent.ts";

// Cividis/Inferno/Magma/Plasma/Turbo/Viridis come from Plotly https://github.com/plotly/plotly.py/blob/master/packages/python/plotly/_plotly_utils/colors/sequential.py (MIT)
// Rocket comes from the Seaborn statistical data visualization package for Python
// Mako comes from https://github.com/sjmgarnier/viridisLite/blob/master/tests/testthat/test-palettes.R
export var namedColourScales = {
	'Cividis': '#00224e 0%, #123570 11.1%, #3b496c 22.222%, #575d6d 33.333%, #707173 44.444%, #8a8678 55.555%, #a59c74 66.666%, #c3b369 77.777%, #e1cc55 88.888%, #fee838 100%',
	'Cividis_r': '#fee838 0%, #e1cc55 11.1%, #c3b369 22.222%, #a59c74 33.333%, #8a8678 44.444%, #707173 55.555%, #575d6d 66.666%, #3b496c 77.777%, #123570 88.888%, #00224e 100%',
	'Heat': 'rgb(0,0,0) 0%, rgb(128,0,0) 25%, rgb(255,128,0) 50%, rgb(255,255,128) 75%, rgb(255,255,255) 100%',
	'Heat_r': 'rgb(255,255,255) 0%, rgb(255,255,128) 25%, rgb(255,128,0) 50%, rgb(128,0,0) 75%, rgb(0,0,0) 100%',
	'Inferno': '#000004 0%, #1b0c41 11.1%, #4a0c6b 22.222%, #781c6d 33.333%, #a52c60 44.444%, #cf4446 55.555%, #ed6925 66.666%, #fb9b06 77.777%, #f7d13d 88.888%, #fcffa4 100%',
	'Inferno_r': '#fcffa4 0%, #f7d13d 11.1%, #fb9b06 22.222%, #ed6925 33.333%, #cf4446 44.444%, #a52c60 55.555%, #781c6d 66.666%, #4a0c6b 77.777%, #1b0c41 88.888%, #000004 100%',
	'Magma': '#000004 0%, #180f3d 11.1%, #440f76 22.222%, #721f81 33.333%, #9e2f7f 44.444%, #cd4071 55.555%, #f1605d 66.666%, #fd9668 77.777%, #feca8d 88.888%, #fcfdbf 100%',
	'Magma_r': '#fcfdbf 0%, #feca8d 11.1%, #fd9668 22.222%, #f1605d 33.333%, #cd4071 44.444%, #9e2f7f 55.555%, #721f81 66.666%, #440f76 77.777%, #180f3d 88.888%, #000004 100%',
	'Mako': '#0B0405 0%, #357BA2 50%, #DEF5E5 100%',
	'Mako_r': '#DEF5E5 0%, #357BA2 50%, #0B0405 100%',
	'ODI': 'rgb(114,46,165) 0%, rgb(230,0,124) 50%, rgb(249,188,38) 100%',
	'ODI_r': 'rgb(249,188,38) 0%, rgb(230,0,124) 50%, rgb(114,46,165) 100%',
	'Planck': 'rgb(0,0,255) 0%, rgb(0,112,255) 16.666%, rgb(0,221,255) 33.3333%, rgb(255,237,217) 50%, rgb(255,180,0) 66.666%, rgb(255,75,0) 100%',
	'Planck_r': 'rgb(255,75,0) 0%, rgb(255,180,0) 16.666%, rgb(255,237,217) 33.3333%, rgb(0,221,255) 50%, rgb(0,112,255) 66.666%, rgb(0,0,255) 100%',
	'Plasma': '#0d0887 0%, #46039f 11.1%, #7201a8 22.222%, #9c179e 33.333%, #bd3786 44.444%, #d8576b 55.555%, #ed7953 66.666%, #fb9f3a 77.777%, #fdca26 88.888%, #f0f921 100%',
	'Plasma_r': '#f0f921 0%, #fdca26 11.1%, #fb9f3a 22.222%, #ed7953 33.333%, #d8576b 44.444%, #bd3786 55.555%, #9c179e 66.666%, #7201a8 77.777%, #46039f 88.888%, #0d0887 100%',
	'Rocket': '#03051A 0%, #CB1B4F 50%, #FAEBDD 100%',	
	'Rocket_r': '#FAEBDD 0%, #CB1B4F 50%, #03051A 100%',	
	'Turbo': '#30123b 0%, #4145ab 7.143%, #4675ed 14.286%, #39a2fc 21.429%, #1bcfd4 28.571%, #24eca6 35.714%, #61fc6c 42.857%, #a4fc3b 50%, #d1e834 57.143%, #f3c63a 64.286%, #fe9b2d 71.429%, #f36315 78.571%, #d93806 85.714%, #b11901 92.857%, #7a0402 100%',
	'Turbo_r': '#7a0402 0%, #b11901 7.143%, #d93806 14.286%, #f36315 21.429%, #fe9b2d 28.571%, #f3c63a 35.714%, #d1e834 42.857%, #a4fc3b 50%, #61fc6c 57.143%, #24eca6 64.286%, #1bcfd4 71.429%, #39a2fc 78.571%, #4675ed 85.714%, #4145ab 92.857%, #30123b 100%',
	'Viridis': '#440154 0%, #482878 11.1%, #3e4989 22.2%, #31688e 33.333%, #26828e 44.444%, #1f9e89 55.555%, #35b779 66.666%, #6ece58 77.777%, #b5de2b 88.888%, #fde725 100%',
	'Viridis_r': '#fde725 0%, #b5de2b 11.1%, #6ece58 22.2%, #35b779 33.333%, #1f9e89 44.444%, #26828e 55.555%, #31688e 66.666%, #3e4989 77.777%, #482878 88.888%, #440154 100%',
	'Viridis-light': 'rgb(122,76,139) 0%, rgb(124,109,168) 12.5%, rgb(115,138,177) 25%, rgb(107,164,178) 37.5%, rgb(104,188,170) 50%, rgb(133,211,146) 62.5%, rgb(189,229,97) 75%, rgb(254,240,65) 87.5%, rgb(254,240,65) 100%',
	'Viridis-light_r': 'rgb(254,240,65) 0%, rgb(254,240,65) 12.5%, rgb(189,229,97) 25%, rgb(133,211,146) 37.5%, rgb(104,188,170) 50%, rgb(107,164,178) 62.5%, rgb(115,138,177) 75%, rgb(124,109,168) 87.5%, rgb(122,76,139) 100%',
};

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

    return "rgba(" + cfinal.r + "," + cfinal.g + "," + cfinal.b + "," +
      (typeof cfinal.alpha==="number" ? cfinal.alpha : 1) + ")";
  }
  getColour.orig = gradient;
  getColour.gradient = "background: -moz-linear-gradient(left, " + gradient +
    ");background: -webkit-linear-gradient(left, " + gradient +
    ");background: linear-gradient(to right, " + gradient + ");";

  return getColour;
}
