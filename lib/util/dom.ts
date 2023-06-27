import { document } from './document.ts';

export function newEl(t){ return document.createElement(t); }

export function svgEl(t){ return document.createElement(t);/*return document.createElementNS(ns,t);*/ }

export function setAttr(el,prop){
	for(var p in prop){
		if(prop[p]) el.setAttribute(p,prop[p]);
	}
	return el;
}

export function addTspan(str: string) {
	// If string has no newlines, just return it
	if (!str.includes("\n")) return str;

	const tspan = str.split(/\n/);
	// Build a new string
	let newString = "";
	for (let s = 0; s < tspan.length; s++) {
		const dy = 3 * ((s + 0.5) - (tspan.length / 2));
		newString += '<tspan y="' + dy + '%" x="0">' + tspan[s] + "</tspan>";
	}
	return newString;
}