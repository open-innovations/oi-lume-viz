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

	// If the value is a key in options we use that
	if(value in options) return options[value];

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
		if(typeof p1==="null") p1 = "";

		// Process each filter in turn
		for(b = 1; b < bits.length; b++){

			// toFixed(n)
			rtn = bits[b].match(/toFixed\(([0-9]+)\)/);
			if(p1 && rtn && rtn.length == 2){
				let p2 = p1;
				if(typeof p2==="string") p2 = parseFloat(p2);
				if(typeof p2==="number"){
					// Set back to original
					if(isNaN(p2)) p2 = p1;
					else if(typeof p2==="number") p2 = p2.toFixed(rtn[1]);
					p1 = p2;
				}
				bits[b] = "";
			}

			// slice(a,b)
			rtn = bits[b].match(/slice\(([0-9]+)\,([0-9]+)\)/);
			if(p1 && rtn && rtn.length == 3){
				if(typeof p1==="string") p1 = p1.slice(parseInt(rtn[1]),parseInt(rtn[2]));
				bits[b] = "";
			}

			// multiply(100) or multiply(100 / Total)
			rtn = bits[b].match(/multiply\(([^\)]+)\)/);
			if(p1 && rtn && rtn.length == 2){
				if(typeof p1==="string") p1 = parseFloat(p1);
				if(isNaN(p1)){
					p1 = "";
				}else{
					// Process any replacement values
					for(var o in options){
						rtn[1] = rtn[1].replace(new RegExp(o,'g'),options[o]);
					}
					try {
						rtn[1] = eval(rtn[1]);
					}catch{
						throw new TypeError('Bad string to multiply: "'+rtn[1]+'"');
					}

					rtn[1] = parseFloat(rtn[1]);
					if(!isNaN(rtn[1])) p1 = p1 * rtn[1];
				}
				bits[b] = "";
			}

			// parseFloat
			rtn = bits[b].match(/parseFloat/);
			if(p1 && rtn){
				if(typeof p1==="string") p1 = parseFloat(p1);
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
				else p1 = "";
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
				parts[i].fn = function(a,d){ if(a.replace(/\./g,'').toLowerCase()=="pm" && d.hh < 12){ d.hh += 12; }	};
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

/* Port of strftime() by T. H. Doan (https://thdoan.github.io/strftime/)
 *
 * Day of year (%j) code based on Joe Orost's answer:
 * http://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
 *
 * Week number (%V) code based on Taco van den Broek's prototype:
 * http://techblog.procurios.nl/k/news/view/33796/14863/calculate-iso-8601-week-and-year-in-javascript.html
 */
function strftime(sFormat, date) {
	if (typeof sFormat !== 'string') {
		return '';
	}

	if (!(date instanceof Date)) {
		date = new Date();
	}

	const nDay = date.getDay();
	const nDate = date.getDate();
	const nMonth = date.getMonth();
	const nYear = date.getFullYear();
	const nHour = date.getHours();
	const nTime = date.getTime();
	const aDays = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	];
	const aMonths = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	const aDayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	const isLeapYear = () => (nYear % 4 === 0 && nYear % 100 !== 0) || nYear % 400 === 0;
	const getThursday = () => {
		const target = new Date(date);
		target.setDate(nDate - ((nDay + 6) % 7) + 3);
		return target;
	};
	const zeroPad = (nNum, nPad) => ((Math.pow(10, nPad) + nNum) + '').slice(1);

	return sFormat.replace(/%[a-z]+\b/gi, (sMatch) => {
		return (({
			'%a': aDays[nDay].slice(0, 3),
			'%A': aDays[nDay],
			'%b': aMonths[nMonth].slice(0, 3),
			'%B': aMonths[nMonth],
			'%c': date.toUTCString().replace(',', ''),
			'%C': Math.floor(nYear / 100),
			'%d': zeroPad(nDate, 2),
			'%e': nDate,
			'%F': (new Date(nTime - (date.getTimezoneOffset() * 60000))).toISOString().slice(0, 10),
			'%G': getThursday().getFullYear(),
			'%g': (getThursday().getFullYear() + '').slice(2),
			'%H': zeroPad(nHour, 2),
			'%I': zeroPad((nHour + 11) % 12 + 1, 2),
			'%j': zeroPad(aDayCount[nMonth] + nDate + ((nMonth > 1 && isLeapYear()) ? 1 : 0), 3),
			'%k': nHour,
			'%l': (nHour + 11) % 12 + 1,
			'%m': zeroPad(nMonth + 1, 2),
			'%n': nMonth + 1,
			'%M': zeroPad(date.getMinutes(), 2),
			'%p': (nHour < 12) ? 'AM' : 'PM',
			'%P': (nHour < 12) ? 'am' : 'pm',
			'%s': Math.round(nTime / 1000),
			'%S': zeroPad(date.getSeconds(), 2),
			'%u': nDay || 7,
			'%V': (() => {
				const target = getThursday();
				const n1stThu = target.valueOf();
				target.setMonth(0, 1);
				const nJan1 = target.getDay();

				if (nJan1 !== 4) {
					target.setMonth(0, 1 + ((4 - nJan1) + 7) % 7);
				}

				return zeroPad(1 + Math.ceil((n1stThu - target) / 604800000), 2);
			})(),
			'%w': nDay,
			'%x': date.toLocaleDateString(),
			'%X': date.toLocaleTimeString(),
			'%y': (nYear + '').slice(2),
			'%Y': nYear,
			'%z': date.toTimeString().replace(/.+GMT([+-]\d+).+/, '$1'),
			'%Z': date.toTimeString().replace(/.+\((.+?)\)$/, '$1'),
			'%Zs': new Intl.DateTimeFormat('default', {
				timeZoneName: 'short',
			}).formatToParts(date).find((oPart) => oPart.type === 'timeZoneName')?.value,
		}[sMatch] || '') + '') || sMatch;
	});
}

function recursiveLookup(key,data){
	var d = data;
	if(typeof key==="string"){
		var bits = key.split(/\./);
		for(var b = 0; b < bits.length; b++){
			if(typeof d[bits[b]]==="undefined") return d;
			else d = d[bits[b]];
		}	
	}else{
		console.warn('Bad key "'+key+'" to look up in data:',data);
	}
	return d;
}