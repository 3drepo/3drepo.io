/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const _ = require('lodash');

const Objects = {};

Objects.cloneDeep = _.cloneDeep;

Objects.removeFields = _.omit;

Objects.isEmpty = _.isEmpty;

Objects.isEqual = _.isEqual;

Objects.getNestedProperty = _.get;

Objects.setNestedProperty = _.set;

Objects.deleteIfUndefined = (obj, includeNull) => {
	const res = { ...obj };
	Object.keys(obj).forEach((key) => {
		const toDitch = obj[key] === undefined || (includeNull && obj[key] === null);
		if (toDitch) delete res[key];
	});

	return res;
};

// turn [A, B, C] to {A:A, B:B, C:C}
Objects.createConstantsObject = (constArray) => {
	const retVal = {};
	constArray?.forEach((val) => {
		retVal[val] = val;
	});

	return retVal;
};

module.exports = Objects;
