/*
	Open Innovations SVG map Interactivity v0.1
	Helper function that find ".map.svg-map" or
	".map.hex-map" elements and adds tooltips to them.
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
		var svg,pt,p,_obj;

		svg = el.querySelector('svg');
		typ = svg.getAttribute('data-type');
		pt = svg.querySelectorAll('.data-layer path');
		
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
		this.removeOutline = function(){
			e = svg.querySelector('.data-layer');
			if(e.parentNode.querySelector('.outline')) e.parentNode.querySelector('.outline').remove();
			return this;
		};
		_obj = this;
		for(p = 0; p < pt.length; p++){
			attr = {};
			if(typ == "hex-map"){
				attr.show = function(e){
					console.log('show',this,e);
					_obj.removeOutline();
					_obj.addOutline(e.parentNode);
				}
				console.log('hex map addition',attr);
			}
			OI.Tooltips.add(pt[p],attr);
		}

		return this;
	}

	root.OI.InteractiveSVGMap = function(el){ return new InteractiveSVGMap(el); };

})(window || this);

OI.ready(function(){
	var svgs = document.querySelectorAll('.map.svg-map, .map.hex-map');
	for(var i = 0; i < svgs.length; i++) OI.InteractiveSVGMap(svgs[i]);
});