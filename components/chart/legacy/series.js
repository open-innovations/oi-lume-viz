import { Animate } from './animate.js';
import { Marker } from './marker.js';
import { add, addClasses, svgEl, setAttr, mergeDeep, clone } from './util.js';
import { getSeriesColour } from '../../../lib/colour/colour.ts';
	
export function Series(s,props,data,extra){
	if(!props) return this;

	var id = props.id||Math.round(Math.random()*1e8);

	var opt,line,path,pts,o,label;
	var defaultcolor = getSeriesColour(s)||'#000000';
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
				setAttr(pts[i].bar,{'data-series':(s+1),'tabindex':0,'x':0,'y':0,'width':0,'height':0,'class':'marker'});


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

//if(opt.points.size > 1) console.log('series size = ',opt.points.size);
				pts[i].mark = new Marker(opt.points);
				pts[i].mark.setAnimation({'duration':opt.duration});
				pts[i].mark.setAttr(datum);
				pts[i].mark.setAttr({'tabindex':0,'data-series':s+1}); // Update the point
				pts[i].mark.addClass('marker');
				
				// Add the marker element to the series element
				add(pts[i].mark.el,this.el);

				// Add the title to the marker
				add(pts[i].title,pts[i].mark.el);
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
//if(opt.points.size > 1) console.log('setting',opt.points);
				if(typeof opt.points.size==="number") r = Math.max(opt.points.size,r);
				if(typeof opt.points.size==="function") r = opt.points.size.call(pt,{'series':s,'i':i,'data':data[i]});
			}

			// Set some initial values for the point
			if(pts[i].mark){
				pts[i].mark.setAttr({'fill':opt.points.color,'fill-opacity':opt.points['fill-opacity'],'stroke':opt.points.stroke,'stroke-width':opt.points['stroke-width']});
				pts[i].mark.setSize(r);
			}
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
			if(pts[i].mark) pts[i].mark.setPosition(ps.x,ps.y);
			
			if(!data[i].good) setAttr(pts[i].mark.point,{'visibility':'hidden'});

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
