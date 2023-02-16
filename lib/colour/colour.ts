import { contrastRatio } from "./contrast.ts";
import { parseColourString } from "./parse-colour-string.ts";
import { Colour } from "./types.ts";

/**
 * A Colour object can be created with:
 *    Colour('hsl(50, 50%, 78%)')
 *    Colour('rgb(255, 200, 22)')
 *    Colour('#ffdd22')
 *
 * A Colour contains:
 *    Colour.rgb - RGB e.g. [0,0,0]
 *    Colour.hex - a hex code e.g. '#000000'
 *    Colour.hsl - HSL e.g. 'hsl(0,0,0)'
 *    Colour.contrast - the most contrasting colour e.g. 'white'
 *
 * @param str
 * @returns
 */
export function Colour(str: string) {
  // Parse the string
  const { rgb, hex, hsl } = parseColourString(str);
  let contrast = "white";

  // Check brightness contrast
  const cols: {
    [name: string]:
      & Pick<Colour, "rgb">
      & {
        contrast?: number;
      };
  } = {
    "black": { "rgb": [0, 0, 0] },
    "white": { "rgb": [255, 255, 255] },
  };
  let maxRatio = 0;
  for (const col in cols) {
	  let contr = <number> contrastRatio(rgb as [number, number, number], cols[col].rgb as [number, number, number]);
	  if(contr > maxRatio){
		  maxRatio = contr;
		  contrast = col;
	  }
  }

  return { rgb, hex, hsl, contrast } as Colour;
}


