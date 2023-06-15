/*
	Open Innovations Dashboard Interactivity v0.2
	Adds "animation" to numbers in ".oi-dashboard" elements of the form:
	<div class="oi-dashboard">
		<div class="panel">
			<span class="bignum" data="37" data-prefix="£" data-postfix="p">£37p</span>
		</div>
	</div>
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
	
	if(!window.requestAnimFrame){
		// shim layer with setTimeout fallback
		window.requestAnimFrame = (function(){
			return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){ window.setTimeout(callback, 1000 / 60); };
		})();
	}

	function InView(els){
		var areas = [];
		var callback = {};

		// Add events (mouseover, mouseout, click)	
		this.on = function(type,prop,fn){
			if(typeof prop==="function" && !fn){
				fn = prop;
				prop = "";
			}
			if(typeof fn !== "function") return this;
			if(!callback) callback = {};
			if(!callback[type]) callback[type] = [];
			callback[type].push({ 'fn': fn, 'attr': prop });
			return this;
		};

		// Trigger a defined event with arguments. This is meant for internal use
		this.trigger = function(ev,args){
			if(typeof ev!=="string") return;
			if(typeof args!=="object") args = {};
			var i;
			var o = [];
			var ths = args['this']||args;
			if(typeof callback[ev]==="object"){
				for(i = 0 ; i < callback[ev].length ; i++){
					if(typeof callback[ev][i].fn==="function"){
						args.data = callback[ev][i].attr || {};
						o.push(callback[ev][i].fn.call(ths,args));
					}
				}
			}
			if(o.length > 0) return o;
		};

		this.add = function(els){
			var ok,i,a;
			for(i = 0; i < els.length; i++){
				ok = true;
				for(a = 0; a < areas.length; a++){
					if(areas[a].el==els[i]){ ok = false; continue; }
				}
				// Only add an element if we don't already have it
				if(ok) areas.push({'el':els[i],'activated':false,'visible':false});
			}
			return this;
		};

		// Check if the element is within the viewport
		function inViewport(el) {
			var b,w,h;
			b = el.getBoundingClientRect();
			h = el.offsetHeight;
			w = el.offsetWidth;
			return (b.top >= -h && b.left >= -w && b.right <= (window.innerWidth || document.documentElement.clientWidth) + w && b.bottom <= (window.innerHeight || document.documentElement.clientHeight) + h);
		}

		var _obj = this;

		function scrolled(){
			var a,ok;
			for(a = 0; a < areas.length; a++){
				ok = inViewport(areas[a].el);
				if(ok && !areas[a].activated){
					areas[a].activated = true;
					_obj.trigger('activate',areas[a]);
				}
				if(ok && !areas[a].visible) _obj.trigger('enter',areas[a]);
				if(!ok && areas[a].visible) _obj.trigger('leave',areas[a]);
				areas[a].visible = ok;
			}
		}

		document.addEventListener('scroll',scrolled);

		if(els) this.add(els);	// Add the elements

		return this;
	}

	function AugmentDashboards(){
		// Find all the dashboards on the page
		var dashboards = document.querySelectorAll(".oi-dashboard");
		// A function to "animate" the number when first seen
		function animateNumber(el,val,duration){
			var start,pre,post,v;
			// Get the number from the data attribute (or the HTML content if not set)
			if(typeof val!=="number"){
				val = el.getAttribute('data')||el.innerHTML;
				if(val) val = parseFloat(val);
				el.innerHTML = '';
			}
			start = new Date();
			pre = el.getAttribute('data-prefix')||'';
			post = el.getAttribute('data-postfix')||'';
			if(typeof duration!=="number") duration = 500;
			function frame(){
				var now,f;
				now = new Date();
				// Set the current time in milliseconds
				f = (now - start)/duration;
				if(f < 1){
					v = formatNumber(Math.round(val*f));
					el.innerHTML = pre+v+post;
					window.requestAnimFrame(frame);
				}else{
					el.innerHTML = (pre||"")+formatNumber(val)+(post||"");
				}
			}
			// If the value is a number we animate it
			if(typeof val==="number") frame();
			return;			
		}
		// Shorten big numbers
		function formatNumber(v){
			if(typeof v !== "number") return v;
			if(v > 1e7) return Math.round(v/1e6)+"M";
			if(v > 1e6) return (v/1e6).toFixed(1)+"M";
			if(v > 1e5) return Math.round(v/1e3)+"k";
			if(v > 1e4) return Math.round(v/1e3)+"k";
			return v;
		}
		var monitor = new InView(dashboards);
		monitor.on('activate',{'test':'blah'},function(e){
			// Trigger the number animations on the panels
			var panels = e.el.querySelectorAll('.bignum');
			for(var p = 0; p < panels.length; p++) animateNumber(panels[p]);
		});
	}
	root.OI.AugmentDashboards = AugmentDashboards;

})(window || this);

OI.ready(function(){ OI.AugmentDashboards(); });