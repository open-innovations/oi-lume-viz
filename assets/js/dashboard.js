/*
	Open Innovations Dashboard Interactivity v0.2
	Adds "animation" to numbers in ".oi-dashboard" elements of the form:
	<div class="oi-dashboard">
		<div class="oi-dashboard-inner">
			<div class="panel">
				<span class="bignum" data="37" data-prefix="£" data-postfix="p">£37p</span>
			</div>
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

		this.init = function(){
			scrolled();
		};

		return this;
	}

	function AugmentDashboards(){
		// Find all the dashboards on the page
		var dashboards = document.querySelectorAll(".oi-dashboard");
		// A function to "animate" the number when first seen
		function animateNumber(el,val,duration){
			var start,pre,post,v,prec;
			// Get the number from the data attribute (or the HTML content if not set)
			if(typeof val!=="number"){
				val = el.getAttribute('data')||el.innerHTML;
				if(val) val = parseFloat(val);
			}
			start = new Date();
			pre = el.getAttribute('data-prefix')||'';
			post = el.getAttribute('data-postfix')||'';
			prec = el.getAttribute("data-precision") ? parseFloat(el.getAttribute("data-precision")) : "";
			if(typeof duration!=="number") duration = 500;
			function frame(){
				var now,f;
				now = new Date();
				// Set the current time in milliseconds
				f = (now - start)/duration;
				if(f < 1){
					v = formatNumber(Math.round(val*f),prec);
					el.innerHTML = pre+v+post;
					window.requestAnimFrame(frame);
				}else{
					el.innerHTML = (pre||"")+formatNumber(val,prec)+(post||"");
				}
			}
			// If the value is a number we animate it
			if(typeof val==="number" && !isNaN(val)) frame();
			return;			
		}
		// Shorten big numbers
		function formatNumber(v,p){
			if(typeof v !== "number") return v;
			if (v > 1e10) return toPrecision(v / 1e9,(p ? p/1e9 : 1)) + "B";
			if (v > 1e9) return toPrecision(v / 1e9,(p ? p/1e9 : 0.1)) + "B";
			if (v > 1e7) return toPrecision(v / 1e6,(p ? p/1e6 : 1)) + "M";
			if (v > 1e6) return toPrecision(v / 1e6,(p ? p/1e6 : 0.1)) + "M";
			if (v > 1e4) return toPrecision(v / 1e3,(p ? p/1e3 : 1)) + "k";
			if (v > 1e3) return toPrecision(v / 1e3,(p ? p/1e3 : 0.1)) + "k";
			return toPrecision(v,p);
		}
		function countDecimals(v){
			var txt = v.toString();
			// If it is in scientific notation
			if(txt.indexOf('e-') > -1){
				var [base, trail] = txt.split('e-');
				return parseInt(trail, 10);
			}
			// Otherwise count decimals
			if(Math.floor(v) !== v) return v.toString().split(".")[1].length || 0;
			return 0;
		}
		function toPrecision(v,prec){
			if(typeof prec!=="number") return v;
			var n = Math.round(v/prec);
			var dp = countDecimals(prec);
			// Rebuild the number
			v = prec*n;
			if(prec < 1) v = v.toFixed(dp);
			return v;
		}
		var monitor = new InView(dashboards);
		monitor.on('activate',{'test':'blah'},function(e){
			// Trigger the number animations on the panels
			var panels = e.el.querySelectorAll('.bignum');
			for(var p = 0; p < panels.length; p++) animateNumber(panels[p]);
		});
		monitor.init();
	}
	root.OI.AugmentDashboards = AugmentDashboards;

})(window || this);

OI.ready(function(){ OI.AugmentDashboards(); });