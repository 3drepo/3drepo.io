/**
 *  Copyright (C) 2019 3D Repo Ltd
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

// Naive implementation of .push with an array
// This is used as using Array.prototype.push.apply()
// causes stack overflow when the array lengths are huge,
// and concat is very slow.
export const mergeArrays = (arr1, arr2) => {
	const arr1Length = arr1.length;
	arr1.length += arr2.length;
	for (let i = 0; i < arr2.length; ++i) {
		arr1[arr1Length + i] = arr2[i];
	}
};
