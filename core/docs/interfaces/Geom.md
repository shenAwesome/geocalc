[@aslab/geocalc](../README.md) / [Exports](../modules.md) / Geom

# Interface: Geom

## Table of contents

### Methods

- [along](Geom.md#along)
- [area](Geom.md#area)
- [buffer](Geom.md#buffer)
- [contains](Geom.md#contains)
- [coordinate](Geom.md#coordinate)
- [densify](Geom.md#densify)
- [difference](Geom.md#difference)
- [distance](Geom.md#distance)
- [extendLine](Geom.md#extendline)
- [extractLine](Geom.md#extractline)
- [getCentroid](Geom.md#getcentroid)
- [getInteriorPoint](Geom.md#getinteriorpoint)
- [intersection](Geom.md#intersection)
- [isWithinDistance](Geom.md#iswithindistance)
- [length](Geom.md#length)
- [lengthOnLine](Geom.md#lengthonline)
- [lineTo](Geom.md#lineto)
- [nearestPoints](Geom.md#nearestpoints)
- [norm](Geom.md#norm)
- [offsetLine](Geom.md#offsetline)
- [overlaps](Geom.md#overlaps)
- [ratioOnLine](Geom.md#ratioonline)
- [simplify](Geom.md#simplify)
- [splitLine](Geom.md#splitline)
- [splitRing](Geom.md#splitring)
- [toJSON](Geom.md#tojson)
- [type](Geom.md#type)
- [union](Geom.md#union)

## Methods

### along

▸ **along**(`distance`): [`Geom`](Geom.md)

For a lineString, return the point at a specified distance along the line

#### Parameters

| Name | Type |
| :------ | :------ |
| `distance` | `number` |

#### Returns

[`Geom`](Geom.md)

___

### area

▸ **area**(): `number`

Returns the area of this Geometry

#### Returns

`number`

___

### buffer

▸ **buffer**(`distance`, `options?`): [`Geom`](Geom.md)

Computes the buffer of a geometry for a given distance.
Options:
- JoinStyle: 'Round' | 'Mitre' | 'Bevel', default = 'Round'
- CapStyle: 'Round' | 'Flat' | 'Square', default = 'Round'
- QuadrantSegments: int, default = 8
- MitreLimit: float, default = 5.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `distance` | `number` |
| `options?` | `Partial`<[`BufferOptions`](BufferOptions.md)\> |

#### Returns

[`Geom`](Geom.md)

___

### contains

▸ **contains**(`geom2`): `boolean`

Tests whether this geometry contains the argument geometry.

#### Parameters

| Name | Type |
| :------ | :------ |
| `geom2` | [`Geom`](Geom.md) |

#### Returns

`boolean`

___

### coordinate

▸ **coordinate**(): `number`[]

Returns a vertex of this Geometry (usually, but not necessarily, the first one)

#### Returns

`number`[]

___

### densify

▸ **densify**(`distanceTolerance`): [`Geom`](Geom.md)

Densifies a geometry using a given distance tolerance

#### Parameters

| Name | Type |
| :------ | :------ |
| `distanceTolerance` | `number` |

#### Returns

[`Geom`](Geom.md)

___

### difference

▸ **difference**(`geom2`): [`Geom`](Geom.md)

Computes a Geometry representing the closure of the point-set of the points contained in this Geometry that are not contained in the other Geometry.

#### Parameters

| Name | Type |
| :------ | :------ |
| `geom2` | [`Geom`](Geom.md) |

#### Returns

[`Geom`](Geom.md)

___

### distance

▸ **distance**(`geom2`): `number`

Returns the minimum distance between this Geometry and another Geometry.

#### Parameters

| Name | Type |
| :------ | :------ |
| `geom2` | [`Geom`](Geom.md) |

#### Returns

`number`

___

### extendLine

▸ **extendLine**(`change`): [`Geom`](Geom.md)

For a LineString, shorten or prolong it at the end.

#### Parameters

| Name | Type |
| :------ | :------ |
| `change` | `number` |

#### Returns

[`Geom`](Geom.md)

___

### extractLine

▸ **extractLine**(`start`, `end`): [`Geom`](Geom.md)

For a lineString, return a sub string based on start and end distance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `start` | `number` |
| `end` | `number` |

#### Returns

[`Geom`](Geom.md)

___

### getCentroid

▸ **getCentroid**(): [`Geom`](Geom.md)

Computes the centroid of this Geometry

#### Returns

[`Geom`](Geom.md)

___

### getInteriorPoint

▸ **getInteriorPoint**(): [`Geom`](Geom.md)

Computes an interior point of this Geometry. An interior point is guaranteed to lie in the interior of the Geometry

#### Returns

[`Geom`](Geom.md)

___

### intersection

▸ **intersection**(`geom2`): [`Geom`](Geom.md)

Computes a Geometry representing the point-set which is common to both this Geometry and the other Geometry.

#### Parameters

| Name | Type |
| :------ | :------ |
| `geom2` | [`Geom`](Geom.md) |

#### Returns

[`Geom`](Geom.md)

___

### isWithinDistance

▸ **isWithinDistance**(`geom2`, `distance`): `boolean`

Tests whether the distance from this Geometry to another is less than or equal to a specified value.

#### Parameters

| Name | Type |
| :------ | :------ |
| `geom2` | [`Geom`](Geom.md) |
| `distance` | `number` |

#### Returns

`boolean`

___

### length

▸ **length**(): `number`

Returns the length of this Geometry.
Linear geometries return their length.
Areal geometries return their perimeter.

#### Returns

`number`

___

### lengthOnLine

▸ **lengthOnLine**(`line`): `number`

For a point, find it's position on a line as length to the start

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Geom`](Geom.md) |

#### Returns

`number`

___

### lineTo

▸ **lineTo**(`geom2`): [`Geom`](Geom.md)

create a line to other geometry

#### Parameters

| Name | Type |
| :------ | :------ |
| `geom2` | [`Geom`](Geom.md) |

#### Returns

[`Geom`](Geom.md)

___

### nearestPoints

▸ **nearestPoints**(`geom2`): [`Geom`](Geom.md)[]

Compute the the nearest points of two geometries

#### Parameters

| Name | Type |
| :------ | :------ |
| `geom2` | [`Geom`](Geom.md) |

#### Returns

[`Geom`](Geom.md)[]

___

### norm

▸ **norm**(): [`Geom`](Geom.md)

Creates a new Geometry which is a normalized copy of this Geometry.
Normal form is a unique representation for Geometry

#### Returns

[`Geom`](Geom.md)

___

### offsetLine

▸ **offsetLine**(`offsetDistance`): [`Geom`](Geom.md)

For a lineString, offset it by distance

#### Parameters

| Name | Type |
| :------ | :------ |
| `offsetDistance` | `number` |

#### Returns

[`Geom`](Geom.md)

___

### overlaps

▸ **overlaps**(`geom2`): `boolean`

Tests whether this geometry overlaps the specified geometry.

#### Parameters

| Name | Type |
| :------ | :------ |
| `geom2` | [`Geom`](Geom.md) |

#### Returns

`boolean`

___

### ratioOnLine

▸ **ratioOnLine**(`line`): `number`

For a point, find it's position on a line as ratio

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Geom`](Geom.md) |

#### Returns

`number`

___

### simplify

▸ **simplify**(`tolerance`): [`Geom`](Geom.md)

Simplifies a geometry using a given tolerance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `tolerance` | `number` |

#### Returns

[`Geom`](Geom.md)

___

### splitLine

▸ **splitLine**(`points`): [`Geom`](Geom.md)[]

For a lineString, split by points

#### Parameters

| Name | Type |
| :------ | :------ |
| `points` | [`Geom`](Geom.md)[] |

#### Returns

[`Geom`](Geom.md)[]

___

### splitRing

▸ **splitRing**(`points`): [`Geom`](Geom.md)[]

For a closed lineString (ring), split by points

#### Parameters

| Name | Type |
| :------ | :------ |
| `points` | [`Geom`](Geom.md)[] |

#### Returns

[`Geom`](Geom.md)[]

___

### toJSON

▸ **toJSON**(): `string`

Writes a Geometry in GeoJson format to a String.

#### Returns

`string`

___

### type

▸ **type**(): `string`

return geometry type

#### Returns

`string`

___

### union

▸ **union**(`geom2`): [`Geom`](Geom.md)

Computes a Geometry representing the point-set which is contained in both this Geometry and the other Geometry.

#### Parameters

| Name | Type |
| :------ | :------ |
| `geom2` | [`Geom`](Geom.md) |

#### Returns

[`Geom`](Geom.md)
