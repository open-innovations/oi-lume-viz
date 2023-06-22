import { addVirtualColumns, thingOrNameOfThing } from "../../../lib/helpers.ts";
import { clone } from "../../../lib/util/clone.ts";
import { svgEl, setAttr } from "../../../lib/util/dom.ts";
import { mergeDeep } from '../../../lib/util/merge-deep.ts';
import { getFontFamily, getFontWeight, getFontSize } from '../../../lib/font/fonts.ts';
import { getIcons } from '../../../lib/icon/icons.ts';


//const defaultbg = getBackgroundColour();
const fontFamily = getFontFamily();
const fontWeight = getFontWeight();
//const fontSize = getFontSize();
const icons = getIcons();


export function buildLayers(config,input){

	let l,lyrs = [];

	// If no layers are defined we build them
	if(typeof config.layers!=="object"){

		// Add tileLayer
		if(typeof config.tileLayer==="object"){
			lyrs.push({'type':'tile','props':clone(config.tileLayer)});
		}

		// Add the background layer
		if(config.background){
			l = config.background;
			l.type = "background";
			lyrs.push(l);
		}

		// Add the data layer
		if(config.data && config.data.length > 0){
			l = {'type':'data'};
			if(typeof config.key==="string") l.key = config.key;
			if(typeof config.value==="string") l.value = config.value;
			if(typeof config.tooltip==="string") l.tooltip = config.tooltip;
			if(typeof config.scale==="string") l.scale = config.scale;
			if(typeof config.min=="number") l.min = config.min;
			if(typeof config.max=="number") l.max = config.max;
			if(config.geojson) l.geojson = clone(config.geojson);
			l.data = clone(config.data);
			lyrs.push(l);
		}

		// Add any graticule layer
		if(config.graticule){
			l = config.graticule;
			l.type = "graticule";
			lyrs.push(l);
		}

		// Add labels
		if(typeof config.places==="object" && config.places.length > 0){
			lyrs.push({'type':'labels','labels':config.places});
		}

		// Add labelLayer
		if(typeof config.labelLayer==="object"){
			lyrs.push({'type':'labels','props':clone(config.labelLayer)});
		}

		// Add markers
		if(typeof config.markers==="object" && config.markers.length > 0){
			lyrs.push({'type':'markers','markers':config.markers});
		}

		config.layers = lyrs;
	}

	// Load any "data" attributes
	for(let l = 0; l < config.layers.length; l++){

		if(config.layers[l].places){
			config.layers[l].labels = config.layers[l].places;
			delete config.layers[l].places;
		}

		if(config.layers[l].type=="data"){

			if(typeof config.layers[l].data==="undefined" && typeof config.data==="object"){
				// If no data has been set use the higher level data
				config.layers[l].data = clone(config.data);
			}

			if(typeof config.layers[l].columns==="undefined" && typeof config.columns==="object"){
				// If no virtual columns have been set use any set at the higher level
				config.layers[l].columns = clone(config.columns);
			}

		}

		// If the data is a string we need to try loading it
		if(typeof config.layers[l].data==="string"){
			config.layers[l].data = clone(thingOrNameOfThing<TableData<string | number>>(
				config.layers[l].data,
				input
			));
//console.log('Loaded data for '+config.layers[l].type);
		}
		
		// If we've provided a string for GeoJSON, we build an object
		if(typeof config.layers[l].geojson==="string"){
			config.layers[l].geojson = { 'data': config.layers[l].geojson };
		}
		
		if(typeof config.layers[l].geojson==="object"){
			// We need to update the GeoJSON in case we need to call on values
			if(typeof config.layers[l].geojson.data==="string"){
				config.layers[l].geojson.data = thingOrNameOfThing<TableData<string | number>>(
					config.layers[l].geojson.data,
					input,
				);
			}
			// If the GeoJSON object doesn't contain a type: FeatureCollection we stop
			if(!config.layers[l].geojson.data.type || config.layers[l].geojson.data.type !== "FeatureCollection"){
				console.error(config.layers[l].geojson);
				throw new Error("No FeatureCollection in the GeoJSON");
			}
		}

		// Now create any required virtual columns
		if(config.layers[l].data) config.layers[l].data = addVirtualColumns(config.layers[l]);

	}
	// Tidy up by removing the original data/geojson structures
	delete config.data;
	delete config.geojson;
	delete config.columns;
	delete config.background;

	/*
	delete config.scale;
	delete config.value;
	delete config.key;
	delete config.places;
	delete config.markers;
	delete config.tooltip;
	*/

	return config;
}

export function Layer(attr,map,i){
	if(!attr.id){
		console.error('Layer does not have an ID set');
		return {};
	}
	this.id = attr.id;

	this.data = attr.data||[];
	this.geojson = attr.geojson||{};
	
	this.attr = (attr || {});
	this.options = (this.attr.options || {});
	if(!this.options.fillOpacity) this.options.fillOpacity = 1;
	if(!this.options.opacity) this.options.opacity = 1;
	if(!this.options.color) this.options.color = '#000000';
	if(typeof this.options.useforboundscalc==="undefined") this.options.useforboundscalc = true;

	var g = svgEl('g');
	var gs;
	setAttr(g,{'class':this.class||attr.class||this.id});

	if(map && map.svg){
		if(typeof i==="number"){
			gs = map.svg.querySelectorAll('g');
			gs[i].insertAdjacentElement('beforebegin', g);
		}else{
			map.svg.appendChild(g);
		}
	}

	this.clear = function(){ g.innerHTML = ''; return this; };

	// Function to draw it on the map
	this.update = function(){
		// Clear existing layer
		this.clear();
		// Find the map bounds and work out the scale
		var f,feature,w,h,g2,p,c,d,xy,tspan,scale,cls;
		w = map.w;
		h = map.h;

//console.log('update',this,attr);
		if(this.geojson && this.geojson && this.geojson.features){

			for(f = 0; f < this.geojson.features.length; f++){
				if(this.geojson.features[f]){
					feature = this.geojson.features[f];
					c = feature.geometry.coordinates;
					g2 = svgEl('g');

					if(feature.geometry.type == "MultiPolygon" || feature.geometry.type == "Polygon"){
						cls = "area";
						p = svgEl('path');
						setAttr(p,{
							'stroke': this.options.color||this.options.stroke,
							'stroke-opacity':this.options.opacity,
							'stroke-width': this.options['stroke-width']
						});
						d = map.projection.toPath(feature);
						setAttr(p,{
							'd':d,
							'fill': this.options.color||this.options.fill,
							'fill-opacity': this.options.fillOpacity,
							'vector-effect':'non-scaling-stroke',
							'stroke': this.options.stroke||this.options.color,
							'stroke-width': this.options['stroke-width']||(this.id=="background" ? '0' : '0.4%'),
							'stroke-opacity': this.options['stroke-opacity']||1
						});
						if(typeof attr.style==="function") attr.style.call(this,feature,p,cls);
					}else if(feature.geometry.type == "MultiLineString" || feature.geometry.type == "LineString"){
						cls = "line";
						p = svgEl('path');
						setAttr(p,{
							'stroke': this.options.color||this.options.stroke,
							'stroke-opacity':this.options.opacity,
							'stroke-width': this.options['stroke-width']
						});
						d = map.projection.toPath(feature);
						setAttr(p,{
							'd':d,
							'fill':'transparent',
							'vector-effect':'non-scaling-stroke'
						});
						if(typeof attr.style==="function") attr.style.call(this,feature,p,cls);
					}else if(feature.geometry.type == "Point"){
						cls = "point";
						xy = map.projection.latlon2xy(c[1],c[0],map.zoom);

						var opt = {};

						// If there is no icon and no name label, create a default icon
						if(!feature.properties.icon && !feature.name) feature.properties.icon = "default";

						if(feature.properties.icon){
							var icon = {'size':[40,40]};

							if(typeof feature.properties.icon==="string"){
								if(!icons[feature.properties.icon]){
									throw("No icon known with name \""+feature.properties.icon+"\"");
								}
								icon = mergeDeep(icon,icons[feature.properties.icon]);
							}else{
								icon = mergeDeep(icon,feature.properties.icon);
							}

							if(!icon.svg){
								throw("No SVG provided for icon");
							}
							// Set default anchor position
							if(!icon.anchor) icon.anchor = [icon.size[0]/2,0];
							var txt = icon.svg;
							var style = {'icon':icon,'color':'black'};
							if(feature.properties.colour) style.color = feature.properties.colour;

							mergeDeep(style,feature.properties);

							if(txt){
								// We want to get the contents of the SVG and the attributes
								txt = txt.replace(/<svg([^>]*)>/,function(m,attrs){
									attrs.replace(/([^\s]+)\=[\"\']([^\"\']+)[\"\']/g,function(m,key,value){
										opt[key] = value;
										return "";
									});
									return "";
								}).replace(/<\/svg>/,"");

								// Clean up tags to make sure we have explicit closing tags
								txt = txt.replace(/<([^\s]+)\s([^\>]+)\s*\/\s*>/g,function(m,p1,p2){ return "<"+p1+" "+p2+"></"+p1+">"; });

								scale = 1;

								p = svgEl('svg');
								p.setAttribute('vector-effect','non-scaling-stroke');
								p.innerHTML = txt;
								mergeDeep(opt,{
									'viewBox': '0 0 16 16',
									// Shift the x/y values to adjust for iconAnchor and iconSize
									'x': (xy.x + (-(icon.size[0] - icon.anchor[0])*scale)).toFixed(2),
									'y': (xy.y + (-(icon.size[1] - icon.anchor[1])*scale)).toFixed(2)
								});
								setAttr(p,opt);
								p.setAttribute('width',icon.size[0]*scale);
								p.setAttribute('height',icon.size[1]*scale);

								// Add title to the SVG
								if(feature.properties.tooltip){
									var t = svgEl('title');
									t.innerHTML = feature.properties.tooltip;
									p.querySelector(':first-child').appendChild(t);
									p.classList.add('marker');
								}
							}else{
								console.error(feature);
								throw('Bad icon');
							}
							if(p){
								if(typeof attr.style==="function") attr.style.call(this,feature,p,cls);
								p.setAttribute('style','color:'+(style.color)+';');
							}

						}else{
							cls = "text";
							p = svgEl('text');
							tspan = svgEl('tspan');
							tspan.innerHTML = feature.name;
							p.appendChild(tspan);
							mergeDeep(opt,{
								'fill': feature.style.colour||this.options.fill||this.options.color,
								'fill-opacity': this.options.fillOpacity,
								'font-weight': feature.style['font-weight']||this.options['font-weight']||fontWeight,
								'stroke': feature.style.border||this.options.stroke||this.options.color,
								'stroke-width': this.options['stroke-width']||'0.4%',
								'stroke-linejoin': this.options['stroke-linejoin'],
								'text-anchor': feature.style['text-anchor']||this.options.textAnchor||'middle',
								'font-family': feature.style['font-family']||fontFamily,
								'font-size': (feature.style['font-size'] ? feature.style['font-size'] : 1),
								'paint-order': 'stroke',
								'x': xy.x.toFixed(2),
								'y': xy.y.toFixed(2)
							});
							setAttr(p,opt);

							if(p && typeof attr.style==="function") attr.style.call(this,feature,p,cls);
						}
					}
					
					g2.classList.add(cls);
					if(p){
						g2.appendChild(p);
						g.appendChild(g2);
					}
				}
			}
		}else{
			console.warn('No data features',this.geojson);
		}
		return this;
	};

	this.load = function(){
		if(!this.geojson){
			console.error('No data structure given',this);
		}else{
			if(typeof attr.process==="function") attr.process.call(this,this.geojson||{},map);
			// Final callback
			if(typeof attr.callback==="function") attr.callback.call(map);
		}
	};

	return this;
}

