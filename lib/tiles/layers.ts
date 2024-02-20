/*
	Define a TileLayerOptions type. 
*/
export type TileLayerOptions = {
	/** Set up a tile layer */
	url: string;
	attribution: string;
	subdomains?: string;
	maxZoom?: number;
}
let TileLayerDefinitions: Record<string, TileLayerOptions> = {
	"CartoDB.Positron":{
		"url":"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
		"attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		"subdomains": 'abcd',
		"maxZoom": 20
	},
	"CartoDB.PositronNoLabels":{
		"url": "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
		"attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		"subdomains": 'abcd',
		"maxZoom": 20
	},
	"CartoDB.PositronOnlyLabels":{
		"url": "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
		"attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		"subdomains": 'abcd',
		"maxZoom": 20
	},
	"CartoDB.DarkMatter":{
		"url": "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
		"attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		"subdomains": 'abcd',
		"maxZoom": 20
	},
	"CartoDB.DarkMatterNoLabels":{
		"url": "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
		"attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		"subdomains": 'abcd',
		"maxZoom": 20
	},
	"CartoDB.DarkMatterOnlyLabels":{
		"url": "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
		"attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		"subdomains": 'abcd',
		"maxZoom": 20
	},
	"CartoDB.Voyager":{
		"url": "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
		"attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		"subdomains": 'abcd',
		"maxZoom": 20
	},
	"CartoDB.VoyagerNoLabels":{
		"url": "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
		"attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		"subdomains": 'abcd',
		"maxZoom": 20
	},
	"CartoDB.VoyagerOnlyLabels":{
		"url": "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
		"attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		"subdomains": 'abcd',
		"maxZoom": 20
	},
	"ESRI.WorldImagery":{
		"url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
		"attribution": 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	},
	"OpenStreetMap.Mapnik":{
		"url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
		"maxZoom": 19,
		"attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
	},
	"Stadia.OSMBright":{
		"url": "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png",
		"maxZoom": 20,
		"attribution": '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OSM</a> contributors'
	}
};

let defaultTileLayer = 'CartoDB.Positron';
let defaultLabelLayer = 'CartoDB.PositronOnlyLabels';

/**
 * Function to update the colour scales available to the site
 * @param key Key of the new scale
 * @param scale The CSS code of the new scale
 */
export function updateTileLayers(key: string, props: TileLayerOptions) {
	TileLayerDefinitions[key] = props;
}

export function getTileLayers(): Record<string, string> {
	return TileLayerDefinitions;
}

export function getTileLayer(key?: string, TileLayerOptions): TileLayerOptions {
	if(typeof key==="object") return key;
	if(typeof key==="string"){
		if(key in TileLayerDefinitions) return TileLayerDefinitions[key];
		else{
			throw new Error('TileLayer ' + key + ' not registered. You should add to tileLayers first.');
		}
	}
	return TileLayerDefinitions[defaultTileLayer]
}

export function setDefaultMap({
	tileLayer, tileLayers, labelLayer
}: {
	tileLayer?: string;
	tileLayers?: Record<string, TileLayerOptions>;
	labelLayer?: string;
}){

	if(tileLayer){
		if(!tileLayer in TileLayerDefinitions) throw new TypeError('No tileLayer named "'+tileLayer+'" in the definitions.');
		defaultTileLayer = tileLayer;
	}

	if(labelLayer){
		if(!labelLayer in TileLayerDefinitions) throw new TypeError('No labelLayer named "'+labelLayer+'" in the definitions.');
		defaultLabelLayer = labelLayer;
	}

	// If tile layers are provided when instantiating the plugin, map these into known TileLayerDefinitions
	if(tileLayers){
		for(const [key, props] of Object.entries(tileLayers) ) {
			updateTileLayer(key, props);
		}
	}

}
