import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { getAssetPath } from "../../lib/util/paths.ts"
import { clone } from "../../lib/util/clone.ts";
import { Colour, ColourScale } from "../../lib/colour/colours.ts";

const defaultbg = "#dfdfdf";

export const css = `
.calendar-chart .year { fill: #dfdfdf; }
.calendar-chart rect.in-year:focus {
	outline: 0;
}
`;


type CalendarChartOptions = {
	/** The data holding the values to be presented in the panels */
	data: { [key: string]: unknown }[];
	day: string,
	value: string,
	scale: string,
	min?: number;
	max?: number;
	minDate?: string;
	maxDate?: string;
	/** */
	class: string; 
}


/**
 * @param options Options to validate
 */
function checkOptions(options: LineChartOptions): void {
  if (options.data === undefined) throw new TypeError("Data not provided");
  if (options.data.length === 0) {
    throw new TypeError("Data provided has no entries");
  }
}

export default function (input: {
	config: Partial<CalendarChartOptions>;
}): string {
	const config = clone(input.config);

	// Convert references into actual objects
	config.data = thingOrNameOfThing<TableData<string | number>>(
		config.data,
		input,
	);

	// In case it was a CSV file loaded
	if(config.data.rows) config.data = config.data.rows;

	// Create any defined columns
	config.data = addVirtualColumns(config);

	// We can optionally set defaults in this
	const defaults: Partial<CalendarChartOptions> = {
		
	};
	// This might be a fragile merge!
	const options = {
		...defaults,
		...config,
	} as CalendarChartOptions;

	// Error checking
	checkOptions(options);

	const chart = CalendarChart(options);

	return `<div class="calendar-chart" data-dependencies="${ getAssetPath('/js/calendar-chart.js') },${ getAssetPath('/js/tooltip.js') }">${chart}</div>`;
}


function CalendarChart(input: {
	config: Partial<CalendarChartOptions>;
}): string {

	let min = Infinity;
	let max = -Infinity;
	let minDate = "3000-01-01";
	let maxDate = "0000-01-01";
	let days = {};

	for(let r = 0; r < input.data.length; r++){
		let d,v;
		// Expand min/max if the day field is a well-formatted string
		if(typeof input.data[r][input.key]==="string" && input.data[r][input.key].match(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}/)){
			d = input.data[r][input.key];
			if(d < minDate) minDate = d;
			if(d > maxDate) maxDate = d;
		}else{
			throw("Value for '"+input.key+"' in row "+r+" doesn't look like 0000-00-00: "+JSON.stringify(input.data[r]));
		}
		if(typeof input.data[r][input.value]!=="undefined"){
			v = input.data[r][input.value];
		}
		// Expand value min/max if the value field is a number 
		if(typeof input.data[r][input.value]==="number"){
			min = Math.min(min,v);
			max = Math.max(max,v);
		}
		if(typeof d==="string" && typeof v!=="undefined") days[d] = input.data[r];
	}
	if(typeof input.min==="number") min = input.min;
	if(typeof input.max==="number") max = input.max;

	if(typeof input.minDate==="string") minDate = input.minDate;
	if(typeof input.maxDate==="string") maxDate = input.maxDate;

	let range = {
		'min': { 'date': new Date(minDate) },
		'max': { 'date': new Date(maxDate) }
	}
	range.min.year = range.min.date.getFullYear();
	range.max.year = range.max.date.getFullYear();

	let w = 100;
	let size = w/56;
	let space = size*2;
	let yr = (range.max.year - range.min.year)+1;
	let h = (size*7)*yr + (yr > 0 ? space*(yr-1) : 0);

	let svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 '+w+' '+h+'" vector-effect="non-scaling-stroke" preserveAspectRatio="xMidYMin meet" overflow="hidden" data-type="calendar-chart">';
	let x = 0;
	let y = 0;

	//if(!input.tooltip) input.tooltip = input.value;

	var props = {
		'days': days,
		'min': min,
		'max': max,
		'width': w,
		'height': h,
		'size': size,
		'origin': {'x':x},
		'startofweek': (typeof input.startofweek==="number" ? input.startofweek : 1)
	};
	
	if(input.scale) props.scale = ColourScale(input.scale);

	if(input.order == "reverse"){
		// For each year (starting at the lowest year)
		for(let year = range.max.year, i = 0; year >= range.min.year; year--, i++){
			y = (size*7 + space)*(i);
			props.origin.y = y;
			svg += '<g class="data-layer">';
			svg += buildYear(year,props,input);
			svg += '</g>';
		}
	}else{
		// For each year (starting at the lowest year)
		for(let year = range.min.year, i = 0; year <= range.max.year; year++, i++){
			y = (size*7 + space)*(i);
			props.origin.y = y;
			svg += '<g class="data-layer">';
			svg += buildYear(year,props,input);
			svg += '</g>';
		}
	}
	svg += '</svg>';

	return svg;
}

function floorWeek(d: Date, firstdayofweek: number){
	if(typeof firstdayofweek==="undefined") firstdayofweek = 1;
	let diff = 0;
	let day = d.getDay();
	if(day > firstdayofweek) diff = firstdayofweek - day;
	else if(day < firstdayofweek) diff = day - firstdayofweek;
	return (new Date(d.getTime() + diff*86400000));
}
function ceilWeek(d: Date, firstdayofweek: number){
	if(typeof firstdayofweek==="undefined") firstdayofweek = 1;
	let diff = 0;
	let day = d.getDay();
	if(day > firstdayofweek) diff = 7 - (day - firstdayofweek);
	else if(day == firstdayofweek) diff = 7;
	else if(day < firstdayofweek) diff = 7 - (firstdayofweek - day);
	diff--;
	return (new Date(d.getTime() + diff*86400000));
}

function buildYear(year: number, opts: { min: number, max: number, origin: object, size: number, days: object, firstday: number}, input){

	let i,x,y,iso,svg,v,d,sday,eday,syear,eyear,offx,offy,dat;
	
	syear = new Date(year,0,1,12,0,0);	// Go to January 1st
	eyear = new Date(year,11,31,12,0,0);	// Go to December 31st

	sday = floorWeek(syear,opts.startofweek);
	eday = ceilWeek(eyear,opts.startofweek);

	x = opts.origin.x + opts.size;
	y = opts.origin.y + 3.5*opts.size;
	svg = '<text class="year" x="'+x+'" y="'+y+'" transform="rotate(-90)" transform-origin="'+x+' '+y+'" text-anchor="middle" font-size="'+(opts.size*1.5)+'" dominant-baseline="middle">'+year+'</text>';

	d = new Date(sday.getTime());
	for(i = 0; i < 7; i++){
		x = opts.origin.x + (2.5)*opts.size;
		y = opts.origin.y + (i+0.5)*opts.size;
		svg += '<text class="day" x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+(opts.size*0.75)+'" dominant-baseline="middle">'+d.toLocaleDateString("en-GB",{'weekday':'narrow'})+'</text>';
		d = (new Date(d.getTime() + 86400000));
	}


	d = new Date(sday.getTime());
	while(d <= eday){
		iso = d.toISOString().substr(0,10);

		dat = opts.days[iso];

		v = (dat && d >= syear && d <= eyear) ? dat[input.value] : (d >= syear && d <= eyear ? defaultbg : "transparent");
		if(typeof v==="number" && typeof opts.scale==="function") v = opts.scale((v - opts.min)/(opts.max - opts.min));
	
		offx = Math.floor(((d - sday)/86400000)/7);
		offy = (d.getDay()-opts.startofweek);
		if(offy < 0) offy += 7;

		x = opts.origin.x + 3*opts.size + offx*opts.size;
		y = opts.origin.y + offy*opts.size;
		
		let tooltip = '';
		if(dat){
			if(dat[input.tooltip]) tooltip = dat[input.tooltip];
			else tooltip = (dat[input.key]||"");
		}else{
			tooltip = iso;
		}

		svg += '<rect class="'+(d >= syear && d <= eyear ? "in-year" : "not-in-year")+(tooltip ? " has-value" : "")+'"';
		if(dat && dat[input.tooltip]) svg += '	tabindex="0"';
		svg += '	fill="'+v+'"';
		svg += '	x="'+x+'" y="'+y+'" width="'+opts.size+'" height="'+opts.size+'">';
		svg += '<title>'+tooltip+'</title>';
		svg += '</rect>';

		// Increment day
		d = (new Date(d.getTime() + 86400000));
	}

	return svg;
}