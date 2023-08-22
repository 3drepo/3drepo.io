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

const { isArray } = require('../utils/helper/typeCheck');
const { sanitiseRegex } = require('../utils/helper/strings');
const { templates } = require('../utils/responseCodes');

const Rules = {};

const negToPosOp = {
	IS_NOT: 'IS',
	NOT_CONTAINS: 'CONTAINS',
	NOT_EQUALS: 'EQUALS',
	NOT_IN_RANGE: 'IN_RANGE',
	IS_EMPTY: 'IS_NOT_EMPTY',
};

Rules.generateQueriesFromRules = (rules) => {
	const positives = [];
	const negatives = [];

	rules.forEach((rule) => {
		const { field, values, operator } = rule;
		if (!negToPosOp[operator]) {
			// This is a positive rule
			positives.push(Rules.toQuery(rule));
		} else {
			if (operator !== 'IS_EMPTY') {
			// For any negative rule where we're not checking for empty, we need to a positive rule
			// to ensure the field exists
				positives.push(Rules.toQuery({ operator: 'IS_NOT_EMPTY', field }));
			}

			negatives.push(Rules.toQuery({ operator: negToPosOp[operator], field, values }));
		}
	});

	return { positives, negatives };
};

const getFieldClause = (rule) => {
	let fieldClause;

	const operator = negToPosOp[rule.field.operator] ?? rule.field.operator;
	const { values } = rule.field;

	switch (operator) {
	case 'IS':
		fieldClause = values.length > 1 ? { $in: values } : values[0];
		break;
	case 'CONTAINS': {
		const sanitisedValues = values.map(sanitiseRegex);
		// eslint-disable-next-line security/detect-non-literal-regexp
		fieldClause = { $regex: new RegExp(sanitisedValues.join('|')), $options: 'i' };
	}
		break;
	case 'STARTS_WITH': {
		const sanitisedValues = values.map(sanitiseRegex);
		// eslint-disable-next-line security/detect-non-literal-regexp
		fieldClause = { $regex: new RegExp(`^(${sanitisedValues.join('|')})`), $options: 'i' };
	}
		break;
	case 'ENDS_WITH': {
		const sanitisedValues = values.map(sanitiseRegex);
		// eslint-disable-next-line security/detect-non-literal-regexp
		fieldClause = { $regex: new RegExp(`.*(${sanitisedValues.join('|')})$`), $options: 'i' };
	}
		break;
	case 'REGEX': {
		const regexArr = values.map((val) => `(${val})`);
		// eslint-disable-next-line security/detect-non-literal-regexp
		fieldClause = { $regex: new RegExp(regexArr.join('|')) };
	}
		break;
	default:
		throw templates.invalidArguments;
	}

	return fieldClause;
};

const getValueClause = (rule) => {
	let valueClause;
	const operator = negToPosOp[rule.operator] ?? rule.operator;
	switch (operator) {
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
		const regexArr = rule.values.map((val) => `(${val})`);
		// eslint-disable-next-line security/detect-non-literal-regexp
		valueClause = { $regex: new RegExp(regexArr.join('|')) };
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
			valueClause = rangeClauses.length > 1 ? rangeClauses : rangeClauses[0];
		}
		break;
	default:
		throw templates.invalidArguments;
	}

	return valueClause;
};

Rules.toQuery = (rule) => {
	const valueClause = getValueClause(rule);
	const fieldClause = getFieldClause(rule);

	const createQuery = (field, value) => ({
		metadata: {
			$elemMatch: {
				key: field,
				...(value !== undefined ? { value } : {}),
			},
		},
	});

	// We need to capture the 0s and nulls
	if (valueClause !== undefined) {
		if (isArray(valueClause)) {
			return { $or: valueClause.map(createQuery) };
		}

		return createQuery(fieldClause, valueClause);
	}

	return createQuery(fieldClause);
};

module.exports = Rules;
