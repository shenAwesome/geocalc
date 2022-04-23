'use strict';

//to restore $ which GWT overwrites when class is used the first time
const _$ = window['$']
jts.Geom.log('hello')
window['$'] = _$

function createMap(title, code) {
    $('<h3></h3>').html(title).appendTo('body')
    const panel = $(`<div class='example'>
        <div class="mapDiv"></div>
        <div class="code"></div>
    </div>`).appendTo('body')
    const map = L.map(panel.find('.mapDiv').get(0), {
        attributionControl: false,
        zoomControl: false,
        drawControl: true
    }).setView([51.505, -0.09], 13);
    //L.esri.basemapLayer('Topographic').addTo(map);
    function toGeom(wkt) {
        return jts.Geom.create(wkt)
    }
    function draw(geom, color) {
        var layer = L.Proj.geoJson({ //epsg 3857
            "type": "Feature",
            "geometry": JSON.parse(geom.toJSON()),
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:EPSG::3857"
                }
            }
        }).addTo(map);
        layer.setStyle({
            "color": color
        })
    }
    function fitBounds() {
        let bound = null
        map.eachLayer(function (layer) {
            if (layer.getBounds) {
                const newBounds = layer.getBounds()
                bound = bound ? bound.extend(newBounds) : newBounds
            }
        })
        map.fitBounds(bound)
    }

    panel.find('.code').html(code.trim().replace(/(?:\r\n|\r|\n)/g, '<br>'))
    eval(code)
    fitBounds()
}

const code = [
    {
        "title": "Buffer", "code": `
        const point = toGeom('POINT (0 0)') 
        console.log(point.toJSON())
        draw(point) 
        const buffered1 = point.buffer(100)
        draw(buffered1,'red') 
        const buffered2 = buffered1.buffer(20)
        draw(buffered2,'blue') 
    `},
    {
        "title": "Buffer Options", "code": `
        const line = toGeom('LINESTRING (30 10, 10 30, 40 40)')  
        draw(line,'black')  
        draw(line.buffer(5),'red') 
        
        const line2 = line.offset(50,0)
        draw(line2,'black')  
        draw(line2.buffer(5,{
            JoinStyle:'Mitre',  //'Round' | 'Mitre' | 'Bevel'
            CapStyle:'Flat' //'Round' | 'Flat' | 'Square'
        }),'blue')
    `},
    {
        "title": "Intersection", "code": `  
        const polygon1 = toGeom('POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))')  
        const polygon2 = polygon1.offset(15,5)
        draw(polygon1,'red')
        draw(polygon2,'blue')
        const intersection = polygon1.intersection(polygon2)
        draw(intersection,'yellow')
    `},
    {
        "title": "Union", "code": `  
        const polygon1 = toGeom('POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))')  
        const polygon2 = polygon1.offset(15,5)  
        draw( polygon1.union(polygon2),'black')
    `},
    {
        "title": "Difference", "code": `  
        const polygon1 = toGeom('POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))')  
        const polygon2 = polygon1.offset(15,5)  
        draw( polygon2,'gray')
        draw( polygon1.difference(polygon2),'red')
    `},
    {
        "title": "GetInteriorPoint", "code": `  
        const polygon = toGeom('POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))')  
        draw(polygon,'black') 
        draw(polygon.getInteriorPoint())
        const line = toGeom('LINESTRING (50 20,100 20)')  
        draw(line,'black') 
        draw(line.getInteriorPoint())
    `}
]


$(() => {
    code.forEach(c => {
        createMap(c.title, c.code)
    })
})