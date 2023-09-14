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

	function ZoomableMap(el,attr){
		
		var list = [];
		var map = L.map(el);
		if(attr.attribution) map.attributionControl.setPrefix(attr.attribution);
		map.setView([0, 0], 2);
		var tiles;
		
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
			else map.fitBounds(bounds);

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

		// Set some functions for GeoJSON layers
		function style(feature){
			var d = getData(feature.properties[props.geo.key]);
			return {
				weight: (typeof props.options.weight==="number" ? props.options.weight : 0.5),
				opacity: (typeof props.options.opacity==="number" ? props.options.opacity : 0.5),
				color: "#ffffff",
				fillOpacity: (typeof props.options.fillOpacity==="number" ? props.options.fillOpacity : 1),
				fillColor: d.colour||"transparent"
			};
		};
		function highlightFeature(e){
			const l = e.target;

			if(typeof l.setStyle==="function"){
				l.setStyle({
					weight: 4,
					color: "#000000",
					opacity: 1
				});
			}else console.warn('No layer to setStyle for',l);

			if(typeof l.bringToFront==="function") l.bringToFront();
			else console.warn('No layer to bring to front',l);
		}
		function resetHighlight(e){
			if(props.layer) props.layer.resetStyle(e.target);
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

		if(props.geo && !props.layer){
			var geoattrs = {
				"style": style,
				"onEachFeature": function(feature, layer){
					var d = getData(feature.properties[props.geo.key]);
					layer.bindPopup(d["Label"]||d[props.toolkey]||feature.properties[props.geo.key]).on("popupopen",function(ev){
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
					var d = getData(feature.properties[props.geo.key]);
					var marker = props.defaultmarker;
					var myIcon = L.divIcon({'html':marker.svg.replace(/currentColor/,d.colour),'iconSize':marker.size||[32,32],'iconAnchor':marker.anchor||[16,32],'popupAnchor':marker.popup||[0,-32]})
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

	if(!root.OI.ZoomableMap) root.OI.ZoomableMap = ZoomableMap;

})(window || this);

