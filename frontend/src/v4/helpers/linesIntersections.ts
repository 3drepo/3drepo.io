/**
 *  Copyright (C) 2020 3D Repo Ltd
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

interface IPoint2D {
	x: number;
	y: number;
}

export function linesIntersection(from1: IPoint2D, to1: IPoint2D, from2: IPoint2D, to2: IPoint2D): IPoint2D {
	const dX: number = to1.x - from1.x;
	const dY: number = to1.y - from1.y;

	const determinant: number = dX * (to2.y - from2.y) - (to2.x - from2.x) * dY;
	if (determinant === 0) {
		return undefined;
	}

	const lambda: number = ((to2.y - from2.y) * (to2.x - from1.x) + (from2.x - to2.x) * (to2.y - from1.y)) / determinant;
	const gamma: number = ((from1.y - to1.y) * (to2.x - from1.x) + dX * (to2.y - from1.y)) / determinant;

	if (!(0 <= lambda && lambda <= 1) || !(0 <= gamma && gamma <= 1)) {
		return undefined;
	}

	return {
		x: from1.x + lambda * dX,
		y: from1.y + lambda * dY,
	};
}
