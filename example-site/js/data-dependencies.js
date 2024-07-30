(function(root){

	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		root.OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}
	function appendElement(dependency){
		var el;
		// If the dependency contains .css
		if(dependency.indexOf(".css") > 0){
			// Create a new link element
			el = document.createElement('link');
			el.setAttribute('href',dependency);
			el.setAttribute('rel','stylesheet');
		}else{
			// Default action
			el = document.createElement('script');
			el.setAttribute('src',dependency);
		}
		el.setAttribute('data-auto-dependency','true');
		document.body.append(el);
		return el;
	}

	var dependencies = document.querySelectorAll("[data-dependencies]");
	var list = [];
	var arr,d,a,el;
	if(dependencies.length > 0){
		for(d = 0; d < dependencies.length; d++){
			arr = dependencies[d].getAttribute('data-dependencies').split(/,/);
			list = list.concat(arr);
		}
		list = Array.from(new Set(list));
		for(d = 0; d < list.length; d++) appendElement(list[d]);
	}
	
})(window || this);