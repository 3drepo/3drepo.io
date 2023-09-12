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

const { createResponseCode, templates } = require('../utils/responseCodes');
const { FIELD_NAME_OPERATORS, FIELD_VALUE_OPERATORS } = require('./metadata.rules.constants');
const { isArray } = require('../utils/helper/typeCheck');
const { sanitiseRegex } = require('../utils/helper/strings');

const Rules = {};

const negToPosOp = {
	[FIELD_VALUE_OPERATORS.IS_NOT.name]: FIELD_VALUE_OPERATORS.IS.name,
	[FIELD_VALUE_OPERATORS.NOT_CONTAINS.name]: FIELD_VALUE_OPERATORS.CONTAINS.name,
	[FIELD_VALUE_OPERATORS.NOT_EQUALS.name]: FIELD_VALUE_OPERATORS.EQUALS.name,
	[FIELD_VALUE_OPERATORS.NOT_IN_RANGE.name]: FIELD_VALUE_OPERATORS.IN_RANGE.name,
	[FIELD_VALUE_OPERATORS.IS_EMPTY.name]: FIELD_VALUE_OPERATORS.IS_NOT_EMPTY.name,
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
			if (operator !== FIELD_VALUE_OPERATORS.IS_EMPTY.name) {
			// For any negative rule where we're not checking for empty, we need to a positive rule
			// to ensure the field exists
				positives.push(Rules.toQuery({ operator: FIELD_VALUE_OPERATORS.IS_NOT_EMPTY.name, field }));
			}

			negatives.push(Rules.toQuery({ operator: negToPosOp[operator], field, values }));
		}
	});

	return { positives, negatives };
};

const getFieldClause = (rule) => {
	let fieldClause;

	const { values } = rule.field;

	switch (rule.field.operator) {
	case FIELD_NAME_OPERATORS.IS.name: {
		fieldClause = values.length > 1 ? { $in: values } : values[0];
		break;
	}
	case FIELD_NAME_OPERATORS.CONTAINS.name: {
		const sanitisedValues = values.map(sanitiseRegex);
		// eslint-disable-next-line security/detect-non-literal-regexp
		fieldClause = { $regex: new RegExp(sanitisedValues.join('|')), $options: 'i' };
		break;
	}
	case FIELD_NAME_OPERATORS.STARTS_WITH.name: {
		const sanitisedValues = values.map(sanitiseRegex);
		// eslint-disable-next-line security/detect-non-literal-regexp
		fieldClause = { $regex: new RegExp(`^(${sanitisedValues.join('|')})`), $options: 'i' };
		break;
	}
	case FIELD_NAME_OPERATORS.ENDS_WITH.name: {
		const sanitisedValues = values.map(sanitiseRegex);
		// eslint-disable-next-line security/detect-non-literal-regexp
		fieldClause = { $regex: new RegExp(`(${sanitisedValues.join('|')})$`), $options: 'i' };
		break;
	}
	case FIELD_NAME_OPERATORS.REGEX.name: {
		// eslint-disable-next-line security/detect-non-literal-regexp
		fieldClause = { $regex: new RegExp(`(${values[0]})`) };
		break;
	}
	default:
		throw createResponseCode(templates.invalidArguments, 'Rule operator is unknown.');
	}

	return fieldClause;
};

const getValueClause = (rule) => {
	let valueClause;
	const operator = negToPosOp[rule.operator] ?? rule.operator;
	switch (operator) {
	case FIELD_VALUE_OPERATORS.IS_NOT_EMPTY.name:
		break;
	case FIELD_VALUE_OPERATORS.IS.name:
		valueClause = rule.values.length > 1 ? { $in: rule.values } : rule.values[0];
		break;
	case FIELD_VALUE_OPERATORS.CONTAINS.name: {
		const sanitisedValues = rule.values.map(sanitiseRegex);
		// eslint-disable-next-line security/detect-non-literal-regexp
		valueClause = { $regex: new RegExp(sanitisedValues.join('|')), $options: 'i' };
	}
		break;
	case FIELD_VALUE_OPERATORS.REGEX.name: {
		const regexArr = rule.values.map((val) => `(${val})`);
		// eslint-disable-next-line security/detect-non-literal-regexp
		valueClause = { $regex: new RegExp(regexArr.join('|')) };
	}
		break;
	case FIELD_VALUE_OPERATORS.EQUALS.name:
		valueClause = rule.values.length > 1 ? { $in: rule.values } : rule.values[0];
		break;
	case FIELD_VALUE_OPERATORS.GT.name:
		valueClause = { $gt: Math.min(...rule.values) };
		break;
	case FIELD_VALUE_OPERATORS.GTE.name:
		valueClause = { $gte: Math.min(...rule.values) };
		break;
	case FIELD_VALUE_OPERATORS.LT.name:
		valueClause = { $lt: Math.max(...rule.values) };
		break;
	case FIELD_VALUE_OPERATORS.LTE.name:
		valueClause = { $lte: Math.max(...rule.values) };
		break;
	case FIELD_VALUE_OPERATORS.IN_RANGE.name:
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
		throw createResponseCode(templates.invalidArguments, 'Rule operator is unknown.');
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
	if (valueClause !== undefined && isArray(valueClause)) {
		return { $or: valueClause.map((v) => createQuery(fieldClause, v)) };
	}

	return createQuery(fieldClause, valueClause);
};

module.exports = Rules;
