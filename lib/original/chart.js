import { document } from '/src/_lib/oi/document.ts';
import { textLength } from '/src/_lib/oi/text.js';
import { colours, scales } from '/src/_data/colours.js';

const ns = 'http://www.w3.org/2000/svg';
const basefs = 17;

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

	this.chart = new Chart(opt,csv);
	this.getSVG = function(){ return this.chart.getSVG(); };
	return this;
}

export function BarChart(config,csv){

	var opt = {
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
				mergeDeep(this.opt.series[s],{
					'line':{'show':false,'color':(this.opt.series[s].colour||colours[this.opt.series[s].title]||null)},
					'points':{'show':false,'size':4, 'color': (this.opt.series[s].colour||colours[this.opt.series[s].title]||null)},
					'bars':{'show':true,'color':(this.opt.series[s].colour||colours[this.opt.series[s].title]||null)},
					'errorbars':{'stroke':(this.opt.series[s].colour||colours[this.opt.series[s].title]||null),'stroke-width':2}
				});
				// Duplicate errors if only one error value given
				if(this.opt.series[s].errors && this.opt.series[s].errors.length==1) this.opt.series[s].errors.push(this.opt.series[s].errors[0]);
				data = [];
				for(i = 0; i < csv.rows.length; i++){
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
					if(this.opt.series[s].tooltip && csv.columns[this.opt.series[s].tooltip]) label = csv.columns[this.opt.series[s].tooltip][i];
					datum = {'x':(isNaN(csv.columns[this.opt.series[s].value][i]) ? null : csv.columns[this.opt.series[s].value][i]),'y':categoryoffset+seriesoffset,'title':label};
					// Add errors if we have them
					if(this.opt.series[s].errors) datum.error = {'x':[csv.columns[this.opt.series[s].errors[0]][i],csv.columns[this.opt.series[s].errors[1]][i]]};
					datum.data = {'category':csv.columns[this.opt.category][i],'series':this.opt.series[s].title};
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

	this.chart = new Chart(opt,csv);
	this.getSVG = function(){ return this.chart.getSVG(); };
	return this;
}

export function CategoryChart(config,csv){
	var opt = {
		'type': 'category-chart',
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
				mergeDeep(this.opt.series[s],{
					'line':{'show':false,'color':(this.opt.series[s].colour||colours[this.opt.series[s].title]||null)},
					'points':{'size':4, 'color': (this.opt.series[s].colour||colours[this.opt.series[s].title]||null)},
					'errorbars':{'stroke':(this.opt.series[s].colour||colours[this.opt.series[s].title]||null),'stroke-width':2}
				});
				// Duplicate errors if only one error value given
				if(this.opt.series[s].errors.length==1) this.opt.series[s].errors.push(this.opt.series[s].errors[0]);
				data = [];
				for(i = 0; i < csv.rows.length; i++){
					categoryoffset = csv.rows.length-i-1;
					seriesoffset = ((this.opt.series.length/2)-s-0.5)*(0.8/this.opt.series.length);
					label = this.opt.series[s].title+"\n"+(""+(csv.columns[this.opt.category][i]||"")).replace(/\\n/g,"")+': '+(isNaN(csv.columns[this.opt.series[s].value][i]) ? "?" : csv.columns[this.opt.series[s].value][i]);
					// If the errors have values we add them to the label
					if(!isNaN(csv.columns[this.opt.series[s].errors[0]][i]) && !isNaN(csv.columns[this.opt.series[s].errors[1]][i])){
						if(csv.columns[this.opt.series[s].errors[0]][i]==csv.columns[this.opt.series[s].errors[1]][i]){
							label += (' ± '+(isNaN(csv.columns[this.opt.series[s].errors[0]][i]) ? "0" : csv.columns[this.opt.series[s].errors[0]][i]));
						}else{
							label += ' (+'+(isNaN(csv.columns[this.opt.series[s].errors[1]][i]) ? "0" : csv.columns[this.opt.series[s].errors[1]][i])+', -'+(isNaN(csv.columns[this.opt.series[s].errors[0]][i]) ? "0" : csv.columns[this.opt.series[s].errors[0]][i])+')';
						}
					}
					if(this.opt.series[s].tooltip && csv.columns[this.opt.series[s].tooltip]) label = csv.columns[this.opt.series[s].tooltip][i];
					datum = {'x':(isNaN(csv.columns[this.opt.series[s].value][i]) ? null : csv.columns[this.opt.series[s].value][i]),'y':categoryoffset+seriesoffset,'error':{'x':[csv.columns[this.opt.series[s].errors[0]][i],csv.columns[this.opt.series[s].errors[1]][i]]},'title':label};
					datum.data = {'category':csv.columns[this.opt.category][i],'series':this.opt.series[s].title};
					data.push(datum);
				}
				this.series.push(new Series(s,this.opt.series[s],data));
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

	this.chart = new Chart(opt,csv);
	this.getSVG = function(){ return this.chart.getSVG(); };
	return this;
}

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
		'axis':{'x':{'padding':10,'grid':{'show':true,'stroke':'#B2B2B2'},'labels':{}},'y':{'padding':10,'labels':{}}},
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

function Chart(config,csv){
	if(!config) config = {};
	var lbl,id,svg,i,ax,key,seriesgroup,categoryoffset,seriesoffset;
	lbl = 'categorychart';

	var _obj = this;

	this.opt = {
		'type': 'chart',
		'padding':{'left':0,'top':0,'right':0,'bottom':0},
		'colours':{},
		'left':0,
		'right':0,
		'top':0,
		'bottom':0,
		'tick':5,
		'font-size': 16,
		'font-family':'CenturyGothicStd,"Century Gothic",sans-serif',
		'legend':{
			'show':false,
			'border':{'stroke':'#000000','stroke-width':1,'fill':'none'},
			'text':{'text-anchor':'start','dominant-baseline':'hanging','font-weight':'bold','fill':'#000000','stroke-width':0}
		},
		'axis':{
			'x':{'padding':10,'grid':{'show':true,'stroke':'#B2B2B2'},'labels':{},'getXY':function(x,y){ return _obj.getXY(x,y); },'font-family':'CenturyGothicStd,"Century Gothic",sans-serif'},
			'y':{'padding':10,'labels':{},'getXY':function(x,y){ return _obj.getXY(x,y); },'font-family':'CenturyGothicStd,"Century Gothic",sans-serif'}
		},
		'duration': '0.3s'
	};
	mergeDeep(this.opt,config);

	this.xmin = 0;
	this.xmax = 0;
	this.ymin = 0;
	this.ymax = 0;
	this.w = this.opt.width||800;
	this.h = this.opt.height||500;
	this.series = [];
	this.axes = {};
	id = Math.round(Math.random()*1e8);
	
	var defs,clip,rect;

	this.updatePadding = function(){
		if(typeof this.opt.updatePadding==="function") this.opt.updatePadding.call(this);
		return this;
	};
	this.init = function(){

		var svgopt;

		// Create SVG container
		if(!svg){
			svg = svgEl('svg');
			svgopt = {'xmlns':ns,'version':'1.1','viewBox':'0 0 '+this.w+' '+this.h,'overflow':'visible','style':'max-width:100%;width:100%','preserveAspectRatio':'xMidyMin meet','data-type':this.opt.type};
			if(this.opt.width) svgopt.width = this.opt.width;
			if(this.opt.height) svgopt.height = this.opt.height;
			setAttr(svg,svgopt);
			defs = svgEl('defs');
			add(defs,svg);
			clip = svgEl("clipPath");
			setAttr(clip,{'id':'clip-'+id});
			//add(clip,svg); // Clip to graph area
			rect = svgEl("rect");
			setAttr(rect,{'x':0,'y':0,'width':this.w,'height':this.h});
			add(rect,clip);
			seriesgroup = svgEl('g');
			seriesgroup.classList.add('data');
		}

		if(typeof this.opt.buildAxes==="function"){
			this.opt.buildAxes.call(this);
		}else{
			this.buildAxes();
		}
		this.updatePadding();
		setAttr(rect,{'x':this.opt.left,'y':this.opt.top,'width':this.w-this.opt.left,'height':this.h-this.opt.top});

		this.addAxes();
		
		// Add the id for this chart to the series
		for(var s = 0; s < this.opt.series.length; s++){
			this.opt.series[s].id = id;
			this.opt.series[s].lbl = lbl;
		}
		if(typeof this.opt.buildSeries==="function"){
			this.opt.buildSeries.call(this);
		}else{
			// Series
			var data,datum,label;
			for(s = 0; s < this.opt.series.length; s++){
				mergeDeep(this.opt.series[s],{
					'line':{'show':true,'color': (this.opt.series[s].colour||colours[this.opt.series[s].title]||'')},
					'points':{'size':1, 'color': (this.opt.series[s].colour||colours[this.opt.series[s].title]||'')}
				});
				data = [];
				for(i = 0; i < csv.rows.length; i++){
					if(csv.columns[this.opt.series[s].x][i] >= this.opt.axis.x.min && csv.columns[this.opt.series[s].x][i] <= this.opt.axis.x.max){
						categoryoffset = csv.rows.length-i-1;
						seriesoffset = (this.opt.series.length-s-1.5)*(0.8/this.opt.series.length);
						label = this.opt.series[s].title+"\n"+csv.columns[this.opt.series[s].x][i]+': '+(csv.columns[this.opt.series[s].y][i]||"");
						if(this.opt.series[s].tooltip && csv.columns[this.opt.series[s].tooltip]) label = csv.columns[this.opt.series[s].tooltip][i];
						datum = {'x':csv.columns[this.opt.series[s].x][i],'y':csv.columns[this.opt.series[s].y][i],'title':label};
						datum.data = {'series':this.opt.series[s].title};
						data.push(datum);
					}
				}
				this.series.push(new Series(s,this.opt.series[s],data));
			}
		}

		if(seriesgroup) add(seriesgroup,svg);

		this.addSeries();
		return this;
	};

	this.getXY = function(x,y){
		x = this.opt.left + ((x - this.xmin)/(this.xmax - this.xmin))*(this.w - this.opt.left - this.opt.right);
		y = this.opt.top + (1-(y - this.ymin)/(this.ymax - this.ymin))*(this.h - this.opt.bottom - this.opt.top);
		return {x:x,y:y};
	};
	this.updateRange = function(){
		this.xmin = 1e100;
		this.ymin = 1e100;
		this.xmax = -1e100;
		this.ymax = -1e100;			
		// Calculate graph range
		if(typeof this.axes.x.getProperty('min')==="number") this.xmin = this.axes.x.getProperty('min');
		if(typeof this.axes.x.getProperty('max')==="number") this.xmax = this.axes.x.getProperty('max');
		if(typeof this.axes.y.getProperty('min')==="number") this.ymin = this.axes.y.getProperty('min');
		if(typeof this.axes.y.getProperty('max')==="number") this.ymax = this.axes.y.getProperty('max');
		this.axes.x.updateRange(this.xmin,this.xmax,this.ymin,this.ymax);
		this.axes.y.updateRange(this.xmin,this.xmax,this.ymin,this.ymax);
	};
	this.addAxes = function(){
		this.axes = {x:new Axis("x",this.opt.left,this.w-this.opt.right-this.opt.left),y:new Axis("y",this.opt.bottom,this.h-this.opt.top-this.opt.bottom)};
		this.opt.axis.x.width = this.w;
		this.opt.axis.y.width = this.w;
		this.opt.axis.x.height = this.h;
		this.opt.axis.y.height = this.h;
		for(ax in this.axes) this.axes[ax].setProperties(this.opt.axis[ax]||{}).addTo(svg);
		return this;
	};
	this.buildAxes = function(){
		// Axes
		// Build x-axis labels
		for(i = 0; i < this.opt.axis.x.ticks.length; i++) this.opt.axis.x.labels[this.opt.axis.x.ticks[i].value] = this.opt.axis.x.ticks[i];
		// Build y-axis labels
		if(this.opt.axis.y && this.opt.axis.y.ticks){
			for(i = 0; i < this.opt.axis.y.ticks.length; i++) this.opt.axis.y.labels[this.opt.axis.y.ticks[i].value] = this.opt.axis.y.ticks[i];
		}
		return this;
	};
	this.addSeries = function(){
		// Add getXY function for each series
		for(var s = 0; s < this.series.length; s++){
			this.series[s].setProperties({'getXY':function(x,y){ return _obj.getXY(x,y); },'id':id,'lbl':lbl});
			this.series[s].addTo(seriesgroup);
		}
		return this;
	};

	this.getSVG = function(){
		this.draw();
		return svg.outerHTML;
	};

	this.draw = function(){
		var u,i,fs,pd,hkey,wkey,x,y,s,text,line,circ,p,cl,po,tspan;

		var defaultkeyitem = '<path d="M0 0 L 1 0" class="line" class="" stroke-width="3" stroke-linecap="round"></path><circle cx="0" cy="0" r="5" fill="silver"></circle>';

		this.updateRange();

		// Update axes
		for(ax in this.axes) this.axes[ax].update();

		if(this.opt.legend.show){
			fs = this.opt['font-size']||16;
			pd = this.opt.legend.padding||fs*0.5;
			hkey = (this.opt.legend.label ? 1:0)*fs +(2*pd) + (this.series.length*fs);
			x = 0;
			y = 0;
			if(!key){
				key = {'el':svgEl("g"),'g':[],'border':svgEl("rect")};
				key.el.classList.add('legend');
				setAttr(key.border,{'x':0,'y':this.opt.top,'width':this.w,'height':hkey});
				if(typeof this.opt.legend.border==="object"){
					for(p in this.opt.legend.border) key.border.setAttribute(p,this.opt.legend.border[p]);
				}
				add(key.border,key.el);
				add(key.el,svg);
			}

			wkey = 0;
			for(s = 0; s < this.series.length; s++){
				if(!key.g[s]){
					key.g[s] = svgEl("g");
					key.g[s].setAttribute('data-series',s+1);
					// Update class of line
					cl = ['data-series','data-series-'+(s+1)];
					if(this.series[s].getProperty('class')) cl.concat(this.series[s].getProperty('class').split(/ /));
					addClasses(key.g[s],cl);

					add(key.g[s],key.el);
				}
				tspan = (this.series[s].getProperty('title')||"Series "+(s+1));
				key.g[s].innerHTML = '<text><tspan dx="'+(fs*2)+'" dy="0">'+tspan+'</tspan></text>'+defaultkeyitem;
				setAttr(key.g[s].querySelector('tspan'),this.series[s].getProperty('attr'));
				// If we had a browser we could use getBoundingClientRect().width, but we don't so we'll approximate the length
				wkey = Math.max(wkey,textLength(tspan,fs,this.opt.legend.text['font-weight']||"standard",'Century Gothic'));
			}
			if(typeof this.opt.legend.width==="number") wkey = this.opt.legend.width;
			else wkey += fs*1.5 + pd*2;	// The width is approximately half the font-size plus twice the font size (for the icon) and some padding


			if(!this.opt.legend.position) this.opt.legend.position = 'top right';
			po = this.opt.legend.position.split(/ /);

			x = y = 0;
			for(u = 0; u < po.length; u++){
				if(po[u]=="left") x = this.opt.left+pd;
				else if(po[u]=="right") x = (this.w-this.opt.right-wkey-pd);
				else if(po[u]=="top") y = this.opt.top+pd;
				else if(po[u]=="bottom") y = this.h-this.opt.bottom-pd-hkey;
			}
			//setAttr(key.el,{'transform':'translate('+x+' '+y+')'});
			setAttr(key.border,{'x':x,'width':wkey+pd,'y':y});
			y += pd;
			x += pd;

			for(s = 0; s < this.series.length; s++){
				// Set the transform on the group
				setAttr(key.g[s],{'transform':'translate('+x+' '+y+')'});
				
				text = qs(key.g[s],'text');
				line = qs(key.g[s],'path');
				circ = qs(key.g[s],'circle');
				setAttr(text,{'x': 0,'y':roundTo(fs*0.2, 3),'font-family':this.opt['font-family']||"sans-serif"});
				if(typeof this.opt.legend.text==="object"){
					for(p in this.opt.legend.text) text.setAttribute(p,this.opt.legend.text[p]);
				}
				p = this.series[s].getProperties();
				setAttr(circ,{'cx':roundTo(fs*0.75, 3),'cy':roundTo(0.5*fs, 3),'fill':(p.points.color||""),'stroke-width':p.points['stroke-width']||0,'stroke':p.points.stroke||""});

				if(this.opt.type=="line-chart" || this.opt.type=="category-chart"){
					line.setAttribute('d','M'+0+','+roundTo(fs*0.5, 3)+' l '+(fs*1.5)+' 0');
					if(p.line.color) line.setAttribute('stroke',p.line.color||"");
				}
				
				y += fs;
			}
		}

		// Update series
		for(i = 0; i < this.series.length; i++) this.series[i].update().addTo(seriesgroup);

		return this;
	};
	
	this.init();
	return this;
}
function Axis(ax,from,to,attr){

	var opt,lbl,fs,xmin,xmax,ymin,ymax;
	
	opt = {
		'left': 0,
		'right': 0,
		'top': 0,
		'bottom': 0,
		'font-family': 'CenturyGothicStd,"Century Gothic",sans-serif',
		'font-weight': 'bold',
		'line':{'show':true,stroke:'#000000','stroke-width':1,'stroke-linecap':'round','stroke-dasharray':''},
		'grid':{'show':false,'stroke':'#B2B2B2','stroke-width':1,'stroke-linecap':'round','stroke-dasharray':''},
		title:{},
		ticks:{'show':true},
		labels:{},
		'getXY':function(x,y){ return {x:x,y:y}; }
	};
	mergeDeep(opt,attr);
	lbl = opt.label||'axis';
	this.ticks = {};
	this.line = {};
	this.el = svgEl("g");
	addClasses(this.el,[lbl+'-grid',lbl+'-grid-'+ax]);
	this.title = svgEl("text");
	this.title.classList.add(lbl+'-grid-title');
	add(this.title,this.el);
	fs = opt['font-size']||16;
	opt.padding = 4;
	xmin = ymin = xmax = ymax = 0;
	this.addTo = function(svg){
		add(this.el,svg);
		return this;
	};
	this.updateRange = function(xmn,xmx,ymn,ymx){
		xmin = xmn;
		xmax = xmx;
		ymin = ymn;
		ymax = ymx;
		return this;
	};
	this.setProperties = function(myopt){
		mergeDeep(opt,myopt);
		return this;
	};
	this.getProperty = function(pid){
		if(opt.hasOwnProperty(pid)) return opt[pid];
		else return null;
	};
	this.update = function(){
		var t,x,y,pos,len,align,talign,baseline,xsign,ysign,lines,l,d;
		if(!opt.labels) opt.labels = {};
		this.title.innerHTML = opt.title.label||"";
		x = (ax=="x" ? (opt.left + (opt.width-opt.right-opt.left)/2) : fs);
		y = (ax=="y" ? (opt.top + (opt.height-opt.top-opt.bottom)/2):(opt.height-fs/2));
		setAttr(this.title,{'x':x,'y':y,'dx':0,'text-anchor':'middle','transform':(ax=="y"?'rotate(-90,'+x+','+y+')':''),'font-family':opt['font-family']||'sans-serif','font-weight':opt['font-weight']});
		this.el.removeAttribute('style');
		// Check if we need to add a line
		if(!this.line.el){
			this.line.el = svgEl("path");
			this.line.el.classList.add('line');
			this.line.el.setAttribute('vector-effect','non-scaling-stroke');
			// Add it to the element
			add(this.line.el,this.el);
			// Create an animation for the line
			this.line.animate = new Animate(this.line.el,{'duration':opt.duration});
		}
		pos = [{x:(opt.left-0.5),y:(opt.height-opt.bottom-0.5)},{x:(ax=="x" ? (opt.width-opt.right) : (opt.left-0.5)),y:(ax=="x" ? (opt.height-opt.bottom-0.5) : (opt.top-0.5))}];
		this.line.animate.set({'d':{'from':'','to':pos}});
		setAttr(this.line.el,{'d':pos,'style':(opt.line.show ? 'display:block':'display:none'),'stroke':opt.line.stroke,'stroke-width':opt.line['stroke-width'],'stroke-dasharray':opt.line['stroke-dasharray']});
		// Loop over existing ticks removing any that no longer exist
		for(t in this.ticks){
			if(t && !opt.ticks.show){
				if(this.ticks[t].line) this.ticks[t].line.parentNode.removeChild(this.ticks[t].line);
				if(this.ticks[t].text) this.ticks[t].text.parentNode.removeChild(this.ticks[t].text);
				delete this.ticks[t];
			}
		}
		// Go through axis label values in order
		var keys = Object.keys(opt.labels);
		var pd,a,b,tspan;
		for(t of keys.sort()){
			// Check if this tick exists
			if(typeof t!=="undefined"){

				if(typeof opt.labels[t]==="undefined") opt.labels[t] = {'label':''};
				if(!opt.labels[t]['font-weight']) opt.labels[t]['font-weight'] = "bold";
				align = opt.labels[t].align||(ax=="x" ? "bottom" : "left");
				talign = opt.labels[t]['text-anchor']||(ax=="y" ? (align=="left" ? "end":"start") : "middle");
				baseline = (ax=="x" ? ((align=="bottom") ? "hanging" : "text-bottom") : "middle");
				if(opt['dominant-baseline']) baseline = opt['dominant-baseline'];
				len = (typeof opt.labels[t].ticksize==="number" ? opt.labels[t].ticksize:5);
				pd = (typeof opt.labels[t].offset==="number" ? opt.labels[t].offset : opt.padding);
				x = (ax=="x" ? parseFloat(t) : (align=="left" ? xmin:xmax));
				y = (ax=="x" ? (align=="bottom" ? ymin:ymax) : parseFloat(t));
				xsign = (opt.labels[t].align=="right" ? 1:-1);
				ysign = (opt.labels[t].align=="top" ? -1:1);

				if(ax=="x"){
					a = opt.getXY(parseFloat(t),(opt.grid.show||opt.labels[t].grid ? (align=="bottom" ? ymax:ymin) : (align=="bottom" ? ymin:ymax)));
					b = opt.getXY(parseFloat(t),(align=="bottom" ? ymin:ymax));
				}else{
					a = opt.getXY((opt.grid.show||opt.labels[t].grid ? (align=="left" ? xmax:xmin) : (align=="left" ? xmin:xmax)),parseFloat(t));
					b = opt.getXY((align=="left" ? xmin:xmax),parseFloat(t));
				}

				if((ax=="x" && (x<xmin || x>xmax)) || (ax=="y" && (y<ymin || y>ymax))){
					if(this.ticks[t]){
						if(this.ticks[t].g) this.ticks[t].g.setAttribute('style','display:none');
					}
				}else{
					if(!this.ticks[t]){
						this.ticks[t] = {'g':{'el':svgEl('g')},'text':{'el':svgEl('text')}};
						this.ticks[t].g.el.setAttribute('data',t);
						// Loop over this label's data attributes
						for(d in opt.labels[t].data){
							this.ticks[t].g.el.setAttribute('data-'+d,opt.labels[t].data[d]);
						}
						this.ticks[t].g.animate = new Animate(this.ticks[t].g.el,{duration:opt.duration});
						add(this.ticks[t].g.el,this.el);
						if(len>0){
							this.ticks[t].line = {'el':svgEl('line')};
							add(this.ticks[t].line.el,this.ticks[t].g.el);
						}
						this.ticks[t].text.el.setAttribute('text-anchor',(opt['text-anchor'] || talign));
						add(this.ticks[t].text.el,this.ticks[t].g.el);
					}else{
						if(this.ticks[t].line) this.ticks[t].line.el.removeAttribute('style');
						this.ticks[t].text.el.removeAttribute('style');
					}
					
					// Split the label by any new line characters and add each as a tspan
					lines = opt.labels[t].label.split(/\n/g);
					for(l = 0; l < lines.length; l++){
						tspan = svgEl('tspan');
						tspan.innerHTML = lines[l];
						setAttr(tspan,{'font-family':opt['font-family']||'sans-serif'});
						if(ax=="x") setAttr(tspan,{'dy':fs*l,'x':0,'y':ysign*(len+pd)});
						if(ax=="y") setAttr(tspan,{'y':fs*((l-(lines.length-1)/2)),'x':xsign*(len+pd)});
						add(tspan,this.ticks[t].text.el);
					}

					// Set some text properties
					setAttr(this.ticks[t].text.el,{'stroke':opt.labels[t].stroke||"#000000",'stroke-width':opt.labels[t]['stroke-width']||0,'fill':opt.labels[t].fill||"#000000",'dominant-baseline':baseline,'font-weight':opt.labels[t]['font-weight']||""});

					if(this.ticks[t].line){
						// Set the position/size of the line
						if(ax=="x") setAttr(this.ticks[t].line.el,{'x1':0,'x2':0,'y1':roundTo(-xsign*len,3),'y2':roundTo(-(b.y-a.y), 3)});
						else if(ax=="y") setAttr(this.ticks[t].line.el,{'x1':roundTo(-ysign*len, 3),'x2':roundTo(a.x-b.x, 3),'y1':0,'y2':0});
						// Set generic properties for the line
						setAttr(this.ticks[t].line.el,{'stroke':(opt.labels[t]['stroke']||opt.grid.stroke),'stroke-width':(opt.labels[t]['stroke-width']||opt.grid['stroke-width']||1),'stroke-dasharray':(opt.labels[t]['stroke-dasharray']||opt.grid['stroke-dasharray']||'')});
					}
					this.ticks[t].g.animate.set({'transform':{'to':'translate('+b.x+','+b.y+')'}});
				}
			}
		}
		add(this.line.el,this.el); // simulate z-index
	};
	return this;
}
function Series(s,props,data,extra){
	if(!props) return this;

	var id = props.id||Math.round(Math.random()*1e8);

	var opt,line,path,pts,o,label;
	var defaultcolor = '#000000';
	if(s==0) defaultcolor = "#E55912";
	else if(s==1) defaultcolor = "#005776";
	else if(s==2) defaultcolor = "#F7AB3D";
	else if(s==3) defaultcolor = "#4A783C";
	opt = {
		'points':{show:true,color:defaultcolor,'stroke-linecap':'round','stroke':defaultcolor,'stroke-width':0,'fill-opacity':1},
		'line':{show:true,color:defaultcolor,'stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':'','fill':'none'},
		'bars':{show:false,color:defaultcolor,'stroke-width':0},
		'opt':props.opt||{}
	};
	line = {};
	path = "";
	pts = [];
	label = "";

	// Add the output to the SVG
	this.addTo = function(el){
		add(this.el,el);
		return this;
	};

	// Build group
	this.el = svgEl("g");
	o = {'clip-path':'url(#clip-'+id+')'};
	o['data-series'] = (s+1);
	setAttr(this.el,o);
	addClasses(this.el,['series','series-'+(s+1)]);

	this.getStyle = function(t,p){
		if(opt.hasOwnProperty(t)){
			if(opt[t].hasOwnProperty(p)) return opt[t][p];
		}
		return null;
	};
	this.getProperty = function(pid){
		if(opt.hasOwnProperty(pid)) return opt[pid];
		else return null;
	};
	this.getProperties = function(){ return opt; };
	this.setProperties = function(a){
		if(!a) a = {};
		mergeDeep(opt, a);
		if(!opt.points.color) opt.points.color = defaultcolor;
		if(!opt.points.stroke) opt.points.stroke = defaultcolor;
		if(!opt.line.color) opt.line.color = defaultcolor;
		if(opt.class){
			var c = opt.class.split(/ /);
			addClasses(this.el,c);
		}
		return this;
	};

	this.update = function(){
		var i,pt,txt,p,r,ps,o,ax,a,b,datum,d,old,p1,p2;
		// Check if we need to add a line
		if(!line.el){
			line.el = svgEl("path");
			line.el.classList.add('line');
			setAttr(line.el,{'d':'M0 0 L 100,100'});
			add(line.el,this.el); // Add it to the element
			// Create an animation for the line
			line.animate = new Animate(line.el,{'duration':opt.duration});
		}
		setAttr(line.el,{'style':(opt.line.show ? 'display:block':'display:none'),'stroke':opt.line.color,'stroke-width':this.getStyle('line','stroke-width'),'stroke-linecap':this.getStyle('line','stroke-linecap'),'stroke-linejoin':this.getStyle('line','stroke-linejoin'),'stroke-dasharray':this.getStyle('line','stroke-dasharray'),'fill':this.getStyle('line','fill'),'vector-effect':'non-scaling-stroke'});

		for(i = pts.length; i < data.length; i++){

			data[i].good = (typeof data[i].x==="number");
			if(!data[i].good) data[i].x = 0;

			datum = {'data-i':i};
			// Add any data attributes
			for(d in data[i].data) datum['data-'+d] = data[i].data[d];

			pts[i] = {'title':svgEl("title"),'old':{}};

			if(!data[i].label) data[i].label = "Point "+(i+1);
			txt = (data[i].title || data[i].label+": "+data[i].y.toFixed(2));
			if(pts[i].title) pts[i].title.innerHTML = txt;

			// Do we show a bar?
			if(opt.bars.show){

				// Make a <rect>
				pts[i].bar = svgEl("rect");

				setAttr(pts[i].bar,datum);

				// Update the bar with some default values
				setAttr(pts[i].bar,{'data-series':(s+1),'tabindex':0,'x':0,'y':0,'width':0,'height':0});


				// Add the bar to the element
				add(pts[i].bar,this.el);

				// Add the text label to the bar
				add(pts[i].title,pts[i].bar);

			}

			// Do we show error bars?
			if(data[i].error){
				pts[i].errorbar = {};
				for(ax in data[i].error){
					pts[i].errorbar[ax] = svgEl("line");
					add(pts[i].errorbar[ax],this.el);
				}
			}

			// Do we show the points
			if(opt.points.show){
				pts[i].point = svgEl('circle');

				setAttr(pts[i].point,datum);

				// Update the point
				o = {'cx':0,'cy':0,'tabindex':0};
				o['data-series'] = s+1;
				setAttr(pts[i].point,o);

				add(pts[i].point,this.el);

				// Add animation to point
				pts[i].anim_point = new Animate(pts[i].point,{'duration':opt.duration});

				add(pts[i].title,pts[i].point);
			}

		}
		if(opt.line.label){
			label = svgEl("text");
			label.innerHTML = opt.title;
			var nprops = opt.getXY(data[pts.length-1].x,data[pts.length-1].y);
			nprops['dominant-baseline'] = "middle";
			nprops.fill = opt.line.color;
			if(opt.line.label.padding) nprops.x += opt.line.label.padding;
			setAttr(label,nprops);
			add(label,this.el);
		}

		// Update points/bars
		p = [];
		old = {};

		for(i = 0; i < pts.length; i++){
			r = (opt['stroke-width']||1)/2;

			if(opt.points){
				if(typeof opt.points.size==="number") r = Math.max(opt.points.size,r);
				if(typeof opt.points.size==="function") r = opt.points.size.call(pt,{'series':s,'i':i,'data':data[i]});
			}

			// Set some initial values for the point
			if(pts[i].point) setAttr(pts[i].point,{'r':r,'fill':opt.points.color,'fill-opacity':opt.points['fill-opacity'],'stroke':opt.points.stroke,'stroke-width':opt.points['stroke-width']});
			// Set some initial values for the bar
			if(pts[i].bar) setAttr(pts[i].bar,{'r':r,'fill':opt.points.color,'fill-opacity':opt.points['fill-opacity'],'stroke':opt.points.stroke,'stroke-width':opt.points['stroke-width']});
			
			ps = opt.getXY(data[i].x,data[i].y);
			p.push(ps);

			// Style error bars
			if(pts[i].errorbar && data[i].error){
				// Update error bars
				for(ax in data[i].error){
					a = opt.getXY(data[i].x-data[i].error[ax][0],data[i].y);
					b = opt.getXY(data[i].x+data[i].error[ax][1],data[i].y);
					// If the x-values are numbers we update the attributes
					if(!isNaN(a.x) && !isNaN(b.x)){
						setAttr(pts[i].errorbar[ax],{'x1':roundTo(a.x, 3),'y1':roundTo(a.y, 3),'x2':roundTo(b.x, 3),'y2':roundTo(b.y, 3),'stroke':opt.errorbars.stroke||opt.points.color,'stroke-width':opt.errorbars['stroke-width']||1,'class':'errorbar'});
					}
				}
			}

			// Keep a copy 
			if(typeof pts[i].old.x==="number" && typeof pts[i].old.y==="number"){
				old = clone(pts[i].old);
			}else{
				if(typeof old.x==="number" && typeof old.y==="number") pts[i].old = old;
			}

			// Update point position
			if(pts[i].anim_point) pts[i].anim_point.set({'cx':{'from':pts[i].old.x||null,'to':ps.x},'cy':{'from':pts[i].old.y||null,'to':ps.y}});
			
			if(!data[i].good) setAttr(pts[i].point,{'visibility':'hidden'});

			// Update bar position
			if(pts[i].bar){
				p1 = opt.getXY(Math.max(data[i].xstart||0,extra.axis.x.min),data[i].y + extra.barsize/2);
				p2 = opt.getXY(data[i].x,data[i].y - extra.barsize/2);
				setAttr(pts[i].bar,{'x':p1.x,'y':p1.y,'width':Math.abs(p2.x-p1.x),'height':Math.abs(p2.y-p1.y)});
			}

			// Store the calculated points
			pts[i].old = ps;
		}

		// Update animation
		line.animate.set({'d':{'from':path,'to':p}});

		// Store a copy of the current path
		path = clone(p);

		return this;
	};

	this.setProperties(props);

	return this;
}

function Animate(e,attr){
	var tag,as,opt;
	opt = {'duration':'0.3s'};
	tag = e.tagName.toLowerCase();
	if(!attr) attr = {};
	mergeDeep(opt,attr);
	as = {};
	// Find duration
	if(opt.duration) this.duration = opt.duration;
	if(!this.duration) this.duration = "0.3s";
	this.duration = parseFloat(this.duration);
	this.set = function(props){
		var n,i,a2,b2,a,b;
		e.querySelectorAll('animate').forEach(function(ev){ ev.parentNode.removeChild(ev); });
		for(n in props){
			if(n){
				a = props[n].from||"";
				b = props[n].to;
				if(!a && as[n]) a = as[n].value;
				a2 = null;
				b2 = null;
				if(tag=="path"){
					a2 = "";
					b2 = "";
					for(i = 0; i < a.length; i++) a2 += (i>0 ? 'L':'M')+roundTo(a[i].x, 2)+','+roundTo(a[i].y, 2);
					for(i = 0; i < b.length; i++) b2 += (i>0 ? 'L':'M')+roundTo(b[i].x, 2)+','+roundTo(b[i].y, 2);
					if(a.length > 0 && a.length < b.length){
						for(i = 0; i < b.length-a.length; i++) a2 += 'L'+roundTo(a[a.length-1].x, 2)+','+roundTo(a[a.length-1].y, 2);
					}
					if(b.length > 0 && b.length < a.length){
						for(i = 0; i < a.length-b.length; i++) b2 += 'L'+roundTo(b[b.length-1].x, 2)+','+roundTo(b[b.length-1].y, 2);
					}
					if(!a2) a2 = null;
				}else{
					if(a) a2 = clone(a);
					b2 = clone(b);
				}
				if(this.duration && a2!==null){
					// Create a new animation
					if(!as[n]) as[n] = {};
					as[n].el = svgEl("animate");
					setAttr(as[n].el,{"attributeName":n,"dur":(this.duration||0),"repeatCount":"1"});
					add(as[n].el,e);
				}
				// Set the final value
				e.setAttribute(n,b2);
				if(this.duration && a2!==null){
					setAttr(as[n].el,{"from":a2,"to":b2,"values":a2+';'+b2}); 
					as[n].el.beginElement();
					as[n].value = b;
				}
			}
		}
		return this;
	};
	return this;
}
// Recursively merge properties of two objects 
function mergeDeep(obj1, obj2){
	for(var p in obj2){
		try{
			if(obj2[p].constructor==Object) obj1[p] = mergeDeep(obj1[p], obj2[p]);
			else obj1[p] = obj2[p];
		}catch(e){ obj1[p] = obj2[p]; }
	}
	return obj1;
}
function qs(el,t){ return el.querySelector(t); }
function add(el,to){ return to.appendChild(el); }
function clone(a){ return JSON.parse(JSON.stringify(a)); }
function svgEl(t){ return document.createElement(t);/*return document.createElementNS(ns,t);*/ }
function setAttr(el,prop){
	for(var p in prop) el.setAttribute(p,prop[p]);
	return el;
}
function addClasses(el,cl){
	for(var i = 0; i < cl.length; i++) el.classList.add(cl[i]);
	return el;
}
function roundTo(x,n){
	var f = Math.pow(10,n);
	var str = (Math.round(x*f)/f).toFixed(n);
	return (str ? str.replace(/(\.\d*?[1-9])0+$/g, "$1").replace(/\.0+$/,"") : "");
}
