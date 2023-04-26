import { addVirtualColumns, thingOrNameOfThing } from "../lib/helpers.ts";
import { contrastColour } from '../lib/colour/contrast.ts';
import { replaceNamedColours } from '../lib/colour/parse-colour-string.ts';
import { ColourScale } from '../lib/colour/colour-scale.ts';
import { clone } from "../lib/util/clone.ts";

export const css = `
.oi-table { display: block; overflow-x: auto; }
.oi-table table { border-collapse: collapse; width: 100%; max-width: 100%; }
.oi-table table th { font-weight: bold; }
.oi-table table td, .oi-table table th { border: 1px solid black; padding: 0 0.25em; line-height: 1.5em; }
`;


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
	config: Partial<TableOptions>;
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

//console.log(config.data);

	// We can optionally set defaults in this
	const defaults: Partial<TableOptions> = {
	};

	// This might be a fragile merge!
	const options = {
		...defaults,
		...config,
	} as TableOptions;

	// Error checking
	checkOptions(options);

//console.log(options.data);
	// Create a structure to mimic the table (row indexing)
	let cells = new Array(options.data.length);
	let scales = new Array(options.columns.length);
	for(let col = 0; col < options.columns.length; col++){
		scales[col] = {};
		if(options.columns[col].scale){
			scales[col] = {'scale':ColourScale(options.columns[col].scale),'min':(typeof options.columns[col].min==="number" ? options.columns[col].min : Infinity),'max':(typeof options.columns[col].max=="number" ? options.columns[col].max : -Infinity)};
		}
	}

	for(let row = 0; row < options.data.length; row++){
		// Create an array of columns for this row
		cells[row] = new Array(options.columns.length);
		for(let col = 0; col < options.columns.length; col++){
			cells[row][col] = {
				"value": (options.columns[col].name && typeof options.data[row][options.columns[col].name]!=="undefined" ? options.data[row][options.columns[col].name] : ""),
				"done": false
			};
			let v = cells[row][col].value;
			if(scales[col].scale){
				if(typeof v==="string") v = parseFloat(v);
				if(typeof v==="number" && !isNaN(v)){
					scales[col].min = Math.min(scales[col].min,cells[row][col].value);
					scales[col].max = Math.max(scales[col].max,cells[row][col].value);
				}
			}
		}
	}
	
	const html = ['<table><tr>'];
	for(let col = 0; col < options.columns.length; col++){
		html.push('<th>'+(options.columns[col].name||"")+'</th>');
	}
	html.push('</tr>');
	
	let cs = {};

	for(let row = 0; row < cells.length; row++){
		html.push('<tr>');
		for(let col = 0; col < cells[row].length; col++){
			if(!cells[row][col].done){
				let n = 0;
				if(options.columns[col].mergerows){
					// Loop over following rows to find any that match
					for(let mrow = row+1; mrow < cells.length; mrow++, n++){
						if(cells[mrow][col].value!=cells[row][col].value) break;
						cells[mrow][col].done = true
					}
				}
				let cellprops = '';
				if(n>0) cellprops += ' rowspan="'+(n+1)+'"';
				let colour = "";
				let sty = "";
				if(options.columns[col].colour) colour = replaceNamedColours(options.columns[col].colour);
				if(options.columns[col].scale){
					let v = cells[row][col].value;
					if(typeof v==="string") v = parseFloat(v);
					if(typeof v==="number" && !isNaN(v)) colour = scales[col].scale((cells[row][col].value - scales[col].min)/(scales[col].max - scales[col].min));
				}
				if(colour) sty += "background:"+colour+";color:"+contrastColour(colour)+";";
				if(options.columns[col].align) sty += 'text-align:'+options.columns[col].align+';';
				if(sty) cellprops += ' style="'+sty+'"';

				html.push('<td'+cellprops+'>');
				html.push(cells[row][col].value);
				html.push('</td>');
				cells[row][col].done = true;
			}
		}
		html.push('</tr>');
	}
	html.push('</table>');

	const table = html.join('');

	return `<div class="oi-table">${table}</div>`;
}

export type TableOptions = {
	/** The data holding the values to be presented in the panels */
	data: { [key: string]: unknown }[];
	/** The configuration of panels */
	columns?: {
		name: string,
		colour?: string,
		scale?: string,
		min?: number,
		max?: number,
		align?: string,
		template?: string,
		mergerows?: boolean
	}[];
	/** The property in the data holding the panel name */
	title?: string;
	/** The property in the data set holding the value */
	value?: string;
}
