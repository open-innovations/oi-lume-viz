/*
	Open Innovations Calendar Chart
	Helper function that finds ".calendar-chart rect" and adds tooltips to them.
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
})(window || this);

OI.ready(function(){
	var days = document.querySelectorAll('.oi-calendar-chart rect.in-year.has-value');
	for(var i = 0; i < days.length; i++) OI.Tooltips.add(days[i],{});
});