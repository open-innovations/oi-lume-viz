import { document } from '../document.ts';
import { Colour, ColourScale } from "../colour/colours.ts";

export function Legend(config){

	this.outer = function(method){

		var container,legend;

		// Create an element
		if(method=="svg"){
			container = document.createElement('g');
		}else{
			container = document.createElement('div');
		}

		if(config.legend){
			if(!config.legend.position) config.legend.position = "bottom right";
			// Prefix the classes with "leaflet-"
			config.legend.position = config.legend.position.replace(/(^| )/g,function(m,p1){ return p1+'leaflet-'; });
			// Split the class up by spaces and apply each individually
			config.legend.position.split(/ /g).forEach(cls => { container.classList.add(cls); });
		}

		if(config.legend && config.legend.items){
			
			if(method=="svg"){
				legend = document.createElement('g');
			}else{
				legend = document.createElement('div');
			}
			legend.classList.add('oi-legend');
			legend.classList.add('leaflet-control');
			legend.innerHTML = this.inner(method);
			container.appendChild(legend);
		}

		return container.outerHTML;
	};
	this.inner = function(method){
		var colour,legend,cs;
		// Build a legend
		legend = '';
		// Get a colour scale
		if(config.scale){
			cs = ColourScale(config.scale);
			console.log(config.scale)
		}
		if(config.legend && config.legend.items){
			for(var i = 0; i < config.legend.items.length; i++){
				colour = "black";
				if(typeof cs==="function") colour = cs((config.legend.items[i].value-config.min)/(config.max-config.min));
				if(config.legend.items[i].colour) colour = config.legend.items[i].colour
				console.log(i,config.legend.items[i],colour,config.min,config.max);
				if(method=="svg"){
					legend += '<g class="oi-legend-item"><rect style="background:'+colour+'"></rect><text>' + config.legend.items[i].label + '</text></g>';
				}else{
					legend += '<div class="oi-legend-item"><i style="background:'+colour+'"></i> ' + config.legend.items[i].label + '</div>';
				}
			}
		}
		return legend;
	};
	return this;
}
