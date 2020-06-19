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

const ChatEvent = require("./chatEvent");
const ModelSetting = require("../models/modelSetting");

const BCF = require("./bcf");
const Ticket = require("./ticket");

const Comment = require("./comment");

const C = require("../constants");
const { stringToUUID, uuidToString } = require("../utils");

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

	async onBeforeUpdate(data, oldIssue, userPermissions, systemComments) {
		// 2.6 if the user is trying to change the status and it doesnt have the necessary permissions throw a ISSUE_UPDATE_PERMISSION_DECLINED
		if (data.status && data.status !== oldIssue.status) {
			const canChangeStatus = userPermissions.hasAdminPrivileges ||
				(userPermissions.hasAssignedJob && data.status !== statusEnum.CLOSED && data.status !== statusEnum.VOID);
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
		if (useIssueNumbers && Array.isArray(ids)) {
			ids = { number:  {"$in": ids.map(x => parseInt(x))} };
		}
		const issues = await this.findByModelName(account, model, branch, revId, undefined, projection, ids, noClean);

		return BCF.getBCFZipReadStream(account, model, issues, settings.properties.unit);
	}

	async importBCF(requester, account, model, revId, dataBuffer) {
		if (dataBuffer.byteLength === 0) {
			return Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}

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
		const bcfIssues = await BCF.importBCF(requester, account, model, dataBuffer, settings);

		return this.merge(account, model, branch, revId, bcfIssues, requester.socketId, requester.user);
	}

	async merge(account, model, branch, revId, data, sessionId, user) {
		const existingIssues = await this.findByModelName(account, model, branch, revId, {}, {}, true);
		const existingIssuesMap = {};
		for (let i = 0; i < existingIssues.length; ++i) {
			existingIssuesMap[utils.uuidToString(existingIssues[i]._id)] = i;
		}

		// sort issues by date and add number
		data = data.sort((a, b) => {
			return a.created > b.created;
		});

		for (let i = 0; i < data.length; i++) {
			const issueToMerge = data[i];
			issueToMerge.rev_id = revId;

			const matchIndex = existingIssuesMap[utils.uuidToString(issueToMerge._id)];

			if (matchIndex !== undefined) {
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

	async addComment(account, model, id, user, data, sessionId) {
		// 1. creates a comment
		const comment = await Comment.addComment(account, model, this.collName, id, user, data);

		// 2. analize original comment searching for other tickets references
		const issueNumbers = Array.from(new Set(data.comment.match(/(#\d+)/g))).map(n => parseInt(n.substr(1), 10));

		// 3. Get issues from number
		const issuesColl = await this.getTicketsCollection(account, model);
		// 3.5 Adding the comment id to get its number and to not make 2 queries to the database
		const res = await issuesColl.find({ $or: [{ number: {$in: issueNumbers}}, {_id : stringToUUID(id)}]}).toArray();

		// 3. Create system comments for those ticket references
		const issuesCommentsUpdates =  [];

		// 4. Find the number of the issue that made the reference
		const referenceNumber = res.find(({_id}) => uuidToString(_id) === id).number;

		res.forEach((issue)  => {
			if (issue.number === referenceNumber) {
				return;
			}

			// 5. Create the system comment
			const systemComment = this.createSystemComment(account, model, sessionId, issue._id, user, "issue_referenced", null, referenceNumber);
			const comments = (issue.comments || []).map(c=>c.sealed = true).concat([systemComment]);

			issuesCommentsUpdates.push(issuesColl.update({_id: issue._id}, { $set: { comments }}));
		});

		await Promise.all(issuesCommentsUpdates);

		return comment;
	}

}

module.exports = new Issue();
