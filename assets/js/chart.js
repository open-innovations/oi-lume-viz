/*
	Open Innovations Chart Interactivity v0.2.1
	Helper function that find ".chart" elements 
	looks for elements with "pane" within them,
	finds their <h3> elements, 
	then builds a simple tabbed interface.
*/

(function(root){

	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		root.OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}

	var ns = 'http://www.w3.org/2000/svg';
	function svgEl(t){ return document.createElementNS(ns,t); }
	function add(el,to){ return to.appendChild(el); }
	function setAttr(el,prop){
		for(var p in prop) el.setAttribute(p,prop[p]);
		return el;
	}
	function addEv(ev,el,data,fn){
		el.addEventListener(ev,function(e){
			e.data = data;
			fn.call(data.this||this,e);
		});
	}
	function addClasses(el,cl){
		for(var i = 0; i < cl.length; i++) el.classList.add(cl[i]);
		return el;
	}
	function InteractiveChart(el){
		var svg = el.querySelector('svg');
		var key = el.querySelector('.legend');
		var serieskey = el.querySelectorAll('.series');
		var s,i,p;
		var pt = el.querySelectorAll('.series .marker');
		var pts = [];
		var series = [];
		var shapes = [];
		for(p = 0; p < pt.length; p++){
			// Set the tabIndex on every selectable point
			pt[p].setAttribute('tabindex',0);
			// Get the series number
			s = parseInt(pt[p].getAttribute('data-series'));
			// Get the item within the series
			i = parseInt(pt[p].getAttribute('data-i'));
			pts[p] = {'el':pt[p],'series':s,'i':i,'tooltip':(pt[p].querySelector('title') ? pt[p].querySelector('title').innerHTML : "")};
			if(!series[s]) series[s] = [];
			if(!series[s][i]) series[s][i] = pts[p];
		}
		this.enabled = true;
		this.selected = null;

		// A function for setting the x-value of a shape
		function setX(s,r,x){
			if(typeof x==="number") shapes[s][r].setAttribute('x',x);
		}

		this.reset = function(e){
			return this.clearSeries(e).clearTooltip(e);
		};
		this.setSeries = function(e){
			this.enabled = !this.enabled;
			if(this.enabled) e.data.s = null;
			this.highlightSeries(e);
			return this;
		};
		this.clearSeries = function(e){
			if(this.enabled){
				var ev = JSON.parse(JSON.stringify(e));
				ev.data.s = null;
				this.enabled = true;
				this.highlightSeries(ev);
			}
			return this;
		};
		this.toggleSeries = function(e){
			if(this.selected==null) this.highlightSeries(e);
			else this.reset(e);
			return this;
		};
		this.highlightSeries = function(e){
			var d,selected,typ,s,r,origin,pts,p,arr,a;
			if(this.enabled){
				d = e.data.s;
				this.selected = d;
				selected = el.querySelector('.series-'+d);
				if(!selected){
					arr = el.querySelectorAll('.series');
					for(a = 0; a < arr.length; a++){
						if(arr[a].getAttribute('data-series') == d) selected = arr[a];
					}
				}
				typ = svg.getAttribute('data-type');
				if(typ == "stacked-bar-chart"){
					// Find the origin of the bars by just taking the x-value of the first one in the first series
					origin = parseFloat(serieskey[0].querySelector('rect').getAttribute('x'));
					if(shapes.length==0){
						shapes = new Array(serieskey.length);
						for(s = 0; s < serieskey.length; s++) shapes[s] = serieskey[s].querySelectorAll('rect');
					}
				}
				for(s = 0; s < serieskey.length; s++){
					pts = serieskey[s].querySelectorAll('.marker');
					if(d){

						if(serieskey[s]==selected){
							serieskey[s].style.opacity = 1;
							// Simulate z-index by moving to the end
							if(typ == "stacked-bar-chart"){
								serieskey[s].parentNode.appendChild(serieskey[s]);
							}
							// Make points selectable
							for(p = 0; p < pts.length; p++) pts[p].setAttribute('tabindex',0);
						}else{
							// Fade the unselected series
							serieskey[s].style.opacity = 0.1;
							// Make points unselectable
							for(p = 0; p < pts.length; p++) pts[p].removeAttribute('tabindex');
						}

						// If it is a stacked bar chart we will change the left position and store that
						if(typ == "stacked-bar-chart"){
							// Find all the bars
							for(r = 0; r < shapes[s].length; r++){
								// Store the x-value if we haven't already done so
								if(!shapes[s][r].hasAttribute('data-x')) shapes[s][r].setAttribute('data-x',shapes[s][r].getAttribute('x'));
								// Update the x-value
								setX(s,r,origin);
							}
						}
					}else{
						serieskey[s].style.opacity = 1;
						// Make points selectable
						for(p = 0; p < pts.length; p++) pts[p].setAttribute('tabindex',0);
						// Reset bar positions
						if(typ == "stacked-bar-chart"){
							// Find all the bars
							for(r = 0; r < shapes[s].length; r++){
								// Get the stored x-value
								// Update the x-values if we have them
								if(shapes[s][r].hasAttribute('data-x')) setX(s,r,parseFloat(shapes[s][r].getAttribute('data-x')));
							}
						}
					}
				}
			}
			return this;
		};
		this.triggerTooltip = function(e){
			for(var i = 0; i < pts.length; i++){
				if(pts[i].el==e.target) return this.showTooltip(pts[i].series,pts[i].i);
			}
			return this;
		};
		this.clearTooltip = function(e){
			if(this.tip && this.tip.parentNode) this.tip.parentNode.removeChild(this.tip);
			return this;
		};
		this.showTooltip = function(s,i){
			el.style.position = 'relative';

			var txt,bb,bbo,fill,selected,off;
			this.tip = el.querySelector('.tooltip');
			if(!this.tip){
				this.tip = document.createElement('div');
				this.tip.innerHTML = '<div class="inner" style="background: #b2b2b2;position:relative;"></div><div class="arrow" style="position: absolute; width: 0; height: 0; border: 0.5em solid transparent; border-bottom: 0; left: 50%; top: calc(100% - 1px); transform: translate3d(-50%,0,0); border-color: transparent; border-top-color: green;"></div>';
				addClasses(this.tip,['tooltip']);
				add(this.tip,el);
			}

			// Set the contents
			txt = series[s][i].tooltip.replace(/\\n/g,'<br />');

			fill = series[s][i].el.getAttribute('fill');

			// Remove current selections
			selected = el.querySelectorAll('circle.selected, rect.selected');
			for(var j = 0; j < selected.length; j++) selected[j].classList.remove('selected');
			
			// Select this point
			series[s][i].el.classList.add('selected');

			this.tip.querySelector('.inner').innerHTML = (txt);

			// Position the tooltip
			bb = series[s][i].el.getBoundingClientRect();	// Bounding box of the element
			bbo = el.getBoundingClientRect(); // Bounding box of SVG holder

			var typ = svg.getAttribute('data-type');
			off = 4;
			if(typ=="bar-chart" || typ=="stacked-bar-chart") off = bb.height/2;
			
			this.tip.setAttribute('style','position:absolute;left:'+(bb.left + bb.width/2 - bbo.left).toFixed(2)+'px;top:'+(bb.top + bb.height/2 - bbo.top).toFixed(2)+'px;transform:translate3d(-50%,calc(-100% - '+off+'px),0);display:'+(txt ? 'block':'none')+';');
			this.tip.querySelector('.inner').style.background = fill;
			this.tip.querySelector('.arrow').style['border-top-color'] = fill;
			this.tip.style.color = (OI.contrastColour ? OI.contrastColour(fill) : "red");

			return this;
		};
		// Find the nearest point
		this.findPoint = function(e){
			var i,d,dx,dy,p,idx,min,dist,ok;
			min = 20;
			dist = 1e100;
			var matches = [];
			var typ = svg.getAttribute('data-type');

			for(s = 0; s < series.length; s++){
				if(series[s]){
					ok = true;
					if(this.selected != null && s!=this.selected) ok = false;
					if(ok){
						dist = 1e100;
						d = -1;
						idx = -1;
						for(i = 0; i < series[s].length; i++){
							p = series[s][i].el.getBoundingClientRect();
							if(typ=="category-chart"){
								dx = Math.abs((p.x+p.width/2)-e.clientX);	// Find distance from circle centre to cursor
								dy = Math.abs((p.y+p.width/2)-e.clientY);
								if(dy < min && dy < dist){
									idx = i;
									dist = dy;
									d = Math.sqrt(dx*dx + dy*dy);
								}
							}else if(typ=="line-chart"){
								dx = Math.abs((p.x+p.width/2)-e.clientX);	// Find distance from circle centre to cursor
								dy = Math.abs((p.y+p.width/2)-e.clientY);
								if(dx < min && dx < dist){
									idx = i;
									dist = dx;
									d = Math.sqrt(dx*dx + dy*dy);
								}
							}else if(typ=="bar-chart"){
								// As the bars run horizontally, we just check if the vertical position lines up with a bar
								if(e.clientY >= p.top && e.clientY <= p.top+p.height){
									idx = i;
								}
							}else if(typ=="stacked-bar-chart"){
								if(s==this.selected){
									// If only one is selected we just check the vertical position
									if(e.clientY >= p.top && e.clientY <= p.top+p.height) idx = i;									
								}else{
									// Check if the vertical position lines up with a bar and the horizontal position is within the bar
									if(e.clientY >= p.top && e.clientY <= p.top+p.height && e.clientX >= p.left && e.clientX <= p.left+p.width) idx = i;
								}
							}else{
								dx = Math.abs((p.x+p.width/2)-e.clientX);	// Find distance from circle centre to cursor
								dy = Math.abs((p.y+p.width/2)-e.clientY);
								d = Math.sqrt(dx*dx + dy*dy);
								if(d < min && d < dist){
									idx = i;
									dist = d;
								}
							}
						}
						if(idx >= 0){
							matches.push({'dist':d,'pt':series[s][idx]});
						}
					}
				}
			}
			dist = 1e100;
			idx = -1;
			for(s = 0; s < matches.length; s++){
				if(matches[s].dist < dist){
					dist = matches[s].dist;
					idx = s;
				}
			}
			if(idx >= 0) this.showTooltip(matches[idx].pt.series,matches[idx].pt.i);
			else this.clearTooltip();
			return this;
		};
		addEv('mousemove',svg,{'this':this},this.findPoint);
		if(pts){
			for(p = 0; p < pts.length; p++){
				addEv('focus',pts[p].el,{'this':this},this.triggerTooltip);
			}
		}
		if(key){
			// We build an HTML version of the key
			var newkey = document.createElement('div');
			newkey.classList.add('legend');
			el.insertBefore(newkey, el.firstChild);

			// Get each of the .data-series elements from the existing key
			var keyseries = key.querySelectorAll('.data-series');
			
			var keyitem,icon,txt,snum;
			for(s = 0; s < keyseries.length; s++){
				// Create a key item <div>
				keyitem = document.createElement('div');
				keyitem.classList.add('legend-item');
				add(keyitem,newkey);

				txt = document.createElement('span');
				txt.classList.add('label');

				if(!keyseries[s].querySelector('svg')){

					// If this already is SVG get the text from a tspan
					txt.innerHTML = keyseries[s].querySelector('text tspan').innerHTML;

					// Make the new SVG just for the icon and add it to our new series item
					icon = svgEl('svg');
					add(keyseries[s].cloneNode(true),icon);
					setAttr(icon,{'overflow':'visible','width':17*1.5,'height':'1em','viewBox':'0 0 '+(17*1.5)+' 17'});
					snum = keyseries[s].getAttribute('data-series');

				}else{
					// Get the SVG item and use it
					icon = keyseries[s].querySelector('svg').cloneNode(true);
					setAttr(icon,{'overflow':'visible','height':'1em','style':''});

					// If this is HTML containing SVG get the text from a span
					txt.innerHTML = keyseries[s].querySelector('span').innerHTML;
					
					snum = keyseries[s].querySelector('.marker').getAttribute('data-series');
				}

				// Remove any text from the icon
				if(icon.querySelector('text')) icon.querySelector('text').parentNode.removeChild(icon.querySelector('text'));

				add(icon,keyitem);
				add(txt,keyitem);

				setAttr(icon.querySelector('.data-series'),{'transform':''});
				setAttr(keyitem,{'data-series':snum,'tabindex':0,'title':'Highlight series: '+txt.innerHTML});

				// Add the events for mouseover, keydown, click and mouseout
				addEv('mouseover',keyitem,{'this':this,'s':snum},this.highlightSeries);
				addEv('keydown',keyitem,{'this':this,'s':snum},function(e){
					if(e.keyCode==13){
						e.preventDefault();
						this.toggleSeries(e);
					}
				});
				addEv('click',keyitem,{'this':this,'s':keyseries[s].getAttribute('data-series')},this.setSeries);
				addEv('mouseout',keyitem,{'this':this,'s':null},this.highlightSeries);
			}
			// Hide the original key
			key.style.display = 'none';
			addEv('mouseleave',el,{'this':this,'s':''},this.reset);
		}
		return this;
	}

	root.OI.InteractiveChart = function(el){ return new InteractiveChart(el); };

	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}
})(window || this);

OI.ready(function(){
	var charts = document.querySelectorAll('.chart');
	for(var i = 0; i < charts.length; i++){
		OI.InteractiveChart(charts[i]);
	}
});