import { add, svgEl, setAttr, mergeDeep, roundTo, clone } from './util.js';

export function Animate(e,attr){
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
		var n,i,j,a2,b2,a,b,dx,c;
		e.querySelectorAll('animate').forEach(function(ev){ ev.parentNode.removeChild(ev); });

		c = 0;
		if(typeof opt.curvature==="number" && opt.curvature >= 0) c = Math.min(1,opt.curvature);

		for(n in props){
			if(n){
				a = props[n].from||"";
				b = props[n].to;
				if(!a && as[n]) a = as[n].value;
				a2 = null;
				b2 = null;
				if(tag=="path"){
					a2 = buildLine(a,{'curvature':c})+finishLine(a,b,{'curvature':c});
					b2 = buildLine(b,{'curvature':c})+finishLine(b,a,{'curvature':c});

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

function finishLine(a,b,opt){
	if(!opt) opt = {};
	let c = (typeof opt.curvature==="number" ? opt.curvature : 0); 
	let p = '';
	if(c == 0){
		if(a.length > 0 && a.length < b.length){
			for(i = 0; i < b.length-a.length; i++) p += 'L'+roundTo(a[a.length-1].x, 2)+','+roundTo(a[a.length-1].y, 2);
		}
	}else{
		if(a.length > 0 && a.length < b.length){
			j = a.length-1;
			for(i = 0; i < b.length-a.length; i++){
				p += (i==1 ? 'C'+roundTo(a[j-1].x + c*dx, 2)+','+roundTo(a[j-1].y, 2) : 'S');
				p += ' '+roundTo(a[j].x - c*dx, 2)+','+roundTo(a[j].y, 2);
				p += ' '+roundTo(a[j].x, 2)+','+roundTo(a[j].y, 2);
			}
		}
	}
	return p;
}


function buildLine(arr,opt){
	let a,b,c,p = '',gap = 0,i,typ,num = new Array(arr.length),prevgood = null,dx;
	if(!opt) opt = {};
	a = (typeof opt.a==="number" ? opt.a : 0);
	b = (typeof opt.b==="number" ? opt.b : arr.length);
	c = (typeof opt.curvature==="number" ? opt.curvature : 0); 
	// First work out if the x and y values are numbers
	for(i = a; i < b; i++){
		num[i] = (typeof arr[i].x==="number" && typeof arr[i].x==="number" && !isNaN(arr[i].x) && !isNaN(arr[i].y));
	}
	for(i = a; i < b; i++){
		if(num[i]){
			if(c == 0){
				// No curvature

				// Do we move or draw a line?
				if(gap > 0) typ = 'M';
				else typ = (p ? 'L':'M');
				p += typ+roundTo(arr[i].x, 2)+','+roundTo(arr[i].y, 2)

			}else{
				// Curvature

				// Join points with curves
				if(!p || gap > 0 || !prevgood){
					p += 'M'+roundTo(arr[i].x, 2)+','+roundTo(arr[i].y, 2);
				}else{
					dx = (arr[i].x - prevgood.x)/2;
					// Create a cubic bezier curve from the last good point to the current point
					p += (i==1 ? 'C'+roundTo(prevgood.x + c*dx, 2)+','+roundTo(prevgood.y, 2) : 'S');
					p += ' '+roundTo(arr[i].x - c*dx, 2)+','+roundTo(arr[i].y, 2);
					p += ' '+roundTo(arr[i].x, 2)+','+roundTo(arr[i].y, 2);
				}
				prevgood = arr[i];
			}
			// reset the gap
			gap = 0;

		}else{
			typ = '';
			gap++;
		}
	}
	return p;
}
