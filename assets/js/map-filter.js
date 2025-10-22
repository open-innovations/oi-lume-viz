/*
	Open Innovations map filtering v0.2.2
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
	styles.innerHTML = ':root {--filter-padding: 0.25rem;}.oi-filter {position: relative; z-index:1010; min-height:2.5rem;} .oi-filter label {position:absolute;display:block;z-index: 1013;}.oi-filter .oi-filter-button{cursor:pointer;padding:var(--filter-padding);text-align:center;line-height:0em;margin:0;width:calc(2rem + var(--filter-padding)*2);height:calc(2rem + var(--filter-padding)*2);background:black;color:white;border:0;}.oi-filter input {display:none;line-height:2rem;font-size:1rem;border:solid var(--filter-padding) black;line-height:2rem;padding: 0 0 0 calc(2rem + var(--filter-padding)*2);position:relative;z-index: 1012;box-sizing:border-box;height:calc(2rem + var(--filter-padding)*2);}.oi-filter.searching input{display:inline-block;margin:0;}.oi-filter-results{display:none;position:absolute;z-index: 1010;list-style:none;margin:0;padding-left:0;width: 100%;}.oi-filter.searching .oi-filter-results{display:block;}.oi-filter-results li{padding:0.75em;background:#dfdfdf;text-decoration:none;display:block;cursor:pointer;margin:0;margin-left:calc(2rem + var(--filter-padding)*2);text-align:left;border:0;}.oi-filter-results li:focus {outline: 5px auto Highlight;outline:5px auto -webkit-focus-ring-color;}.oi-viz .data-layer > *{transition: opacity 0.2s ease-in;}.oi-viz .data-layer .not-selected{opacity: 0.1;}';
	document.head.prepend(styles);

	function FilterMap(id,p,opt,data){

		var el,areas,a,as,btn,inp,results,title,firstlabel = "",hexes = {},selected = null,pos = [];

		if(!opt) opt = {};
		if(!opt.position) opt.position = "top left";
		if(opt.position.match("top")) pos.push(".oi-top");
		if(opt.position.match("bottom")) pos.push(".oi-bottom");
		if(opt.position.match("left")) pos.push(".oi-left");
		if(opt.position.match("right")) pos.push(".oi-right");
		if(!opt.max) opt.max = 8;

		let viz = p.closest('.oi-viz');
		let pel = viz.querySelector(pos.join(""))||p;

		as = viz.querySelectorAll('.data-layer .hex, .data-layer .area');
		if(as.length == 0) return this;
		areas = new Array(as.length);

		// Convert node list into an array with pre-parsed properties
		for(a = 0; a < as.length; a++){
			areas[a] = {'el':as[a],'data':{}};
			areas[a].id = as[a].getAttribute('data-id');
			areas[a].data.value = as[a].getAttribute('data-value')||"";
			title = as[a].querySelector('title');
			hexes[areas[a].id] = as[a];
		}

		// Function for updating the data structure with new data
		this.updateData = function(d){
			data = d;

			// Convert node list into an array with pre-parsed properties
			for(a = 0; a < areas.length; a++){
				// Only update if the ID exist in the passed data
				if(areas[a].id in d){
					areas[a].data.title = (title ? title.innerHTML||title.innerText : "")||"";
					areas[a].data.label = (data && areas[a].id in data ? data[areas[a].id] : areas[a].data.title);//.replace(/<br.*/,""));
					areas[a].colour = areas[a].el.querySelector('path').getAttribute('fill');
					areas[a].textcolour = (OI.contrastColour ? OI.contrastColour(areas[a].colour) : (areas[a].el.querySelector('text')||areas[a].el.querySelector('path')).getAttribute('fill'));
				}
			}
			
			var filter = viz.querySelector('#oi-filter-'+id);
			firstlabel = Object.values(data)[0];
			if(filter) filter.setAttribute('placeholder',firstlabel);

			return this;
		};

		this.updateData(data);

		el = viz.querySelector('.oi-filter');
		firstlabel = Object.values(data)[0];

		// Remove any existing filter
		if(el) el.remove();

		el = document.createElement('div');
		el.setAttribute('data-id',id);
		el.classList.add('oi-filter');
		el.innerHTML = '<label for="oi-filter-'+id+'" aria-label="Filter areas"><button class="oi-filter-button" aria-label="Filter areas"><svg xmlns="https://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 12 13"><g stroke-width="2" stroke="white" fill="none"><path d="M11.29 11.71l-4-4"></path><circle cx="5" cy="5" r="4"></circle></g></svg></button></label><input type="text" name="oi-filter-'+id+'" id="oi-filter-'+id+'" value="" placeholder="e.g. '+firstlabel+'"><ul role="menu" class="oi-filter-results"></ul>';
		(opt.position.match("top") ? pel.prepend(el) : pel.append(el));

		btn = el.querySelector('.oi-filter-button');
		inp = el.querySelector('input');
		inp.setAttribute('size',Math.max(0,inp.getAttribute('placeholder').length-4));
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
			selected = null;
			if(value.length > 0){
				regions = {};
				for(var a = 0; a < areas.length; a++){
					id = areas[a].id;
					score = 0;
					if(typeof areas[a].data.label==="string"){
						if(areas[a].data.label.toLowerCase().indexOf(value.toLowerCase())==0) score += 1;
						if(areas[a].data.label.toLowerCase().indexOf(value.toLowerCase())>0) score += 0.5;
						tmp.push({'score':score,'id':id,'area':areas[a],'label':areas[a].data.label});
					}
					if(score > 0) regions[id] = true;
				}
				tmp = sortBy(sortBy(tmp,'label',true),'score');
			}
			for(var i = 0; i < Math.min(opt.max,tmp.length); i++){
				if(tmp[i].score > 0){
					li += '<li role="menuitem" data="'+tmp[i].id+'" style="background-color:'+tmp[i].area.colour+';color:'+tmp[i].area.textcolour+';" tabIndex="-1">'+tmp[i].area.data.label+'</li>';
				}
			}

			// Add list of options
			results.innerHTML = li;
			as = results.querySelectorAll('li');
			as.forEach(function(a){
				a.addEventListener('click',function(e){
					e.preventDefault();
					e.stopPropagation();
					r = a.getAttribute('data');
					inp.value = "";
					if(r in hexes) root.OI.Tooltips.activate(hexes[r]);
					// Remove the search results
					results.innerHTML = "";
					_obj.highlight();
					el.classList.toggle('searching');
				});
				a.addEventListener('keydown',function(e){
					e.preventDefault();
					e.stopPropagation();
				});
				a.addEventListener('keyup',function(e){
					if(e.key=="ArrowDown") navigateList(1);
					else if(e.key=="ArrowUp") navigateList(-1);
					else if(e.key=="Enter") a.click();
				})
			});
			this.highlight(regions);
			return this;
		}

		function navigateList(dir){
			if(typeof selected!=="number"){
				if(dir > 0) selected = -1;
				else selected = 0;
			}
			selected += dir;
			if(selected > as.length-1 || selected < 0){
				inp.focus();
				selected = null;
				results.style['z-index'] = 1010;
			}else{
				as[selected].focus();
				results.style['z-index'] = 1013;
			}
		}

		inp.addEventListener('keyup',function(e){
			e.preventDefault();
			if(e.key=="ArrowDown") navigateList(1);
			else if(e.key=="ArrowUp") navigateList(-1);
			else if(e.key=="Enter" && selected >= 0) as[selected].click();
			else _obj.search(e.target.value.toLowerCase());
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

	// Create a visible list of filters so that 
	// a filter can be updated later if necessary
	function List(){
		var arr = {};
		this.add = function(id,el,opt,data){
			if(id in arr){
				console.warn('This filter already exists.');
			}else{
				arr[id] = new FilterMap(id,el,opt,data);
			}
			return this;
		};
		this.get = function(id){
			if(id in arr) return arr[id];
			return arr;
		};
		return this;
	}

	root.OI.FilterMap = new List();

})(window || this);