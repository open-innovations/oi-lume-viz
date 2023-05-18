(function(root){

	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		root.OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}

})(window || this);

OI.ready(function(){
	var styles = document.createElement('style');
	styles.innerHTML = '.anchor { display: inline; text-decoration:none; color: inherit; opacity: 0.1; margin-left: 0.25em; } .anchor:focus { outline: 2px solid #2254F4; opacity: 1; } .anchor svg { width: 1em; height: 1em; vertical-align: bottom; }';
	document.head.prepend(styles);

	// Apply the offset
	function offsetAnchor() {
		if(location.hash.length !== 0){
			var el = document.querySelector(location.hash);
			var y = Math.max(0,window.scrollY + el.getBoundingClientRect().top - 32);
			window.scrollTo(window.scrollX, y);
		}
	}
	offsetAnchor();

	// This will capture hash changes while on the page
	window.addEventListener("hashchange", offsetAnchor);

	function makeAnchor(a){
		a.addEventListener('click',function(e){
			e.preventDefault();
			offsetAnchor();
		});
		var p = a.parentNode;
		this.show = function(e){ a.style.opacity = 1; };
		this.hide = function(e){ a.style.opacity = ''; };
		p.style.cursor = 'pointer';
		p.addEventListener('click',function(){ location.href = '#'+a.getAttribute('id'); offsetAnchor(); a.focus(); });
		p.addEventListener('mouseover',this.show);
		p.addEventListener('mouseout',this.hide);
		a.addEventListener('focus',this.show);
	}

	var as = document.querySelectorAll('.anchor');
	for(var i = 0; i < as.length; i++) makeAnchor(as[i]);
});