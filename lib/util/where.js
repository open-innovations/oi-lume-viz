import '../external/sql-where-parser/sql-where-parser.min.js';

export function Where(w){
	return new SqlWhere(w);
}

function SqlWhere(w){
	var parser = new SqlWhereParser();
	var parsed;
	this.set = function(w){
		parsed = parser.parse(w);
		return this;
	};
	function parseBits(p,row,depth){
		var i,ok,k,v;
		if(!depth) depth = 0;
		depth++;
		ok = true;
		if("OR" in p){
			ok = false;
			for(i = 0; i < p.OR.length ; i++){
				if(parseBits(p.OR[i],row,depth)){
					return true;
				}
			}
		}else if("AND" in p){
			var n = 0;
			for(var i = 0; i < p.AND.length ; i++){
				if(parseBits(p.AND[i],row,depth)) n++;
			}
			ok = (n == p.AND.length);
		}else if("=" in p){
			k = p['='][0];
			v = p['='][1];
			if(k in row) return (row[k] == v);
			else console.warn('No column "'+k+'" in row',row);
		}else if(">" in p){
			k = p['>'][0];
			v = p['>'][1];
			if(k in row) return (row[k] > v);
			else console.warn('No column "'+k+'" in row',row);
		}else if(">=" in p){
			k = p['>='][0];
			v = p['>='][1];
			if(k in row) return (row[k] >= v);
			else console.warn('No column "'+k+'" in row',row);
		}else if("<" in p){
			k = p['<'][0];
			v = p['<'][1];
			if(k in row) return (row[k] < v);
			else console.warn('No column "'+k+'" in row',row);
		}else if("<=" in p){
			k = p['<='][0];
			v = p['<='][1];
			if(k in row) return (row[k] <= v);
			else console.warn('No column "'+k+'" in row',row);
		}else{
			console.warn('Unknown type in ',p);
		}
		return ok;
	}
	this.isValid = function(row,w){
		if(w) this.set(w);
		var k,v;
		return parseBits(JSON.parse(JSON.stringify(parsed)),row);
	};
	if(w) this.set(w);
	return this;
}