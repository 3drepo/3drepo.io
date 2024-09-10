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

import { Line2, CubicBezier } from './types';
import { RTree, RTreeNode } from './rTree';
import { Vector2Like } from 'three';


export class SVGSnapDiagnosticsHelper {

	container: Element;

	canvas: HTMLCanvasElement;

	context: CanvasRenderingContext2D;

	start: number;

	lines: Line2[];

	pp: { x: number, y: number, xs: number, ys: number, plotting: boolean } ;

	constructor(parent: Element) {
		this.container = document.createElement('div');
		parent.appendChild(this.container);
		this.container.setAttribute('style', 'position: absolute; left: 100px; top: 100px; display: block; z-index: 1; width: 600px; height: 600px; overflow: hidden');
		this.canvas = document.createElement('canvas');
		this.canvas.width = 500;
		this.canvas.height = 800;
		this.context = this.canvas.getContext('2d');
		this.container.appendChild(this.canvas);
		this.canvas.setAttribute('style', 'transform-origin: top left; transform: translateX(0px) translateY(0px) ');
	}

	setSvg(svg: SVGSVGElement) {
		this.canvas.width = svg.viewBox.baseVal.width;
		this.canvas.height = svg.viewBox.baseVal.height;
		svg.viewBox.baseVal.x = 0;
		svg.viewBox.baseVal.y = 0;
		this.context.fillStyle = 'red';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	renderLines(lines: Line2[]) {
		this.lines = lines;
		this.start = 0;
		requestAnimationFrame(this.renderBatch.bind(this));
	}

	renderBatch() {
		const batchSize = 1000;
		const num = Math.min(this.lines.length - this.start, batchSize);
		for (const line of this.lines.slice(this.start, this.start + num)) {
			this.context.beginPath();
			this.context.moveTo(line.start.x, line.start.y);
			this.context.lineTo(line.end.x, line.end.y);
			this.context.stroke();
		}
		this.start += num;
		if (this.start < this.lines.length) {
			requestAnimationFrame(this.renderBatch.bind(this));
		}
	}

	renderPoint(p: Vector2Like) {
		this.context.fillStyle = 'white';
		this.context.beginPath();
		this.context.arc(p.x, p.y, 1, 0, 2 * Math.PI);
		this.context.fill();
	}

	renderRadius(p: Vector2Like, r: number) {
		this.context.strokeStyle = 'white';
		this.context.beginPath();
		this.context.arc(p.x, p.y, r, 0, 2 * Math.PI);
		this.context.stroke();
	}

	renderLine(start: Vector2Like, end: Vector2Like) {
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

	renderCurves(curves: CubicBezier[]) {
		for (const c of curves) {
			this.renderCurve(c, 20);
		}
	}

	renderCurve(curve: CubicBezier, s: number) {
		this.context.beginPath();
		this.context.moveTo(curve.p0.x, curve.p0.y);

		for (let t = 0; t <= 1; t += (1 / s)) {
    	const p = curve.evaluate(t);
    		this.context.lineTo(p.x, p.y);
		}

		this.context.strokeStyle = 'black';
		this.context.stroke();
	}

	renderControlPoints(curve: CubicBezier) {
		this.context.beginPath();
		this.context.moveTo(curve.p0.x, curve.p0.y);
		this.context.lineTo(curve.p1.x, curve.p1.y);
		this.context.lineTo(curve.p2.x, curve.p2.y);
		this.context.lineTo(curve.p3.x, curve.p3.y);
		this.context.strokeStyle = 'blue';
		this.context.stroke();
	}

	beginPlot(x, y, xs, ys) {
		this.pp = {
			x,
			y,
			xs,
			ys,
			plotting: false,
		};
	}

	plot(x, y) {
		const x1 = this.pp.x + x * this.pp.xs;
		const y1 = this.pp.y - y * this.pp.ys;

		if (!this.pp.plotting) {
			this.pp.plotting = true;
			this.context.moveTo(x1, y1);
		}
		this.context.lineTo(x1, y1);
	}

	endPlot() {
		this.context.strokeStyle = 'black';
		this.context.stroke();
		this.pp.plotting = false;
	}

	renderText(s, x, y) {
		this.context.font = '20px serif';
		this.context.fillStyle = 'black';
		this.context.fillText(s, x, y);
	}

	clear() {
		this.context.fillStyle = '#FFFFFFFF';
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
}