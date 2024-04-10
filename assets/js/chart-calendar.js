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
	var years,days,y,d,i;
	years = document.querySelectorAll('.oi-calendar-chart .year[role=row]');
	for(y = 0; y < years.length; y++){
		days = years[y].querySelectorAll('rect.in-year.has-value');
		OI.Tooltips.addGroup(years[y],days,{});
	}
});