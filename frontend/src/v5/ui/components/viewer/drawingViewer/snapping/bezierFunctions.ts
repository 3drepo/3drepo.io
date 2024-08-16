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

import { Vector2 } from './types';
import { SVGSnapDiagnosticsHelper } from './debug';

class CubicPolynomial {
	n: number;

	r: number;

	s: number;

	v: number;

	evaluate(t: number): number {
  	return this.n * t * t * t + this.r * t * t + this.s * t + this.v;
	}
}

class RootFinder {

	Q: QuinticPolynomial;

	qk: number; // Current values of k & c for the polynomial

	qc: number;

	roots: any[];

	n: number; // Degree of polynomial

	M: number[][];

	findRoots(q: QuinticPolynomial) {
		this.roots = [];
		this.qk = 0;
		this.qc = 0;
		this.n = 5;
		this.M = Array.from(Array(this.n + 1), () => new Array(this.n + 1));
		this.Q = new QuinticPolynomial(
			q.a5,
			q.a4,
			q.a3,
			q.a2,
			q.a1,
			q.a0,
		);
		this.checkNode(0, 0);
	}

	countRoots() {
		const a0 = this.Q.a0;
		const a1 = this.Q.a1;
		const a2 = this.Q.a2;
		const a3 = this.Q.a3;
		const a4 = this.Q.a4;
		const a5 = this.Q.a5;

		// This computes the transformation T(R(P(x)), after which we can
		// use Descartes Rule of Signs to get the number of roots in the
		// range 0..1

		const b5 = a0;
		const b4 = (5 * a0 + a1);
		const b3 = (10 * a0 + 4 * a1 + a2);
		const b2 = (10 * a0 + 6 * a1 + 3 * a2 + a3);
		const b1 = (5 * a0 + 4 * a1 + 3 * a2 + 2 * a3 + a4);
		const b0 = a0 + a1 + a2 + a3 + a4 + a5;

		// Count the sign changes
		let v = 0;
		if (Math.sign(b5) != Math.sign(b4)) {
			v++;
		}
		if (Math.sign(b4) != Math.sign(b3)) {
			v++;
		}
		if (Math.sign(b3) != Math.sign(b2)) {
			v++;
		}
		if (Math.sign(b2) != Math.sign(b1)) {
			v++;
		}
		if (Math.sign(b1) != Math.sign(b0)) {
			v++;
		}

		return v;
	}

	HTranslate(h: number) { // h can be 0 or 1
		const u = h + Math.ceil((this.n + 1) / Math.pow(2, h));
		const M = this.M;

		// todo: expand this...
		for (let j = 0; j <= this.n; j++) {
			M[j][0] = this.Q.coefficient(j) * Math.pow(2, u - h * (this.n - j));
		}

		for (let i = 1; i <= this.n; i++) {
			for (let j = this.n - i; j <= this.n - 1; j++) {
				M[j][i] = M[j][i - 1] + Math.round(M[j + 1][i - 1] * Math.pow(2, -h));
			}
		}

		this.Q.a5 = M[5][5] * Math.pow(2, -u);
		this.Q.a4 = M[4][5] * Math.pow(2, -u);
		this.Q.a3 = M[3][5] * Math.pow(2, -u);
		this.Q.a2 = M[2][5] * Math.pow(2, -u);
		this.Q.a1 = M[1][5] * Math.pow(2, -u);
		this.Q.a0 = M[0][5] * Math.pow(2, -u);
	}

	/**
	 * Apply the transform Pkc -> Pkc' when c is zero. It is applied to Q in
	 * place.
	 * */
	H(d: number) { // d should be the difference in k
		const a = Math.pow(2, this.n * d);
		this.Q.a5 = this.Q.a5 * a * Math.pow(2, -5 * d);
		this.Q.a4 = this.Q.a4 * a * Math.pow(2, -4 * d);
		this.Q.a3 = this.Q.a3 * a * Math.pow(2, -3 * d);
		this.Q.a2 = this.Q.a2 * a * Math.pow(2, -2 * d);
		this.Q.a1 = this.Q.a1 * a * Math.pow(2, -1 * d);
		this.Q.a0 = this.Q.a0 * a;
	}

	checkNode(k, c) {
		// Check if we've made a change in the tree. (Otherwise we may have just started
		// the traversal)

		if (k != this.qk || c != this.qc) {
			// Update Q to be Pkc', by transforming Pkc. This optimised implementation
			// does by by assuming only a small subset of steps throughout the tree may
			// be made.

			if (c == this.qc + 1) { // If we've stepped c, we need to use HTranslate, otherwise we use H
				const h = this.qk - k;
				this.HTranslate(h);
			} else if (c == this.qc) { // We've stepped k, at most
				this.H(k - this.qk);
			} else { // This is to detect issues in the traversal and should not occur
				console.error('Depth first traversal has stepped k or c by an invalid amount');
				return;
			}

			// Update the k & c parameters for the stored polynomial

			this.qk = k;
			this.qc = c;
		}

		// Are there any roots in this interval? If so, subdivide.

		const numRoots = this.countRoots();

		if (numRoots == 0) { // We are done with this branch
			return;
		} else if (numRoots == 1) { // We have isolated a root in the interval Ikc
			this.roots.push([k, c]);
			return;
		}

		// Otherwise there are more than 1 roots, and we need to continue the
		// search.

		// To subdivide, perform a depth first search. This will mean c is only
		// incremented by one at any given time.

		this.checkNode(k + 1, 2 * c);
		this.checkNode(k + 1, 2 * c + 1);
	}
}

class QuinticPolynomial {

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

	coefficient(i: number) {
		switch (i) {
			case 5:
				return this.a5;
			case 4:
				return this.a4;
			case 3:
				return this.a3;
			case 2:
				return this.a2;
			case 1:
				return this.a1;
			case 0:
				return this.a0;
		}
	}

	/** Count the number of sign changes */
	var() {
		let v = 0;
		if (Math.sign(this.a5) != Math.sign(this.a4)) {
			v++;
		}
		if (Math.sign(this.a4) != Math.sign(this.a3)) {
			v++;
		}
		if (Math.sign(this.a3) != Math.sign(this.a2)) {
			v++;
		}
		if (Math.sign(this.a2) != Math.sign(this.a1)) {
			v++;
		}
		if (Math.sign(this.a1) != Math.sign(this.a0)) {
			v++;
		}
		return v;
	}
}

class CubicBezier {

	p0: Vector2;

	p1: Vector2;

	p2: Vector2;

	p3: Vector2;

	constructor(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2) {
		this.p0 = p0;
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
	}

	// Get polynomial per component - this is far easier to write out per component then
	// per vector, since Js does not support operator overloading.

	getPolynomial(p0, p1, p2, p3) {
  	const P = new CubicPolynomial();
		P.n = -p0 + 3 * p1 - 3 * p2 + p3;
		P.r = 3 * p0 - 6 * p1 + 3 * p2;
		P.s = -3 * p0 + 3 * p1;
		P.v = p0;
		return P;
	}

	// Defining the dot product of the closest point with the tangent (derivative) as the
	// function to minimise is an important facet of this solution, as it allows the
	// expanded polynomial to be univariate (as all the 2d terms are dot products).

	closestPoint(p: Vector2, points: any[], helper: SVGSnapDiagnosticsHelper): Vector2 {
  		// Compute the polynomials of the parametric form of the Bezier curve

		const n = new Vector2(
    		-this.p0.x + 3 * this.p1.x - 3 * this.p2.x + this.p3.x,
			-this.p0.y + 3 * this.p1.y - 3 * this.p2.y + this.p3.y,
		);

		const r = new Vector2(
    		3 * this.p0.x - 6 * this.p1.x + 3 * this.p2.x,
			3 * this.p0.y - 6 * this.p1.y + 3 * this.p2.y,
		);

		const s = new Vector2(
    		-3 * this.p0.x + 3 * this.p1.x,
			-3 * this.p0.y + 3 * this.p1.y,
		);

		const v = new Vector2(
    	this.p0.x,
			this.p0.y,
		);

		// From this form, compute the derivatives

		const j = new Vector2(
			3 * (-this.p0.x + 3 * this.p1.x - 3 * this.p2.x + this.p3.x),
			3 * (-this.p0.y + 3 * this.p1.y - 3 * this.p2.y + this.p3.y),
		);

		const k = new Vector2(
			2 * (3 * this.p0.x - 6 * this.p1.x + 3 * this.p2.x),
			2 * (3 * this.p0.y - 6 * this.p1.y + 3 * this.p2.y),
		);

		const m = new Vector2(
    		s.x,
			s.y,
		);

		// The coefficients for the q.q' will be unchanged no matter where p
		// is, so compute these and store them.

		const a5 = -Vector2.dot(j, n);
  	    const a4 = -(Vector2.dot(j, r) + Vector2.dot(k, n));
 		const a3 = -(Vector2.dot(j, s) + Vector2.dot(k, r) + Vector2.dot(m, n));
 		const a2 = -(Vector2.dot(j, v) + Vector2.dot(k, s) + Vector2.dot(m, r));
 		const a1 = -(Vector2.dot(k, v) + Vector2.dot(m, s));
 		const a0 = -Vector2.dot(m, v);

		// p.q' will change with p, so compute just these parts of the
		// coefficients. The coefficients for each power can simply be added
		// when it comes time to evaluate p-q.q'

		const b2 = Vector2.dot(p, j);
		const b1 = Vector2.dot(p, k);
		const b0 = Vector2.dot(p, m);

		const Q = new QuinticPolynomial(a5, a4, a3, a2 + b2, a1 + b1, a0 + b0);


		// We now have coefficients for a univariate polynomial, Q. Find the roots
		// within the range 0..1 to get potential closest points.

		const f = new RootFinder();
		f.findRoots(Q);

		for (let t = 0; t <= 1; t += (1 / 20)) {
			points.push([t, Math.abs(Q.evaluate(t))]);
		}

		helper.renderText(f.roots.length, 100, 500);

		// Check all the roots

		return this.evaluate(0);
	}

	evaluate(t: number) {
		// Get the Bezier in its polynomial form
		const X = this.getPolynomial(this.p0.x, this.p1.x, this.p2.x, this.p3.x);
		const Y = this.getPolynomial(this.p0.y, this.p1.y, this.p2.y, this.p3.y);
		return new Vector2(X.evaluate(t), Y.evaluate(t));

	}

	drawCurve(ctx: CanvasRenderingContext2D, s: number) {

		ctx.beginPath();
		ctx.moveTo(this.p0.x, this.p0.y);

		for (let t = 0; t <= 1; t += (1 / s)) {
    	const p = this.evaluate(t);
    	ctx.lineTo(p.x, p.y);
		}

		ctx.strokeStyle = 'black';
		ctx.stroke();
	}

	drawControlPoints(ctx) {
		ctx.beginPath();
		ctx.moveTo(this.p0.x, this.p0.y);
		ctx.lineTo(this.p1.x, this.p1.y);
		ctx.lineTo(this.p2.x, this.p2.y);
		ctx.lineTo(this.p3.x, this.p3.y);
		ctx.strokeStyle = 'blue';
		ctx.stroke();
	}

}

const C = new CubicBezier(
	new Vector2(100, 100),
	new Vector2(100, 60),
	new Vector2(300, 200),
	new Vector2(300, 320),
);


export function setupIntersectionTest(helper: SVGSnapDiagnosticsHelper) {

	const ctx = helper.context;

	function drawPoint(p: Vector2) {
		ctx.beginPath();
		ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
		ctx.stroke();
	}

	helper.clear();

	helper.canvas.addEventListener('mousemove', (evt)=>{

		if (!evt.ctrlKey) {
			return;
		}

		helper.clear();
		C.drawCurve(ctx, 50);
		C.drawControlPoints(ctx);

		const rect = ctx.canvas.getBoundingClientRect();
		const p = new Vector2(evt.clientX - rect.left, evt.clientY - rect.top);

		const points = [];

		const cp = C.closestPoint(p, points, helper);

		helper.beginPlot(100, 400, 200, 1 / 1000);

		for (const a of points) {
			helper.plot(a[0], a[1]);
		}

		helper.endPlot();

		// Draw the axis

		helper.beginPlot(100, 400, 200, 1);
		helper.plot(0, 0);
		helper.plot(1, 0);
		helper.endPlot();

		// Render the test points

		ctx.strokeStyle = 'red';
		drawPoint(p);

		ctx.strokeStyle = 'green';
		drawPoint(cp);

	});
}