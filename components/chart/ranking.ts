/*
	Ranking Chart v 0.3
	
	This will make a rankings chart where each row is turned into a line
	that moves up and down depending on the columns used for rankings.
	
	First define the column name that is used to make each series:
		key: "Country"

	To colour the series by a value, you can use the following options:
		scale: "YFF"
		colour: "Ranks→2018"
		min: 1
		max: 38
		
	Alternatively, a colour string can be given in the CSV file e.g.:
		colour: "Colour"

	It is also possible to change the amount of curvature using 0-1:
		curvature: 0 (straight lines)
		curvature: 1 (fully curvy)

	Optional rank circles can be shown by setting the value of circles e.g.
		circles: 1 (full size)
		circles: 0.5 (half the size)
		circles: 0 (not shown)
*/

import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { contrastColour } from '../../lib/colour/contrast.ts';
import { Colours } from '../../lib/colour/colours.ts';
import { ColourScale } from '../../lib/colour/colour-scale.ts';
import { clone } from "../../lib/util/clone.ts";
import { document } from '../../lib/document.ts';
import { textLength, getFontFamily, getFontWeight, getFontSize } from '../../lib/font/fonts.ts';
import { VisualisationHolder } from '../../lib/holder.js';
import { getBackgroundColour } from "../../lib/colour/colour.ts";
import { getAssetPath } from "../../lib/util/paths.ts"

const defaultbg = getBackgroundColour();
const fontFamily = getFontFamily();
const fontWeight = getFontWeight();
const fontSize = getFontSize();

type RankingChartOptions = {
	/** The data holding the values to be presented in the panels */
	data: { [key: string]: unknown }[],
	/** The property in the data set holding the value */
	key?: string,
	value?: string,
	reverse?: boolean,
	scale?: string,
	min?: number,
	max?: number,
	curvature?: number,
	circles?: number,
	top?: number
};


/**
 * @param options Options to validate
 */
function checkOptions(options: RankingChartOptions): void {
	if (options.data === undefined) throw new TypeError("Data not provided");
	if (options.data.length === 0) {
		throw new TypeError("Data provided has no entries");
	}
}


export default function (input: {
	config: Partial<RankingChartOptions>;
}): string {

	const config = clone(input.config);

	// Define some colours
	const namedColours = Colours(config.colours);

	// Convert references into actual objects
	config.data = thingOrNameOfThing<RankingChartData<string | number>>(
		config.data,
		input,
	);

	// In case it was a CSV file loaded
	if(config.data.rows) config.data = config.data.rows;

	// Create any defined columns
	config.data = addVirtualColumns(config);

	// We can optionally set defaults in this
	const defaults: Partial<RankingChartOptions> = {
		'padding':{'left':0,'top':0,'right':0,'bottom':0},
		'width': 1080,
		'font-size': fontSize,
		'font-family': fontFamily,
		'curvature': 1,
		'circles': 0,
		'stroke-width': 0.5,
		'reverse':false,
		'top': config.data.length
	};


	// This might be a fragile merge!
	const options = {
		...defaults,
		...config,
	} as RankingChartOptions;

	// Make sure the `top: x` doesn't exceed the data length
	options.top = Math.min(options.top,config.data.length);

	// Limit curvature to range
	options.curvature = Math.max(0,Math.min(1,options.curvature));

	// Error checking
	checkOptions(options);

	let svgopt,clip,rect,svg,seriesgroup,dy,y,yv,x,xv,h,w,pad,xoff,xlbl,dx,ttl,lbl,g,v,i,ok,data,path,oldx,oldy,oldidx,rank,orderby,bg,talign,circle,radius,txt,idx;
	const ns = 'http://www.w3.org/2000/svg';
	// Create a random ID number
	const id = Math.round(Math.random()*1e8);

	let fs = options['font-size'];
	let yoff = options['font-size']*1.2;

	// Create an array of series
	let series = [];
	let min = Infinity,max = -Infinity;
	
	if(config.columns.length==0){
		console.warn("No columns have been given");
		return "";
	}

	for(let row = 0; row < options.data.length; row++){
		let s = { "row": row, "title": "", "data": clone(options.data[row]), "rank": new Array(options.columns.length), "order": new Array(options.columns.length) };
		if(typeof options.data[row][options.key]==="undefined") throw 'No column "'+options.key+'" in data.';
		s.title = options.data[row][options.key];
		s.include = false;

		// Construct columns for this series
		ok = true;
		for(let col = 0; col < options.columns.length; col++){
			// Get the value for this column
			v = options.data[row][options.columns[col].name];
			if(typeof v==="string") v = parseFloat(v);
			// If the value is a number we use it
			if(typeof v!=="number" || isNaN(v)){
				// A bad number means we will ignore this series
				ok = false;
			}
		}
		if(ok) series.push(s);
	}

	// Loop over each column and find the rank within it
	for(let col = 0; col < options.columns.length; col++){
		let arr = [];
		for(let s = 0; s < series.length; s++){
			let row = series[s].row;
			v = options.data[row][options.columns[col].name];
			if(typeof v==="string") v = parseFloat(v);
			if(typeof v!=="number" || isNaN(v)) v = null;
			arr.push(v);
		}
		let sorted = arr.slice().sort(function(a,b){return a-b})
		let ranks = arr.map(function(v){ return sorted.indexOf(v)+1 });
		for(let s = 0; s < series.length; s++){
			series[s].rank[col] = ranks[series[s].row];
			series[s].order[col] = ranks[series[s].row]-1;

			// Do we include the series?
			if(ranks[series[s].row] <= options.top) series[s].include = true; 

			series[s].data[options.columns[col].name+"_rank"] = series[s].rank[col];
			let v = null;
			if(config.colour){
				v = series[s].data[config.colour];
			}else{
				v = series[s].data[options.columns[col].name];
			}
			if(typeof v==="string") v = parseFloat(v);
			if(!isNaN(v)){
				min = Math.min(min,v);
				max = Math.max(max,v);
			}
		}
	}


	if(typeof options.height!=="number") options.height = Math.ceil(yoff*(series.length+1));

	// Create SVG container
	if(!svg){
		svg = svgEl('svg');
		svgopt = {'xmlns':ns,'version':'1.1','viewBox':'0 0 '+options.width+' '+options.height,'overflow':'visible','style':'max-width:100%;','preserveAspectRatio':'none','data-type':options.type};
		setAttr(svg,svgopt);
		clip = svgEl("clipPath");
		setAttr(clip,{'id':'clip-'+id});
		//add(clip,svg); // Clip to graph area
		rect = svgEl("rect");
		setAttr(rect,{'x':0,'y':0,'width':options.width,'height':options.height});
		add(rect,clip);
		seriesgroup = svgEl('g');
		seriesgroup.classList.add('data');
	}

	// Remove those series that aren't included
	for(let s = series.length-1; s >= 0; s--){
		if(!series[s].include) series.splice(s,1);
	}

	// Create the SVG elements for each series
	for(let s = 0; s < series.length; s++){
		g = svgEl('g');
		g.classList.add('series');
		series[s].g = g;
		svg.appendChild(g);
		
		ttl = svgEl('title');
		ttl.innerHTML = series[s].title;
		series[s].titleEl = ttl;
		g.appendChild(ttl);

		lbl = svgEl('text');
		lbl.innerHTML = series[s].title;
		setAttr(lbl,{'dominant-baseline':'middle','text-anchor':'end','font-family':options['font-family']});
		series[s].label = lbl;
		g.appendChild(lbl);

		path = svgEl('path');
		setAttr(path,{'stroke-width':4,'stroke':defaultbg,'fill':'transparent'});
		g.appendChild(path);
		series[s].path = path;
	}

	// Set to the user-supplied values if they are numeric
	if(typeof options.min=="number") min = options.min;
	if(typeof options.max=="number") max = options.max;

	config.min = min;
	config.max = max;

	// There's no guarantee that the order of the rows in the CSV matches the first ranking column
	// Sort the array
	series = series.sort(function(a, b){
		let av = a.rank[0];
		if(!isNaN(parseInt(av))) av = parseInt(av);
		let bv = b.rank[0];
		if(!isNaN(parseInt(bv))) bv = parseInt(bv);
		return av > bv ? 1 : -1;
	});



	let positions = new Array(series[0].rank.length);
	let gap = 1;
	var extra = 0;

	for(let i = 0; i < series[0].rank.length; i++){
		let arr = new Array(series.length);
		for(let s = 0; s < series.length; s++){
			arr[s] = series[s].rank[i];
		}

		let arrsort = arr.sort();
		positions[i] = {'count':0};
		for(let a = 0; a < arrsort.length; a++){
			if(arrsort[a] > options.top){
				positions[i][arrsort[a]] = positions[i].count + options.top + gap;
				positions[i].count++;
				extra = Math.max(extra,positions[i].count);
			}else{
				positions[i][arrsort[a]] = arr[a]-1;
			}
		}
	}

	// Calculate some dimensions
	w = options.width;
	h = options.height - yoff;
	dy = h / (options.top + (extra > 0 ? extra+gap:0));
	radius = dy*options.circles*0.5;

	// Shrink the font if the y-spacing is too small
	fs = Math.min(dy,fs);

	// Set the label padding (both sides)
	pad = 5;

	xoff = 0;
	for(let s = 0; s < series.length; s++){
		xoff = Math.max(xoff,textLength(series[s].title,fs,"normal",options['font-family'].split(/,/)[0].replace(/\"/g,"")));
	}
	xlbl = xoff + pad;
	xoff = xlbl + pad + radius;

	dx = (w - xoff - radius)/(config.columns.length-1);

	// Let's make some column headers
	for(i = 0; i < config.columns.length; i++){
		lbl = svgEl('text');
		lbl.innerHTML = config.columns[i].name+'';
		talign = 'middle';
		if(i==0) talign = 'start';
		if(i==config.columns.length-1) talign = 'end';
		setAttr(lbl,{'x':(xoff + i*dx + (i==0 ? -radius : (i==config.columns.length-1 ? +radius : 0))).toFixed(2),'y': (fs*0.2).toFixed(2),'font-size':(fs).toFixed(2)+'px','dominant-baseline':'hanging','text-anchor':talign,'font-family':options['font-family']});
		svg.appendChild(lbl);
	}

	function getY(v){
		// Re-order the index as necessary
		let v2 = (options.reverse ? series.length-v-1 : v);
		return yoff + ( (v2+1)*dy - dy/2 );
	}

	let cs = (options.scale ? ColourScale(options.scale) : ColourScale(defaultbg+" 0%, "+defaultbg+" 100%"));

	oldidx = -1;

	// Update label positions and font size
	for(let s = 0; s < series.length; s++){

		// Get colour
		bg = defaultbg;
		if(config.colour){
			if(config.colour in series[s].data){
				if(typeof series[s].data[config.colour]==="undefined") console.warn('No "value" column exists for "'+series[s].title+'".',series[s].data,config.colour);
				else bg = series[s].data[config.colour];
			}else{
				if(namedColours.get(config.colour)) bg = config.colour;
			}
			if(!isNaN(parseFloat(bg))) bg = parseFloat(bg);
		}else{
			// Default to the first rank value
			if(typeof series[s].rank==="number") bg = series[s].rank;
		}

		if(typeof bg==="string") bg = namedColours.get(bg);
		if(typeof bg==="number") bg = cs((bg - min)/(max - min));

		// Build path and circles
		v = 0;

		rank = series[s].rank[0];
		idx = positions[0][rank];

		// If this label has the same index as the previous one we add one
		if(idx == oldidx) idx++;
		oldx = xoff;

		// There's a possibility that the first column gives the same ranking to multiple series. 
		// To avoid labels sitting on top of each other, we shall force the initial ranking to 
		// match the series index rather than its rank.
		y = getY(idx);
		oldy = y;

		// Update label position to match first column rank
		setAttr(series[s].label,{'x':xlbl.toFixed(2),'y':y.toFixed(2),'font-size':(fs).toFixed(2)+'px'});


		oldidx = idx;

		// Make path for this series
		path = "";
		ttl = series[s].title+':';
		for(i = 0; i < series[s].rank.length; i++){
			rank = series[s].rank[i];
			idx = series[s].rank[i]-1;
			idx = positions[i][rank];
			yv = getY(idx);
			xv = xoff + (i)*dx;

			if(i == 0) path += 'M'+xv.toFixed(2)+','+yv.toFixed(2);
			else path += 'C'+(oldx+(dx/2)*options.curvature).toFixed(2)+','+oldy.toFixed(2)+','+(xv-(dx/2)*options.curvature).toFixed(2)+','+yv.toFixed(2)+','+(xv).toFixed(2)+','+yv.toFixed(2);
			
			if(options.circles){
				circle = svgEl('circle');
				setAttr(circle,{'cx':xv.toFixed(2),'cy':yv.toFixed(2),'r':radius,'fill':bg});
				series[s].g.appendChild(circle);

				txt = svgEl('text');
				txt.innerText = rank;
				setAttr(txt,{'fill':contrastColour(bg),'x':xv.toFixed(2),'y':yv.toFixed(2),'dominant-baseline':'central','text-anchor':'middle','font-size':(radius)+'px','font-family':options['font-family']});
				series[s].g.appendChild(txt);
			}
			
			oldy = yv;
			oldx = xv;
			
			ttl += '<br />'+(i == 0 ? ' ':'; ')+config.columns[i].name+': '+getNumberWithOrdinal(rank);
		}
		setAttr(series[s].path,{'d':path,'stroke':bg,'stroke-width':(dy*options['stroke-width']).toFixed(2)});

		// Update series title
		series[s].titleEl.innerHTML = ttl;
	}

	// Add the divider
	if(extra > 0){
		let divider = svgEl('path');
		divider.classList.add('divider');
		setAttr(divider,{'d':'M 0,'+getY(options.top - 1 + gap)+'h '+w,'stroke':'black','stroke-width':2});
		svg.appendChild(divider);
	}

	var holder = new VisualisationHolder(config,{'name':'ranking chart'});
	holder.addDependencies(['/js/chart-ranking.js','/css/charts.css']);
	holder.addClasses(['oi-chart','oi-chart-ranking']);
	return holder.wrap(svg.outerHTML);
}

function getNumberWithOrdinal(n) {
	var s = ["th", "st", "nd", "rd"],
		v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}


// Sort the data
function sortBy(arr,i,reverse){
	yaxis = i;
	return arr.sort(function (a, b) {
		if(reverse) return a[i] > b[i] ? 1 : -1;
		else return a[i] < b[i] ? 1 : -1;
	});
}
function qs(el,t){ return el.querySelector(t); }
function add(el,to){ return to.appendChild(el); }
function svgEl(t){ return document.createElement(t); }
function setAttr(el,prop){
	for(var p in prop) el.setAttribute(p,prop[p]);
	return el;
}
