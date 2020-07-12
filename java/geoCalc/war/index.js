function main() {

  function projCoord(coord) {
    if (typeof coord[0] == 'number') {
      const projected = proj4('EPSG:4326', 'EPSG:3785', coord)
      coord[0] = projected[0]
      coord[1] = projected[1]
    } else {
      coord.forEach(c => projCoord(c))
    }
  }
  //has coordinates
  function projGeom(geomJSON) {
    projCoord(geomJSON.coordinates)
  }

  function proj(geoJSON) {
    const { type } = geoJSON
    if (geoJSON.coordinates) {
      projGeom(geoJSON)
    } else {
      if (type == 'Feature') {
        projGeom(geoJSON.geometry)
      }
      if (type == 'FeatureCollection') {
        geoJSON.features.forEach(f => {
          projGeom(f.geometry)
        })
      }
    }
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function addJSONGeom(geom) {
    var layer = L.Proj.geoJson({
      "type": "Feature",
      "geometry": geom,
      "crs": {
        "type": "name",
        "properties": {
          "name": "urn:ogc:def:crs:EPSG::3857"
        }
      }
    }).addTo(map);
    return layer;
  }

  function addGeom(geom, color) {
    const layer = addJSONGeom(JSON.parse(geom.toJSON()))
    layer.setStyle({
      "color": color
    })
  }

  var map = L.map('mapid', {
    attributionControl: false,
    zoomControl: false,
    drawControl: true
  }).setView([51.505, -0.09], 13);
  L.esri.basemapLayer('Topographic').addTo(map);

  function toGeom(jsonObj) {
    return new jts.Geom(JSON.stringify(jsonObj))
  }

  proj(GeoJSON1)

  const layer = addJSONGeom(GeoJSON1.features[0].geometry)
  map.fitBounds(layer.getBounds().pad(2))
  let poly1, poly2;

  {
    const geom = toGeom(GeoJSON1.features[0].geometry)
    poly1 = geom.buffer(100, [1, 0])//shen
    addGeom(poly1)
  }

  {
    const geom = toGeom(GeoJSON1.features[1].geometry)
    addGeom(geom)
    poly2 = geom.buffer(200, [0, 0])
    addGeom(poly2)

    addGeom(poly2.simplify(50), 'red')

    addGeom(poly1.intersection(poly2), '#ff7800')

  }

  {
    const geom = toGeom(GeoJSON1.features[2].geometry)
    addGeom(geom, '#ff7800')
    addGeom(geom.buffer(100, [1, 0]))
  }

  proj(GeoJSON2)

  {
    const line = toGeom(GeoJSON2.features[0].geometry)
    addGeom(line, '#ff7800')

    const point1 = toGeom(GeoJSON2.features[1].geometry)
    addGeom(point1)

    const point2 = toGeom(GeoJSON2.features[2].geometry)
    addGeom(point2)

    const splitted = line.splitLine([point1, point2])
    splitted.forEach((s, i) => {
      addGeom(s, getRandomColor())
    })

    addGeom(line.offsetLine(100), 'red')
    addGeom(line.offsetLine(-100), 'blue')
  }

  {
    const line = toGeom(GeoJSON2.features[3].geometry)
    addGeom(line, '#ff7800')

    const point1 = toGeom(GeoJSON2.features[4].geometry)
    addGeom(point1)

    const point2 = toGeom(GeoJSON2.features[5].geometry)
    addGeom(point2)

    const point3 = toGeom(GeoJSON2.features[6].geometry)
    addGeom(point3);

    [point1, point2, point3].forEach(p => {
      //console.log(p.lengthOnLine(line))
      console.log(p.ratioOnLine(line))
    })

    const splitted = line.splitRing([point1, point2, point3])
    console.log(splitted.length)
    splitted.forEach((s, i) => {
      console.log(s.toJSON())
      addGeom(s, getRandomColor())
    })

  }

  proj(GeoJSON3)
  {
    const line0 = toGeom(GeoJSON3.features[0].geometry),
      line1 = toGeom(GeoJSON3.features[1].geometry),
      line2 = toGeom(GeoJSON3.features[2].geometry)

    const polygon = jts.Geom.makePolygon([line0, line1, line2], 2)
    addGeom(polygon)

    addGeom(line0, '#ff7800')
    addGeom(line1, '#ff7800')
    addGeom(line2, '#ff7800')

  }

}

setTimeout(main, 1000);