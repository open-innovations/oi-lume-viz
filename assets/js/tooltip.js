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
			var tip,j,title;

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
			tip.style.color = OI.contrastColour ? OI.contrastColour(fill) : "black";
			
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
			delete tip;
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
})(window || this);