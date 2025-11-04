/*
	Open Innovations Zoomable maps helper functions
	Helper function that finds ".calendar-chart rect" and adds tooltips to them.
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

	// Store the map in an array for the page
	if(!root.OI.maps) root.OI.maps = [];

	function ZoomableMap(id,el,attr){
		
		var list = [];
		var map = L.map(el,attr);
		if(typeof attr.attribution==="string" && map.attributionControl) map.attributionControl.setPrefix(attr.attribution);
		map.setView([0, 0], 2);
		var tiles,oldbounds = {};
		this.id = id;
		this.map = map;
		this.layers = list;

		this.addLayer = function(props){
			list.push(new Layer(props));
			lastlayer = list[list.length-1];
			if(lastlayer.props.layer){

				// Add the layer to the map
				lastlayer.props.layer.addTo(map);

				// Add popupopen function for markers
				if(lastlayer.props.markers){
					function wrap(el,colour) { const wrappingElement = document.createElement("div"); el.replaceWith(wrappingElement); wrappingElement.appendChild(el); }
					map.on("popupopen", function (e) {
						var colour = "";
						if(e.popup._source._path){
							colour = window.getComputedStyle(e.popup._source._path).fill;
						}else{
							colour = window.getComputedStyle(e.popup._source._icon.querySelector("div")).color;
						}
						el = e.popup._container;
						var style = "background-color:"+colour+"!important;color:"+OI.contrastColour(colour)+"!important;";
						el.querySelector(".leaflet-popup-content-wrapper").setAttribute("style",style);
						el.querySelector(".leaflet-popup-tip").setAttribute("style",style);
						el.querySelector(".leaflet-popup-close-button").setAttribute("style",style);
					});
				}
				
			}
			return this;
		};

		this.getLayer = function(i){
			if(i < list.length){
				return list[i];
			}else{
				console.warn("No list "+i);
			}
		};

		this.fitBounds = function(bounds){
			if(typeof bounds==="string" && bounds=="data"){
				for(var i = 0; i < list.length; i++){
					if(list[i].props.geo && list[i].props.layer){
						if(typeof bounds==="string") bounds = list[i].getBounds();
						else bounds = bounds.extend(list[i].getBounds());
					}
				}
			}
			if(typeof bounds==="string") console.warn('Bad bounds',bounds);
			else if(typeof bounds==="object"){
				map.fitBounds(bounds);
				oldbounds = bounds;
			}
			return this;
		};

		// Function to update a Leaflet map's size if it has been hidden
		this.update = function(){
			this.map.invalidateSize(false);
			if(oldbounds){
				this.fitBounds(oldbounds);
				oldbounds = null;
			}
			return this;
		};

		this.setTiles = function(idx,props,zIndex){
			if(typeof zIndex==="number"){
				var pane = 'tiles-'+idx;
				map.createPane('tiles-'+idx);
				props.pane = pane;
				map.getPane(pane).style.zIndex = zIndex;
			}
			L.tileLayer(props.url, props).addTo(map);
			return this;
		};

		return this;
	}
	function Layer(props){
		if(!props) props = {};
		if(!props.options) props.options = {};
		this.props = props;
		var overlay,wrapper,outline;

		// Set some functions for GeoJSON layers
		function style(feature){
			var d = updateData(feature,props);
			return {
				weight: (typeof props.options.weight==="number" ? props.options.weight : 0.5),
				opacity: (typeof props.options.opacity==="number" ? props.options.opacity : 0.5),
				color: (feature.geometry.type=="MultiLineString"||feature.geometry.type=="LineString" ? d.colour : "")||props.options.stroke||"#ffffff",
				fillOpacity: (typeof props.options.fillOpacity==="number" ? props.options.fillOpacity : 1),
				fillColor: d.colour||"transparent"
			};
		};
		function highlightFeature(e){
			const l = e.target;
			if(typeof l.getLatLngs==="function"){
				overlay = L.polygon(l.getLatLngs(),{color:"currentColor",weight:4,fill:false});
				overlay.addTo(props.layer);
				overlay.bringToFront();
				overlay.setStyle({'pointer-events':'none'});
				wrapper = document.createElementNS('http://www.w3.org/2000/svg','g');
				outline = document.createElementNS('http://www.w3.org/2000/svg','g');
				wrapper.classList.add('overlay');
				outline.classList.add('outline','selected');
				overlay._path.parentNode.replaceChild(wrapper, overlay._path);
				wrapper.append(outline);
				outline.append(overlay._path);
			}// console.warn('No layer to create overlay for',l);
		}
		function resetHighlight(e){
			if(wrapper) wrapper.remove();
			if(overlay) overlay.remove();
		}
		function getData(k){
			if(props.data){
				var csv = props.data;
				for(var i = 0; i < csv.length; i++){
					if(csv[i][props.key] == k) return csv[i];
				}
				return {};
			}
		}
		function updateData(feature,props){
			var d = getData(feature.properties[props.geo.key]);
			d.geojson = feature;
			if("columns" in props){
				// Update columns
				for(var c = 0; c < props.columns.length; c++){
					d[props.columns[c].name] = applyReplacementFilters(props.columns[c].template,d);
				}
			}
			return d;
		}
		this.getIDs = function(){
			var ids = [];
			for(var i = 0; i < props.geo.json.features.length; i++){
				ids.push(props.geo.json.features[i].properties[props.geo.key]);
			}
			return ids;
		};

		this.setProps = function(fn){
			props.layer.eachLayer(function(layer){
				if(layer.feature){
					var d = updateData(layer.feature,props);
					if(typeof fn==="function"){
						var d2 = fn.call(this,layer.feature.properties[props.geo.key],layer.feature.properties,layer);
						if(d.colour!=d2.colour){
							// Update the colour
							d.colour = d2.colour;
							layer._path.setAttribute('fill',d2.colour);
						}
						if(d2.tooltip){
							// Update the tooltip
							d[props.toolkey] = d2.tooltip;
							layer.setPopupContent(d2.tooltip);
						}
					}
				}else{
					console.warn('No layer:',layer);
				}
			});
		};

		if(props.geo && !props.layer){
			var geoattrs = {
				"style": style,
				"onEachFeature": function(feature, layer){
					var d = updateData(feature,props);
					var lbl = "";
					if("geo" in props && "key" in props.geo && props.geo.key in feature.properties) lbl = feature.properties[props.geo.key];
					if("toolkey" in props && props.toolkey in d) lbl = d[props.toolkey];
					if("Label" in d) lbl = d["Label"];
					layer.bindPopup(lbl).on("popupopen",function(ev,f){
						var d = updateData(feature,props)
						var ps = ev.popup._container;
						// Set the background colour of the popup
						ps.querySelector(".leaflet-popup-content-wrapper").style["background-color"] = d.colour;
						ps.querySelector(".leaflet-popup-tip").style["background-color"] = d.colour;
						// Set the text colour of the popup
						ps.querySelector(".leaflet-popup-content-wrapper").style["color"] = OI.contrastColour(d.colour);
						ps.style["color"] = OI.contrastColour(d.colour);
					});
					layer.on({
						mouseover: highlightFeature,
						mouseout: resetHighlight
					});
				},
				"pointToLayer": function(feature, latlng){
					var d = updateData(feature,props)
					var marker = props.defaultmarker;
					var myIcon = L.divIcon({'html':marker.svg.replace(/currentColor/,d.colour),'iconSize':marker.size||[32,32],'iconAnchor':marker.anchor||[16,32],'popupAnchor':marker.popup||[0,-32]});
					return L.marker(latlng,{icon: myIcon});
				}
			}

			props.layer = L.geoJSON(props.geo.json,geoattrs);
		}
		
		var marks = [];
		var mark;
		if(props.markers && !props.layer){
			var markers = props.markers;
			for(var m = 0; m < markers.length; m++){
				mark = new L.marker([markers[m].latitude,markers[m].longitude], {
					icon: new L.divIcon({
						"className": "oi-marker",
						"html":markers[m].icon.html,
						"iconSize":markers[m].icon.size,
						"iconAnchor":markers[m].icon.bgPos
					})
				});
				if(markers[m].tooltip) mark.bindPopup(markers[m].tooltip,{"className":"popup"});
				marks.push(mark);
			}
			props.layer = L.featureGroup(marks);
		}
		if(props.labels && !props.layer){
			var labels = props.labels;
			for(var i = 0; i < labels.length; i++){
				marks.push(new L.marker([labels[i].latitude,labels[i].longitude],{
					icon: new L.divIcon({
						"className": "oi-label",
						"html": '<div><svg xmlns="http://www.w3.org/2000/svg" version="1.1" preserveAspectRatio="xMidYMin meet" viewBox="0 0 12 12" overflow="visible" aria-label="'+(labels[i].name||"")+'"><text x="6" y="6" text-anchor="middle" dominant-baseline="middle" fill="'+labels[i]['colour']+'" stroke="'+labels[i]['border']+'" stroke-width="25%" paint-order="stroke"><tspan style="font-size:'+(labels[i]['font-size'])+'px;font-weight:'+labels[i]['font-weight']+';font-family:'+labels[i]['font-family']+';">'+(labels[i].name||"")+'</tspan></text></svg></div>'
					})
				}));
			}
			props.layer = L.featureGroup(marks);
		}
		
		this.getBounds = function(){
			if(props.layer && typeof props.layer.getBounds==="function") return props.layer.getBounds();
			else console.warn('No getBounds() property for layer',props);
			return [[0,0],[0,0]];
		};

		return this;
	}


	// Create a visible list of filters so that 
	// a filter can be updated later if necessary
	function List(){
		var arr = {};
		this.add = function(id,el,opt){
			if(id in arr){
				console.warn('This map already exists.');
			}else{
				arr[id] = new ZoomableMap(id,el,opt);
			}
			return arr[id];
		};
		this.get = function(id){
			if(id in arr) return arr[id];
			return arr;
		};
		return this;
	}

	root.OI.ZoomableMap = new List();

})(window || this);