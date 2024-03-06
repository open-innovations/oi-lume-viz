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

		var bb,i,vb,svg,near,xmin;
		var series = el.querySelectorAll('g.series');
		var selected = -1;
		var locked = false;
		var seriespoints = [];
		svg = el.querySelector('svg');
		vb = svg.getAttribute('viewBox').split(" ");
		for(i = 0;i < vb.length; i++) vb[i] = parseFloat(vb[i]);
		vb = {'x':vb[0],'y':vb[1],'w':vb[2],'h':vb[3]};
		xmin = parseFloat(series[0].querySelector('text').getAttribute('x'));
		near = 20;

		function nearestLine(e){
			var x,y,d,dist,idx,p,pt,s,bbox,n;
			idx = -1;
			n = 1;
			dist = Infinity;
			// Just getting it initially isn't reliable given page layout shifts
			bb = getAbsoluteBBox(svg);
			if(e.layerX >= xmin){
				x = e.clientX + window.scrollX - bb.left;
				y = e.clientY + window.scrollY - bb.top;
				// Get the position within the SVG coordinate system - to compare against path segments
				p = {'x':vb.w*(x)/bb.width,'y':vb.h*(y)/bb.height};
				// The position relative to the document - as a quick check based on bounding box
				pt = {'x':x + bb.left,'y':y + bb.top};
				for(s = 0; s < seriespoints.length; s++){
					if(seriespoints[s]){
						bbox = getAbsoluteBBox(seriespoints[s].path);
						if(pt.y > bbox.top - near && pt.y < bbox.bottom + near){
							d = seriespoints[s].getDistanceFromPoint(p);
							if(d < dist){
								dist = d;
								idx = s;
							}
						}
					}
				}
				// Trigger a tooltip
				if(!locked && dist < near && idx >= 0){
					// Find the nearest ranking indicator
					n = Math.round((seriespoints[idx].ranks.length-1)*(x-xmin)/(bb.width-xmin));
				}
			}
			return {'i':(dist < near ? idx : -1),'dist':dist,'n':n};
		}

		// Listen for mousemove on main canvas
		svg.addEventListener('mousemove',function(e){
			var l = nearestLine(e);
			if(l.dist < Infinity){
				if(selected < 0){
					if(l.i >= 0) focusLine(l.i,l.n);
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

		// When the mouse leaves the SVG
		svg.addEventListener('mouseleave',function(e){ resetLines(); });

		function enableSeries(i,el){
			el.setAttribute('tabindex',0);
			seriespoints[i] = new SeriesLine(el);
			// Detect events for this specific series
			el.addEventListener('keydown',function(e){ if(e.keyCode==13){ selectLine(i); } });
			el.addEventListener('focus',function(e){ focusLine(i); });
			el.addEventListener('blur',function(e){ resetLines(); });
			// Add events to series label
			var lbl = el.querySelector('text');
			lbl.addEventListener('click',function(e){ selectLine(i); });
			lbl.addEventListener('mouseover',function(e){ focusLine(i); });
			lbl.addEventListener('mouseleave',function(e){ resetLines(); });
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
		function focusLine(i,n){
			if(locked) return;

			for(var s = 0; s < series.length; s++){
				series[s].style = (i==s) ? 'cursor:pointer;' : 'filter:grayscale(100%);opacity:0.1;transition: 0.2s ease-in opacity;cursor:pointer;';
			}
			// If no n provided we'll default to the 2nd rank marker
			if(typeof n!=="number") n = 1;
			// Limit to an allowed index
			if(n >= 0 && n < seriespoints[i].ranks.length){
				// Show the tooltip
				seriespoints[i].ranks[n].tooltip.show();
			}

		}
		function resetLines(){
			if(locked) return;
			for(var s = 0; s < series.length; s++){
				series[s].style = 'transition: 0.2s ease-in opacity;cursor:pointer;';
			}
			OI.Tooltips.clear();
		}
		for(var s = 0; s < series.length; s++) enableSeries(s,series[s]);

		return this;
	}
	function sqr(x) { return x * x; }
	function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }
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
		var len,i,path,bit,svg,ranks,txt,tooltip;
		path = series.querySelector('path');
		svg = series.parentNode;
		len = path.getTotalLength();
		ranks = series.querySelectorAll('.marker');
		tooltip = series.querySelector('title').innerHTML;
		var segments = 30;
		this.points = [];
		this.path = path;
		this.series = series;
		this.ranks = [];
		for(i = 0; i <= segments; i++){
			bit = path.getPointAtLength(i*len/segments);
			this.points.push(bit);
		}
		for(i = 0; i < ranks.length; i++){
			// Add the tooltip text
			txt = document.createElementNS('http://www.w3.org/2000/svg','text');
			console.log(tooltip);
			txt.innerHTML = tooltip;
			ranks[i].appendChild(txt);
			// Keep some properties for this rank indicator
			this.ranks[i] = {
				'el': ranks[i],
				'text': tooltip,
				'tooltip': OI.Tooltips.add(ranks[i])
			};
		}
		this.getDistanceFromPoint = function(o){
			var d = Infinity;
			var dist;
			for(var i = 0; i < this.points.length-1; i++){
				dist = distToSegment(o,this.points[i],this.points[i+1]);
				d = Math.min(d,dist);
			}
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