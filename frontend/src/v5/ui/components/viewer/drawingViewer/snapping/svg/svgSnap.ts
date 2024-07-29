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
import { ZoomableImage } from '../../drawingViewerImage/drawingViewerImage.component';
import { Vector2, Line, Size } from './types';
import { QuadTree, QuadTreeBuilder } from './quadTree';
import { RTree, RTreeBuilder } from './rTree';

export class SVGSnapDiagnosticsHelper {

	container: Element;

	canvas: HTMLCanvasElement;

	context: CanvasRenderingContext2D;

	start: number;

	collector: PrimitiveCollector;

	constructor(parent: Element) {
		this.container = document.createElement('div');
		parent.appendChild(this.container);
		this.container.setAttribute('style', 'position: absolute; left: 100px; top: 100px; display: block; z-index: 1; width: 600px; height: 600px; overflow: hidden');
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.container.appendChild(this.canvas);
		this.canvas.setAttribute('style', 'transform-origin: top left; transform: translateX(0px) translateY(0px) scale(0.6); ');
	}

	setSvg(svg: SVGSVGElement) {
		this.canvas.width = svg.viewBox.baseVal.width;
		this.canvas.height = svg.viewBox.baseVal.height;
		svg.viewBox.baseVal.x = 0;
		svg.viewBox.baseVal.y = 0;
		this.context.fillStyle = 'red';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	renderPrimitives(collector: PrimitiveCollector) {
		this.collector = collector;
		this.start = 0;
		requestAnimationFrame(this.renderBatch.bind(this));
	}

	renderBatch() {
		const batchSize = 1000;
		const num = Math.min(this.collector.lines.length - this.start, batchSize);
		for (const line of this.collector.lines.slice(this.start, this.start + num)) {
			this.context.beginPath();
			this.context.moveTo(line.start.x, line.start.y);
			this.context.lineTo(line.end.x, line.end.y);
			this.context.stroke();
		}
		this.start += num;
		if (this.start < this.collector.lines.length) {
			requestAnimationFrame(this.renderBatch.bind(this));
		}
	}

	renderPoint(p: Vector2) {
		this.context.fillStyle = 'white';
		this.context.beginPath();
		this.context.arc(p.x, p.y, 1, 0, 2 * Math.PI);
		this.context.fill();
	}

	renderRadius(p: Vector2, r: number) {
		this.context.strokeStyle = 'white';
		this.context.beginPath();
		this.context.arc(p.x, p.y, r, 0, 2 * Math.PI);
		this.context.stroke();
	}

	renderLine(start: Vector2, end: Vector2) {
		this.context.beginPath();
		this.context.moveTo(start.x, start.y);
		this.context.lineTo(end.x, end.y);
		this.context.stroke();
	}

	renderRTree(tree: RTree) {
		this.renderRTreeNode(tree.root);
	}

	renderRTreeNode(node: RTreeNode) {
		this.context.strokeRect(node.xmin, node.ymin, node.width, node.height);
		if ( node.children != null ) {
			for (const child of node.children) {
				this.renderRTreeNode(child);
			}
		}
	}
}

class PrimitiveCollector {

	lines: Line[];

	offset: Vector2;

	constructor(offset: Vector2) {
		this.lines = [];
		this.offset = offset;
	}

	addLine(line: Line) {
		this.lines.push(line);
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
		const line = new Line(this.currentPosition, position);
		this.currentPosition = position;
		if (line.length != 0) {
			this.collector.addLine(line);
		}
	}

	// Closes the subpath by drawing a straight line from the current position
	// to the start of the subpath.
	closePath() {
		const line = new Line(this.currentPosition, this.startPosition);
		this.collector.addLine(line);

		// If the next command is not MOVETO, then the subpath should revert back
		// to the last initial point. (If the next command is a MOVETO, then this
		// will be overridden imminently.)

		this.currentPosition = new Vector2(this.startPosition.x, this.startPosition.y);
	}
}

class PolyCollector {
	collector: PrimitiveCollector;

	constructor(collector: PrimitiveCollector) {
		this.collector = collector;
	}

	addLine(start: DOMPoint, end: DOMPoint) {
		this.collector.addLine(
			new Line(
				new Vector2(start.x, start.y),
				new Vector2(end.x, end.y),
			),
		);
	}
}

/**
 * Allows snapping to an SVG based on path primitives
 */
export class SVGSnap {

	container: HTMLElement;

	svg: SVGSVGElement;

	quadtree: QuadTree;

	rtree: RTree;

	debugHelper: SVGSnapDiagnosticsHelper;

	snapRadius: number; // In content rect pixels

	constructor() {
		this.container = document.createElement('div');
		this.snapRadius = 10;
	}

	async load(src: string) {
		const res = await fetch(src);
		const text = await res.text();
		this.container.innerHTML = text;
		this.initialise();
	}

	showDebugCanvas(parentElement: Element) {
		this.debugHelper = new SVGSnapDiagnosticsHelper(parentElement);
	}

	initialise() {
		this.svg = this.container.querySelector('svg') as SVGSVGElement;

		const viewBoxOffset = new Vector2(this.svg.viewBox.baseVal.x, this.svg.viewBox.baseVal.y);
		const viewBoxSize = new Size(this.svg.viewBox.baseVal.width, this.svg.viewBox.baseVal.height);

		if (viewBoxOffset.norm != 0) {
			console.error('SVG has a non-zero viewBox offset. SVGSnap will attempt to counteract the offset to match createImageBitamp, but this is not supported and the behaviour is not guaranteed.');
		}

		this.debugHelper.setSvg(this.svg);

		const collector = new PrimitiveCollector(viewBoxOffset.inverse);

		// Extract all the Path elements. The responses here should include
		// all basic shapes, which derive from Path.

		const paths = this.svg.querySelectorAll<SVGPathElement>('path:not([stroke=\'none\'])');
		for (let i = 0; i < paths.length; i++) {
			const p = paths[i];
			const segments = p.getPathData({ normalize: true });

			const pathCollector = new PathCollector(collector);

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
						// todo: add curve support
						break;
					case 'Z':
						pathCollector.closePath();
						break;
				}
			}
		}

		const polylines = this.svg.querySelectorAll<SVGPolylineElement>('polyline');
		for (let i = 0; i < polylines.length; i++) {
			const p = polylines[i];
			const points = p.points;
			const polyCollector = new PolyCollector(collector);
			for (let j = 0; j < points.length - 1; j++) {
				polyCollector.addLine(points[j], points[j + 1]);
			}
		}

		// debug draw all the lines

		this.debugHelper.renderPrimitives(collector);

		const start = performance.now();

		// create quadtree
		/*
		const builder = new QuadTreeBuilder({
			lines: collector.lines,
			maxDepth: 12,
			bounds: viewBoxSize,
		});
		this.quadtree = builder.build();
		*/

		const builder = new RTreeBuilder({
			lines: collector.lines,
			n: 10,
		});
		this.rtree = builder.build();

		this.debugHelper.renderRTree(this.rtree);

		console.log('Build acceleration structure in: ' + (performance.now() - start));

		console.log(builder.report);
	}

	snap(coord: { x: number, y: number }, image: ZoomableImage) {
		let p = image.getImagePosition(coord);
		p = new Vector2(p.x, p.y);

		// Get the radius in SVG units by getting another point in image space,
		// offset by the pixel radius, and taking the distance beteen them

		let p1 = image.getImagePosition({
			x: coord.x + this.snapRadius,
			y: coord.y + this.snapRadius,
		});
		p1 = new Vector2(p1.x, p1.y);

		const r = Vector2.subtract(p, p1).norm;

		this.debugHelper.renderRadius(p, r);

		const result = this.rtree.doIntersectionTest(new Vector2(p.x, p.y), r);

		if (result.closestEdge != null) {
			this.debugHelper.renderLine(p, result.closestEdge);
		}

		return result.closestEdge;
	}
}

