type ThreepleNumber = [number, number, number]

// Convert to sRGB colorspace
// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
function sRGBToLinear(v: number){
	v /= 255;
    if (v <= 0.03928) return v/12.92;
	else return Math.pow((v+0.055)/1.055,2.4);
}

// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
function relativeLuminance(rgb: ThreepleNumber){
	return <number> 0.2126 * sRGBToLinear(rgb[0]) + 0.7152 * sRGBToLinear(rgb[1]) + 0.0722 * sRGBToLinear(rgb[2]);
}

// https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html#contrast-ratiodef
export function contrastRatio(a: ThreepleNumber, b: ThreepleNumber){
	let L1 = relativeLuminance(a);
	let L2 = relativeLuminance(b);
	if(L1 < L2){
		let temp = L2;
		L2 = L1;
		L1 = temp;
	}
	return (L1 + 0.05) / (L2 + 0.05);
}

function h2d(h) {return parseInt(h,16);}

export function contrastColour(c: string){
	let rgb = [];
	let alpha = 1;
	if(c.indexOf('#')==0){
		rgb = [h2d(c.substring(1,3)),h2d(c.substring(3,5)),h2d(c.substring(5,7))];
	}else if(c.indexOf('rgb')==0){
		let bits = c.match(/[0-9\.]+/g);
		if(bits.length == 4) alpha = parseFloat(bits[3]);
		rgb = [parseInt(bits[0]),parseInt(bits[1]),parseInt(bits[2])];
	}
	let cols = {
		"black": [0, 0, 0],
		"white": [255, 255, 255],
	};
	let maxRatio = 0;
	let contrast = "white";
	for(let col in cols){
		let contr = contrastRatio(rgb, cols[col]);
		if(contr > maxRatio){
			maxRatio = contr;
			contrast = col;
		}
	}
	if(contrast == "black") contrast = "rgba(0,0,0,"+alpha+")";
	if(contrast == "white") contrast = "rgba(255,255,255,"+alpha+")";
	if(maxRatio < 4.5){
		console.warn('Text contrast poor ('+maxRatio.toFixed(1)+') for %c'+c+'%c','background:'+c+';color:'+contrast,'background:none;color:inherit;');
	}else if(maxRatio < 7){
		//console.warn('Text contrast good ('+maxRatio.toFixed(1)+') for %c'+c+'%c','background:'+c+';color:'+contrast,'background:none;color:inherit;');
	}
	return contrast;
}