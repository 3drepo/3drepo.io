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

export class SVGSnapDiagnosticsHelper {

	container: Element;

	canvas: HTMLCanvasElement;

	context: CanvasRenderingContext2D;

	start: number;

	collector: PrimitiveCollector;

	constructor(parent: Element) {
		this.container = document.createElement('div');
		parent.appendChild(this.container);
		this.container.setAttribute('style', 'position: absolute; left: 0; top: 0; display: block; z-index: 1; width: 600px; height: 600px;');
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.container.appendChild(this.canvas);
		this.canvas.setAttribute('style', 'transform-origin: top left; transform: translateX(100px) translateY(100px) scale(0.6); ');
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
}

class Vector2 {

	x: number;

	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	get norm() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	}

	get inverse() {
		return new Vector2(-this.x, -this.y);
	}

	add(b: Vector2) {
		this.x += b.x;
		this.y += b.y;
	}

	static subtract(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(b.x - a.x, b.y - a.y);
	}

	static norm(a: Vector2, b: Vector2): number {
		const d = Vector2.subtract(a, b);
		return d.norm;
	}
}

class Line {

	start: Vector2;

	end: Vector2;

	constructor(start: Vector2, end: Vector2) {
		this.start = start;
		this.end = end;
	}

	get length() {
		return Vector2.norm(this.start, this.end);
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

/**
 * Allows snapping to an SVG based on path primitives
 */
export class SVGSnap {

	container: HTMLElement;

	svg: SVGSVGElement;

	debugHelper: SVGSnapDiagnosticsHelper;

	constructor() {
		this.container = document.createElement('div');
		console.log('creating snap handler');
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

		// debug draw all the lines

		console.log(collector.lines.length);

		this.debugHelper.renderPrimitives(collector);

	}

	snap(coord: { x: number, y: number }, image: ZoomableImage) {
		const p = image.getImagePosition(coord);
		this.debugHelper.renderPoint(new Vector2(p.x, p.y));
	}
}

