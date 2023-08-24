/**
 * Colours v0.6.0
 */
export { Colour } from "./colour.ts";
export { ColourScale } from "./colour-scale.ts";

import { updateColourScales } from './colour-scale.ts';
import { setBackgroundColour, getBackgroundColour, setSeriesColours } from "./colour.ts";

// Define colour names based on CSS
const namedColours: Record<string, string> = {"aqua":"#00FFFF","black":"#000000","blue":"#0000FF","fuchsia":"#FF00FF","gray":"#808080","green":"#008000","lime":"#00FF00","maroon":"#800000","navy":"#000080","olive":"#808000","purple":"#800080","red":"#FF0000","silver":"#C0C0C0","teal":"#008080","white":"#FFFFFF","yellow":"#FFFF00","aliceblue":"#F0F8FF","antiquewhite":"#FAEBD7","aqua":"#00FFFF","aquamarine":"#7FFFD4","azure":"#F0FFFF","beige":"#F5F5DC","bisque":"#FFE4C4","black":"#000000","blanchedalmond":"#FFEBCD","blue":"#0000FF","blueviolet":"#8A2BE2","brown":"#A52A2A","burlywood":"#DEB887","cadetblue":"#5F9EA0","chartreuse":"#7FFF00","chocolate":"#D2691E","coral":"#FF7F50","cornflowerblue":"#6495ED","cornsilk":"#FFF8DC","crimson":"#DC143C","cyan":"#00FFFF","darkblue":"#00008B","darkcyan":"#008B8B","darkgoldenrod":"#B8860B","darkgray":"#A9A9A9","darkgreen":"#006400","darkkhaki":"#BDB76B","darkmagenta":"#8B008B","darkolivegreen":"#556B2F","darkorange":"#FF8C00","darkorchid":"#9932CC","darkred":"#8B0000","darksalmon":"#E9967A","darkseagreen":"#8FBC8F","darkslateblue":"#483D8B","darkslategray":"#2F4F4F","darkturquoise":"#00CED1","darkviolet":"#9400D3","deeppink":"#FF1493","deepskyblue":"#00BFFF","dimgray":"#696969","dodgerblue":"#1E90FF","firebrick":"#B22222","floralwhite":"#FFFAF0","forestgreen":"#228B22","fuchsia":"#FF00FF","gainsboro":"#DCDCDC","ghostwhite":"#F8F8FF","gold":"#FFD700","goldenrod":"#DAA520","gray":"#7F7F7F","green":"#008000","greenyellow":"#ADFF2F","honeydew":"#F0FFF0","hotpink":"#FF69B4","indianred":"#CD5C5C","indigo":"#4B0082","ivory":"#FFFFF0","khaki":"#F0E68C","lavender":"#E6E6FA","lavenderblush":"#FFF0F5","lawngreen":"#7CFC00","lemonchiffon":"#FFFACD","lightblue":"#ADD8E6","lightcoral":"#F08080","lightcyan":"#E0FFFF","lightgoldenrodyellow":"#FAFAD2","lightgreen":"#90EE90","lightgrey":"#D3D3D3","lightpink":"#FFB6C1","lightsalmon":"#FFA07A","lightseagreen":"#20B2AA","lightskyblue":"#87CEFA","lightslategray":"#778899","lightsteelblue":"#B0C4DE","lightyellow":"#FFFFE0","lime":"#00FF00","limegreen":"#32CD32","linen":"#FAF0E6","magenta":"#FF00FF","maroon":"#800000","mediumaquamarine":"#66CDAA","mediumblue":"#0000CD","mediumorchid":"#BA55D3","mediumpurple":"#9370DB","mediumseagreen":"#3CB371","mediumslateblue":"#7B68EE","mediumspringgreen":"#00FA9A","mediumturquoise":"#48D1CC","mediumvioletred":"#C71585","midnightblue":"#191970","mintcream":"#F5FFFA","mistyrose":"#FFE4E1","moccasin":"#FFE4B5","navajowhite":"#FFDEAD","navy":"#000080","navyblue":"#9FAFDF","oldlace":"#FDF5E6","olive":"#808000","olivedrab":"#6B8E23","orange":"#FFA500","orangered":"#FF4500","orchid":"#DA70D6","palegoldenrod":"#EEE8AA","palegreen":"#98FB98","paleturquoise":"#AFEEEE","palevioletred":"#DB7093","papayawhip":"#FFEFD5","peachpuff":"#FFDAB9","peru":"#CD853F","pink":"#FFC0CB","plum":"#DDA0DD","powderblue":"#B0E0E6","purple":"#800080","red":"#FF0000","rosybrown":"#BC8F8F","royalblue":"#4169E1","saddlebrown":"#8B4513","salmon":"#FA8072","sandybrown":"#FA8072","seagreen":"#2E8B57","seashell":"#FFF5EE","sienna":"#A0522D","silver":"#C0C0C0","skyblue":"#87CEEB","slateblue":"#6A5ACD","slategray":"#708090","snow":"#FFFAFA","springgreen":"#00FF7F","steelblue":"#4682B4","tan":"#D2B48C","teal":"#008080","thistle":"#D8BFD8","tomato":"#FF6347","turquoise":"#40E0D0","violet":"#EE82EE","wheat":"#F5DEB3","white":"#FFFFFF","whitesmoke":"#F5F5F5","yellow":"#FFFF00","yellowgreen":"#9ACD32"}
const siteColours: Record<string, string> = {};

export function Colours(named: Record<string, string>){
	return new NamedColours(named);
}

function NamedColours(named: Record<string, string>){

	let colours = {};

	// Add the built-in colour names (CSS)
	for(let c in namedColours) colours[c] = {'colour':namedColours[c],'custom':false};

	// Add the site-wide colour names (CSS)
	for(let c in siteColours) colours[c] = {'colour':siteColours[c],'custom':true};

	// Add our passed in colours (and set the custom flag)
	if(named){
		for(let c in named){
			// Sanitise the name
			let nm = c.replace(/[\"\'\\]/g,"");
			colours[nm] = {'colour':named[c],'custom':true};
		}
	}

	// Add a named colour and set the custom flag
	this.add = function(name: string, value: string){
		colours[name] = {'colour':value,'custom':true};
		return this;
	};

	// Get all the named colours
	this.getAll = function(){
		let cs = {};
		for(let c in colours) cs[c] = colours[c].colour;
		return cs;
	};

	// Get all the custom colours
	this.getCustom = function(){
		let cs = {};
		for(let c in colours){
			if(colours[c].custom) cs[c] = colours[c].colour;
		}
		return cs;
	};

	// Get a specific colour (otherwise return the default background colour)
	this.get = function(key?: string){
		// If it looks like a colour we return that
		if(typeof key==="string"){
			if(key.indexOf('#')==0) return key;

			// Try to return a matched name
			if(key && key in colours) return colours[key].colour;
		}
		return '';
	};

	return this;
}

export function replaceNamedColours(
	input: string
) {
	if(input.indexOf('#')==0) return input;
	if(input){
		// Check if our site-wide named colours contain the string
		if(input in siteColours) return siteColours[input];
		// Check if our CSS named colours contain the string
		if(input in namedColours) return namedColours[input];
	}
	return input;
}

export function setDefaultColours({
	background, names, scales, series,
}: {
	background?: string;
	series?: [string];
	names?: Record<string, string>;
	scales?: Record<string, string>;
}) {

	// If colour scales provided when instantiating the plugin, map these into the default scales provided.
	if (scales) {
		for(const [key, value] of Object.entries(scales) ) {
				updateColourScales(key, value);
		}
	}

	// If colour names are provided when instantiating the plugin, map these into the default named colours.
	if (names) {
		for(const [key, value] of Object.entries(names) ) {
			siteColours[key] = value;
		}
	}

	// If an array of series colours are provided when instantiating the plugin, map these into the default series colours.
	if (series) setSeriesColours(series);

	// If background colour, update the site-wide default with this
	if (background) setBackgroundColour(background);


}