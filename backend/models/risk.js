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

const utils = require("../utils");
const responseCodes = require("../response_codes.js");
const db = require("../handler/db");

const _ = require("lodash");

const ChatEvent = require("./chatEvent");

const Comment = require("./comment");
const View = require("./viewpoint");

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
	"likelihood": "[object Number]",
	"mitigation_desc": "[object String]",
	"mitigation_status": "[object String]",
	"name": "[object String]",
	"owner": "[object String]",
	"position": "[object Array]",
	"residual_consequence": "[object Number]",
	"residual_likelihood": "[object Number]",
	"residual_risk": "[object String]",
	"rev_id": "[object Object]",
	"safetibase_id": "[object String]",
	"thumbnail": "[object Object]",
	"viewpoint": "[object Object]",
	"viewpoints": "[object Array]"
};

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

function addRiskMitigationComment(account, model, sessionId, riskId, comments, data, viewpoint) {
	if (data.residual && data.likelihood && data.consequence && data.mitigation) {
		if (!comments) {
			comments = [];
		}

		comments.forEach((comment) => {
			comment.sealed = true;
		});

		const mitigationComment = Comment.newRiskMitigationComment(
			data.owner,
			data.likelihood,
			data.consequence,
			data.mitigation,
			viewpoint,
			data.position
		);

		comments.push(mitigationComment);

		ChatEvent.newComment(sessionId, account, model, riskId, mitigationComment);
	}

	return comments;
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

async function createViewPoint(account, model, viewpoint) {
	let newViewpoint = null;

	if (viewpoint) {
		newViewpoint = {...viewpoint};
		if (Object.prototype.toString.call(viewpoint) === fieldTypes["viewpoint"]) {
			newViewpoint.guid = utils.generateUUID();
			newViewpoint = await View.clean({account, model}, newViewpoint, fieldTypes.viewpoint);
		} else {
			throw responseCodes.INVALID_ARGUMENTS;
		}
	}

	return newViewpoint;
}

class Risk extends Ticket {
	constructor() {
		super("risks", "risk_id", "issueIds", "RISK", fieldTypes, []);
	}

	async create(account, model, newRisk, sessionId) {
		newRisk = await super.create(account, model, newRisk);
		ChatEvent.newRisks(sessionId, account, model, [newRisk]);
		return newRisk;
	}

	onBeforeUpdate(account, model, sessionId, residualData) {
		return async function(data, oldRisk) {
			if (residualData.residual) {
				const updatedComments = addRiskMitigationComment(
					account,
					model,
					sessionId,
					oldRisk._id,
					oldRisk.comments,
					data,
					createViewPoint(residualData.viewpoint)
				);

				data.comments = updatedComments;
			}

			return data;
		};
	}

	async update(user, sessionId, account, model, issueId, data) {
		// 0. Set the black list for attributes
		const attributeBlacklist = [
			"_id",
			"comments",
			"created",
			"creator_role",
			"name",
			"norm",
			"number",
			"owner",
			"rev_id",
			"status",
			"thumbnail",
			"viewpoint",
			"viewpoints"
		];

		const residualData = _.pick(data, ["viewpoint", "residual"]);
		const beforeUpdate =  this.onBeforeUpdate(account, model, sessionId, residualData).bind(this);

		data = _.omit(data, ["viewpoint", "residual"]);
		return await super.update(attributeBlacklist, user, sessionId, account, model, issueId, data, beforeUpdate);
	}

	deleteRisks(dbCol, sessionId, ids) {
		const riskIdStrings = [].concat(ids);

		for (let i = 0; i < ids.length; i++) {
			if ("[object String]" === Object.prototype.toString.call(ids[i])) {
				ids[i] = utils.stringToUUID(ids[i]);
			}
		}

		return db.getCollection(dbCol.account, dbCol.model + ".risks").then((_dbCol) => {
			return _dbCol.remove({ _id: {$in: ids}}).then((deleteResponse) => {
				if (!deleteResponse.result.ok) {
					return Promise.reject(responseCodes.RISK_NOT_FOUND);
				}

				// Success!
				ChatEvent.risksDeleted(sessionId, dbCol.account,  dbCol.model, riskIdStrings);
			});
		});
	}

	async getRisksReport(account, model, rid, ids, res) {
		const reportGen = require("../models/report").newRisksReport(account, model, rid);
		return this.getReport(account, model, rid, ids, res, reportGen);
	}

	clean(account, model, riskToClean) {
		riskToClean = super.clean(account, model, riskToClean);
		return { ...riskToClean, ...getLevelOfRisk(riskToClean) };
	}
}

module.exports = new Risk();
