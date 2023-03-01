import { mergeDeep } from '../../../lib/util/merge-deep.ts';
import { Axis } from './axis.js';
import { Series } from './series.js';
import { add, svgEl, setAttr, addClasses, qs, roundTo } from './util.js';
import { textLength } from './text.js';

const ns = 'http://www.w3.org/2000/svg';

export function Chart(config,csv){
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
		'font-family':'Poppins,sans-serif',
		'legend':{
			'show':false,
			'border':{'stroke':'#000000','stroke-width':1,'fill':'none'},
			'text':{'text-anchor':'start','dominant-baseline':'hanging','font-weight':'bold','fill':'#000000','stroke-width':0}
		},
		'axis':{
			'x':{'padding':10,'grid':{'show':true,'stroke':'#B2B2B2'},'labels':{},'getXY':function(x,y){ return _obj.getXY(x,y); },'font-family':'Poppins,CenturyGothicStd,"Century Gothic",sans-serif'},
			'y':{'padding':10,'labels':{},'getXY':function(x,y){ return _obj.getXY(x,y); },'font-family':'Poppins,CenturyGothicStd,"Century Gothic",sans-serif'}
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
			var data,datum,label,x,y,labx,laby;
			for(s = 0; s < this.opt.series.length; s++){
				mergeDeep(this.opt.series[s],{
					'line':{'show':true,'color': (this.opt.series[s].colour||colours[this.opt.series[s].title]||'')},
					'points':{'size':1, 'color': (this.opt.series[s].colour||colours[this.opt.series[s].title]||'')}
				});
				data = [];
				for(i = 0; i < csv.rows.length; i++){
					labx = x = csv.columns[this.opt.series[s].x][i];
					laby = y = csv.columns[this.opt.series[s].y][i];
					if(typeof x==="string") x = i;
					if(typeof y==="string") y = i;
					if(x >= this.opt.axis.x.min && x <= this.opt.axis.x.max){
						categoryoffset = csv.rows.length-i-1;
						seriesoffset = (this.opt.series.length-s-1.5)*(0.8/this.opt.series.length);
						label = this.opt.series[s].title+"\n"+labx+': '+(laby||"");
						if(this.opt.series[s].tooltip && csv.columns[this.opt.series[s].tooltip]) label = csv.columns[this.opt.series[s].tooltip][i];
						datum = {'x':x,'y':y,'title':label};
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

		var defaultkeyitem = '<path d="M0 0 L 1 0" class="line" class="" stroke-width="3" stroke-linecap="round"></path><rect x="0" y="0" width="5" height="5" fill="silver"></rect>';

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

			setAttr(key.border,{'x':x,'width':wkey+pd,'y':y});
			y += pd;
			x += pd;

			for(s = 0; s < this.series.length; s++){
				// Set the transform on the group
				setAttr(key.g[s],{'transform':'translate('+x+' '+y+')'});
				
				text = qs(key.g[s],'text');
				line = qs(key.g[s],'path');
				rect = qs(key.g[s],'rect');
				setAttr(text,{'x': 0,'y':roundTo(fs*0.2, 3),'font-family':this.opt['font-family']||"sans-serif"});
				if(typeof this.opt.legend.text==="object"){
					for(p in this.opt.legend.text) text.setAttribute(p,this.opt.legend.text[p]);
				}
				p = this.series[s].getProperties();
				setAttr(rect,{'x':roundTo(fs*0.75, 3)-fs/2,'y':roundTo(0.5*fs, 3)-fs/2,'width':fs,'height':fs,'fill':(p.points.color||""),'stroke-width':p.points['stroke-width']||0,'stroke':p.points.stroke||""});

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
