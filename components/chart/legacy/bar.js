import { Chart } from './chart.js';
import { Series } from './series.js';
import { textLength, getFontSize } from '../../../lib/font/fonts.ts';
import { applyReplacementFilters } from '../../../lib/util.js';
import { Where } from '../../../lib/util/where.js';
import { Colours } from '../../../lib/colour/colours.ts';
import { mergeDeep } from './util.js';

// ORIGINAL FUNCTION BELOW
export function BarChart(config,csv){

	const basefs = getFontSize();
	// Define some colours
	const namedColours = Colours(config.colours);

	var opt = {
		'type': 'bar-chart',
		'padding':{'left':0,'top':0,'right':0,'bottom':0},
		'left':0,
		'right':0,
		'top':0,
		'bottom':0,
		'font-size': basefs,
		'font-weight': 'normal',
		'legend':{
			'show':false,
			'border':{'stroke':'#000000','stroke-width':1,'fill':'rgba(255,255,255,0.9)'},
			'text':{'text-anchor':'start','dominant-baseline':'hanging','font-weight':'bold','fill':'#000000','stroke-width':0}
		},
		'axis':{'x':{'padding':10,'grid':{'show':true,'stroke':'#B2B2B2'},'labels':{},'tick':{'size':5}},'y':{'padding':10,'labels':{},'tick':{'size':5}}},
		'duration': '0.3s',
		'buildSeries': function(){

			// Series
			let data,datum,label,i,s,categoryoffset,seriesoffset,colour,colouri,rowValidator;

			for(s = 0; s < this.opt.series.length; s++){

				colour = namedColours.get(this.opt.series[s].colour)||namedColours.get(this.opt.series[s].title)||null;

				mergeDeep(this.opt.series[s],{
					'line':{'show':false,'color':colour},
					'points':{'show':false,'size':(this.opt.series[s].points ? this.opt.series[s].points.size : null)||4, 'color': colour},
					'bars':{'show':true,'color':colour},
					'errorbars':{'stroke':colour,'stroke-width':2}
				});

				// Duplicate errors if only one error value given
				if(this.opt.series[s].errors && this.opt.series[s].errors.length==1) this.opt.series[s].errors.push(this.opt.series[s].errors[0]);
				data = [];

				// Is there a `where` modifier to this series?
				if(typeof this.opt.series[s].where==="string"){
					if(!rowValidator) rowValidator = Where();
					rowValidator.set(this.opt.series[s].where);
				}else{
					rowValidator = {'isValid':function(){return true;}};
				}

				for(i = 0; i < csv.rows.length; i++){

					// Do we keep this row?
					if(rowValidator.isValid(csv.rows[i])){
						categoryoffset = csv.rows.length-i-1;
						seriesoffset = ((this.opt.series.length/2)-s-0.5)*(0.8/this.opt.series.length);
						label = this.opt.series[s].title+"\n"+(""+(csv.columns[this.opt.category][i]||"")).replace(/\\n/g,"")+': '+(isNaN(csv.columns[this.opt.series[s].value][i]) ? "?" : csv.columns[this.opt.series[s].value][i]);
						// If the errors have values we add them to the label
						if(this.opt.series[s].errors){
							if(!isNaN(csv.columns[this.opt.series[s].errors[0]][i]) && !isNaN(csv.columns[this.opt.series[s].errors[1]][i])){
								if(csv.columns[this.opt.series[s].errors[0]][i]==csv.columns[this.opt.series[s].errors[1]][i]){
									label += (' ± '+(isNaN(csv.columns[this.opt.series[s].errors[0]][i]) ? "0" : csv.columns[this.opt.series[s].errors[0]][i]));
								}else{
									label += ' (+'+(isNaN(csv.columns[this.opt.series[s].errors[1]][i]) ? "0" : csv.columns[this.opt.series[s].errors[1]][i])+', -'+(isNaN(csv.columns[this.opt.series[s].errors[0]][i]) ? "0" : csv.columns[this.opt.series[s].errors[0]][i])+')';
								}
							}
						}

						colouri = colour;
						if(this.opt.series[s].colour && csv.columns[this.opt.series[s].colour]) colouri = namedColours.get(csv.columns[this.opt.series[s].colour][i]);

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


						datum = {
							'x':(isNaN(csv.columns[this.opt.series[s].value][i]) ? null : csv.columns[this.opt.series[s].value][i]),
							'y':categoryoffset+seriesoffset,
							'title':label,
							'colour': colouri
						};

						// Add errors if we have them
						if(this.opt.series[s].errors) datum.error = {'x':[csv.columns[this.opt.series[s].errors[0]][i],csv.columns[this.opt.series[s].errors[1]][i]]};
						datum.data = {'category':csv.columns[this.opt.category][i],'series':this.opt.series[s].title};
						data.push(datum);
					}
				}
				this.series.push(new Series(s,this.opt.series[s],data,{'axis':this.opt.axis,'barsize':(this.opt.gap ? (1-Math.min(1,Math.max(0,parseFloat(this.opt.gap)))) : 1)*(0.8/this.opt.series.length)}));
			}
			return this;
		},
		'buildAxes': function(){
			var i;
			// Axes
			// Build x-axis labels
			for(i = 0; i < this.opt.axis.x.ticks.length; i++) this.opt.axis.x.labels[this.opt.axis.x.ticks[i].value] = this.opt.axis.x.ticks[i];
			// Set y-axis range for categories
			this.opt.axis.y.min = -0.5;
			this.opt.axis.y.max = csv.rows.length-0.5;
			// Build y-axis labels
			for(i = 0 ; i < csv.rows.length; i++){
				this.opt.axis.y.labels[csv.rows.length-i-1.5] = {'label':'','grid':true};
				this.opt.axis.y.labels[csv.rows.length-i-1] = {'label':(""+(csv.rows[i][this.opt.category]||"")).replace(/\\n/g,"\n"),'tickSize':0,'grid':false,'data':{'category':csv.rows[i][this.opt.category]},'font-weight':'bold'};
				this.opt.axis.y.labels[csv.rows.length-i-0.5] = {'label':'','grid':true};
			}
			return this;
		},
		'updatePadding': function(){
			var i,l,pad,len,ax,lines,align,titlesize,extent,lbl,tick;
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