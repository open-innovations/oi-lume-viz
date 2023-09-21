import { Chart } from './chart.js';
import { textLength, getFontSize } from '../../../lib/font/fonts.ts';
import { applyReplacementFilters } from '../../../lib/util.js';
import { mergeDeep } from './util.js';
import { Colours } from '../../../lib/colour/colours.ts';
import { Series } from './series.js';

const colours = {};

// ORIGINAL FUNCTION BELOW
export function RidgeLineChart(config,csv){

	const basefs = getFontSize();
	const namedColours = Colours(config.colours);
	let ymax = -Infinity;
	let ymin = Infinity;
	let yrange = 0;
	let ysize = 0.1;

	var opt = {
		'type': 'ridgeline-chart',
		'padding':{'left':0,'top':0,'right':0,'bottom':0},
		'left':0,
		'right':0,
		'top':0,
		'bottom':0,
		'font-size': basefs,
		'legend':{
			'show': false,
			'border':{'stroke':'#000000','stroke-width':1,'fill':'rgba(255,255,255,0.9)'},
			'text':{'text-anchor':'start','dominant-baseline':'hanging','font-weight':'bold','fill':'#000000','stroke-width':0}
		},
		'axis':{'x':{'padding':5,'tick':{'size':0.5},'grid':{'show':false,'stroke':'#B2B2B2'},'labels':{}},'y':{'padding':5,'tick':{'size':0.5},'grid':{'show':false,'stroke':'#B2B2B2'},'labels':{}}},
		'duration': '0.3s',
		'buildSeries': function(){
			let s,i,labx,laby,x,y,label,datum,data,options;
						
			// Build the series
			for(s = 0; s < this.opt.series.length; s++){
				mergeDeep(this.opt.series[s],{
					'line':{'show':true,'color': namedColours.get(this.opt.series[s].colour||this.opt.series[s].title),'fill':(this.opt.series[s].fill||'#ffffff'),'fill-opacity':(this.opt.series[s].fillOpacity||0.8),'curvature':(config.ridgeline && typeof config.ridgeline.curvature ? config.ridgeline.curvature : 0)},
					'points':{'size':(this.opt.series[s].points && typeof this.opt.series[s].points.size==="number" ? this.opt.series[s].points.size : 1), 'color': namedColours.get(this.opt.series[s].colour||this.opt.series[s].title)}
				});
				data = [];
				if(typeof this.opt.series[s].x==="undefined" || typeof this.opt.series[s].y==="undefined"){
					throw new TypeError('Missing x/y values for series '+s);
				}
				for(i = 0; i < csv.rows.length; i++){
					labx = x = csv.columns[this.opt.series[s].x][i];
					laby = y = csv.columns[this.opt.series[s].y][i];
					// Convert to dates
					if(typeof x==="string" && x.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)){
						x = parseInt(x.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2})/,function(m,p1){ return (new Date(p1)).getTime(); }));
					}
					if(typeof x==="string") x = i;
					if(typeof y==="string") y = i;
					if(x >= this.opt.axis.x.min && x <= this.opt.axis.x.max){
						label = this.opt.series[s].title+"\n"+labx+': '+(laby);
						if(this.opt.series[s].tooltip){
							if(this.opt.series[s].tooltip in csv.columns){
								label = csv.columns[this.opt.series[s].tooltip][i];
							}else{
								options = JSON.parse(JSON.stringify(csv.rows[i]));
								options._x = x;
								options._y = y;
								options._colour = namedColours.get(this.opt.series[s].colour||this.opt.series[s].title);
								options._title = this.opt.series[s].title;
								label = applyReplacementFilters(this.opt.series[s].tooltip,options);
							}
						}
						datum = {'x':x,'y':(this.opt.series.length-1-s)+(ysize*(y-ymin)/yrange),'title':label};
						datum.data = {'series':this.opt.series[s].title};
						data.push(datum);
					}
				}
				this.series.push(new Series(s,this.opt.series[s],data));
			}
			return this;
		},
		'buildAxes': function(){
			let s,i,x,y;

			// Calculate ridgeplot range
			if(config.ridgeline && typeof config.ridgeline.height==="number"){
				ysize = config.ridgeline.height;
			}else{
				ysize = Math.max(2,0.1*this.opt.series.length);
			}
			for(s = 0; s < this.opt.series.length; s++){
				for(i = 0; i < csv.rows.length; i++){
					x = csv.columns[this.opt.series[s].x][i];
					y = csv.columns[this.opt.series[s].y][i];
					ymax = Math.max(ymax,y);
					ymin = Math.min(ymin,y);
				}
			}
			yrange = ymax-ymin;

			// Axes

			this.opt.axis.x.labels = [];
			this.opt.axis.y.labels = [];

			// Build x-axis labels
			for(i = 0; i < this.opt.axis.x.ticks.length; i++) this.opt.axis.x.labels[this.opt.axis.x.ticks[i].value] = this.opt.axis.x.ticks[i];

			// Set y-axis range for categories
			this.opt.axis.y.min = -0.5;
			this.opt.axis.y.max = (this.opt.series.length-1) + 0.5 + ysize;
			
			// Build y-axis labels
			for(s = 0 ; s < this.opt.series.length; s++){
				this.opt.axis.y.labels[this.opt.series.length-1-s] = {'label':(""+(this.opt.series[s].title||"")).replace(/\\n/g,"\n"),'tickSize':0,'grid':false,'font-weight':'bold'};
			}
			return this;
		},
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