// Adapted from https://www.npmjs.com/package/@types/geojson?activeTab=code
/*
MIT License

Copyright (c) Microsoft Corporation.

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



}


/**

 * MultiPoint geometry object.

 *  https://tools.ietf.org/html/rfc7946#section-3.1.3

 */

export interface MultiPoint extends GeoJsonObject {



}


/**

 * LineString geometry object.

 * https://tools.ietf.org/html/rfc7946#section-3.1.4

 */

export interface LineString extends GeoJsonObject {



}


/**

 * MultiLineString geometry object.

 * https://tools.ietf.org/html/rfc7946#section-3.1.5

 */

export interface MultiLineString extends GeoJsonObject {



}


/**

 * Polygon geometry object.

 * https://tools.ietf.org/html/rfc7946#section-3.1.6

 */

export interface Polygon extends GeoJsonObject {



}


/**

 * MultiPolygon geometry object.

 * https://tools.ietf.org/html/rfc7946#section-3.1.7

 */

export interface MultiPolygon extends GeoJsonObject {



}


/**

 * Geometry Collection

 * https://tools.ietf.org/html/rfc7946#section-3.1.8

 */

export interface GeometryCollection<G extends Geometry = Geometry> extends GeoJsonObject {



}


export type GeoJsonProperties = { [name: string]: any } | null;


/**

 * A feature object which contains a geometry and associated properties.

 * https://tools.ietf.org/html/rfc7946#section-3.2

 */

export interface Feature<G extends Geometry | null = Geometry, P = GeoJsonProperties> extends GeoJsonObject {















}


/**

 * A collection of feature objects.

 *  https://tools.ietf.org/html/rfc7946#section-3.3

 */

export interface FeatureCollection<G extends Geometry | null = Geometry, P = GeoJsonProperties> extends GeoJsonObject {



}