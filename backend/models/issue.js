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
const FileRef = require("./fileRef");

const ChatEvent = require("./chatEvent");
const config = require("../config.js");

const User = require("./user");
const Ticket = require("./ticket");

const C = require("../constants");

const issue = {};

const extensionRe = /\.(\w+)$/;

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

const ticket =  new Ticket("issues", "issue_id", "ISSUE", fieldTypes,ownerPrivilegeAttributes);

const statusEnum = {
	"OPEN": C.ISSUE_STATUS_OPEN,
	"IN_PROGRESS": C.ISSUE_STATUS_IN_PROGRESS,
	"FOR_APPROVAL": C.ISSUE_STATUS_FOR_APPROVAL,
	"CLOSED": C.ISSUE_STATUS_CLOSED
};

issue.createIssue = async function(account, model, newIssue, sessionId) {
	// Sets the issue number
	const coll = await db.getCollection(account, model + ".issues");
	try {
		const issues = await coll.find({}, {number: 1}).sort({ number: -1 }).limit(1).toArray();
		newIssue.number = (issues.length > 0) ? issues[0].number + 1 : 1;
	} catch(e) {
		newIssue.number = 1;
	}

	newIssue =  await ticket.create(account, model, newIssue);

	ChatEvent.newIssues(sessionId, account, model, [newIssue]);
	return newIssue;
};

issue.updateFromBCF = function(dbCol, issueToUpdate, changeSet) {
	return db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
		return _dbCol.update({_id: utils.stringToUUID(issueToUpdate._id)}, {$set: changeSet}).then(() => {
			const sessionId = issueToUpdate.sessionId;
			const updatedIssue = ticket.clean(dbCol.account, dbCol.model, issueToUpdate);
			ChatEvent.issueChanged(sessionId, dbCol.account, dbCol.model, updatedIssue._id, updatedIssue);
			return updatedIssue;
		});
	});
};

issue.onBeforeUpdate = async function(data, oldIssue, userPermissions, systemComments) {
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
};

issue.update = async function(user, sessionId, account, model, issueId, data) {
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

	return await ticket.update(attributeBlacklist, user, sessionId, account, model, issueId, data, this.onBeforeUpdate.bind(this));
};

issue.getRisksReport = async function(account, model, rid, ids, res) {
	const reportGen = require("../models/report").newIssuesReport(account, model, rid);
	return ticket.getReport(account, model, rid, ids, res, reportGen);
};

issue.getIssuesList = function(account, model, branch, revision, ids, sort, convertCoords) {

	const projection = {
		extras: 0,
		"comments": 0,
		"viewpoints.extras": 0,
		"viewpoints.scribble": 0,
		"viewpoints.screenshot.content": 0,
		"viewpoints.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	return this.findIssuesByModelName(
		account,
		model,
		branch,
		revision,
		projection,
		ids,
		false
	).then((issues) => {
		if (convertCoords) {
			issues.forEach(ticket.toDirectXCoords);
		}
		return issues;
	});
};

issue.findIssuesByModelName = async function(account, model, branch, revId, projection, ids, noClean = false, useIssueNumber = false) {
	if (useIssueNumber) {
		ids = { numbers : ids.map(parseInt) };
	}

	let submodels = [];

	if (branch || revId) {
		// searches for the revision models
		const { current } = (await History.getHistory({account, model}, branch, revId));
		submodels = await Ref.find({account, model}, {type: "ref", _id: {"$in": current}}, {project:1});
		submodels = submodels.map(r => r.project);
	}

	const issues = await ticket.findByModelName(account, model, branch, revId, projection, ids, noClean);
	const issuesPerSubmodels = await Promise.all(submodels.map(submodel =>
		this.findIssuesByModelName(account, submodel,"master", null, projection, ids, noClean, useIssueNumber)
	));

	issuesPerSubmodels.forEach(subIssues => Array.prototype.push.apply(issues, subIssues));
	return issues;
};

issue.getScreenshot = ticket.getScreenshot.bind(ticket);
issue.getSmallScreenshot = ticket.getSmallScreenshot.bind(ticket);
issue.getThumbnail = ticket.getThumbnail.bind(ticket);

issue.findByUID = ticket.findByUID.bind(ticket);

issue.isIssueBeingClosed = function(oldIssue, newIssue) {
	return !!oldIssue && oldIssue.status !== "closed" && newIssue.status === "closed";
};

issue.isIssueBeingReopened = function (oldIssue, newIssue) {
	return oldIssue && oldIssue.status === "closed" && newIssue.status !== "closed";
};

issue.isIssueAssignment = function(oldIssue, newIssue) {
	if (!newIssue.assigned_roles) {
		return false;
	}

	if (oldIssue) {
		return oldIssue.assigned_roles[0] !== newIssue.assigned_roles[0];
	} else {
		return newIssue.assigned_roles.length > 0; // In case this is a new issue with an assigned role
	}
};

issue.isPriorityChange =  function (oldIssue, newIssue) {
	if (!newIssue.hasOwnProperty("priority")) {
		return false;
	}

	return oldIssue.priority !== newIssue.priority;
};

issue.isStatusChange =  function (oldIssue, newIssue) {
	if (!newIssue.hasOwnProperty("status")) {
		return false;
	}
	return oldIssue.status !== newIssue.status;
};

issue.addRefsToIssue = async function(account, model, issueId, username, sessionId, refs) {
	if (refs.length === 0) {
		return [];
	}

	const issues = await db.getCollection(account, model + ".issues");
	const issueQuery = {_id: utils.stringToUUID(issueId)};
	const issueFound = await issues.findOne(issueQuery);

	if (!issueFound) {
		throw responseCodes.ISSUE_NOT_FOUND;
	}

	const comments = issueFound.comments || [];

	const ref_ids = [];

	refs.forEach(ref => {
		comments.push(ticket.createSystemComment(account, model, sessionId, issueId, username, "resource", null, ref.name));
		ref_ids.push(ref._id);
	});

	await issues.update(issueQuery, { $set: {comments}, $push: {refs:  {$each: ref_ids}}});
	return refs;
};

issue.attachResourceFiles = async function(account, model, issueId, username, sessionId, resourceNames, files) {
	const quota = await User.getQuotaInfo(account);
	const spaceLeft = ((quota.spaceLimit === null || quota.spaceLimit === undefined ? Infinity : quota.spaceLimit) - quota.spaceUsed) * 1024 * 1024;
	const spaceToBeUsed = files.reduce((size, file) => size + file.size,0);

	if (spaceLeft < spaceToBeUsed) {
		throw responseCodes.SIZE_LIMIT_PAY;
	}

	if (!files.every(f => f.size < config.resourceUploadSizeLimit)) {
		throw responseCodes.SIZE_LIMIT;
	}

	const refsPromises = files.map((file,i) => {
		const extension = ((file.originalname.match(extensionRe) || [])[0] || "").toLowerCase();
		return FileRef.storeFileAsResource(account, model, username, resourceNames[i] + extension, file.buffer, {issueIds:[issueId]});
	});
	const refs = await Promise.all(refsPromises);
	refs.forEach(r => {
		delete r.link;
		delete r.type;
	});

	await this.addRefsToIssue(account, model, issueId, username, sessionId, refs);
	return refs;
};

issue.attachResourceUrls = async function(account, model, issueId, username, sessionId, resourceNames, urls) {
	const refsPromises = urls.map((url, index) =>  FileRef.storeUrlAsResource(account, model, username,resourceNames[index], url,{issueIds:[issueId]}));
	const refs = await Promise.all(refsPromises);
	refs.forEach(r => {
		delete r.type;
	});

	await this.addRefsToIssue(account, model, issueId, username, sessionId, refs);
	return refs;
};

issue.detachResource =  async function(account, model, issueId, resourceId, username, sessionId) {
	const ref = await FileRef.removeResourceFromIssue(account, model, issueId, resourceId);
	const issues = await db.getCollection(account, model + ".issues");
	const issueQuery = {_id: utils.stringToUUID(issueId)};
	const issueFound = await issues.findOne(issueQuery);

	if (!issueFound) {
		throw responseCodes.ISSUE_NOT_FOUND;
	}

	const comments = issueFound.comments;
	comments.push(await ticket.createSystemComment(account, model, sessionId, issueId, username, "resource", ref.name, null));
	await issues.update(issueQuery, {$set: {comments}, $pull: { refs: resourceId } });

	if(ref.type !== "http") {
		delete ref.link;
	}
	delete ref.type;

	return ref;
};

module.exports = issue;
