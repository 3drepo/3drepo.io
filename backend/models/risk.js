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

const ChatEvent = require("./chatEvent");
const Ticket = require("./ticket");

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

const ownerPrivilegeAttributes = [
	"position",
	"desc",
	"viewpoint"
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
		newRisk = await super.create(account, model, newRisk);
		ChatEvent.newRisks(sessionId, account, model, [newRisk]);
		return newRisk;
	}

	async update(user, sessionId, account, model, issueId, data) {
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

		return await super.update(attributeBlacklist, user, sessionId, account, model, issueId, data);
	}

	async getRisksReport(account, model, rid, filters, res) {
		const reportGen = require("../models/report").newRisksReport(account, model, rid);
		return this.getReport(account, model, rid, filters, res, reportGen);
	}

	clean(account, model, riskToClean) {
		riskToClean = super.clean(account, model, riskToClean);
		return { ...riskToClean, ...getLevelOfRisk(riskToClean) };
	}
}

module.exports = new Risk();
