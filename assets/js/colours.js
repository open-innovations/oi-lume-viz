/*
	Open Innovations Colour functions
*/

(function(root){

	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		root.OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}

	function d2h(d){ return ((d < 16) ? "0" : "") + d.toString(16); }
	function h2d(h){ return parseInt(h, 16); }
	function splitStringToNumbers(input){
		return input.split(/,/).map((x) => parseInt(x));
	}

	function extractColours(gradient) {
		var stops = gradient.match(/(([a-z]{3,4}\([^\)]+\)|#[A-Fa-f0-9]{6}) \d+\%?)/g);
		if (stops === null) console.error("Can't parse gradient string: \""+gradient+"\"");
		var cs = [];
		var i,v,aspercent;
		for(i = 0; i < stops.length; i++) {
			v = Infinity;
			aspercent = false;
			stops[i].replace(/ (\d+\%?)$/, function (_, p1) {
				if (p1.match("%")) aspercent = true;
				v = parseFloat(p1);
				return "";
			});
			cs.push({ v: v, c: Colour(stops[i]), aspercent: aspercent });
		}

		return cs;
	}

	function getColourPercent(pc,a,b){
		pc /= 100;
		if(typeof a.alpha !== "number") a.alpha = 1;
		if(typeof b.alpha !== "number") b.alpha = 1;
		var c = {
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

	function validateNumberList(list, options){
		if(!options) options = {};
		var expectedLength = options.expectedLength||3;
		var maxValues = options.maxValues||[255, 255, 255];
		var i;
		if (list.length < expectedLength) console.error("Too few bits");
		if (list.length > expectedLength) console.error("Too many bits");
		for(i = 0; i < expectedLength; i++) {
			if (list[i] < 0) console.error("Number too small");
		}
		for(i = 0; i < Math.min(maxValues.length, expectedLength); i++) {
			if (list[i] > maxValues[i]) console.error("Number too big");
		}
	}
	function rgbToHsl(r,g,b){
		r /= 255;
		g /= 255;
		b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h = 0;
		var s = 0;
		var l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
				case g:
				h = (b - r) / d + 2;
				break;
				case b:
				h = (r - g) / d + 4;
				break;
			}
			h /= 6;
		}

		return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
	}
	function hslToHex(h,s,l){
		l /= 100;
		var a = s * Math.min(l, 1 - l) / 100;
		function f(n){
			var k = (n + h / 30) % 12;
			var color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color).toString(16).padStart(2, "0"); // convert to Hex and prefix "0" if needed
		}
		return "#"+f(0)+f(8)+f(4);
	}
	function hslToRgb(h,s,l){
		l /= 100;
		var a = s * Math.min(l, 1 - l) / 100;
		function f(n){
			var k = (n + h / 30) % 12;
			return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		}
		return [ Math.round(255 * f(0)),Math.round(255 * f(8)),Math.round(255 * f(4))];
	}
	function rgbToHex(r,g,b){
		return "#" + d2h(r) + d2h(g) + d2h(b);
	}
	function hexToRGB(hex){
		return [h2d(hex.substring(1, 3)),h2d(hex.substring(3, 5)),h2d(hex.substring(5, 7)) ];
	}
	function parseColourString(input){
		if (typeof input !== "string"){
			console.error('Trying to pass non-string to OI Lume Viz: hex cartogram: parseColourString',input,typeof input);
		}

		var expectedLength = 3;
		var maxValues = [255, 255, 255];
		var str,rgb,hsl,hex;
		if (input.toLowerCase().indexOf("hsl") == 0) {
			str = input.replace(/hsla?\(/i, "").replace(/\)/, "");
			maxValues = [360, 100, 100];
			if (input[3].toLowerCase() === "a") {
				expectedLength = 4;
				maxValues.push(1);
			}
			hsl = splitStringToNumbers(str);
			validateNumberList(hsl, {
				expectedLength: expectedLength,
				maxValues: maxValues,
			});
			rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
			hex = hslToHex(hsl[0], hsl[1], hsl[2]);
			return { rgb: rgb, hex: hex, hsl: hsl };
		}else if (input.toLowerCase().indexOf("rgb") == 0) {
			str = input.replace(/rgba?\(/i, "").replace(/\)/, "");
			rgb = splitStringToNumbers(str);
			if (input[3].toLowerCase() === "a") {
				expectedLength = 4;
				maxValues.push(1);
			}
			validateNumberList(rgb, {
				expectedLength: expectedLength,
				maxValues: maxValues,
			});
			hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
			hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
			return { rgb: rgb, hex: hex, hsl: hsl };
		}else if (input.indexOf("#") == 0) {
			hex = input;
			rgb = hexToRGB(hex);
			hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
			return { rgb: rgb, hex: hex, hsl: hsl };
		}else{
			console.log('Attempting to parse '+input);
		}
		console.error("Unable to parse colour string");
	}
	/*
		A Colour object can be created with:
			Colour('hsl(50, 50%, 78%)')
			Colour('rgb(255, 200, 22)')
			Colour('#ffdd22')
		A Colour contains:
			Colour.rgb - RGB e.g. [0,0,0]
			Colour.hex - a hex code e.g. '#000000'
			Colour.hsl - HSL e.g. 'hsl(0,0,0)'
			Colour.contrast - the most contrasting colour e.g. 'white'
	*/
	function Colour(str) {
		// Use the background colour if we don't have a string
		if(typeof str != "string") console.error('No input string');
		// Parse the string
		var rtn = parseColourString(str);
		var rgb = rtn.rgb;
		var hex = rtn.hex;
		var hsl = rtn.hsl;
		var contrast = "white";

		// Check brightness contrast
		var cols = {
			"black": { "rgb": [0, 0, 0] },
			"white": { "rgb": [255, 255, 255] },
		};
		var maxRatio = 0;
		var col,contr;
		for(col in cols) {
			contr = contrastRatio(rgb, cols[col].rgb);
			if(contr > maxRatio){
				maxRatio = contr;
				contrast = col;
			}
		}

		return { 'rgb':rgb, 'hex':hex, 'hsl':hsl, 'contrast':contrast };
	}

	/*
		A ColourScale function e.g.:
		ColourScale('hsl(87, 57%, 86%) 0%, hsl(191, 57%, 15%) 100%')
	*/
	function ColourScale(gradient){
		var min = 0;
		var max = 1;
		//if(namedColourScales[gradient]) gradient = namedColourScales[gradient];
		var stops = extractColours(gradient);

		function getColour(v){
			var v2 = 100 * (v - min) / (max - min);
			var cfinal = {};
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
					for(var c = 0; c < stops.length - 1; c++) {
						if (v2 >= stops[c].v && v2 <= stops[c + 1].v) {
							// On this colour stop
							var pc = 100 * (v2 - stops[c].v) / (stops[c + 1].v - stops[c].v);
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
		getColour.gradient = "background: -moz-linear-gradient(left, " + gradient + ");background: -webkit-linear-gradient(left, " + gradient + ");background: linear-gradient(to right, " + gradient + ");";

		return getColour;
	}

	// Convert to sRGB colorspace
	// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
	function sRGBToLinear(v){
		v /= 255;
		if (v <= 0.03928) return v/12.92;
		else return Math.pow((v+0.055)/1.055,2.4);
	}
	// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
	function relativeLuminance(rgb){ return 0.2126 * sRGBToLinear(rgb[0]) + 0.7152 * sRGBToLinear(rgb[1]) + 0.0722 * sRGBToLinear(rgb[2]); }
	// https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html#contrast-ratiodef
	function contrastRatio(a, b){
		var L1 = relativeLuminance(a);
		var L2 = relativeLuminance(b);
		if(L1 < L2){
			var temp = L2;
			L2 = L1;
			L1 = temp;
		}
		return (L1 + 0.05) / (L2 + 0.05);
	}	
	function contrastColour(c){
		var rgb = [];
		if(c.indexOf('#')==0){
			rgb = [h2d(c.substring(1,3)),h2d(c.substring(3,5)),h2d(c.substring(5,7))];
		}else if(c.indexOf('rgb')==0){
			var bits = c.match(/[0-9\.]+/g);
			if(bits.length == 4) this.alpha = parseFloat(bits[3]);
			rgb = [parseInt(bits[0]),parseInt(bits[1]),parseInt(bits[2])];
		}
		var cols = {
			"black": [0, 0, 0],
			"white": [255, 255, 255],
		};
		var maxRatio = 0;
		var contrast = "white";
		for(var col in cols){
			var contr = contrastRatio(rgb, cols[col]);
			if(contr > maxRatio){
				maxRatio = contr;
				contrast = col;
			}
		}
		if(maxRatio < 4.5){
			console.warn('Text contrast poor ('+maxRatio.toFixed(1)+') for %c'+c+'%c','background:'+c+';color:'+contrast,'background:none;color:inherit;');
		}else if(maxRatio < 7){
			//console.warn('Text contrast good ('+maxRatio.toFixed(1)+') for %c'+c+'%c','background:'+c+';color:'+contrast,'background:none;color:inherit;');
		}
		return contrast;
	}
	if(!root.OI.contrastColour) root.OI.contrastColour = contrastColour;

	root.OI.ColourScale = ColourScale;
	root.OI.Colour = Colour;

})(window || this);