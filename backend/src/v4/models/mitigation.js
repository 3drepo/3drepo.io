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
const { Parser } = require("json2csv");

// NB: Order of fieldTypes important for importCSV
const csvImportFieldTypes = {
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

const fieldTypes = {
	...csvImportFieldTypes,
	"referencedRisks": "[object Array]"
};

const mitigationSuggestionsBlacklist = [
	"mitigation_desc",
	"mitigation_detail",
	"mitigation_stage",
	"mitigation_type",
	"referencedRisks"
];

const mitigationCriteriaBlacklist = [
	"mitigation_desc",
	"mitigation_detail",
	"referencedRisks"
];

const colName = "mitigations";

const isMitigationStatusResolved = (mitigationStatus) => {
	return mitigationStatus === "agreed_partial" || mitigationStatus === "agreed_fully";
};

const formatRiskReference = (teamspace, modelId, riskId) => {
	return `${teamspace}::${modelId}::${riskId};`
};

class Mitigation {
	getMitigationCollection(account) {
		return db.getCollection(account, colName);
	}

	async clearAll(account) {
		return await db.deleteMany(account, colName);
	}

	async deleteOne(account, id) {
		return await db.deleteOne(account, colName, { _id: id });
	}

	async getCriteria(account) {
		const mitigationColl = await this.getMitigationCollection(account);

		const criteriaFields = Object.keys(_.omit(fieldTypes, mitigationCriteriaBlacklist));
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
		const attributeBlacklist = mitigationSuggestionsBlacklist;
		const criteriaFilterFields = Object.keys(_.omit(fieldTypes, attributeBlacklist));

		// Only pick supported fields and clean empty criteria
		Object.keys(criteria).forEach((key) => {
			if (!criteriaFilterFields.includes(key) || criteria[key] === null || criteria[key] === undefined) {
				delete criteria[key];
			}
		});

		return await db.find(account, colName, criteria);
	}

	async importCSV(account, data) {
		const csvFields = Object.keys(csvImportFieldTypes);

		const records = parse(data, {
			columns: csvFields,
			skip_empty_lines: true,
			from_line: 2,
			trim: true
		});

		return this.insert(account, records);
	}

	async exportCSV(account) {
		const csvFields = Object.keys(fieldTypes);
		const parser = new Parser({ fields: csvFields });

		const mitigations = await db.find(account, colName);

		if(!mitigations.length) {
			throw responseCodes.NO_MITIGATIONS_FOUND;
		}

		return parser.parse(mitigations);
	}

	async insert(account, mitigations, clearAll = true) {
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
				if (!newMitigation[key]) {
					delete newMitigation[key];
				}
			});

			newMitigation._id = utils.generateUUID();

			mitigations[i] = newMitigation;
		}

		if (clearAll) {
			await this.clearAll(account);
		}

		await db.insertMany(account, colName, mitigations);

		return mitigations;
	}

	async update(account, id, updateData) {
		await db.updateOne(account, colName, { _id: id }, updateData);
	}

	async addRiskRefToMitigation(account, {referencedRisks, _id}, riskReference) {
		if (!referencedRisks.includes(riskReference)) {
			referencedRisks.push(riskReference);
			await this.update(account, _id, { $set: { referencedRisks } });
		}
	}

	async updateMitigationsFromRisk(account, model, oldRisk, updatedRisk) {
		const riskId = updatedRisk._id;
		const oldStatusIsResolved = !!oldRisk?.mitigation_desc && isMitigationStatusResolved(oldRisk.mitigation_status);
		const newStatusIsResolved = !!updatedRisk?.mitigation_desc && isMitigationStatusResolved(updatedRisk.mitigation_status);

		// if risk was and remains unresolved
		if (!oldStatusIsResolved && !newStatusIsResolved) {
			return;
		}

		const mitigationDetails = _.pick(updatedRisk, Object.keys(fieldTypes))		

		for (const key of Object.keys(mitigationDetails)) {
			if(!mitigationDetails[key]){
				delete mitigationDetails[key];
			}
		}

		const formattedReference = formatRiskReference(account, model, riskId);

		// if risk becomes resolved
		if (!oldStatusIsResolved && newStatusIsResolved) {
			const mitigation = await db.findOne(account, colName, mitigationDetails, {referencedRisks: 1});
			if (!mitigation) {
				try {
					await this.insert(account, [{ ...mitigationDetails, referencedRisks: [formattedReference] }], false);
				} catch {
					// do nothing if the mitigation was not inserted
				}
			} else if (mitigation.referencedRisks) {
				await this.addRiskRefToMitigation(account, mitigation, formattedReference);
			}
		} else {
			// if risk was already resolved		
			const oldMitigation = await db.findOne(account, colName, { referencedRisks: formattedReference });

			// if the mitigation was manually removed and now the risk is unresolved
			if (!oldMitigation && !newStatusIsResolved) {
				return;
			}

			// remove old ref
			if (oldMitigation) {
				if (oldMitigation.referencedRisks.length === 1) {
					await this.deleteOne(account, oldMitigation._id);
				} else {
					await db.updateOne(account, colName, { _id: oldMitigation._id }, { $pull: { referencedRisks: formattedReference } });
				}
			}

			if (newStatusIsResolved) {
				const newMitigation = await db.findOne(account, colName, mitigationDetails);
				if (!newMitigation) {
					try {
						await this.insert(account, [{ ...mitigationDetails, referencedRisks: [formattedReference] }], false);
					} catch {
						// do nothing if the mitigation was not inserted
					}
				} else if (newMitigation.referencedRisks) {
					await this.addRiskRefToMitigation(account, newMitigation, formattedReference);
				}
			}
		}

	}
}

module.exports = new Mitigation();
