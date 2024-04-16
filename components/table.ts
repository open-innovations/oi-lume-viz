import { addVirtualColumns, thingOrNameOfThing } from "../lib/helpers.ts";
import { contrastColour } from '../lib/colour/contrast.ts';
import { Colours } from '../lib/colour/colours.ts';
import { ColourScale } from '../lib/colour/colour-scale.ts';
import { clone } from "../lib/util/clone.ts";
import { VisualisationHolder } from '../lib/holder.js';

export const css = `
/* OI table component */
.oi-table { display: block; overflow-x: auto; }
.oi-table table { border-collapse: collapse; max-width: 100%; }
`;


/**
 * @param options Options to validate
 */
function checkOptions(options: TableOptions): void {
	if (options.data === undefined) throw new TypeError("Data not provided");
	if (options.data.length === 0) {
		throw new TypeError("Data provided has no entries");
	}
}

export default function (input: {
	config: Partial<TableOptions>;
}): string {

	const config = clone(input.config);

	// Define some colours
	const namedColours = Colours(config.colours);

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
	const defaults: Partial<TableOptions> = {
	};

	// This might be a fragile merge!
	const options = {
		...defaults,
		...config,
	} as TableOptions;

	// Error checking
	checkOptions(options);

	// Create a structure to mimic the table (row indexing)
	let cells = new Array(options.data.length);
	let scales = new Array(options.columns.length);
	let sortable = false;
	let merging = false;

	for(let col = 0; col < options.columns.length; col++){
		scales[col] = {};
		if(options.columns[col].scale){
			scales[col] = {'scale':ColourScale(options.columns[col].scale),'min':(typeof options.columns[col].min==="number" ? options.columns[col].min : Infinity),'max':(typeof options.columns[col].max=="number" ? options.columns[col].max : -Infinity)};
		}
		if(options.columns[col].sortable) sortable = true;
		if(options.columns[col].mergerows) merging = true;
	}

	// Can't sort tables with merged cells, sorry
	//if(merging && sortable) sortable = false;

	for(let row = 0; row < options.data.length; row++){
		// Create an array of columns for this row
		cells[row] = new Array(options.columns.length);
		for(let col = 0; col < options.columns.length; col++){
			cells[row][col] = {
				"value": (options.columns[col].name && typeof options.data[row][options.columns[col].name]!=="undefined" ? options.data[row][options.columns[col].name] : ""),
				"done": false
			};
			cells[row]._data = options.data[row];
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
	if("sort" in options){
		if(typeof options.sort==="string") options.sort = [options.sort];
		let sortOrder = new Array(options.sort.length);
		for(let s = 0; s < options.sort.length; s++){
			for(let col = 0; col < options.columns.length; col++){
				if(options.columns[col].name==options.sort[s]){
					sortOrder[s] = col;
				}
			}
		}
		cells = cells.sort(function(a,b){
			let r,s,col,f1,f2;
			for(s = 0; s < sortOrder.length; s++){
				col = sortOrder[s];
				// Convert to a number if necessary
				f1 = parseFloat(a[col].value);
				f2 = parseFloat(b[col].value);
				if(f1==a[col].value) a[col].value = f1;
				if(f2==b[col].value) b[col].value = f2;
				if(typeof a[col].value==="string"){
					r = a[col].value.localeCompare(b[col].value);
				}else{
					if(a[col].value > b[col].value) r = 1;
					else if(a[col].value < b[col].value) r = -1;
					else r = 0;
				}
				if(r != 0) return r;
			}
			return 1;
		});
	}

	if("reverse" in options && options.reverse) cells = cells.reverse();

	let sty = '';
	if(options.width) sty += 'width:'+options.width+';';

	const html = ['<table'+(sty ? ' style="'+sty+'"' : '')+(sortable ? ' class="table-sort table-arrows"':'')+'><tr>'];
	for(let col = 0; col < options.columns.length; col++){
		html.push('<th'+(sortable && !options.columns[col].sortable ? ' class="disable-sort"':'')+''+("width" in options.columns[col] ? ' width="'+options.columns[col].width+'"' : '')+'>'+(options.columns[col].name||"")+'</th>');
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
				if(options.columns[col].colour){
					if(options.columns[col].colour in cells[row]._data) colour = colour = namedColours.get(cells[row]._data[options.columns[col].colour]);
					else colour = namedColours.get(options.columns[col].colour);
				}
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

	var holder = new VisualisationHolder(options,{'name':'table'});
	if(sortable) holder.addDependencies(['/js/table-sort.js']);
	holder.addClasses(['oi-table']);
	return holder.wrap(table);
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
