/*
	Open Innovations map Interactivity v0.2.1
	Helper function that find ".oi-map.oi-svg-map" or
	".oi-map.oi-hex-map" elements and adds tooltips to them.
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

	function InteractiveSVGMap(el){
		var svg,_obj,typ,overlay;

		svg = el.querySelector(':scope > svg');
		typ = svg.getAttribute('data-type');

		// On a touch device we allow a touch of the SVG object to close an open tooltip
		if(('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)){
			svg.addEventListener('touchstart',function(e){
				e.stopImmediatePropagation();
				if(attr._alltips.locked) attr._alltips.locked.unlock();
				if(attr._alltips.active) attr._alltips.active.clear();
			});
		}

		overlay = svg.querySelector('.overlay');
		if(!overlay){
			overlay = document.createElementNS('http://www.w3.org/2000/svg','g');
			overlay.classList.add('overlay');
			svg.appendChild(overlay);
		}

		this.addOutline = function(e){
			// Create an outline version of the hex that sits on top
			var outline = e.cloneNode(true);
			outline.removeAttribute('tabindex');
			if(outline.querySelector('text')) outline.querySelector('text').remove();
			if(outline.querySelector('title')) outline.querySelector('title').remove();
			let path = outline.querySelector('path')||outline.querySelector('use');
			path.setAttribute('fill','none');
			path.setAttribute('vector-effect','non-scaling-stroke');
			outline.removeAttribute('id');
			outline.classList.add('outline');
			path.removeAttribute('tabindex');
			overlay.appendChild(outline);
			return this;
		};
		this.removeOutline = function(){
			var e = svg.querySelector('.data-layer');
			if(e && overlay.querySelector('.outline')) overlay.querySelector('.outline').remove();
			return this;
		};
		_obj = this;
		var attr = {};
		if(typ == "hex-map" || typ == "svg-map"){
			attr.show = function(e){
				_obj.removeOutline();
				if(!e.classList.contains('marker')) _obj.addOutline(e);
			};
			attr.clear = function(e){
				_obj.removeOutline();
			};
		}
		if(typ == "hex-map") {
			attr.coord_attributes = ["data-q", "data-r"];
		}

		function arrow_move(e, _alltips){
			var directions = {
				"ArrowLeft": [-1,0],
				"ArrowRight": [1,0],
				"ArrowUp": [0,1],
				"ArrowDown": [0,-1]
			};

			var direction = directions[e.key];
			var dx = direction[0];
			var dy = direction[1];

			var idx = -1,t;

			// If a tip in this group is active we use that
			if(_alltips.active){
				for(t = 0; t < this.tips.length; t++){
					// Matched to an existing tip in this group
					if(_alltips.active==this.tips[t]) idx = t;
				}
			}

			// Find next hex
			idx = getHexWithTooltip.apply(this, [e, _alltips, idx, dx, dy]);

			while(!this.tips[idx].getTooltip()){
				// Keep trying until we find a hex with a tooltip
				idx = getHexWithTooltip.apply(this, [e, _alltips, idx, dx, dy]);
			}
			// Activate the tooltip
			if(idx >= 0 && idx < this.tips.length) _alltips.activate(this.tips[idx].el);
		}

		function getHexWithTooltip(e,_alltips,idx,dx,dy){
			if(e.shiftKey && this.tips[idx] && attr.coord_attributes !== undefined) {
				var tip = this.tips[idx];
				var x = tip.x + dx;
				var y = tip.y + dy;
				var closest = this.tips.map(function(t,i) {
					return {t, i, d: [(t.x - x), (t.y - y)]};
				}).filter(function(a) {
					return dx != 0 ? a.d[0]*dx >= 0 : a.d[1]*dy >= 0;
				})
				.sort(function(a,b) {
					var ax = a.d[0];
					var ay = a.d[1];
					var bx = b.d[0];
					var by = b.d[1];
					return dx != 0 ? (ay==by ? (ax-bx)*dx : Math.abs(ay)-Math.abs(by)) : (ax==bx ? (ay-by)*dy : Math.abs(ax) - Math.abs(bx));
				});
				if(closest.length > 0) idx = closest[0].i;
			}else{
				// Increment
				if(e.key == "ArrowLeft" || e.key == "ArrowUp") idx--;
				else if(e.key == "ArrowRight" || e.key == "ArrowDown") idx++;
			}

			// Limit range
			if(idx < 0) idx += this.tips.length;
			if(idx > this.tips.length-1) idx -= this.tips.length;
			return idx;
		}

		attr.keymap = {
			"ArrowLeft": arrow_move,
			"ArrowRight": arrow_move,
			"ArrowUp": arrow_move,
			"ArrowDown": arrow_move,
		}

		this._loadattempts = 0;
		this.addTooltips = function(){
			this._loadattempts++;
			if(typeof OI.Tooltips==="object"){
				var groups = el.querySelectorAll('.data-layer .series, .oi-map-inner .markers');
				// Add tooltip groups
				for(var g = 0; g < groups.length; g++) OI.Tooltips.addGroup(groups[g],'.area, .hex, .marker, .line',attr);
			}else{
				if(this._loadattempts < 5){
					setTimeout(this.addTooltips,500);
				}else{
					console.warn("Failed to load OI.Tooltips");
				}
			}
			
		};

		this.addTooltips();

		// Add description for keyboard navigation
		var desc = svg.querySelector(':scope > desc');
		if(desc) {
			desc.textContent += ' Use left and right arrow keys to move between cells. Hold shift and use arrow keys to move to adjacent cells.';
		}

		return this;
	}
	function addTooltips(){
		
	}

	root.OI.InteractiveSVGMap = function(el){ return new InteractiveSVGMap(el); };

})(window || this);

OI.ready(function(){
	var svgs = document.querySelectorAll('.oi-map.oi-map-svg .oi-map-inner, .oi-map.oi-map-hex .oi-map-inner');
	for(var i = 0; i < svgs.length; i++) OI.InteractiveSVGMap(svgs[i]);
});