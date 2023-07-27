import { Chart } from './chart.js';
import { textLength, getFontSize } from '../../../lib/font/fonts.ts';
import { mergeDeep } from './util.js';

const colours = {};

// ORIGINAL FUNCTION BELOW
export function LineChart(config,csv){

	const basefs = getFontSize();

	var opt = {
		'type': 'line-chart',
		'padding':{'left':0,'top':0,'right':0,'bottom':0},
		'left':0,
		'right':0,
		'top':0,
		'bottom':0,
		'font-size': basefs,
		'legend':{
			'show': true,
			'border':{'stroke':'#000000','stroke-width':1,'fill':'rgba(255,255,255,0.9)'},
			'text':{'text-anchor':'start','dominant-baseline':'hanging','font-weight':'bold','fill':'#000000','stroke-width':0}
		},
		'axis':{'x':{'padding':5,'tick':{'size':0.5},'grid':{'show':false,'stroke':'#B2B2B2'},'labels':{}},'y':{'padding':5,'tick':{'size':0.5},'labels':{}}},
		'duration': '0.3s',
		'updatePadding': function(){
			var l,pad,ax,lines,align,titlesize,extent,lbl,tick;
			// Work out padding
			pad = {'l':0,'t':0,'b':0,'r':0};
			for(ax in this.opt.axis){
				// The extent (in the perpendicular dimension) of the axis title
				titlesize = 0;
				if(this.opt.axis[ax].title && this.opt.axis[ax].title.label!=""){
					titlesize += this.opt['font-size']*2;	// A line height of 2em
				}
				// Work out axis padding
				for(l in this.opt.axis[ax].labels){

					// The extent of the axis furniture - start from the size of the title
					extent = titlesize;

					// Replace string-based newlines
					lbl = (this.opt.axis[ax].labels[l].label||"").replace(/\\n/g,'\n');

					// Split the label by any new line characters
					lines = lbl.split(/\n/g);

					// Get alignment (or use defaults)
					align = this.opt.axis[ax].labels[l].align||(ax=="x" ? "bottom":"left");

					tick = 0;
					if(typeof this.opt.axis[ax].tick.size==="number") tick = this.opt.axis[ax].tick.size;
					if(typeof this.opt.axis[ax].labels[l].tickSize==="number") tick = this.opt.axis[ax].labels[l].tickSize;
					extent += tick;
					extent += (this.opt.axis[ax].labels[l].offset||(lbl ? this.opt.axis[ax].padding : 0)||0);

					if(ax=="x"){
						extent += lines.length * this.opt['font-size'];
						if(align=="bottom") pad.b = Math.max(pad.b,extent);
						else pad.t = Math.max(pad.t,extent);
					}else{
						// Length is based on the label length
						extent += Math.ceil(textLength(lines[0],this.opt['font-size'],this.opt.axis[ax]['font-weight'],this.opt.axis[ax]['font-family']));
						if(align=="left") pad.l = Math.max(pad.l,extent);
						else pad.r = Math.max(pad.r,extent);
					}
				}
			}
			this.opt.left = this.opt.padding.left + pad.l;
			this.opt.right = this.opt.padding.right + pad.r;
			this.opt.top = this.opt.padding.top + pad.t;
			this.opt.bottom = this.opt.padding.bottom + pad.b;
			return this;
		}
	};
	mergeDeep(opt,config);

	this.chart = new Chart(opt,csv);

	this.getSVG = function(){ return this.chart.getSVG(); };

	// Pass back the updated legend
	config.legend = opt.legend;

	return this;
}