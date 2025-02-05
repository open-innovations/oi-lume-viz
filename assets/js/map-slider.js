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

	function applyReplacementFilters(value,options){

		var v,bits,rtn,b,scale,min,max,cs,tmp;

		if(typeof value!=="string"){
			console.error('applyReplacementFilters argument should be a string',value);
		}

		// Replace any dummy "_value" with the value of that
		if(value.match(/\{\{ *_value *\}\}/)){
			value = value.replace(/\{\{ *_value *\}\}/g,function(m,p1){
				return options['_value']||"";
			});
		}

		// For each {{ value }} we will parse it to see if we recognise it
		value = value.replace(/\{\{ *(.*?) *\}\}/g,function(m,p1){

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
			if(typeof p1=="number" && isNaN(p1)) p1 = "";

			// Process each filter in turn
			for(b = 1; b < bits.length; b++){

				// toFixed(n)
				rtn = bits[b].match(/toFixed\(([0-9]+)\)/);
				if(p1 && rtn && rtn.length == 2){
					if(typeof p1==="string") p1 = parseFloat(p1);
					if(typeof p1==="number") p1 = p1.toFixed(rtn[1]);
					bits[b] = "";
				}

				// slice(a,b)
				rtn = bits[b].match(/slice\(([0-9]+)\,([0-9]+)\)/);
				if(p1 && rtn && rtn.length == 3){
					if(typeof p1==="string") p1 = p1.slice(parseInt(rtn[1]),parseInt(rtn[2]));
					bits[b] = "";
				}

				// multiply(n)
				rtn = bits[b].match(/multiply\(([0-9\.\-\+]+)\)/);
				if(p1 && rtn && rtn.length == 2){
					if(typeof p1==="string") p1 = parseFloat(p1);
					p1 = p1 * parseFloat(rtn[1]);
					bits[b] = "";
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
					bits[b] = "";
				}

				// toLocaleString()
				rtn = bits[b].match(/toLocaleString\(([^\)]*)\)/);
				if(p1 && rtn){
					tmp = p1
					if(typeof tmp==="string") tmp = parseFloat(tmp);
					if(typeof tmp==="number" && !isNaN(tmp)) p1 = tmp.toLocaleString(rtn[1]||{});
					bits[b] = "";
				}

				// strftime("%Y-%m-%d")
				rtn = bits[b].match(/strftime\([\"\']([^\)]*)[\"\']\)/);
				if(p1 && rtn){
					if(typeof p1==="string"){
						if(p1.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)){
							p1 = parseInt(p1.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2})/,function(m,p2){ return (new Date(p2)).getTime(); }));
						}else if(p1.match(/^[0-9]{4}-[0-9]{2}$/)){
							p1 = parseInt(p1.replace(/([0-9]{4}-[0-9]{2})/,function(m,p2){ return (new Date(p2+"-01")).getTime(); }));
						}else{
							p1 = parseFloat(p1);
						}
					}
					p1 = strftime(rtn[1]||"%Y-%m-%d",new Date(p1));
					bits[b] = "";
				}

				// strptime("%Y-%m-%d")
				rtn = bits[b].match(/strptime\([\"\']([^\)]*)[\"\']\)/);
				if(p1 && rtn){
					p1 = strptime(p1||"%Y-%m-%d",rtn[1]);
					bits[b] = "";
				}

				// decimalYear()
				rtn = bits[b].match(/decimalYear\(([^\)]*)\)/);
				if(p1 && rtn){
					var sy = new Date(p1);
					// Start of year
					sy.setUTCMonth(0);
					sy.setUTCDate(1);
					sy.setUTCHours(0);
					sy.setUTCMinutes(0);
					sy.setUTCSeconds(0);
					// Start of next year
					var ey = new Date(sy);
					ey.setUTCFullYear(sy.getUTCFullYear()+1);
					p1 = sy.getUTCFullYear() + (p1-sy)/(ey-sy);
					bits[b] = "";
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
					bits[b] = "";
				}

				// contrastColour()
				rtn = bits[b].match(/contrastColour\(\)/);
				if(p1 && rtn){
					p1 = OI.Colour(p1).contrast;
					bits[b] = "";
				}

				// Use string if empty
				if((typeof p1==="string" && !p1) || typeof p1==="null" || p1==null){
					rtn = bits[b].match(/^\"([^\"]*)\"$/);
					if(rtn) p1 = rtn[1];
				}

			}

			return p1;
		});

		return value;
	}
	
	// strptime() - parses a string that matches a given format https://www.tutorialspoint.com/posix-function-strftime-in-perl
	function strptime(datestr,format){

		var monthshort = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
		var monthlong = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
		var d = {'y':1970,'m':1,'d':1,'hh':0,'mm':0,'ss':0};

		/* Expand aliases */
		format = format.replace(/%D/, "%m/%d/%y");
		format = format.replace(/%F/, "%Y-%m-%d");
		format = format.replace(/%R/, "%H:%M");
		format = format.replace(/%T/, "%H:%M:%S");

		if(!format.match(/\%[a-zA-Z]/)) return datestr;

		var i;
		var parts = format.split(/\%/g);
		var pattern = "";
		
		for(i = 0; i < parts.length; i++){
			if(i==0 && format[0]!="%") parts[i] = {'c':'','post':parts[i]};		else parts[i] = {'c':(parts[i].length > 0 ? parts[i][0]:''),'post':parts[i].substr(1,)};

			switch(parts[i].c){
				case '%':
					parts[i].pattern = '%';
					break;
				case 'y':
					parts[i].pattern = "([0-9]{2})";
					parts[i].fn = function(a,d){ d.y = 2000+parseInt(a); };
					break;
				case 'Y':
					parts[i].pattern = "([0-9]{4})";
					parts[i].fn = function(a,d){ d.y = parseInt(a); };
					break;
				case 'b':
				case 'h':
					parts[i].pattern = "(" + monthshort.join("|") + ")";
					parts[i].fn = function(a,d){ d.m = monthshort.indexOf(a)+1; };
					break;
				case 'B':
					parts[i].pattern = "(" + monthlong.join("|") + ")";
					parts[i].fn = function(a,d){ d.m = monthlong.indexOf(a)+1; };
					break;
				case 'm':
					parts[i].pattern = "([0-9]{2})";
					parts[i].fn = function(a,d){ d.m = parseInt(a); };
					break;
				case 'd':
					parts[i].pattern = "([0-9]{2})";
					parts[i].fn = function(a,d){ d.d = parseInt(a); };
					break;
				case 'e':
					parts[i].pattern = "([0-9]{1,2})";
					parts[i].fn = function(a,d){ d.d = parseInt(a); };
					break;
				case 'H':
				case 'I':
					parts[i].pattern = "([0-9]{1,2})";
					parts[i].fn = function(a,d){ d.hh = parseInt(a); };
					break;
				case 'M':
					parts[i].pattern = "([0-9]{1,2})";
					parts[i].fn = function(a,d){ d.mm = parseInt(a); };
					break;
				case 'S':
					parts[i].pattern = "([0-9]{1,2})";
					parts[i].fn = function(a,d){ d.ss = parseInt(a); };
					break;
				case 'p':
					parts[i].pattern = "(a\.?m\.?|p\.?\m\.?)";
					parts[i].fn = function(a,d){ if(a.replace(/\./g,'').toLowerCase()=="pm" && d.hh < 12){ d.hh += 12; }  };
					break;
			}
			if(parts[i].pattern) pattern += parts[i].pattern;
			pattern += parts[i].post;
		}
		var datebits = datestr.match(RegExp(pattern,"i"));
		if(datebits){
			var j = 1;
			for(i = 0; i < parts.length; i++){
				if(parts[i].pattern){
					if(typeof parts[i].fn==="function"){
						parts[i].fn.call(this,datebits[j],d);
					}
					j++;
				}
			}
		}else{
			// Bad match
			console.warn('Bad match for "%c'+datestr+'%c" compared to "%c'+pattern+'%c"','font-style:italic;','','font-style:italic;','');
		}
		return new Date(d.y+'-'+(d.m<10 ? '0':'')+d.m+'-'+(d.d<10 ? '0':'')+d.d+'T'+(d.hh<10 ? '0':'')+d.hh+':'+(d.mm<10 ? '0':'')+d.mm+':'+(d.ss<10 ? '0':'')+d.ss+'Z');
	}
	root.OI.SliderMap = function(opt){
		var p = document.currentScript.parentNode;
		OI.ready(function(){
			return new SliderMap(p,opt);
		});
	};

})(window || this);