import {
  hexToRGB,
  hslToHex,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
} from "./converters.ts";
import { splitStringToNumbers } from "./split-string-to-numbers.ts";
import { Colour } from "./types.ts";

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

const namedColours: Record<string, string> = {"aqua":"#00FFFF","black":"#000000","blue":"#0000FF","fuchsia":"#FF00FF","gray":"#808080","green":"#008000","lime":"#00FF00","maroon":"#800000","navy":"#000080","olive":"#808000","purple":"#800080","red":"#FF0000","silver":"#C0C0C0","teal":"#008080","white":"#FFFFFF","yellow":"#FFFF00","aliceblue":"#F0F8FF","antiquewhite":"#FAEBD7","aqua":"#00FFFF","aquamarine":"#7FFFD4","azure":"#F0FFFF","beige":"#F5F5DC","bisque":"#FFE4C4","black":"#000000","blanchedalmond":"#FFEBCD","blue":"#0000FF","blueviolet":"#8A2BE2","brown":"#A52A2A","burlywood":"#DEB887","cadetblue":"#5F9EA0","chartreuse":"#7FFF00","chocolate":"#D2691E","coral":"#FF7F50","cornflowerblue":"#6495ED","cornsilk":"#FFF8DC","crimson":"#DC143C","cyan":"#00FFFF","darkblue":"#00008B","darkcyan":"#008B8B","darkgoldenrod":"#B8860B","darkgray":"#A9A9A9","darkgreen":"#006400","darkkhaki":"#BDB76B","darkmagenta":"#8B008B","darkolivegreen":"#556B2F","darkorange":"#FF8C00","darkorchid":"#9932CC","darkred":"#8B0000","darksalmon":"#E9967A","darkseagreen":"#8FBC8F","darkslateblue":"#483D8B","darkslategray":"#2F4F4F","darkturquoise":"#00CED1","darkviolet":"#9400D3","deeppink":"#FF1493","deepskyblue":"#00BFFF","dimgray":"#696969","dodgerblue":"#1E90FF","firebrick":"#B22222","floralwhite":"#FFFAF0","forestgreen":"#228B22","fuchsia":"#FF00FF","gainsboro":"#DCDCDC","ghostwhite":"#F8F8FF","gold":"#FFD700","goldenrod":"#DAA520","gray":"#7F7F7F","green":"#008000","greenyellow":"#ADFF2F","honeydew":"#F0FFF0","hotpink":"#FF69B4","indianred":"#CD5C5C","indigo":"#4B0082","ivory":"#FFFFF0","khaki":"#F0E68C","lavender":"#E6E6FA","lavenderblush":"#FFF0F5","lawngreen":"#7CFC00","lemonchiffon":"#FFFACD","lightblue":"#ADD8E6","lightcoral":"#F08080","lightcyan":"#E0FFFF","lightgoldenrodyellow":"#FAFAD2","lightgreen":"#90EE90","lightgrey":"#D3D3D3","lightpink":"#FFB6C1","lightsalmon":"#FFA07A","lightseagreen":"#20B2AA","lightskyblue":"#87CEFA","lightslategray":"#778899","lightsteelblue":"#B0C4DE","lightyellow":"#FFFFE0","lime":"#00FF00","limegreen":"#32CD32","linen":"#FAF0E6","magenta":"#FF00FF","maroon":"#800000","mediumaquamarine":"#66CDAA","mediumblue":"#0000CD","mediumorchid":"#BA55D3","mediumpurple":"#9370DB","mediumseagreen":"#3CB371","mediumslateblue":"#7B68EE","mediumspringgreen":"#00FA9A","mediumturquoise":"#48D1CC","mediumvioletred":"#C71585","midnightblue":"#191970","mintcream":"#F5FFFA","mistyrose":"#FFE4E1","moccasin":"#FFE4B5","navajowhite":"#FFDEAD","navy":"#000080","navyblue":"#9FAFDF","oldlace":"#FDF5E6","olive":"#808000","olivedrab":"#6B8E23","orange":"#FFA500","orangered":"#FF4500","orchid":"#DA70D6","palegoldenrod":"#EEE8AA","palegreen":"#98FB98","paleturquoise":"#AFEEEE","palevioletred":"#DB7093","papayawhip":"#FFEFD5","peachpuff":"#FFDAB9","peru":"#CD853F","pink":"#FFC0CB","plum":"#DDA0DD","powderblue":"#B0E0E6","purple":"#800080","red":"#FF0000","rosybrown":"#BC8F8F","royalblue":"#4169E1","saddlebrown":"#8B4513","salmon":"#FA8072","sandybrown":"#FA8072","seagreen":"#2E8B57","seashell":"#FFF5EE","sienna":"#A0522D","silver":"#C0C0C0","skyblue":"#87CEEB","slateblue":"#6A5ACD","slategray":"#708090","snow":"#FFFAFA","springgreen":"#00FF7F","steelblue":"#4682B4","tan":"#D2B48C","teal":"#008080","thistle":"#D8BFD8","tomato":"#FF6347","turquoise":"#40E0D0","violet":"#EE82EE","wheat":"#F5DEB3","white":"#FFFFFF","whitesmoke":"#F5F5F5","yellow":"#FFFF00","yellowgreen":"#9ACD32"}

/**
 * Function to update the named colours available to the site
 * @param name Name of the new colour
 * @param value The hex/rgb value of the new colour
 */
export function updateNamedColours(name: string, value: string) {
	namedColours[name] = value;
}

export function getNamedColours(): Record<string, string> {
	return namedColours;
}

export function getNamedColour(key: string): string {
	try {
		return namedColours[key];
	} catch(e) {
		console.error(e.message);
		throw new Error('Invalid colour requested: ' + key);
	}
}

export function replaceNamedColours(
  input: string
) {
	if(input && namedColours[input]) return namedColours[input];
	return input;
}

export function parseColourString(
  input: string,
): Pick<Colour, "hsl" | "rgb" | "hex"> {
  if (typeof input !== "string") throw new TypeError("Invalid input type");

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
