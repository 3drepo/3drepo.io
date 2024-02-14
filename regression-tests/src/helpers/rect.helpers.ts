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

export const center = (rect: DOMRect) => 
	( { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 });

export const distanceBetweenRects = (rectA: DOMRect, rectB: DOMRect) => {
	const centerA = center(rectA);
	const centerB = center(rectB);

	return Math.pow(centerA.y - centerB.y, 2) + Math.pow(centerA.x - centerB.x, 2);
};
