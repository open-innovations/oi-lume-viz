import { Animate } from './animate.js';
import { add, addClasses, svgEl, setAttr, mergeDeep, clone } from './util.js';

// Function to draw a regular polygon as an SVG path. 
// It will have n sides and be centred on cx,cy with a "radius" r.
function drawPolygon(n,cx,cy,r){
	if(typeof cx==="string") cx = parseFloat(cx);
	if(typeof cy==="string") cy = parseFloat(cy);

	var step = 360/n;
	var cordeg = 0;
	var p = "";
	var d2r = Math.PI/180;
	// For even-numbered sides we offset the initial angle
	var ginit = (n%2==0 ? -step/2 : 0);
	for(var g = ginit,j = 0; g <= 360; g += step, j++){
		var y = (Math.sin(g*d2r)*r + cy);
		var x = (Math.cos(g*d2r)*r + cx);
		p += (j==0 ? "M":"L")+roundNumber(x)+","+roundNumber(y)+" ";
	};
	p += "Z";
	return p;
}

function roundNumber(v,n){
	if(typeof n!=="number" || n < 0) n = 3;
	if(typeof v==="string"){
		// Try to parse it into a number
		v = parseFloat(v);
	}
	if(typeof v==="number"){
		if(isNaN(v)){
			console.warn('Not a number:',v,typeof v);
			return '?';
		}else{
			return parseFloat(v.toFixed(n));
		}
	}else{
		console.warn('The value passed to roundNumber ('+v+') is of type '+(typeof v));
		throw new TypeError('Not a number');
		return v;
	}
}

// Main marker function.
// A marker will default to "marker": "circle".
// Other attributes include:
//   size - the "radius" of the marker
//   rotate - the number of degrees to rotate the marker
export function Marker(attr){

	if(!attr){
		console.error('No options provided to Marker');
		return {};
	}

	var anim,opts,origin,markers;

	opts = {'marker': 'circle'};
	origin = {'x':null,'y':null};
	markers = {
		'circle': {
			'type': 'circle',
			'init': function(){
				setAttr(this.el,{'cx':0,'cy':0});
			},
			'setSize': function(s){
				setAttr(this.el,{'r':s/2});
			},
			'setPosition': function(x,y){
				if(anim) anim.set({'cx':{'from':roundNumber(origin.x||0,2),'to':roundNumber(x||0,2)},'cy':{'from':roundNumber(origin.y||0,2),'to':roundNumber(y||0,2)}});
				else setAttr(this.el,{'cx':roundNumber(x,2),'cy':roundNumber(y,2)});
				if(opts.size) setAttr(this.el,{'r':opts.size/2});
			}
		},
		'triangle': {
			'type': 'path',
			'init': function(){
				setAttr(this.el,{'d':''});
			},
			'setPosition': function(x,y){
				setAttr(this.el,{'d':drawPolygon(3,x,y,opts.size/2)});
			}
		},
		'square': {
			'type': 'path',
			'init': function(){
				setAttr(this.el,{'d':''});
			},
			'setPosition': function(x,y){
				setAttr(this.el,{'d':drawPolygon(4,x,y,opts.size/2)});
			}
		},
		'diamond': {
			'type': 'path',
			'init': function(){
				setAttr(this.el,{'d':''});
			},
			'setPosition': function(x,y){
				var s = opts.size/2;
				var r = s*0.7;
				if(typeof x==="string") x = parseFloat(x);
				if(typeof y==="string") y = parseFloat(y);
				var d = "M"+(x).toFixed(1)+","+(y-s).toFixed(1);
				d += "l"+(r).toFixed(1)+","+s.toFixed(1);
				d += "l"+(-r).toFixed(1)+","+s.toFixed(1);
				d += "l"+(-r).toFixed(1)+","+(-s).toFixed(1);
				d += "Z";
				setAttr(this.el,{'d':d});
			}
		},
		'pentagon': {
			'type': 'path',
			'init': function(){
				setAttr(this.el,{'d':''});
			},
			'setPosition': function(x,y){
				setAttr(this.el,{'d':drawPolygon(5,x,y,opts.size/2)});
			}
		},
		'hexagon': {
			'type': 'path',
			'init': function(){
				setAttr(this.el,{'d':''});
			},
			'setPosition': function(x,y){
				setAttr(this.el,{'d':drawPolygon(6,x,y,opts.size/2)});
			}
		},
		'octagon': {
			'type': 'path',
			'init': function(){
				setAttr(this.el,{'d':''});
			},
			'setPosition': function(x,y){
				setAttr(this.el,{'d':drawPolygon(8,x,y,opts.size/2)});
			}
		},
		'cross': {
			'type': 'path',
			'init': function(){
				setAttr(this.el,{'d':''});
			},
			'setPosition': function(x,y){
				var s = opts.size/2;
				var r = s*0.25;
				var f = s-r;
				if(typeof x==="string") x = parseFloat(x);
				if(typeof y==="string") y = parseFloat(y);
				var d = "M"+(x-s).toFixed(1)+","+(y-r).toFixed(1);
				d += "l"+(f).toFixed(1)+",0";
				d += "l0,"+(-f).toFixed(1);
				d += "l"+(2*r).toFixed(1)+",0";
				d += "l0,"+(f).toFixed(1);
				d += "l"+(f).toFixed(1)+",0";
				d += "l0,"+(2*r).toFixed(1);
				d += "l"+(-f).toFixed(1)+",0";
				d += "l0,"+(f).toFixed(1);
				d += "l"+(-2*r).toFixed(1)+",0";
				d += "l0,"+(-f).toFixed(1);
				d += "l"+(-f).toFixed(1)+",0";
				d += "Z";
				setAttr(this.el,{'d':d});
			}
		},
		'line': {
			'type': 'path',
			'init': function(){
				setAttr(this.el,{'d':''});
			},
			'setPosition': function(x,y){
				var s = opts.size/2;
				var r = s*0.25;
				var f = s-r;
				if(typeof x==="string") x = parseFloat(x);
				if(typeof y==="string") y = parseFloat(y);

				var d = "M"+(x-s).toFixed(1)+","+(y-r).toFixed(1);
				d += "l"+(opts.size).toFixed(1)+",0";
				d += "l0,"+(2*r).toFixed(1);
				d += "l"+(-opts.size).toFixed(1)+",0";
				d += "Z";
				setAttr(this.el,{'d':d});
			}
		}
	};

	// If a marker is defined and it isn't a string, process it
	if(attr.marker && typeof attr.marker!=="string"){
		var div = document.createElement('div');
		div.classList.add('test');
		div.innerHTML = attr.marker.svg||"";
		this.el = div.firstChild;
		markers.icon = attr.marker;
		markers.icon.type = 'svg';
		markers.icon.setPosition = function(x,y){
			setAttr(this.el,{'x':x-opts.size/2,'y':y-opts.size/2,'width':opts.size,'height':opts.size});
		}
		attr.marker = "icon";
	}

	mergeDeep(opts,attr);

	if(markers[opts.marker]){
		mergeDeep(opts,markers[opts.marker]);
		if(!this.el) this.el = svgEl(opts.type);
		if(typeof markers[opts.marker].init==="function") markers[opts.marker].init.call(this);
	}else{
		throw new Error('Marker "'+opts.marker+'" is not a valid type from: '+Object.keys(markers).join(', ')+'.');
	}
	
	// Add animation to point

	this.setAnimation = function(attr){ anim = new Animate(this.el,attr); };
	this.setAttr = function(attr){ setAttr(this.el,attr); return this; };
	this.setSize = function(s){
		opts.size = s;
		if(typeof opts.setSize==="function") opts.setSize.call(this,s);
		return this;
	};
	this.setTitle = function(title){
		if(this.el){
			var t = this.el.querySelector('title');
			if(title){
				if(!t){
					t = svgEl('title');
					this.el.append(t);
				}
				if(t) t.innerHTML = title;
			}else{
				if(t) t.parentNode.removeChild(t);
			}
		}
	};
	this.setPosition = function(x,y){
		// Update point position
		if(typeof markers[opts.marker].setPosition==="function"){
			markers[opts.marker].setPosition.call(this,x,y);
			origin = {'x':x,'y':y};
			if(opts.rotate) setAttr(this.el,{'transform':'rotate('+opts.rotate+' '+origin.x+' '+origin.y+')'});
		}
		return this;
	};
	this.addClass = function(cls){ this.el.classList.add(cls); }

	this.getType = function(){
		return opts.marker;
	};
	
	return this;
}