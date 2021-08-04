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

const _ = require("lodash");
const parse = require("csv-parse/lib/sync");
const db = require("../handler/db");
const responseCodes = require("../response_codes.js");
const utils = require("../utils");

// NB: Order of fieldTypes important for importCSV
const fieldTypes = {
	"mitigation_desc": "[object String]",
	"mitigation_detail": "[object String]",
	"mitigation_stage": "[object String]",
	"mitigation_type": "[object String]",
	"category": "[object String]",
	"location_desc": "[object String]",
	"element": "[object String]",
	"risk_factor": "[object String]",
	"scope": "[object String]",
	"associated_activity": "[object String]"
};

class Mitigation {
	getMitigationCollection(account) {
		return db.getCollection(account, "mitigations");
	}

	async clearAll(account) {
		const mitigationColl = await this.getMitigationCollection(account);
		return await mitigationColl.remove({});
	}

	async getCriteria(account) {
		const mitigationColl = await this.getMitigationCollection(account);
		const attributeBlacklist = ["mitigation_desc", "mitigation_detail"];
		const criteriaFields = Object.keys(_.omit(fieldTypes, attributeBlacklist));
		const criteriaPromises = [];
		const criteria = {};

		const TeamspaceSettings = require("./teamspaceSetting");

		// Get teamspace categories
		const teamspaceCategories = await TeamspaceSettings.getRiskCategories(account);

		criteriaFields.forEach((field) => {
			criteriaPromises.push(mitigationColl.distinct(field, {}).then((values) => {
				criteria[field] = values;
			}));
		});

		await Promise.all(criteriaPromises);

		// Append teamspace categories
		criteria["category"] = [...new Set(Object.assign([], criteria.category).concat(teamspaceCategories))];

		return criteria;
	}

	async findMitigationSuggestions(account, criteria) {
		const mitigationColl = await this.getMitigationCollection(account);
		const attributeBlacklist = [
			"mitigation_desc",
			"mitigation_detail",
			"mitigation_stage",
			"mitigation_type"
		];
		const criteriaFilterFields = Object.keys(_.omit(fieldTypes, attributeBlacklist));

		// Only pick supported fields and clean empty criteria
		Object.keys(criteria).forEach((key) => {
			if (!criteriaFilterFields.includes(key) || criteria[key] === null || criteria[key] === "") {
				delete criteria[key];
			}
		});

		return await mitigationColl.find(criteria).toArray();
	}

	async importCSV(account, data) {
		const csvFields = Object.keys(fieldTypes);

		const records = parse(data, {
			columns: csvFields,
			skip_empty_lines: true,
			from_line: 2,
			trim: true
		});

		return this.insert(account, records);
	}

	async insert(account, mitigations) {
		const mitigationColl = await this.getMitigationCollection(account);
		const requiredFields = ["mitigation_desc"];
		const optionalFields = Object.keys(_.omit(fieldTypes, requiredFields));

		for (let i = 0; i < mitigations.length; i++) {
			const newMitigation = _.pick(mitigations[i], Object.keys(fieldTypes));

			requiredFields.forEach((key) => {
				if (!newMitigation[key] || newMitigation[key] === "") {
					// TODO handle missing data
					throw responseCodes.INVALID_ARGUMENTS;
				}
			});

			optionalFields.forEach((key) => {
				if (newMitigation[key] === "") {
					delete newMitigation[key];
				}
			});

			newMitigation._id = utils.generateUUID();

			mitigations[i] = newMitigation;
		}

		await this.clearAll(account);
		await mitigationColl.insertMany(mitigations);

		return mitigations;
	}
}

module.exports = new Mitigation();
