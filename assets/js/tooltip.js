/*
	Open Innovations Tooltip v0.3
	Helper function to add tooltips. A suitable candidate must:
	  - be in an SVG
	  - have a <title> child
	  - the parent SVG must have a container
*/

(function(root){

	var styles = document.createElement('style');
	styles.innerHTML = '.tooltip {z-index:10000;color:black;filter:drop-shadow(0px 1px 1px rgba(0,0,0,0.7));text-align:left;}.tooltip .inner { padding: 1em; }';
	document.head.prepend(styles)

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
	// Create a polyfill for furthest
	if (!Element.prototype.furthest) {
		Element.prototype.furthest = function(s){
			var el = this;
			var anc = null;

			while (el !== null && el.nodeType === 1) {
				if (el.matches(s)) anc = el;
				el = el.parentElement || el.parentNode;
			}
			return anc;
		}
	}

	function Tooltip(pt,attr){

		var svg,holder,tt,typ;
		svg = pt.furthest('svg');
		holder = svg.parentNode;
		tt = pt.querySelector('title');
		if(!tt) tt = pt.parentNode.querySelector('title');
		
		// Find the "data-type"
		typ = svg.getAttribute('data-type');
		attr.type = typ;

		this.show = function(){
			var tip,j,title,fill,selected,bb,bbo,bbox,off,pad,box,arr,shift,wide;

			if(attr._parent.selected && attr._parent.selected!=this) return this;

			wide = document.body.getBoundingClientRect().width;

			// Set the position of the holder element
			holder.style.position = 'relative';

			// Create the tip (only one can exist)
			tip = attr._parent.create();

			// Add the tip to the holder
			add(tip,holder);

			// Get the fill colour
			fill = pt.getAttribute('fill');
			// If no fill try the fill of the nearest SVG element
			if(!fill) fill = pt.closest('svg').getAttribute('fill');
			// If the fill is "currentColor" we compute what that is
			if(fill == "currentColor") fill = window.getComputedStyle(pt)['color'];
			if(fill == "transparent" && pt.getAttribute('data-fill')) fill = pt.getAttribute('data-fill');

			// Get the contents now (in case they've been updated)
			title = (tt ? tt.innerHTML : "").replace(/[\n\r]/g,'<br />');

			box = tip.querySelector('.inner');
			arr = tip.querySelector('.arrow');

			// Set the contents
			box.innerHTML = (title);

			// Position the tooltip
			bb = pt.getBoundingClientRect();	// Bounding box of the element
			bbo = holder.getBoundingClientRect(); // Bounding box of SVG holder

			off = 4;
			pad = 8;
			if(typ=="bar-chart" || typ=="stacked-bar-chart") off = bb.height/2;
			if(typ=="hex-map") off = (bb.height/2);
			if(typ=="tree-map") off = (bb.height/2);
			if(typ=="calendar-chart") off = (bb.height/2);
			if(typ=="waffle-chart") off = (bb.height/2);

			tip.setAttribute('style','position:absolute;left:'+(bb.left + bb.width/2 - bbo.left).toFixed(2)+'px;top:'+(bb.top + bb.height/2 - bbo.top).toFixed(2)+'px;display:'+(title ? 'block':'none')+';z-index:1000;transform:translate3d(-50%,calc(-100% - '+off+'px),0);transition:all 0s;');
			box.style.background = fill;
			box.style.transform = 'none';
			arr.style['border-top-color'] = fill;

			// If the colour is similar to black we need to change the tooltip filter
			if(contrastRatio(colour2RGB(fill),[0,0,0]) < 2){
				box.style.border = "1px solid rgba(255,255,255,0.3)";
				box.style.borderBottom = "0";
			}else{
				box.style.border = "0px";
			}
			tip.style.color = root.OI.contrastColour ? root.OI.contrastColour(fill) : "black";
			
			// Remove wrapping if the tip is wider than the page minus the padding
			box.style.whiteSpace = (tip.offsetWidth > wide - 2*pad) ? 'none' : 'nowrap';

			// Limit width of tooltip to window width - 2*pad
			if(tip.offsetWidth > wide - 2*pad){
				tip.style.width = (wide - 2*pad)+'px';
				box.style.whiteSpace = 'normal';
			}else{
				tip.style.width = '';
			}

			// Find out where the tooltip is now
			bbox = tip.getBoundingClientRect();

			// Set tooltip transform
			// If we were to just position the overall tooltip then shift the contents, we 
			// gain a horizontal scroll bar on the page when the tooltip is off the right-hand-side.
			// Instead we calculate the required shift and apply it to the tooltip and the 
			// arrow in opposite senses to keep the arrow where it needs to be
			shift = 0;
			if(bbox.left < pad) shift = (pad-bbox.left);
			else if(bbox.right > wide-pad) shift = -(bbox.right-wide+pad);
			if(bbox.top > pad){
				// Tooltip is comfortably on the screen
				tip.style.top = (bb.top + bb.height/2 - bbo.top).toFixed(2)+'px';
				tip.style.transform = 'translate3d('+(shift == 0 ? '-50%' : 'calc(-50% + ' + shift + 'px)')+',calc(-100% - '+off+'px - 0.75em),0)';
				arr.style.transform = 'translate3d(calc(-50% - ' + shift + 'px),0,0)';
				arr.style.top = 'calc(100% - 1px)';
				arr.style['border-top'] = '0.5em solid '+fill;
				arr.style['border-right'] = '0.5em solid transparent';
				arr.style['border-bottom'] = '';
				arr.style['border-left'] = '0.5em solid transparent';
			}else{
				// Tooltip is off the top of the screen
				tip.style.top = (bb.top + bb.height/2 - bbo.top).toFixed(2)+'px';
				tip.style.transform = 'translate3d('+(shift == 0 ? '-50%' : 'calc(-50% + ' + shift + 'px)')+',calc('+(off)+'px + 0.75em),0)';
				arr.style.transform = 'translate3d(calc(-50% - ' + shift + 'px),-100%,0)';
				arr.style.top = '1px';
				arr.style['border-top'] = '';
				arr.style['border-right'] = '0.5em solid transparent';
				arr.style['border-bottom'] = '0.5em solid '+fill;
				arr.style['border-left'] = '0.5em solid transparent';
			}

			if(typeof attr.show==="function") attr.show.call(this,pt,attr);
			attr._parent.active = this;

			return this;
		};

		this.toggleSelected = function(){
			selected = svg.querySelectorAll('.selected');
			for(var j = 0; j < selected.length; j++){
				if(!selected[j].parentNode.classList.contains('outline')) selected[j].classList.remove('selected');
			}
			if(this == attr._parent.selected){
				attr._parent.clear();
				attr._parent.selected = null;
			}else{
				attr._parent.selected = this;
				pt.classList.add('selected');
				this.show();
			}
		};

		this.clear = function(){ attr._parent.clear(); };

		if(!svg){
			console.error('No SVG container for:',pt);
			return this;
		}
		if(!tt){
			//console.error('No <title> child within:',pt);
			return this;
		}

		pt.setAttribute('tabindex',0);
		addEv('click',pt,{'this':this},this.toggleSelected);
		addEv('focus',pt,{'this':this},this.show);
		addEv('mouseover',(attr['hover-element']||pt),{'this':this},this.show);
		addEv('mouseleave',holder,{'this':this},this.clear);

		return this;
	}

	function Tooltips(){

		var tips = [];
		var tip;

		this.clear = function(){
			if(!this.selected){
				if(tip && tip.parentNode) tip.parentNode.removeChild(tip);
				tip = null;
				this.active = null;
			}
			return this;
		};

		this.create = function(){
			if(!tip){
				tip = document.createElement('div');
				tip.innerHTML = '<div class="inner" style="background: #b2b2b2;position:relative;"></div><div class="arrow" style="position:absolute;width:0;height:0;border:0.5em solid transparent;border-bottom:0;left:50%;top:calc(100% - 1px);transform:translate3d(-50%,0,0);border-color:transparent;border-top-color:#aaaaaa;"></div>';
				addClasses(tip,['tooltip']);
			}
			return tip;
		};

		this.add = function(pt,attr){
			if(!attr) attr = {};
			attr._parent = this;
			tips.push(new Tooltip(pt,attr));
			return tips[tips.length-1];
		};

		this.update = function(){
			if(this.active) this.active.show();
		};

		return this;
	}
	if(!root.OI.Tooltips) root.OI.Tooltips = new Tooltips();

	// Convert to sRGB colorspace
	// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
	function sRGBToLinear(v){ v /= 255; if (v <= 0.03928){ return v/12.92; }else{ return Math.pow((v+0.055)/1.055,2.4); } }
	function h2d(h) {return parseInt(h,16);}
	// https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
	function relativeLuminance(rgb){ return 0.2126 * sRGBToLinear(rgb[0]) + 0.7152 * sRGBToLinear(rgb[1]) + 0.0722 * sRGBToLinear(rgb[2]); }
	// https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html#contrast-ratiodef
	function contrastRatio(a, b){
		var L1 = relativeLuminance(a);
		var L2 = relativeLuminance(b);
		if(L1 < L2){
			var temp = L2;
			L2 = L1;
			L1 = temp;
		}
		return (L1 + 0.05) / (L2 + 0.05);
	}
	function colour2RGB(c){
		var rgb = [];
		if(c.indexOf('#')==0){
			rgb = [h2d(c.substring(1,3)),h2d(c.substring(3,5)),h2d(c.substring(5,7))];
		}else if(c.indexOf('rgb')==0){
			var bits = c.match(/[0-9\.]+/g);
			if(bits.length == 4) this.alpha = parseFloat(bits[3]);
			rgb = [parseInt(bits[0]),parseInt(bits[1]),parseInt(bits[2])];
		}
		return rgb;
	}
	function contrastColour(c){
		var rgb = colour2RGB(c);
		var cols = {
			"black": [0, 0, 0],
			"white": [255, 255, 255],
		};
		var maxRatio = 0;
		var contrast = "white";
		for(var col in cols){
			if(cols[col]){
				var contr = contrastRatio(rgb, cols[col]);
				if(contr > maxRatio){
					maxRatio = contr;
					contrast = col;
				}
			}
		}
		if(maxRatio < 4.5){
			console.warn('Text contrast poor ('+maxRatio.toFixed(1)+') for %c'+c+'%c','background:'+c+';color:'+contrast,'background:none;color:inherit;');
		}else if(maxRatio < 7){
			//console.warn('Text contrast good ('+maxRatio.toFixed(1)+') for %c'+c+'%c','background:'+c+';color:'+contrast,'background:none;color:inherit;');
		}
		return contrast;
	}
	if(!root.OI.contrastColour) root.OI.contrastColour = contrastColour;

})(window || this);