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

import { Vector2, QuinticPolynomial, CubicBezier, Line } from './types';

class NinthOrderPolynomial {
	a9: number;

	a8: number;

	a7: number;

	a6: number;

	a5: number;

	a4: number;

	a3: number;

	a2: number;

	a1: number;

	a0: number;

	evaluate(t: number) : number {
		const t2 = t * t;
		const t3 = t2 * t;
		const t4 = t3 * t;
		const t5 = t4 * t;
		const t6 = t5 * t;
		const t7 = t6 * t;
		const t8 = t7 * t;
		const t9 = t8 * t;
		return this.a9 * t9 + this.a8 * t8 + this.a7 * t7 + this.a6 * t6 + this.a5 * t5 + this.a4 * t4 + this.a3 * t3 + this.a2 * t2 + this.a1 * t + this.a0;
	}
}

class Root {
	/** The parameter (position along the curve) where the root is */
	u: number;

	/** The number of iterations it took to find the root */
	iterations: number;
}

/** A polynomial that can be transformed by the interval k & c */
interface RootProblem {
	countRoots(): number;
	HTranslate(dk: number);
	H(dk: number);
	qk: number;
	qc: number;
	evaluateQp(t: number);
	evaluateQ(t: number);
	filterInterval(ai: number, bi: number);
}

class CurveIntersectionProblem implements RootProblem  {

	Q: NinthOrderPolynomial; // The polynomial we are finding the roots of

	Qp: NinthOrderPolynomial; // The polynomial Pkc(Q) for qk and qc below

	qk: number; // Current value of k for the polynomial Qp

	qc: number; // Current value of c for the polynomial Qp

	s: number;

	constructor(q: NinthOrderPolynomial, s: number) {
		this.Q = q; // This is safe to assign as a reference as it should never change
		this.qk = 0;
		this.qc = 0;
		this.Qp = new NinthOrderPolynomial();
		this.Qp.a0 = q.a0;
		this.Qp.a1 = q.a1;
		this.Qp.a2 = q.a2;
		this.Qp.a3 = q.a3;
		this.Qp.a4 = q.a4;
		this.Qp.a5 = q.a5;
		this.Qp.a6 = q.a6;
		this.Qp.a7 = q.a7;
		this.Qp.a8 = q.a8;
		this.Qp.a9 = q.a9;
		this.s = s;
	}

	countRoots() {
		const a0 = this.Qp.a0;
		const a1 = this.Qp.a1;
		const a2 = this.Qp.a2;
		const a3 = this.Qp.a3;
		const a4 = this.Qp.a4;
		const a5 = this.Qp.a5;
		const a6 = this.Qp.a6;
		const a7 = this.Qp.a7;
		const a8 = this.Qp.a8;
		const a9 = this.Qp.a9;

		// This computes the transformation T(R(P(x)), after which we can
		// use Descartes Rule of Signs to get the number of roots in the
		// range 0..1

		const b9 = a0;
		const b8 = (9 * a0 + a1);
		const b7 = (36 * a0 + 8 * a1 + a2);
		const b6 = (84 * a0 + 28 * a1 + 7 * a2 + a3);
		const b5 = (126 * a0 + 56 * a1 + 21 * a2 + 6 * a3 + a4);
		const b4 = (126 * a0 + 70 * a1 + 35 * a2 + 15 * a3 + 5 * a4 + a5);
		const b3 = (84 * a0 + 56 * a1 + 35 * a2 + 20 * a3 + 10 * a4 + 4 * a5 + a6);
		const b2 = (36 * a0 + 28 * a1 + 21 * a2 + 15 * a3 + 10 * a4 + 6 * a5 + 3 * a6 + a7);
		const b1 = (9 * a0 + 8 * a1 + 7 * a2 + 6 * a3 + 5 * a4 + 4 * a5 + 3 * a6 + 2 * a7 + a8);
		const b0 = a0 + a1 + a2 + a3 + a4 + a5 + a6 + a7 + a8 + a9;


		// Count the sign changes
		let v = 0;
		if (b9 != 0 && b8 != 0 && Math.sign(b9) != Math.sign(b8)) {
			v++;
		}
		if (b8 != 0 && b7 != 0 && Math.sign(b8) != Math.sign(b7)) {
			v++;
		}
		if (b7 != 0 && b6 != 0 && Math.sign(b7) != Math.sign(b6)) {
			v++;
		}
		if (b6 != 0 && b5 != 0 && Math.sign(b6) != Math.sign(b5)) {
			v++;
		}
		if (b5 != 0 && b4 != 0 && Math.sign(b5) != Math.sign(b4)) {
			v++;
		}
		if (b4 != 0 && b3 != 0 &&  Math.sign(b4) != Math.sign(b3)) {
			v++;
		}
		if (b3 != 0 && b2 != 0 &&  Math.sign(b3) != Math.sign(b2)) {
			v++;
		}
		if (b2 != 0 && b1 != 0 &&  Math.sign(b2) != Math.sign(b1)) {
			v++;
		}
		if (b1 != 0 && b0 != 0 &&  Math.sign(b1) != Math.sign(b0)) {
			v++;
		}

		return v;
	}

	/**
	 * Apply the transform H(T(P(x),1),h) - this is the equivalent of
	 * Pkc -> Pkc' where k' = k + 1, and c' = (c + 1)*2^k.
	 */
	HTranslate(k: number) {

		// Get the coefficients in local variables, partly to make the
		// following easier to read, but also because we will update Q
		// in-place.

		const a0 = this.Qp.a0;
		const a1 = this.Qp.a1;
		const a2 = this.Qp.a2;
		const a3 = this.Qp.a3;
		const a4 = this.Qp.a4;
		const a5 = this.Qp.a5;
		const a6 = this.Qp.a6;
		const a7 = this.Qp.a7;
		const a8 = this.Qp.a8;
		const a9 = this.Qp.a9;

		const h9 = Math.pow(2, (9 * k));
		const h8 = Math.pow(2, (8 * k));
		const h7 = Math.pow(2, (7 * k));
		const h6 = Math.pow(2, (6 * k));
		const h5 = Math.pow(2, (5 * k));
		const h4 = Math.pow(2, (4 * k));
		const h3 = Math.pow(2, (3 * k));
		const h2 = Math.pow(2, (2 * k));
		const h1 = Math.pow(2, k);

		// This transform is the equivalent of HTranslate. Rouillier and Zimmerman
		// give an implementation based on loops, but step 3 does not appear to work.
		// However, because we only need to handle one order, we can expand manually
		// as with H and TR.

		this.Qp.a9 = a9;
		this.Qp.a8 = h1 * (a8 + 9 * a9);
		this.Qp.a7 = h2 * (a7 + 8 * a8 + 36 * a9);
		this.Qp.a6 = h3 * (a6 + 7 * a7 + 28 * a8 + 84 * a9);
		this.Qp.a5 = h4 * (a5 + 6 * a6 + 21 * a7 + 56 * a8 + 126 * a9);
		this.Qp.a4 = h5 * (a4 + 5 * a5 + 15 * a6 + 35 * a7 + 70 * a8 + 126 * a9);
		this.Qp.a3 = h6 * (a3 + 4 * a4 + 10 * a5 + 20 * a6 + 35 * a7 + 56 * a8 + 84 * a9);
		this.Qp.a2 = h7 * (a2 + 3 * a3 + 6 * a4 + 10 * a5 + 15 * a6 + 21 * a7 + 28 * a8 + 36 * a9);
		this.Qp.a1 = h8 * (a1 + 2 * a2 + 3 * a3 + 4 * a4 + 5 * a5 + 6 * a6 + 7 * a7 + 8 * a8 + 9 * a9);
		this.Qp.a0 = h9 * (a0 + a1 + a2 + a3 + a4 + a5 + a6 + a7 + a8 + a9);

		this.qk = this.qk + k;
		this.qc = (this.qc + 1) * Math.pow(2, k);
	}

	/**
	 * Apply the transform 2^k5 * Qp(x / 2^k) - this is the equivalent of
	 * Pkc -> Pkc' where k' = k + 1 and c' = 2^k*c.
	 * */
	H(k: number) { // d should be the difference in k
		this.Qp.a9 = this.Qp.a9;
		this.Qp.a8 = this.Qp.a8 * Math.pow(2, k);
		this.Qp.a7 = this.Qp.a7 * Math.pow(2, (2 * k));
		this.Qp.a6 = this.Qp.a6 * Math.pow(2, (3 * k));
		this.Qp.a5 = this.Qp.a5 * Math.pow(2, (4 * k));
		this.Qp.a4 = this.Qp.a4 * Math.pow(2, (5 * k));
		this.Qp.a3 = this.Qp.a3 * Math.pow(2, (6 * k));
		this.Qp.a2 = this.Qp.a2 * Math.pow(2, (7 * k));
		this.Qp.a1 = this.Qp.a1 * Math.pow(2, (8 * k));
		this.Qp.a0 = this.Qp.a0 * Math.pow(2, (9 * k));

		this.qk = this.qk + k;
		this.qc = this.qc * Math.pow(2, k);
	}

	evaluateQ(t: number) {
		return this.Q.evaluate(t);
	}

	evaluateQp(t: number) {
		return this.Qp.evaluate(t);
	}

	filterInterval(): boolean {
		return true;
	}
}

class ClosestPointProblem implements RootProblem  {

	Q: QuinticPolynomial; // The polynomial we are finding the roots of

	Qp: QuinticPolynomial; // The polynomial Pkc(Q) for qk and qc below

	qk: number; // Current value of k for the polynomial Qp

	qc: number; // Current value of c for the polynomial Qp

	constructor(q: QuinticPolynomial) {
		this.Q = q; // This is safe to assign as a reference as it should never change
		this.qk = 0;
		this.qc = 0;
		this.Qp = new QuinticPolynomial(
			q.a5,
			q.a4,
			q.a3,
			q.a2,
			q.a1,
			q.a0,
		);
	}

	countRoots() {
		const a0 = this.Qp.a0;
		const a1 = this.Qp.a1;
		const a2 = this.Qp.a2;
		const a3 = this.Qp.a3;
		const a4 = this.Qp.a4;
		const a5 = this.Qp.a5;

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
		if (b5 != 0 && b4 != 0 && Math.sign(b5) != Math.sign(b4)) {
			v++;
		}
		if (b4 != 0 && b3 != 0 &&  Math.sign(b4) != Math.sign(b3)) {
			v++;
		}
		if (b3 != 0 && b2 != 0 &&  Math.sign(b3) != Math.sign(b2)) {
			v++;
		}
		if (b2 != 0 && b1 != 0 &&  Math.sign(b2) != Math.sign(b1)) {
			v++;
		}
		if (b1 != 0 && b0 != 0 &&  Math.sign(b1) != Math.sign(b0)) {
			v++;
		}

		return v;
	}

	/**
	 * Apply the transform H(T(P(x),1),h) - this is the equivalent of
	 * Pkc -> Pkc' where k' = k + 1, and c' = (c + 1)*2^k.
	 */
	HTranslate(h: number) {

		// Get the coefficients in local variables, partly to make the
		// following easier to read, but also because we will update Q
		// in-place.

		const a0 = this.Qp.a0;
		const a1 = this.Qp.a1;
		const a2 = this.Qp.a2;
		const a3 = this.Qp.a3;
		const a4 = this.Qp.a4;
		const a5 = this.Qp.a5;

		const h5 = Math.pow(2, (5 * h));
		const h4 = Math.pow(2, (4 * h));
		const h3 = Math.pow(2, (3 * h));
		const h2 = Math.pow(2, (2 * h));
		const h1 = Math.pow(2, h);

		// This transform is the equivalent of HTranslate. Rouillier and Zimmerman
		// give an implementation based on loops, but step 3 does not appear to work.
		// However, because we only need to handle one order, we can expand manually
		// as with H and TR.

		this.Qp.a5 = a5;
		this.Qp.a4 = h1 * (a4 + 5 * a5);
		this.Qp.a3 = h2 * (a3 + 4 * a4 + 10 * a5);
		this.Qp.a2 = h3 * (a2 + 3 * a3 + 6 * a4 + 10 * a5);
		this.Qp.a1 = h4 * (a1 + 2 * a2 + 3 * a3 + 4 * a4 + 5 * a5);
		this.Qp.a0 = h5 * (a0 + a1 + a2 + a3 + a4 + a5);

		this.qk = this.qk + h;
		this.qc = (this.qc + 1) * Math.pow(2, h);
	}

	/**
	 * Apply the transform 2^k5 * Qp(x / 2^k) - this is the equivalent of
	 * Pkc -> Pkc' where k' = k + 1 and c' = 2^k*c.
	 * */
	H(k: number) { // d should be the difference in k
		this.Qp.a5 = this.Qp.a5;
		this.Qp.a4 = this.Qp.a4 * Math.pow(2, k);
		this.Qp.a3 = this.Qp.a3 * Math.pow(2, 2 * k);
		this.Qp.a2 = this.Qp.a2 * Math.pow(2, 3 * k);
		this.Qp.a1 = this.Qp.a1 * Math.pow(2, 4 * k);
		this.Qp.a0 = this.Qp.a0 * Math.pow(2, 5 * k);

		this.qk = this.qk + k;
		this.qc = this.qc * Math.pow(2, k);
	}

	evaluateQ(t: number) {
		return this.Q.evaluate(t);
	}

	evaluateQp(t: number) {
		return this.Qp.evaluate(t);
	}

	filterInterval(Qa: number, Qb: number): boolean {
		// Based on the observation of Chen et al, we only actually care about
		// roots that correspond to local minima, which can be identified when
		// Q is descending.
		// Be a little tolerant with b approaching zero - if we get false positives the worst case is that we run the bisection algorithm for a redundant root
		return Qa >= 0 && (Qb - 0.0000001) <= 0;
	}
}

/**
 * RootFinder isolates values of t, where Q is at a local minimum.
 *
 * This implementation is based on:
 * - Fabrice Rouillier & Paul Zimmermann. Efficient isolation of polynomial's
 *   real roots. Journal of Computational and Applied Mathematics (2004).
 * - Xiao-Diao Chen, Yin Zhou, Zhenyu Shu, Hua Su & Jean-Claude Paul. Improved
 *   Algebraic Algorithm On Point Projection For Bézier Curves. Proceedings of
 *   the Second International Multi-Symposiums on Computer and Computational
 *   Sciences (2007).
 * - Jingfang Zhou, Evan C. Sherbrooke & Nicholas M. Patrikalakis. Computation
 *   of stationary points of distance functions. Engineering with Computers.
 *   (1993).
 *
 * The basis of the algorithm is to transform the point and curve distance
 * function into a quintic polynomial. In this form the roots - which should
 * correspond the local minima of the distance - can be isolated and then
 * robustly resolved with a simple interative bisection.
 *
 * (Note that RootFinder explicitly filters root intervals that do not contain
 * local minima. While it can be used as a general purpose root finder for other
 * problems, it will require modifications to stop it filtering other roots.)
 *
 * In slightly more detail, the algorithm takes the approach based on Vincents
 * Theorem. The polynomial is bisected into intervals, and then transformed in
 * such a way that Descartes Rule-of-Signs will give a bound on the number of
 * roots in that interval (between 0 and 1). The search works by transforming a
 * polynomial representing an interval into another, in place - so it is memory
 * constant. The traversal order is chosen such that transforming between
 * adjacent intervals need only a couple of operations with mostly known
 * parameters, allowing them to be implemented using basic arithmetic on the
 * coefficients.
 * */
class RootFinder {

	p: RootProblem; // Holds the state of the n-degree polynomial we are working on

	roots: Root[]; // True roots of the polynomial

	findRoots(p: RootProblem) {
		this.roots = [];
		this.p = p;

		this.isolateRoots(0, 0);
	}

	isolateRoots(k, c) {
		// Check if theres an actual change in k or c - there won't be for the
		// first node, for example.

		const qp = this.p;

		if (k != qp.qk || c != qp.qc) {

			// Update Qp through the transformation Pkc -> Pkc'. The depth first
			// traversal means only one of a subset of operations are needed at
			// each step. k and c always change together, so work out which
			// transformation we need to apply based on k.

			const dk = k - qp.qk;

			// The difference between H & HTranslate is that HTranslate includes
			// a Taylor Shift of one, before H. This changes how c behaves when
			// h is applied. For example, because k and c are interrelated, if we
			// wanted to go from 2,1 to 1,1, HTranslate would be used, not H. This
			// is because each H(-1) divides c by two, so we actually need
			// T(1) -> c = c + 1 = 2, k = k + 0 = 2
			// then,
			// H(-1) -> c = c * 0.5 = 1, k = k - 1 = 1
			// in that order, which can be achived with HTranslate.

			if (c == (qp.qc + 1) * Math.pow(2, dk)) {
				qp.HTranslate(dk);
			} else if (c == (qp.qc * Math.pow(2, dk))) {
				qp.H(dk);
			} else {
				console.error('Depth first traversal has stepped k or c by an invalid amount'); // This is to detect issues in the traversal and should not occur
				return;
			}
		}

		// We have now updated Qp to be Pkc', and can use it to count the number of
		// roots in this interval.

		let numRoots = qp.countRoots();

		// If there is a zero-root in this interval, then force a subdivision as
		// countRoots will not consider it.

		if (Math.abs(qp.evaluateQp(0)) < Number.EPSILON && numRoots == 1) {
			numRoots++;
		}

		if (numRoots == 1) {
			// We have isolated a root in the interval Ikc, so add it to the
			// list to search for exact roots later.
			this.findRoot(k, c);

		} else if ( numRoots > 1 ) {
			// Otherwise there are more than 1 roots, and we need to continue
			// subdivision.

			// Check if theres a root at the beginning of the interval Ikc,
			// because countRoots explicitly excludes this (see addSuccConst
			// of 3.1.3 and Definition 6 of Rouillier & Zimmerman).

			if (Math.abs(qp.evaluateQp(0.5)) < Number.EPSILON) {
				this.roots.push({
					u: this.getLowerBound(k + 1, 2 * c + 1),
					iterations: 0,
				});
			}

			// Subdivide the nodes in a psuedo-depth first search, enqueing
			// pairs in a way that c and k are stepped by the smallest integer
			// at a time.

			this.isolateRoots(k + 1, 2 * c);
			this.isolateRoots(k + 1, (2 * c) + 1);
		}

		// (The case where numRoots is zero, means we have finished this branch)
	}

	getLowerBound(k, c) {
		return c / Math.pow(2, k);
	}

	getUpperBound(k, c) {
		return (c + 1) / Math.pow(2, k);
	}

	/** Given a bound as kc, find the actual root of Q within the interval. */
	findRoot(k, c) {
		const qp = this.p;

		let ai = this.getLowerBound(k, c);
		let bi = this.getUpperBound(k, c);

		let Qa = qp.evaluateQ(ai);
		let Qb = qp.evaluateQ(bi);
		if (qp.filterInterval(Qa, Qb)) {
			let ri = 0;
			let i = 0;
			for (i = 0; i < 100; i++) { // Maximum limit on iteration, though we'd hope to get to the end before then...
				if ((bi - ai) < 0.001) {
					ri = (bi + ai) / 2;
					break;
				}

				const mi = (ai + bi) / 2; // interval midpoint

				const Qm = qp.evaluateQ(mi);
				if (Math.abs(Qm) < Number.EPSILON) {
					ri = mi;
					break;
				} else if (Qa == 0 || Math.sign(Qm) == Math.sign(Qa)) {
					ai = mi;
					Qa = Qm;
				} else {
					bi = mi;
					Qb = Qm;
				}
			}

			this.roots.push({
				u: ri,
				iterations: i,
			});
		}
	}
}

// David Eberly, Geometric Tools, Redmond WA 98052
// Copyright (c) 1998-2024
// Distributed under the Boost Software License, Version 1.0.
function computeDepressedCubicRoots(d0: number, d1: number, roots: any[]) {
	if (d0 == 0.0) {
		if (d1 > 0.0) {
			// One real root, multiplicity 1.
			roots[0] = 0;
			return 1;
		} else if (d1 < 0.0) {
			// Three real roots, each multiplicity 1.
			const sqrtNegD1 = Math.sqrt(-d1);
			roots[0] = -sqrtNegD1;
			roots[1] = 0;
			roots[2] = sqrtNegD1;
			return 3;
		} else {
			// One real root, multiplicity 3.
			roots[0] = 0;
			return 1;
		}
	}

	// At this time d0 ̸= 0.
	if (Math.abs(d1) < Number.EPSILON) {
		// One real root, multiplicity 1.
		const cbrtNegD0 = (d0 > 0.0 ? -Math.pow(d0, 1.0 / 3.0) : Math.pow(-d0, 1.0 / 3.0));
		roots[0] = cbrtNegD0;
		return 1;
	}

	// At this time d0 ̸= 0 and d1 ̸= 0.
	const delta = -(27.0 * d0 * d0 + 4.0 * d1 * d1 * d1);
	if (delta > 0.0) {
		// Three real roots, each multiplicity 1.
		const sqrt3 = Math.sqrt(3.0);
		const rho = Math.pow(Math.abs(d1 / 3.0), 1.5);
		const cbrtRho = Math.pow(rho, 1.0 / 3.0);
		const theta = Math.atan2(Math.sqrt(delta / 27.0), -d0);
		const thetaDiv3 = theta / 3.0;
		const cosThetaDiv3 = Math.cos(thetaDiv3);
		const sinThetaDiv3 = Math.sin(thetaDiv3);
		const temp0 = cbrtRho * cosThetaDiv3;
		const temp1 = sqrt3 * cbrtRho * sinThetaDiv3;
		const r0 = 2.0 * temp0;
		const r1 = -temp0 - temp1;

		const r2 = -temp0 + temp1;
		if (sinThetaDiv3 > 0.0) {
			roots[0] = r1;
			roots[1] = r2;
			roots[2] = r0;
		} else {
			roots[0] = r2;
			roots[1] = r1;
			roots[2] = r0;
		}
		return 3;
	}

	if (delta < 0.0) {
		// One real root, multiplicity 1.
		if (d0 < 0.0) {
			const w = 0.5 * (-d0 + Math.sqrt(-delta / 27.0));
			const cbrtW = Math.pow(Math.abs(w), 1.0 / 3.0);
			const r0 = cbrtW - d1 / (3.0 * cbrtW);
			roots[0] = r0;
		} else {
			const negY = 0.5 * (d0 + Math.sqrt(-delta / 27.0));
			const cbrtY = Math.pow(Math.abs(negY), 1.0 / 3.0);
			const r0 = cbrtY - d1 / (3.0 * cbrtY);
			roots[0] = r0;
		}
		return 1;
	}

	// The discriminant is ∆ = 0. Two real roots, one of multiplicity 2 and one of multiplicity 1.
	const r0 = -3.0 * d0 / (2.0 * d1);
	const r1 = 2.0 * r0;
	if (r0 < r1) {
		roots[0] = r0;
		roots[1] = r1;
	} else {
		roots[0] = r1;
		roots[1] = r0;
	}
	return 2;
}

// David Eberly, Geometric Tools, Redmond WA 98052
// Copyright (c) 1998-2024
// Distributed under the Boost Software License, Version 1.0.
function computeDepressedQuadraticRoots(d0: number, roots: number[]): number {
	if (d0 > 0.0) {
		// Two non-real roots, each multiplicity 1.
		return 0;
	}

	if (d0 == 0.0) {
		// One real root, multiplicity 2.
		roots[0] = 0;
		return 1;
	}

	// Two real roots, each multiplicity 1.
	const sqrtNegD0 = Math.sqrt(-d0);
	roots[0] = -sqrtNegD0;
	roots[1] = sqrtNegD0;
	return 2;
}

function computeLinearRoots(a0: number, a1: number, roots: number[]) {
	if (Math.abs(a1) < Number.EPSILON) {
		return; // All real-valued x, or if a0 is non-zero there is no solution
	} else if (Math.abs(a0) < Number.EPSILON) {
		roots[0] = 0;
	} else {
		roots[0] = -a0 / a1;
	}
}

function computeQuadraticRoots(a0: number, a1: number, a2: number, roots: number[]) {

	// Check that the polynomial is actually quadratic - if the first term is zero
	// the following algorithm will attempt to divide by zero and result in other
	// rounding and precision errors.

	if (Math.abs(a2) > Number.EPSILON) {

		// Get the quadratic in depressed form to find the roots

		const m0 = a0 / a2;
		const m1 = a1 / a2;
		const d0 = m0 - (m1 * m1) / 4;

		computeDepressedQuadraticRoots(d0, roots);

		for (let i = 0; i < roots.length; i++) {
			roots[i] = roots[i] - m1 / 2;
		}
	} else {
		computeLinearRoots(a0, a1, roots);
	}
}

function computeCubicRoots(a0: number, a1: number, a2: number, a3: number, roots: number[]) {

	// Check that the polynomial is actually cubic - if the first term is zero
	// the following algorithm will attempt to divide by zero and result in other
	// rounding and precision errors.

	if (Math.abs(a3) > Number.EPSILON) {
		// Get the cubic in depressed form to find the roots

		const m0 = a0 / a3;
		const m1 = a1 / a3;
		const m2 = a2 / a3;
		const d0 = m0 - m1 * m2 / 3 + 2 * Math.pow(m2, 3) / 27;
		const d1 = m1 - (m2 * m2) / 3;

		computeDepressedCubicRoots(d0, d1, roots);

		// Transform root of d(y) to root of g(x)
		for (let i = 0; i < roots.length; i++) {
			roots[i] = roots[i] - m2 / 3;
		}

	} else {
		computeQuadraticRoots(a0, a1, a2, roots);
	}
}

function createCurveCurvePolynomial(a: CubicBezier, b: CubicBezier): CurveIntersectionProblem {

	// Normalise the curves

	const minx = Math.min(a.p0.x, a.p1.x, a.p2.x, a.p3.x, b.p0.x, b.p1.x, b.p2.x, b.p3.x);
	const maxx = Math.max(a.p0.x, a.p1.x, a.p2.x, a.p3.x, b.p0.x, b.p1.x, b.p2.x, b.p3.x);
	const miny = Math.min(a.p0.x, a.p1.x, a.p2.x, a.p3.x, b.p0.x, b.p1.x, b.p2.x, b.p3.x);
	const maxy = Math.max(a.p0.x, a.p1.x, a.p2.x, a.p3.x, b.p0.x, b.p1.x, b.p2.x, b.p3.x);

	const s = Math.max(maxx - minx, maxy - miny);

	const A0x = (a.p0.x - minx) / s;
	const A1x = (a.p1.x - minx) / s;
	const A2x = (a.p2.x - minx) / s;
	const A3x = (a.p3.x - minx) / s;
	const A0y = (a.p0.y - miny) / s;
	const A1y = (a.p1.y - miny) / s;
	const A2y = (a.p2.y - miny) / s;
	const A3y = (a.p3.y - miny) / s;
	const B0x = (b.p0.x - minx) / s;
	const B1x = (b.p1.x - minx) / s;
	const B2x = (b.p2.x - minx) / s;
	const B3x = (b.p3.x - minx) / s;
	const B0y = (b.p0.y - miny) / s;
	const B1y = (b.p1.y - miny) / s;
	const B2y = (b.p2.y - miny) / s;
	const B3y = (b.p3.y - miny) / s;

	const P = new NinthOrderPolynomial();

	const m0 = (A0y - 3 * A1y + 3 * A2y - A3y);
	const m1 = (B0x - 3 * B1x + 3 * B2x - B3x);
	const m2 = (A0x - 3 * A1x + 3 * A2x - A3x);
	const m3 = (B0y - 3 * B1y + 3 * B2y - B3y);
	const m4 = (3 * B0x - 6 * B1x + 3 * B2x);
	const m5 = (3 * B0y - 6 * B1y + 3 * B2y);
	const m6 = (3 * A0y - 6 * A1y + 3 * A2y);
	const m7 = (3 * A0x - 6 * A1x + 3 * A2x);
	const m8 = (3 * B0x - 3 * B1x);
	const m9 = (3 * B0y - 3 * B1y);
	const m10 = (3 * A0y - 3 * A1y);
	const m11 = (3 * A0x - 3 * A1x);


	const n0  = Math.pow(m0, 3);
	const n1  = Math.pow(m1, 3);
	const n2  = Math.pow(m2, 3);
	const n3  = Math.pow(m3, 3);
	const n4  = Math.pow(m2, 2);
	const n5  = Math.pow(m3, 2);
	const n6  = Math.pow(m0, 2);
	const n7  = Math.pow(m1, 2);
	const n8  = Math.pow(m4, 2);
	const n9  = Math.pow(m5, 2);
	const n10 = Math.pow(m6, 2);
	const n11 = Math.pow(m7, 2);
	const n12 = Math.pow(m6, 3);
	const n13 = Math.pow(m7, 3);
	const n14 = Math.pow(m8, 2);
	const n15 = Math.pow(m9, 2);
	const n16 = Math.pow(B0x, 2);
	const n17 = Math.pow(B0y, 2);
	const n18 = Math.pow(m10, 3);
	const n19 = Math.pow(A0x, 2);
	const n20 = Math.pow(A0y, 2);
	const n21 = Math.pow(m10, 2);
	const n22 = Math.pow(m11, 2);
	const n23 = Math.pow(m11, 3);
	const n24 = Math.pow(A0x, 3);
	const n25 = Math.pow(A0y, 3);
	const n26 = Math.pow(B0y, 3);
	const n27 = Math.pow(B0x, 3);

	const k0 = (A0y - 3 * A1y + 3 * A2y - A3y);
	const k1 = (B0x - 3 * B1x + 3 * B2x - B3x);
	const k2 = (A0x - 3 * A1x + 3 * A2x - A3x);
	const k3 = (B0y - 3 * B1y + 3 * B2y - B3y);
	const k4 = (3 * B0y - 6 * B1y + 3 * B2y);
	const k5 = (3 * B0x - 6 * B1x + 3 * B2x);
	const k6 = (3 * B0x - 3 * B1x);
	const k7 = (3 * B0y - 3 * B1y);
	const k8 = (2 * k6 * k1 + n8);
	const k9 = (2 * k7 * k3 + n9);
	const k10 = (2 * B0y * k3 + 2 * k7 * k4);
	const k11 = (2 * B0x * k1 + 2 * k6 * k5);
	const k12 = (3 * A0x - 6 * A1x + 3 * A2x);
	const k13 = (3 * A0x - 3 * A1x);
	const k14 = (3 * A0y - 6 * A1y + 3 * A2y);
	const k15 = (3 * A0y - 3 * A1y);
	const k16 = (n14 + 2 * B0x * k5);
	const k17 = (n15 + 2 * B0y * k4);

	const n4k0 = n4 * k0;
	const n12k2 = n12 * k2;
	const n21n11k0 = n21 * n11 * k0;
	const k2k0 = k2 * k0;
	const n22k15 = n22 * k15;

	const l0 = k15 * k12 * k2k0;
	const l1 = k13 * k14 * k2k0;
	const l2 = k15 * k14 * n4;
	const l3 = k13 * k14 * n4;
	const l4 = k13 * k12 * n6;
	const l5 = k15 * k12 * n4;
	const l6 = k12 * k14 * k0;
	const l7 = k14 * k2;
	const l8 = k14 * k4 * k2;
	const l9 = k15 * k12 * k4;
	const l10 = k13 * k15;
	const l11 = k13 * k7 * k14;
	const l12 = A0y * B0y;
	const l13 = A0x * A0y;
	const l14 = A0x * B0y;


	const j0 = k10 * n4k0;
	const j1 = k12 * n10 * k2 * k3;
	const j2 = n11 * k14 * k0 * k3;
	const j3 = k2 * n6 * k3;
	const j4 = n4k0 * k3;
	const j5 = l4 * k3;
	const j6 = l2 * k3;
	const j7 = l0 * k3;
	const j8 = l1 * k3;
	const j9 = k2 * n6;
	const j10 = k17 * n4k0;
	const j11 = k15 * k12 * n6;
	const j12 = k13 * k14 * n6;
	const j13 = k12 * n10 * k0;
	const j14 = k15 * l7 * k0;
	const j15 = k12 * n10 * k4 * k2;
	const j16 = n11 * k14 * k4 * k0;
	const j17 = k4 * n4k0;
	const j18 = k13 * k12 * k4 * n6;
	const j19 = k15 * k14 * k4 * n4;
	const j20 = l9 * k2 * k0;
	const j21 = k13 * l8 * k0;
	const j22 = k7 * n11 * k14 * k0;
	const j23 = k7 * k12 * n10 * k2;
	const j24 = k7 * n4k0;
	const j25 = k13 * k7 * k12 * n6;
	const j26 = k15 * k7 * k14 * n4;
	const j27 = k15 * k7 * k12 * k2 * k0;
	const j28 = k13 * k7 * l7 * k0;
	const j29 = k12 * n10 * k2;
	const j30 = n11 * k14 * k0;
	const j31 = n21 * k12 * l7;
	const j32 = k13 * k12 * k2 * k0;
	const j33 = k13 * k15 * k12 * k14 * k2;
	const j34 = k13 * k15 * k12 * k14 * k0;
	const j35 = B0y * k13 * k14 * k2 * k0;

	const k18 = (3 * j0 - 2 * j1 + 2 * j2 + 6 * A0x * j3 - 6 * A0y * j4 - 3 * j5 + 3 * j6 - j7 + j8);
	const k19 = (n12k2 - 3 * A0x * n0 + 3 * A0y * j9 - 3 * B0y * j9 + 2 * j11 + j12 - j13 - 3 * j14);
	const k20 = (3 * j10 - 2 * j15 + 2 * j16 + 6 * A0x * k4 * j9 - 6 * A0y * j17 - 3 * j18 + 3 * j19 - j20 + j21);
	const k21 = (2 * j22 - 2 * j23 + 6 * A0x * k7 * j9 - 6 * A0y * j24 + 6 * B0y * j24 - 3 * j25 + 3 * j26 - j27 + j28);
	// eslint-disable-next-line max-len
	const k22 = (n18 * n4 + 3 * n19 * n0 + 3 * n20 * n4k0 + 3 * n17 * n4k0 + n21n11k0 - 2 * A0x * n12k2 + n22k15 * n6 - 2 * k13 * n21 * k2k0 + 2 * A0y * j29 + 2 * A0x * j13 - 2 * A0y * j30 - 2 * B0y * j29 + 2 * B0y * j30 - 6 * l13 * j9 + 6 * l14 * j9 - 6 * l12 * n4k0 - j31 + 3 * A0y * l4 - 4 * A0x * j11 - 3 * A0y * l2 - 2 * A0x * j12 - 3 * B0y * l4 + 3 * B0y * l2 + l10 * n10 * k2 + A0y * l0 - A0y * l1 + 6 * A0x * j14 - B0y * l0 + j35 - j34);

	P.a9 = n0 * n1 - n2 * n3 + 3 * n4k0 * k1 * n5 - 3 * j9 * n7 * k3;

	P.a8 = 3 * k4 * n2 * n5 - 3 * k5 * n0 * n7 + 3 * k4 * j9 * n7 - 3 * k5 * n4k0 * n5 + 6 * k5 * j9 * k1 * k3 - 6 * j17 * k1 * k3;

	// eslint-disable-next-line max-len
	P.a7 = (k8 * k1 + 2 * n8 * k1 + k6 * n7) * n0 - (k9 * k3 + 2 * n9 * k3 + k7 * n5) * n2 - 3 * k7 * j9 * n7 + 3 * k6 * n4k0 * n5 - 3 * k8 * j3 + 3 * k9 * n4k0 * k1 - 6 * k5 * k4 * j9 * k1 + 6 * k5 * k4 * j4;

	// eslint-disable-next-line max-len
	P.a6 = n2 * (k9 * k4 + B0y * n5 + k10 * k3 + 2 * k7 * k4 * k3) - n0 * (k8 * k5 + B0x * n7 + k11 * k1 + 2 * k6 * k5 * k1) - k1 * k18 - n7 * k19 + n13 * k0 * n5 - 3 * A0y * n2 * n5 + l5 * n5 + 2 * l3 * n5 + 3 * k11 * j3 + 3 * k8 * k4 * j9 - 3 * k9 * k5 * n4k0 - n11 * l7 * n5 + 3 * A0x * n4k0 * n5 - 3 * B0x * n4k0 * n5 - 3 * j32 * n5 + 6 * k7 * k5 * j9 * k1 - 6 * k6 * k4 * j4;

	// eslint-disable-next-line max-len
	P.a5 = k5 * k18 + n0 * (k16 * k1 + k11 * k5 + k8 * k6 + 2 * B0x * k5 * k1) - n2 * (k17 * k3 + k10 * k4 + k9 * k7 + 2 * B0y * k4 * k3) + k1 * k20 + 2 * k5 * k1 * k19 - 2 * n13 * k4 * k0 * k3 + 6 * A0y * k4 * n2 * k3 - 3 * k16 * j3 - 3 * k11 * k4 * j9 - 3 * k8 * k7 * j9 + 3 * k9 * k6 * n4k0 + 2 * n11 * l8 * k3 - 6 * A0x * k4 * j4 + 6 * B0x * k4 * j4 - 2 * l9 * n4 * k3 - 4 * k13 * k14 * k4 * n4 * k3 + 6 * k13 * k12 * k4 * k2k0 * k3;

	// eslint-disable-next-line max-len
	P.a4 = (B0y * k9 + k7 * k10 + k17 * k4 + 2 * B0y * k7 * k3) * n2 - (B0x * k8 + k6 * k11 + k16 * k5 + 2 * B0x * k6 * k1) * n0 - k1 * k21 - k6 * k18 - k5 * k20 - k8 * k19 + k9 * n13 * k0 - 3 * A0y * k9 * n2 + 3 * k7 * k11 * j9 - k9 * n11 * l7 + 3 * k16 * k4 * j9 + 3 * A0x * k9 * n4k0 - 3 * B0x * k9 * n4k0 + k9 * l5 + 2 * k9 * l3 + 6 * B0x * k6 * j3 - 3 * k9 * j32;

	// eslint-disable-next-line max-len
	P.a3 = k5 * k21 + B0x * k18 + (k16 * k6 + B0x * k11 + n16 * k1 + 2 * B0x * k6 * k5) * n0 - (k17 * k7 + B0y * k10 + n17 * k3 + 2 * B0y * k7 * k4) * n2 + k6 * k20 + k11 * k19 + k1 * k22 - k10 * n13 * k0 + 3 * A0y * k10 * n2 - 3 * n20 * n2 * k3 - n23 * n6 * k3 - n22 * n10 * k2 * k3 + 2 * A0y * n13 * k0 * k3 - k13 * n21 * n4 * k3 + k10 * n11 * l7 - 3 * k16 * k7 * j9 - 3 * A0x * j0 - 3 * n19 * j3 - 3 * n16 * j3 - k15 * k10 * k12 * n4 - 2 * k13 * k10 * k14 * n4 + 3 * k13 * k10 * k12 * k2k0 - l10 * n11 * k0 * k3 + 2 * n22k15 * k2k0 * k3 + 2 * A0x * j1 - 2 * A0y * n11 * l7 * k3 - 2 * A0x * j2 + 6 * l13 * j4 + n22 * l6 * k3 + 2 * A0y * l5 * k3 + 3 * A0x * j5 + 4 * A0y * l3 * k3 - 3 * A0x * j6 - 6 * B0x * k6 * k4 * j9 - 6 * A0y * j32 * k3 + A0x * j7 - A0x * j8 + j33 * k3;

	// eslint-disable-next-line max-len
	P.a2 = (n17 * k4 + 2 * B0y * n15 + B0y * k17) * n2 - (n16 * k5 + 2 * B0x * n14 + B0x * k16) * n0 - k16 * k19 - k6 * k21 - B0x * k20 - k5 * k22 + 3 * n20 * k4 * n2 + n23 * k4 * n6 + k17 * n13 * k0 - 3 * A0y * k17 * n2 - 2 * A0y * n13 * k4 * k0 - k17 * n11 * l7 + k13 * n21 * k4 * n4 + 3 * A0x * j10 + k17 * l5 + 2 * k17 * l3 + 3 * n19 * k4 * j9 + 3 * n16 * k4 * j9 + n22 * n10 * k4 * k2 + l10 * n11 * k4 * k0 - 2 * n22k15 * k4 * k2k0 - 2 * A0x * j15 + 2 * A0y * n11 * l8 + 2 * A0x * j16 + 6 * B0x * k6 * k7 * j9 - 6 * l13 * j17 - 3 * k17 * j32 - n22 * k12 * k14 * k4 * k0 - 2 * A0y * l9 * n4 - 3 * A0x * j18 - 4 * A0y * k13 * k14 * k4 * n4 + 3 * A0x * j19 + 6 * A0y * k13 * k12 * k4 * k2k0 - A0x * j20 + A0x * j21 - l10 * k12 * l8;

	// eslint-disable-next-line max-len
	P.a1 = k6 * k22 + B0x * k21 - 3 * n20 * k7 * n2 - 3 * n17 * k7 * n2 + 3 * n16 * k6 * n0 - n23 * k7 * n6 + 2 * B0x * k6 * k19 - 3 * n19 * k7 * j9 - 3 * n16 * k7 * j9 - n22 * k7 * n10 * k2 + 2 * A0y * k7 * n13 * k0 - 2 * B0y * k7 * n13 * k0 + 6 * l12 * k7 * n2 - k13 * n21 * k7 * n4 + n22 * k7 * l6 + 2 * A0y * k15 * k7 * k12 * n4 + 3 * A0x * j25 + 4 * A0y * l11 * n4 - 3 * A0x * j26 - 2 * B0y * k15 * k7 * k12 * n4 - 4 * B0y * l11 * n4 - l10 * k7 * n11 * k0 + 2 * n22k15 * k7 * k2k0 + 2 * A0x * j23 - 2 * A0y * k7 * n11 * l7 - 2 * A0x * j22 + 2 * B0y * k7 * n11 * l7 + 6 * l13 * j24 - 6 * l14 * j24 - 6 * A0y * k13 * k7 * k12 * k2k0 + A0x * j27 - A0x * j28 + 6 * B0y * k13 * k7 * k12 * k2k0 + l10 * k7 * k12 * l7;

	// eslint-disable-next-line max-len
	P.a0 = n24 * n0 - n16 * k19 - n25 * n2 - B0x * k22 + n26 * n2 - n27 * n0 - n19 * n12k2 + n20 * n13 * k0 + n17 * n13 * k0 - 3 * A0y * n17 * n2 + 3 * n20 * B0y * n2 + A0x * n18 * n4 - A0y * n23 * n6 + B0y * n23 * n6 - 2 * l12 * n13 * k0 - A0y * k13 * n21 * n4 + A0x * n22k15 * n6 + B0y * k13 * n21 * n4 - n20 * n11 * l7 + n19 * j13 - n17 * n11 * l7 + 3 * A0x * n20 * n4k0 - 3 * n19 * A0y * j9 + 3 * A0x * n17 * n4k0 + 3 * n19 * B0y * j9 + n20 * l5 - A0y * n22 * n10 * k2 + 2 * n20 * l3 + A0x * n21n11k0 - 2 * n19 * j11 - n19 * j12 + n17 * l5 + B0y * n22 * n10 * k2 + 2 * n17 * l3 + A0x * l10 * n10 * k2 - A0y * l10 * n11 * k0 + B0y * l10 * n11 * k0 - 2 * A0x * k13 * n21 * k2k0 + 2 * A0y * n22k15 * k2k0 + 2 * l13 * j29 - 2 * l13 * j30 - 2 * B0y * n22k15 * k2k0 - 2 * l14 * j29 + 2 * l12 * n11 * l7 + 2 * l14 * j30 - 6 * A0x * l12 * n4k0 - A0x * j31 + A0y * n22 * l6 + 3 * l13 * l4 - 3 * l13 * l2 - B0y * n22 * l6 - 2 * l12 * l5 - 3 * l14 * l4 - 4 * l12 * l3 + 3 * l14 * l2 - 3 * n20 * j32 + 3 * n19 * j14 - 3 * n17 * j32 + l13 * l0 - l13 * l1 + 6 * l12 * j32 - l14 * l0 + A0x * j35 + A0y * j33 - A0x * j34 - B0y * j33;

	return new CurveIntersectionProblem(P, s);
}

/**
 * Returns the closest point on a curve to point p using the root isolation
 * method. Will always return a value, even if it is just the start or end
 * of the curve, if these turn out to be closest.
 */
export function closestPointOnCurve(curve: CubicBezier, p: Vector2): Vector2 {

	// The coefficients for the q.q' will be unchanged no matter where p
	// is, so compute these and store them. computeQq will also compute
	// j, k & m where necessary.

	curve.computeQq();

	// p.q' will change with p, so compute just these parts of the
	// coefficients. The coefficients for each power can then simply be
	// added when it comes time to evaluate p-q.q'

	const b2 = Vector2.dot(p, curve.j);
	const b1 = Vector2.dot(p, curve.k);
	const b0 = Vector2.dot(p, curve.m);

	const P = new ClosestPointProblem(
		new QuinticPolynomial(
			curve.qq.a5,
			curve.qq.a4,
			curve.qq.a3,
			curve.qq.a2 + b2,
			curve.qq.a1 + b1,
			curve.qq.a0 + b0,
		),
	);

	// We now have coefficients for a univariate polynomial, Q. Find the roots
	// within the range 0..1 to get potential closest points.

	const f = new RootFinder();
	f.findRoots(P);

	// Test the end of the curve (the last control point) by adding a fake root
	// for it. The first control point is tested as part of the loop
	// initialisation.

	f.roots.push({
		u: 1,
		iterations: 0,
	});

	let closestPoint = curve.evaluate(0);
	let closestDistance = Vector2.norm(closestPoint, p);

	for (const root of f.roots) {
		let q = curve.evaluate(root.u);
		const d = Vector2.norm(q, p);

		if (d < closestDistance) {
			closestDistance = d;
			closestPoint = q;
		}
	}

	return closestPoint;
}

export function lineCurveIntersection(curve: CubicBezier, line: Line, results: Vector2[]) {

	// Finds the intersection of a Line and a Bezier Curve using the root finding
	// method.

	// The equation of a line in implicit or linear form (ax + by - c = 0, or,
	// A.X = c, for any xy) and the Curve in parametric form (X(t) = (1-t)^3P0...).
	// Substituting the latter into the former gives a cubic polynomial which
	// can be solved to get all values of t where the equation of the line is
	// satisfied.

	const L = line.getImplicit();

	const p0 = Vector2.dot(L.A, curve.p0);
	const p1 = Vector2.dot(L.A, curve.p1);
	const p2 = Vector2.dot(L.A, curve.p2);
	const p3 = Vector2.dot(L.A, curve.p3);

	const a3 = (3 * p1 - p0 - 3 * p2 + p3);
	const a2 = (3 * p0 - 6 * p1 + 3 * p2);
	const a1 = (3 * p1 - 3 * p0);
	const a0 = L.d + p0;

	const roots: number[] = [];
	computeCubicRoots(a0, a1, a2, a3, roots);

	for (const root of roots) {
		if (root >= 0 && root <= 1) { // Only consider points in the range of the curve
			let q = curve.evaluate(root);
			results.push(q);
		}
	}
}

export function curveCurveIntersection(a: CubicBezier, b: CubicBezier, results: Vector2[]) {

	// This creates a ninth-order polynomial, in a RootFinder problem that can
	// be handed over directly.

	const P = createCurveCurvePolynomial(b, a);
	const f = new RootFinder();
	f.findRoots(P);

	for (const root of f.roots) {
		if (root.u >= 0 && root.u <= 1) {

			// Substituting the parametric of curve a will give us the the
			// intersection points on curve a, however these may not be in the
			// range 0 to 1 on curve b.
			// We must therefore check each point against b. This can be done
			// via inversion, or simply comparing with the closest point.

			let q = a.evaluate(root.u);
			let c = closestPointOnCurve(b, q);

			const d = Vector2.norm(c, q) / P.s; // P.s is the scale applied to normalise the polynomial. This is used to calibrate the threshold for rejecting intersections as outside 0..1.
			if (d > 0.01) {
				continue;
			}

			results.push(q);
		}
	}
}

export function updateCurveSelfIntersection(a: CubicBezier) {

	// Updates the CubicBezier's selfIntersection member with the point of self
	// intersection, or false if there is none.

	// This method is based on setting P(u)=P(v) and then removing the trivial
	// solution of u=v to get the reduced difference. The roots of this
	// quadratic are the self-intersection points.

	// We do this by getting the Canonical form, and finding the roots using only
	// P3 as shown by Parcly Taxel:
	// https://math.stackexchange.com/questions/3776840/2d-cubic-bezier-curve-point-of-self-intersection

	// For canonicalisation, we use the change-of-basis matrix to map P3 to the
	// canonical coordinate system. The geometric transform method is not robust
	// - e.g to control lines being parallel to a shear axis - whereas the
	// change-of-basis is a 2x2 matrix that can be inverted explicitly with a
	// fairly simple equation.

	const a01x = (a.p0.x - a.p1.x);
	const a01y = (a.p0.y - a.p1.y);
	const a12x = (a.p1.x - a.p2.x);
	const a12y = (a.p1.y - a.p2.y);
	const a03x = (a.p0.x - a.p3.x);
	const a03y = (a.p0.y - a.p3.y);
	const x = (a01x * a03y) / (a01x * a12y - a12x * a01y) - (a03x * a01y) / (a01x * a12y - a12x * a01y);
	const y = (a03x * a12y) / (a01x * a12y - a12x * a01y) - (a12x * a03y) / (a01x * a12y - a12x * a01y);

	// (The canonical components may be NaN if the curve is a quadric, however
	// quadrics cannot self-intersect so this will also be picked up by the
	// NaN check below.)

	// From this form we can get the root(s) of the quadratic

	const u = (x - 3) / (x + y - 3);
	const v = (u * u) + (3 / (x + y - 3));
	const t = (u - Math.sqrt((u * u) - (4 * v))) / 2;

	// See if this curve has any intersections

	if (isNaN(t)) {
		a.selfIntersection = false;
		return;
	}

	if (t < 0 || t > 1) {
		a.selfIntersection = false;
		return;
	}

	a.selfIntersection = a.evaluate(t);
}