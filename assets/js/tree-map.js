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

	OI.ready(function(){
		var i,p,pts;
		var svgs = document.querySelectorAll('.tree-map');
		for(i = 0; i < svgs.length; i++){
			pts = svgs[i].querySelectorAll('rect');
			for(p = 0; p < pts.length; p++){
				OI.Tooltips.add(pts[p],{'hover-element':pts[p].nextElementSibling})
			}
		}
	});
})(window || this);
