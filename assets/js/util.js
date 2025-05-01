/* OI utility functions */
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