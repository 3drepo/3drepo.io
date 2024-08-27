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

import { Vector2, QuinticPolynomial, CubicBezier } from './types';
import { SVGSnapDiagnosticsHelper } from './debug';

class Root {
	/** The parameter (position along the curve) where the root is */
	u: number;

	/** The number of iterations it took to find the root */
	iterations: number;
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

	Q: QuinticPolynomial; // The polynomial we are finding the roots of

	Qp: QuinticPolynomial; // The polynomial Pkc(Q) for qk and qc below

	qk: number; // Current value of k for the polynomial Qp

	qc: number; // Current value of c for the polynomial Qp

	roots: Root[]; // True roots of the polynomial

	findRoots(q: QuinticPolynomial) {
		this.roots = [];
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

		this.isolateRoots(0, 0);
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
		const a = Math.pow(2, 5 * k);
		this.Qp.a5 = this.Qp.a5 * a * Math.pow(2, -5 * k);
		this.Qp.a4 = this.Qp.a4 * a * Math.pow(2, -4 * k);
		this.Qp.a3 = this.Qp.a3 * a * Math.pow(2, -3 * k);
		this.Qp.a2 = this.Qp.a2 * a * Math.pow(2, -2 * k);
		this.Qp.a1 = this.Qp.a1 * a * Math.pow(2, -1 * k);
		this.Qp.a0 = this.Qp.a0 * a;

		this.qk = this.qk + k;
		this.qc = this.qc * Math.pow(2, k);
	}

	isolateRoots(k, c) {
		// Check if theres an actual change in k or c - there won't be for the
		// first node, for example.

		if (k != this.qk || c != this.qc) {

			// Update Qp through the transformation Pkc -> Pkc'. The depth first
			// traversal means only one of a subset of operations are needed at
			// each step. k and c always change together, so work out which
			// transformation we need to apply based on k.

			const dk = k - this.qk;

			// The difference between H & HTranslate is that HTranslate includes
			// a Taylor Shift of one, before H. This changes how c behaves when
			// h is applied. For example, because k and c are interrelated, if we
			// wanted to go from 2,1 to 1,1, HTranslate would be used, not H. This
			// is because each H(-1) divides c by two, so we actually need
			// T(1) -> c = c + 1 = 2, k = k + 0 = 2
			// then,
			// H(-1) -> c = c * 0.5 = 1, k = k - 1 = 1
			// in that order, which can be achived with HTranslate.

			if (c == (this.qc + 1) * Math.pow(2, dk)) {
				this.HTranslate(dk);
			} else if (c == (this.qc * Math.pow(2, dk))) {
				this.H(dk);
			} else {
				console.error('Depth first traversal has stepped k or c by an invalid amount'); // This is to detect issues in the traversal and should not occur
				return;
			}
		}

		// We have now updated Qp to be Pkc', and can use it to count the number of
		// roots in this interval.

		const numRoots = this.countRoots();

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

			if (Math.abs(this.Qp.evaluate(0.5)) < Number.EPSILON) {
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
		//}
	}

	getLowerBound(k, c) {
		return c / Math.pow(2, k);
	}

	getUpperBound(k, c) {
		return (c + 1) / Math.pow(2, k);
	}

	/** Given a bound as kc, find the actual root of Q within the interval. */
	findRoot(k, c) {
		// Based on the observation of Chen et al, we only actually care about
		// roots that correspond to local minima, which can be identified when
		// Q is descending.
		let ai = this.getLowerBound(k, c);
		let bi = this.getUpperBound(k, c);
		const Qa = this.Q.evaluate(ai);
		const Qb = this.Q.evaluate(bi) - 0.0000001; // Be a little tolerant with b approaching zero - if we get false positives the worst case is that we run the bisection algorithm for a redundant root
		if (Qa >= 0 && Qb <= 0) {
			let ri = 0;
			let i = 0;
			for (i = 0; i < 100; i++) { // Maximum limit on iteration, though we'd hope to get to the end before then...
				if ((bi - ai) < 0.001) {
					ri = (bi + ai) / 2;
					break;
				}

				const mi = (ai + bi) / 2; // interval midpoint

				const Qm = this.Q.evaluate(mi);
				if (Math.abs(Qm) < Number.EPSILON) {
					ri = mi;
					break;
				} else if (Qm >= 0) {
					ai = mi;
				} else if (Qm <= 0) {
					bi = mi;
				}
			}

			this.roots.push({
				u: ri,
				iterations: i,
			});
		}
	}
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

	const Q = new QuinticPolynomial(
		curve.qq.a5,
		curve.qq.a4,
		curve.qq.a3,
		curve.qq.a2 + b2,
		curve.qq.a1 + b1,
		curve.qq.a0 + b0,
	);

	// We now have coefficients for a univariate polynomial, Q. Find the roots
	// within the range 0..1 to get potential closest points.

	const f = new RootFinder();
	f.findRoots(Q);

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