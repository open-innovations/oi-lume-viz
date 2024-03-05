/*
	Open Innovations Ranking Chart Interactivity v0.1
	Helper function that find ".oi-chart-ranking" elements 
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
	
	function getAbsoluteBBox(el){
		var bb = el.getBoundingClientRect();
		bb = {'left':bb.left + window.scrollX,'top':bb.top + window.scrollY,'bottom':bb.bottom + window.scrollY,'right':bb.right + window.scrollX};
		bb.width = bb.right-bb.left;
		bb.height = bb.bottom-bb.top;
		return bb;
	}
	
	function InteractiveRankingChart(el){

		var series = el.querySelectorAll('g.series');
		var selected = -1;
		var locked = false;
		var seriespoints = [];
		var svg = el.querySelector('svg');
		var vb = svg.getAttribute('viewBox').split(" ");
		for(var i = 0;i < vb.length; i++) vb[i] = parseFloat(vb[i]);
		vb = {'x':vb[0],'y':vb[1],'w':vb[2],'h':vb[3]};
		var bb = getAbsoluteBBox(svg);
		var xmin = parseFloat(series[0].querySelector('text').getAttribute('x'));
		var near = 20;

		function nearestLine(e){
			var d,dist,idx,p,pt,s,bbox,match;
			idx = -1;
			dist = Infinity;
			if(e.layerX >= xmin){
				p = {'x':vb.w*(e.clientX+window.scrollX - bb.left)/bb.width,'y':vb.h*(e.clientY+window.scrollY - bb.top)/bb.height};
				pt = {'x':e.clientX + window.scrollX,'y':e.clientY + window.scrollY};
				for(s = 0; s < seriespoints.length; s++){
					if(seriespoints[s]){
						bbox = seriespoints[s].bbox;
						if(pt.y > bbox.top - near && pt.y < bbox.bottom + near){
							d = seriespoints[s].getDistanceFromPoint(p);
							if(d < dist){
								dist = d;
								idx = s;
							}
						}
					}
				}
			}
			return {'i':(dist < near ? idx : -1),'dist':dist};
		}

		// Listen for mousemove on main canvas
		svg.addEventListener('mousemove',function(e){
			var l = nearestLine(e);
			if(l.dist < Infinity){
				if(selected < 0){
					if(l.i >= 0) focusLine(l.i);
					else resetLines();
				}
			}
		});
		// Listen for click on main canvas
		svg.addEventListener('click',function(e){
			var l = nearestLine(e);
			if(l.dist < Infinity){
				if(selected < 0){
					if(l.i >= 0) selectLine(l.i);
				}else selectLine(selected);	// Turn off the line
			}
		});

		function enableSeries(i,el){
			el.setAttribute('tabindex',0);
			el.addEventListener('keydown',function(e){ if(e.keyCode==13){ selectLine(i); } });
			el.addEventListener('focus',function(e){ focusLine(i); });
			el.addEventListener('blur',function(e){ resetLines(); });
			// Add events to series label
			var lbl = el.querySelector('text');
			lbl.addEventListener('click',function(e){ selectLine(i); });
			lbl.addEventListener('mouseover',function(e){ focusLine(i); });
			lbl.addEventListener('mouseleave',function(e){ resetLines(); });
			seriespoints[i] = new SeriesLine(el);
		}
		function selectLine(i){
			if(selected==i){
				// If it is the currently selected line we deselect everything
				selected = -1;
				locked = false;
				resetLines(i);
			}else{
				locked = false;
				// Otherwise
				focusLine(i);
				selected = i;
				locked = true;
			}
		}
		function focusLine(i){
			if(locked) return;
			for(var s = 0; s < series.length; s++){
				series[s].style = (i==s) ? 'cursor:pointer;' : 'filter:grayscale(100%);opacity:0.1;transition: 0.2s ease-in opacity;cursor:pointer;';
			}
		}
		function resetLines(){
			if(locked) return;
			for(var s = 0; s < series.length; s++){
				series[s].style = 'transition: 0.2s ease-in opacity;cursor:pointer;';
			}
		}
		for(var s = 0; s < series.length; s++) enableSeries(s,series[s]);

		return this;
	}
	function sqr(x) { return x * x }
	function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
	function distToSegmentSquared(p, v, w) {
		var l2 = dist2(v, w);
		if (l2 == 0) return dist2(p, v);
		var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
		t = Math.max(0, Math.min(1, t));
		return dist2(p, { x: v.x + t * (w.x - v.x),
					y: v.y + t * (w.y - v.y) });
	}
	function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

	function SeriesLine(series){
		var len,i,path,bit,svg,pt;
		path = series.querySelector('path');
		svg = series.parentNode;
		len = path.getTotalLength();
		var segments = 30;
		this.points = [];
		this.bbox = getAbsoluteBBox(path);
		this.series = series;
		for(i = 0; i <= segments; i++){
			bit = path.getPointAtLength(i*len/segments);
			this.points.push(bit);
		}
		this.getDistanceFromPoint = function(o){
			var d = Infinity;
			for(var i = 0; i < this.points.length-1; i++) d = Math.min(d,distToSegment(o,this.points[i],this.points[i+1]));
			return d;
		};

		return this;
	}
	root.OI.InteractiveRankingChart = function(el){ return new InteractiveRankingChart(el); };

	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}
})(window || this);

OI.ready(function(){
	var charts = document.querySelectorAll('.oi-chart-ranking');
	for(var i = 0; i < charts.length; i++){
		OI.InteractiveRankingChart(charts[i]);
	}
});