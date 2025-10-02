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
import { Vector2, Vector2Like } from 'three';
import { Line2, CubicBezier, SnapResults } from './types';
import { RTree, RTreeBuilder } from './rTree';
import DOMPurify from 'dompurify';

// The following interface extension makes TypeScript aware that the getPathData
// member has been implemented by the path-data-polyfill for all Geometry
// Elements (that is, Basic Shapes).

interface SVGPolyfilledGeometryElement extends SVGGeometryElement {
	getPathData: (settings?: SVGPathDataSettings) => Array<SVGPathSegment>;
}

class PrimitiveCollector {

	lines: Line2[];

	curves: CubicBezier[];

	transformStack: DOMMatrix[];

	constructor() {
		this.lines = [];
		this.curves = [];
		this.transformStack = [];
		this.transformStack.push(new DOMMatrix()); // Default constructor should return identity
	}

	addLine(line: Line2) {
		this.lines.push(line);
	}

	addCurve(curve: CubicBezier) {
		this.curves.push(curve);
	}

	getTransform() {
		return this.transformStack[this.transformStack.length - 1];
	}

	pushTransform(matrix: DOMMatrix) {
		this.transformStack.push(this.getTransform().multiply(matrix));
	}

	popTransform() {
		this.transformStack.pop();
	}
}

/**
 * A helper class to collect the output of getPathData into set of Lines in
 * world space
 */
class PathCollector {
	collector: PrimitiveCollector;

	currentPosition: Vector2Like;

	startPosition: Vector2Like;

	constructor(collector: PrimitiveCollector) {
		this.collector = collector;
		this.currentPosition = new Vector2(0, 0);
	}

	setStartPosition(values: number[]) {
		this.startPosition = new DOMPoint(values[0], values[1]).matrixTransform(this.collector.getTransform());
		this.currentPosition = new Vector2(this.startPosition.x, this.startPosition.y); // Copy the vector
	}

	// Adds a line from the current position to the parameters at the offset. The
	// offset should be given as an array index (rather than 2-componetn coord
	// index).
	addLine(values: number[], offset: number) {
		const position = new DOMPoint(values[offset], values[offset + 1]).matrixTransform(this.collector.getTransform()); // For lines, arguments must always be a multiple of 2
		const line = new Line2(this.currentPosition, position);
		this.currentPosition = position;
		if (line.distance() != 0) {
			this.collector.addLine(line);
		}
	}

	addCurve(values: number[]) {
		const m = this.collector.getTransform();
		const p0 = this.currentPosition;
		const p1 = new DOMPoint(values[0], values[1]).matrixTransform(m);
		const p2 = new DOMPoint(values[2], values[3]).matrixTransform(m);
		const p3 = new DOMPoint(values[4], values[5]).matrixTransform(m);
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
		this.parseNode(svg);
	}

	private parseNode(node: SVGGraphicsElement) {

		let shouldPop = false;

		if (node.transform && node.transform.baseVal.numberOfItems > 0) {
			const m = node.transform.baseVal[0].matrix;
			this.collector.pushTransform(m);
			shouldPop = true;
		}

		switch (node.nodeName) {
			case 'path':
			case 'polygon':
			case 'polyline':
			case 'line':
			case 'ellipse':
			case 'circle':
			case 'rect':
				this.addGeometryElement(node as SVGPolyfilledGeometryElement); // (That is, any elements that have the getPathData method)
				break;
			case 'svg':
			case 'g':
				for (const child of node.children) {
					this.parseNode(child as SVGGraphicsElement);
				}
				break;
			// The following container elements are not currently supported,
			// because the exporters we consider do not use them...
			//  a
			//  clipPath
			//  defs
			//  marker
			//  mask
			//  pattern
			//  switch
			//  symbol
		}

		if (shouldPop) {
			this.collector.popTransform();
		}
	}

	private addGeometryElement(node: SVGPolyfilledGeometryElement) {
		this.addPathElements(node.getPathData({ normalize: true }));
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
		this.container.innerHTML = DOMPurify.sanitize(text);
		this.initialise();
	}

	private initialise() {

		// This method parses the SVG body as an SVG to extract the primitives
		// in local (svg) space.

		this.svg = this.container.querySelector('svg') as SVGSVGElement;

		if (!this.svg.width || this.svg.width.baseVal.unitType != 1) {
			console.error('SVG width is not correctly specified. Width and Height are expected to be given, without units. Snapping may not work.');
		}

		const viewBoxOffset = new Vector2(this.svg.viewBox.baseVal.x, this.svg.viewBox.baseVal.y);

		if (viewBoxOffset.length() != 0) {
			console.error('SVG has a non-zero viewBox offset. This is not supported. Snapping will not work.');
		}

		const collector = new PrimitiveCollector();

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
	snap(position: Vector2, radius: number): Promise<SnapResults> {

		const results = new SnapResults();

		if (this.rtree) { // The svg is loaded asynchronously, so if this is called before the tree has been built return an empty response
			const queryResults = this.rtree.query(position, radius);
		
			results.closestEdge = queryResults.closestEdge;
			results.closestNode = queryResults.closestNode;
			results.closestIntersection = queryResults.closestIntersection;
		}

		return Promise.resolve(results); // The SnapHandler interface expects snap to be asynchronous, even though the SVG Snap Handler actually runs synchronously
	}
}

