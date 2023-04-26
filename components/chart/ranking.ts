import { addVirtualColumns, thingOrNameOfThing } from "../../lib/helpers.ts";
import { contrastColour } from '../../lib/colour/contrast.ts';
import { replaceNamedColours } from '../../lib/colour/parse-colour-string.ts';
import { ColourScale } from '../../lib/colour/colour-scale.ts';
import { clone } from "../../lib/util/clone.ts";
import { document } from '../../lib/document.ts';
import { textLength } from './legacy/text.js';


const defaultbg = "#dfdfdf";

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

type RankingChartOptions = {
	/** The data holding the values to be presented in the panels */
	data: { [key: string]: unknown }[];
	/** The property in the data set holding the value */
	key?: string;
	value?: string;
	scale?: string;
	min?: number
	max?: number
	curvature?: number
	circles?: number
}

export const css = `
`;


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
		'width': 1024,
		'height': 640,
		'font-size': 17,
		'font-family':'"Century Gothic",sans-serif',
		'curvature': 1,
		'circles': 0,
		'stroke-width': 0.5
	};


	// This might be a fragile merge!
	const options = {
		...defaults,
		...config,
	} as RankingChartOptions;

	// Limit curvature to range
	options.curvature = Math.max(0,Math.min(1,options.curvature));


	// Error checking
	checkOptions(options);


	let svgopt,clip,rect,svg,seriesgroup;
	const ns = 'http://www.w3.org/2000/svg';
	// Create a random ID number
	const id = Math.round(Math.random()*1e8);

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

	var dy,y,yv,x,xv,h,w,pad,xoff,yoff,xlbl,dx,lbl,g,v,i,ok,data,path,oldx,oldy,oldrank,rank,orderby,reverse,bg,talign,circle,radius,txt;

	let fs = options['font-size'];
	

	// Create an array of series
	let series = [];
	let min = Infinity,max = -Infinity;
	
	
	for(let row = 0; row < options.data.length; row++){
		let s = { "row": row, "title": "", "data": new Array(options.columns.length), "row": row };
		if(typeof options.data[row][options.key]==="undefined") throw 'No column "'+options.key+'" in data.';
		s.title = options.data[row][options.key];

		// Construct columns for this series
		ok = true;
		for(let col = 0; col < options.columns.length; col++){
			// Get the value for this column
			v = options.data[row][options.columns[col].name];
			if(typeof v==="string") v = parseFloat(v);
			// If the value is a number we use it
			if(typeof v==="number" && !isNaN(v)){
				s.data[col] = v;
				min = Math.min(min,v);
				max = Math.max(max,v);
			}else{
				// A bad number means we will ignore this series
				ok = false;
				s.data[col] = 0;
			}
		}

		if(ok){
			g = svgEl('g');
			g.classList.add('series');
			s.g = g;
			svg.appendChild(g);

			lbl = svgEl('text');
			lbl.innerHTML = s.title;
			setAttr(lbl,{'dominant-baseline':'middle','text-anchor':'end'});
			s.label = lbl;
			g.appendChild(lbl);

			path = svgEl('path');
			setAttr(path,{'stroke-width':4,'stroke':defaultbg,'fill':'transparent'});
			g.appendChild(path);
			s.path = path;

			series.push(s);
		}
	}

	// Set to the user-supplied values if they are numeric
	if(typeof options.min=="number") min = options.min;
	if(typeof options.max=="number") max = options.max;

	// Set the order
	reverse = (options.order && options.order==="reverse" ? false : true);
	
	// There's no guarantee that the order of the rows in the CSV matches the first ranking column
	if(config.columns.length > 0){
		// Let's sort the series by the first column
		orderby = 0;
		// Sort the array
		series = series.sort(function(a, b){
			if(reverse) return a.data[orderby] > b.data[orderby] ? 1 : -1;
			else return a.data[orderby] < b.data[orderby] ? 1 : -1;
		});
	}

	// Calculate some dimensions
	yoff = options['font-size']*1.2;
	w = options.width;
	h = options.height - yoff;
	dy = h / series.length;
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
		setAttr(lbl,{'x':(xoff + i*dx + (i==0 ? -radius : (i==config.columns.length-1 ? +radius : 0))),'y': fs*0.2,'font-size':fs+'px','dominant-baseline':'hanging','text-anchor':talign});
		svg.appendChild(lbl);
	}

	function getY(v){
		return yoff + ( (v+1)*dy - dy/2 );
	}

	let cs = (options.scale ? ColourScale(options.scale) : ColourScale(defaultbg+" 0%, "+defaultbg+" 100%"));

	// Update label positions and font size
	for(let s = 0; s < series.length; s++){

		// Get colour
		bg = '';
		if(config.colour){
			if(typeof options.data[series[s].row][config.colour]==="undefined"){
				throw 'No "value" column exists for "'+series[s].title+'".';
			}else{
				bg = options.data[series[s].row][config.colour];
			}
		}else{
			// Default to the first data value
			bg = replaceNamedColours(series[s].data[0]||bg);
		}

		if(typeof bg==="number") bg = cs((bg - min)/(max - min));

		// Build path and circles
		v = 0;
		y = getY(s);
		setAttr(series[s].label,{'x':xlbl	,'y':y,'font-size':fs+'px'});

		rank = series[s].data[0];
		oldx = xoff;
		oldrank = rank;
		oldy = getY(s);

		// Make path for this series
		path = "";
		for(i = 0; i < series[s].data.length; i++){
			rank = series[s].data[i];
			yv = getY(rank-1);
			xv = xoff + (i)*dx;
			if(i == 0){
				path += 'M'+xv.toFixed(2)+','+yv.toFixed(2);
			}else{
				path += 'C'+(oldx+(dx/2)*options.curvature).toFixed(2)+','+oldy.toFixed(2)+','+(xv-(dx/2)*options.curvature).toFixed(2)+','+yv.toFixed(2)+','+(xv).toFixed(2)+','+yv.toFixed(2);
			}
			
			if(options.circles){
				circle = svgEl('circle');
				setAttr(circle,{'cx':xv.toFixed(2),'cy':yv.toFixed(2),'r':radius,'fill':bg});
				series[s].g.appendChild(circle);

				txt = svgEl('text');
				txt.innerText = rank;
				setAttr(txt,{'font-size':fs+'px','fill':contrastColour(bg),'x':xv.toFixed(2),'y':yv.toFixed(2),'dominant-baseline':'central','text-anchor':'middle','font-size':(radius*1)+'px'});
				series[s].g.appendChild(txt);
			}
			
			oldy = yv;
			oldx = xv;
			oldrank = rank;
		}
		setAttr(series[s].path,{'d':path,'stroke':bg,'stroke-width':(dy*options['stroke-width']).toFixed(2)});
	}

	return ['<div class="ranking" data-dependencies="/assets/js/ranking.js">',
		svg.outerHTML,
		'</div>'
	].join('');
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
