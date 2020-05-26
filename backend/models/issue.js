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

const History = require("./history");
const Ref = require("./ref");

const ChatEvent = require("./chatEvent");
const ModelSetting = require("../models/modelSetting");

const BCF = require("./bcf");
const Ticket = require("./ticket");

const C = require("../constants");

const fieldTypes = {
	"_id": "[object Object]",
	"assigned_roles": "[object Array]",
	"comments": "[object Array]",
	"created": "[object Number]",
	"creator_role": "[object String]",
	"desc": "[object String]",
	"due_date": "[object Number]",
	"name": "[object String]",
	"norm": "[object Array]",
	"number": "[object Number]",
	"owner": "[object String]",
	"position": "[object Array]",
	"priority": "[object String]",
	"priority_last_changed": "[object Number]",
	"rev_id": ["[object String]", "[object Object]"],
	"scale": "[object Number]",
	"status": "[object String]",
	"status_last_changed": "[object Number]",
	"topic_type": "[object String]",
	"thumbnail": ["[object String]", "[object Object]"] ,
	"viewCount": "[object Number]",
	"viewpoint": "[object Object]",
	"viewpoints": "[object Array]",
	"extras": "[object Object]"
};

const ownerPrivilegeAttributes = [
	"position",
	"desc",
	"due_date",
	"priority"
];

const statusEnum = C.ISSUE_STATUS;

class Issue extends Ticket {
	constructor() {
		super("issues", "issue_id", "issueIds", "ISSUE", fieldTypes,ownerPrivilegeAttributes);
	}

	async create(account, model, newIssue, sessionId) {
		// Sets the issue number
		const coll = await db.getCollection(account, model + ".issues");
		try {
			const issues = await coll.find({}, {number: 1}).sort({ number: -1 }).limit(1).toArray();
			newIssue.number = (issues.length > 0) ? issues[0].number + 1 : 1;
		} catch(e) {
			newIssue.number = 1;
		}

		newIssue =  await super.create(account, model, newIssue);

		ChatEvent.newIssues(sessionId, account, model, [newIssue]);
		return newIssue;
	}

	async findByModelName(account, model, branch, revId, projection, ids, noClean = false, useIssueNumber = false) {
		if (useIssueNumber && Array.isArray(ids)) {
			ids = { number:  {"$in": ids.map(x => parseInt(x))} };
		}

		const issues = await super.findByModelName(account, model, branch, revId, projection, ids, noClean);

		if (!useIssueNumber) { // useIssueNumber is being used by export bcf and it doesnt export the submodel issues
			let submodels = [];

			if (branch || revId) {
				// searches for the revision models
				const { current } = (await History.getHistory({account, model}, branch, revId)) || {};
				if (current) {
					submodels = await Ref.find({account, model}, {type: "ref", _id: {"$in": current}}, {project:1});
					submodels = submodels.map(r => r.project);
				}
			}

			const issuesPerSubmodels = await Promise.all(submodels.map(submodel =>
				this.findByModelName(account, submodel,"master", null, projection, ids, noClean, useIssueNumber)
			));

			issuesPerSubmodels.forEach(subIssues => Array.prototype.push.apply(issues, subIssues));
		}

		return issues;
	}

	updateFromBCF(dbCol, issueToUpdate, changeSet) {
		return db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
			return _dbCol.update({_id: utils.stringToUUID(issueToUpdate._id)}, {$set: changeSet}).then(() => {
				const sessionId = issueToUpdate.sessionId;
				const updatedIssue = this.clean(dbCol.account, dbCol.model, issueToUpdate);
				ChatEvent.issueChanged(sessionId, dbCol.account, dbCol.model, updatedIssue._id, updatedIssue);
				return updatedIssue;
			});
		});
	}

	async onBeforeUpdate(data, oldIssue, userPermissions, systemComments) {
		// 2.6 if the user is trying to change the status and it doesnt have the necessary permissions throw a ISSUE_UPDATE_PERMISSION_DECLINED
		if (data.status && data.status !== oldIssue.status) {
			const canChangeStatus = userPermissions.hasAdminPrivileges || (userPermissions.hasAssignedJob && data.status !== statusEnum.CLOSED);
			if (!canChangeStatus) {
				throw responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED;
			}
		}

		const today = (new Date()).getTime();

		// 4.2 If there is a priority change , save the extra field priority_last_changed with todays timestamp
		if (this.isPriorityChange(oldIssue, data)) {
			data.priority_last_changed = today;
		}

		// 4.3 If there is a status change, save the extra field status_last_changed with todays timestamp
		if (this.isStatusChange(oldIssue, data)) {
			data.status_last_changed = today;
		}

		if (this.isIssueAssignment(oldIssue, data) && oldIssue.status === statusEnum.FOR_APPROVAL) {
			data.status = statusEnum.IN_PROGRESS;
			const i = systemComments.findIndex((element) => {
				return element.property === "status";
			});

			systemComments.splice(i,1);
		}

		// 4.4 If the status is changed to for_approval, the assigned role goes to the creator_role
		if (data.status === statusEnum.FOR_APPROVAL) {
			data.assigned_roles = oldIssue.creator_role ? [oldIssue.creator_role] : [];
		}

		return data;
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
			"thumbnail",
			"viewpoint",
			"viewpoints",
			"priority_last_changed",
			"status_last_changed"
		];

		return await super.update(attributeBlacklist, user, sessionId, account, model, issueId, data, this.onBeforeUpdate.bind(this));
	}

	async getBCF(account, model, branch, revId, ids, useIssueNumbers = false) {
		const projection = {};
		const noClean = true;

		const settings = await ModelSetting.findById({account, model}, model);
		const issues = await this.findByModelName(account, model, branch, revId, projection, ids, noClean, useIssueNumbers);

		return BCF.getBCFZipReadStream(account, model, issues, settings.properties.unit);
	}

	async importBCF(requester, account, model, revId, zipPath) {
		let branch;

		if (!revId) {
			branch = "master";
		}

		const history = await History.getHistory({ account, model }, branch, revId, {_id: 1});

		if (!history) {
			return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
		} else if (history) {
			revId = history._id;
		}

		const settings = await ModelSetting.findById({account, model}, model);
		const bcfIssues = await BCF.importBCF(requester, account, model, zipPath, settings);

		return this.merge(account, model, branch, revId, bcfIssues, requester.socketId, requester.user);
	}

	async merge(account, model, branch, revId, data, sessionId, user) {
		const existingIssues = await this.findByModelName(account, model, branch, revId, {}, {}, true);
		// FIXME
		const existingIssueIds = existingIssues.map(x => utils.uuidToString(x._id));

		// sort issues by date and add number
		data = data.sort((a, b) => {
			return a.created > b.created;
		});

		for (let i = 0; i < data.length; i++) {
			const issueToMerge = data[i];
			issueToMerge.rev_id = revId;

			const matchIndex = existingIssueIds.indexOf(utils.uuidToString(issueToMerge._id));

			if (matchIndex !== -1) {
				const matchingIssue = existingIssues[matchIndex];

				// 0. Set the black list for attributes
				const attributeBlacklist = [
					"_id",
					"created",
					"creator_role",
					"name",
					"norm",
					"number",
					"owner",
					"rev_id",
					"thumbnail",
					"viewpoint",
					"priority_last_changed",
					"status_last_changed"
				];

				// Attempt to merge viewpoints and comments and sort by created desc
				const complexAttrs = ["comments", "viewpoints"];
				complexAttrs.forEach((complexAttr) => {
					if (matchingIssue[complexAttr]) {
						let mergedAttr = matchingIssue[complexAttr];

						for (let issueIdx = 0; issueIdx < issueToMerge[complexAttr].length; issueIdx++) {
							if (-1 === matchingIssue[complexAttr].findIndex(attr =>
								utils.uuidToString(attr.guid) === utils.uuidToString(issueToMerge[complexAttr][issueIdx].guid))) {
								mergedAttr.push(issueToMerge[complexAttr][issueIdx]);
							}
						}
						if (mergedAttr.length && mergedAttr[0].created) {
							mergedAttr = mergedAttr.sort((a, b) => {
								return a.created > b.created;
							});
						}
						issueToMerge[complexAttr] = mergedAttr;
					}
				});

				await super.update(attributeBlacklist, user, sessionId, account, model, issueToMerge._id, issueToMerge, this.onBeforeUpdate.bind(this));
			} else {
				await this.create(account, model, issueToMerge, sessionId);
			}
		}
	}

	async getIssuesReport(account, model, rid, ids, res) {
		const reportGen = require("../models/report").newIssuesReport(account, model, rid);
		return super.getReport(account, model, rid, ids, res, reportGen);
	}

	isIssueBeingClosed(oldIssue, newIssue) {
		return !!oldIssue && oldIssue.status !== "closed" && newIssue.status === "closed";
	}

	isIssueBeingReopened(oldIssue, newIssue) {
		return oldIssue && oldIssue.status === "closed" && newIssue.status !== "closed";
	}

	isIssueAssignment(oldIssue, newIssue) {
		if (!newIssue.assigned_roles) {
			return false;
		}

		if (oldIssue) {
			return oldIssue.assigned_roles[0] !== newIssue.assigned_roles[0];
		} else {
			return newIssue.assigned_roles.length > 0; // In case this is a new issue with an assigned role
		}
	}

	isPriorityChange(oldIssue, newIssue) {
		if (!utils.hasField(newIssue, "priority")) {
			return false;
		}

		return oldIssue.priority !== newIssue.priority;
	}

	isStatusChange(oldIssue, newIssue) {
		if (!utils.hasField(newIssue, "status")) {
			return false;
		}
		return oldIssue.status !== newIssue.status;
	}
}

module.exports = new Issue();
