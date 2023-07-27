import { Animate } from './animate.js';
import { add, svgEl, setAttr,addClasses, mergeDeep, roundTo } from './util.js';
import { getFontFamily, getFontWeight, getFontSize } from '../../../lib/font/fonts.ts';

export function Axis(ax,from,to,attr){

	var opt,lbl,fs,xmin,xmax,ymin,ymax;

	const fontFamily = getFontFamily();
	const fontWeight = getFontWeight();
	const fontSize = getFontSize();

	// Move old style tickSpacing/tickSize
	if(!attr) attr = {};
	if(!attr.tick) attr.tick = {};
	if(typeof attr.tickSpacing!==undefined) attr.tick.spacing = attr.tickSpacing;
	if(typeof attr.tickSize!==undefined) attr.tick.size = attr.tickSize;

	// Set some defaults
	opt = {
		'label': 'axis',
		'left': 0,
		'right': 0,
		'top': 0,
		'bottom': 0,
		'padding': 4,
		'font-size': fontSize,
		'font-family': fontFamily,
		'font-weight': fontWeight,
		'line':{'show':true,stroke:'#000000','stroke-width':1,'stroke-linecap':'round','stroke-dasharray':''},
		'grid':{'show':false,'stroke':'#B2B2B2','stroke-width':1,'stroke-linecap':'round','stroke-dasharray':''},
		'title':{},
		'ticks':{'show':true},
		'tick': {'size':5},
		'labels':{},
		'getXY':function(x,y){ return {x:x,y:y}; }
	};

	// Update our defaults with the attributes provided to the function
	mergeDeep(opt,attr);

	lbl = opt.label;
	this.ticks = {};
	this.line = {};

	// Create the main SVG element for the axis
	this.el = svgEl("g");
	addClasses(this.el,[lbl+'-grid',lbl+'-grid-'+ax]);

	// Create a title element
	this.title = svgEl("text");
	this.title.classList.add(lbl+'-grid-title');

	// Add the title to the main element
	add(this.title,this.el);

	fs = opt['font-size']||fontSize;

	xmin = ymin = xmax = ymax = 0;

	// External function so that we can add this axis to the chart SVG
	this.addTo = function(svg){
		add(this.el,svg);
		return this;
	};

	// Set the x and y range of the axis
	this.updateRange = function(xmn,xmx,ymn,ymx){
		xmin = xmn;
		xmax = xmx;
		ymin = ymn;
		ymax = ymx;
		return this;
	};

	// Update the properties of the axis
	this.setProperties = function(myopt){
		mergeDeep(opt,myopt);
		return this;
	};

	// Get a specific property
	this.getProperty = function(pid){
		if(opt.hasOwnProperty(pid)) return opt[pid];
		else return null;
	};

	// Update the axis
	this.update = function(){
		var t,x,y,pos,len,align,talign,baseline,xsign,ysign,lines,l,d;
		if(!opt.labels) opt.labels = {};
		this.title.innerHTML = opt.title.label||"";
		x = (ax=="x" ? (opt.left + (opt.width-opt.right-opt.left)/2) : fs);
		y = (ax=="y" ? (opt.top + (opt.height-opt.top-opt.bottom)/2):(opt.height-fs/2));
		setAttr(this.title,{'x':x,'y':y,'dx':0,'text-anchor':'middle','transform':(ax=="y"?'rotate(-90,'+x+','+y+')':''),'font-family':opt['font-family']||'sans-serif','font-weight':opt['font-weight']});
		this.el.removeAttribute('style');
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
				len = (typeof opt.labels[t].tickSize==="number" ? opt.labels[t].tickSize : opt.tick.size);

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

						this.ticks[t].line = {'el':svgEl('line')};
						add(this.ticks[t].line.el,this.ticks[t].g.el);

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
						setAttr(tspan,{'font-family':opt['font-family']||fontFamily,'font-size':fs});
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
					this.ticks[t].g.animate.set({'transform':{'to':'translate('+b.x.toFixed(3)+','+b.y.toFixed(3)+')'}});
				}
			}
		}
		return this;
	};
	return this;
}