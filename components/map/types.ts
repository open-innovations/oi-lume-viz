export type GeoJson = { type: string, features: unknown[] };
export type dataLayer = {
	type: "data",
	data?: Record<string, unknown>[] | string;
	geojson?: { key?: string, data: string | GeoJson };
	key?: string;
	scale?: ColourScaleDefinition;
	tooltip?: string;
	value?: string;
	min?: number;
	max?: number;
};
export type backLayer = { type: "background", [k:string]: unknown };
export type gratLayer = { type: "graticule", [k:string]: unknown };
export type lablLayer = { type: "labels", [k:string]: unknown };
export type markLayer = { type: "markers", [k:string]: unknown };
export type tileLayer = { type: "tile", [k:string]: unknown };
export type Bounds = { lat?: { min?: number, max?: number }; lon?: { min?: number, max?: number } };
export type ColourScaleDefinition = string | ((property: string) => string) | ((numeric: number) => string);
