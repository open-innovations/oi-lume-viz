/*
	Open Innovations map Interactivity v0.2
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
			outline.querySelector('path').setAttribute('fill','none');
			outline.querySelector('path').setAttribute('vector-effect','non-scaling-stroke');
			outline.removeAttribute('id');
			outline.classList.add('outline');
			outline.querySelector('path').removeAttribute('tabindex');
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

		var groups = el.querySelectorAll('.data-layer .series, .oi-map-inner .markers');
		// Add tooltip groups
		for(var g = 0; g < groups.length; g++){
			OI.Tooltips.addGroup(groups[g],'.area, .hex, .marker, .line',attr);
		}

		// Add description for keyboard navigation
		svg.querySelector(':scope > desc').textContent += ' Use left and right arrow keys to move between cells. Hold shift and use arrow keys to move to adjacent cells.';

		return this;
	}

	root.OI.InteractiveSVGMap = function(el){ return new InteractiveSVGMap(el); };

})(window || this);

OI.ready(function(){
	var svgs = document.querySelectorAll('.oi-map.oi-map-svg .oi-map-inner, .oi-map.oi-map-hex .oi-map-inner');
	for(var i = 0; i < svgs.length; i++) OI.InteractiveSVGMap(svgs[i]);
});