import { Chart } from './chart.js';
import { Series } from './series.js';
import { textLength, getFontSize } from '../../../lib/font/fonts.ts';
import { applyReplacementFilters } from '../../../lib/util.js';
import { Where } from '../../../lib/util/where.js';
import { mergeDeep } from './util.js';
import { Colours } from '../../../lib/colour/colours.ts';

// ORIGINAL FUNCTION BELOW
export function ScatterChart(config,csv){

	const basefs = getFontSize();
	// Define some colours
	const namedColours = Colours(config.colours);

	var opt = {
		'type': 'scatter-chart',
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
		'buildSeries': function(){
			let s,i,labx,laby,x,y,label,datum,data,colour,colouri,keep,rowValidator;
			// Build the series
			for(s = 0; s < this.opt.series.length; s++){

				colour = namedColours.get(this.opt.series[s].colour)||namedColours.get(this.opt.series[s].title)||this.opt.series[s].colour||null;

				// Over-write some series options
				mergeDeep(this.opt.series[s],{
					'line':{
						'show': false,
						'color': colour
					},
					'points':{
						'size':(this.opt.series[s].points && typeof this.opt.series[s].points.size==="number" ? this.opt.series[s].points.size : 5),
						'color': colour
					}
				});

				// Build the data for this series
				data = [];

				// Is there a `where` modifier to this series?
				if(typeof this.opt.series[s].where==="string"){
					if(!rowValidator) rowValidator = Where();
					rowValidator.set(this.opt.series[s].where);
				}

				for(i = 0; i < csv.rows.length; i++){
					// Do we keep this row?
					keep = (typeof this.opt.series[s].where==="string" ? rowValidator.isValid(csv.rows[i]) : true);
					if(keep){
						labx = x = csv.columns[this.opt.series[s].x][i];
						laby = y = csv.columns[this.opt.series[s].y][i];
						if(typeof x==="string") x = i;
						if(typeof y==="string") y = i;
						if(x >= this.opt.axis.x.min && x <= this.opt.axis.x.max){
							label = this.opt.series[s].title+"\n"+labx+': '+(laby);
							colouri = colour;
							if(this.opt.series[s].colour && csv.columns[this.opt.series[s].colour]) colouri = namedColours.get(csv.columns[this.opt.series[s].colour][i]);
							colouri = namedColours.get(colouri)||colouri;
							if(this.opt.series[s].tooltip){
								if(this.opt.series[s].tooltip in csv.columns){
									label = csv.columns[this.opt.series[s].tooltip][i];
								}else{
									let options = JSON.parse(JSON.stringify(csv.rows[i]));
									options._colour = colouri;
									options._title = this.opt.series[s].title;
									label = applyReplacementFilters(this.opt.series[s].tooltip,options);
								}
							}


							datum = {'x':x,'y':y,'title':label,'colour':colouri};
							datum.data = {'series':this.opt.series[s].title};
							data.push(datum);
						}
					}
				}
				this.series.push(new Series(s,this.opt.series[s],data));
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