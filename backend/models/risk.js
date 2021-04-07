/**
 *	Copyright (C) 2019 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const yup = require("yup");
const responseCodes = require("../response_codes.js");
const ChatEvent = require("./chatEvent");
const Ticket = require("./ticket");
const utils = require("../utils");

const fieldTypes = {
	"_id": "[object Object]",
	"assigned_roles": "[object Array]",
	"associated_activity": "[object String]",
	"category": "[object String]",
	"comment": "[object String]",
	"commentIndex": "[object Number]",
	"comments": "[object Array]",
	"consequence": "[object Number]",
	"created": "[object Number]",
	"createdAt": "[object Number]",
	"creator_role": "[object String]",
	"desc": "[object String]",
	"element": "[object String]",
	"likelihood": "[object Number]",
	"location_desc": "[object String]",
	"mitigation_desc": "[object String]",
	"mitigation_detail": "[object String]",
	"mitigation_stage": "[object String]",
	"mitigation_status": "[object String]",
	"mitigation_type": "[object String]",
	"name": "[object String]",
	"number": "[object Number]",
	"owner": "[object String]",
	"position": "[object Array]",
	"residual_consequence": "[object Number]",
	"residual_likelihood": "[object Number]",
	"residual_risk": "[object String]",
	"rev_id": "[object Object]",
	"risk_factor": "[object String]",
	"safetibase_id": "[object String]",
	"scope": "[object String]",
	"sequence_start": "[object Number]",
	"sequence_end": "[object Number]",
	"thumbnail": "[object String]",
	"viewpoint": "[object Object]",
	"viewpoints": "[object Array]"
};

const riskSchema = yup.object().shape({
	_id: yup.object(),
	assigned_roles: yup.array(),
	associated_activity: yup.string(),
	category: yup.string(),
	comment: yup.string(),
	commentIndex: yup.number(),
	comments: yup.array(),
	consequence: yup.number(),
	created: yup.number(),
	createdAt: yup.number(),
	creator_role: yup.string(),
	desc: yup.string().max(220),
	element: yup.string(),
	likelihood: yup.number(),
	location_desc: yup.string(),
	mitigation_desc: yup.string().max(220),
	mitigation_detail: yup.string(),
	mitigation_stage: yup.string(),
	mitigation_status: yup.string(),
	mitigation_type: yup.string(),
	name: yup.string(),
	number: yup.number(),
	owner: yup.string(),
	position: yup.array(),
	residual_consequence: yup.number(),
	residual_likelihood: yup.number(),
	residual_risk: yup.string().max(220),
	rev_id: yup.object(),
	risk_factor: yup.string(),
	safetibase_id: yup.string(),
	scope: yup.string(),
	sequence_start: yup.number(),
	sequence_end: yup.number(),
	thumbnail: yup.string(),
	viewpoint: yup.object(),
	viewpoints: yup.array()
}).noUnknown();

const ownerPrivilegeAttributes = [
	"desc"
];

const LEVELS = {
	VERY_LOW: 0,
	LOW: 1,
	MODERATE: 2,
	HIGH: 3,
	VERY_HIGH: 4
};

function getLevelOfRisk(riskData) {
	const level_of_risk = calculateLevelOfRisk(riskData.likelihood, riskData.consequence);
	const residual_level_of_risk = calculateLevelOfRisk(riskData.residual_likelihood, riskData.residual_consequence);

	let overall_level_of_risk;
	if (0 <= residual_level_of_risk) {
		overall_level_of_risk = residual_level_of_risk;
	} else {
		overall_level_of_risk = level_of_risk;
	}

	return {level_of_risk, residual_level_of_risk, overall_level_of_risk};
}

function calculateLevelOfRisk(likelihood, consequence) {
	let levelOfRisk = -1;

	if (!isNaN(likelihood) && !isNaN(consequence) && 0 <= likelihood && 0 <= consequence) {
		const score = likelihood + consequence;

		if (6 < score) {
			levelOfRisk = LEVELS.VERY_HIGH;
		} else if (5 < score) {
			levelOfRisk = LEVELS.HIGH;
		} else if (2 < score) {
			levelOfRisk = LEVELS.MODERATE;
		} else if (1 < score) {
			levelOfRisk = LEVELS.LOW;
		} else {
			levelOfRisk = LEVELS.VERY_LOW;
		}
	}

	return levelOfRisk;
}

class Risk extends Ticket {
	constructor() {
		super("risks", "risk", "issueIds", "RISK", fieldTypes, ownerPrivilegeAttributes);
	}

	async create(account, model, newRisk, sessionId) {
		if (!riskSchema.isValidSync(newRisk, { strict: true })) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		newRisk = await super.create(account, model, newRisk);
		ChatEvent.newRisks(sessionId, account, model, [newRisk]);
		return newRisk;
	}

	async update(user, sessionId, account, model, issueId, data) {
		if (!data || !riskSchema.isValidSync(data, { strict: true })) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		// 0. Set the black list for attributes
		const attributeBlacklist = [
			"_id",
			"comments",
			"created",
			"creator_role",
			"name",
			"number",
			"owner",
			"rev_id",
			"status",
			"thumbnail",
			"viewpoints"
		];

		const updatedRisk = await super.update(attributeBlacklist, user, sessionId, account, model, issueId, data);

		if (utils.hasField(updatedRisk.data, "consequence") ||
			utils.hasField(updatedRisk.data, "likelihood") ||
			utils.hasField(updatedRisk.data, "residual_consequence") ||
			utils.hasField(updatedRisk.data, "residual_likelihood")) {
			const levelOfRisk = getLevelOfRisk(updatedRisk.updatedTicket);
			updatedRisk.updatedTicket = {...updatedRisk.updatedTicket, ...levelOfRisk};
			updatedRisk.data = {...updatedRisk.data, ...levelOfRisk};
		}

		return updatedRisk;
	}

	async getRisksReport(account, model, rid, filters, res) {
		const reportGen = require("../models/report").newRisksReport(account, model, rid);
		return this.getReport(account, model, rid, filters, res, reportGen);
	}

	clean(account, model, riskToClean) {
		riskToClean = super.clean(account, model, riskToClean);
		return { ...riskToClean, ...getLevelOfRisk(riskToClean) };
	}

	async findByModelName(account, model, branch, revId, query, projection, filters, noClean = false, convertCoords = false) {
		// eslint-disable-next-line prefer-const
		let { levelOfRisks, residualLevelOfRisks, ...queryFilters} = filters;

		const filterRisk = (risk) => {
			const levelOfRisk = getLevelOfRisk(risk);
			let valid = true;

			if (levelOfRisks) {
				valid = levelOfRisks.includes(levelOfRisk.level_of_risk);
			}

			if (residualLevelOfRisks) {
				valid = valid && residualLevelOfRisks.includes(levelOfRisk.residual_level_of_risk);
			}

			return valid;
		};

		return super.findByModelName(account, model, branch, revId, query, projection, queryFilters, noClean, convertCoords, filterRisk);
	}
}

module.exports = new Risk();
