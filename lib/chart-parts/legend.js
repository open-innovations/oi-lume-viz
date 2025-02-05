import { document } from '../document.ts';
import { Colour, ColourScale } from "../colour/colours.ts";
import { defaultColourScale } from "../colour/colour-scale.ts";
import { Colours } from '../colour/colours.ts';
import { textLength,getFontFamily } from '../font/fonts.ts';

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
		let l,r,t,b;
		l = r = t = b = false;
		let pos = "top";
		if(config.legend && config.legend.position && typeof config.legend.position==="string") pos = config.legend.position;
		l = (pos.indexOf("left") >= 0 ? true : false);
		r = (pos.indexOf("right") >= 0 ? true : false);
		t = (pos.indexOf("top") >= 0 ? true : false);
		b = (pos.indexOf("bottom") >= 0 ? true : false);
		return {'left':l,'right':r,'top':t,'bottom':b}
	};

	this.outer = function(method){

		var container,legend,pos,sty="",html = "";

		// Create an element
		if(method=="svg"){
			container = document.createElement('g');
		}else{
			container = document.createElement('div');
		}

		if(config.legend) container.classList.add('oi-legend');

		if(config.legend){
			
			if(method=="svg") legend = document.createElement('g');
			else legend = document.createElement('div');

			legend.classList.add('oi-legend-inner');
			if(config.legend.continuous){
				pos = this.getPosition();
				config.legend.direction = (config.legend.direction || (pos.left || pos.right  ? "vertical" : "horizontal"));
				if(config.legend.direction != "horizontal" && config.legend.direction != "vertical") config.legend.direction = "horizontal";
				legend.classList.add('oi-continuous');
				legend.classList.add('oi-'+config.legend.direction);
				if(config.legend.direction=="horizontal") sty += 'width:'+(config.legend.size||'200px')+';';
				else sty += 'height:'+(config.legend.size||'200px')+';';
			}
			if(config.legend.itemWidth) sty += '--auto-grid-min-size:'+config.legend.itemWidth;
			if(sty) legend.setAttribute('style',sty);
			legend.innerHTML = this.inner(method);
			container.appendChild(legend);
		}
		if(config.legend) html = container.outerHTML;

		return html;
	};
	this.inner = function(method){
		var colour,legend,legenditem,legenditems,cs,i,v,gradient,pos,steps,l,label,longlabel,longest,font;
		// Build a legend
		legend = '';
		// Get a colour scale
		cs = ColourScale(config.scale||defaultColourScale());
		if(config.legend && config.legend.items){
			if(typeof config.legend.items.length!=="number"){
				console.log('Legend.inner()',config.legend);
				throw "Bad length of items array";
			}
			if(typeof config.min==="undefined") config.min = 0;
			if(typeof config.max==="undefined") config.max = 1;
			pos = this.getPosition();
			if(config.legend.continuous){
				steps = (typeof config.legend.steps==="number" ? Math.round(config.legend.steps) : 8);
				// Build our colour scale
				gradient = '';
				for(i = 0; i <= steps; i++) gradient += (gradient ? ', ':'')+cs(i/steps)+' '+(100*i/steps).toFixed(1)+'%';
				legend += '<div class="oi-legend-scale" style="background:linear-gradient(to '+(config.legend.direction=="vertical" ? 'top':'right')+', '+gradient+');"></div>'
				font = getFontFamily();
			}
			legend += '<div class="oi-legend-items">';
			legenditems = '';
			longest = 0;
			longlabel = '';
			for(i = 0; i < config.legend.items.length; i++){
				colour = "black";
				legenditem = '';
				v = config.legend.items[i].value;
				if(v){
					if(typeof v==="string" && v[v.length-1]=="%") v = (parseFloat(v)/100) * (config.max-config.min) + config.min;
					colour = v;
				}
				// If we have a number-based value try applying the colour scale
				if(typeof v==="number" && typeof cs==="function") colour = cs((v-config.min)/(config.max-config.min));
				if(config.legend.items[i].colour) colour = namedColours.get(config.legend.items[i].colour);

				label = (config.legend.items[i].label||"");
				if(method=="svg"){
					legenditem += '<g class="oi-legend-icon" data-series="'+(i+1)+'"><rect style="background:'+colour+'"></rect><text>' + (config.legend.items[i].label||"") + '</text></g>';
				}else{
					if(config.legend.continuous){
						legenditem += '<div class="oi-legend-item" style="'+(config.legend.direction=="vertical" ? 'top':'right')+':'+(100*(i/(config.legend.items.length-1))).toFixed(1)+'%;" data-i="'+(i+1)+'">';
						legenditem += '<span class="oi-legend-label">' + label + '</span>';
						legenditem += '</div>';
					}else{
						legenditem += '<div class="oi-legend-item" data-series="'+(i+1)+'" data-i="'+(i+1)+'">';
						if(config.legend.items[i].icon){
							legenditem += config.legend.items[i].icon;
						}else{
							legenditem += '<i class="oi-legend-icon" style="background:'+colour+'"></i>';
						}
						legenditem += '<span class="oi-legend-label">' + label + '</span>';
						legenditem += '</div>';
					}
				}
				if(pos.left || pos.right) legenditems += legenditem;
				else legenditems = legenditem+legenditems;
				
				// Work out if this is a longer label
				if(config.legend.continuous){
					l = textLength(label,16,"",font);
					if(l > longest){
						longest = l;
						longlabel = label;
					}
				}
			}
			legend += legenditems;
			// Need to make a dummy of the longest label to force the layout
			if(config.legend.continuous) legend += '<div class="oi-dummy oi-legend-item" style="visibility:hidden;position:relative;">' + longlabel + '</div>'
			legend += '</div>';
		}else{
			console.log('No items in ',config);
			throw "Bad items"
		}
		return legend;
	};
	return this;
}
