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

		function enableSeries(i,el){
			el.setAttribute('tabindex',0);
			el.addEventListener('mouseover',function(e){ focusLine(i); });
			el.addEventListener('click',function(e){ selectLine(i); });
			el.addEventListener('keydown',function(e){ if(e.keyCode==13){ selectLine(i); } });
			el.addEventListener('mouseleave',function(e){ resetLines(i); });
			el.addEventListener('focus',function(e){ focusLine(i); });
			el.addEventListener('blur',function(e){ resetLines(i); });
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