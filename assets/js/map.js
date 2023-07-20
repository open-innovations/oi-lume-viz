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
		var svg,pt,p,_obj,typ;

		if(el.tagName.toLowerCase()=="svg"){
			// Used for markers
			svg = el;
			el = svg.parentNode;
			typ = "svg-map";
			pt = [svg.querySelector(':first-child')];
		}else{
			svg = el.querySelector('svg');
			typ = svg.getAttribute('data-type');
			pt = svg.querySelectorAll('.data-layer path');
		}

		this.addOutline = function(e){
			// Create an outline version of the hex that sits on top
			var outline = e.cloneNode(true);
			if(outline.querySelector('text')) outline.querySelector('text').remove();
			if(outline.querySelector('title')) outline.querySelector('title').remove();
			outline.querySelector('path').setAttribute('fill','none');
			outline.querySelector('path').setAttribute('vector-effect','non-scaling-stroke');
			outline.removeAttribute('id');
			outline.classList.add('outline');
			outline.querySelector('path').removeAttribute('tabindex');
			e.parentNode.appendChild(outline);
			return this;
		};
		this.removeOutline = function(){
			e = svg.querySelector('.data-layer');
			if(e && e.parentNode.querySelector('.outline')) e.parentNode.querySelector('.outline').remove();
			return this;
		};
		_obj = this;
		for(p = 0; p < pt.length; p++){
			attr = {};
			if(typ == "hex-map" || typ == "svg-map"){
				attr.show = function(e){
					_obj.removeOutline();
					_obj.addOutline(e.parentNode);
				}
			}
			OI.Tooltips.add(pt[p],attr);
		}
		el.addEventListener('mouseleave',function(){
			_obj.removeOutline();
		})

		return this;
	}

	root.OI.InteractiveSVGMap = function(el){ return new InteractiveSVGMap(el); };

})(window || this);

OI.ready(function(){
	var svgs = document.querySelectorAll('.oi-map.oi-map-svg .oi-map-inner, .oi-map.oi-map-hex .oi-map-inner, svg.marker');
	for(var i = 0; i < svgs.length; i++) OI.InteractiveSVGMap(svgs[i]);
});