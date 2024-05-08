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
		if(typeof opt.curvature==="number" && opt.curvature > 0) c = Math.min(1,opt.curvature);

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
					if(c > 0){
						// Would join points with curves
						for(i = 0; i < a.length; i++){
							if(i==0){
								a2 += 'M'+roundTo(a[i].x, 2)+','+roundTo(a[i].y, 2);
							}else{
								dx = (a[i].x - a[i-1].x)/2;
								// Create a cubic bezier curve from the last point to the current point
								a2 += (i==1 ? 'C'+roundTo(a[i-1].x + c*dx, 2)+','+roundTo(a[i-1].y, 2) : 'S');
								a2 += ' '+roundTo(a[i].x - c*dx, 2)+','+roundTo(a[i].y, 2);
								a2 += ' '+roundTo(a[i].x, 2)+','+roundTo(a[i].y, 2);
							}
						}
						if(a.length > 0 && a.length < b.length){
							j = a.length-1;
							for(i = 0; i < b.length-a.length; i++){
								a2 += (i==1 ? 'C'+roundTo(a[j-1].x + c*dx, 2)+','+roundTo(a[j-1].y, 2) : 'S');
								a2 += ' '+roundTo(a[j].x - c*dx, 2)+','+roundTo(a[j].y, 2);
								a2 += ' '+roundTo(a[j].x, 2)+','+roundTo(a[j].y, 2);
							}
						}
						for(i = 0; i < b.length; i++){
							if(i==0){
								b2 += 'M'+roundTo(b[i].x, 2)+','+roundTo(b[i].y, 2);
							}else{
								dx = (b[i].x - b[i-1].x)/2;
								// Create a cubic bezier curve from the last point to the current point
								b2 += (i==1 ? 'C'+roundTo(b[i-1].x + c*dx, 2)+','+roundTo(b[i-1].y, 2) : 'S');
								b2 += ' '+roundTo(b[i].x - c*dx, 2)+','+roundTo(b[i].y, 2);
								b2 += ' '+roundTo(b[i].x, 2)+','+roundTo(b[i].y, 2);
							}
						}
						if(b.length > 0 && b.length < a.length){
							j = b.length-1;
							for(i = 0; i < a.length-b.length; i++){
								b2 += (i==1 ? 'C'+roundTo(b[j-1].x + c*dx, 2)+','+roundTo(b[j-1].y, 2) : 'S');
								b2 += ' '+roundTo(b[j].x - c*dx, 2)+','+roundTo(b[j].y, 2);
								b2 += ' '+roundTo(b[j].x, 2)+','+roundTo(b[j].y, 2);
							}
						}
					}else{
						a2 += buildLine(a);
						b2 += buildLine(b);
						if(a.length > 0 && a.length < b.length){
							for(i = 0; i < b.length-a.length; i++) a2 += 'L'+roundTo(a[a.length-1].x, 2)+','+roundTo(a[a.length-1].y, 2);
						}
						if(b.length > 0 && b.length < a.length){
							for(i = 0; i < a.length-b.length; i++) b2 += 'L'+roundTo(b[b.length-1].x, 2)+','+roundTo(b[b.length-1].y, 2);
						}
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


function buildLine(arr,a,b){
	let p = '',gap = 0,i,typ,num = new Array(arr.length),bad = false;
	if(typeof a!=="number") a = 0;
	if(typeof b!=="number") b = arr.length;
	// First work out if the x and y values are numbers
	for(i = a; i < b; i++){
		num[i] = !(isNaN(arr[i].x) || isNaN(arr[i].y));
		if(!num[i]) bad = true;
	}
	for(i = a; i < b; i++){
		if(num[i]){
			// Do we move or draw a line?
			if(gap > 0) typ = 'M';
			else typ = (p ? 'L':'M');
			// reset the gap
			gap = 0;
			p += typ+roundTo(arr[i].x, 2)+','+roundTo(arr[i].y, 2)
		}else{
			typ = '';
			gap++;
		}
	}
	return p;
}
