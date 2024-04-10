import { getPathFromValue } from '../external/qrcode.js';

export function Grid(cols: number, rows: number){

	this.nrows = rows;
	this.ncols = cols;
	this.cell = new Array(rows);

	for(let r = 0; r < rows; r++){
		this.cell[r] = new Array(cols);
		for(let c = 0;c < cols; c++){
			this.cell[r][c] = 0;
		}
	}

	this.fill = function(c: number, r: number){
		this.cell[r][c] = 1;
	};

	this.getBoundary = function(size: number, pad: number, xoff: number, yoff: number){
		return getPathFromValue(this.cell,1,size,pad,xoff||0,yoff||0);
	};
	return this;
}

