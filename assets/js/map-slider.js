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

		var el,a,as,hexes = {},range,label,id,areas,cs,key,i,uid;
		cs = OI.ColourScale(opt.colours.scale);
		key = opt.value;

		uid = p.querySelector('svg.oi-map-inner').getAttribute('id');
		as = p.querySelectorAll('.data-layer .hex');

		areas = new Array(as.length);
		// Convert node list into an array with pre-parsed properties
		for(a = 0; a < as.length; a++){
			id = as[a].getAttribute('data-id');
			hexes[id] = {
				'el':as[a],
				'data':opt.data[id],
				'label':as[a].querySelector('text'),
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
			if(opt.columns[i]==opt.value) idx = i;
		}

		if(!el){
			el = document.createElement('div');
			el.classList.add('oi-slider');
			p.append(el);
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
			el.append(range);
			range.addEventListener('change',function(e){ _obj.updateMap(e.target.value); });
		}
		if(!label){
			label = document.createElement('label');
			label.innerHTML = opt.value;
			label.setAttribute('for',uid+'-slider');
			el.append(label);
		}
		this.updateMap = function(i){
			key = opt.columns[i];
			label.innerHTML = key;
			if(!opt.key) console.error('No key');
			var min,max,v,id,colour;
			// Find range of data
			min = Infinity;
			max = -Infinity;
			for(id in hexes){
				min = Math.min(min,hexes[id].data[key]);
				max = Math.max(max,hexes[id].data[key]);
			}
			if(typeof opt.min==="number") min = opt.min;
			if(typeof opt.max==="number") max = opt.max;
			for(id in hexes){

				// Update colours
				v = (hexes[id].data[key]-min)/(max-min);
				colour = cs(v);
				hexes[id].path.setAttribute('fill',colour);
				hexes[id].label.setAttribute('fill',OI.Colour(colour).contrast);

				hexes[id].data._value = key;

				// Update tooltip
				hexes[id].title.innerHTML = applyReplacementFilters(opt.tooltip,hexes[id].data);
			}
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

	function applyReplacementFilters(value,options){

		var v,bits,rtn,b,scale,min,max,cs;

		if(typeof value!=="string"){
			console.error('applyReplacementFilters argument should be a string',value);
		}

		// Replace any dummy "_value" with the value of that
		if(value.match(/\{\{ _value \}\}/)){
			value = value.replace(/\{\{ _value \}\}/g,function(m,p1){
				return options['_value'];
			});
		}

		// For each {{ value }} we will parse it to see if we recognise it
		value = value.replace(/\{\{ *([^\}]+) *\}\}/g,function(m,p1){

			// Remove a trailing space
			p1 = p1.replace(/ $/g,"");

			// Split by pipes
			bits = p1.split(/ \| /);

			// The value is the first part
			p1 = bits[0];

			if(options){
				if(typeof options[p1]!=="undefined"){
					// Get the value from the table if one exists
					p1 = options[p1];
				}else{
					v = recursiveLookup(p1,options);
					if(typeof v!=="undefined") p1 = v;
					if(typeof v==="object") p1 = "";
				}
			}

			// Process each filter in turn
			for(b = 1; b < bits.length; b++){

				// toFixed(n)
				rtn = bits[b].match(/toFixed\(([0-9]+)\)/);
				if(p1 && rtn && rtn.length == 2){
					if(typeof p1==="string") p1 = parseFloat(p1);
					p1 = p1.toFixed(rtn[1]);
				}

				// slice(a,b)
				rtn = bits[b].match(/slice\(([0-9]+)\,([0-9]+)\)/);
				if(p1 && rtn && rtn.length == 3){
					if(typeof p1==="string") p1 = p1.slice(parseInt(rtn[1]),parseInt(rtn[2]));
				}

				// multiply(n)
				rtn = bits[b].match(/multiply\(([0-9\.\-\+]+)\)/);
				if(p1 && rtn && rtn.length == 2){
					if(typeof p1==="string") p1 = parseFloat(p1);
					p1 = p1 * parseFloat(rtn[1]);
				}

				// multiply(100 / Total)
				rtn = bits[b].match(/multiply\(([^\)]+)\)/);
				if(rtn && rtn.length == 2){
					// Process any replacement values
					for(var o in options){
						rtn[1] = rtn[1].replace(new RegExp(o,'g'),options[o]);
					}
					if(rtn[1].match(/^[0-9\.\-\+\/\*\s]+$/)) rtn[1] = eval(rtn[1]);
					else throw new TypeError('Bad string to multiply: "'+rtn[1]+'"');

					if(typeof p1==="string") p1 = parseFloat(p1);
					p1 = p1 * parseFloat(rtn[1]);
				}

				// toLocaleString()
				rtn = bits[b].match(/toLocaleString\(([^\)]*)\)/);
				if(p1 && rtn){
					if(typeof p1==="string") p1 = parseFloat(p1);
					p1 = p1.toLocaleString(rtn[1]||{});
				}

				// strftime("%Y-%m-%d")
				rtn = bits[b].match(/strftime\([\"\']([^\)]*)[\"\']\)/);
				if(p1 && rtn){
					if(typeof p1==="string"){
						if(p1.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)){
							p1 = parseInt(p1.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2})/,function(m,p2){ return (new Date(p2)).getTime(); }));
						}else{
							p1 = parseFloat(p1);
						}
					}
					p1 = strftime(rtn[1]||"%Y-%m-%d",new Date(p1));
				}

				// colourScale(scale,min,max)
				rtn = bits[b].match(/colourScale\([\"\']([^\"\']+)[\"\']([^\)]*)\)/);
				if(p1 && rtn){
					min = 0;
					max = 0;
					scale = rtn[1]||"Viridis";
					if(rtn[2]){
						rtn = rtn[2].match(/^\,([0-9\.\-\+]*) ?\,([0-9\.\-\+]*)/);
						if(rtn.length > 1){
							min = parseFloat(rtn[1]);
							max = parseFloat(rtn[2]);
						}
					}
					cs = OI.ColourScale(scale);
					p1 = cs((parseFloat(p1)-min)/(max-min));
				}

				// contrastColour()
				rtn = bits[b].match(/contrastColour\(\)/);
				if(p1 && rtn) p1 = contrastColour(p1);

				// Use string if empty
				if(!p1){
					rtn = bits[b].match(/^\"([^\"]*)\"$/);
					if(rtn) p1 = rtn[1];
				}

			}

			return p1;
		});

		return value;
	}
	root.OI.SliderMap = function(opt){
		var p = document.currentScript.parentNode;
		return new SliderMap(p,opt);
	};

})(window || this);