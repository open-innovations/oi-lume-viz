/*
	Open Innovations SVG interactivity v0.1.1
*/
(function(root){

	if(!root.OI) root.OI = {};

	// Version 1.1
	if(!root.OI.ready) root.OI.ready = function(fn){ if(document.readyState != 'loading'){ fn(); }else{ document.addEventListener('DOMContentLoaded', fn); } };

	// Add some CSS styling
	document.head.prepend(createEl('style',{'html':'.oi-map-inner { touch-action: none; } .oi-panzoom { display: inline-block; border: 0.125rem solid rgba(0,0,0,0.2); background: rgba(0,0,0,0.2); background-clip: padding-box; } .oi-panzoom button { display: block; width: 2.25rem; height: 2.25rem; border: 0; padding: 0; font-size: 1.5rem; line-height: 1em; margin-top: 0; } .oi-panzoom button:not([disabled=true]) { cursor: pointer; } .oi-panzoom button + button { margin-top: 1px; } .oi-draggable .oi-map-inner { cursor: move; }'}));

	// Global vars to cache event state
	const evCache = [];
	let prevDiff = -1;

	function SVGPanZoom(id,p,opt){

		let _obj = this;
		let el,viewBox,orig,anim,zoom,timeout,target,isPointerDown = false,origin,zi,zo,rt,active;

		if(!opt) opt = {};
		if(typeof opt.draggable!=="boolean") opt.draggable = true;
		if(typeof opt.zoomable!=="boolean") opt.zoomable = true;
		if(typeof opt.scrollWheelZoom!=="boolean") opt.scrollWheelZoom = true;
		if(typeof opt.minZoom!=="number") opt.minZoom = 1;
		if(typeof opt.zoom!=="number") opt.zoom = 1;
		if(typeof opt.maxZoom!=="number") opt.maxZoom = 4;

		if(!opt.position) opt.position = "top left";

		let viz = p.closest('.oi-viz');
		let holder = viz.querySelector('.oi-map-holder');
		let svg = viz.querySelector('svg.oi-map-map');

		// Find out where to attach the controls
		let pel = viz.querySelector(opt.position.replace(/(^|\s)(top|bottom|left|right)/g,function(m,p1,p2){ return ".oi-"+p2; }))||p;

		if(!opt.draggable && !opt.zoomable) return this;

		zoom = opt.zoom;

		// This function returns an object with x/y values from the pointer event
		function getPoint(e){
			// If event is triggered by a touch event, we get the position of the first finger
			if(e.targetTouches){
				point.x = e.targetTouches[0].clientX;
				point.y = e.targetTouches[0].clientY;
			}else{
				point.x = e.clientX;
				point.y = e.clientY;
			}
		  
			// We get the current transformation matrix of the SVG and we inverse it
			var invertedSVGMatrix = svg.getScreenCTM().inverse();

			return point.matrixTransform(invertedSVGMatrix);
		}

		// Update any active tooltips
		function updateTooltip(state){
			if(OI && OI.Tooltips){
				if(typeof state==="boolean"){
					if(state) OI.Tooltips.enable();
					else OI.Tooltips.disable();
				}
				if(active){
					OI.Tooltips.update();
					let tt = active.el.getBoundingClientRect();
					let bb = holder.getBoundingClientRect();
					if(tt.left+tt.width/2 > bb.right || tt.right-tt.width/2 < bb.left || tt.bottom-tt.height/2 < bb.top || tt.top+tt.height/2 > bb.bottom) active.unlock().clear();
					else active.show();
				}
			}
		}

		// Function called by the event listeners when user start pressing/touching
		function onPointerDown(e){
			isPointerDown = true; // We set the pointer as down
			active = OI.Tooltips.active;
			updateTooltip(false);
			// We get the pointer position so we can get the value once the user starts to drag
			origin = getPoint(e);
			evCache.push(e);
		}

		// Function called by the event listeners when user start moving/dragging
		function onPointerMove(e){
			// Only run this function if the pointer is down
			if(!isPointerDown) return;

			// Find this event in the cache and update its record with this event
			evCache[evCache.findIndex( (cachedEv) => cachedEv.pointerId === e.pointerId )] = e;

			if(evCache.length === 2){
				// Pinch gestures
				// Calculate the distance between the two pointers
				const curDiff = Math.sqrt(Math.pow(evCache[0].clientX - evCache[1].clientX,2) + Math.pow(evCache[0].clientY - evCache[1].clientY,2));
				if(prevDiff > 0){
					const a = getPoint(evCache[0]);
					const b = getPoint(evCache[1]);
					const mid = {x:(a.x+b.x)/2,y:(a.y+b.y)/2};
					if(curDiff > prevDiff) Zoom(0.05,mid);
					else if(curDiff < prevDiff) Zoom(-0.05,mid);
				}
				// Cache the distance for the next move event
				prevDiff = curDiff;
			}else{
				// Just one pointer
				clearAnimation();
				e.preventDefault();
				// Get the pointer position as an SVG Point
				var pos = getPoint(e);
				// Update the viewBox with the distance from origin and current position
				viewBox.x -= (pos.x - origin.x);
				viewBox.y -= (pos.y - origin.y);
			}
			updateTooltip();
			updateControls();
		}

		function onPointerUp(e){
			isPointerDown = false;
			// Remove this pointer from the cache
			removeEvent(e);
			// If the number of pointers down is less than two then reset diff tracker
			if(evCache.length < 2) prevDiff = -1;
		}

		function Zoom(z,pt,s){
			// If it is already animating
			if(timeout) clearTimeout(timeout);
			if(target){
				viewBox.x = target.x;
				viewBox.y = target.y;
				viewBox.width = target.width;
				viewBox.height = target.height;
				target = null;
			}

			// Update the zoom factor
			zoom += z;
			// Update the zoom out button
			buttonDisable(zo,zoom <= opt.minZoom);
			if(zoom <= opt.minZoom) zoom = opt.minZoom;
			// Update the zoom in button
			buttonDisable(zi,zoom >= opt.maxZoom);
			if(zoom >= opt.maxZoom) zoom = opt.maxZoom;

			// Use the centre if no point given
			if(typeof pt==="undefined") pt = {x:viewBox.width/2 + viewBox.x,y:viewBox.height/2 + viewBox.y};

			let xPropW = (pt.x - viewBox.x)/viewBox.width;
			let yPropH = (pt.y - viewBox.y)/viewBox.height;
			let scale = Math.pow(2,zoom-1);
			let w2 = orig.width/scale;
			let h2 = orig.height/scale;

			_obj.setViewBox({'x':(pt.x - xPropW * w2),'y':(pt.y - yPropH * h2),'width':w2,'height':h2},s);

			return this;
		}

		function buttonDisable(btn,state){
			if(state) btn.setAttribute('disabled',true);
			else btn.removeAttribute('disabled');
		}

		function updateControls(){
			// Update reset button
			if(rt) buttonDisable(rt,(viewBox.x == orig.x && viewBox.y == orig.y && viewBox.width == orig.width && viewBox.height == orig.height));

			// Update zoom out button
			if(zo) buttonDisable(zo,zoom <= opt.minZoom);

			// Update zoom in button
			if(zi) buttonDisable(zi,zoom >= opt.maxZoom);

			return false;
		}

		if(svg){
			// We save the original values from the viewBox
			viewBox = svg.viewBox.baseVal;
			orig = {'x':viewBox.x,'y':viewBox.y,'width':viewBox.width,'height':viewBox.height};

			if(opt.draggable) viz.classList.add('oi-draggable');

			el = viz.querySelector('.oi-panzoom');
			// Remove any existing controls
			if(el) el.remove();

			el = createEl('div',{'class':'oi-panzoom'});
			if(opt.zoomable){
				zi = createEl('button',{'html':'+','class':'oi-zoom-in','attr':{'title':'Zoom in','aria-label':'Zoom in'}});
				el.appendChild(zi);
				zi.addEventListener('click',function(){ Zoom(1); });
			}
			rt = createEl('button',{'html':'&#10226;','class':'oi-zoom-reset','attr':{'title':'Reset view','aria-label':'Reset view'}});
			rt.addEventListener('click',function(){ _obj.reset(); });
			el.appendChild(rt);
			if(opt.zoomable){
				zo = createEl('button',{'html':'&minus;','class':'oi-zoom-out','attr':{'title':'Zoom out','aria-label':'Zoom out'}});
				el.appendChild(zo);
				zo.addEventListener('click',function(){ Zoom(-1); });
			}
			pel.append(el);

			// Create an SVG point that contains x & y values
			var point = svg.createSVGPoint();

			if(opt.zoomable && opt.scrollWheelZoom){
				holder.addEventListener('wheel',function(e){
					e.preventDefault();
					if(timeout) clearTimeout(timeout);
					Zoom((e.deltaY < 0 ? 1 : -1),getPoint(e));
				});
			}

			if(opt.draggable){
				// If browser supports pointer events
				if(window.PointerEvent) {
					holder.addEventListener('pointerdown', onPointerDown);
					holder.addEventListener('pointerup', onPointerUp);
					holder.addEventListener('pointerleave', onPointerUp);
					holder.addEventListener('pointermove', onPointerMove);
				}else{
					// Add all mouse events listeners fallback
					holder.addEventListener('mousedown', onPointerDown);
					holder.addEventListener('mouseup', onPointerUp);
					holder.addEventListener('mouseleave', onPointerUp);
					holder.addEventListener('mousemove', onPointerMove);
					// Add all touch events listeners fallback
					holder.addEventListener('touchstart', onPointerDown);
					holder.addEventListener('touchend', onPointerUp);
					holder.addEventListener('touchmove', onPointerMove);
				}
			}
			updateControls();
		}else{
			console.warn('No SVG element to attach zoom to');
		}

		function clearAnimation(){
			if(anim){
				anim.remove();
				anim = null;
			}
		}

		this.reset = function(){
			zoom = opt.zoom;
			clearAnimation();
			this.setViewBox(orig,0);
			return this;
		};

		this.setViewBox = function(vb,s,fn){
			target = vb;
			// Set a default zoom time
			if(typeof s!=="number") s = 0.2;

			function done(){
				viewBox.x = vb.x;
				viewBox.y = vb.y;
				viewBox.width = vb.width;
				viewBox.height = vb.height;
				updateControls();
				updateTooltip(true);
				if(typeof fn==="function") fn.call();
			}

			if(s > 0){
				// Create an <animate> element
				if(!anim){
					anim = document.createElementNS('http://www.w3.org/2000/svg','animate');
					svg.prepend(anim);
				}
				// Set the attributes
				setAttr(anim,{'attributeName':'viewBox','to':vb.x+' '+vb.y+' '+vb.width+' '+vb.height,'dur':s+'s','fill':'freeze'});
				anim.beginElement();
				// Set a timeout to update the viewBox variable at the end of the animation
				timeout = setTimeout(done,s*1000);
			}else{
				done();
			}
			return this;
		};

		return this;
	}

	function setAttr(el,prop){
		for(var p in prop) el.setAttribute(p,prop[p]);
		return el;
	}

	function createEl(typ,o){
		if(!o) o = {};
		let el = (o.ns ? document.createElementNS(o.ns,typ) : document.createElement(typ));
		if(typeof o.class==="string") el.classList.add(...(o.class.split(/ /)));
		if(typeof o.style==="object") Object.assign(el.style,o.style);
		if(typeof o.attr==="object") setAttr(el,o.attr);
		if(typeof o.html==="string") el.innerHTML = o.html;
		return el;
	}

	function removeEvent(ev) {
		// Remove this event from the target's cache
		const index = evCache.findIndex((cachedEv) => cachedEv.pointerId === ev.pointerId);
		evCache.splice(index, 1);
	}

	// Create a visible list of filters so that a filter can be updated later if necessary
	function List(){
		var arr = {};
		this.add = function(id,el,opt){
			if(id in arr) console.warn('Pan/zoom controls already exist for '+id);
			else arr[id] = new SVGPanZoom(id,el,opt);
			return this;
		};
		this.get = function(id){
			if(id in arr) return arr[id];
			return arr;
		};
		return this;
	}

	root.OI.SVGPanZoom = new List();

})(window || this);