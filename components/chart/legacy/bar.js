import { Chart } from './chart.js';
import { Series } from './series.js';
import { textLength } from './text.js';
import { getSeriesDetails } from '../helpers.ts';
import { mergeDeep } from './util.js';

const basefs = 17;

// Simple wrapper
export function render(config) {
  const chart = new BarChart(config);
  return chart.getSVG();
}

// Expect config to provide data
function BarChart(config){
	const opt = {
		'type': 'bar-chart',
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
      var data,datum,label,i,s,categoryoffset,seriesoffset;
			for(s = 0; s < this.opt.series.length; s++){
        // Remove default colours for series name from here
				mergeDeep(this.opt.series[s],{
					'line':{'show':false,'color':(this.opt.series[s].colour||null)},
					'points':{'show':false,'size':4, 'color': (this.opt.series[s].colour||null)},
					'bars':{'show':true,'color':(this.opt.series[s].colour||null)},
					'errorbars':{'stroke':(this.opt.series[s].colour||null),'stroke-width':2}
				});
				// Duplicate errors if only one error value given
				if(this.opt.series[s].errors && this.opt.series[s].errors.length==1) this.opt.series[s].errors.push(this.opt.series[s].errors[0]);
				data = [];
        // csv no long available to us, use getSeriesDetails helper
        const seriesInfo = getSeriesDetails(this.opt.series[s], this.opt)
        // Iterare over opt.data instead of csv.rows
				for(i = 0; i < this.opt.data.length; i++){
					categoryoffset = this.opt.data.length-i-1;
					seriesoffset = ((this.opt.series.length/2)-s-0.5)*(0.8/this.opt.series.length);
					label = this.opt.series[s].title+"\n"+(""+(seriesInfo.category[i]||"")).replace(/\\n/g,"")+': '+(isNaN(seriesInfo.value[i]) ? "?" : seriesInfo.value[i]);
					// If the errors have values we add them to the label
          // TODO(@giles) reintroduce error bars
					// if(this.opt.series[s].errors){
					// 	if(!isNaN(csv.columns[this.opt.series[s].errors[0]][i]) && !isNaN(csv.columns[this.opt.series[s].errors[1]][i])){
					// 		if(csv.columns[this.opt.series[s].errors[0]][i]==csv.columns[this.opt.series[s].errors[1]][i]){
					// 			label += (' ± '+(isNaN(csv.columns[this.opt.series[s].errors[0]][i]) ? "0" : csv.columns[this.opt.series[s].errors[0]][i]));
					// 		}else{
					// 			label += ' (+'+(isNaN(csv.columns[this.opt.series[s].errors[1]][i]) ? "0" : csv.columns[this.opt.series[s].errors[1]][i])+', -'+(isNaN(csv.columns[this.opt.series[s].errors[0]][i]) ? "0" : csv.columns[this.opt.series[s].errors[0]][i])+')';
					// 		}
					// 	}
					// }
          // Add tooltip
          // TODO(@giles) reintroduce tooltip
					// if(this.opt.series[s].tooltip && csv.columns[this.opt.series[s].tooltip]) label = csv.columns[this.opt.series[s].tooltip][i];
					const datum = {'x':(isNaN(seriesInfo.value[i]) ? null : seriesInfo.value[i]),'y':categoryoffset+seriesoffset,'title':label};
					// Add errors if we have them
          // TODO(@giles) reintroduce error bars, again
					// if(this.opt.series[s].errors) datum.error = {'x':[csv.columns[this.opt.series[s].errors[0]][i],csv.columns[this.opt.series[s].errors[1]][i]]};
					datum.data = {'category':seriesInfo.category[i],'series':this.opt.series[s].title};
					data.push(datum);
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
			this.opt.axis.y.max = this.opt.data.length-0.5;
			// Build y-axis labels
			for(i = 0 ; i < this.opt.data.length; i++){
				this.opt.axis.y.labels[this.opt.data.length-i-1.5] = {'label':'','grid':true};
				this.opt.axis.y.labels[this.opt.data.length-i-1] = {'label':(""+(this.opt.data[i][this.opt.category]||"")).replace(/\\n/g,"\n"),'ticksize':0,'grid':false,'data':{'category':this.opt.data[i][this.opt.category]},'font-weight':'bold'};
				this.opt.axis.y.labels[this.opt.data.length-i-0.5] = {'label':'','grid':true};
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
							len = Math.max(len,(this.opt.axis[ax].title && this.opt.axis[ax].title.label!="" ? this.opt['font-size']*1.5 : 0) + textLength(lines[i],this.opt['font-size'],this.opt['font-weight'],'Century Gothic') + this.opt.tick + this.opt.axis[ax].padding);
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

	this.chart = new Chart(opt);
	this.getSVG = function(){ return this.chart.getSVG(); };
	return this;
}