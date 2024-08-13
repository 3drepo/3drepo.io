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

import { Vector2, Line } from './types';

import { closestPointOnLine } from './lineFunctions';

export class RTreeNode {
	xmin: number;

	xmax: number;

	ymin: number;

	ymax: number;

	line: Line;

	children: RTreeNode[];

	get x() {
		return this.xmin + (this.xmax - this.xmin) * 0.5;
	}

	get y() {
		return this.ymin + (this.ymax - this.ymin) * 0.5;
	}

	get width() {
		return this.xmax - this.xmin;
	}

	get height() {
		return this.ymax - this.ymin;
	}

	leafNode() {
		return this.children == null;
	}
}

class ClosestPointTraversalContext {
	position: Vector2;

	radius: number;

	closestPoint: Vector2;

	closestPointDistance: number;

	numNodesTraversed: number;

	numLineTests: number;

	constructor(position: Vector2, radius: number) {
		this.position = position;
		this.radius = radius;
		this.closestPoint = null;
		this.closestPointDistance = Number.MAX_VALUE;
		this.numNodesTraversed = 0;
		this.numLineTests = 0;
	}
}

export class IntersectionTestResults {
	closestEdge: Vector2;

	queryTime: number;

	constructor() {
		this.closestEdge = null;
		this.queryTime = 0;
	}
}

export class RTree {

	root: RTreeNode;

	closestPointQuery(p: Vector2, r: number) {
		const start = performance.now();

		const ctx = new ClosestPointTraversalContext(p, r);
		this.traverseNode(this.root, ctx);

		const results = new IntersectionTestResults();
		results.closestEdge = ctx.closestPoint;
		results.queryTime = (performance.now() - start);

		return results;
	}

	intersects(node: RTreeNode, ctx: ClosestPointTraversalContext) {
		// The intersection test can be done with a simple point in bounds test
		// with a Minkowski sum

		const xmin = node.xmin - ctx.radius;
		const xmax = node.xmax + ctx.radius;
		const ymin = node.ymin - ctx.radius;
		const ymax = node.ymax + ctx.radius;

		return (
			ctx.position.x >= xmin &&
            ctx.position.x <= xmax &&
            ctx.position.y >= ymin &&
            ctx.position.y <= ymax
		);
	}

	// Peform tests against each primitive
	traverseLeaf(node: RTreeNode, ctx: ClosestPointTraversalContext) {
		const p = closestPointOnLine(node.line.start.x, node.line.start.y, node.line.end.x, node.line.end.y, ctx.position.x, ctx.position.y);
		const d = Vector2.subtract(ctx.position, p).norm;
		if (d < ctx.closestPointDistance) {
			ctx.closestPointDistance = d;
			ctx.closestPoint = p;
		}
		ctx.numLineTests++;
	}

	traverseBranch(node: RTreeNode, ctx: ClosestPointTraversalContext) {
		for (const child of node.children) {
			if (this.intersects(child, ctx)) {
				this.traverseNode(child, ctx);
			}
		}
	}

	traverseNode(node: RTreeNode, ctx: ClosestPointTraversalContext) {
		if (node.leafNode()) {
			this.traverseLeaf(node, ctx);
		} else {
			this.traverseBranch(node, ctx);
		}
		ctx.numNodesTraversed++;
	}
}

export type RTreeOptions = {
	lines: Line[],
	n: number,
};

export class RTreeBuilderReport {

	numLevels: number;

	buildTime: number;

	constructor() {
		this.numLevels = 0;
		this.buildTime = 0;
	}
}


// Constructs an R-Tree using the STR (Sort Tile Recursive) method
// https://ia800900.us.archive.org/27/items/nasa_techdoc_19970016975/19970016975.pdf
export class RTreeBuilder {

	lines: Line[];

	n: number;

	report: RTreeBuilderReport;

	constructor(options: RTreeOptions) {
		this.lines = options.lines;
		this.n = options.n;
		this.report = new RTreeBuilderReport();
	}

	makeNodeFromLine(line: Line): RTreeNode {
		const node = new RTreeNode();
		node.xmin = Math.min(line.start.x, line.end.x);
		node.xmax = Math.max(line.start.x, line.end.x);
		node.ymin = Math.min(line.start.y, line.end.y);
		node.ymax = Math.max(line.start.y, line.end.y);
		node.line = line;
		node.children = null;
		return node;
	}

	makeNodeFromChildren(children: RTreeNode[]): RTreeNode {
		const node = new RTreeNode();

		let xmin = Number.MAX_VALUE;
		let xmax = Number.MIN_VALUE;
		let ymin = Number.MAX_VALUE;
		let ymax = Number.MIN_VALUE;

		for (const c of children) {
			xmin = Math.min(xmin, c.xmin);
			xmax = Math.max(xmax, c.xmax);
			ymin = Math.min(ymin, c.ymin);
			ymax = Math.max(ymax, c.ymax);
		}

		node.xmin = xmin;
		node.xmax = xmax;
		node.ymin = ymin;
		node.ymax = ymax;

		node.children = children;

		return node;
	}

	buildTree(nodes: RTreeNode[]): RTreeNode {
		let children = nodes;
		do {
			children = this.buildLevel(children);
			this.report.numLevels++;
		} while (children.length > 1);
		return children[0]; // root node
	}

	buildLevel(nodes: RTreeNode[]): RTreeNode[] {
		const n = this.n;
		const next: RTreeNode[] = [];

		// Sort by x
		nodes.sort((a, b) => a.x - b.x);

		// Calculate the number of slices in each direction
		const p = Math.ceil(nodes.length / n);
		const s = Math.ceil(Math.sqrt(p));
		const c = s * n;

		// group into c slices across x-axis
		for (let x = 0; x < nodes.length; x += c) {
			const slice = nodes.slice(x, x + c);

			// now sort by the y-axis
			slice.sort((a, b) => a.y - b.y);

			// split into rectangles along the y-axis of the vertical slice
			for (let y = 0; y < slice.length; y += n) {
				const leaves = slice.slice(y, y + n);

				// create the child nodes from the subsets of the array
				const node = this.makeNodeFromChildren(leaves);
				next.push(node);
			}
		}

		return next;
	}

	build(): RTree {
		const start = performance.now();

		// Turn all primitives into RTreeNodes

		const nodes = this.lines.map( (line) => {
			return this.makeNodeFromLine(line);
		});

		// Starting at the lowest level, construct each layer of the hierarchy

		const tree = new RTree();
		tree.root = this.buildTree(nodes);

		this.report.buildTime = (performance.now() - start);

		return tree;
	}
}