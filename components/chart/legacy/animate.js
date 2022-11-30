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