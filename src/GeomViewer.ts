import { Geom, toGeom } from "./Geom"
import {
    Feature as GeoFeature,
    FeatureCollection,
    GeoJsonObject, Geometry, GeometryCollection, LineString,
    MultiLineString, MultiPoint, MultiPolygon, Point, Polygon, Position
} from "geojson"

function debounce(func: Function, timeout = 1) {
    let timer = -1
    return function (this: any, ...args: any) {
        clearTimeout(timer)
        timer = setTimeout(() => { func.apply(this, args) }, timeout)
    }
}

const Conv = ({
    r_major: 6378137.0,//Equatorial Radius, WGS84
    r_minor: 6356752.314245179,//defined as constant
    f: 298.257223563,//1/f=(a-b)/a , a=r_major, b=r_minor
    deg2rad: function (d: number) {
        let r = d * (Math.PI / 180.0)
        return r
    },
    rad2deg: function (r: number) {
        let d = r / (Math.PI / 180.0)
        return d
    },
    ll2m: function (lon: number, lat: number) //lat lon to mercator
    {
        //lat, lon in rad
        let x = this.r_major * this.deg2rad(lon)

        if (lat > 89.5) lat = 89.5
        if (lat < -89.5) lat = -89.5

        let temp = this.r_minor / this.r_major
        let es = 1.0 - (temp * temp)
        let eccent = Math.sqrt(es)

        let phi = this.deg2rad(lat)

        let sinphi = Math.sin(phi)

        let con = eccent * sinphi
        let com = .5 * eccent
        let con2 = Math.pow((1.0 - con) / (1.0 + con), com)
        let ts = Math.tan(.5 * (Math.PI * 0.5 - phi)) / con2
        let y = 0 - this.r_major * Math.log(ts)
        let ret = { 'x': x, 'y': y }
        return ret
    },
    m2ll: function (x: number, y: number) //mercator to lat lon
    {
        let lon = this.rad2deg((x / this.r_major))

        let temp = this.r_minor / this.r_major
        let e = Math.sqrt(1.0 - (temp * temp))
        let lat = this.rad2deg(this.pj_phi2(Math.exp(0 - (y / this.r_major)), e))

        let ret = { 'lon': lon, 'lat': lat }
        return ret
    },
    pj_phi2: function (ts: number, e: number) {
        let N_ITER = 15
        let HALFPI = Math.PI / 2
        let TOL = 0.0000000001
        let eccnth, Phi, con, dphi
        let i
        eccnth = .5 * e
        Phi = HALFPI - 2. * Math.atan(ts)
        i = N_ITER
        do {
            con = e * Math.sin(Phi)
            dphi = HALFPI - 2. * Math.atan(ts * Math.pow((1. - con) / (1. + con), eccnth)) - Phi
            Phi += dphi
        }
        while (Math.abs(dphi) > TOL && --i)
        return Phi
    }
})

function rainbow(numOfSteps: number, step: number) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    let r = 0, g = 0, b = 0
    let h = step / numOfSteps
    let i = ~~(h * 6)
    let f = h * 6 - i
    let q = 1 - f
    switch (i % 6) {
        case 0: r = 1; g = f; b = 0; break
        case 1: r = q; g = 1; b = 0; break
        case 2: r = 0; g = 1; b = f; break
        case 3: r = 0; g = q; b = 1; break
        case 4: r = f; g = 0; b = 1; break
        case 5: r = 1; g = 0; b = q; break
    }
    const toColor = (r: number) => ("00" + (~ ~(r * 255)).toString(16)).slice(-2)
    return "#" + toColor(b) + toColor(r) + toColor(g)
}

/**
 * get Position ([number,number]) of GeoJsonObject
 * @param geoJson 
 * @returns 
 */
function getCoordinates(geoJson: GeoJsonObject) {
    const coords = [] as Position[]
    if (geoJson.type == 'Point') {
        coords.push((geoJson as Point).coordinates)
    }
    if (geoJson.type == 'LineString') {
        coords.push(...(geoJson as LineString).coordinates)
    }
    if (geoJson.type == 'Polygon') {
        (geoJson as Polygon).coordinates.forEach(ring => coords.push(...ring))
    }
    if (geoJson.type == 'MultiPoint') {
        coords.push(...(geoJson as MultiPoint).coordinates)
    }
    if (geoJson.type == 'MultiLineString') {
        (geoJson as MultiLineString).coordinates.forEach(l => coords.push(...l))
    }
    if (geoJson.type == 'MultiPolygon') {
        (geoJson as MultiPolygon).coordinates.forEach(p => {
            p.forEach(ring => coords.push(...ring))
        })
    }
    if (geoJson.type == 'GeometryCollection') {
        (geoJson as GeometryCollection).geometries.forEach(g => {
            coords.push(...getCoordinates(g))
        })
    }
    return coords
}

/**
 * creates a new geometry by transformation, doesn't mutate original geometry
 * @param geom 
 * @param transformer 
 * @returns 
 */
function transform(geom: Geom, transformer: (p: Position) => Position) {
    const geoJSON = JSON.parse(geom.toJSON()) as GeoJsonObject
    getCoordinates(geoJSON).forEach(p => {
        const newPosition = transformer(p)
        for (let i = 0; i < newPosition.length; i++) {
            p[i] = newPosition[i]
        }
    })
    return toGeom(geoJSON)
}

class SvgStyle {
    stroke = 'gray'
    strokeWidth = 1
    fill = 'green'
    pointRadius = 8
    id = ''
    className = ''

    static create(option: Partial<SvgStyle>) {
        return Object.assign(new SvgStyle, option)
    }
    get html() {
        return `x-id="${this.id}" fill="${this.fill}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}"`
    }
}

const styles = {
    Point: { fill: 'red', stroke: 'black', strokeWidth: 2 },
    LineString: { fill: 'none', stroke: 'green', strokeWidth: 4 },
    Polygon: { fill: 'yellow' },

    getStyle(geom: Geom): SvgStyle {
        const geomType = geom.type()
        const ret = new SvgStyle()
        const type = Object.keys(this).find(key => geomType.includes(key))
        if (type) Object.assign(ret, (this as any)[type])
        return ret
    }
}

function removeDuplicate(position: Position[]) {
    const ret = [] as Position[]
    position.forEach(p => {
        const last = ret[ret.length - 1]
        const skip = last && last[0] == p[0] && last[1] == p[1]
        if (!skip) ret.push(p)
    })
    return ret
}


function jsonToSVGStr(json: GeoJsonObject, style: SvgStyle) {
    const { type } = json, { className } = style
    let svg = ""

    if (type == 'Point') {
        const [x, y] = (json as Point).coordinates
        svg = `<circle cx="${x}" cy="${y}" r="${style.pointRadius}" ${style.html} class='${className}'/>`
    }
    if (type == 'LineString') {
        const pathStr = removeDuplicate((json as LineString).coordinates).map(c => c[0] + ',' + c[1]).join(' ')
        svg = `<polyline points="${pathStr}" ${style.html} class='${className}'/>`
    }
    if (type == 'Polygon') {
        const pathStr = (json as Polygon).coordinates.map((ring) => {
            return removeDuplicate(ring).map((p, i) => {
                let command = 'L'
                if (i == 0) command = 'M'
                return `${command} ${p[0]} ${p[1]}`
            }).join(' ') + ' Z'
        }).join(' ').trim()
        svg = `<path  d="${pathStr}" ${style.html} class='${className}'/>`
    }
    if (type == 'MultiPoint') {
        svg = (json as MultiPoint).coordinates.map(p => {
            const [x, y] = p
            return `<circle cx="${x}" cy="${y}" r="${style.pointRadius}"  ${style.html} class='${className}'/>`
        }).join(' ')
    }
    if (type == 'MultiLineString') {
        svg = (json as MultiLineString).coordinates.map(line => {
            line = removeDuplicate(line)
            const pathStr = line.map(c => c[0] + ',' + c[1]).join(' ')
            return `<polyline points="${pathStr}"  ${style.html}  class='${className}'/>`
        }).join(' ')
    }
    if (type == 'MultiPolygon') {
        svg = (json as MultiPolygon).coordinates.map(polygon => {
            const pathStr = polygon.map((ring) => {
                ring = removeDuplicate(ring)
                return ring.map((p, i) => {
                    let command = 'L'
                    if (i == 0) command = 'M'
                    return `${command} ${p[0]} ${p[1]}`
                }).join(' ') + ' Z'
            }).join(' ').trim()
            return `<path  d="${pathStr}"  ${style.html}  class='${className}'/>`
        }).join(' ')
    }
    if (type == 'GeometryCollection') {
        svg = (json as GeometryCollection).geometries.map(g => {
            return jsonToSVGStr(g, style)
        }).join(' ')
    }

    return svg
}

const svgOptions = {
    pointRadius: 8,
    autoSort: true,
    width: 400,
    height: 300,
    zoomTo: 'All' as 'All' | 'First' | 'Last' | Extent,
    zoomRatio: 1.2,
    styler: null as unknown as Styler
}

function getTypeOrder(geom: Geom) {
    let order = 0
    if (geom.type().includes('Point')) order = 3
    if (geom.type().includes('LineString')) order = 2
    if (geom.type().includes('Polygon')) order = 1
    return order
}

/**
 * convert geometry(s) to SVG
 * @param geoms 
 * @param option 
 * @returns 
 */
function toSVG(geoms: Geom[] | Feature[], option?: Partial<typeof svgOptions>) {
    const features = geoms.map(g => {
        if (!(g instanceof Feature)) {
            g = new Feature(g)
        }
        return g
    }) as Feature[]

    const opt = { ...svgOptions, ...option } as typeof svgOptions

    let extent = opt.zoomTo
    const getExtent = (features: Feature[]) => Extent.getExtent(features.map(f => f.geometry))
    if (extent == 'All') extent = getExtent(features)
    if (extent == 'First') extent = getExtent(features.slice(0, 1))
    if (extent == 'Last') extent = getExtent(features.slice(-1))

    const width = Math.max(10, extent.width),
        height = Math.max(10, extent.height),
        { centre } = extent
    const ratio = Math.max(width / opt.width, height / opt.height) * opt.zoomRatio,
        svgCenter = { x: opt.width / 2, y: opt.height / 2 }

    let toDraw = features
    if (opt.autoSort) {
        toDraw = [...toDraw].sort((a, b) => {
            const geomA = a.geometry,
                geomB = b.geometry
            const typeSort = (getTypeOrder(geomA) - getTypeOrder(geomB)) * 10,
                diff = geomB.area() - geomA.area(),
                sort = diff == 0 ? 0 : diff / Math.abs(diff)
            return typeSort + sort
        })
    }
    const svgParts = toDraw.map((feature, i) => {
        const geom = feature.geometry
        const target = transform(geom, p => {
            let [x, y] = p
            x = svgCenter.x + (x - centre.x) / ratio
            y = svgCenter.y + (y - centre.y) / ratio
            return [Math.round(x), opt.height - Math.round(y)]
        })
        const className = geom.type() + ' ' + feature.id,
            json = JSON.parse(target.toJSON()) as GeoJsonObject,
            style = styles.getStyle(geom)
        const colorKey = geom.type().includes('String') ? 'stroke' : 'fill'
        style[colorKey] = rainbow(geoms.length, i)
        style.id = feature.id
        style.className = className
        if (opt.styler) opt.styler(style, feature.properties, feature)
        return jsonToSVGStr(json, style)
    }).join('\n')

    const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
    svg.innerHTML = svgParts
    svg.style.width = opt.width + 'px'
    svg.style.height = opt.height + 'px'
    svg.classList.add('GeomSVG')
    return svg
}

type Styler = (style: SvgStyle, properties: { [key: string]: any }, feature: Feature) => void

/**
 * project to webmercator for Feature and FeatureCollection
 * @param geoJSON 
 * @param option 
 * @returns 
 */
function jsonToSVG(geoJSON: any, option?: Partial<typeof svgOptions>) {
    let feats = [] as Feature[]
    console.log(geoJSON.type)
    if (geoJSON.type == 'FeatureCollection') {
        feats = (geoJSON as FeatureCollection).features
            .map(f => Feature.fromJSON(f).toWebmercator())
    } else if (geoJSON.type == 'Feature') {
        feats = [Feature.fromJSON(geoJSON).toWebmercator()]
    } else {
        feats = [Feature.fromJSON(geoJSON)]
    }
    return toSVG(feats, option)
}

const geomTool = {
    transform, toSVG, jsonToSVG
}

class Extent {

    constructor(public minX: number, public maxX: number,
        public minY: number, public maxY: number) { }

    union(extent: Extent) {
        if (!extent) return this
        const minX = Math.min(this.minX, extent.minX),
            maxX = Math.max(this.maxX, extent.maxX),
            minY = Math.min(this.minY, extent.minY),
            maxY = Math.max(this.maxY, extent.maxY)
        return new Extent(minX, maxX, minY, maxY)
    }

    static getExtent(geom: Geom | Geom[]): Extent {
        if (Array.isArray(geom)) {
            return geom.reduce((ext, geom) => {
                return Extent.getExtent(geom).union(ext)
            }, null as unknown as Extent)
        } else {
            const allcoords = getCoordinates(JSON.parse(geom.toJSON()))
            const minX = Math.min(...allcoords.map(p => p[0])),
                maxX = Math.max(...allcoords.map(p => p[0])),
                minY = Math.min(...allcoords.map(p => p[1])),
                maxY = Math.max(...allcoords.map(p => p[1]))
            return new Extent(minX, maxX, minY, maxY)
        }
    }

    get centre() {
        const x = (this.minX + this.maxX) / 2,
            y = (this.minY + this.maxY) / 2
        return { x, y }
    }

    get width() {
        return (this.maxX - this.minX)
    }

    get height() {
        return (this.maxY - this.minY)
    }

    expand(ratio: number) {
        const { centre, width, height } = this
        const newWidth = width * ratio,
            newHeight = height * ratio
        const minX = centre.x - newWidth / 2,
            maxX = centre.x + newWidth / 2,
            minY = centre.y - newHeight / 2,
            maxY = centre.y + newHeight / 2
        return new Extent(minX, maxX, minY, maxY)
    }

    pad(padding: number, yPadding = padding) {
        const { centre, width, height } = this
        const newWidth = width + padding * 2,
            newHeight = height + yPadding * 2
        const minX = centre.x - newWidth / 2,
            maxX = centre.x + newWidth / 2,
            minY = centre.y - newHeight / 2,
            maxY = centre.y + newHeight / 2
        return new Extent(minX, maxX, minY, maxY)
    }
}

class Feature {
    constructor(public geometry: Geom, public properties = {} as { [key: string]: any }) {
    }

    static fromJSON(json: GeoFeature | Geometry, name = '') {
        let target = json as GeoFeature
        if (!json.type.includes('Feature')) {
            target = {
                type: 'Feature',
                geometry: json as any,
                properties: {}
            }
        }
        const props = { ...target.properties }
        if (name) props.name = name
        props.geometryType = target.geometry.type
        return new Feature(toGeom(target.geometry), props)
    }

    toWebmercator() {
        const geom = transform(this.geometry, p => {
            const { x, y } = Conv.ll2m(p[0], p[1])
            return [x, y]
        })
        return new Feature(geom, this.properties)
    }

    get extent() {
        return Extent.getExtent(this.geometry)
    }

    set id(val: string) {
        this.properties['id'] = val
    }

    get id() {
        return this.properties['id']
    }
}

interface GeoGeometry {
    type: string,
    coordinates: number[] | number[][] | number[][][] | number[][][][]
}

type geomSource = string | GeoFeature | GeoGeometry | number[] | number[][] | Feature | Geom

class GeomViewer {
    features = [] as Feature[]
    option = { ...svgOptions }
    element = document.createElement('div')

    constructor(container?: HTMLElement, options?: Partial<typeof svgOptions>) {
        this.element.classList.add('GeomViewer')
        this.element.style.display = 'inline-block'
        if (container) container.appendChild(this.element)
        if (options) this.option = { ...this.option, ...options }
        this.render()
        this.render = debounce(this.render)
        this.add = this.add.bind(this)
        this.get = this.get.bind(this)
        this.last = this.last.bind(this)
        this.addFromURL = this.addFromURL.bind(this)
    }

    appendTo(container: HTMLElement) {
        container.appendChild(this.element)
    }

    private render() {
        const { element, features, option } = this
        element.innerHTML = ''
        element.style.width = option.width + 'px'
        element.style.height = option.height + 'px'
        features.forEach((f, i) => f.id = f.id || 'Feature_' + i)
        if (features.length) {
            element.appendChild(toSVG(features, option))
        }
    }

    private addFeature(feature: Feature) {
        this.features.push(feature)
        this.render()
    }

    add(geomSrc: geomSource, id?: string) {
        let feature = null as unknown as Feature
        if (geomSrc instanceof Feature) {
            feature = geomSrc
        } else if ((geomSrc as any)['toJSON']) {
            feature = new Feature(geomSrc as Geom)
        } else {
            feature = new Feature(toGeom(geomSrc))
        }
        if (id) feature.id = id
        this.addFeature(feature)
        return feature.geometry
    }

    getFeature(id: string) {
        return this.features.find(f => f.id == id)
    }

    get(id: string) {
        return this.getFeature(id)?.geometry as Geom
    }

    last() {
        return this.features[this.features.length - 1]?.geometry
    }

    async addFromURL(url: string, projectToWebMercator = true, idGenerator?: IdGenerator) {
        const json = await (await fetch(url)).json() as FeatureCollection
        let features = json.features.map(f => Feature.fromJSON(f))
        if (projectToWebMercator) features = features.map(f => f.toWebmercator())
        if (idGenerator) features.forEach(f => {
            f.id = (typeof idGenerator === 'string') ? f.properties[idGenerator] : idGenerator(f)
        })
        features.forEach(f => this.add(f))
        return features
    }

    toGeom(jsonOrCoods: string | number[][] | number[] | any, type?: geomType): Geom {
        return toGeom(jsonOrCoods, type)
    }
}

type IdGenerator = string | ((f: Feature) => string)

type geomType = 'Point' | 'LineString' | 'Polygon'

export { GeomViewer, Feature, Extent }