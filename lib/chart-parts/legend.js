import { document } from '../document.ts';
import { Colour, ColourScale } from "../colour/colours.ts";

export function Legend(config){

	this.exists = function(){
		var ok = false;
		if(typeof config.legend==="object"){
			if(typeof config.legend.show==="boolean" && config.legend.show) ok = true;
			if(config.legend.items.length > 0) ok = true;
		}
		return ok;
	};
	this.isAbove = function(){ return (config.legend && typeof config.legend.position == "string" && config.legend.position.match("top")); };
	this.isBelow = function(){ return !this.isAbove(); };
	this.getDependencies = function(){ return (config.legend && (config.legend.show || config.legend.items.length > 0)) ? ['/css/legend.css'] : []; };
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

		if(config.legend && config.legend.items){
			
			if(method=="svg"){
				legend = document.createElement('g');
			}else{
				legend = document.createElement('div');
			}
			legend.classList.add('oi-legend-inner');
			//legend.classList.add('leaflet-control');
			legend.innerHTML = this.inner(method);
			container.appendChild(legend);
		}
		if(config.legend) html = container.outerHTML;

		return html;
	};
	this.inner = function(method){
		var colour,legend,cs;
		// Build a legend
		legend = '';
		// Get a colour scale
		if(config.scale){
			cs = ColourScale(config.scale);
		}
		if(config.legend && config.legend.items){
			for(var i = 0; i < config.legend.items.length; i++){
				colour = "black";
				if(config.legend.items[i].value) colour = config.legend.items[i].value;
				if(typeof cs==="function") colour = cs((config.legend.items[i].value-config.min)/(config.max-config.min));
				if(config.legend.items[i].colour) colour = config.legend.items[i].colour;

				if(method=="svg"){
					legend += '<g class="oi-legend-icon"><rect style="background:'+colour+'"></rect><text>' + config.legend.items[i].label + '</text></g>';
				}else{
					legend += '<div class="oi-legend-item"><i class="oi-legend-icon" style="background:'+colour+'"></i> <span class="oi-legend-label">' + config.legend.items[i].label + '</span></div>';
				}
			}
		}
		return legend;
	};
	return this;
}
