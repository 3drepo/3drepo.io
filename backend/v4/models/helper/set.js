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

"use strict";

/**
 * The union of two sets
 * @param {Set} setA
 * @param {Set} setB
 *
 * @returns {Set} The set with the larger size get modified and is the result of setA ∪ setB
 */
const union = (setA, setB) => {
	let iterating = null;
	let result = null;

	if (setA.size > setB.size) {
		iterating =  setB;
		result = setA;
	} else {
		iterating = setA;
		result = setB;
	}

	for (const elem of iterating) {
		result.add(elem);
	}

	return result;
};

/**
 * The intersection of two sets
 * @param {Set} setA
 * @param {Set} setB
 *
 * @returns {Set} A new set is the result of setA ∩ setB
 */
const _intersection = (setA, setB) => {
	let iterating = null;
	let otherSet = null;
	const result = new Set();

	if (setA.size > setB.size) {
		iterating =  setB;
		otherSet = setA;
	} else {
		iterating =  setA;
		otherSet = setB;
	}

	for (const elem of iterating) {
		if (otherSet.has(elem)) {
			result.add(elem);
		}
	}

	return result;
};

const _difference = (setA, setB) => {
	let result = new Set();

	if (setA.size > setB.size) {
		for (const elem of setB) {
			if (setA.has(elem)) {
				setA.delete(elem);
			}
		}

		result = setA;
	} else {
		for (const elem of setA) {
			if (!setB.has(elem)) {
				result.add(elem);
			}
		}
	}

	return result;
};

/**
 * The intersection of an array of  sets
 *
 * @param {Array<Set>} sets
 *
 * @returns {Set} A new set is the result of setA ∩ setB
 */
const intersection = (sets) => {
	if (sets.length === 1) {
		return sets[0];
	}

	// the sorting makes the intersection be faster because the complexity for each intersection gets capped by the size of the smallest set
	sets = sets.sort((a,b) => a.size - b.size);

	let intersectedSet = sets[0];

	sets.forEach((set, i) => {
		if (i === 0)  {
			return;
		}

		intersectedSet = _intersection(intersectedSet, set);
	});

	return intersectedSet;
};

const difference = (set, setsTosubtract) => {
	for (const setTosubtract of setsTosubtract) {
		set = _difference(set, setTosubtract);
	}

	return set;
};

const contains = (setA, setB) => {
	for (const elem of setB) {
		if (!setA.has(elem)) {
			return false;
		}
	}

	return true;
};

module.exports = {
	union,
	intersection,
	difference,
	contains
};