/**
 *  Copyright (C) 2024 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import 'path-data-polyfill';
import { Vector2 } from 'three';
import { Line2, CubicBezier } from './types';
import { RTree, RTreeBuilder } from './rTree';

// The following interface extension makes TypeScript aware that the getPathData
// member has been implemented by the path-data-polyfill for all Geometry
// Elements (that is, Basic Shapes).

interface SVGPolyfilledGeometryElement extends SVGGeometryElement {
	getPathData: (settings?: SVGPathDataSettings) => Array<SVGPathSegment>;
}

class PrimitiveCollector {

	lines: Line2[];

	curves: CubicBezier[];

	offset: Vector2;

	constructor(offset: Vector2) {
		this.lines = [];
		this.curves = [];
		this.offset = offset;
	}

	addLine(line: Line2) {
		this.lines.push(line);
	}

	addCurve(curve: CubicBezier) {
		this.curves.push(curve);
	}
}

/**
 * A helper class to collect the output of getPathData into set of Lines in
 * world space
 */
class PathCollector {
	collector: PrimitiveCollector;

	currentPosition: Vector2;

	startPosition: Vector2;

	constructor(collector: PrimitiveCollector) {
		this.collector = collector;
		this.currentPosition = new Vector2(0, 0);
	}

	setStartPosition(values: number[]) {
		this.startPosition = new Vector2(values[0] + this.collector.offset.x, values[1] + this.collector.offset.y);
		this.currentPosition = new Vector2(this.startPosition.x, this.startPosition.y); // Copy the vector
	}

	// Adds a line from the current position to the parameters at the offset. The
	// offset should be given as an array index (rather than 2-componetn coord
	// index).
	addLine(values: number[], offset: number) {
		const position = new Vector2(values[offset] + this.collector.offset.x, values[offset + 1] + this.collector.offset.y); // For lines, arguments must always be a multiple of 2
		const line = new Line2(this.currentPosition, position);
		this.currentPosition = position;
		if (line.distance() != 0) {
			this.collector.addLine(line);
		}
	}

	addCurve(values: number[]) {
		const p0 = this.currentPosition;
		const p1 = new Vector2(this.collector.offset.x + values[0], this.collector.offset.y + values[1]);
		const p2 = new Vector2(this.collector.offset.x + values[2], this.collector.offset.y + values[3]);
		const p3 = new Vector2(this.collector.offset.x + values[4], this.collector.offset.y + values[5]);
		const curve = new CubicBezier(p0, p1, p2, p3);
		this.collector.addCurve(curve);
		this.currentPosition = p3;
	}

	// Closes the subpath by drawing a straight line from the current position
	// to the start of the subpath.
	closePath() {
		const line = new Line2(this.currentPosition, this.startPosition);
		this.collector.addLine(line);

		// If the next command is not MOVETO, then the subpath should revert back
		// to the last initial point. (If the next command is a MOVETO, then this
		// will be overridden imminently.)

		this.currentPosition = new Vector2(this.startPosition.x, this.startPosition.y);
	}
}

/** Parses the SVG and outputs the shapes contained within it into the
 * provided Collector.
 */
class SvgParser {

	collector: PrimitiveCollector;

	constructor(collector: PrimitiveCollector) {
		this.collector = collector;
	}

	parseSvg(svg: SVGSVGElement) {

		// The current version of this parser assumes all elements are defined
		// in world-space - that is, it does not consider groups, instances or
		// the transform attribute.

		// Currently the svgs we get from ODA do not appear to use these
		// features, however in the future we may need to move from simple
		// enumeration to performing a context-aware traversal of the DOM.

		this.getRectElements(svg);
		this.getCircleElements(svg);
		this.getEllipseElements(svg);
		this.getLineElements(svg);
		this.getPolylineElements(svg);
		this.getPolygonElements(svg);
		this.getPathElements(svg);
	}

	private getRectElements(svg: SVGElement) {
		this.addGeometryElements(svg.querySelectorAll<SVGPolyfilledGeometryElement>('rect'));
	}

	private getCircleElements(svg: SVGElement) {
		this.addGeometryElements(svg.querySelectorAll<SVGPolyfilledGeometryElement>('circle'));
	}

	private getEllipseElements(svg: SVGElement) {
		this.addGeometryElements(svg.querySelectorAll<SVGPolyfilledGeometryElement>('ellipse'));
	}

	private getLineElements(svg: SVGElement) {
		this.addGeometryElements(svg.querySelectorAll<SVGPolyfilledGeometryElement>('line'));
	}

	private getPolylineElements(svg: SVGElement) {
		this.addGeometryElements(svg.querySelectorAll<SVGPolyfilledGeometryElement>('polyline'));
	}

	private getPolygonElements(svg: SVGElement) {
		this.addGeometryElements(svg.querySelectorAll<SVGPolyfilledGeometryElement>('polygon'));
	}

	private getPathElements(svg: SVGSVGElement) {
		const paths = svg.querySelectorAll<SVGPathElement>('path:not([stroke=\'none\'])');
		for (let i = 0; i < paths.length; i++) {
			const p = paths[i];
			const segments = p.getPathData({ normalize: true });
			this.addPathElements(segments);
		}
	}

	private addGeometryElements(nodes: NodeListOf<SVGPolyfilledGeometryElement>) {
		for (let i = 0; i < nodes.length; i++) {
			const r = nodes[i];
			this.addPathElements(r.getPathData({ normalize: true }));
		}
	}

	private addPathElements(segments: SVGPathSegment[]) {
		const pathCollector = new PathCollector(this.collector);
		for (const segment of segments) {
			// Passing the normalize flag means getPathData will transform
			// all paths into one of the following absolute types
			switch (segment.type) {
				case 'M':
					pathCollector.setStartPosition(segment.values);
					break;
				case 'L':
					for (let s = 0; s < segment.values.length; s += 2) {
						pathCollector.addLine(segment.values, s);
					}
					break;
				case 'C':
					pathCollector.addCurve(segment.values);
					break;
				case 'Z':
					pathCollector.closePath();
					break;
			}
		}
	}
}

export class SnapResults {
	closestEdge: Vector2;

	closestNode: Vector2;

	closestIntersection: Vector2;

	constructor() {
		this.closestEdge = null;
		this.closestNode = null;
		this.closestIntersection = null;
	}
}

/**
 * Allows snapping to an SVG based on path primitives
 */
export class SVGSnapHelper {

	container: HTMLElement;

	svg: SVGSVGElement;

	rtree: RTree; //RTree that stores Lines, Curves and similar line-type primitives

	constructor() {
		this.container = document.createElement('div');
	}

	/**
	 * Loads an SVG from a URL into the Snap Helper. This method is asynchronous
	 * and so it might be some time before the tree is initialised. During this
	 * time snap() may be called but will return as if there are no snap points
	 * in range.
	 */
	async load(src: string) {
		const res = await fetch(src);
		const text = await res.text();
		this.container.innerHTML = text;
		this.initialise();
	}

	private initialise() {

		// This method parses the SVG body as an SVG to extract the primitives
		// in local (svg) space.

		this.svg = this.container.querySelector('svg') as SVGSVGElement;

		if (!this.svg.width || this.svg.width.baseVal.unitType != 1) {
			console.error('SVG width is not correctly specified. Width and Height are expected to be given, without units. SVGSnap may not work.');
		}

		const viewBoxOffset = new Vector2(this.svg.viewBox.baseVal.x, this.svg.viewBox.baseVal.y);

		if (viewBoxOffset.length() != 0) {
			console.error('SVG has a non-zero viewBox offset. SVGSnap will attempt to counteract the offset to match createImageBitamp, but this is not supported and the behaviour is not guaranteed.');
		}

		const collector = new PrimitiveCollector(viewBoxOffset.multiplyScalar(-1));

		// Extract all the edge-like elements. The responses here should include
		// all Basic Shapes, and directly declared Path elements.
		// While all Basic Shapes can degenerate to Path elements, some tests
		// can be performed more quickly against the more abstract primitive.

		const parser = new SvgParser(collector);
		parser.parseSvg(this.svg);

		this.buildAccelerationStructures(collector);
	}

	private buildAccelerationStructures(collector: PrimitiveCollector) {
		const rbuilder = new RTreeBuilder({
			lines: collector.lines,
			curves: collector.curves,
			n: 10,
		});
		this.rtree = rbuilder.build();
	}

	/**
	 * Looks for three types of snap point around the cursor position, within
	 * the provided search radius, and returns a structure with the closest
	 * of each three types, individually.
	 */
	snap(position: Vector2, radius: number): SnapResults {

		const results = new SnapResults();

		if (!this.rtree) { // The svg is loaded asynchronously, so if this is called before the tree has been built return an empty response
			return results;
		}

		const queryResults = this.rtree.query(position, radius);

		results.closestEdge = queryResults.closestEdge;
		results.closestNode = queryResults.closestNode;
		results.closestIntersection = queryResults.closestIntersection;

		return results;
	}
}

