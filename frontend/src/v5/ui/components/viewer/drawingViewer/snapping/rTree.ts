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

import { Vector2 } from 'three';
import { Line2, CubicBezier, Bounds } from './types';
import { closestPointOnLine, lineLineIntersection } from './lineFunctions';
import { closestPointOnCurve, curveCurveIntersection, updateCurveSelfIntersection, lineCurveIntersection } from './bezierFunctions';

class RTreeNode extends Bounds {
	line: Line2 | undefined;

	curve: CubicBezier | undefined;

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

	static intersects(a: RTreeNode, b: RTreeNode): boolean {
		return (a.xmin <= b.xmax && a.xmax >= b.xmin) && (a.ymin <= b.ymax && a.ymax >= b.ymin);
	}
}

class TraversalContext {
	position: Vector2;

	radius: number;

	closestEdge: Vector2 | null;

	closestEdgeDistance: number;

	closestNode: Vector2 | null;

	closestNodeDistance2: number;

	closestIntersection: Vector2 | null;

	closestIntersectionDistance2: number;

	nodes: RTreeNode[];

	numNodesTraversed: number;

	numLineTests: number;

	numCurveTests: number;

	numIntersectingPairs: number;

	numIntersectionTests: number;

	edgeQueryTime: number;

	nodeQueryTime: number;

	intersectionQueryTime: number;

	constructor(position: Vector2, radius: number) {
		this.position = position;
		this.radius = radius;
		this.closestEdge = null;
		this.closestEdgeDistance = radius;
		this.closestNode = null;
		this.closestNodeDistance2 = radius * radius;
		this.closestIntersection = null;
		this.closestIntersectionDistance2 = radius * radius;
		this.numNodesTraversed = 0;
		this.numLineTests = 0;
		this.nodes = [];
		this.numIntersectingPairs = 0;
		this.numIntersectionTests = 0;
		this.nodeQueryTime = 0;
		this.edgeQueryTime = 0;
		this.intersectionQueryTime = 0;
	}

	updateClosestIntersection(p: Vector2) {
		const d2 = this.position.distanceToSquared(p);
		if (d2 < this.closestIntersectionDistance2) {
			this.closestIntersectionDistance2 = d2;
			this.closestIntersection = p;
		}
	}

	updateClosestEdge(p: Vector2) {
		const d = this.position.distanceTo(p); // (Note edges are compared by distance, not distance squared)
		if ( d < this.closestEdgeDistance) {
			this.closestEdgeDistance = d;
			this.closestEdge = p;
		}
	}

	updateClosestNode(p: Vector2) {
		const d2 = this.position.distanceToSquared(p);
		if (d2 < this.closestNodeDistance2) {
			this.closestNodeDistance2 = d2;
			this.closestNode = p;
		}
	}
}

class RTreeQueries {
	// Given a context with a set of overlapping nodes, find the closest edge
	// on any primitive
	static findClosestEdge(ctx: TraversalContext) {
		for (const node of ctx.nodes) {
			if (node.line) {
				const p = closestPointOnLine(node.line, ctx.position);
				ctx.updateClosestEdge(p);
				ctx.numLineTests++;
			}

			// Curve-Point tests are more expensive than line tests. Only run
			// these if there are fewer than a hundred or so to consider. If
			// there are more than this in range, the results will probably not
			// be intelligible anyway.
			if (ctx.nodes.length < 100) {
				if (node.curve) {
					const p = closestPointOnCurve(node.curve, ctx.position);
					ctx.updateClosestEdge(p);
					ctx.numCurveTests++;
				}
			}
		}
	}

	static findClosestNode(ctx: TraversalContext) {
		for (const node of ctx.nodes) {
			if (node.line) {
				ctx.updateClosestNode(node.line.start);
				ctx.updateClosestNode(node.line.end);
			}
			if (node.curve) {
				ctx.updateClosestNode(node.curve.p0);
				ctx.updateClosestNode(node.curve.p3);
			}
		}
	}

	static findIntersections(ctx: TraversalContext) {

		// If there are over 1000 overlapping nodes, there will be no intelligible
		// set of points, so just return.
		if (ctx.nodes.length > 500) {
			return;
		}

		const start = performance.now();

		const intersections: Vector2[] = [];

		const nodes = ctx.nodes;
		for (let i = 0; i < nodes.length; i++) {

			const a = nodes[i];

			for (let j = i + 1; j < nodes.length; j++) {
				const b = nodes[j];
				if (RTreeNode.intersects(a, b)) {
					this.nodeNodeIntersections(a, b, intersections);
					while (intersections.length > 0) {
						ctx.updateClosestIntersection(intersections.pop());
						ctx.numIntersectionTests++;
					}
					ctx.numIntersectingPairs++;
				}
			}

			// Check for self-intersections for primitives that can have them
			if (a.curve) {
				if (a.curve.selfIntersection === undefined) {
					updateCurveSelfIntersection(a.curve);
				}
				if (a.curve.selfIntersection) {
					ctx.updateClosestIntersection(a.curve.selfIntersection);
				}
			}
		}

		ctx.intersectionQueryTime = performance.now() - start;
	}

	static nodeNodeIntersections(a: RTreeNode, b: RTreeNode, results: Vector2[]) {
		if (a.line && b.line) {
			const p = lineLineIntersection(a.line, b.line);
			if (p) {
				results.push(p);
			}
		} else if (a.line && b.curve) {
			lineCurveIntersection(b.curve, a.line, results);
		} else if (a.curve && b.line) {
			lineCurveIntersection(a.curve, b.line, results);
		} else if (a.curve && b.curve) {
			curveCurveIntersection(a.curve, b.curve, results);
		}
	}
}

/**
 * Contains the results of an intersection test with a set of geometry. Three
 * types of point are returned separately allowing for prioritisation.
 */
export class IntersectionTestResults {

	// The nearest point to the cursor that sits on an edge-like element of any
	// primitive
	closestEdge: Vector2;

	// The nearest point to the cursor that is coincident with a point-like
	// element of any primitive, such as a control point or start or end point.
	closestNode: Vector2;

	// The nearest point to the cursor that is coincident with an intersection
	// between two edge-like elements, either between two primitives or the
	// same primitive if the edge self-intersects.
	closestIntersection: Vector2;

	// The total time in milliseconds taken to complete the search
	queryTime: number;

	// The number of nodes of the tree overlapping the search radius.
	numNodes: number;

	constructor() {
		this.closestEdge = null;
		this.closestNode = null;
		this.closestIntersection = null;
		this.queryTime = 0;
	}
}

export class RTree {

	root: RTreeNode;

	/**
	 * Queries the RTree for three types of intersection given a position and
	 * search radius. This is the entry point for searching the tree and the
	 * only method necessary for looking for intersections.
	 */
	query(p: Vector2, r: number): IntersectionTestResults {
		const start = performance.now();

		// The query works by first traversing the RTree to find all nodes that
		// overlap the search radius. These are stored in the context object.
		// Afterwards, concrete intersection tests are run between the primitives
		// contained in the overlapping nodes.

		const ctx = new TraversalContext(p, r);
		this.traverseNode(this.root, ctx);

		RTreeQueries.findClosestEdge(ctx);
		RTreeQueries.findClosestNode(ctx);
		RTreeQueries.findIntersections(ctx);

		const results = new IntersectionTestResults();
		results.closestEdge = ctx.closestEdge;
		results.closestNode = ctx.closestNode;
		results.closestIntersection = ctx.closestIntersection;
		results.queryTime = (performance.now() - start);
		results.numNodes = ctx.nodes.length;

		return results;
	}

	private intersects(node: RTreeNode, ctx: TraversalContext) {
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

	private traverseLeaf(node: RTreeNode, ctx: TraversalContext) {
		ctx.nodes.push(node); // Add to the list of overlapping nodes for the geometry tests
	}

	private traverseBranch(node: RTreeNode, ctx: TraversalContext) {
		for (const child of node.children) {
			if (this.intersects(child, ctx)) {
				this.traverseNode(child, ctx);
			}
		}
	}

	private traverseNode(node: RTreeNode, ctx: TraversalContext) {
		if (node.leafNode()) {
			this.traverseLeaf(node, ctx);
		} else {
			this.traverseBranch(node, ctx);
		}
		ctx.numNodesTraversed++;
	}
}

export type RTreeOptions = {
	lines: Line2[],
	curves: CubicBezier[],
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

/*
 * Constructs an R-Tree using the STR (Sort Tile Recursive) method.
 *
 * All primitives should be provided via the RTreeOptions argument. Call build()
 * to construct the three. After construction the builder object will have a
 * report available.
 *
 * The STR method is based on subdividing one axis at a time, an approach not
 * dissimilar to a kd-tree, except each axis is divided into multiple bins in
 * each iteration. Trees are constructed with effective spatialisation in 2D,
 * without needing an explicit representation of 2D shapes or location.
 *
 * https://ieeexplore.ieee.org/document/582015
 * https://ia800900.us.archive.org/27/items/nasa_techdoc_19970016975/19970016975.pdf
 */
export class RTreeBuilder {

	lines: Line2[];

	curves: CubicBezier[];

	n: number;

	report: RTreeBuilderReport;

	constructor(options: RTreeOptions) {
		this.lines = options.lines;
		this.curves = options.curves;
		this.n = options.n;
		this.report = new RTreeBuilderReport();
	}

	private makeNodeFromLine(line: Line2): RTreeNode {
		const node = new RTreeNode();
		line.getBounds(node);
		node.line = line;
		node.curve = null;
		node.children = null;
		return node;
	}

	private makeNodeFromCurve(curve: CubicBezier): RTreeNode {
		const node = new RTreeNode();
		curve.getBounds(node);
		node.curve = curve;
		node.line = null;
		node.children = null;
		return node;
	}

	private makeNodeFromChildren(children: RTreeNode[]): RTreeNode {
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

	private buildTree(nodes: RTreeNode[]): RTreeNode {
		let children = nodes;
		do {
			children = this.buildLevel(children);
			this.report.numLevels++;
		} while (children.length > 1);
		return children[0]; // root node
	}

	private buildLevel(nodes: RTreeNode[]): RTreeNode[] {
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

		nodes.push(...this.curves.map( (curve) => {
			return this.makeNodeFromCurve(curve);
		}));

		// Starting at the lowest level, construct each layer of the hierarchy

		const tree = new RTree();
		tree.root = this.buildTree(nodes);

		this.report.buildTime = (performance.now() - start);

		return tree;
	}
}