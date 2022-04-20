[@aslab/geocalc](README.md) / Exports

# @aslab/geocalc

## Table of contents

### Interfaces

- [BufferOptions](interfaces/BufferOptions.md)
- [Geom](interfaces/Geom.md)

### Functions

- [makePolygon](modules.md#makepolygon)
- [toGeom](modules.md#togeom)

## Functions

### makePolygon

▸ **makePolygon**(`lines`, `mitreLimit?`): [`Geom`](interfaces/Geom.md)

Build a polygon with line strings. LineStrings are linked either by mitre joint or straight line.
For example line A and B, they will be extended towards each other by gap*mitreLimit for finding the joint point.
When found, a mitre joint will be added to the polygon shell otherwise just a straight line

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `lines` | [`Geom`](interfaces/Geom.md)[] | `undefined` | boundary LineStrings, need to be in correct order |
| `mitreLimit` | `number` | `2` | default as 2, big number encourages mitre joint |

#### Returns

[`Geom`](interfaces/Geom.md)

___

### toGeom

▸ **toGeom**(`jsonOrCoods`, `type?`): [`Geom`](interfaces/Geom.md)

Create a GeoCalc Geom object

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `jsonOrCoods` | `any` | GeoJSON (string or Object) or Coords (number[][]) |
| `type` | `geomType` | 'Point'\|'LineString'\|'Polygon', ignored when GeoJSON is given |

#### Returns

[`Geom`](interfaces/Geom.md)
