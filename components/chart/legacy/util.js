import { document } from '../../../lib/util/document.ts';

export function mergeDeep(obj1, obj2){
	for(const p in obj2){
		try{
			if(obj2[p].constructor==Object) obj1[p] = mergeDeep(obj1[p], obj2[p]);
			else obj1[p] = obj2[p];
		}catch(e){ obj1[p] = obj2[p]; }
	}
	return obj1;
}
export function qs(el,t){ return el.querySelector(t); }
export function add(el,to){ return to.appendChild(el); }
export function clone(a){ return JSON.parse(JSON.stringify(a)); }
export function svgEl(t){ return document.createElement(t);/*return document.createElementNS(ns,t);*/ }
export function setAttr(el,prop){
	for(const p in prop){
		if(prop[p]===undefined ||(typeof prop[p]==="string" && prop[p]=="")) el.removeAttribute(p);
		else el.setAttribute(p,prop[p]);
	}
	return el;
}
export function addClasses(el,cl){
	for(let i = 0; i < cl.length; i++) el.classList.add(cl[i]);
	return el;
}
export function roundTo(x,n){
	const f = Math.pow(10,n);
	const str = (Math.round(x*f)/f).toFixed(n);
	return (str ? str.replace(/(\.\d*?[1-9])0+$/g, "$1").replace(/\.0+$/,"") : "");
}
