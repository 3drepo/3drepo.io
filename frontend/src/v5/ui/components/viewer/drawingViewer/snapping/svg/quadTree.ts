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

import { Vector2, Line, Size } from './types';

class QuadTreeNode {

	constructor(xmin, xmax, ymin, ymax) {
		this.xmin = xmin;
		this.xmax = xmax;
		this.ymin = ymin;
		this.ymax = ymax;
		this.lines = [];
		this.ne = null;
		this.nw = null;
		this.sw = null;
		this.se = null;
	}

	// Bounds in the 2D axes of the world space

	xmin: number;

	xmax: number;

	ymin: number;

	ymax: number;

	// Primitive children

	lines: Line[];

	// .. put curves here...

	// We also store for each node a set of individual points, that can be
	// endpoints or intersection points, for snapping to ends separately
	// to closest point tests.

	points: Vector2[];

	// Node children - a node can have primitives or node children, but not both.

	nw: QuadTreeNode;

	ne: QuadTreeNode;

	sw: QuadTreeNode;

	se: QuadTreeNode;

	leafNode() : boolean {
		return this.ne == null;
	}
}

export class IntersectionTestResults {
	closestEdge: Vector2;

	closestPoint: Vector2;

	constructor() {
		this.closestEdge = null;
		this.closestPoint = null;
	}
}

function clipLine(x0, y0, x1, y1, xmin, xmax, ymin, ymax, result: number[]) {
	// Implements the Liang–Barsky algorithm.
	// Uses for loop idea noted by Daniel White. https://www.skytopia.com/project/articles/compsci/clipping.html
	// JsFiddle: https://jsfiddle.net/sebjf/yscuz7rj/107/

	let t0 = 0;
	let t1 = 1;
	const dx = x1 - x0;
	const dy = y1 - y0;
	let p, q;

	for (let edge = 0; edge < 4; edge++) {
	  if (edge === 0) { p = -dx; q = -(xmin - x0); }
	  if (edge === 1) { p =  dx; q =  (xmax - x0); }
	  if (edge === 2) { p = -dy; q = -(ymin - y0); }
	  if (edge === 3) { p =  dy; q =  (ymax - y0); }

	  let r = q / p;

	  if (p === 0 && q < 0) {
		  return false;
	  }

	  if (p < 0) {
			if (r > t1) {
				return false;
			} else if (r > t0) {
				t0 = r;
			}
	  } else if (p > 0) {
			if (r < t0) {
				return false;
			} else if (r < t1) {
				t1 = r;
			}
	  }
	}

	if (result != null) {
		result[0] = x0 + t0 * dx;
		result[1] = y0 + t0 * dy;
		result[2] = x0 + t1 * dx;
		result[3] = y0 + t1 * dy;
	}

	return true;
}


function closestPointOnLine(x0, y0, x1, y1, x, y) {
	const dx = x - x0;
	const dy = y - y0;
	const a = x1 - x0;
	const b = y1 - y0;
	const n = Math.sqrt((a * a) + (b * b));
	const nx = a / n;
	const ny = b / n;
	let t = (dx * nx) + (dy * ny);

	if (t < 0) {
  	    t = 0;
	}
	if (t > n) {
  	    t = n;
	}

	return new Vector2(x0 + t * nx, y0 + t * ny);
}

class TraversalContext {
	position: Vector2;

	radius: number;

	closestPoint: Vector2;

	closestPointDistance: number;

	constructor(position: Vector2, radius: number) {
		this.position = position;
		this.radius = radius;
		this.closestPoint = null;
		this.closestPointDistance = radius * 2;
	}
}

export class QuadTree {

	root: QuadTreeNode;

	doIntersectionTest(p: Vector2, r: number): IntersectionTestResults {
		const ctx = new TraversalContext(p, r);
		this.traverseNode(this.root, ctx);
		const results = new IntersectionTestResults();
		results.closestEdge = ctx.closestPoint;
		return results;
	}

	intersects(node: QuadTreeNode, ctx: TraversalContext) {
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
	traverseLeaf(node: QuadTreeNode, ctx: TraversalContext) {

		for (const line of node.lines) {
			const p = closestPointOnLine(line.start.x, line.start.y, line.end.x, line.end.y, ctx.position.x, ctx.position.y);
			const d = Vector2.subtract(ctx.position, p).norm;
			if (d < ctx.closestPointDistance) {
				ctx.closestPointDistance = d;
				ctx.closestPoint = p;
			}
		}
	}

	traverseBranch(node: QuadTreeNode, ctx: TraversalContext) {
		if (this.intersects(node.ne, ctx)) {
			this.traverseNode(node.ne, ctx);
		}
		if (this.intersects(node.nw, ctx)) {
			this.traverseNode(node.nw, ctx);
		}
		if (this.intersects(node.se, ctx)) {
			this.traverseNode(node.se, ctx);
		}
		if (this.intersects(node.sw, ctx)) {
			this.traverseNode(node.sw, ctx);
		}
	}

	traverseNode(node: QuadTreeNode, ctx: TraversalContext) {
		if (node.leafNode()) {
			this.traverseLeaf(node, ctx);
		} else {
			this.traverseBranch(node, ctx);
		}
	}
}

export type QuadTreeOptions = {
	lines: Line[],
	maxDepth: number,
	bounds: Size,
};

export class QuadTreeReport {
	numLines: number;

	numNodes: number;

	depth: number;

	maxPrimitivesInLeaf: number;

	constructor() {
		this.depth = 0;
		this.numNodes = 0;
		this.numLines = 0;
		this.maxPrimitivesInLeaf = 0;
	}
}

export class QuadTreeBuilder {

	maxDepth: number;

	lines: Line[];

	report: QuadTreeReport;

	bounds: Size;

	constructor(options: QuadTreeOptions) {
		this.maxDepth = options.maxDepth;
		this.lines = options.lines;
		this.bounds = options.bounds;
		this.report = new QuadTreeReport();
	}

	build(): QuadTree {
		const tree = new QuadTree();
		tree.root = new QuadTreeNode(0, this.bounds.width, 0, this.bounds.height);
		tree.root.lines = this.lines;

		this.subdivide(tree.root, 0); // subdivide is recursive so once this returns the hierarchy is complete

		this.report.numLines = this.lines.length;

		return tree;
	}

	makeTreeReport;

	// QuadTree types are distinguished predominantly by their termination criteria.
	// Here, we terminate when we have less than 4 primitives per node, or the max
	// level has been reached.
	shouldSubdivide(node: QuadTreeNode): boolean {
		if (node.lines.length > 4) {
			return true;
		}

		return false;
	}

	static clipLineNode(line: Line, node: QuadTreeNode) {
		return clipLine(line.start.x, line.start.y, line.end.x, line.end.y, node.xmin, node.xmax, node.ymin, node.ymax, null);
	}

	subdivide(node: QuadTreeNode, level: number) {

		// Determine the hyperlines for this split

		const x = node.xmin + (node.xmax - node.xmin) * 0.5;
		const y = node.ymin + (node.ymax - node.ymin) * 0.5;

		// Create four child nodes by subdividing node

		const nw = new QuadTreeNode(node.xmin, x, y, node.ymax);
		const ne = new QuadTreeNode(x, node.xmax, y, node.ymax);
		const sw = new QuadTreeNode(node.xmin, x, node.ymin, y);
		const se = new QuadTreeNode(x, node.xmax, node.ymin, y);

		const children = [nw, ne, sw, se];

		// Distribute the primitives of node between the child nodes

		// In this section we test each type of primitive against each node, and
		// add the intersecting children to the new subdivisions.

		for (const line of node.lines) {

			for (const c of children) {
				if (QuadTreeBuilder.clipLineNode(line, c)) {
					c.lines.push(line);
				}
			}
		}

		// clear the primitives of the parent node and set the child nodes

		node.lines = [];
		node.nw = nw;
		node.ne = ne;
		node.sw = sw;
		node.se = se;

		// recursiely subdivide the child nodes until the termination criteria
		// is reached

		for (const c of children) {
			if (this.shouldSubdivide(c) && level < this.maxDepth) {
				this.subdivide(c, level + 1);
			} else {
				// The node is finished
				this.report.maxPrimitivesInLeaf = Math.max(this.report.maxPrimitivesInLeaf, c.lines.length);
			}
		}

		this.report.depth = Math.max(this.report.depth, level);
		this.report.numNodes += 4;
	}
}