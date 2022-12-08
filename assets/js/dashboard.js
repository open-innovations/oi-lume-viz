/*
	Open Innovations Dashboard Interactivity v0.1
	Adds "animation" to numbers in ".dashboard" elements of the form:
	<div class="dashboard">
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

	function AugmentDashboards(){
		// Find all the dashboards on the page
		var dashboards = document.querySelectorAll(".dashboard");
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
		// Check if the element is within the viewport
		function inViewport(el) {
			var b,w,h;
			b = el.getBoundingClientRect();
			h = el.offsetHeight;
			w = el.offsetWidth;
			return (b.top >= -h && b.left >= -w && b.right <= (window.innerWidth || document.documentElement.clientWidth) + w && b.bottom <= (window.innerHeight || document.documentElement.clientHeight) + h);
		}
		// For each dashboard, check if "activated" is set. If not, animate the panels and set the attribute.
		function activateDashboards(){
			var d,p,panels;
			for(d = 0; d < dashboards.length; d++){
				if(!dashboards[d].getAttribute('activated') && inViewport(dashboards[d])){
					dashboards[d].setAttribute('activated',true);
					// Now trigger the number animations
					panels = dashboards[d].querySelectorAll('.bignum');
					for(p = 0; p < panels.length; p++) animateNumber(panels[p]);
				}
			}
		}
		// Attach the scroll event
		document.addEventListener('scroll', activateDashboards);
		// See if any dashboards need to be activated
		activateDashboards();
	}
	root.OI.AugmentDashboards = AugmentDashboards;

})(window || this);

OI.ready(function(){ OI.AugmentDashboards(); });