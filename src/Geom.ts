import '../lib/geocalc.nocache'

interface BufferOptions {
    JoinStyle: 'Round' | 'Mitre' | 'Bevel'
    CapStyle: 'Round' | 'Flat' | 'Square'
    QuadrantSegments: number
    MitreLimit: number
}

interface Geom {

    /** AsLab.Geom */
    _class(): string

    error(): string

    /**
     * Computes the buffer of a geometry for a given distance. 
     * Options:
     * - JoinStyle: 'Round' | 'Mitre' | 'Bevel', default = 'Round'      
     * - CapStyle: 'Round' | 'Flat' | 'Square', default = 'Round'  
     * - QuadrantSegments: int, default = 8   
     * - MitreLimit: float, default = 5.0     
     */
    buffer(distance: number, options?: Partial<BufferOptions>): Geom

    /**
     * Writes a Geometry in GeoJson format to a String.
     */
    toJSON(): string

    /**
     * Returns a vertex of this Geometry (usually, but not necessarily, the first one)
     */
    coordinate(): number[]

    /**
     * Simplifies a geometry using a given tolerance.
     */
    simplify(tolerance: number): Geom

    /**
     * Returns the minimum distance between this Geometry and another Geometry.
     */
    distance(geom2: Geom): number

    /**
     * Compute the the nearest points of two geometries
     */
    nearestPoints(geom2: Geom): Geom[]

    /**
     * For a point, find it's position on a line as length to the start 
     */
    lengthOnLine(line: Geom): number

    /**
     * For a point, find it's position on a line as ratio 
     */
    ratioOnLine(line: Geom): number

    /**
     * For a lineString, return the point at a specified distance along the line 
     */
    along(distance: number): Geom

    /**
     * For a lineString, return a sub string based on start and end distance. 
     */
    extractLine(start: number, end: number): Geom

    /**
     * Returns the area of this Geometry
     */
    area(): number

    /**
     * Returns the length of this Geometry. 
     * Linear geometries return their length. 
     * Areal geometries return their perimeter. 
     */
    length(): number

    /**
     * Computes a Geometry representing the point-set which is contained in both this Geometry and the other Geometry.
     */
    union(geom2: Geom): Geom

    /**
     * Computes a Geometry representing the closure of the point-set of the points contained in this Geometry that are not contained in the other Geometry.
     */
    difference(geom2: Geom): Geom

    /**
     * Computes a Geometry representing the point-set which is common to both this Geometry and the other Geometry.
     */
    intersection(geom2: Geom): Geom

    /**
     * Creates a new Geometry which is a normalized copy of this Geometry.
     * Normal form is a unique representation for Geometry 
     */
    norm(): Geom

    /**
     * Computes an interior point of this Geometry. An interior point is guaranteed to lie in the interior of the Geometry
     */
    getInteriorPoint(): Geom

    /**
    * return geometry type
    */
    type(): string

    /**
     * Computes the centroid of this Geometry
     */
    getCentroid(): Geom

    /**
     * Tests whether this geometry contains the argument geometry.
     */
    contains(geom2: Geom): boolean

    /**
     * Tests whether this geometry overlaps the specified geometry. 
     */
    overlaps(geom2: Geom): boolean

    /**
     * Tests whether the distance from this Geometry to another is less than or equal to a specified value.
     */
    isWithinDistance(geom2: Geom, distance: number): boolean

    /**
     * Densifies a geometry using a given distance tolerance
     */
    densify(distanceTolerance: number): Geom

    /**
     * For a closed lineString (ring), split by points
     */
    splitRing(points: Geom[]): Geom[]

    /**
    * For a lineString, split by points
    */
    splitLine(points: Geom[]): Geom[]

    /**
    * For a lineString, offset it by distance
    */
    offsetLine(offsetDistance: number): Geom

    /**
     * For a LineString, shorten or prolong it at the end.
     */
    extendLine(change: number): Geom

    /**
     * create a line to other geometry
     */
    lineTo(geom2: Geom): Geom


    /**
    * split polygon by a line
    */
    splitByLine(line: Geom): Geom

    /**
     * clone a geom
     */
    clone(): Geom

    /**
    * offset a geom
    */
    offset(x: number, double: number): Geom

    /**
     * Tests whether this Geometry is topologically valid
     */
    isValid(): boolean

    /**
     * extract lines from geom
     */
    getLines(): Geom[]

}

type geomType = 'Point' | 'LineString' | 'Polygon'

const GeomCls = window['jts'].Geom

/**
 * Create a GeoCalc Geom object 
 * @param jsonOrCoods GeoJSON(string or Object), WKT or Coords (number[][])
 * @param type 'Point'|'LineString'|'Polygon', ignored when GeoJSON is given
 */
function toGeom(jsonOrCoods: string | number[][] | number[] | any, type = null as geomType) {
    const _$ = window['$'] //to keep global $, as GWT overwrites it somehow
    let ret: Geom
    if (Array.isArray(jsonOrCoods)) {
        let coords = jsonOrCoods as number[][]
        if (!Array.isArray(coords[0])) coords = [coords as any]
        if (type == null) {
            type = coords.length == 1 ? 'Point' : 'LineString'
            if (coords.length > 1) {
                const first = coords[0], last = coords[coords.length - 1]
                if (first[0] == last[0] && first[1] == last[1]) {//first is same as last, a ring
                    type = 'Polygon'
                }
            }
        }
        ret = GeomCls.create(type, coords) as Geom
    } else {
        if (typeof jsonOrCoods !== 'string') {
            if (jsonOrCoods['toJSON']) {
                jsonOrCoods = jsonOrCoods['toJSON']()
            } else {
                jsonOrCoods = JSON.stringify(jsonOrCoods)
            }
        }
        ret = GeomCls.create(jsonOrCoods) as Geom
    }
    if (_$) window['$'] = _$
    return ret
}

/**
 * Build a polygon with line strings. LineStrings are linked either by mitre joint or straight line. 
 * For example line A and B, they will be extended towards each other by gap*mitreLimit for finding the joint point.
 * When found, a mitre joint will be added to the polygon shell otherwise just a straight line  
 * @param lines boundary LineStrings, need to be in correct order
 * @param mitreLimit default as 2, big number encourages mitre joint
 */
function makePolygon(lines: Geom[], mitreLimit = 2) {
    return GeomCls.makePolygon(lines, mitreLimit) as Geom
}

function isGeom(target: any) {
    return target && target._class && target._class() == 'AsLab.Geom'
}

const geoJsonTypes = 'Features,FeatureCollections,Point,LineString,Polygon,MultiPoint,MultiLineString,MultiPolygon,GeometryCollection'.split(',')

function isGeoJSON(target: any) {
    let geoJSON = null
    if (typeof target === 'string') {
        try {
            geoJSON = JSON.parse(target)
        } catch (e) { }
    }
    return geoJSON && geoJSON.type && geoJsonTypes.includes(geoJSON.type)
}

const geomUtil = {
    makePolygon, isGeom, toGeom, isGeoJSON
}

export { toGeom, makePolygon, geomUtil }
export type { BufferOptions, Geom }