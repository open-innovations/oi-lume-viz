/*
	Open Innovations map filtering v0.2.1
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

	var styles = document.createElement('style');
	styles.innerHTML = ':root {--filter-padding: 0.25em;}.oi-filter {position: absolute; top: 0;left:0;z-index:1000;}.oi-filter label {position:absolute;display:block;}.oi-filter .oi-filter-button{cursor:pointer;padding:var(--filter-padding);text-align:center;line-height:0em;margin:0;width:calc(2em + var(--filter-padding)*2);height:calc(2em + var(--filter-padding)*2);background:black;color:white;}.oi-filter input {display:none;line-height:2em;font-size:1em;border:solid var(--filter-padding) black;line-height:2em;padding:0 0 0 calc(2em + var(--filter-padding)*2);}.oi-filter.searching input{display:inline-block;}.oi-filter-results{display:none;list-style:none;margin:0;}.oi-filter.searching .oi-filter-results{display:block;}.oi-filter-results li > *{padding:0.5em 1em;background:#dfdfdf;text-decoration:none;display:block;}.oi-filter-results li > *:visited{color:inherit;}.oi-viz .data-layer > *{transition: opacity 0.2s ease-in;}.oi-viz .data-layer .not-selected{opacity: 0.1;}.oi-filter-results button {width:100%;margin:0;text-align:left;}';
	document.head.prepend(styles);

	function FilterMap(p,opt,data){

		var el,areas,a,as,btn,inp,results,title,firstlabel = "",hexes = {};
		var id = "filter-" + Math.random().toString(16).slice(2);

		if(!opt) opt = {};
		if(!opt.max) opt.max = 8;

		as = p.querySelectorAll('.data-layer .hex, .data-layer .area');
		if(as.length == 0) return this;
		areas = new Array(as.length);

		// Convert node list into an array with pre-parsed properties
		for(a = 0; a < as.length; a++){
			areas[a] = {'el':as[a],'data':{}};
			areas[a].id = as[a].getAttribute('data-id');
			areas[a].data.value = as[a].getAttribute('data-value')||"";
			title = as[a].querySelector('title');
			areas[a].data.title = (title ? title.innerHTML||title.innerText : "")||"";
			areas[a].data.label = (data && data[areas[a].id] ? data[areas[a].id] : areas[a].data.title);//.replace(/<br.*/,""));
			areas[a].colour = areas[a].el.querySelector('path').getAttribute('fill');
			areas[a].textcolour = (OI.Colour ? OI.Colour(areas[a].colour).contrast : (areas[a].el.querySelector('text')||areas[a].el.querySelector('path')).getAttribute('fill'));
			hexes[areas[a].id] = as[a];
		}
		el = p.querySelector('.oi-filter');
		firstlabel = Object.values(data)[0];

		if(!el){
			el = document.createElement('div');
			el.classList.add('oi-filter');
			el.innerHTML = '<label for="oi-'+id+'" aria-label="Filter areas"><button class="oi-filter-button" aria-label="Filter areas"><svg xmlns="https://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 12 13"><g stroke-width="2" stroke="white" fill="none"><path d="M11.29 11.71l-4-4"></path><circle cx="5" cy="5" r="4"></circle></g></svg></button></label><input type="text" name="oi-'+id+'" id="oi-'+id+'" value="" placeholder="e.g. '+firstlabel+'"><ul class="oi-filter-results"></ul>';
			p.prepend(el);
		}
		btn = el.querySelector('.oi-filter-button');
		inp = el.querySelector('input');
		btn.addEventListener('click',function(e){
			el.classList.toggle('searching');
			if(el.classList.contains('searching')) inp.focus();
		});
		results = el.querySelector('.oi-filter-results');

		var _obj = this;
		
		this.search = function(value){
			var regions;
			var li = "";
			var n = 0;
			var v,nm,a,id;
			var tmp = [];
			if(value.length > 0){
				regions = {};
				for(var a = 0; a < areas.length; a++){
					id = areas[a].id;
					score = 0;
					if(areas[a].data.label.toLowerCase().indexOf(value.toLowerCase())==0) score += 1;
					if(areas[a].data.label.toLowerCase().indexOf(value.toLowerCase())>0) score += 0.5;
					tmp.push({'score':score,'id':id,'area':areas[a],'label':areas[a].data.label});
					if(score > 0) regions[id] = true;
				}
				tmp = sortBy(sortBy(tmp,'label',true),'score');
			}
			for(var i = 0; i < Math.min(opt.max,tmp.length); i++){
				if(tmp[i].score > 0){
					li += '<li><button data="'+tmp[i].id+'" style="background-color:'+tmp[i].area.colour+';color:'+tmp[i].area.textcolour+';">'+tmp[i].area.data.label+'</button></li>';
				}
			}

			// Add list of options
			results.innerHTML = li;
			as = results.querySelectorAll('li > *');
			as.forEach(function(a){
				a.addEventListener('click',function(e){
					e.preventDefault();
					e.stopPropagation();
					r = a.getAttribute('data');
					inp.value = "";
					if(r in hexes){
						var path = hexes[r].querySelector('path');
						if(path) trigger(path,'click');
					}
					// Remove the search results
					results.innerHTML = "";
					_obj.highlight();
					el.classList.toggle('searching');
				});
			});
			this.highlight(regions);
			return this;
		}
		inp.addEventListener('keyup',function(e){
			_obj.search(e.target.value.toLowerCase());
		});
		
		this.highlight = function(regions){
			if(typeof regions==="undefined"){
				var regions = {};
				for(var a = 0; a < areas.length; a++) regions[areas[a].id] = true;
			}
			for(var a = 0; a < areas.length; a++){
				if(regions[areas[a].id]) areas[a].el.classList.remove('not-selected');
				else areas[a].el.classList.add('not-selected');
			}
			return this;
		};

		return this;
	}

	// Sort the data
	function sortBy(arr,i,reverse){
		return arr.sort(function (a, b) {
			return (reverse ? -1 : 1)*(a[i] < b[i] ? 1 : -1);
		});
	}

	function trigger(el, eventType) {
		if (typeof eventType === 'string' && typeof el[eventType] === 'function') {
			el[eventType]();
		} else {
			const event =
				typeof eventType === 'string'
					? new Event(eventType, {bubbles: true})
					: eventType;
			el.dispatchEvent(event);
		}
	}
	root.OI.FilterMap = function(opt,data){
		var p = document.currentScript.parentNode;
		return new FilterMap(p,opt,data);
	};

})(window || this);