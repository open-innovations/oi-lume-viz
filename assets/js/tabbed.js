/*
	Open Innovations Tabbed Interface v0.1
	Helper function that find elements with the class "panes",
	looks for elements with "pane" within them,
	finds their <h3> elements, 
	then builds a simple tabbed interface.
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
	function TabbedInterface(el){
		var tabs,panes,li,p,h,a,ul;
		this.selectTab = function(t){
			var tab,pane;
			tab = tabs[t].tab;
			pane = tabs[t].pane;
			tab.closest('ul').querySelectorAll('li a').forEach(function(el){ el.classList.remove('active'); });
			tab.classList.add('active');
			pane.closest('.panes').querySelectorAll('.pane').forEach(function(el){ el.style.display = "none"; });
			pane.style.display = "";
			// Loop over any potentially visible leaflet maps that haven't been sized and set the bounds
			if(OI.maps){
				for(var m = 0; m < OI.maps.length; m++){
					if(OI.maps[m].map._container==pane.querySelector('.leaflet')){
						OI.maps[m].map.invalidateSize(true);
						if(!OI.maps[m].set){
							if(OI.maps[m].bounds) OI.maps[m].map.fitBounds(OI.maps[m].bounds);
							OI.maps[m].set = true;
						}
					}
				}
			}
			return this;
		};
		this.enableTab = function(tab,t){
			var _obj = this;
			tab.addEventListener('click',function(e){ e.preventDefault(); _obj.selectTab(t); });
		};
		tabs = [];

		ul = document.createElement('ul');
		ul.classList.add('grid','tabs');
		ul.setAttribute('role','tablist');
		panes = el.querySelectorAll('.pane');
		for(p = 0; p < panes.length; p++){
			h = panes[p].querySelector('.tab-title');
			li = document.createElement('li');
			li.setAttribute('role','presentation');
			a = document.createElement('a');
			a.classList.add('tab');
			a.setAttribute('role','tab');
			a.setAttribute('href','#');
			if(h) a.appendChild(h);
			li.appendChild(a);
			ul.appendChild(li);
			tabs[p] = {'tab':a,'pane':panes[p]};
			this.enableTab(a,p);
		}
		el.insertAdjacentElement('beforebegin', ul);
		this.selectTab(0);
		return this;
	}
	root.OI.TabbedInterface = function(el){ return new TabbedInterface(el); };

})(window || this);

OI.ready(function(){
	var tabbed = document.querySelectorAll('.panes.tabbed');
	for(var i = 0; i < tabbed.length; i++) OI.TabbedInterface(tabbed[i]);
});