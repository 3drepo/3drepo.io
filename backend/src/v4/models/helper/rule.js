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

const responseCodes = require("../../response_codes.js");
const { v5Path } = require("../../../interop");
const { toQuery } =  require(`${v5Path}/models/metadata.rules`);
const { schema: rulesSchema} =  require(`${v5Path}/middleware/dataConverter/schemas/components/rules`);

const ruleOperators = {
	"IS_EMPTY":	0,
	"IS_NOT_EMPTY":	0,
	"IS":		1,
	"IS_NOT":	1,
	"CONTAINS":	1,
	"NOT_CONTAINS":	1,
	"REGEX":	1,
	"EQUALS":	1,
	"NOT_EQUALS":	1,
	"GT":		1,
	"GTE":		1,
	"LT":		1,
	"LTE":		1,
	"IN_RANGE":	2,
	"NOT_IN_RANGE":	2
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
RuleHelper.isValidRule = (rule) => {
	return rule.field && rule.field.length > 0 &&
		Object.keys(ruleOperators).includes(rule.operator) &&
		(ruleOperators[rule.operator] === 0 ||
		(rule.values.length && ruleOperators[rule.operator] <= rule.values.length && !rule.values.some((x) => x === "")) &&
		rule.values.length % ruleOperators[rule.operator] === 0);
};

RuleHelper.checkRulesValidity = (rules) => {
	const fieldsWithRules = new Set();
	let valid = rules.length > 0;
	let it = 0;
	while (valid && it < rules.length) {
		const rule = rules[it];
		const hasDuplicate = fieldsWithRules.has(rule.field);
		valid = rule &&
			RuleHelper.isValidRule(rule) &&
			!hasDuplicate;

		if (valid) {
			fieldsWithRules.add(rule.field);
		} else if (hasDuplicate) {
			throw responseCodes.MULTIPLE_RULES_PER_FIELD_NOT_ALLOWED;
		}
		it++;
	}
	return valid;
};

RuleHelper.buildQueryFromRule = toQuery;
RuleHelper.positiveRulesToQueries = (rulesRaw) => {
	const rules = rulesSchema.cast(rulesRaw);

	const posRules = rules.filter(r=> !notOperators[r.operator]).map(RuleHelper.buildQueryFromRule);

	// Except IS_EMPTY every neg rule needs that the field exists
	rules.forEach(({field, operator})=> {
		if (notOperators[operator] && operator !== "IS_EMPTY") {
			const rule = { field, operator: "IS_NOT_EMPTY" };
			posRules.push(RuleHelper.buildQueryFromRule(rule));
		}
	});

	return posRules;
};

RuleHelper.negativeRulesToQueries = (rulesRaw) => {
	const rules = rulesSchema.cast(rulesRaw);
	return rules.filter(r=> notOperators[r.operator]).map(({field, values, operator}) => {
		const negRule = {
			field,
			values,
			operator: notOperators[operator]
		};

		return RuleHelper.buildQueryFromRule(negRule);
	});
};

module.exports = RuleHelper;
