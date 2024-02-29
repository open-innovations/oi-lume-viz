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
	top?: number,
	gap?: number,
	divider?: object
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
		'top': config.data.length,
		'gap': 1,
		'divider': {
			'stroke': defaultbg,
			'stroke-width': 2
		}
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

	const ns = 'http://www.w3.org/2000/svg';
	// Create a random ID number
	const id = Math.round(Math.random()*1e8);

	let fs = options['font-size'];
	let yoff = options['font-size']*1.2;

	let data = clone(config.data);

	// Create an array of series
	let series = [];
	let datamin = Infinity,datamax = -Infinity;
	let min,max;
	let pos,group,row,col,hasvalue,cname,v,v2,arr,oldrank,name,i,c,s,rank,clip,rect,seriesgroup,w,h,dy,radius,pad,xoff,xlbl,dx,lbl,svgopt,talign,g,ttl,oldidx,path,bg,y,oldy,oldx,idx,yv,xv,circle,txt;
	let gap = options.gap;


	if(!(options.key in data[0])){
		console.error('data',data);
		throw 'No column "'+options.key+'" in data.';
	}

	let columns = [],sorted;
	// For each column work out the ordered values
	for(col = 0; col < options.columns.length; col++){
		arr = [];
		cname = options.columns[col].name;
		for(row = 0; row < data.length; row++){
			v = data[row][cname];
			v2 = parseFloat(v);
			if(v2+'' == v) v = v2;
			if(typeof v==="number") arr.push({'value':v,'row':row,'name':data[row][options.key]});
			v = null;
			v = (options.colour && options.colour in data[row]) ? data[row][options.colour] : data[row][cname];
			if(typeof v==="string") v = parseFloat(v);
			if(!isNaN(v) && v!=null){
				datamin = Math.min(datamin,v);
				datamax = Math.max(datamax,v);
			}

		}
		sorted = arr.sort(function(a,b){
			let diff = a.value-b.value;
			if(diff==0) return a.name > b.name;
			return (options.reverse ? -diff : diff);
		});
		// Work out the ranks
		oldrank = 0;
		for(i = 0; i < sorted.length; i++){
			if(i==0){
				sorted[i].rank = 1;
			}else{
				if(sorted[i].value == sorted[i-1].value){
					sorted[i].rank = oldrank;
				}else{
					sorted[i].rank = i+1;
					oldrank = sorted[i].rank;
				}
			}
		}
		columns[col] = sorted;
	}

	// Set the top x value if not set
	if(!options.top || typeof options.top!=="number") options.top = data.length;
	
	// Loop over all columns and find the series that are in the top x
	var topx = {};
	for(col = 0; col < columns.length; col++){
		for(i = 0; i < columns[col].length; i++){
			if(columns[col][i].rank <= options.top){
				topx[columns[col][i].name] = true;
			}
		}
	}
	// Get a sorted list of series names that are included in the top x
	var names = Object.keys(topx).sort();
	var topn = names.length;
	
	// Build an ordered series by looping over the first column and checking if it is in our top x
	series = [];
	let serieslookup = {};
	let added = {};
	let endrank = 0;
	for(c = 0; c < columns[0].length; c++){
		name = columns[0][c].name;
		if(topx[name]){
			series.push({'title':name});
			serieslookup[name] = series.length-1;
			added[name] = true;
			endrank = Math.max(columns[0][c].rank,endrank);
		}
	}
	// Need to add on any missing series (ordered by name)
	for(i = 0; i < names.length; i++){
		if(!added[names[i]]){
			series.push({'title':names[i]});
			serieslookup[names[i]] = series.length-1;
		}
	}

	// Loop over the series and build their columns
	for(s = 0; s < series.length; s++){
		series[s].rank = new Array(columns.length);
		series[s].position = new Array(columns.length);
	}

	// Loop over each column
	for(col = 0; col < columns.length; col++){
		pos = 0;
		oldrank = 0;
		group = 1;
		// Loop over the rows (these are ordered within this column)
		for(i = 0; i < columns[col].length; i++){
			// If the name is in our lookup
			name = columns[col][i].name;
			if(name in serieslookup){
				// Get the series index
				s = serieslookup[name];
				rank = columns[col][i].rank;
				// Keep the column rank in the data array
				series[s].rank[col] = rank;
				if(typeof rank!=="number"){
					series[s].position[col] = options.top + gap + pos;
					pos++;
				}else{
					if(rank <= options.top){
						series[s].position[col] = rank;
					}else{
						if(rank > oldrank){
							// If the ranking is higher than the previous ranking
							// we add on however many were grouped then reset the 
							// group. This makes sure lines start next to labels
							pos += group;
							group = 1;
						}else{
							// If the rank is the same we add one to the group
							group++;
						}
						series[s].position[col] = options.top + gap + pos;
					}
				}
				// Keep a reference to the original data row
				series[s].row = columns[col][i].row;
				// Get a copy of the original data
				series[s].data = data[series[s].row];
				oldrank = rank;
			}
		}
	}
	if(options.top > series.length) options.top = series.length;
	let endtop = options.top;
	// Check if we have multiple items ranked equal to options.top
	for(let s = endtop; s < series.length; s++){
		if(series[s].rank[0]==options.top){
			endtop++;
		}
	}

	if(typeof options.height!=="number") options.height = Math.ceil(yoff*(series.length + 1 + gap));

	// Create SVG container
	var svg = svgEl('svg');
	svgopt = {'xmlns':ns,'version':'1.1','viewBox':'0 0 '+options.width+' '+options.height,'overflow':'visible','style':'max-width:100%;','preserveAspectRatio':'none'};
	setAttr(svg,svgopt);
	clip = svgEl("clipPath");
	setAttr(clip,{'id':'clip-'+id});
	rect = svgEl("rect");
	setAttr(rect,{'x':0,'y':0,'width':options.width,'height':options.height});
	add(rect,clip);
	seriesgroup = svgEl('g');
	seriesgroup.classList.add('data');

	// Set to the user-supplied values if they are numeric
	if(typeof config.min=="number") min = config.min;
	else min = datamin;
	if(typeof config.max=="number") max = config.max;
	else max = datamax;

	// Update the config so that the legend knows what the min/max are
	config.min = min;
	config.max = max;

	// Calculate how many extra series we have to include
	let extra = topn - options.top;

	// Calculate some dimensions
	w = options.width;
	h = options.height - yoff;
	dy = h / (endtop + (extra > 0 ? extra + gap : 0));
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

	dx = (w - xoff - radius)/(options.columns.length-1);

	// Make some column headers
	for(i = 0; i < options.columns.length; i++){
		lbl = svgEl('text');
		lbl.innerHTML = options.columns[i].name+'';
		talign = 'middle';
		if(i==0) talign = 'start';
		if(i==options.columns.length-1) talign = 'end';
		setAttr(lbl,{'x':(xoff + i*dx + (i==0 ? -radius : (i==options.columns.length-1 ? +radius : 0))).toFixed(2),'y': (fs*0.2).toFixed(2),'font-size':(fs).toFixed(2)+'px','dominant-baseline':'hanging','text-anchor':talign,'font-family':options['font-family']});
		svg.appendChild(lbl);
	}

	function getY(v){
		return yoff + ( (v+1)*dy - dy/2 );
	}

	let cs = (options.scale ? ColourScale(options.scale) : ColourScale(defaultbg+" 0%, "+defaultbg+" 100%"));

	oldidx = -1;
	let position,ranktxt,visible;

	// Update label positions, font size and build lines
	for(let s = 0; s < series.length; s++){

		// Create the SVG elements for each series
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


		// Get colour
		bg = defaultbg;
		if("colour" in options){
			if(options.colour in series[s].data){
				if(typeof series[s].data[options.colour]==="undefined") console.warn('No "value" column exists for "'+series[s].title+'".',series[s].data,options.colour);
				else bg = series[s].data[options.colour];
			}else{
				if(namedColours.get(options.colour)) bg = options.colour;
			}
			if(!isNaN(parseFloat(bg))) bg = parseFloat(bg);
		}else{
			// Default to the first rank value
			if(typeof series[s].rank[0]==="number") bg = series[s].rank[0];
			else bg = defaultbg;
		}
		if(typeof bg==="string") bg = namedColours.get(bg);
		if(typeof bg==="number"){
			// If the chart is reversed we find the opposite value
			v = Math.max(min,Math.min(max,(config.reverse) ? (datamax - bg + datamin) : bg));
			bg = cs((v - min)/(max - min));
		}
		if(bg==null) bg = defaultbg;

		// Build path and circles
		v = 0;

		// If the index is less than the end of the top section we use it otherwise add the gap
		position = (s < endtop ? s : s + gap);

		// Get the vertical pixel position
		y = getY(position);
		oldy = y;

		// Update label position to match first column rank
		setAttr(series[s].label,{'x':xlbl.toFixed(2),'y':y.toFixed(2),'font-size':(fs).toFixed(2)+'px'});

		oldx = xoff;

		// Make path for this series
		path = "";
		ttl = series[s].title+':';
		oldrank = 0;

		for(i = 0; i < series[s].rank.length; i++){
			rank = series[s].rank[i];
			ranktxt = rank||"";
			if(typeof series[s].position[i]==="number"){
				idx = (series[s].position[i] - 1)
			}else{
				if(i==0) idx = position;
				else idx = series.length;
			}
			// Add on the offset due to equal options.top place
			if(idx > options.top) idx += (endtop-options.top);
			
			yv = getY(idx);
			xv = xoff + i*dx;


			// Need to be clever about building the path
			// If there was a previous rank then we can draw a curve, otherwise 
			
			if(i == 0) path += 'M'+xv.toFixed(2)+','+yv.toFixed(2);
			else{
				if(typeof rank!=="number" || typeof oldrank!=="number") path += 'M'+xv.toFixed(2)+','+yv.toFixed(2);
				else path += 'C'+(oldx+(dx/2)*options.curvature).toFixed(2)+','+oldy.toFixed(2)+','+(xv-(dx/2)*options.curvature).toFixed(2)+','+yv.toFixed(2)+','+(xv).toFixed(2)+','+yv.toFixed(2);
			}

			// Only show circles if the rank is a number
			if(options.circles && typeof rank==="number"){
				circle = svgEl('circle');
				setAttr(circle,{'cx':xv.toFixed(2),'cy':yv.toFixed(2),'r':radius.toFixed(2),'fill':bg});
				series[s].g.appendChild(circle);
				txt = svgEl('text');
				txt.innerText = ranktxt;
				setAttr(txt,{'fill':contrastColour(bg||"#000000"),'x':xv.toFixed(2),'y':yv.toFixed(2),'dominant-baseline':'central','text-anchor':'middle','font-size':(radius).toFixed(1)+'px','font-family':options['font-family']});
				series[s].g.appendChild(txt);

			}
			oldy = yv;
			oldx = xv;
			ttl += '<br />'+(i == 0 ? ' ':'; ')+options.columns[i].name+': '+(typeof rank==="number" ? getNumberWithOrdinal(rank) : (typeof options.columns[i].fillna!==undefined ? options.columns[i].fillna : '?'));
			oldrank = rank;
		}
		
		setAttr(series[s].path,{'d':path,'stroke':bg,'stroke-width':(dy*options['stroke-width']).toFixed(2)});

		// Update series title
		series[s].titleEl.innerHTML = ttl;
		
	}

	// Add the divider
	if(extra > 0){
		let divider = svgEl('path');
		divider.classList.add('oi-divider');
		let attr = clone(options.divider);
		attr.d = 'M 0,'+getY(endtop - 1 + gap).toFixed(2)+'h '+w;
		setAttr(divider,attr);
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

function qs(el,t){ return el.querySelector(t); }
function add(el,to){ return to.appendChild(el); }
function svgEl(t){ return document.createElement(t); }
function setAttr(el,prop){
	for(var p in prop) el.setAttribute(p,prop[p]);
	return el;
}
