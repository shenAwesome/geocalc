import '../lib/test.nocache.js'

let GeomCls = null as any;
function install() {
    if (window['jts'] && window['jts'].Geom) {
        GeomCls = window['jts'].Geom
    } else {
        window.setTimeout(install, 10)
    }
}
window.setTimeout(install, 1)

interface Geom {

    /**
     * Computes a buffer area around this geometry having the given width.
     * @param radius 
     */
    buffer(distance: number): Geom

    /**
     * Export as GeoJSON
     */
    toJSON(): string

    /**
     * A vertex of this Geometry
     */
    coordinate(): number[]

    /**
     * Simplifies the Geometry 
     * @param tolerance 
     */
    simplify(tolerance: number): Geom

    /**
     * Minimum distance to another Geometry
     * @param geom2 
     */
    distance(geom2: Geom): number

    /**
     * Shortest path to another geometry
     * @param geom2 
     */
    nearestPoints(geom2: Geom): Geom[]

    /**
     * For a lineString, slice it with start point and another point, calculate the length
     * probably should be rename as lengthOnline
     * @param point 
     */
    lengthOnLine(point: Geom): number

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

    area(): number

    length(): number

    union(geom2: Geom): Geom

    difference(geom2: Geom): Geom

    intersection(geom2: Geom): Geom

    norm(geom2: Geom): Geom

    /**
    * return geometry type
    */
    type(): string

    getCentroid(): Geom

    contains(geom2: Geom): boolean

    overlaps(geom2: Geom): boolean

    isWithinDistance(geom2: Geom, distance: number): boolean

    densifier(distanceTolerance: number): Geom

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
}

type geomType = 'Point' | 'LineString' | 'Polygon'


/**
 * Create a GeoCalc Geom object 
 * @param jsonOrCoods GeoJSON (string or Object) or Coords (number[][])
 * @param type 'Point'|'LineString'|'Polygon', ignored when GeoJSON is given
 */
function toGeom(jsonOrCoods: string | number[][] | any, type = null as geomType) {
    if (Array.isArray(jsonOrCoods)) {
        if (!Array.isArray(jsonOrCoods[0])) jsonOrCoods = [jsonOrCoods]
        if (type == null) {
            type = jsonOrCoods.length == 1 ? 'Point' : 'LineString'
            if (jsonOrCoods.length > 1) {
                const first = jsonOrCoods[0],
                    last = jsonOrCoods[jsonOrCoods.length - 1]
                if (first[0] == last[0] && first[1] == last[1]) {
                    type = 'Polygon'
                }
            }
        }
        return GeomCls.create(type, jsonOrCoods) as Geom
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
function load() {
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

export { load, toGeom, makePolygon }