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

import { Vector2, Vector2Like } from 'three';

export class Bounds {
	xmin: number;

	xmax: number;

	ymin: number;

	ymax: number;
}

/**
 * A Line in implicit, or linear equation, form (ax + by = d), where A is [a,b]
 * and X (any point on the line) is [x,y]
 */
export class ImplicitLine2 {
	A: Vector2;

	d: number;

	constructor(A: Vector2, d: number) {
		this.A = A;
		this.d = d;
	}
}

/**
 * This is the equivalent of a threejs Line3, but in 2D.
 */
export class Line2 {

	start: Vector2;

	end: Vector2;

	constructor(start: Vector2Like, end: Vector2Like) {
		this.start = new Vector2(start.x, start.y);
		this.end = new Vector2(end.x, end.y);
	}

	distance() : number {
		return this.start.distanceTo(this.end);
	}

	getBounds(n: Bounds) {
		n.xmin = Math.min(this.start.x, this.end.x);
		n.xmax = Math.max(this.start.x, this.end.x);
		n.ymin = Math.min(this.start.y, this.end.y);
		n.ymax = Math.max(this.start.y, this.end.y);
	}

	getImplicit(): ImplicitLine2 {
		return new ImplicitLine2(
			new Vector2(this.start.y - this.end.y, this.end.x - this.start.x),
			this.start.x * this.end.y - this.end.x * this.start.y,
		);
	}
}

export class QuinticPolynomial {

	a0: number;

	a1: number;

	a2: number;

	a3: number;

	a4: number;

	a5: number;

	constructor(a5, a4, a3, a2, a1, a0) {
		this.a0 = a0;
		this.a1 = a1;
		this.a2 = a2;
		this.a3 = a3;
		this.a4 = a4;
		this.a5 = a5;
	}

	evaluate(t: number) {
		const t2 = t * t;
		const t3 = t2 * t;
		const t4 = t3 * t;
		const t5 = t4 * t;
		return this.a5 * t5 + this.a4 * t4 + this.a3 * t3 + this.a2 * t2 + this.a1 * t + this.a0;
	}

	toString() {
		return this.a5 + ' ' + this.a4 + ' ' + this.a3 + ' ' + this.a2 + ' ' + this.a1 + ' ' + this.a0;
	}
}

export class CubicBezier {

	p0: Vector2;

	p1: Vector2;

	p2: Vector2;

	p3: Vector2;

	// n, r, s & v are the curve in parametric form. These are computed on
	// demand and cached.

	n: Vector2;

	r: Vector2;

	s: Vector2;

	v: Vector2;

	// j, k & m are the derivative of the curve in parameteric form. These are
	// computed on demand and cached.

	j: Vector2;

	k: Vector2;

	m: Vector2;

	// qq is polynomial representing q.q'. This is computed on demand and
	// cached.

	qq: QuinticPolynomial;

	// A self-intersection point, or undefined if there is none. This will not
	// be initialised automatically. Use curveSelfIntersection to set this to
	// the point of self intersection, or false, if there is none.

	selfIntersection: Vector2 | undefined | false;

	constructor(p0: Vector2Like, p1: Vector2Like, p2: Vector2Like, p3: Vector2Like) {
		this.p0 = new Vector2(p0.x, p0.y);
		this.p1 = new Vector2(p1.x, p1.y);
		this.p2 = new Vector2(p2.x, p2.y);
		this.p3 = new Vector2(p3.x, p3.y);
	}

	/**
	 * Compute the polynomials of the parametric form of the Bezier curve. These
	 * are used for distancea tests and evaluating the curve.
	 */
	computeNrsv() {
		if (!this.n) {
			this.n = new Vector2(
				-this.p0.x + 3 * this.p1.x - 3 * this.p2.x + this.p3.x,
				-this.p0.y + 3 * this.p1.y - 3 * this.p2.y + this.p3.y,
			);

			this.r = new Vector2(
				3 * this.p0.x - 6 * this.p1.x + 3 * this.p2.x,
				3 * this.p0.y - 6 * this.p1.y + 3 * this.p2.y,
			);

			this.s = new Vector2(
				-3 * this.p0.x + 3 * this.p1.x,
				-3 * this.p0.y + 3 * this.p1.y,
			);

			this.v = new Vector2(
				this.p0.x,
				this.p0.y,
			);
		}
	}

	/**
	 * Compute the derivative of the curve in parametric form. These are
	 * used for distance and intersection tests.
	 */
	computeJkm() {
		if (!this.j) {
			this.computeNrsv();

			this.j = new Vector2(
				3 * (-this.p0.x + 3 * this.p1.x - 3 * this.p2.x + this.p3.x),
				3 * (-this.p0.y + 3 * this.p1.y - 3 * this.p2.y + this.p3.y),
			);

			this.k = new Vector2(
				2 * (3 * this.p0.x - 6 * this.p1.x + 3 * this.p2.x),
				2 * (3 * this.p0.y - 6 * this.p1.y + 3 * this.p2.y),
			);

			this.m = new Vector2(
				this.s.x,
				this.s.y,
			);
		}
	}

	/**
	 * Compute the dot product of the curve and its own derivative. This is half
	 * of the problem definition for closest point tests.
	 */
	computeQq() {
		if (!this.qq) {
			this.computeJkm();
			const a5 = -(this.j.dot(this.n));
			const a4 = -(this.j.dot(this.r) + this.k.dot(this.n));
			const a3 = -(this.j.dot(this.s) + this.k.dot(this.r) + this.m.dot(this.n));
			const a2 = -(this.j.dot(this.v) + this.k.dot(this.s) + this.m.dot(this.r));
			const a1 = -(this.k.dot(this.v) + this.m.dot(this.s));
			const a0 = -(this.m.dot(this.v));
			this.qq = new QuinticPolynomial(a5, a4, a3, a2, a1, a0);
		}
	}

	evaluate(t: number): Vector2 {

		// nrsv are the components of the curve in parametric form (as a cubic
		// polynomial), so to get the position on the curve, we evaluate these
		// as coefficients of a polynomial (with t as the parameter).

		this.computeNrsv();
		return new Vector2(
			this.n.x * t * t * t + this.r.x * t * t + this.s.x * t + this.v.x,
			this.n.y * t * t * t + this.r.y * t * t + this.s.y * t + this.v.y,
		);
	}

	distance(p: Vector2, t: number) {
		return p.distanceTo(this.evaluate(t));
	}

	getBounds(n: Bounds) {

		// A Cubic Bezier is always bounded by the convex hull of its control
		// points, though there are tighter fitting bounds available based on
		// extremities of the curve, which can be used as second stage tests.

		n.xmin = Math.min(this.p0.x, this.p1.x, this.p2.x, this.p3.x);
		n.xmax = Math.max(this.p0.x, this.p1.x, this.p2.x, this.p3.x);
		n.ymin = Math.min(this.p0.y, this.p1.y, this.p2.y, this.p3.y);
		n.ymax = Math.max(this.p0.y, this.p1.y, this.p2.y, this.p3.y);
	}
}

export enum SnapType {
	NONE,
	NODE,
	INTERSECTION,
	EDGE,
}