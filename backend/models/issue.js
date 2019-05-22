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
const uuid = require("node-uuid");
const responseCodes = require("../response_codes.js");
const db = require("../handler/db");

const ModelSetting = require("./modelSetting");
const History = require("./history");
const Ref = require("./ref");
const _ = require("lodash");

const ChatEvent = require("./chatEvent");

const systemLogger = require("../logger.js").systemLogger;
const Comment = require("./comment");
const Group = require("./group");
const Job = require("./job");
const Project = require("./project");
const User = require("./user");
const View = require("./viewpoint");

const C = require("../constants");

const issue = {};

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
	"comments",
	"priority_last_changed",
	"status_last_changed"
];

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

function clean(dbCol, issueToClean) {
	const idKeys = ["_id", "rev_id", "parent", "group_id"];
	const commentIdKeys = ["rev_id", "guid", "viewpoint"];
	const vpIdKeys = ["hidden_group_id", "highlighted_group_id", "shown_group_id", "guid", "group_id"];

	issueToClean.account = dbCol.account;
	issueToClean.model = (issueToClean.origin_model) ? issueToClean.origin_model : dbCol.model;

	idKeys.concat(vpIdKeys).forEach((key) => {
		if (issueToClean[key]) {
			issueToClean[key] = utils.uuidToString(issueToClean[key]);
		}
	});

	if (issueToClean.viewpoints) {
		issueToClean.viewpoints.forEach((viewpoint, i) => {
			vpIdKeys.forEach((key) => {
				if (issueToClean.viewpoints[i] && issueToClean.viewpoints[i][key]) {
					issueToClean.viewpoints[i][key] = utils.uuidToString(issueToClean.viewpoints[i][key]);
				} else {
					delete issueToClean.viewpoints[i][key];
				}
			});

			if (issueToClean.viewpoints[i].screenshot) {
				issueToClean.viewpoints[i].screenshot = issueToClean.account + "/" + issueToClean.model + "/issues/" + issueToClean._id + "/viewpoints/" + issueToClean.viewpoints[i].guid + "/screenshot.png";
				issueToClean.viewpoints[i].screenshotSmall = issueToClean.account + "/" + issueToClean.model + "/issues/" + issueToClean._id + "/viewpoints/" + issueToClean.viewpoints[i].guid + "/screenshotSmall.png";
			}

			if (0 === i) {
				issueToClean.viewpoint = issueToClean.viewpoints[i];
			}
		});
	}

	if (issueToClean.comments) {
		issueToClean.comments.forEach((comment, i) => {
			commentIdKeys.forEach((key) => {
				if (issueToClean.comments[i] && issueToClean.comments[i][key]) {
					issueToClean.comments[i][key] = utils.uuidToString(issueToClean.comments[i][key]);
				}
			});

			if (issueToClean.comments[i].viewpoint) {
				const commentViewpoint = issueToClean.viewpoints.find((vp) =>
					vp.guid === issueToClean.comments[i].viewpoint
				);

				if (commentViewpoint) {
					issueToClean.comments[i].viewpoint = commentViewpoint;
				}
			}
		});
	}

	if (issueToClean.thumbnail && issueToClean.thumbnail.flag) {
		issueToClean.thumbnail = issueToClean.account + "/" + issueToClean.model + "/issues/" + issueToClean._id + "/thumbnail.png";
	}

	// TODO - Remove this temporary hack later
	// Return empty arrays as frontend expects them
	// Return empty objects as frontend expects them
	Object.keys(fieldTypes).forEach((field) => {
		if (!issueToClean[field]) {
			if ("[object Array]" === fieldTypes[field]) {
				issueToClean[field] = [];
			} else if ("[object Object]" === fieldTypes[field]) {
				issueToClean[field] = {};
			}
		}
	});

	delete issueToClean.viewpoints;

	// Issue view count is not used and no longer being updated
	delete issueToClean.viewCount;

	return issueToClean;
}

function toDirectXCoords(issueData) {
	const fieldsToConvert = ["position", "norm"];
	const vpFieldsToConvert = ["right", "view_dir", "look_at", "position", "up"];

	fieldsToConvert.forEach((rootKey) => {
		if (issueData[rootKey]) {
			issueData[rootKey] = utils.webGLtoDirectX(issueData[rootKey]);
		}
	});

	const viewpoint = issueData.viewpoint;
	vpFieldsToConvert.forEach((key) => {
		if (viewpoint[key]) {
			viewpoint[key] = utils.webGLtoDirectX(viewpoint[key]);
		}
	});

	const clippingPlanes = viewpoint.clippingPlanes;
	if (clippingPlanes) {
		for (const item in clippingPlanes) {
			clippingPlanes[item].normal = utils.webGLtoDirectX(clippingPlanes[item].normal);
		}
	}

	return viewpoint;
}

function addSystemComment(account, model, sessionId, issueId, owner, property, oldValue, newValue) {
	const systemComment = Comment.newSystemComment(
		owner,
		property,
		oldValue,
		newValue
	);

	ChatEvent.newComment(sessionId, account, model, issueId, systemComment);

	return systemComment;
}

issue.setGroupIssueId = function(dbCol, data, issueId) {

	const updateGroup = function(group_id) {
		// TODO - Do we need to find group first? Can we just patch?
		return Group.findByUID(dbCol, utils.uuidToString(group_id), null, utils.uuidToString(data.rev_id)).then((group) => {
			const issueIdData = {
				issue_id: utils.stringToUUID(issueId)
			};

			return group.updateAttrs(dbCol, issueIdData);
		});
	};

	const groupUpdatePromises = [];

	if (data.viewpoint) {
		if (data.viewpoint.highlighted_group_id) {
			groupUpdatePromises.push(updateGroup(data.viewpoint.highlighted_group_id));
		}

		if (data.viewpoint.hidden_group_id) {
			groupUpdatePromises.push(updateGroup(data.viewpoint.hidden_group_id));
		}

		if (data.viewpoint.shown_group_id) {
			groupUpdatePromises.push(updateGroup(data.viewpoint.shown_group_id));
		}
	}

	return Promise.all(groupUpdatePromises);
};

issue.createIssue = function(dbCol, newIssue) {
	const sessionId = newIssue.sessionId;
	const newIssueAttributeBlacklist = [
		"viewpoint"
	];
	const issueAttributes = Object.keys(fieldTypes).filter(attr => !newIssueAttributeBlacklist.includes(attr));
	const issueAttrPromises = [];

	let branch;

	if (!newIssue.name) {
		return Promise.reject({ resCode: responseCodes.ISSUE_NO_NAME });
	}

	newIssue._id = utils.stringToUUID(newIssue._id ? newIssue._id : uuid.v1());
	newIssue.created = parseInt(newIssue.created ? newIssue.created : (new Date()).getTime());

	// Assign issue number
	issueAttrPromises.push(
		db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
			_dbCol.stats().then((stats) => {
				newIssue.number = (stats) ? stats.count + 1 : 1;
			}).catch(() => {
				newIssue.number = 1;
			});
		})
	);

	if (!newIssue.desc || newIssue.desc === "") {
		newIssue.desc = "(No Description)"; // TODO do we really want this stored?
	}

	if (!newIssue.revId) {
		branch = "master";
	}

	if(!newIssue.assigned_roles) {
		newIssue.assigned_roles = [];
	}

	// Assign rev_id for issue
	issueAttrPromises.push(
		History.getHistory(dbCol, branch, newIssue.revId, { _id: 1 }).then((history) => {
			if (!history && newIssue.revId) {
				return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
			} else if (history) {
				newIssue.rev_id = history._id;
			}
		})
	);

	return Promise.all(issueAttrPromises).then(() => {

		if (newIssue.viewpoint) {
			newIssue.viewpoint.guid = utils.generateUUID();

			if (newIssue.viewpoint.highlighted_group_id) {
				newIssue.viewpoint.highlighted_group_id = utils.stringToUUID(newIssue.viewpoint.highlighted_group_id);
			}

			if (newIssue.viewpoint.hidden_group_id) {
				newIssue.viewpoint.hidden_group_id = utils.stringToUUID(newIssue.viewpoint.hidden_group_id);
			}

			if (newIssue.viewpoint.shown_group_id) {
				newIssue.viewpoint.shown_group_id = utils.stringToUUID(newIssue.viewpoint.shown_group_id);
			}

			if (newIssue.viewpoint.screenshot) {
				newIssue.viewpoint.screenshot = {
					content: new Buffer.from(newIssue.viewpoint.screenshot, "base64"),
					flag: 1
				};

				return utils.resizeAndCropScreenshot(newIssue.viewpoint.screenshot.content, 120, 120, true).catch((err) => {
					systemLogger.logError("Resize failed as screenshot is not a valid png, no thumbnail will be generated", {
						account: dbCol.account,
						model: dbCol.model,
						issueId: utils.uuidToString(newIssue._id),
						viewpointId: utils.uuidToString(newIssue.viewpoint.guid),
						err
					});
				});
			}
		}

	}).then((image) => {
		if (image) {
			newIssue.thumbnail = {
				flag: 1,
				content: image
			};
		}

		return this.setGroupIssueId(dbCol, newIssue, newIssue._id);
	}).then(() => {
		newIssue.viewpoints = newIssue.viewpoints ? newIssue.viewpoints : [newIssue.viewpoint];

		let typeCorrect = true;
		Object.keys(newIssue).forEach((key) => {
			if (issueAttributes.includes(key)) {
				if (fieldTypes[key] && newIssue[key] && Object.prototype.toString.call(newIssue[key]) !== fieldTypes[key]) {
					systemLogger.error(`Type check failed: ${key} is expected to be type ${fieldTypes[key]} but it is `, Object.prototype.toString.call(newIssue[key]));
					typeCorrect = false;
				}
			} else {
				delete newIssue[key];
			}
		});

		if (typeCorrect) {
			return ModelSetting.findById(dbCol, dbCol.model).then((settings) => {
				return db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
					return _dbCol.insert(newIssue).then(() => {
						if (!newIssue.typePrefix) {
							newIssue.typePrefix = (settings.type) ? settings.type : "";
						}

						if (!newIssue.modelCode) {
							// FIXME: I don't understand why we write model code into issues - CF
							newIssue.modelCode = (settings.properties && settings.properties.code) ?
								settings.properties.code : "";
						}

						newIssue = clean(dbCol, newIssue);
						ChatEvent.newIssues(sessionId, dbCol.account, dbCol.model, [newIssue]);

						return Promise.resolve(newIssue);
					});
				});
			});
		} else {
			return Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}
	});
};

issue.updateFromBCF = function(dbCol, issueToUpdate, changeSet) {
	return db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
		return _dbCol.update({_id: utils.stringToUUID(issueToUpdate._id)}, {$set: changeSet}).then(() => {
			const sessionId = issueToUpdate.sessionId;
			const updatedIssue = clean(dbCol, issueToUpdate);
			ChatEvent.issueChanged(sessionId, dbCol.account, dbCol.model, updatedIssue._id, updatedIssue);
			return updatedIssue;
		});
	});
};

issue.update = async function(dbCol, issueId, data) {
	// 1. Get old issue
	const sessionId = data.sessionId;
	const _id = utils.stringToUUID(issueId);
	const user = data.requester;
	let oldIssue = await this.findByUID(dbCol, _id, {}, true);
	if (!oldIssue) {
		throw { resCode: responseCodes.ISSUE_NOT_FOUND };
	}

	// 2. Get user permissions
	const dbUser = await User.findByUserName(dbCol.account);
	const job = (await Job.findByUser(dbCol.account, data.requester) || {})._id;
	const accountPerm = dbUser.customData.permissions.findByUser(data.requester);
	const projAdmin = await Project.isProjectAdmin(
		dbCol.account,
		dbCol.model,
		data.requester
	);

	const tsAdmin = accountPerm && accountPerm.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
	const isAdmin = projAdmin || tsAdmin;
	const hasOwnerJob = oldIssue.creator_role === job;
	const hasAdminPrivileges = isAdmin || hasOwnerJob;
	const hasAssignedJob = job === oldIssue.assigned_roles[0];
	const userPermissions = { hasAdminPrivileges,	hasAssignedJob };

	// 2.5 if the user dont have the necessary permissions to update the issue throw a ISSUE_UPDATE_PERMISSION_DECLINED
	if (ownerPrivilegeAttributes.some(attr => !!data[attr]) && !userPermissions.hasAdminPrivileges) {
		throw responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED;
	}

	// 2.6 if the user is trying to change the status and it doesnt have the necessary permissions throw a ISSUE_UPDATE_PERMISSION_DECLINED
	if (data.status && data.status !== oldIssue.status) {
		const canChangeStatus = userPermissions.hasAdminPrivileges || (userPermissions.hasAssignedJob && data.status !== statusEnum.CLOSED);
		if (!canChangeStatus) {
			throw responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED;
		}
	}

	// 3. Filter out blacklisted attributes and leave proper attrs
	data = _.omit(data, attributeBlacklist);
	data = _.pick(data, Object.keys(fieldTypes));

	if (_.isEmpty(data)) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const today = (new Date()).getTime();
	let systemStatusChanged = false;

	// 4. Prepare side updates
	// 4.1 If there is an issue Assigment and the status is "for_approval" change it to "in_progress"
	if (this.isIssueAssignment(oldIssue, data) && oldIssue.status === statusEnum.FOR_APPROVAL) {
		data.status = statusEnum.IN_PROGRESS;
		systemStatusChanged = true;
	}

	// 5. Add system comments
	const systemComments = [];
	const fields = Object.keys(data);

	fields.forEach(field=> {
		if (Object.prototype.toString.call(data[field]) !== fieldTypes[field]) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		// if a field have the same value shouldnt update the property
		if (_.isEqual(field[field], data[field])) {
			delete data[field];
			return;
		}

		// update of extras must not create a system comment
		if(field === "extras") {
			return;
		}

		// if it is an automatic status change shouldnt add a system comment.
		if(field === "status" && systemStatusChanged) {
			return;
		}

		const comment =  addSystemComment(
			dbCol.account,
			dbCol.model,
			sessionId,
			issueId,
			user,
			field,
			oldIssue[field],
			data[field]);

		systemComments.push(comment);
	});

	if (systemComments.length > 0) {
		data.comments = (oldIssue.comments || []).map(c=> ({...c,sealed:true}));
		data.comments = data.comments.concat(systemComments);
	}

	// 4.2 If there is a priority change , save the extra field priority_last_changed with todays timestamp
	if (this.isPriorityChange(oldIssue, data)) {
		data.priority_last_changed = today;
	}

	// 4.3 If there is a status change, save the extra field status_last_changed with todays timestamp
	if (this.isStatusChange(oldIssue, data)) {
		data.status_last_changed = today;
	}

	// 4.4 If the status is changed to for_approval, the assigned role goes to the creator_role
	if (data.status === statusEnum.FOR_APPROVAL) {
		data.assigned_roles = oldIssue.creator_role ? [oldIssue.creator_role] : [];
	}

	// 6. Update the data
	const issues = await db.getCollection(dbCol.account, dbCol.model + ".issues");
	await issues.update({_id}, {$set: data});

	// 7. Return the updated data and the old issue
	oldIssue = clean(dbCol, oldIssue);
	const newIssue = {...oldIssue, ...data};
	ChatEvent.issueChanged(sessionId, dbCol.account, dbCol.model, newIssue._id, newIssue);

	return {oldIssue, newIssue};
};

issue.getIssuesReport = function(account, model, username, rid, issueIds, res) {
	const dbCol = { account, model };

	const projection = {
		extras: 0,
		"viewpoints.extras": 0,
		"viewpoints.scribble": 0,
		"viewpoints.screenshot.content": 0,
		"viewpoints.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	const branch = rid ? null : "master";

	const reportGen = require("../models/report").newIssuesReport(account, model, rid);
	return issue.findIssuesByModelName(dbCol, username, branch, rid, projection, issueIds, false).then(issues => {
		reportGen.addEntries(issues);
		return reportGen.generateReport(res);
	});
};

issue.getIssuesList = function(dbCol, username, branch, revision, ids, sort, convertCoords) {

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
		dbCol,
		username,
		branch,
		revision,
		projection,
		ids,
		false
	).then((issues) => {
		if (convertCoords) {
			issues.forEach((x) => toDirectXCoords(x));
		}
		return issues;
	});
};

issue.findIssuesByModelName = function(dbCol, username, branch, revId, projection, ids, noClean = false) {
	const account = dbCol.account;
	const model = dbCol.model;

	const filter = {};
	let historySearch = Promise.resolve();

	if (ids) {
		ids.forEach((id, i) => {
			ids[i] = utils.stringToUUID(id);
		});
		filter._id = {"$in": ids};
	}

	if (branch || revId) {
		historySearch = History.getHistory({account, model}, branch, revId).then((history) => {
			if (history) {
				return History.find(dbCol, {timestamp: {"$gt": history.timestamp}}, {_id: 1, current: 1})
					.then((revIds) => {
						revIds = revIds.map(r => r._id);

						return {current: history.current, revIds};
					});
			}
		});
	}

	return historySearch.then((historySearchResults) => {
		if (historySearchResults) {
			return ModelSetting.findById(dbCol, dbCol.model).then((settings) => {
				// Only retrieve issues for current and older revisions
				filter.rev_id = {"$not" : {"$in": historySearchResults.revIds}};

				return db.getCollection(account, model + ".issues").then((_dbCol) => {
					// Retrieve issues from top level model/federation
					return _dbCol.find(filter, projection).toArray();
				}).then((mainIssues) => {
					mainIssues.forEach((mainIssue) => {
						mainIssue.typePrefix = (settings.type) ? settings.type : "";
						mainIssue.modelCode = (settings.properties && settings.properties.code) ?
							settings.properties.code : "";
					});

					// Check submodels
					return Ref.find(dbCol, {type: "ref", _id: {"$in": historySearchResults.current}}).then((refs) => {
						const subModelsPromises = [];

						refs.forEach((ref) => {
							const subDbCol = {
								account: dbCol.account,
								model: ref.project
							};
							subModelsPromises.push(
								this.findIssuesByModelName(subDbCol, username, "master", null, projection, ids, true).then((subIssues) => {
									subIssues.forEach((subIssue) => {
										subIssue.origin_account = subDbCol.account;
										subIssue.origin_model = subDbCol.model;
									});

									return subIssues;
								}).catch((err) => {
									// Skip sub-model errors to allow working sub-models to load
									systemLogger.logError("Error while retrieving sub-model issues",
										{
											subDbCol,
											err: err
										});
								})
							);
						});

						return Promise.all(subModelsPromises).then((subModelsIssues) => {
							if (subModelsIssues) {
								subModelsIssues.forEach((subModelIssues) => {
									if (subModelIssues) {
										// Skip concat of undefined subModelIssues
										//  e.g. from error loading sub-model issue
										mainIssues = mainIssues.concat(subModelIssues);
									}
								});
							}
							if (!noClean) {
								mainIssues = mainIssues.map(x => clean(dbCol, x));
							}

							return mainIssues;
						});
					});
				});
			});
		} else {
			return Promise.resolve([]);
		}
	});
};

issue.findByUID = async function(dbCol, uid, projection, noClean = false) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return ModelSetting.findById(dbCol, dbCol.model).then((settings) => {
		return db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
			return _dbCol.findOne({ _id: uid }, projection).then((foundIssue) => {

				if (!foundIssue) {
					return Promise.reject(responseCodes.ISSUE_NOT_FOUND);
				}

				if (!foundIssue.typePrefix) {
					foundIssue.typePrefix = (settings.type) ? settings.type : "";
				}

				if (!foundIssue.modelCode) {
					foundIssue.modelCode = (settings.properties && settings.properties.code) ?
						settings.properties.code : "";
				}

				if (!noClean) {
					foundIssue = clean(dbCol, foundIssue);
				}

				return foundIssue;
			});
		});
	});
};

issue.getScreenshot = function(dbCol, uid, vid) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	if ("[object String]" === Object.prototype.toString.call(vid)) {
		vid = utils.stringToUUID(vid);
	}

	return this.findByUID(dbCol, uid, { viewpoints: { $elemMatch: { guid: vid } },
		"viewpoints.screenshot.resizedContent": 0
	}, true).then((foundIssue) => {
		if (!_.get(foundIssue, "viewpoints[0].screenshot.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return foundIssue.viewpoints[0].screenshot.content.buffer;
		}
	});
};

issue.getSmallScreenshot = function(dbCol, uid, vid) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	if ("[object String]" === Object.prototype.toString.call(vid)) {
		vid = utils.stringToUUID(vid);
	}

	return this.findByUID(dbCol, uid, { viewpoints: { $elemMatch: { guid: vid } } }, true)
		.then((foundIssue) => {
			if (_.get(foundIssue, "viewpoints[0].screenshot.resizedContent.buffer")) {
				return foundIssue.viewpoints[0].screenshot.resizedContent.buffer;
			} else if (!_.get(foundIssue, "viewpoints[0].screenshot.content.buffer")) {
				return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
			} else {
				return utils.resizeAndCropScreenshot(foundIssue.viewpoints[0].screenshot.content.buffer, 365)
					.then((resized) => {
						db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
							_dbCol.update({
								_id: uid,
								"viewpoints.guid": vid
							},{
								$set: {"viewpoints.$.screenshot.resizedContent": resized}
							}).catch((err) => {
								systemLogger.logError("Error while saving resized screenshot",
									{
										issueId: utils.uuidToString(uid),
										viewpointId: utils.uuidToString(vid),
										err: err
									});
							});
						});

						return resized;
					});
			}
		});
};

issue.getThumbnail = function(dbCol, uid) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return this.findByUID(dbCol, uid, { thumbnail: 1 }, true).then((foundIssue) => {
		if (!_.get(foundIssue, "thumbnail.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return foundIssue.thumbnail.content.buffer;
		}
	});
};

issue.addComment = async function(account, model, issueId, user, data) {
	if (!data.comment || !data.comment.trim()) {
		throw { resCode: responseCodes.ISSUE_COMMENT_NO_TEXT};
	}

	// 1. Fetch comments
	const _id = utils.stringToUUID(issueId) ;
	const issues = await db.getCollection(account, model + ".issues");
	const issuesRes = await issues.find({ _id }, {comments: 1}).toArray();
	if (issuesRes.length === 0) {
		throw { resCode: responseCodes.ISSUE_NOT_FOUND };
	}

	// 2. Seal every comment
	const comments = issuesRes[0].comments || [];
	comments.forEach(c => c.sealed = true);

	// 3. Create the comment
	let viewpoint = null;

	if (data.viewpoint) {
		viewpoint = await View.clean({account, model}, data.viewpoint, fieldTypes.viewpoint);
		viewpoint.guid = utils.generateUUID();
	}

	const comment = Comment.newTextComment(user, data.comment, viewpoint);

	// 4. Append the new comment
	comments.push(comment);

	// 5. Update the issue.
	const viewpointPush =  viewpoint ? {$push: { viewpoints: viewpoint }} : {};

	await issues.update({ _id }, {...viewpointPush ,$set : {comments}});

	// 6. Return the new comment.
	return {...comment, viewpoint, guid: utils.uuidToString(comment.guid)};
};

issue.deleteComment = async function(account, model, issueID, guid, user) {
	// 1. Fetch comments
	const _id = utils.stringToUUID(issueID) ;
	const issues = await db.getCollection(account, model + ".issues");
	const issuesRes = await issues.find({ _id }, {comments: 1}).toArray();

	if (issuesRes.length === 0) {
		throw { resCode: responseCodes.ISSUE_NOT_FOUND };
	}

	let comments = issuesRes[0].comments;
	const count = comments.length;
	// 3. Filter out the particular comment
	comments = comments.filter(c => {
		if(utils.uuidToString(c.guid) !== guid) {
			return true;
		}

		if (c.sealed) {
			throw { resCode: responseCodes.ISSUE_COMMENT_SEALED};
		}

		if (c.owner !== user) {
			throw { resCode: responseCodes.NOT_AUTHORIZED};
		}

		return false;
	});

	if(count === comments.length) {
		throw { resCode: responseCodes.ISSUE_COMMENT_INVALID_GUID};
	}

	// 4. Update the issue;
	await issues.update({ _id }, {$set : {comments}});

	// 5. Return which comment was deleted
	return {guid};
};

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

module.exports = issue;
