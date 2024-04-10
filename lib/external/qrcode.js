// Adapted from https://github.com/kazuhikoarase/qrcode-generator/blob/master/js/qrcode.js
// Released under MIT licence
export function getPathFromValue(pattern,v,cellSize,pad,xoff,yoff){
	var pointEquals = function (a, b) { return a[0] === b[0] && a[1] === b[1]; };
	if(typeof cellSize!=="number") cellSize = 1;
	if(!pad) pad = {};
	if(typeof pad.left!=="number") pad.left = 0;
	if(typeof pad.top!=="number") pad.top = 0;

	// Mark all four edges of each square in clockwise drawing direction
	let edges = [];
	let row,col,x0,y0,x1,y1,i,j,k,l,d,polygons,polygon,edge,foundEdge,p1,p2,p3,point,polygon2,point2;
	for (row = 0; row < pattern.length; row++) {
		for (col = 0; col < pattern[row].length; col++) {
			if (pattern[row][col]==v){
				x0 = col * cellSize + (col > 0 ? pad.left : 0);
				y0 = row * cellSize + (row > 0 ? pad.top : 0);
				x1 = (col + 1) * cellSize + pad.left;
				y1 = (row + 1) * cellSize + pad.top;
				edges.push([[x0, y0], [x1, y0]]);	 // top edge (to right)
				edges.push([[x1, y0], [x1, y1]]);	 // right edge (down)
				edges.push([[x1, y1], [x0, y1]]);	 // bottom edge (to left)
				edges.push([[x0, y1], [x0, y0]]);	 // left edge (up)
			}
		}
	}

	// Edges that exist in both directions cancel each other (connecting the rectangles)
	for (i = edges.length - 1; i >= 0; i--) {
		for (j = i - 1; j >= 0; j--) {
			if (pointEquals(edges[i][0], edges[j][1]) &&
				pointEquals(edges[i][1], edges[j][0])) {
				// First remove index i, it's greater than j
				edges.splice(i, 1);
				edges.splice(j, 1);
				i--;
				break;
			}
		}
	}

	polygons = [];
	while (edges.length > 0) {
		// Pick a random edge and follow its connected edges to form a path (remove used edges)
		// If there are multiple connected edges, pick the first
		// Stop when the starting point of this path is reached
		polygon = [];
		polygons.push(polygon);
		edge = edges.splice(0, 1)[0];
		polygon.push(edge[0]);
		polygon.push(edge[1]);
		do {
			foundEdge = false;
			for (i = 0; i < edges.length; i++) {
				if (pointEquals(edges[i][0], edge[1])) {
					// Found an edge that starts at the last edge's end
					foundEdge = true;
					edge = edges.splice(i, 1)[0];
					p1 = polygon[polygon.length - 2];	 // polygon's second-last point
					p2 = polygon[polygon.length - 1];	 // polygon's current end
					p3 = edge[1];	 // new point
					// Extend polygon end if it's continuing in the same direction
					if (p1[0] === p2[0] &&	 // polygon ends vertical
						p2[0] === p3[0]) {	 // new point is vertical, too
						polygon[polygon.length - 1][1] = p3[1];
					}
					else if (p1[1] === p2[1] &&	 // polygon ends horizontal
						p2[1] === p3[1]) {	 // new point is horizontal, too
						polygon[polygon.length - 1][0] = p3[0];
					}
					else {
						polygon.push(p3);	 // new direction
					}
					break;
				}
			}
			if (!foundEdge)
				throw new Error("no next edge found at", edge[1]);
		}
		while (!pointEquals(polygon[polygon.length - 1], polygon[0]));
		
		// Move polygon's start and end point into a corner
		if (polygon[0][0] === polygon[1][0] &&
			polygon[polygon.length - 2][0] === polygon[polygon.length - 1][0]) {
			// start/end is along a vertical line
			polygon.length--;
			polygon[0][1] = polygon[polygon.length - 1][1];
		}
		else if (polygon[0][1] === polygon[1][1] &&
			polygon[polygon.length - 2][1] === polygon[polygon.length - 1][1]) {
			// start/end is along a horizontal line
			polygon.length--;
			polygon[0][0] = polygon[polygon.length - 1][0];
		}
	}
	// Repeat until there are no more unused edges

	// If two paths touch in at least one point, pick such a point and include one path in the other's sequence of points
	for (i = 0; i < polygons.length; i++) {
		polygon = polygons[i];
		for (j = 0; j < polygon.length; j++) {
			point = polygon[j];
			for (k = i + 1; k < polygons.length; k++) {
				polygon2 = polygons[k];
				for (l = 0; l < polygon2.length - 1; l++) {	 // exclude end point (same as start)
					point2 = polygon2[l];
					if (pointEquals(point, point2)) {
						// Embed polygon2 into polygon
						if (l > 0) {
							// Touching point is not other polygon's start/end
							polygon.splice.apply(polygon, [j + 1, 0].concat(
								polygon2.slice(1, l + 1)));
						}
						polygon.splice.apply(polygon, [j + 1, 0].concat(
							polygon2.slice(l + 1)));
						polygons.splice(k, 1);
						k--;
						break;
					}
				}
			}
		}
	}

	// Generate SVG path data
	d = "";
	for (i = 0; i < polygons.length; i++) {
		polygon = polygons[i];
		d += "M" + (polygon[0][0]+xoff) + "," + (polygon[0][1]+yoff);
		for (j = 1; j < polygon.length; j++) {
			if (polygon[j][0] === polygon[j - 1][0])
				d += "v" + (polygon[j][1] - polygon[j - 1][1]);
			else
				d += "h" + (polygon[j][0] - polygon[j - 1][0]);
		}
		d += "z";
	}
	return d;
}