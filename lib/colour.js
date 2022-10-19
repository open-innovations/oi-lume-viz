
/* ============== */
/* Colours v0.3.2 */
// Define colour routines
export function Colour(c, n) {
	if (!c) return {};

	this.alpha = 1;

	// Let's deal with a variety of input
	if (c.indexOf('#') == 0) {
		this.hex = c;
		this.rgb = [h2d(c.substring(1, 3)), h2d(c.substring(3, 5)), h2d(c.substring(5, 7))];
	} else if (c.indexOf('rgb') == 0) {
		var bits = c.match(/[0-9\.]+/g);
		if (bits.length == 4) this.alpha = parseFloat(bits[3]);
		this.rgb = [parseInt(bits[0]), parseInt(bits[1]), parseInt(bits[2])];
		this.hex = "#" + d2h(this.rgb[0]) + d2h(this.rgb[1]) + d2h(this.rgb[2]);
	} else return {};
	this.hsv = rgb2hsv(this.rgb[0], this.rgb[1], this.rgb[2]);
	this.name = (n || "Name");
	var r, sat;
	for (r = 0, sat = 0; r < this.rgb.length; r++) {
		if (this.rgb[r] > 200) sat++;
	}
	this.toString = function () {
		return 'rgb' + (this.alpha < 1 ? 'a' : '') + '(' + this.rgb[0] + ',' + this.rgb[1] + ',' + this.rgb[2] + (this.alpha < 1 ? ',' + this.alpha : '') + ')';
	};
	// Improved method for working out best colour contrast
	this.text = contrastColour(this.hex);
	return this;
}


function d2h(d) { return ((d < 16) ? "0" : "") + d.toString(16); }
function h2d(h) { return parseInt(h, 16); }
/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param	Number	r		 The red color value
 * @param	Number	g		 The green color value
 * @param	Number	b		 The blue color value
 * @return	Array				The HSV representation
 */
function rgb2hsv(r, g, b) {
	r = r / 255;
	g = g / 255;
	b = b / 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, v = max;
	var d = max - min;
	s = max == 0 ? 0 : d / max;
	if (max == min) h = 0; // achromatic
	else {
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return [h, s, v];
}

// Functions for working out colour contrasts
function brightnessIndex(rgb){ return rgb[0]*0.299 + rgb[1]*0.587 + rgb[2]*0.114; }
function brightnessDiff(a,b){ return Math.abs(brightnessIndex(a)-brightnessIndex(b)); }
function hueDiff(a,b){ return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2]); }
export function contrastColour(c){
	var col,cols,rgb = [];
	if(c.indexOf('#')==0){
		rgb = [h2d(c.substring(1,3)),h2d(c.substring(3,5)),h2d(c.substring(5,7))];
	}else if(c.indexOf('rgb')==0){
		var bits = c.match(/[0-9\.]+/g);
		// If the opacity is low we'll return 'inherit'
		if(bits.length==4 && parseFloat(bits[3]) < 0.4) return "inherit"; 
		rgb = [parseInt(bits[0]),parseInt(bits[1]),parseInt(bits[2])];
	}
	// Check brightness contrast
	cols = {'black':{'rgb':[0,0,0]},'white':{'rgb':[255,255,255]}};
	for(col in cols){
		cols[col].brightness = brightnessDiff(rgb,cols[col].rgb);
		cols[col].hue = hueDiff(rgb,cols[col].rgb);
		cols[col].ok = (cols[col].brightness > 125 && cols[col].hue >= 500);
	}
	for(col in cols){
		if(cols[col].ok) return 'rgb('+cols[col].rgb.join(",")+')';
	}
	col = (cols.white.brightness > cols.black.brightness) ? "white" : "black"
	//console.warn('Text contrast not enough for '+c+' (colour contrast: '+cols[col].brightness.toFixed(1)+'/125, hue contrast: '+cols[col].hue+'/500)','background:'+c+';color:'+col,'background:none;color:inherit;');
	return col;
}


function Colours(scales) {
	if (!scales) scales = { 'Viridis': 'rgb(68,1,84) 0%, rgb(72,35,116) 10%, rgb(64,67,135) 20%, rgb(52,94,141) 30%, rgb(41,120,142) 40%, rgb(32,143,140) 50%, rgb(34,167,132) 60%, rgb(66,190,113) 70%, rgb(121,209,81) 80%, rgb(186,222,39) 90%, rgb(253,231,36) 100%' };
	function col(a) {
		if (typeof a === "string") return new Colour(a);
		else return a;
	}
	this.getColourPercent = function (pc, a, b, inParts) {
		var c;
		pc /= 100;
		a = col(a);
		b = col(b);
		c = { 'r': parseInt(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * pc), 'g': parseInt(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * pc), 'b': parseInt(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * pc), 'alpha': 1 };
		if (a.alpha < 1 || b.alpha < 1) c.alpha = ((b.alpha - a.alpha) * pc + a.alpha);
		if (inParts) return c;
		else return 'rgb' + (c.alpha && c.alpha < 1 ? 'a' : '') + '(' + c.r + ',' + c.g + ',' + c.b + (c.alpha && c.alpha < 1 ? ',' + c.alpha : '') + ')';
	};
	this.makeGradient = function (a, b) {
		a = col(a);
		b = col(b);
		var grad = a.toString() + ' 0%, ' + b.toString() + ' 100%';
		if (b) return 'background: ' + a.toString() + '; background: -moz-linear-gradient(left, ' + grad + ');background: -webkit-linear-gradient(left, ' + grad + ');background: linear-gradient(to right, ' + grad + ');';
		else return 'background: ' + a.toString() + ';';
	};
	this.getGradient = function (id) {
		return 'background: -moz-linear-gradient(left, ' + scales[id].str + ');background: -webkit-linear-gradient(left, ' + scales[id].str + ');background: linear-gradient(to right, ' + scales[id].str + ');';
	};
	this.addScale = function (id, str) {
		scales[id] = str;
		processScale(id, str);
		return this;
	};
	this.quantiseScale = function (id, n, id2) {
		var cs, m, pc, step, i;
		cs = [];
		m = n - 1;
		pc = 0;
		step = 100 / n;
		for (i = 0; i < m; i++) {
			cs.push(this.getColourFromScale(id, i, 0, m) + ' ' + (pc) + '%');
			cs.push(this.getColourFromScale(id, i, 0, m) + ' ' + (pc + step) + '%');
			pc += step;
		}
		cs.push(this.getColourFromScale(id, 1, 0, 1) + ' ' + (pc) + '%');
		cs.push(this.getColourFromScale(id, 1, 0, 1) + ' 100%');
		this.addScale(id2, cs.join(", "));
		return this;
	};
	function processScale(id, str) {
		if (scales[id] && scales[id].str) {
			console.warn('Colour scale ' + id + ' already exists. Bailing out.');
			return this;
		}
		scales[id] = { 'str': str };
		scales[id].stops = extractColours(str);
		return this;
	}
	function extractColours(str) {
		var stops, cs, i, c;
		stops = str.replace(/^\s+/g, "").replace(/\s+$/g, "").replace(/\s\s/g, " ").split(', ');
		cs = [];
		for (i = 0; i < stops.length; i++) {
			var bits = stops[i].split(/ /);
			if (bits.length == 2) cs.push({ 'v': bits[1], 'c': new Colour(bits[0]) });
			else if (bits.length == 1) cs.push({ 'c': new Colour(bits[0]) });
		}

		for (c = 0; c < cs.length; c++) {
			if (cs[c].v) {
				// If a colour-stop has a percentage value provided, 
				if (cs[c].v.indexOf('%') >= 0) cs[c].aspercent = true;
				cs[c].v = parseFloat(cs[c].v);
			}
		}
		return cs;
	}

	// Process existing scales
	for (var id in scales) {
		if (scales[id]) processScale(id, scales[id]);
	}

	// Return a Colour object for a string
	this.getColour = function (str) {
		return new Colour(str);
	};
	// Return the colour scale string
	this.getColourScale = function (id) {
		return scales[id].str;
	};
	// Return the colour string for this scale, value and min/max
	this.getColourFromScale = function (s, v, min, max, inParts) {
		var cs, v2, pc, c, cfinal;
		if (typeof inParts !== "boolean") inParts = false;
		if (!scales[s]) {
			this.log('WARNING', 'No colour scale ' + s + ' exists');
			return '';
		}
		if (typeof v !== "number") v = 0;
		if (typeof min !== "number") min = 0;
		if (typeof max !== "number") max = 1;
		cs = scales[s].stops;
		v2 = 100 * (v - min) / (max - min);
		cfinal = {};
		if (v == max) {
			cfinal = { 'r': cs[cs.length - 1].c.rgb[0], 'g': cs[cs.length - 1].c.rgb[1], 'b': cs[cs.length - 1].c.rgb[2], 'alpha': cs[cs.length - 1].c.alpha };
		} else {
			if (cs.length == 1) {
				cfinal = { 'r': cs[0].c.rgb[0], 'g': cs[0].c.rgb[1], 'b': cs[0].c.rgb[2], 'alpha': (v2 / 100).toFixed(3) };
			} else {
				for (c = 0; c < cs.length - 1; c++) {
					if (v2 >= cs[c].v && v2 <= cs[c + 1].v) {
						// On this colour stop
						pc = 100 * (v2 - cs[c].v) / (cs[c + 1].v - cs[c].v);
						if (pc > 100) pc = 100;	// Don't go above colour range
						cfinal = this.getColourPercent(pc, cs[c].c, cs[c + 1].c, true);
						continue;
					}
				}
			}
		}
		// If no red value is set and the value is greater than the max value, we'll default to the max colour
		if(typeof cfinal.r!=="number" && v > max) cfinal = { 'r': cs[cs.length - 1].c.rgb[0], 'g': cs[cs.length - 1].c.rgb[1], 'b': cs[cs.length - 1].c.rgb[2], 'alpha': cs[cs.length - 1].c.alpha };

		if (inParts) return cfinal;
		else return 'rgba(' + cfinal.r + ',' + cfinal.g + ',' + cfinal.b + ',' + cfinal.alpha + ")";
	};

	return this;
}


export const colourScales = new Colours({
	'Viridis': 'rgb(122,76,139) 0%, rgb(124,109,168) 12.5%, rgb(115,138,177) 25%, rgb(107,164,178) 37.5%, rgb(104,188,170) 50%, rgb(133,211,146) 62.5%, rgb(189,229,97) 75%, rgb(254,240,65) 87.5%, rgb(254,240,65) 100%',
	'Heat': 'rgb(0,0,0) 0%, rgb(128,0,0) 25%, rgb(255,128,0) 50%, rgb(255,255,128) 75%, rgb(255,255,255) 100%',
	'Planck': 'rgb(0,0,255) 0%, rgb(0,112,255) 16.666%, rgb(0,221,255) 33.3333%, rgb(255,237,217) 50%, rgb(255,180,0) 66.666%, rgb(255,75,0) 100%',
	'Plasma': 'rgb(12,7,134) 0%, rgb(82,1,163) 12.5%, rgb(137,8,165) 25%, rgb(184,50,137) 37.5%, rgb(218,90,104) 50%, rgb(243,135,72) 62.5%, rgb(253,187,43) 75%, rgb(239,248,33) 87.5%',
	'YFF': 'rgb(99,190,123) 0%, rgb(250,233,131) 50%, rgb(248,105,107) 100%',
	'Diverging': 'rgb(0,87,118) 0%, rgb(247,247,247) 50%, rgb(229,89,18) 100%',
	'YFF-Highlight': 'rgba(229,89,18,0) 0%, rgba(229,89,18,1) 100%'
});


