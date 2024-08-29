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

export class Bounds {
	xmin: number;

	xmax: number;

	ymin: number;

	ymax: number;
}

export class Vector2 {

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

	static add(a: Vector2, b: Vector2) {
		return new Vector2(a.x + b.x, a.y + b.y);
	}

	static subtract(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x - b.x, a.y - b.y);
	}

	static norm(a: Vector2, b: Vector2): number {
		const d = Vector2.subtract(a, b);
		return d.norm;
	}

	static cross(a: Vector2, b: Vector2): number {
		return a.x * b.y - a.y * b.x;
	}

	static dot(a: Vector2, b: Vector2): number {
		return a.x * b.x + a.y * b.y;
	}

	static equals(a: Vector2, b: Vector2): boolean {
		return (a.x == b.x) && (a.y == b.y);
	}

	static scale(a: Vector2, b: number): Vector2 {
		return new Vector2(a.x * b, a.y * b);
	}

	toString() {
		return this.x + ', ' + this.y;
	}
}

export interface IBounds {
	getBounds(n: Bounds);
}

export interface IClosestPoint {
	closestPoint(p: Vector2): Vector2;
}

/** A Line in implicit form (ax + by = d), where A is [a,b] and X is [x,y] */
export class ImplicitLine {
	A: Vector2;

	d: number;

	constructor(A: Vector2, d: number) {
		this.A = A;
		this.d = d;
	}
}

export class Line implements IBounds {

	start: Vector2;

	end: Vector2;

	constructor(start: Vector2, end: Vector2) {
		this.start = start;
		this.end = end;
	}

	get length() {
		return Vector2.norm(this.start, this.end);
	}

	getBounds(n: Bounds) {
		n.xmin = Math.min(this.start.x, this.end.x);
		n.xmax = Math.max(this.start.x, this.end.x);
		n.ymin = Math.min(this.start.y, this.end.y);
		n.ymax = Math.max(this.start.y, this.end.y);
	}

	getImplicit(): ImplicitLine {
		return new ImplicitLine(
			new Vector2(this.start.y - this.end.y, this.end.x - this.start.x),
			this.start.x * this.end.y - this.end.x * this.start.y,
		);
	}
}

export class Point {
	x: number;

	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

export class Size {

	width: number;

	height: number;

	constructor(width, height) {
		this.width = width;
		this.height = height;
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

export class CubicBezier implements IBounds {

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

	constructor(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2) {
		this.p0 = p0;
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
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
			const a5 = -Vector2.dot(this.j, this.n);
			const a4 = -(Vector2.dot(this.j, this.r) + Vector2.dot(this.k, this.n));
			const a3 = -(Vector2.dot(this.j, this.s) + Vector2.dot(this.k, this.r) + Vector2.dot(this.m, this.n));
			const a2 = -(Vector2.dot(this.j, this.v) + Vector2.dot(this.k, this.s) + Vector2.dot(this.m, this.r));
			const a1 = -(Vector2.dot(this.k, this.v) + Vector2.dot(this.m, this.s));
			const a0 = -Vector2.dot(this.m, this.v);
			this.qq = new QuinticPolynomial(a5, a4, a3, a2, a1, a0);
		}
	}

	evaluate(t: number) {

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
		return Vector2.norm(p, this.evaluate(t));
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