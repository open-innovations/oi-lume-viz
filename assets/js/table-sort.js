/*
	Open Innovations Sortable Tables v0.3.1
	Helper function to make any table with class="table-sort" sortable.
	We would have used https://github.com/leewannacott/table-sort-js/ but it couldn't deal with merged rows
*/
(function(root){

	var styles = document.createElement('style');
	styles.innerHTML = '';
	document.head.prepend(styles);

	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		root.OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}
	function findMatch(arr,el){
		for(var i = 0; i < arr.length; i++){
			if(arr[i]==el) return i;
		}
		return -1;
	}
	function clone(obj){
		return JSON.parse(JSON.stringify(obj));
	}
	function normaliseTable(table){

		var r,c,i,ncol,thead,tbody,tr,rows,cols,o,span,cells,hrows,row,id,coltype,v;

		o = {};

		tbody = table.querySelector('tbody');
		thead = table.querySelector('thead');
		rows = [];
		hrows = [];
		cells = [];

		if(thead){
			tr = thead.querySelectorAll('tr');
			for(r = 0; r < tr.length; r++) hrows.push(tr[r]);
			tr = tbody.querySelectorAll('tr');
			for(r = 0; r < tr.length; r++) rows.push(tr[r]);
		}else{
			thead = document.createElement('thead');
			table.prepend(thead);

			if(!tbody){
				tbody = document.createElement('tbody');
				table.appendChild(tbody);
			}

			tr = (tbody ? tbody : table).querySelectorAll('tr');
			for(r = 0; r < tr.length; r++){
				if(tr[r].querySelectorAll('th').length > 0){
					hrows.push(tr[r]);
					thead.appendChild(tr[r]);
				}else{
					rows.push(tr[r]);
					tbody.appendChild(tr[r]);
				}
			}
		}

		ncol = hrows[0].querySelectorAll('td,th').length;
		var rowspan = new Array(ncol);
		for(c = 0; c < ncol; c++) rowspan[c] = 0;
		var mtable = new Array(rows.length);
		var coltype = new Array(ncol);
		var cls = "";

		// Convert into an array
		for(r = 0; r < rows.length; r++){
			cols = rows[r].querySelectorAll('td,th');
			rows[r] = [];
			mtable[r] = [];
			for(c = 0,i = 0; c < cols.length; c++){
				rows[r].push(cols[c]);
				cells.push(cols[c]);
			}
			for(c = 0; c < ncol; c++) mtable[r].push({});
		}

		for(r = 0; r < rows.length; r++){
			row = [];
			cls = rows[r][0].closest('tr').getAttribute('class');
			for(c = 0,i = 0; c < ncol; c++){
				if(rowspan[c] > 0){
					// Keep a reference to the previous row/col
					mtable[r][c] = clone(mtable[r-1][c]);
					rowspan[c]--;
				}else{
					// Check the col
					span = rows[r][i].getAttribute('rowspan');
					if(typeof span==="string"){
						span = parseInt(span);
						rowspan[c] = span-1;
					}
					id = findMatch(cells,rows[r][i])
					mtable[r][c] = {'id':id,'v':cells[id].getAttribute('data-sort')||cells[id].innerHTML};
					if(cls) mtable[r][c].class = cls;
					if(!coltype[c]) coltype[c] = {};
					i++;
				}
				v = mtable[r][c].v;
				typ = "string";
				// Remove any quotes around the column value
				v = v.replace(/^\"|\"$/g,"");
				if(v.match(/^[\-\+0-9\,]+\.[0-9]+$/)) typ = "float";
				else if(v.match(/^([0-9]+|[0-9\,]+\,[0-9]{3})$/)) typ = "integer";
				else if(!isNaN(Date.parse(v))) typ = "datetime";
				if(!coltype[c][typ]) coltype[c][typ] = 0;
				coltype[c][typ]++;

			}
		}

		for(c = 0; c < ncol; c++){
			for(typ in coltype[c]){
				if(coltype[c][typ]==rows.length){
					for(r = 0; r < rows.length; r++){
						v = mtable[r][c].v;
						if(typ=="float") v = parseFloat(v.replace(/,/g,''));
						if(typ=="integer") v = parseInt(v.replace(/,/g,''));
						if(typ=="datetime") v = (new Date(v)).getTime();
						mtable[r][c].v = v;
					}
				}
			}
		}

		o.cols = ncol;
		o.rows = rows.length;
		o.cells = cells;
		o.table = mtable;
		o.body = tbody;
		o.head = thead;
		o.header = new Array(ncol);
		for(c = 0; c < ncol; c++) o.header[c] = hrows[0].querySelectorAll('td,th')[c];
		return o;
	}

	function buildTable(el,table){

		var r,tr,id,cls;
		var cells = table.cells;
		var newbody = document.createElement('tbody');

		// Build the sorted table
		for(var r = 0; r < table.rows; r++){
			tr = document.createElement('tr');
			if(table.table[r][0].class) tr.setAttribute('class',table.table[r][0].class);
			for(var c = 0; c < table.cols; c++){
				id = table.table[r][c].id;
				td = cells[id].cloneNode(true);
				td.removeAttribute('rowspan');
				tr.appendChild(td);
			}
			newbody.appendChild(tr);
		}
		table.body.parentNode.replaceChild(newbody,table.body);
		table.body = newbody;
	}

	function SortableColumn(el,table,c,attr){
		if(!attr) attr = {};
		var dir = "";
		var indicator = table.header[c].querySelector('.oi-table-dir');
		if(!indicator){
			indicator = document.createElement('span');
			indicator.classList.add('oi-table-dir');
			table.header[c].appendChild(indicator);
			table.header[c].style.cursor = 'pointer';
		}
		this.getDirection = function(){
			return dir;
		};
		this.setDirection = function(d){
			dir = d;
			var v = "";//•";
			if(dir=="up") v = "▲";
			if(dir=="down") v = "▼";
			indicator.innerHTML = v;
			return this;
		};
		this.toggleDirection = function(){
			this.setDirection(!dir || dir=="up" ? "down" : "up");
			return dir;
		};
		
		table.header[c].addEventListener('click',function(e){
			if(attr._parent) attr._parent.sortColumn(c);
		});

		this.setDirection(dir);
		return this;
	}

	function SortableTable(el,attr){
		if(!attr) attr = {};
		var table = normaliseTable(el);
		this.columns = new Array(table.cols);
		this.sortColumn = function(col){
			dir = this.columns[col].toggleDirection();
			
			table.table = table.table.sort(function(a,b){
				if(a[col].v == b[col].v) return false;
				return (dir == "up" ? -1: 1)*(a[col].v > b[col].v ? 1 : -1);
			});
			// Loop over columns changing indicators
			for(var c = 0; c < this.columns.length; c++){
				if(c!=col) this.columns[c].setDirection("");
			}
			buildTable(el,table);
			if(typeof attr.onsort==="function") attr.onsort.call(this);
		}

		if(table.rows > 0){
			// Add functions to columns
			for(var c = 0; c < table.cols; c++){
				if(!table.header[c].getAttribute('disable-sort')) this.columns[c] = new SortableColumn(el,table,c,{'_parent':this});
			}
		}

		return this;
	}
	
	OI.TableSort = function(e,attr){ return new SortableTable(e,attr); }

	OI.ready(function(){
		var tables = document.querySelectorAll('.table-sort');
		for(var t = 0; t < tables.length; t++) new SortableTable(tables[t]);
	});

})(window || this);