import { mergeDeep } from '../../../lib/util/merge-deep.ts';
import { add, svgEl, setAttr, addClasses, roundTo } from './util.js';
import { Marker } from './marker.js';


// Build a key item
export function KeyItem(attr){

	if(!attr) throw("No options provided");
	
	var opts = {
		'points': {'marker':(attr.type=="bar-chart" || attr.type=="stacked-bar-chart" ? "square" : "circle")},
		'fontSize': 1,	// Deliberately small so we can see it is bad
		'itemWidth': 2
	}

	// Set some default values
	mergeDeep(opts,attr);

	this.el = svgEl("g");
	this.el.setAttribute('data-series',opts.s+1);

	// Update class of line
	let cl = ['data-series','data-series-'+(opts.s+1)];
	if(opts.series.getProperty('class')) cl.concat(series.getProperty('class').split(/ /));
	addClasses(this.el,cl);

	let line = svgEl('path');
	setAttr(line,{'d':'M0 0 L 1 0','stroke-width':opts.line['stroke-width']||4,'stroke-dasharray':opts.line['stroke-dasharray']||'','stroke-linecap':'round','class':'line item-line'});
	
	let mark = new Marker(opts.points);
	mark.addClass('item-mark');
	let size = attr.type=="bar-chart" || attr.type=="stacked-bar-chart" ? opts.fontSize : Math.min((opts.points.size||opts.fontSize/2),opts.fontSize);
	mark.setSize(size);	// Default size of key item
	mark.setAttr({'fill':'silver'});

	this.el.appendChild(line);
	this.el.appendChild(mark.el);
	
	this.label = (opts.series.getProperty('title')||"Series "+(opts.s+1));


	let fs = opts.fontSize;
	let p = opts.series.getProperties();
	mark.setPosition(roundTo(fs*(opts.itemWidth/2), 3),roundTo(0.5*fs, 3),fs/2);
	mark.setAttr({'fill':(p.points.color||""),'stroke-width':p.points['stroke-width']||0,'stroke':p.points.stroke||""});
	if(size <= 1) mark.setAttr({'opacity':'0.01'});

	if(opts.type=="line-chart" || opts.type=="category-chart"){
		line.setAttribute('d','M'+0+','+roundTo(fs*0.5, 3)+' l '+(fs*opts.itemWidth)+' 0');
		if(p.line.color) line.setAttribute('stroke',p.line.color||"");
		line.setAttribute('vector-effect','non-scaling-stroke');
	}

	this.colour = (p.points.color||"");

	this.getSVG = function(){
		var svg = '<svg xmlns="http://www.w3.org/2000/svg" overflow="visible" class="oi-legend-icon" data-series="'+(opts.s+1)+'" height="1em" style="aspect-ratio:'+opts.itemWidth+' / 1" viewBox="0 0 '+(opts.itemWidth*opts.fontSize)+' '+opts.fontSize+'">';
		svg += this.el.outerHTML;
		svg += '</svg>';
		return svg;
	};

	return this;
}