import { mergeDeep } from '../../../lib/util/merge-deep.ts';
import { replaceNamedColours } from '../../../lib/colour/parse-colour-string.ts';
import { Axis } from './axis.js';
import { Series } from './series.js';
import { Marker } from './marker.js';
import { add, svgEl, setAttr, addClasses, roundTo } from './util.js';
import { textLength } from './text.js';

const ns = 'http://www.w3.org/2000/svg';

export function Chart(config,csv){

	var colours = {};
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
		'font-size': 16,
		'font-family':'Poppins,sans-serif',
		'legend':{
			'show':false,
			'border':{'stroke':'#000000','stroke-width':1,'fill':'none'},
			'text':{'text-anchor':'start','dominant-baseline':'hanging','font-weight':'bold','fill':'#000000','stroke-width':0}
		},
		'axis':{
			'x':{'padding':10,'grid':{'show':true,'stroke':'#B2B2B2'},'labels':{},'getXY':function(x,y){ return _obj.getXY(x,y); },'font-family':'Poppins,CenturyGothicStd,"Century Gothic",sans-serif','font-weight':'normal'},
			'y':{'padding':10,'labels':{},'getXY':function(x,y){ return _obj.getXY(x,y); },'font-family':'Poppins,CenturyGothicStd,"Century Gothic",sans-serif','font-weight':'normal'}
		},
		'duration': '0.3s'
	};
	mergeDeep(this.opt,config);

	this.xmin = 0;
	this.xmax = 0;
	this.ymin = 0;
	this.ymax = 0;
	this.w = this.opt.width||1048;
	this.h = this.opt.height||786;
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
			svgopt = {'xmlns':ns,'version':'1.1','viewBox':'0 0 '+this.w+' '+this.h,'overflow':'visible','style':'max-width:100%;width:100%','preserveAspectRatio':'xMidYMin meet','data-type':this.opt.type};
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
			if(this.opt.series[s].colour) this.opt.series[s].colour = replaceNamedColours(this.opt.series[s].colour);
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
				'line':{'show':true,'color': (this.opt.series[s].colour||colours[this.opt.series[s].title]||'')},
				'points':{'size':(this.opt.series[s].points && typeof this.opt.series[s].points.size==="number" ? this.opt.series[s].points.size : 1), 'color': (this.opt.series[s].colour||colours[this.opt.series[s].title]||'')}
			});
			data = [];
			for(i = 0; i < csv.rows.length; i++){
				labx = x = csv.columns[this.opt.series[s].x][i];
				laby = y = csv.columns[this.opt.series[s].y][i];
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
			if(!this.legend){
				this.legend = new Legend(this,svg);
			}else{
				this.legend.update();
			}
		}

		// Update series
		for(i = 0; i < this.series.length; i++) this.series[i].update().addTo(seriesgroup);

		return this;
	};
	
	this.init();
	return this;
}

function Legend(chart,svg){
	let key,fs,pd,hkey,wkey,x,y,s,text,line,mark,p,cl,po,tspan,u;

	fs = chart.opt['font-size']||16;
	pd = chart.opt.legend.padding||(fs*0.5);
	hkey = (chart.opt.legend.label ? 1:0)*fs +(2*pd) + (chart.series.length*fs);
	x = 0;
	y = 0;

	if(!chart.legend){
		key = {'el':svgEl("g"),'g':[],'items':[],'border':svgEl("rect")};
		key.el.classList.add('legend');
		setAttr(key.border,{'x':0,'y':chart.opt.top,'width':chart.w,'height':hkey});
		if(typeof chart.opt.legend.border==="object"){
			for(p in chart.opt.legend.border) key.border.setAttribute(p,chart.opt.legend.border[p]);
		}
		add(key.border,key.el);
		add(key.el,svg);
	}

	this.update = function(){
		wkey = 0;
		for(s = 0; s < chart.series.length; s++){
			if(!key.items[s]){
				key.items[s] = new KeyItem({
					'type':chart.opt.type,
					'legend':key.el,
					'series':chart.series[s],
					's':s,
					'points':chart.opt.series[s].points||{},
					'fontSize': fs 
				});
			}

			// If we had a browser we could use getBoundingClientRect().width, but we don't so we'll approximate the length
			wkey = Math.max(wkey,key.items[s].getTextLength(chart.opt.legend.text['font-weight']||"standard",chart.opt.legend.text['font-family']||chart.opt['font-family']||"Poppins"));
		}

		if(typeof chart.opt.legend.width==="number") wkey = chart.opt.legend.width;
		else wkey += fs*2 + pd*2;	// The width is approximately half the font-size plus twice the font size (for the icon) and some padding

		if(!chart.opt.legend.position) chart.opt.legend.position = 'top right';
		po = chart.opt.legend.position.split(/ /);

		x = y = 0;
		for(u = 0; u < po.length; u++){
			if(po[u]=="left") x = chart.opt.left+pd;
			else if(po[u]=="right") x = (chart.w-chart.opt.right-wkey-pd);
			else if(po[u]=="top") y = chart.opt.top+pd;
			else if(po[u]=="bottom") y = chart.h-chart.opt.bottom-pd-hkey;
		}

		setAttr(key.el,{'transform':'translate('+x+' '+y+')'})
		setAttr(key.border,{'x':0,'width':wkey,'y':0,'fill':chart.opt.legend.fill||'rgba(255,255,255,0.8)'});
		y += pd;
		x += pd;

		x = pd;
		y = pd;
		for(s = 0; s < chart.series.length; s++){
			y += key.items[s].setPosition(x,y);
			key.items[s].updateLabel(chart.opt.legend.text,chart.opt['font-family']);
			key.items[s].update();
		}
		return this;
	};

	this.update();

	return this;
}

// Build a key item
function KeyItem(attr){

	if(!attr) throw("No options provided");
	
	var opts = {
		'points': {'marker':(attr.type=="bar-chart" || attr.type=="stacked-bar-chart" ? "square" : "circle")},
		'fontSize': 1	// Deliberately small so we can see it is bad
	}
	// Set some default values
	mergeDeep(opts,attr);

	this.el = svgEl("g");
	this.el.setAttribute('data-series',opts.s+1);

	// Update class of line
	let cl = ['data-series','data-series-'+(opts.s+1)];
	if(opts.series.getProperty('class')) cl.concat(series.getProperty('class').split(/ /));
	addClasses(this.el,cl);
	opts.legend.appendChild(this.el);

	let label = svgEl('text');
	this.el.appendChild(label);
	let tspan = svgEl('tspan');
	tspan.innerHTML = (opts.series.getProperty('title')||"Series "+(s+1));
	setAttr(tspan,{'dx':(opts.fontSize*2),'dy':0});
	label.appendChild(tspan);
	
	let line = svgEl('path');
	setAttr(line,{'d':'M0 0 L 1 0','stroke-width':3,'stroke-linecap':'round','class':'line item-line'});
	
	let mark = new Marker(opts.points);
	mark.addClass('item-mark');
	mark.setSize(attr.type=="bar-chart" || attr.type=="stacked-bar-chart" ? opts.fontSize : Math.min((opts.points.size||opts.fontSize/2),opts.fontSize));	// Default size of key item
	mark.setAttr({'fill':'silver'});

	this.el.appendChild(line);
	this.el.appendChild(mark.el);
	
	setAttr(tspan,opts.series.getProperty('attr'));

	this.getTextLength = function(fontWeight,fontFamily){
		// If the DOM element has access to getComputedTextLength() 
		// we use that otherwise fall back to our simplistic version
		return (typeof label.getComputedTextLength==="function") ? label.getComputedTextLength() : textLength(tspan.innerText,opts.fontSize,fontWeight,fontFamily);
	};
	this.setPosition = function(x,y){
		setAttr(this.el,{'transform':'translate('+x+' '+y+')','data':'a'});
		return opts.fontSize;
	};
	this.updateLabel = function(text,fontFamily){
		setAttr(label,{'x': 0,'y':roundTo(opts.fontSize*0.2, 3),'font-family':fontFamily||"sans-serif"});
		if(typeof text==="object"){
			for(let p in text) label.setAttribute(p,text[p]);
		}
		return this;
	}

	this.update = function(){

		let fs = opts.fontSize;
		let p = opts.series.getProperties();
		mark.setPosition(roundTo(fs*0.75, 3),roundTo(0.5*fs, 3),fs/2);
		mark.setAttr({'fill':(p.points.color||""),'stroke-width':p.points['stroke-width']||0,'stroke':p.points.stroke||""});

		if(opts.type=="line-chart" || opts.type=="category-chart"){
			line.setAttribute('d','M'+0+','+roundTo(fs*0.5, 3)+' l '+(fs*1.5)+' 0');
			if(p.line.color) line.setAttribute('stroke',p.line.color||"");
		}
		return this;
	}

	return this;
}
