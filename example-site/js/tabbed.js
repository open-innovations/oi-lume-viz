/*
	Open Innovations Tabbed Interface v0.3
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
	var panelgroup = 0;
	var idcontroller = {};
	function TabbedInterface(el,opt){
		var tabs,panes,li,p,h,b,l;
		panelgroup++;
		if(!opt) opt = {};
		var scrollOffset = (opt.header) ? opt.header.offsetHeight + 4 : 0;
		//var scrolloffset = document.getElementById('site-header').offsetHeight + 4;
		this.selectTab = function(t,focusIt){
			var tab,pane;
			tab = tabs[t].tab;
			pane = tabs[t].pane;

			// Remove existing selection and set all tabindex values to -1
			tab.parentNode.querySelectorAll('button').forEach(function(el){ el.removeAttribute('aria-selected'); el.setAttribute('tabindex',-1); });

			// Update the selected tab
			tab.setAttribute('aria-selected','true');
			tab.setAttribute('tabindex',0);
			if(focusIt) tab.focus();

			pane.closest('.panes').querySelectorAll('.pane').forEach(function(el){ el.style.display = "none"; el.setAttribute('hidden',true); });
			pane.style.display = "";
			pane.removeAttribute('hidden');
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
		this.enableTab = function(tab,t,g){
			var _obj = this;

			// Set the tabindex of the tab panel
			panes[t].setAttribute('tabindex',0);
			var id,pid;

			if(panes[t].hasAttribute('id')){
				// Move the ID to the tab rather than the pane
				id = panes[t].getAttribute('id');
				tab.style.scrollMarginTop = scrollOffset + 'px';
				idcontroller[id] = {'interface':this,'tab':t};
				// Set the pane to a new ID
				pid += '-pane';
			}else{
				id = 'panels-'+g+'-pane-'+t+'-control';
				pid = 'panels-'+g+'-pane-'+t;
			}
			tab.setAttribute('id',id);
			panes[t].setAttribute('id',pid);
			panes[t].setAttribute('role','tabpanel');
			panes[t].setAttribute('aria-labelledby',id);
			tab.setAttribute('aria-controls',id);
			
			// Add a click/focus event
			tab.addEventListener('click',function(e){ e.preventDefault(); var t = parseInt((e.target.tagName.toUpperCase()==="BUTTON" ? e.target : e.target.closest('button')).getAttribute('data-tab')); _obj.selectTab(t,true); });
			tab.addEventListener('focus',function(e){ e.preventDefault(); var t = parseInt(e.target.getAttribute('data-tab')); _obj.selectTab(t,true); });

			// Store the tab number in the tab (for use in the keydown event)
			tab.setAttribute('data-tab',t);

			// Add keyboard navigation to arrow keys following https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Tab_Role
			tab.addEventListener('keydown',function(e){

				// Get the tab number from the attribute we set
				t = parseInt(e.target.getAttribute('data-tab'));

				if(e.keyCode === 39 || e.keyCode === 40){
					e.preventDefault();
					// Move right or down
					t++;
					if(t >= tabs.length) t = 0;
					_obj.selectTab(t,true);
				}else if(e.keyCode === 37 || e.keyCode === 38){
					e.preventDefault();
					// Move left or up
					t--;
					if(t < 0) t = tabs.length-1;
					_obj.selectTab(t,true);
				}
			});
		};
		tabs = [];

		l = document.createElement('div');
		l.classList.add('grid','tabs');
		l.setAttribute('role','tablist');
		l.setAttribute('aria-label',(el.getAttribute('data-title')||'Panels'));
		panes = el.querySelectorAll('.pane');
		for(p = 0; p < panes.length; p++){
			h = panes[p].querySelector('.tab-title');
			b = document.createElement('button');
			b.classList.add('tab');
			b.setAttribute('role','tab');
			if(h) b.appendChild(h);
			l.appendChild(b);
			tabs[p] = {'tab':b,'pane':panes[p]};
			this.enableTab(b,p,panelgroup);
		}
		el.insertAdjacentElement('beforebegin', l);
		this.selectTab(0);

		return this;
	}
	root.OI.TabbedInterface = function(el,opt){ return new TabbedInterface(el,opt); };

	// Find any remaining `pane` on the page with an ID set
	root.OI.UpdateIDs = function(header){
		var ids = document.querySelectorAll('.pane[id]');
		var scrolloffset = (header ? header.offsetHeight + 4 : 0);
		for(var i = 0; i < ids.length; i++){
			var id = ids[i].getAttribute('id');
			if(!idcontroller[id]){
				idcontroller[id] = {};
				ids[i].style.scrollMarginTop = scrolloffset + 'px';
			}
		}
	}

	// Need to intercept and process initial hash and any changes
	// addEventListener('popstate',function(e){ OI.Anchor(e); });
	root.OI.Anchor = function(a){
		if(typeof idcontroller[a]==="function"){
			console.log('processAnchor',a,idcontroller[a]);
			if(idcontroller[a].interface) idcontroller[a].interface.selectTab(idcontroller[a].tab);
		}
		if(idcontroller[a]) location.hash = '#'+a;
	}

})(window || this);

OI.ready(function(){
	var tabbed = document.querySelectorAll('.panes.tabbed');
	var header = document.getElementById('site-header');
	for(var i = 0; i < tabbed.length; i++) OI.TabbedInterface(tabbed[i],{header:header});

	OI.UpdateIDs(header);

	// Now that we've updated our IDs/scroll-offsets we can process the location hash to trigger the correct tab
	OI.Anchor(location.hash.substr(1,));
});