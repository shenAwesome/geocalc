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

    buffer(radius: number): Geom

    toJSON(): string

    coordinate(): number[]

    simplify(tolerance: number): Geom

    distance(geom2: Geom): number

    nearestPoints(geom2: Geom): Geom[]

    lengthOnLine(geom2: Geom): number

    along(distance: number): Geom

    extractLine(start: number, end: number): Geom

    area(): number

    length(): number

    union(geom2: Geom): Geom

    difference(geom2: Geom): Geom

    intersection(geom2: Geom): Geom

    norm(geom2: Geom): Geom

    type(): string

    getCentroid(): Geom

    contains(geom2: Geom): boolean

    overlaps(geom2: Geom): boolean

    isWithinDistance(geom2: Geom, distance: number): boolean

    densifier(distanceTolerance: number): Geom

    splitRing(points: Geom[]): Geom[]

    splitLine(points: Geom[]): Geom[]

}

type geomType = 'Point' | 'LineString' | 'Polygon'

function toGeom(jsonOrCoods: string | number[][] | any, type = 'Point' as geomType) {
    if (Array.isArray(jsonOrCoods)) {
        if (!Array.isArray(jsonOrCoods[0])) jsonOrCoods = [jsonOrCoods]
        return GeomCls.create(type, jsonOrCoods)
    } else {
        if (typeof jsonOrCoods !== 'string') {
            jsonOrCoods = JSON.stringify(jsonOrCoods)
        }
        return new GeomCls(jsonOrCoods) as Geom
    }
}

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

export { load, toGeom }