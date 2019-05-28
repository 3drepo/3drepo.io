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
const Group = require("./group");
const User = require("./user");
const Job = require("./job");
const ModelHelper = require("./helper/model");

const C = require("../constants");

const issue = {};

const fieldTypes = {
	"safetibase_id": "[object String]",
	"associated_activity": "[object String]",
	"desc": "[object String]",
	"assigned_roles": "[object Array]",
	"category": "[object String]",
	"comments": "[object Array]",
	"likelihood": "[object Number]",
	"consequence": "[object Number]",
	"level_of_risk": "[object Number]",
	"mitigation_status": "[object String]",
	"mitigation_desc": "[object String]",
	"rev_id": "[object Object]",
	"thumbnail": "[object Object]",
	"creator_role": "[object String]",
	"name": "[object String]",
	"createdAt": "[object Number]",
	"viewpoint": "[object Object]",
	"viewpoints": "[object Array]",
	"position": "[object Array]",
	"norm": "[object Array]"
};

function clean(dbCol, issueToClean) {
	const keys = ["_id", "rev_id", "parent"];
	const commentKeys = ["rev_id", "guid"];
	const vpKeys = ["hidden_group_id", "highlighted_group_id", "shown_group_id", "guid"];

	issueToClean.account = dbCol.account;
	issueToClean.model = (issueToClean.origin_model) ? issueToClean.origin_model : dbCol.model;

	keys.concat(vpKeys).forEach((key) => {
		if (issueToClean[key]) {
			issueToClean[key] = utils.uuidToString(issueToClean[key]);
		}
	});

	if (issueToClean.viewpoint) {
		vpKeys.forEach((key) => {
			if (issueToClean.viewpoint && issueToClean.viewpoint[key]) {
				issueToClean.viewpoint[key] = utils.uuidToString(issueToClean.viewpoint[key]);
			}
		});

		if (issueToClean.viewpoint.screenshot) {
			issueToClean.viewpoint.screenshot = issueToClean.account + "/" + issueToClean.model + "/issues/" + issueToClean._id + "/screenshot.png";
			issueToClean.viewpoint.screenshotSmall = issueToClean.account + "/" + issueToClean.model + "/issues/" + issueToClean._id + "/screenshotSmall.png";
		}
	}

	if (issueToClean.comments) {
		issueToClean.comments.forEach((comment, i) => {
			commentKeys.forEach((key) => {
				if (issueToClean.comments[i] && issueToClean.comments[i][key]) {
					issueToClean.comments[i][key] = utils.uuidToString(issueToClean.comments[i][key]);
				}
			});
		});
	}

	if (issueToClean.thumbnail && issueToClean.thumbnail.flag) {
		issueToClean.thumbnail = issueToClean.account + "/" + issueToClean.model + "/issues/" + issueToClean._id + "/thumbnail.png";
	}

	return issueToClean;
}

function setGroupIssueId(dbCol, data, issueId) {

	const updateGroup = function(group_id) {
		return Group.findByUID(dbCol, utils.uuidToString(group_id), null, utils.uuidToString(data.rev_id)).then((group) => {
			const issueIdData = {
				issue_id: issueId
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
}

issue.createIssue = function(dbCol, newIssue) {
	const sessionId = newIssue.sessionId;
	const issueAttributes = [
		"_id",
		"rev_id",
		"thumbnail",
		"creator_role",
		"name",
		"owner",
		"created",
		"safetibase_id",
		"associated_activity",
		"desc",
		"viewpoint",
		"assigned_roles",
		"category",
		"likelihood",
		"consequence",
		"level_of_risk",
		"mitigation_status",
		"mitigation_desc",
		"position",
		"norm"
	];
	const issueAttrPromises = [];

	let branch;

	if (!newIssue.name) {
		return Promise.reject({ resCode: responseCodes.RISK_NO_NAME });
	}

	newIssue._id = utils.stringToUUID(uuid.v1());
	newIssue.created = (new Date()).getTime();

	if (!newIssue.desc || newIssue.desc === "") {
		newIssue.desc = "(No Description)"; // TODO do we really want this stored?
	}

	if (newIssue.object_id) {
		issueAttrPromises.push(
			GenericObject.getSharedId(dbCol, data.object_id).then((sid) => {
				newIssue.parent = utils.stringToUUID(sid);
			})
		);
		newIssue.object_id = utils.stringToUUID(newIssue.object_id);
	}

	// TODO do we want revId like this?
	if (!newIssue.revId) {
		branch = "master";
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

			if (newIssue.viewpoint.scribble) {
				newIssue.viewpoint.scribble = {
					content: new Buffer.from(newIssue.viewpoint.scribble, "base64"),
					flag: 1
				};
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

		return Promise.resolve();
	}).then((image) => {
		if (image) {
			newIssue.thumbnail = {
				flag: 1,
				content: image
			};
		}

		return setGroupIssueId(dbCol, newIssue, newIssue._id);
	}).then(() => {
		let typeCorrect = true;
		Object.keys(newIssue).forEach((key) => {
			if (issueAttributes.includes(key)) {
				if (fieldTypes[key] && Object.prototype.toString.call(newIssue[key]) !== fieldTypes[key]) {
					typeCorrect = false;
				}
			} else {
				delete newIssue[key];
			}
		});

		if (typeCorrect) {
			return db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
				return _dbCol.insert(newIssue).then(() => {
					newIssue = clean(dbCol, newIssue);
					ChatEvent.newIssues(sessionId, dbCol.account, dbCol.model, [newIssue]);

					return Promise.resolve(newIssue);
				});
			});
		} else {
			return Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}
	});
};

issue.updateAttrs = function(dbCol, uid, data) {

	const sessionId = data.sessionId;

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return this.findByUID(dbCol, uid, {}, true).then((oldIssue) => {
		if (oldIssue) {
			return User.findByUserName(dbCol.account).then((dbUser) => {

				return Job.findByUser(dbUser.user, data.requester).then((_job) => {
					const job = _job ?  _job._id : null;
					const accountPerm = dbUser.customData.permissions.findByUser(data.requester);
					const userIsAdmin = ModelHelper.isUserAdmin(
						dbCol.account,
						dbCol.model,
						data.requester
					);

					return userIsAdmin.then(projAdmin => {

						const tsAdmin = accountPerm && accountPerm.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
						const isAdmin = projAdmin || tsAdmin;
						const hasOwnerJob = oldIssue.creator_role === job;
						const hasAssignedJob = job === oldIssue.assigned_roles[0];

						return {
							isAdmin,
							hasOwnerJob,
							hasAssignedJob
						};

					}).then((user) => {
						if (user.isAdmin || user.hasOwnerJob || user.hasAssignedJob) {
							const toUpdate = {};
							const fieldsCanBeUpdated = [
								"safetibase_id",
								"associated_activity",
								"desc",
								"assigned_roles",
								"category",
								"likelihood",
								"consequence",
								"level_of_risk",
								"mitigation_status",
								"mitigation_desc"
							];

							let typeCorrect = true;
							fieldsCanBeUpdated.forEach((key) => {
								if (data[key] !== undefined) {
									if (Object.prototype.toString.call(data[key]) === fieldTypes[key]) {
										toUpdate[key] = data[key];
										oldIssue[key] = data[key];
									} else {
										typeCorrect = false;
									}
								}
							});

							if (typeCorrect) {
								return db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
									return _dbCol.update({_id: uid}, {$set: toUpdate}).then(() => {
										oldIssue = clean(dbCol, oldIssue);
										ChatEvent.issueChanged(sessionId, dbCol.account, dbCol.model, oldIssue);
										return oldIssue;
									});
								});
							} else {
								return Promise.reject(responseCodes.INVALID_ARGUMENTS);
							}
						} else {
							return Promise.reject(responseCodes.RISK_UPDATE_PERMISSION_DECLINED);
						}
					}).catch((err) => {
						if (err) {
							return Promise.reject(err);
						} else {
							return Promise.reject(responseCodes.RISK_UPDATE_FAILED);
						}
					});

				});
			});
		} else {
			return Promise.reject({ resCode: responseCodes.RISK_NOT_FOUND });
		}
	});
};

issue.getIssuesReport = function(account, model, username, rid, ids, res) {
	const dbCol = { account, model};

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
	return issue.findIssuesByModelName(dbCol, username, branch, rid, projection, ids, false).then(issues => {
		reportGen.addEntries(issues);
		return reportGen.generateReport(res);
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
			if (!history) {
				return Promise.reject(responseCodes.INVALID_TAG_NAME);
			} else {
				return History.find(dbCol, {timestamp: {"$gt": history.timestamp}}, {_id: 1, current: 1})
					.then((revIds) => {
						revIds = revIds.map(r => r._id);

						return {current: history.current, revIds};
					});
			}
		});
	}

	return ModelSetting.findById(dbCol, dbCol.model).then((settings) => {
		return historySearch.then((historySearchResults) => {
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
							this.findIssuesByModelName(subDbCol, username, "master", null, projection, null, true).then((subIssues) => {
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
							mainIssues = mainIssues.map(r => clean(dbCol, r));
						}

						return mainIssues;
					});
				});
			});
		});
	});
};

issue.findByUID = function(dbCol, uid, projection, noClean = false) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
		return _dbCol.findOne({ _id: uid }, projection).then((foundIssue) => {

			if (!foundIssue) {
				return Promise.reject(responseCodes.RISK_NOT_FOUND);
			}

			if (!noClean) {
				foundIssue = clean(dbCol, foundIssue);
			}

			return foundIssue;
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
	}).then((issue) => {
		if (!_.get(issue, "viewpoints[0].screenshot.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return issue.viewpoints[0].screenshot.content.buffer;
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

	return this.findByUID(dbCol, uid, { viewpoints: { $elemMatch: { guid: vid } } })
		.then((issue) => {
			if (_.get(issue, "viewpoints[0].screenshot.resizedContent.buffer")) {
				return issue.viewpoints[0].screenshot.resizedContent.buffer;
			} else if (!_.get(issue, "viewpoints[0].screenshot.content.buffer")) {
				return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
			} else {
				return utils.resizeAndCropScreenshot(issue.viewpoints[0].screenshot.content.buffer, 365)
					.then((resized) => {
						db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
							_dbCol.update({
								_id: uid,
								"viewpoints.guid": vid},
								{$set: {"viewpoints.$.screenshot.resizedContent": resized}}
								).catch((err) => {
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

module.exports = issue;
