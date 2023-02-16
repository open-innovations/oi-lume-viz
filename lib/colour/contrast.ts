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
