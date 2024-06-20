// Adapted from https://www.npmjs.com/package/@types/geojson?activeTab=code
/*
MIT License

Copyright (c) Microsoft Corporation.
Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the "Software"), to dealin the Software without restriction, including without limitation the rightsto use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE
*/

// Note: as of the RFC 7946 version of GeoJSON, Coordinate Reference Systems

// are no longer supported. (See https://tools.ietf.org/html/rfc7946#appendix-B)}


export as namespace GeoJSON;


/**

 * The valid values for the "type" property of GeoJSON geometry objects.

 * https://tools.ietf.org/html/rfc7946#section-1.4

 */

export type GeoJsonGeometryTypes = Geometry["type"];


/**

 * The value values for the "type" property of GeoJSON Objects.

 * https://tools.ietf.org/html/rfc7946#section-1.4

 */

export type GeoJsonTypes = GeoJSON["type"];


/**

 * Bounding box

 * https://tools.ietf.org/html/rfc7946#section-5

 */

export type BBox = [number, number, number, number] | [number, number, number, number, number, number];


/**

 * A Position is an array of coordinates.

 * https://tools.ietf.org/html/rfc7946#section-3.1.1

 * Array should contain between two and three elements.

 * The previous GeoJSON specification allowed more elements (e.g., which could be used to represent M values),

 * but the current specification only allows X, Y, and (optionally) Z to be defined.

 */

export type Position = number[]; // [number, number] | [number, number, number];


/**

 * The base GeoJSON object.

 * https://tools.ietf.org/html/rfc7946#section-3

 * The GeoJSON specification also allows foreign members

 * (https://tools.ietf.org/html/rfc7946#section-6.1)

 * Developers should use "&" type in TypeScript or extend the interface

 * to add these foreign members.

 */

export interface GeoJsonObject {
// Don't include foreign members directly into this type def.
// in order to preserve type safety.
// [key: string]: any;
/**
 * Specifies the type of GeoJSON object.
 */
type: GeoJsonTypes;
/**
 * Bounding box of the coordinate range of the object's Geometries, Features, or Feature Collections.
 * The value of the bbox member is an array of length 2*n where n is the number of dimensions
 * represented in the contained geometries, with all axes of the most southwesterly point
 * followed by all axes of the more northeasterly point.
 * The axes order of a bbox follows the axes order of geometries.
 * https://tools.ietf.org/html/rfc7946#section-5
 */
bbox?: BBox | undefined;

}


/**

 * Union of GeoJSON objects.

 */

export type GeoJSON = Geometry | Feature | FeatureCollection;


/**

 * Geometry object.

 * https://tools.ietf.org/html/rfc7946#section-3

 */

export type Geometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon | GeometryCollection;

export type GeometryObject = Geometry;


/**

 * Point geometry object.

 * https://tools.ietf.org/html/rfc7946#section-3.1.2

 */

export interface Point extends GeoJsonObject {
type: "Point";
coordinates: Position;

}


/**

 * MultiPoint geometry object.

 *  https://tools.ietf.org/html/rfc7946#section-3.1.3

 */

export interface MultiPoint extends GeoJsonObject {
type: "MultiPoint";
coordinates: Position[];

}


/**

 * LineString geometry object.

 * https://tools.ietf.org/html/rfc7946#section-3.1.4

 */

export interface LineString extends GeoJsonObject {
type: "LineString";
coordinates: Position[];

}


/**

 * MultiLineString geometry object.

 * https://tools.ietf.org/html/rfc7946#section-3.1.5

 */

export interface MultiLineString extends GeoJsonObject {
type: "MultiLineString";
coordinates: Position[][];

}


/**

 * Polygon geometry object.

 * https://tools.ietf.org/html/rfc7946#section-3.1.6

 */

export interface Polygon extends GeoJsonObject {
type: "Polygon";
coordinates: Position[][];

}


/**

 * MultiPolygon geometry object.

 * https://tools.ietf.org/html/rfc7946#section-3.1.7

 */

export interface MultiPolygon extends GeoJsonObject {
type: "MultiPolygon";
coordinates: Position[][][];

}


/**

 * Geometry Collection

 * https://tools.ietf.org/html/rfc7946#section-3.1.8

 */

export interface GeometryCollection<G extends Geometry = Geometry> extends GeoJsonObject {
type: "GeometryCollection";
geometries: G[];

}


export type GeoJsonProperties = { [name: string]: any } | null;


/**

 * A feature object which contains a geometry and associated properties.

 * https://tools.ietf.org/html/rfc7946#section-3.2

 */

export interface Feature<G extends Geometry | null = Geometry, P = GeoJsonProperties> extends GeoJsonObject {
type: "Feature";
/**
 * The feature's geometry
 */
geometry: G;
/**
 * A value that uniquely identifies this feature in a
 * https://tools.ietf.org/html/rfc7946#section-3.2.
 */
id?: string | number | undefined;
/**
 * Properties associated with this feature.
 */
properties: P;

}


/**

 * A collection of feature objects.

 *  https://tools.ietf.org/html/rfc7946#section-3.3

 */

export interface FeatureCollection<G extends Geometry | null = Geometry, P = GeoJsonProperties> extends GeoJsonObject {
type: "FeatureCollection";
features: Array<Feature<G, P>>;

}