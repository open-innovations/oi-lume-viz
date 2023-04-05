/*
	Open Innovations SVG map Interactivity v0.1
	Helper function that find ".map.svg-map" elements 
	looks for <path> in the ".data-layer" group,
	then creates a tooltip
*/

(function(root){

	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		root.OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}

	function add(el,to){ return to.appendChild(el); }

	function addEv(ev,el,data,fn){
		el.addEventListener(ev,function(e){
			e.data = data;
			fn.call(data.this||this,e);
		});
	}

	function addClasses(el,cl){
		for(var i = 0; i < cl.length; i++) el.classList.add(cl[i]);
		return el;
	}

	function InteractiveSVGMap(el){
		var svg,pt,pts,tt,p;

		svg = el.querySelector('svg');
		pt = svg.querySelectorAll('.data-layer path');
		pts = [];
		
		this.addOutline = function(e){
			// Create an outline version of the hex that sits on top
			var outline = e.cloneNode(true);
			if(outline.querySelector('text')) outline.querySelector('text').remove();
			if(outline.querySelector('title')) outline.querySelector('title').remove();
			outline.querySelector('path').setAttribute('fill','none');
			outline.querySelector('path').setAttribute('vector-effect','non-scaling-stroke');
			outline.removeAttribute('id');
			outline.classList.add('outline');
			e.parentNode.appendChild(outline);
			return this;
		};
		this.removeOutline = function(e){
			if(!e) e = svg.querySelector('.data-layer');
			if(e.parentNode.querySelector('.outline')) e.parentNode.querySelector('.outline').remove();
			return this;
		};
		this.showTooltip = function(e){
			el.style.position = 'relative';

			var txt,bb,bbo,fill,hsv,hsl,selected,off;
			this.tip = el.querySelector('.tooltip');
			if(!this.tip){
				this.tip = document.createElement('div');
				this.tip.innerHTML = '<div class="inner" style="background: #b2b2b2;position:relative;"></div><div class="arrow" style="position: absolute; width: 0; height: 0; border: 0.5em solid transparent; border-bottom: 0; left: 50%; top: calc(100% - 1px); transform: translate3d(-50%,0,0); border-color: transparent; border-top-color: green;"></div>';
				addClasses(this.tip,['tooltip']);
				add(this.tip,el);
			}

			// Remove any existing outline
			this.removeOutline(e.data.el.parentNode);

			// Create an outline version of the hex that sits on top
			if(typ=="hex-map") this.addOutline(e.data.el.parentNode);

			// Set the contents
			txt = e.data.title;

			// Get the fill colour
			fill = e.data.el.getAttribute('fill');

			this.tip.querySelector('.inner').innerHTML = (txt);

			// Position the tooltip
			bb = e.data.el.getBoundingClientRect();	// Bounding box of the element
			bbo = el.getBoundingClientRect(); // Bounding box of SVG holder

			var typ = svg.getAttribute('data-type');
			off = (typ=="hex-map") ? (bb.height/2) : 4;
			
			this.tip.setAttribute('style','position:absolute;left:'+(bb.left + bb.width/2 - bbo.left).toFixed(2)+'px;top:'+(bb.top + bb.height/2 - bbo.top).toFixed(2)+'px;transform:translate3d(-50%,calc(-100% - '+off+'px),0);display:'+(txt ? 'block':'none')+';');
			this.tip.querySelector('.inner').style.background = fill;
			this.tip.querySelector('.arrow').style['border-top-color'] = fill;
			this.tip.style.color = OI.contrastColour ? OI.contrastColour(fill) : "black";
			return this;
		};

		this.reset = function(e){
			return this.clearTooltip(e);
		};
		this.clearTooltip = function(e){
			
			// Remove any existing outline
			this.removeOutline();
			if(this.tip && this.tip.parentNode) this.tip.parentNode.removeChild(this.tip);
			return this;
		};
		for(p = 0; p < pt.length; p++){
			tt = pt[p].querySelector('title');
			if(!tt) tt = pt[p].parentNode.querySelector('title');
			pts[p] = {'el':pt[p],'tooltip':(tt ? tt.innerHTML : "")};
			pt[p].parentNode.setAttribute('tabindex',0);
			addEv('focus',pt[p].parentNode,{'this':this,'title':pts[p].tooltip,'el':pt[p]},this.showTooltip);
			addEv('mouseover',pt[p],{'this':this,'title':pts[p].tooltip,'el':pt[p]},this.showTooltip);
		}
		addEv('mouseleave',el,{'this':this,'s':''},this.reset);

		return this;
	}

	root.OI.InteractiveSVGMap = function(el){ return new InteractiveSVGMap(el); };

})(window || this);

OI.ready(function(){
	var svgs = document.querySelectorAll('.map.svg-map, .map.hex-map');
	for(var i = 0; i < svgs.length; i++){
		OI.InteractiveSVGMap(svgs[i]);
	}
});