/*
	Open Innovations Tooltip v0.1
	Helper function to add tooltips. A suitable candidate must:
	  - be in an SVG
	  - have a <title> child
	  - the parent SVG must have a container
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

	function Tooltip(pt,attr){

		var svg,holder,tt,typ;
		svg = pt.closest('svg');
		holder = svg.parentNode;
		tt = pt.querySelector('title');
		if(!tt) tt = pt.parentNode.querySelector('title');
		
		// Find the "data-type"
		typ = svg.getAttribute('data-type');
		attr.type = typ;

		this.show = function(){
			var tip,j,title,fill,selected,bb,bbo,off;

			// Set the position of the holder element
			holder.style.position = 'relative';

			// Create the tip (only one can exist)
			tip = attr._parent.create();

			// Add the tip to the holder
			add(tip,holder);

			// Get the fill colour
			fill = pt.getAttribute('fill');

			// Remove current selections
			selected = svg.querySelectorAll('.selected');
			for(j = 0; j < selected.length; j++) selected[j].classList.remove('selected');


			// Add the "selected" class to the element
			pt.classList.add('selected');

			// Get the contents now (in case they've been updated)
			title = (tt ? tt.innerHTML : "").replace(/[\n\r]/g,'<br />');

			// Set the contents
			tip.querySelector('.inner').innerHTML = (title);

			// Position the tooltip
			bb = pt.getBoundingClientRect();	// Bounding box of the element
			bbo = holder.getBoundingClientRect(); // Bounding box of SVG holder

			off = 4;
			if(typ=="bar-chart" || typ=="stacked-bar-chart") off = bb.height/2;
			if(typ=="hex-map") off = (bb.height/2);

			tip.setAttribute('style','position:absolute;left:'+(bb.left + bb.width/2 - bbo.left).toFixed(2)+'px;top:'+(bb.top + bb.height/2 - bbo.top).toFixed(2)+'px;transform:translate3d(-50%,calc(-100% - '+off+'px),0);display:'+(title ? 'block':'none')+';');
			tip.querySelector('.inner').style.background = fill;
			tip.querySelector('.arrow').style['border-top-color'] = fill;
			tip.style.color = root.OI.contrastColour ? root.OI.contrastColour(fill) : "black";
			
			if(typeof attr.show==="function") attr.show.call(this,pt,attr);

			return this;
		};

		if(!svg){
			console.error('No SVG container for:',pt);
			return this;
		}
		if(!tt){
			console.error('No <title> child within:',pt);
			return this;
		}

		pt.parentNode.setAttribute('tabindex',0);
		addEv('focus',pt.parentNode,{'this':this},this.show);
		addEv('mouseover',pt,{'this':this},this.show);
		addEv('mouseleave',holder,{'this':this,'s':''},attr._parent.clear);

		return this;
	}

	function Tooltips(){

		var tips = [];
		var tip;

		this.clear = function(){
			if(tip && tip.parentNode) tip.parentNode.removeChild(tip);
			tip = null;
			return this;
		};

		this.create = function(){
			if(!tip){
				tip = document.createElement('div');
				tip.innerHTML = '<div class="inner" style="background: #b2b2b2;position:relative;"></div><div class="arrow" style="position: absolute; width: 0; height: 0; border: 0.5em solid transparent; border-bottom: 0; left: 50%; top: calc(100% - 1px); transform: translate3d(-50%,0,0); border-color: transparent; border-top-color: #aaaaaa;"></div>';
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
		return this;
	}
	root.OI.Tooltips = new Tooltips();

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
	function contrastColour(c){
		var rgb = [];
		if(c.indexOf('#')==0){
			rgb = [h2d(c.substring(1,3)),h2d(c.substring(3,5)),h2d(c.substring(5,7))];
		}else if(c.indexOf('rgb')==0){
			var bits = c.match(/[0-9\.]+/g);
			if(bits.length == 4) this.alpha = parseFloat(bits[3]);
			rgb = [parseInt(bits[0]),parseInt(bits[1]),parseInt(bits[2])];
		}
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
	root.OI.contrastColour = contrastColour;

})(window || this);