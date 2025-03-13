import { getColourScale } from "../colour/colour-scale.ts";

export function SliderContent(opts){

	if(!opts) opts = {};
	if(!opts.slider) opts.slider = {};
	if(!opts.slider.position) opts.slider.position = 'bottom';
	if(!opts.slider.width) opts.slider.width = '100%';
	if(!opts.slider.columns) opts.slider.columns = [];

	// We don't need to send every field in the dataset
	let fields = [];

	// 1. Extract which keys used for the tooltip
	if(typeof opts.tooltip!=="string"){
		console.warn('Warning: No "tooltip" variable has been set for data:',config.data);
	}else{
		fields = opts.tooltip.match(/\{\{ *([^\}]*) *\}\}/g);
		for(let m = 0; m < fields.length; m++){
			fields[m] = fields[m].replace(/\{\{/g,"").replace(/\}\}/g,"").replace(/(^\s+|\s+$)/g,"").replace(/ \|.*/g,"");
		}
	}
	// 2. Add the value field (so that we can work out the colour for each hex)
	fields.push(opts.value);
	// 3. Add the _id (just in case)
	fields.push('_id');
	// 4. Add on the columns used for the slider
	if(typeof opts.slider.columns!=="object"){
		console.warn('No "columns" set for slider.');
	}else{
		for(let c = 0; c < opts.slider.columns.length; c++){
			if(typeof opts.slider.columns[c]==="string") opts.slider.columns[c] = {'value':opts.slider.columns[c],'label':opts.slider.columns[c]};
			fields.push(opts.slider.columns[c].value)
		}
	}
	// Limit to unique fields
	fields = Array.from(new Set(fields));

	// Remove any _value (because this will be calculated in the front-end
	const index = fields.indexOf('_value');
	if(index > -1) fields.splice(index, 1);

	// Compress the data to save bandwidth
	let tempareas = {};
	let id,f,r,v;
	if(opts.data.constructor === Array){
		for(r = 0; r < opts.data.length; r++){
			id = opts.data[r][opts.key];
			tempareas[id] = [];
			for(f = 0; f < fields.length; f++){
				v = opts.data[r][fields[f]]||"";
				if(typeof opts.data[r][fields[f]]==="number") v = opts.data[r][fields[f]];
				if(fields[f]=="_id" && v=="") v = id;
				tempareas[id].push(v);
			}
		}
	}else{
		for(let id in opts.data){
			tempareas[id] = [];
			for(f = 0; f < fields.length; f++){
				v = opts.data[id][fields[f]]||"";
				if(typeof opts.data[id][fields[f]]==="number") v = opts.data[id][fields[f]];
				if(fields[f]=="_id" && v=="") v = id;
				tempareas[id].push(v);
			}
		}
	}

	var html = '<script>(function(root){ OI.SliderMap({';
	html += '"position":"' + opts.slider.position + '"';
	html += ',\n"width":"' + opts.slider.width + '"';
	html += ',\n"defaultbg":' + JSON.stringify(opts.bg);
	html += ',\n"value":\"' + opts.value + '\"';
	html += ',\n"key":\"' + opts.key + '\"';
	if(typeof opts.min==="number") html += ',"min":' + opts.min;
	if(typeof opts.max==="number") html += ',"max":' + opts.max;
	html += ',"colours":{"background":"' + opts.bg + '",' + (opts.scale ? '"scale":"' + (getColourScale(opts.scale)||opts.scale) + '"' : '') + ',"named":' + JSON.stringify(opts.colours.getCustom()||{}) + '}';
	html += ',\n"tooltip": ' + JSON.stringify(opts.tooltip);
	html += ',\n"columns":'+JSON.stringify(opts.slider.columns);
	html += ',\n"compresseddata":' + JSON.stringify(tempareas);
	html += ',\n"fields":' + JSON.stringify(fields);
	html += '}); })(window || this);</script>';
	return html;
}

