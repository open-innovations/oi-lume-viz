import { contrastColour } from './colour/contrast.ts';
import { ColourScale } from './colour/colour-scale.ts';
import { strftime } from './external/strftime.js';

export function transpose(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

export function range(array) {
  return {
    min: Math.min(...array.filter(x => x)),
    max: Math.max(...array.filter(x => x)),
  };
}

export function loadDataFile(path, sources) {
	let config,data;

	if(typeof path==="object"){
		config = path;
		path = path.file;
	}
	const name = path.replace(/\//g, '.').replace(/^.*?data/, 'sources').replace(/\.[^\.]*$/, '');
	data = eval(name);
	
	if(typeof config==="object"){
		data = augmentTable(config,data);
	}
	
	return data;
}

export function recursiveLookup(key,data){
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

// Add some extra filters for templates:
//   toFixed(n)
//   multiply(n)
//   toLocaleString()
//   colourScale(scale,min,max) - this let's us get a colour to, for example, use as a background style
//   contrastColour - find the most contrasting colour so that, for example, we can contrast the text colour
export function applyReplacementFilters(value,options) {

	var c,r,v,col,nc,h,bits,p1,rtn,b,scale,min,max,cs;

	if(typeof value!=="string"){
		console.log('applyReplacementFilters',value);
		throw("applyReplacementFilters argument should be a string");
	}

	// Replace any dummy "_value" with the value of that
	if(value.match(/\{\{ _value \}\}/)){
		value = value.replace(/\{\{ _value \}\}/g,function(m){
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
				if(typeof p1==="number") p1 = p1.toLocaleString(rtn[1]||{});
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
				cs = ColourScale(scale);
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

function augmentTable(config, table){

	var c,r,v,col,nc,h,bits,p1,rtn,b;
	
	// We want to build any custom columns here
	if(config.columns && table.names){
		nc = table.names.length;
		for(c = 0; c < config.columns.length; c++){
			if(config.columns[c].template){
				col = config.columns[c];
				table.names.push(col.name);
				table.colnum[col.name] = nc;
				table.columns[col.name] = [];
				table.range[col.name] = undefined;
				for(r = 0; r < table.data.length; r++){

					v = applyReplacementFilters(config.columns[c].template,{'table':table,'r':r});

					table.columns[col.name].push(v);
					table.data[r].push(v);
					//table.raw[r].push(v);
					table.rows[r][col.name] = v;
				}
				for(h = 0; h < table.header.length; h++) table.header[h].push(h==0 ? col.name : "");
				nc++;
			}
		}
	}
  
	return table;
}