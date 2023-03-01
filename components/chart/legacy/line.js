import { Chart } from './chart.js';
import { Series } from './series.js';
import { textLength } from './text.js';
import { mergeDeep } from './util.js';

const basefs = 17;
const colours = {};

// ORIGINAL FUNCTION BELOW
export function LineChart(config,csv){
	var opt = {
		'type': 'line-chart',
		'padding':{'left':0,'top':0,'right':0,'bottom':0},
		'left':0,
		'right':0,
		'top':0,
		'bottom':0,
		'tick':5,
		'font-size': basefs,
		'key':{
			'show':false,
			'border':{'stroke':'#000000','stroke-width':1,'fill':'rgba(255,255,255,0.9)'},
			'text':{'text-anchor':'start','dominant-baseline':'hanging','font-weight':'bold','fill':'#000000','stroke-width':0}
		},
		'axis':{'x':{'padding':10,'grid':{'show':false,'stroke':'#B2B2B2'},'labels':{}},'y':{'padding':10,'labels':{}}},
		'duration': '0.3s',
		'updatePadding': function(){
			var l,pad,len,ax,lines,align;
			// Work out padding
			pad = {'l':0,'t':0,'b':0,'r':0};
			for(ax in this.opt.axis){
				// Work out axis padding
				for(l in this.opt.axis[ax].labels){
					len = 0;
					// Split the label by any new line characters
					lines = this.opt.axis[ax].labels[l].label.split(/\n/g);

					// Length is based on the label length
					len = (this.opt.axis[ax].title && this.opt.axis[ax].title.label!="" ? this.opt['font-size']*2 : 0) + (this.opt['font-size']*lines.length) + this.opt.tick + (this.opt.axis[ax].labels[l].offset||this.opt.axis[ax].padding||0);
					align = this.opt.axis[ax].labels[l].align||(ax=="x" ? "bottom":"left");
					if(ax=="x"){
						if(align=="bottom") pad.b = Math.max(pad.b,len);
						else pad.t = Math.max(pad.t,len);
					}else{
						if(align=="left") pad.l = Math.max(pad.l,len);
						else pad.r = Math.max(pad.r,len);
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
	return this;
}