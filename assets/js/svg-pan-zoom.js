/*
	Open Innovations SVG interactivity v0.1
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

	// Add some CSS styling
	var styles = document.createElement('style');
	styles.innerHTML = '.oi-map-inner { touch-action: none; } .oi-zoom-control { display: inline-block; border: 0.125rem solid rgba(0,0,0,0.2); background: rgba(0,0,0,0.2); background-clip: padding-box; } .oi-zoom-control button { display: block; width: 2.25rem; height: 2.25rem; border: 0; padding: 0; font-size: 1.5rem; line-height: 1em; margin-top: 0; } .oi-zoom-control button:not([disabled=true]) { cursor: pointer; } .oi-zoom-control button + button { margin-top: 1px; } .oi-draggable .oi-map-inner { cursor: move; }';
	document.head.prepend(styles);

	function SVGPanZoom(id,p,opt){

		let _obj = this;
		let el,viewBox,orig,anim,zoom,timeout,target,isPointerDown = false,pointerOrigin,zi,zo,rt,active,pos = [];

		if(!opt) opt = {};
		if(typeof opt.draggable!=="boolean") opt.draggable = true;
		if(typeof opt.zoomable!=="boolean") opt.zoomable = true;
		if(typeof opt.scrollWheelZoom!=="boolean") opt.scrollWheelZoom = true;
		if(typeof opt.minZoom!=="number") opt.minZoom = 1;
		if(typeof opt.zoom!=="number") opt.zoom = 1;
		if(typeof opt.maxZoom!=="number") opt.maxZoom = 4;

		if(!opt.position) opt.position = "top left";
		if(opt.position.match("top")) pos.push(".oi-top");
		if(opt.position.match("bottom")) pos.push(".oi-bottom");
		if(opt.position.match("left")) pos.push(".oi-left");
		if(opt.position.match("right")) pos.push(".oi-right");

		let viz = p.closest('.oi-viz');
		let pel = viz.querySelector(pos.join(""))||p;
		let inner = viz.querySelector('.oi-map-inner');
		let svg = viz.querySelector('svg.oi-map-map');
		
		if(!opt.draggable && !opt.zoomable) return this;

		zoom = opt.zoom;

		// This function returns an object with X & Y values from the pointer event
		function getPointFromEvent(event){
		  
		  // If even is triggered by a touch event, we get the position of the first finger
			if(event.targetTouches){
				point.x = event.targetTouches[0].clientX;
				point.y = event.targetTouches[0].clientY;
			}else{
				point.x = event.clientX;
				point.y = event.clientY;
			}
		  
			// We get the current transformation matrix of the SVG and we inverse it
			var invertedSVGMatrix = svg.getScreenCTM().inverse();

			return point.matrixTransform(invertedSVGMatrix);
		}

		function updateTooltip(){
			if(root.OI.Tooltips && root.OI.Tooltips.active){
				active = root.OI.Tooltips.active;
			}
			if(active){
				root.OI.Tooltips.update();
				let tt = active.el.getBoundingClientRect();
				let bb = inner.getBoundingClientRect();
				if(tt.left > bb.right || tt.right < bb.left || tt.bottom < bb.top || tt.top > bb.bottom) active.unlock().clear();
				else active.show();
			}
		}

		// Function called by the event listeners when user start pressing/touching
		function onPointerDown(event){
			isPointerDown = true; // We set the pointer as down
			updateTooltip();
			// We get the pointer position on click/touchdown so we can get the value once the user starts to drag
			pointerOrigin = getPointFromEvent(event);
		}

		// Function called by the event listeners when user start moving/dragging
		function onPointerMove(event){
			// Only run this function if the pointer is down
			if(!isPointerDown) return;

			clearAnimation();

			// This prevent user to do a selection on the page
			event.preventDefault();

			// Get the pointer position as an SVG Point
			var pointerPosition = getPointFromEvent(event);

			// Update the viewBox variable with the distance from origin and current position
			// We don't need to take care of a ratio because this is handled in the getPointFromEvent function
			viewBox.x -= (pointerPosition.x - pointerOrigin.x);
			viewBox.y -= (pointerPosition.y - pointerOrigin.y);

			updateTooltip();
			updateControls();
		}

		function onPointerUp(){
			// The pointer is no longer considered as down
			isPointerDown = false;
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

			let width = viewBox.width;
			let height = viewBox.height;
			let xPropW = (pt.x - viewBox.x)/width;
			let yPropH = (pt.y - viewBox.y)/height;
			let scale = Math.pow(2,zoom-1);
			console.log(zoom,z,scale);
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

			el = viz.querySelector('.oi-zoom-control');
			// Remove any existing controls
			if(el) el.remove();

			el = document.createElement('div');
			el.classList.add('oi-zoom-control');
			if(opt.zoomable){
				zi = document.createElement('button');
				zi.innerHTML = '+';
				zi.classList.add('oi-zoom-in');
				el.appendChild(zi);
				zi.addEventListener('click',function(){ Zoom(1); });
			}
			rt = document.createElement('button');
			rt.innerHTML = '&#10226;';
			rt.classList.add('oi-zoom-reset');
			rt.addEventListener('click',function(){ _obj.reset(); });
			el.appendChild(rt);
			if(opt.zoomable){
				zo = document.createElement('button');
				zo.innerHTML = '&minus;';
				zo.classList.add('oi-zoom-out');
				el.appendChild(zo);
				zo.addEventListener('click',function(){ Zoom(-1); });
			}
			pel.append(el);


			// Create an SVG point that contains x & y values
			var point = svg.createSVGPoint();

			if(opt.zoomable && opt.scrollWheelZoom){
				inner.addEventListener('wheel',function(e){
					e.preventDefault();
					Zoom((e.deltaY < 0 ? 1 : -1),getPointFromEvent(e));
				});
			}

			if(opt.draggable){
				// If browser supports pointer events
				if(window.PointerEvent) {
					inner.addEventListener('pointerdown', onPointerDown);
					inner.addEventListener('pointerup', onPointerUp);
					inner.addEventListener('pointerleave', onPointerUp);
					inner.addEventListener('pointermove', onPointerMove);
				}else{
					// Add all mouse events listeners fallback
					inner.addEventListener('mousedown', onPointerDown);
					inner.addEventListener('mouseup', onPointerUp);
					inner.addEventListener('mouseleave', onPointerUp);
					inner.addEventListener('mousemove', onPointerMove);
					// Add all touch events listeners fallback
					inner.addEventListener('touchstart', onPointerDown);
					inner.addEventListener('touchend', onPointerUp);
					inner.addEventListener('touchmove', onPointerMove);
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
			if(typeof s!=="number") s = 0.3;

			function done(){
				viewBox.x = vb.x;
				viewBox.y = vb.y;
				viewBox.width = vb.width;
				viewBox.height = vb.height;
				updateControls();
				updateTooltip();
				if(typeof fn==="function") fn.call();
			}

			if(s > 0){
				// Create an <animate> element
				if(!anim){
					anim = document.createElementNS('http://www.w3.org/2000/svg','animate');
					svg.prepend(anim);
				}
				// Set the attributes
				anim.setAttribute('attributeName','viewBox');
				anim.setAttribute('to',vb.x+' '+vb.y+' '+vb.width+' '+vb.height);
				anim.setAttribute('dur',s+'s');
				anim.setAttribute('fill','freeze');
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

	// Create a visible list of filters so that 
	// a filter can be updated later if necessary
	function List(){
		var arr = {};
		this.add = function(id,el,opt){
			if(id in arr) console.warn('The zoom already exists for '+id);
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