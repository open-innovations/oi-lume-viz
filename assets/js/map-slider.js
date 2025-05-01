/*
	Open Innovations map slider v0.1
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
	styles.innerHTML = '.oi-search {}';
	document.head.prepend(styles);

	function SliderMap(p,opt){

		var viz,pel,pos,el,a,as,hexes = {},range,label,id,areas,cs,key,i,uid,previousvalue;
		viz = p.closest('.oi-viz');

		cs = OI.ColourScale(opt.colours.scale);
		key = opt.value;

		pos = [];
		if(!opt.position) opt.position = "bottom";
		if(opt.position.match("top")) pos.push(".oi-top");
		if(opt.position.match("left")) pos.push(".oi-left");
		if(opt.position.match("right")) pos.push(".oi-right");
		if(opt.position.match("bottom")) pos.push(".oi-bottom");
		pel = viz.querySelector(pos.join(" "))||p;

		if(!opt.data && opt.fields && opt.compresseddata){
			opt.data = {};
			for(id in opt.compresseddata){
				opt.data[id] = {};
				for(i = 0; i < opt.fields.length; i++){
					opt.data[id][opt.fields[i]] = opt.compresseddata[id][i];
				}
			}
		}
		uid = p.querySelector('svg.oi-map-map').getAttribute('id');
		as = p.querySelectorAll('.data-layer .hex,.data-layer .area');

		areas = new Array(as.length);
		// Convert node list into an array with pre-parsed properties
		for(a = 0; a < as.length; a++){
			id = as[a].getAttribute('data-id');
			hexes[id] = {
				'el':as[a],
				'data':opt.data[id]||{},
				'label':as[a].querySelector('text')||'',
				'path':as[a].querySelector('path')
			};
			hexes[id].title = hexes[id].path.querySelector('title');
		}
		el = p.querySelector('.oi-slider');
		range = p.querySelector('.oi-slider-control');
		label = p.querySelector('.oi-slider-value');

		var _obj = this;
		// The default slider position is the last column
		var idx = opt.columns.length-1;
		// Work out which numbered column we are in
		for(i = 0; i < opt.columns.length; i++){
			if(typeof opt.columns[i]==="string") opt.columns[i] = {'value':opt.columns[i],'label':opt.columns[i]};
			if(opt.columns[i].value==opt.value) idx = i;
		}

		if(!el){
			el = document.createElement('div');
			el.classList.add('oi-slider');
			el.style.width = opt.width;
			el.style.maxWidth = "100%";
			inner = document.createElement('div');
			inner.classList.add('oi-slider-inner');
			el.append(inner);
			(opt.position=="top" ? pel.prepend(el) : pel.append(el));
		}
		if(!range){
			range = document.createElement('input');
			range.classList.add('oi-slider-control');
			range.setAttribute('id',uid+'-slider');
			range.setAttribute('type','range');
			range.setAttribute('step',1);
			range.setAttribute('min',0);
			range.setAttribute('max',opt.columns.length-1);
			range.setAttribute('value',idx);
			inner.append(range);
			range.addEventListener('input',function(e){ _obj.updateMap(e.target.value); });
		}
		if(!label){
			let val = opt.value;
			for(i = 0; i < opt.columns.length; i++){
				if(opt.columns[i].value == opt.value) val = opt.columns[i].label;
			}
			label = document.createElement('label');
			label.innerHTML = val;
			label.setAttribute('for',uid+'-slider');
			inner.append(label);
		}
		this.updateMap = function(i){
			// Check if the value has changed. If not, stop.
			if(i==previousvalue) return this;
			previousvalue = i;
			key = opt.columns[i].value;
			label.innerHTML = opt.columns[i].label;
			if(!opt.key) console.error('No key');
			var min,max,v,id,colour,tt;
			// Find range of data
			if(opt.min) min = opt.min;
			else{
				min = Infinity;
				for(id in hexes) min = Math.min(min,hexes[id].data[key]);
			}
			if(opt.max) max = opt.max;
			else{
				max = -Infinity;
				for(id in hexes) max = Math.max(max,hexes[id].data[key]);
			}
			if(typeof opt.min==="number") min = opt.min;
			if(typeof opt.max==="number") max = opt.max;
			for(id in hexes){
				colour = opt.defaultbg||"#bbb";
				// Update colours
				if(typeof hexes[id].data[key]==="number"){
					v = (hexes[id].data[key]-min)/(max-min);
					colour = cs(v);
					tt = opt.tooltip;
				}else if(typeof hexes[id].data[key]==="string"){
					tt = opt.tooltip;
				}else{
					colour = opt.defaultbg||"#bbb";
					tt = "{{ n }}";
				}

				// Check if it is a named colour
				if(hexes[id].data[key] in opt.colours.named) colour = opt.colours.named[hexes[id].data[key]];

				hexes[id].path.setAttribute('fill',colour);
				if(hexes[id].label) hexes[id].label.setAttribute('fill',OI.Colour(colour).contrast);

				hexes[id].data._value = key;

				// Update tooltip
				hexes[id].title.innerHTML = applyReplacementFilters(tt,hexes[id].data);
			}
			if(OI.Tooltips) OI.Tooltips.update();
			return this;
		};
		return this;
	}

	function recursiveLookup(key,data){
		if(typeof key==="string"){
			var bits = key.split(/\./);
			var d = data;
			for(var b = 0; b < bits.length; b++){
				if(typeof d[bits[b]]==="undefined"){
					return d;
				}else{
					d = d[bits[b]];
				}
			}	
		}else{
			console.warn('Bad key "'+key+'" to look up in data:',data);
		}
		return d;
	}

	root.OI.SliderMap = function(opt){
		var p = document.currentScript.parentNode;
		OI.ready(function(){
			return new SliderMap(p,opt);
		});
	};

})(window || this);