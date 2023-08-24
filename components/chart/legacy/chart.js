import { mergeDeep } from '../../../lib/util/merge-deep.ts';
import { Colours } from '../../../lib/colour/colours.ts';
import { Axis } from './axis.js';
import { Series } from './series.js';
import { KeyItem } from './keyitem.js';
import { add, svgEl, setAttr, addClasses, roundTo } from './util.js';
import { textLength, getFontFamily, getFontWeight, getFontSize } from '../../../lib/font/fonts.ts';

const ns = 'http://www.w3.org/2000/svg';

export function Chart(config,csv){

	var colours = {};
	if(!config) config = {};
	var lbl,id,svg,i,ax,key,seriesgroup,categoryoffset,seriesoffset;
	lbl = 'categorychart';
	var fontFamily = getFontFamily();
	var fontWeight = getFontWeight();
	var fontSize = getFontSize();
	// Define some colours
	const namedColours = Colours(config.colours);

	var _obj = this;

	this.opt = {
		'type': 'chart',
		'padding':{'left':0,'top':0,'right':0,'bottom':0},
		'colours':{},
		'left':0,
		'right':0,
		'top':0,
		'bottom':0,
		'font-size': fontSize,
		'font-family': fontFamily,
		'legend':{
			'show':false,
			'border':{'stroke':'#000000','stroke-width':1,'fill':'none'},
			'text':{'text-anchor':'start','dominant-baseline':'hanging','font-weight':'bold','fill':'#000000','stroke-width':0}
		},
		'axis':{
			'x':{'padding':10,'grid':{'show':true,'stroke':'#B2B2B2'},'labels':{},'getXY':function(x,y){ return _obj.getXY(x,y); },'font-family':fontFamily,'font-weight':fontWeight,'font-size':fontSize},
			'y':{'padding':10,'labels':{},'getXY':function(x,y){ return _obj.getXY(x,y); },'font-family':fontFamily,'font-weight':fontWeight}
		},
		'duration': '0.3s'
	};
	mergeDeep(this.opt,config);

	this.xmin = 0;
	this.xmax = 0;
	this.ymin = 0;
	this.ymax = 0;
	this.w = this.opt.width||1080;
	this.h = this.opt.height||810;
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
			svgopt = {'xmlns':ns,'version':'1.1','class':'oi-chart-main','viewBox':'0 0 '+this.w+' '+this.h,'overflow':'visible','style':'max-width:100%;width:100%','preserveAspectRatio':'xMidYMin meet','data-type':this.opt.type};
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
			seriesgroup.classList.add('data-layer');
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
			if(this.opt.series[s].colour) this.opt.series[s].colour = namedColours.get(this.opt.series[s].colour);
		}

		// Use a custom function to build the data series
		if(typeof this.opt.buildSeries==="function") this.opt.buildSeries.call(this);
		else this.buildSeries();

		if(seriesgroup) add(seriesgroup,svg);

		this.addSeries();
		return this;
	};
	// Build the data series. For each series, it creates a data structure of the format:
	// [{x:,y:,title:},{x:,y:,title:}]
	this.buildSeries = function(){
		let s,i,labx,laby,x,y,label,datum,data;
		// Build the series
		for(s = 0; s < this.opt.series.length; s++){
			mergeDeep(this.opt.series[s],{
				'line':{'show':true,'color': namedColours.get(this.opt.series[s].colour||this.opt.series[s].title)},
				'points':{'size':(this.opt.series[s].points && typeof this.opt.series[s].points.size==="number" ? this.opt.series[s].points.size : 1), 'color': namedColours.get(this.opt.series[s].colour||this.opt.series[s].title)}
			});
			data = [];
			if(typeof this.opt.series[s].x==="undefined" || typeof this.opt.series[s].y==="undefined"){
				console.log(this.opt.series[s]);
				throw new TypeError('Missing x/y values for series '+s);
			}
			for(i = 0; i < csv.rows.length; i++){
				labx = x = csv.columns[this.opt.series[s].x][i];
				laby = y = csv.columns[this.opt.series[s].y][i];
				// Convert to dates
				if(typeof x==="string" && x.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)){
					x = parseInt(x.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2})/,function(m,p1){ return (new Date(p1)).getTime(); }));
				}
				if(typeof y==="string" && y.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)){
					y = parseInt(y.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2})/,function(m,p1){ return (new Date(p1)).getTime(); }));
				}
				if(typeof x==="string") x = i;
				if(typeof y==="string") y = i;
				if(x >= this.opt.axis.x.min && x <= this.opt.axis.x.max){
					label = this.opt.series[s].title+"\n"+labx+': '+(laby);
					if(this.opt.series[s].tooltip && csv.columns[this.opt.series[s].tooltip]) label = csv.columns[this.opt.series[s].tooltip][i];
					datum = {'x':x,'y':y,'title':label};
					datum.data = {'series':this.opt.series[s].title};
					data.push(datum);
				}
			}
			this.series.push(new Series(s,this.opt.series[s],data));
		}
		return this;
	}
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
		var u,i,fs,pd,hkey,wkey,x,y,s,text,line,mark,p,cl,po,tspan,w,lbl;

		this.updateRange();

		// Update axes
		for(ax in this.axes) this.axes[ax].update();

		// Create a legend for the chart
		if(this.opt.legend.show){

			if(!config.legend.items){
				config.legend.items = new Array(this.series.length);
			}

			// Create the legend items
			for(s = 0; s < this.series.length; s++){
				let keyitem = new KeyItem({
					'type':this.opt.type,
					'series':this.series[s],
					's':s,
					'fontSize': fontSize,
					'itemWidth': (this.opt.type == "scatter-chart" ? 1 : 2),
					'points':this.opt.series[s].points||{},
					'line':this.opt.series[s].line||{}
				});
				if(!config.legend.items[s]){
					config.legend.items[s] = {};
				}
				config.legend.items[s].colour = namedColours.get(keyitem.colour);
				config.legend.items[s].label = keyitem.label;

				if(this.opt.type == "scatter-chart" || this.opt.type == "line-chart"){
					config.legend.items[s].icon = keyitem.getSVG();
				}
			}
		}

		// Update series
		for(i = 0; i < this.series.length; i++) this.series[i].update().addTo(seriesgroup);

		return this;
	};
	
	this.init();
	return this;
}
