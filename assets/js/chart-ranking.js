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
	
	function InteractiveRankingChart(el){

		var series = el.querySelectorAll('g.series');
		var selected = -1;
		var locked = false;
		var seriespoints = [];
		var svg = el.querySelector('svg');
		var vb = svg.getAttribute('viewBox').split(" ");
		for(var i = 0;i < vb.length; i++) vb[i] = parseFloat(vb[i]);
		vb = {'x':vb[0],'y':vb[1],'w':vb[2],'h':vb[3]};
		var bb = svg.getBoundingClientRect();
		var xmin = parseFloat(series[0].querySelector('text').getAttribute('x'));
		var near = 20;
	
		function nearestLine(e){
			var d,min,idx,pt,s;
			idx = -1;
			min = Infinity;
			if(e.layerX >= xmin){
				pt = {'x':vb.w*e.layerX/bb.width,'y':vb.h*e.layerY/bb.height};
				for(s = 0; s < seriespoints.length; s++){
					if(seriespoints[s]){
						d = seriespoints[s].getDistanceFromPoint(pt);
						if(d < min){
							min = d;
							idx = s;
						}
					}
				}
			}
			return {'i':(min < near ? idx : -1),'dist':min};
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
			if(selected < 0){
				var l = nearestLine(e);
				if(l.i >= 0) selectLine(l.i);
			}else{
				// Turn off the line
				selectLine(selected);
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
	function SeriesLine(series){
		var len,i,p,path,bit,prevbit,len2;
		path = series.querySelector('path');
		svg = series.parentNode;
		len = path.getTotalLength();
		var segments = 50;
		this.points = [];
		for(i = 0; i <= segments; i++){
			bit = path.getPointAtLength(i*len/segments);
			this.points.push(bit);
		}
		this.getDistanceFromPoint = function(o){
			var d = Infinity;
			for(var i = 0; i < this.points.length-1; i++) d = Math.min(d,pDistance(o,this.points[i],this.points[i+1]));
			return d;
		};
		function pDistance(p0, p1, p2){
			var C,D,dot,len_sq,param,xx,xy,dx,dy;
			C = p2.x - p1.x;
			D = p2.y - p1.y;
			dot = (p0.x - p1.x) * C + (p0.y - p1.y) * D;
			len_sq = C * C + D * D;
			param = -1;
			if(len_sq != 0) //in case of 0 length line
				param = dot / len_sq;
			if(param < 0){
				xx = p1.x;
				yy = p1.y;
			}else if(param > 1){
				xx = p2.x;
				yy = p2.y;
			}else{
				xx = p1.x + param * C;
				yy = p1.y + param * D;
			}

			dx = p0.x - xx;
			dy = p0.y - yy;
			return Math.sqrt(dx * dx + dy * dy);
		}

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