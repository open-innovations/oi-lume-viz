/*
	Open Innovations Ranking Chart Interactivity v0.1
	Helper function that find ".oi-ranking" elements 
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

		function enableSeries(i,el){
			el.setAttribute('tabindex',0);
			el.addEventListener('mouseover',function(e){ focusLine(i); });
			el.addEventListener('mouseleave',function(e){ resetLines(i); });
			el.addEventListener('focus',function(e){ focusLine(i); });
			el.addEventListener('blur',function(e){ resetLines(i); });
		}
		function focusLine(i){
			for(var s = 0; s < series.length; s++){
				series[s].style = (i==s) ? '' : 'filter:grayscale(100%);opacity:0.1;transition: 0.2s ease-in opacity;';
			}
		}
		function resetLines(){
			for(var s = 0; s < series.length; s++){
				series[s].style = 'transition: 0.2s ease-in opacity;';
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
	var charts = document.querySelectorAll('.oi-ranking');
	for(var i = 0; i < charts.length; i++){
		OI.InteractiveRankingChart(charts[i]);
	}
});