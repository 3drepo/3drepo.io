/**
 *  Copyright (C) 2020 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.ap
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const _ = require("lodash");
const db = require("../handler/db");
const responseCodes = require("../response_codes.js");
const utils = require("../utils");
const TeamspaceSettings = require("./teamspaceSetting");

const fieldTypes = {
	"associated_activity": "[object String]",
	"category": "[object String]",
	"element": "[object String]",
	"location_desc": "[object String]",
	"mitigation_desc": "[object String]",
	"mitigation_details": "[object String]",
	"mitigation_stage": "[object String]",
	"mitigation_type": "[object String]",
	"risk_factor": "[object String]",
	"scope": "[object String]"
};

class RiskMitigation {
	getRiskMitigationCollection(account) {
		return db.getCollection(account, "mitigations");
	}

	async getCriteria(account) {
		const mitigationColl = await this.getRiskMitigationCollection(account);
		const attributeBlacklist = ["mitigation_desc", "mitigation_details"];
		const criteriaFields = Object.keys(_.omit(fieldTypes, attributeBlacklist));
		const criteriaPromises = [];
		const criteria = {};

		// Get teamspace categories
		let teamspaceCategories = await TeamspaceSettings.getRiskCategories(account);
		teamspaceCategories = teamspaceCategories.map(x => x.label);

		criteriaFields.forEach((field) => {
			const promise = mitigationColl.distinct(field, {});
			criteriaPromises.push(promise);
			promise.then((values) => {
				criteria[field] = values;
			});
		});

		return Promise.all(criteriaPromises).then(() => {
			// Append teamspace categories
			criteria['category'] = [...new Set(Object.assign([], criteria.category).concat(teamspaceCategories))];

			return criteria;
		});
	}

	async findMitigationSuggestions(account, criteria) {
		const mitigationColl = await this.getRiskMitigationCollection(account);
		const attributeBlacklist = [
			"mitigation_desc",
			"mitigation_details",
			"mitigation_stage",
			"mitigation_type"
		];
		const criteriaFilterFields = Object.keys(_.omit(fieldTypes, attributeBlacklist));

		// Only pick supported fields and clean empty criteria
		criteria = _.pick(criteria, criteriaFilterFields);
		Object.keys(criteria).forEach((key) => {
			if (criteria[key] === null || criteria[key] === "") {
				delete criteria[key];
			}
		});

		let suggestions = await mitigationColl.find(criteria).toArray();

		return suggestions;
	}
}

module.exports = new RiskMitigation();
