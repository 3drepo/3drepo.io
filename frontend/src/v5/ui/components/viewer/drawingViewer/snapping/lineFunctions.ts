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

export function clipLine(x0, y0, x1, y1, xmin, xmax, ymin, ymax, result: number[]) {
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


export function closestPointOnLine(x0, y0, x1, y1, x, y) {
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


function equals0(x: number) {
	return Math.abs(x) <= Number.EPSILON;
}

/**
 * Based on the algorithm suggested here https://stackoverflow.com/questions/563198
 */
export function lineLineIntersection(p0: Vector2, p1: Vector2, q0: Vector2, q1: Vector2): Vector2 {
	const p = p0;
	const r = new Vector2().subVectors(p1, p0);
	const q = q0;
	const s = new Vector2().subVectors(q1, q0);
	const qp = new Vector2().subVectors(q, p);
	const rs = r.cross(s);
	const qpr = qp.cross(r);

	if (equals0(rs) && equals0(qpr)) { // Lines are colinear
		// For intersection testing, we actaully don't care which it is, because
		// neither case results in an individual point to snap to.
		return null;
	}

	if (equals0(rs) && !equals0(qpr)) { // Parallel (and not intersecting)
		return null;
	}

	const t = qp.cross(s) / rs;
	const u = qp.cross(r) / rs;

	if (!equals0(rs) && t >= 0 && t <= 1 && u >= 0 && u <= 1) {
		return new Vector2().addVectors(p0, r.multiplyScalar(t));
	}

	return null;
}