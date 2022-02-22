import '../lib/geocalc.nocache'

/*
let GeomCls = null as any;
function install() {
    if (window['jts'] && window['jts'].Geom) {
        GeomCls = window['jts'].Geom
    } else {
        window.setTimeout(install, 10)
    }
}
window.setTimeout(install, 1)
*/

const GeomCls = window['jts'].Geom

interface Geom {

    /**
     * Computes the buffer for a geometry for a given buffer distance.
     * @param distance 
     * @param options [ JoinStyle(0,1,2=round,mitre,bevel), CapStyle(0,1,2=round,flat,square), QUADRANT_SEGMENTS|MITRE_LIMIT ]
     */
    buffer(distance: number, options?: number[]): Geom

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
     * @param tolerance 
     */
    simplify(tolerance: number): Geom

    /**
     * Returns the minimum distance between this Geometry and another Geometry.
     * @param geom2 
     */
    distance(geom2: Geom): number

    /**
     * Compute the the nearest points of two geometries
     * @param geom2 
     */
    nearestPoints(geom2: Geom): Geom[]

    /**
     * For a point, find it's position on a line as length to the start
     * @param point 
     */
    lengthOnLine(line: Geom): number

    /**
     * For a point, find it's position on a line as ratio
     * @param point 
     */
    ratioOnLine(line: Geom): number

    /**
     * For a lineString, return the point at a specified distance along the line
     * @param point 
     */
    along(distance: number): Geom

    /**
     * For a lineString, return a sub string based on start and end distance.
     * @param start 
     * @param end 
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
     * @param geom2 
     */
    union(geom2: Geom): Geom

    /**
     * Computes a Geometry representing the closure of the point-set of the points contained in this Geometry that are not contained in the other Geometry.
     * @param geom2 
     */
    difference(geom2: Geom): Geom

    /**
     * Computes a Geometry representing the point-set which is common to both this Geometry and the other Geometry.
     * @param geom2 
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
    getInteriorPoint():Geom 

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
     * @param geom2 
     */
    contains(geom2: Geom): boolean

    /**
     * Tests whether this geometry overlaps the specified geometry.
     * @param geom2 
     */
    overlaps(geom2: Geom): boolean

    /**
     * Tests whether the distance from this Geometry to another is less than or equal to a specified value.
     * @param geom2 
     * @param distance 
     */
    isWithinDistance(geom2: Geom, distance: number): boolean

    /**
     * Densifies a geometry using a given distance tolerance
     * @param distanceTolerance 
     */
    densify(distanceTolerance: number): Geom

    /**
     * For a closed lineString (ring), split by points
     * @param points 
     */
    splitRing(points: Geom[]): Geom[]

    /**
    * For a lineString, split by points
    * @param points 
    */
    splitLine(points: Geom[]): Geom[]

    /**
    * For a lineString, offset it by distance
    * @param points 
    */
    offsetLine(offsetDistance: number): Geom

    /**
     * For a LineString, shorten or prolong it at the end.
     * @param change 
     */
    extendLine(change: number): Geom

    /**
     * create a line to other geometry
     * @param geom2 
     */
    lineTo(geom2: Geom): Geom
}

type geomType = 'Point' | 'LineString' | 'Polygon'


/**
 * Create a GeoCalc Geom object 
 * @param jsonOrCoods GeoJSON (string or Object) or Coords (number[][])
 * @param type 'Point'|'LineString'|'Polygon', ignored when GeoJSON is given
 */
function toGeom(jsonOrCoods: string | number[][] | number[] | any, type = null as geomType) {
    if (Array.isArray(jsonOrCoods)) {
        let coords = jsonOrCoods as number[][] 
        if (!Array.isArray(coords[0])) coords = [coords as any]
        if (type == null) {
            type = coords.length == 1 ? 'Point' : 'LineString'
            if (coords.length > 1) {
                const first = coords[0],  last = coords[coords.length - 1]
                if (first[0] == last[0] && first[1] == last[1]) {//first is same as last, a ring
                    type = 'Polygon'
                }
            }
        }
        return GeomCls.create(type, coords) as Geom
    } else {
        if (typeof jsonOrCoods !== 'string') {
            jsonOrCoods = JSON.stringify(jsonOrCoods)
        }
        return new GeomCls(jsonOrCoods) as Geom
    }
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

/**
 * A Promise to notify that geocalc has been fully loaded. It is only a safe check. engine normally gets loaded within milliseconds
 */
//not needed anymore
function _load() {
    return new Promise<void>(resolve => {
        function check() {
            if (GeomCls) {
                resolve()
            } else {
                setTimeout(check, 10);
            }
        }
        check()
    })
}

export { toGeom, makePolygon, Geom }