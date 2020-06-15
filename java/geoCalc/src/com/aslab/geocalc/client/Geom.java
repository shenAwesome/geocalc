package com.aslab.geocalc.client;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.locationtech.jts.densify.Densifier;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineSegment;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.geom.util.LineStringExtracter;
import org.locationtech.jts.io.geojson.GeoJsonReader;
import org.locationtech.jts.io.geojson.GeoJsonWriter;
import org.locationtech.jts.linearref.LengthIndexedLine;
import org.locationtech.jts.operation.buffer.BufferOp;
import org.locationtech.jts.operation.buffer.BufferParameters;
import org.locationtech.jts.operation.distance.DistanceOp;
import org.locationtech.jts.operation.polygonize.Polygonizer;
import org.locationtech.jts.simplify.DouglasPeuckerSimplifier;
import org.timepedia.exporter.client.Export;
import org.timepedia.exporter.client.ExportPackage;
import org.timepedia.exporter.client.Exportable;

import com.google.gwt.core.client.JavaScriptObject;

@Export
@ExportPackage("jts")
public class Geom implements Exportable {
	static GeometryFactory factory = new GeometryFactory();
	static double Tolerance = 0.000001;

	private static double round(double value) {
		return (double) Math.round(value * 100000d) / 100000d;
	}

	private static Coordinate[] noDuplicate(Coordinate[] pts) {
		List<Coordinate> coordList = new ArrayList<Coordinate>();
		Coordinate last = null;
		for (Coordinate pt : pts) {
			if (last == null || !pt.equals2D(last, Tolerance)) {
				coordList.add(pt);
				last = pt;
			}
		}
		return coordList.toArray(new Coordinate[0]);
	}

	public static Geom create(String type, Coord[] pts) {
		Geometry geom = null;

		List<Coordinate> coordList = new ArrayList<Coordinate>();
		for (Coord pt : pts) {
			coordList.add(new Coordinate(pt.getX(), pt.getY()));
		}

		Coordinate[] coords = noDuplicate(coordList.toArray(new Coordinate[0]));

		if (type.equalsIgnoreCase("Point")) {
			geom = factory.createPoint(coords[0]);
		}
		if (type.equalsIgnoreCase("LineString")) {
			geom = factory.createLineString(coords);
		}
		if (type.equalsIgnoreCase("Polygon")) {
			geom = factory.createPolygon(coords);
		}

		return geom == null ? null : create(geom);
	}

	private static Geom create(Geometry geom) {
		Geom g = new Geom();
		g.geom = geom;
		// g.geom = geom.norm();
		return g;
	}

	public Geometry geom;

	Geom() {
	}

	public Geom(String json) {
		try {
			geom = (new GeoJsonReader()).read(json);
		} catch (Exception e) {
		}
	}

	public String toJSON() {
		GeoJsonWriter writer = new GeoJsonWriter(4);
		writer.setEncodeCRS(false);
		return writer.write(geom);
	}

	public double[] coordinate() {
		Coordinate c = geom.getCoordinate();
		return new double[] { c.x, c.y };
	}

	private Geom createPoint(Coordinate coord) {
		return create(new GeometryFactory().createPoint(coord));
	}

	public static native String getType(double[] msg) /*-{
		return "hello"
	}-*/;

	public Geom buffer(double radius) {
		return buffer(radius, new double[0]);
	}

	/**
	 * int joinStyle, int endCapStyle, quadrantSegments or mitreLimit,
	 * JOIN_ROUND,JOIN_MITRE,JOIN_BEVEL CAP_ROUND,CAP_FLAT,CAP_SQUARE
	 * 
	 * @param radius
	 * @param params
	 * @return
	 */
	public Geom buffer(double radius, double[] params) {
		BufferParameters bufferParams = new BufferParameters();

		int len = params.length;
		if (len > 0) {
			int type = new int[] { BufferParameters.JOIN_ROUND, BufferParameters.JOIN_MITRE,
					BufferParameters.JOIN_BEVEL }[(int) params[0]];
			bufferParams.setJoinStyle(type);
		}
		if (len > 1) {
			int type = new int[] { BufferParameters.CAP_ROUND, BufferParameters.CAP_FLAT,
					BufferParameters.CAP_SQUARE }[(int) params[1]];
			bufferParams.setEndCapStyle(type);
		}
		if (len > 2) {
			if ((int) params[0] == 0) {
				bufferParams.setQuadrantSegments((int) params[2]);
			} else {
				bufferParams.setMitreLimit(params[2]);
			}
		}

		Geometry bufferred = BufferOp.bufferOp(geom, radius, bufferParams);
		return create(bufferred);
	}

	public Geom simplify(double tolerance) {
		Geometry simplilfied = DouglasPeuckerSimplifier.simplify(geom, tolerance);
		return create(simplilfied);
	}

	public double distance(Geom geom2) {
		return geom.distance(geom2.geom);
	}

	public Geom[] nearestPoints(Geom geom2) {
		Coordinate[] pts = DistanceOp.nearestPoints(geom, geom2.geom);
		return new Geom[] { createPoint(pts[0]), createPoint(pts[1]) };
	}

	public Geom lineTo(Geom geom2) {
		Coordinate[] pts = DistanceOp.nearestPoints(geom, geom2.geom);
		return create(factory.createLineString(pts));
	}

	public double lengthOnLine(Geom line) {
		LengthIndexedLine indexedLine = new LengthIndexedLine(line.geom);
		return indexedLine.indexOf(geom.getCoordinate());
	}
	
	public double ratioOnLine(Geom line) {
		LengthIndexedLine indexedLine = new LengthIndexedLine(line.geom);
		double idx = indexedLine.indexOf(geom.getCoordinate());
		return idx/indexedLine.getEndIndex();
	}

	public Geom along(double distance) {
		LengthIndexedLine indexedLine = new LengthIndexedLine(geom);
		Coordinate coordinate = indexedLine.extractPoint(distance);
		return createPoint(coordinate);
	}

	public Geom extractLine(double start, double end) {
		LengthIndexedLine indexedLine = new LengthIndexedLine(geom);
		return create(indexedLine.extractLine(start, end));
	}

	public double area() {
		return geom.getArea();
	}

	public double length() {
		return geom.getLength();
	}

	public Geom union(Geom geom2) {
		return create(geom.union(geom2.geom));
	}

	public Geom difference(Geom geom2) {
		return create(geom.difference(geom2.geom));
	}

	public Geom intersection(Geom geom2) {
		return create(geom.intersection(geom2.geom));
	}

	public Geom norm() {
		return create(geom.norm());
	}

	public Geom getInteriorPoint() {
		return create(geom.getInteriorPoint());
	}

	public String type() {
		return geom.getGeometryType();
	}

	public Geom getCentroid() {
		return create(geom.getCentroid());
	}

	public boolean contains(Geom geom2) {
		return geom.contains(geom2.geom);
	}

	public boolean overlaps(Geom geom2) {
		return geom.overlaps(geom2.geom);
	}

	public boolean isWithinDistance(Geom geom2, double distance) {
		return geom.isWithinDistance(geom2.geom, distance);
	}

	public Geom densify(double distanceTolerance) {
		return create(Densifier.densify(geom, distanceTolerance));
	}

	public Geom[] splitLine(Geom[] points) {
		LengthIndexedLine indexedLine = new LengthIndexedLine(this.geom);
		List<Double> allIndex = new ArrayList<Double>(); 
		 
		allIndex.add(indexedLine.getStartIndex());
		for (Geom p : points) {
			Coordinate point = p.geom.getCoordinate();
			allIndex.add(indexedLine.indexOf(point));
		}
		allIndex.add(indexedLine.getEndIndex());
		
		Collections.sort(allIndex);

		// keep order , to fix ring issue
//		for (int i = 1; i < allIndex.size() - 1; i++) {
//			if (allIndex.get(i) > allIndex.get(i + 1)) {
//				allIndex.set(i, allIndex.get(i - 1));
//			}
//		}

		List<Geom> parts = new ArrayList<Geom>();
		for (int i = 0; i < allIndex.size() - 1; i++) {
			parts.add(create(indexedLine.extractLine(allIndex.get(i), allIndex.get(i + 1))));
		}
		return parts.toArray(new Geom[0]);
	}

	public Geom[] splitRing(Geom[] points) {
		Geom[] lines = splitLine(points);
		Geom[] result = Arrays.copyOfRange(lines, 1, lines.length);

		Geometry line1 = lines[lines.length - 1].geom;
		Geometry line2 = lines[0].geom;
		ArrayList<Coordinate> both = new ArrayList<Coordinate>(Arrays.asList(line1.getCoordinates()));
		both.addAll(Arrays.asList(line2.getCoordinates()));
		Coordinate[] coords = noDuplicate(both.toArray(new Coordinate[0]));

		result[result.length - 1] = create(factory.createLineString(coords));
		return result;
	}

	/**
	 * doesn't really work well
	 * 
	 * @param offsetDistance
	 * @return
	 */
	public Geom offsetLine(double offsetDistance) {
		BufferParameters params = new BufferParameters();
		params.setJoinStyle(BufferParameters.JOIN_MITRE);
		// params.setMitreLimit(2);
		params.setSingleSided(true);
		Polygon bufferred = (Polygon) BufferOp.bufferOp(geom, offsetDistance, params);

		Coordinate[] coords = bufferred.getExteriorRing().difference(geom.buffer(0.001)).getCoordinates();
		Coordinate[] trimmed = Arrays.copyOfRange(coords, 1, coords.length - 1);

		return create(factory.createLineString(trimmed));
		// offset line is to use the single sided offset buffer and remove the original
		// line and the last, closing point.
		// get the ring then difference ?
	}

	/**
	 * make a lineString shorter or longer
	 * 
	 * @param change
	 * @return
	 */
	public Geom extendLine(double change) {
		Coordinate[] coords = noDuplicate(geom.getCoordinates());
		if (change < 0) {
			return extractLine(0, geom.getLength() + change);
		} else {
			LineSegment lastSeg = new LineSegment(coords[coords.length - 2], coords[coords.length - 1]);
			double len = lastSeg.getLength();
			coords[coords.length - 1] = lastSeg.pointAlong((len + change) / len);
			return create(factory.createLineString(coords));
		}
	}

	private static LineSegment extendSegment(LineSegment seg, double distance, boolean atStart) {
		double len = seg.getLength();
		if (len > 0) {
			if (atStart) {
				Coordinate newStart = seg.pointAlong(-distance / len);
				// seg.setCoordinates(newStart, seg.p1);
				return new LineSegment(newStart, seg.p1);
			} else {
				Coordinate newEnd = seg.pointAlong((len + distance) / len);
				// seg.setCoordinates(seg.p0, newEnd);
				return new LineSegment(seg.p0, newEnd);
			}
		}
		return seg;
	}

	public Geom splitByLine(Geom line) {
		Geometry col = PolygonTools.splitPolygon(geom, line.geom);
		return create(col);
	}

	public static Geom makePolygon(Geom[] lines, double mitreLimit) {
		// iterate through lines, modify segments to make them 'link'
		// for linking a and b, find the last seg of a and first seg of b
		// measure the gap, then extend the ends of segs with gap distance
		// found intersection of these 2 extended segments, if found, set it as end of a
		// seg and start of b seg
		// finally create a ring use all modified lines' coordinates. remove duplicated
		// vertices
		// return a polygon with ring as shell
		Coordinate[][] allCoords = new Coordinate[lines.length][];
		for (int i = 0; i < lines.length; i++) {
			allCoords[i] = noDuplicate(lines[i].geom.getCoordinates());
		}

		for (int i = 0; i < lines.length; i++) {
			Coordinate[] current = allCoords[i];
			Coordinate[] next = allCoords[(i == (lines.length - 1)) ? 0 : i + 1];
			LineSegment segA = new LineSegment(current[current.length - 2], current[current.length - 1]);
			LineSegment segB = new LineSegment(next[0], next[1]);
			double gap = segA.p1.distance(segB.p0);
			segA = extendSegment(segA, gap * mitreLimit, false);
			segB = extendSegment(segB, gap * mitreLimit, true);
			Coordinate intersection = segA.intersection(segB);

			if (intersection != null) {
				current[current.length - 1] = intersection;
				next[0] = intersection;
			}
		}

		List<Coordinate> coordList = new ArrayList<Coordinate>();
		for (Coordinate[] coords : allCoords) {
			coordList.addAll(Arrays.asList(coords));
		}
		coordList.add(coordList.get(0));// make sure it's a ring

		Polygon polygon = factory.createPolygon(noDuplicate(coordList.toArray(new Coordinate[0])));

		return create(polygon);
	}
}

class Coord extends JavaScriptObject {

	protected Coord() {
	}

	public final native double getX() /*-{
		return this[0];
	}-*/;

	public final native double getY() /*-{
		return this[1];
	}-*/;
}

class PolygonTools {

	@SuppressWarnings("rawtypes")
	public static Geometry polygonize(Geometry geometry) {
		List lines = LineStringExtracter.getLines(geometry);
		Polygonizer polygonizer = new Polygonizer();
		polygonizer.add(lines);
		Collection polys = polygonizer.getPolygons();
		Polygon[] polyArray = GeometryFactory.toPolygonArray(polys);
		return geometry.getFactory().createGeometryCollection(polyArray);
	}

	public static Geometry splitPolygon(Geometry poly, Geometry line) {
		Geometry nodedLinework = poly.getBoundary().union(line);
		Geometry polys = polygonize(nodedLinework); 
		// Only keep polygons which are inside the input
		List<Polygon> output = new ArrayList<Polygon>();
		for (int i = 0; i < polys.getNumGeometries(); i++) {
			Polygon candpoly = (Polygon) polys.getGeometryN(i);
			if (poly.contains(candpoly.getInteriorPoint())) {
				output.add(candpoly);
			}
		}
		return poly.getFactory().createGeometryCollection(GeometryFactory.toGeometryArray(output));
	}
}