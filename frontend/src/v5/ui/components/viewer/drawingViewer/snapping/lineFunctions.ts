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
import { Line2 } from './types';

function equals0(x: number) {
	return Math.abs(x) <= Number.EPSILON;
}

export function closestPointOnLine(line: Line2, p: Vector2Like) {
	const dx = p.x - line.start.x;
	const dy = p.y - line.start.y;
	const a = line.end.x - line.start.x;
	const b = line.end.y - line.start.y;
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

	return new Vector2(line.start.x + nx * t, line.start.y + ny * t);
}

/**
 * Based on the algorithm suggested here https://stackoverflow.com/questions/563198
 */
export function lineLineIntersection(a: Line2, b: Line2): Vector2 {
	const p0 = a.start;
	const p1 = a.end;
	const q0 = b.start;
	const q1 = b.end;
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