import { mergeDeep } from './util.js';
import { textLength, getFontFamily, getFontWeight } from '../../../lib/font/fonts.ts';
import { Chart } from './chart.js';
import { Series } from './series.js';

const basefs = 17;
const fontFamily = getFontFamily();
const fontWeight = getFontWeight();

// ORIGINAL FUNCTION BELOW
export function StackedBarChart(config,csv){

	var opt = {
		'type': 'stacked-bar-chart',
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
		'axis':{'x':{'padding':10,'grid':{'show':true,'stroke':'#B2B2B2'},'labels':{}},'y':{'padding':10,'labels':{}}},
		'duration': '0.3s',
		'buildSeries': function(){
			// Series
			var data,datum,label,i,s,categoryoffset,seriesoffset,x,xo;
			data = new Array(this.opt.series.length);

			// First update the properties for each series
			for(s = 0; s < this.opt.series.length; s++){
				data[s] = [];
				mergeDeep(this.opt.series[s],{
					'line':{'show':false,'color':(this.opt.series[s].colour||colours[this.opt.series[s].title]||null)},
					'points':{'show':false,'size':4, 'color': (this.opt.series[s].colour||colours[this.opt.series[s].title]||null)},
					'bars':{'show':true,'color':(this.opt.series[s].colour||colours[this.opt.series[s].title]||null)},
					'errorbars':{'stroke':(this.opt.series[s].colour||colours[this.opt.series[s].title]||null),'stroke-width':2}
				});
				// Duplicate errors if only one error value given
				if(this.opt.series[s].errors && this.opt.series[s].errors.length==1) this.opt.series[s].errors.push(this.opt.series[s].errors[0]);
			}

			// Loop over the rows of data
			for(i = 0; i < csv.rows.length; i++){

				// Used to define the number-based y position
				categoryoffset = csv.rows.length-i-1;

				// Set the origin for the x-value
				xo = 0;

				// Loop over each series
				for(s = 0; s < this.opt.series.length; s++){
					label = this.opt.series[s].title+"\n";
					label += (""+(csv.columns[this.opt.category][i]||"")).replace(/\\n/g,"")+': ';
					label += (isNaN(csv.columns[this.opt.series[s].value][i]) ? "?" : (this.opt.percent ? csv.columns[this.opt.series[s].value][i].toFixed(2)+"%" : csv.columns[this.opt.series[s].value][i]));
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
					if(this.opt.series[s].tooltip && csv.columns[this.opt.series[s].tooltip]) label = csv.columns[this.opt.series[s].tooltip][i];
					x = (isNaN(csv.columns[this.opt.series[s].value][i]) ? 0 : csv.columns[this.opt.series[s].value][i]);
					// The final x-value is the current starting value plus the current value
					datum = {'x':(typeof x==="null" ? null : x+xo),'xstart':xo,'y':categoryoffset,'title':label};

					xo += x;
					// Add errors if we have them
					if(this.opt.series[s].errors) datum.error = {'x':[csv.columns[this.opt.series[s].errors[0]][i],csv.columns[this.opt.series[s].errors[1]][i]]};
					datum.data = {'category':csv.columns[this.opt.category][i],'series':this.opt.series[s].title};
					data[s].push(datum);
				}
			}
			// Loop over adding each series to the chart
			for(s = 0; s < this.opt.series.length; s++){
				this.series.push(new Series(s,this.opt.series[s],data[s],{'axis':this.opt.axis,'barsize':(0.8)}));
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
				this.opt.axis.y.labels[csv.rows.length-i-1] = {'label':(""+(csv.rows[i][this.opt.category]||"")).replace(/\\n/g,"\n"),'ticksize':0,'grid':false,'data':{'category':csv.rows[i][this.opt.category]},'font-weight':'bold'};
				this.opt.axis.y.labels[csv.rows.length-i-0.5] = {'label':'','grid':true};
			}
			return this;
		},
		'updatePadding': function(){
			var i,l,pad,len,ax,lines,align;
			// Work out padding
			pad = {'l':0,'t':0,'b':0,'r':0};
			for(ax in this.opt.axis){
				// Work out x-axis padding
				for(l in this.opt.axis[ax].labels){
					len = 0;
					// Split the label by any new line characters
					lines = this.opt.axis[ax].labels[l].label.split(/\n/g);
					if(ax=="x"){
						// Length is based on the 
						len = (this.opt.axis[ax].title && this.opt.axis[ax].title.label!="" ? this.opt['font-size']*1.5 : 0) + (this.opt['font-size']*lines.length) + this.opt.tick + (this.opt.axis[ax].labels[l].offset||this.opt.axis[ax].padding||0);
					}else{
						// Work out the longest line
						for(i = 0; i < lines.length; i++){
							// Roughly calculate the length in pixels
							len = Math.max(len,(this.opt.axis[ax].title && this.opt.axis[ax].title.label!="" ? this.opt['font-size']*1.5 : 0) + textLength(lines[i],this.opt['font-size'],this.opt['font-weight']||fontWeight,fontFamily) + this.opt.tick + this.opt.axis[ax].padding);
						}
					}
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