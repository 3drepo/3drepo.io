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

const { sanitiseRegex } = require('../utils/helper/strings');
const { templates } = require('../utils/responseCodes');

const Rules = {};

Rules.toQuery = (rule) => {
	let valueClause;
	switch (rule.operator) {
	case 'IS_NOT_EMPTY':
		break;
	case 'IS':
		valueClause = rule.values.length > 1 ? { $in: rule.values } : rule.values[0];
		break;
	case 'CONTAINS': {
		const sanitisedValues = rule.values.map(sanitiseRegex);
		// eslint-disable-next-line security/detect-non-literal-regexp
		valueClause = { $regex: new RegExp(sanitisedValues.join('|')), $options: 'i' };
	}
		break;
	case 'REGEX': {
		// eslint-disable-next-line security/detect-non-literal-regexp
		const regexArr = rule.values.map((val) => ({ $regex: new RegExp(val) }));
		valueClause = rule.values.length > 1 ? { $or: regexArr } : regexArr[0];
	}
		break;
	case 'EQUALS':
		valueClause = rule.values.length > 1 ? { $in: rule.values } : rule.values[0];
		break;
	case 'GT':
		valueClause = { $gt: Math.min(...rule.values) };
		break;
	case 'GTE':
		valueClause = { $gte: Math.min(...rule.values) };
		break;
	case 'LT':
		valueClause = { $lt: Math.max(...rule.values) };
		break;
	case 'LTE':
		valueClause = { $lte: Math.max(...rule.values) };
		break;
	case 'IN_RANGE':
		{
			const rangeClauses = [];
			for (let i = 0; i < rule.values.length; i += 2) {
				const rangeVal1 = rule.values[i];
				const rangeVal2 = rule.values[i + 1];
				rangeClauses.push({ $gte: Math.min(rangeVal1, rangeVal2),
					$lte: Math.max(rangeVal1, rangeVal2),
				});
			}
			valueClause = rangeClauses.length > 1 ? { $or: rangeClauses } : rangeClauses[0];
		}
		break;
	default:
		throw templates.invalidArguments;
	}

	const matchQuery = { metadata: { $elemMatch: { key: rule.field } } };

	if (valueClause) {
		matchQuery.metadata.$elemMatch.value = valueClause;
	}
	return matchQuery;
};

module.exports = Rules;
