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
	"mitigation_status": "[object String]",
	"referencedRisks": "[object Array]"
};

const mitigationSuggestionsBlacklist = [
	"mitigation_desc",
	"mitigation_detail",
	"mitigation_stage",
	"mitigation_type",
	"mitigation_status",
	"referencedRisks"
];

const mitigationCriteriaBlacklist = [
	"mitigation_desc",
	"mitigation_detail",
	"mitigation_status",
	"referencedRisks"
];

const isMitigationStatusResolved = (mitigationStatus) => {
	return mitigationStatus === "agreed_partial" || mitigationStatus === "agreed_fully";
};

const formatRiskReference = (teamspace, modelId, riskId) => {
	return teamspace + "::" + modelId + "::" + riskId;
};

class Mitigation {
	getMitigationCollection(account) {
		return db.getCollection(account, "mitigations");
	}

	async clearAll(account) {
		const mitigationColl = await this.getMitigationCollection(account);
		return await mitigationColl.deleteMany({});
	}

	async deleteOne(account, id) {
		const mitigationColl = await this.getMitigationCollection(account);
		return await mitigationColl.deleteOne({ _id: id });
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

	async findMitigationSuggestions(account, mitigationCriteria, attributeBlacklist = mitigationSuggestionsBlacklist) {
		const mitigationColl = await this.getMitigationCollection(account);
		const criteria = { ...mitigationCriteria };
		const criteriaFilterFields = Object.keys(_.omit(fieldTypes, attributeBlacklist));

		// Only pick supported fields and clean empty criteria
		Object.keys(criteria).forEach((key) => {
			if (!criteriaFilterFields.includes(key) || criteria[key] === null || criteria[key] === undefined || criteria[key] === "") {
				delete criteria[key];
			}
		});

		return await mitigationColl.find(criteria).toArray();
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

		const mitigations = await this.findMitigationSuggestions(account, {}, []);

		if(!mitigations.length) {
			throw responseCodes.NO_MITIGATIONS_FOUND;
		}

		return parser.parse(mitigations);
	}

	async insert(account, mitigations, clearAll = true) {
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

		await mitigationColl.insertMany(mitigations);

		return mitigations;
	}

	async update(account, id, updateData) {
		await db.updateOne(account, "mitigations", { _id: id }, updateData);
	}

	async addRiskRefToMitigation(account, mitigation, riskReference) {
		const referencedRisks = mitigation.referencedRisks;

		if (!referencedRisks.includes(riskReference)) {
			referencedRisks.push(riskReference);
			await this.update(account, mitigation._id, { $set: { referencedRisks } });
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

		const mitigationDetails = {
			mitigation_desc: updatedRisk.mitigation_desc,
			mitigation_detail: updatedRisk.mitigation_detail,
			mitigation_stage: updatedRisk.mitigation_stage,
			mitigation_type: updatedRisk.mitigation_type,
			mitigation_status: updatedRisk.mitigation_status,
			category: updatedRisk.category,
			location_desc: updatedRisk.location_desc,
			element: updatedRisk.element,
			risk_factor: updatedRisk.risk_factor,
			scope: updatedRisk.scope,
			associated_activity: updatedRisk.associated_activity
		};
		const formattedReference = formatRiskReference(account, model, riskId);

		// if risk becomes resolved
		if (!oldStatusIsResolved && newStatusIsResolved) {
			const mitigations = await this.findMitigationSuggestions(account, mitigationDetails, []);
			const mitigation = mitigations[0];
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
			const allMitigations = await this.findMitigationSuggestions(account, {}, []);
			const oldMitigation = allMitigations.find((m) => m.referencedRisks
				&& m.referencedRisks.includes(formattedReference));

			// if the mitigation was manually removed and now the risk is unresolved
			if (!oldMitigation && !newStatusIsResolved) {
				return;
			}

			// remove old ref
			if (oldMitigation) {
				if (oldMitigation.referencedRisks.length === 1) {
					await this.deleteOne(account, oldMitigation._id);
				} else {
					const newReferencedRisks = oldMitigation.referencedRisks.filter((r) => r !== formattedReference);
					await this.update(account, oldMitigation._id, { $set: { referencedRisks: newReferencedRisks } });
				}
			}

			if (newStatusIsResolved) {
				const mitigations = await this.findMitigationSuggestions(account, mitigationDetails, []);
				const newMitigation = mitigations[0];
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
