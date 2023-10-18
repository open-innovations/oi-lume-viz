import { document } from '../document.ts';
import { Colour, ColourScale } from "../colour/colours.ts";
import { Colours } from '../colour/colours.ts';

export function Legend(config){

	// Define some colours
	const namedColours = Colours(config.colours);

	this.exists = function(){
		var ok = false;
		if(typeof config.legend==="object"){
			if(typeof config.legend.position==="string") ok = true
			if(typeof config.legend.show==="boolean"){
				ok = config.legend.show;
			}
		}
		return ok;
	};
	this.isBelow = function(){ return (config.legend && typeof config.legend.position == "string" && config.legend.position.match("bottom")); };
	this.isAbove = function(){ return !this.isBelow(); };
	this.getDependencies = function(){
		if(typeof config.legend===undefined || (typeof config.legend==="object" && !this.exists())) return [];
		return ['/css/legend.css'];
	};
	this.getPosition = function(){
		// Allow:
		//   - top
		//   - bottom
		//   - top left/top right
		//   - bottom left/bottom right
		return config.legend.position||"bottom";
	};

	this.outer = function(method){

		var container,legend,html = "";

		// Create an element
		if(method=="svg"){
			container = document.createElement('g');
		}else{
			container = document.createElement('div');
		}

		if(config.legend){
			// Prefix the classes with "oi-legend-"
			var cls = 'oi-legend '+this.getPosition().replace(/(^| )/g,function(m,p1){ return p1+'oi-legend-'; });
			// Split the class up by spaces and apply each individually
			cls.split(/ /g).forEach(cls => { container.classList.add(cls); });
		}

		if(config.legend){
			
			if(method=="svg") legend = document.createElement('g');
			else legend = document.createElement('div');

			legend.classList.add('oi-legend-inner');
			if(config.legend.itemWidth){
				legend.setAttribute('style','--auto-grid-min-size:'+config.legend.itemWidth);
			}
			legend.innerHTML = this.inner(method);
			container.appendChild(legend);
		}
		if(config.legend) html = container.outerHTML;

		return html;
	};
	this.inner = function(method){
		var colour,legend,cs,i,v;
		// Build a legend
		legend = '';
		// Get a colour scale
		if(config.scale){
			cs = ColourScale(config.scale);
		}
		if(config.legend && config.legend.items){
			if(typeof config.legend.items.length!=="number"){
				console.log('Legend.inner()',config.legend);
				throw "Bad length of items array";
			}
			if(typeof config.min==="undefined") config.min = 0;
			if(typeof config.max==="undefined") config.max = 1;
			for(i = 0; i < config.legend.items.length; i++){
				colour = "black";
				v = config.legend.items[i].value;
				if(v){
					if(typeof v==="string" && v[v.length-1]=="%") v = (parseFloat(v)/100) * (config.max-config.min) + config.min;
					colour = v;
				}
				if(typeof cs==="function") colour = cs((v-config.min)/(config.max-config.min));
				if(config.legend.items[i].colour) colour = namedColours.get(config.legend.items[i].colour);

				if(method=="svg"){
					legend += '<g class="oi-legend-icon" data-series="'+(i+1)+'"><rect style="background:'+colour+'"></rect><text>' + (config.legend.items[i].label||"") + '</text></g>';
				}else{
					legend += '<div class="oi-legend-item" data-series="'+(i+1)+'">';
					if(config.legend.items[i].icon){
						legend += config.legend.items[i].icon;
					}else{
						legend += '<i class="oi-legend-icon" style="background:'+colour+'"></i>';
					}
					legend += '<span class="oi-legend-label">' + (config.legend.items[i].label||"") + '</span></div>';
				}
			}
		}else{
			console.log('No items in ',config);
			throw "Bad items"
		}
		return legend;
	};
	return this;
}
