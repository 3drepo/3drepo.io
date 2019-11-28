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
	"rev_id": "[object Object]",
	"scale": "[object Number]",
	"status": "[object String]",
	"status_last_changed": "[object Number]",
	"topic_type": "[object String]",
	"thumbnail": "[object Object]",
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

const statusEnum = {
	"OPEN": C.ISSUE_STATUS_OPEN,
	"IN_PROGRESS": C.ISSUE_STATUS_IN_PROGRESS,
	"FOR_APPROVAL": C.ISSUE_STATUS_FOR_APPROVAL,
	"CLOSED": C.ISSUE_STATUS_CLOSED
};

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

	async getIssuesReport(account, model, rid, ids, res) {
		const reportGen = require("../models/report").newIssuesReport(account, model, rid);
		return super.getReport(account, model, rid, ids, res, reportGen);
	}

	getIssuesList(account, model, branch, revision, ids, sort, convertCoords) {

		const projection = {
			extras: 0,
			"comments": 0,
			"viewpoints.extras": 0,
			"viewpoints.scribble": 0,
			"viewpoints.screenshot.content": 0,
			"viewpoints.screenshot.resizedContent": 0,
			"thumbnail.content": 0
		};

		return this.findByModelName(
			account,
			model,
			branch,
			revision,
			projection,
			ids,
			false
		).then((issues) => {
			if (convertCoords) {
				issues.forEach(this.toDirectXCoords);
			}
			return issues;
		});
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
		if (!newIssue.hasOwnProperty("priority")) {
			return false;
		}

		return oldIssue.priority !== newIssue.priority;
	}

	isStatusChange(oldIssue, newIssue) {
		if (!newIssue.hasOwnProperty("status")) {
			return false;
		}
		return oldIssue.status !== newIssue.status;
	}
}

module.exports = new Issue();
