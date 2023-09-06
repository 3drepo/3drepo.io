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

"use strict";

const { v5Path } = require("../../../interop");
const { schema } = require("../../../v5/schemas/rules");
const { toQuery } = require(`${v5Path}/models/metadata.rules`);
const { schema: rulesSchema } = require(`${v5Path}/schemas/rules`);

const commonOperators = {
	"IS": 1,
	"CONTAINS": 1,
	"REGEX": 1
};

const fieldNameOperators = {
	...commonOperators,
	"STARTS_WITH": 1,
	"ENDS_WITH": 1
};

const fieldValueOperators = {
	...commonOperators,
	"IS_EMPTY": 0,
	"IS_NOT_EMPTY": 0,
	"IS_NOT": 1,
	"NOT_CONTAINS": 1,
	"EQUALS": 1,
	"NOT_EQUALS": 1,
	"GT": 1,
	"GTE": 1,
	"LT": 1,
	"LTE": 1,
	"IN_RANGE": 2,
	"NOT_IN_RANGE": 2
};

const notOperators = {
	"IS_NOT": "IS",
	"NOT_CONTAINS": "CONTAINS",
	"NOT_EQUALS": "EQUALS",
	"NOT_IN_RANGE": "IN_RANGE",
	"IS_EMPTY": "IS_NOT_EMPTY"
};

const RuleHelper = {};

/**
 * Returns true if given rule has:
 * - A field,
 * - A supported operator,
 * - The correct minimum/multiples of values if a value is required
 */

RuleHelper.checkRulesValidity = (rules) => {
	try {
		schema.validateSync(rules);
		return true;
	} catch (err) {
		return false;
	};
};

RuleHelper.buildQueryFromRule = toQuery;
RuleHelper.positiveRulesToQueries = (rulesRaw) => {
	const rules = rulesSchema.cast(rulesRaw);

	const posRules = rules.filter(r => !notOperators[r.operator]).map(RuleHelper.buildQueryFromRule);

	// Except IS_EMPTY every neg rule needs that the field exists
	rules.forEach(({ field, operator }) => {
		if (notOperators[operator] && operator !== "IS_EMPTY") {
			const rule = { field, operator: "IS_NOT_EMPTY" };
			posRules.push(RuleHelper.buildQueryFromRule(rule));
		}
	});

	return posRules;
};

RuleHelper.negativeRulesToQueries = (rulesRaw) => {
	const rules = rulesSchema.cast(rulesRaw);
	return rules.filter(r => notOperators[r.operator]).map(({ field, values, operator }) => {
		const negRule = {
			field,
			values,
			operator: notOperators[operator]
		};

		return RuleHelper.buildQueryFromRule(negRule);
	});
};

module.exports = RuleHelper;
