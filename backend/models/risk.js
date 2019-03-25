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

const risk = {};

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
	"norm": "[object Array]",
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

function clean(dbCol, riskToClean) {
	const idKeys = ["_id", "rev_id", "parent"];
	const commentIdKeys = ["rev_id", "guid", "viewpoint"];
	const vpIdKeys = ["hidden_group_id", "highlighted_group_id", "shown_group_id", "guid"];

	riskToClean.account = dbCol.account;
	riskToClean.model = (riskToClean.origin_model) ? riskToClean.origin_model : dbCol.model;

	idKeys.concat(vpIdKeys).forEach((key) => {
		if (riskToClean[key]) {
			riskToClean[key] = utils.uuidToString(riskToClean[key]);
		}
	});

	if (riskToClean.viewpoints) {
		riskToClean.viewpoints.forEach((viewpoint, i) => {
			vpIdKeys.forEach((key) => {
				if (riskToClean.viewpoints[i] && riskToClean.viewpoints[i][key]) {
					riskToClean.viewpoints[i][key] = utils.uuidToString(riskToClean.viewpoints[i][key]);
				} else {
					delete riskToClean.viewpoints[i][key];
				}
			});

			if (riskToClean.viewpoints[i].screenshot) {
				riskToClean.viewpoints[i].screenshot = riskToClean.account + "/" + riskToClean.model + "/risks/" + riskToClean._id + "/viewpoints/" + riskToClean.viewpoints[i].guid + "/screenshot.png";
				riskToClean.viewpoints[i].screenshotSmall = riskToClean.account + "/" + riskToClean.model + "/risks/" + riskToClean._id + "/viewpoints/" + riskToClean.viewpoints[i].guid + "/screenshotSmall.png";
			}

			if (0 === i) {
				riskToClean.viewpoint = riskToClean.viewpoints[i];
			}
		});
	}

	if (riskToClean.comments) {
		riskToClean.comments.forEach((comment, i) => {
			commentIdKeys.forEach((key) => {
				if (riskToClean.comments[i] && riskToClean.comments[i][key]) {
					riskToClean.comments[i][key] = utils.uuidToString(riskToClean.comments[i][key]);
				}
			});

			if (riskToClean.comments[i].viewpoint) {
				const commentViewpoint = riskToClean.viewpoints.find((vp) =>
					vp.guid === riskToClean.comments[i].viewpoint
				);

				if (commentViewpoint) {
					riskToClean.comments[i].viewpoint = commentViewpoint;
				}
			}
		});
	}

	if (riskToClean.thumbnail && riskToClean.thumbnail.flag) {
		riskToClean.thumbnail = riskToClean.account + "/" + riskToClean.model + "/risks/" + riskToClean._id + "/thumbnail.png";
	}

	riskToClean.level_of_risk = calculateLevelOfRisk(riskToClean.likelihood, riskToClean.consequence);
	riskToClean.residual_level_of_risk = calculateLevelOfRisk(riskToClean.residual_likelihood, riskToClean.residual_consequence);

	if (0 <= riskToClean.residual_level_of_risk) {
		riskToClean.overall_level_of_risk = riskToClean.residual_level_of_risk;
	} else {
		riskToClean.overall_level_of_risk = riskToClean.level_of_risk;
	}

	delete riskToClean.viewpoints;

	return riskToClean;
}

function toDirectXCoords(entry) {
	const fieldsToConvert = ["position", "norm"];
	const vpFieldsToConvert = ["right", "view_dir", "look_at", "position", "up"];

	fieldsToConvert.forEach((rootKey) => {
		if (entry[rootKey]) {
			entry[rootKey] = utils.webGLtoDirectX(entry[rootKey]);
		}
	});

	const viewpoint = entry.viewpoint;
	vpFieldsToConvert.forEach((key) => {
		if (viewpoint[key]) {
			viewpoint[key] = utils.webGLtoDirectX(viewpoint[key]);
		}
	});

	const clippingPlanes = viewpoint.clippingPlanes;
	if(clippingPlanes) {
		for (const item in clippingPlanes) {
			clippingPlanes[item].normal = utils.webGLtoDirectX(clippingPlanes[item].normal);
		}
	}

	return viewpoint;
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
			data.revId,
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

function updateTextComments(account, model, sessionId, riskId, comments, data, viewpoint) {
	if (!comments) {
		comments = [];
	}

	if (data.edit && data.commentIndex >= 0 && comments.length > data.commentIndex) {
		if (!comments[data.commentIndex].sealed) {
			const textComment = Comment.newTextComment(data.owner, data.revId, data.comment, viewpoint, data.position);

			comments[data.commentIndex] = textComment;

			ChatEvent.commentChanged(sessionId, account, model, riskId, data);
		} else {
			throw responseCodes.ISSUE_COMMENT_SEALED;
		}
	} else if (data.sealed && data.commentIndex >= 0 && comments.length > data.commentIndex) {
		comments[data.commentIndex].sealed = true;
	} else if (data.delete && data.commentIndex >= 0 && comments.length > data.commentIndex) {
		if (!comments[data.commentIndex].sealed) {
			comments.splice(data.commentIndex, 1);

			ChatEvent.commentDeleted(sessionId, account, model, riskId, data);
		} else {
			throw responseCodes.ISSUE_COMMENT_SEALED;
		}
	} else if ((data.edit || data.delete) && comments.length <= data.commentIndex) {
		throw responseCodes.ISSUE_COMMENT_INVALID_INDEX;
	} else {
		comments.forEach((comment) => {
			comment.sealed = true;
		});

		const textComment = Comment.newTextComment(data.owner, data.revId, data.comment, viewpoint, data.position);

		comments.push(textComment);

		ChatEvent.newComment(sessionId, account, model, riskId, textComment);
	}

	return comments;
}

function addSystemComment(account, model, sessionId, riskId, comments, owner, property, oldValue, newValue) {
	if (!comments) {
		comments = [];
	}

	comments.forEach((comment) => {
		comment.sealed = true;
	});

	const systemComment = Comment.newSystemComment(
		owner,
		property,
		oldValue,
		newValue
	);

	comments.push(systemComment);

	ChatEvent.newComment(sessionId, account, model, riskId, systemComment);

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

risk.setGroupRiskId = function(dbCol, data, riskId) {

	const updateGroup = function(group_id) {
		// TODO - Do we need to find group first? Can we just patch?
		return Group.findByUID(dbCol, utils.uuidToString(group_id), null, utils.uuidToString(data.rev_id)).then((group) => {
			const riskIdData = {
				risk_id: riskId
			};

			return group.updateAttrs(dbCol, riskIdData);
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

risk.createRisk = function(dbCol, newRisk) {
	const sessionId = newRisk.sessionId;
	const attributeBlacklist = [
		"viewpoint"
	];
	const riskAttributes = Object.keys(fieldTypes).filter(attr => !attributeBlacklist.includes(attr));
	const riskAttrPromises = [];

	let branch;

	if (!newRisk.name) {
		return Promise.reject({ resCode: responseCodes.RISK_NO_NAME });
	}

	newRisk._id = utils.stringToUUID(uuid.v1());
	newRisk.created = (new Date()).getTime();

	if (!newRisk.desc || newRisk.desc === "") {
		newRisk.desc = "(No Description)"; // TODO do we really want this stored?
	}

	// TODO do we want revId like this?
	if (!newRisk.revId) {
		branch = "master";
	}

	// Assign rev_id for risk
	riskAttrPromises.push(
		History.getHistory(dbCol, branch, newRisk.revId, { _id: 1 }).then((history) => {
			if (!history && newRisk.revId) {
				return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
			} else if (history) {
				newRisk.rev_id = history._id;
			}
		})
	);

	return Promise.all(riskAttrPromises).then(() => {

		if (newRisk.likelihood && isNaN(parseInt(newRisk.likelihood))) {
			return Promise.reject(responseCodes.RISK_LIKELIHOOD_INVALID);
		}

		if (newRisk.consequence && isNaN(parseInt(newRisk.consequence))) {
			return Promise.reject(responseCodes.RISK_CONSEQUENCE_INVALID);
		}

		if (newRisk.viewpoint) {
			newRisk.viewpoint.guid = utils.generateUUID();

			if (newRisk.viewpoint.highlighted_group_id) {
				newRisk.viewpoint.highlighted_group_id = utils.stringToUUID(newRisk.viewpoint.highlighted_group_id);
			}

			if (newRisk.viewpoint.hidden_group_id) {
				newRisk.viewpoint.hidden_group_id = utils.stringToUUID(newRisk.viewpoint.hidden_group_id);
			}

			if (newRisk.viewpoint.shown_group_id) {
				newRisk.viewpoint.shown_group_id = utils.stringToUUID(newRisk.viewpoint.shown_group_id);
			}

			if (newRisk.viewpoint.screenshot) {
				newRisk.viewpoint.screenshot = utils.createScreenshotEntry(newRisk.viewpoint.screenshot);

				return utils.resizeAndCropScreenshot(newRisk.viewpoint.screenshot.content, 120, 120, true).catch((err) => {
					systemLogger.logError("Resize failed as screenshot is not a valid png, no thumbnail will be generated", {
						account: dbCol.account,
						model: dbCol.model,
						riskId: utils.uuidToString(newRisk._id),
						viewpointId: utils.uuidToString(newRisk.viewpoint.guid),
						err
					});
				});
			}
		}

		return Promise.resolve();
	}).then((image) => {
		if (image) {
			newRisk.thumbnail = {
				flag: 1,
				content: image
			};
		}

		return this.setGroupRiskId(dbCol, newRisk, newRisk._id);
	}).then(() => {
		newRisk.viewpoints = [newRisk.viewpoint];

		let typeCorrect = true;
		Object.keys(newRisk).forEach((key) => {
			if (riskAttributes.includes(key)) {
				if (fieldTypes[key] && newRisk[key] && Object.prototype.toString.call(newRisk[key]) !== fieldTypes[key]) {
					typeCorrect = false;
				}
			} else {
				delete newRisk[key];
			}
		});

		if (typeCorrect) {
			return db.getCollection(dbCol.account, dbCol.model + ".risks").then((_dbCol) => {
				return _dbCol.insert(newRisk).then(() => {
					newRisk = clean(dbCol, newRisk);
					ChatEvent.newRisks(sessionId, dbCol.account, dbCol.model, [newRisk]);

					return Promise.resolve(newRisk);
				});
			});
		} else {
			return Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}
	});
};

risk.updateAttrs = function(dbCol, uid, data) {

	const sessionId = data.sessionId;

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return this.findByUID(dbCol, uid, {}, true).then((oldRisk) => {
		if (oldRisk) {
			let typeCorrect = true;

			let newRisk = _.cloneDeep(oldRisk);

			const userPermissionsPromise = User.findByUserName(dbCol.account).then((dbUser) => {

				return Job.findByUser(dbUser.user, data.requester).then((_job) => {
					const job = _job ?  _job._id : null;
					const accountPerm = dbUser.customData.permissions.findByUser(data.requester);
					const userIsAdmin = Project.isProjectAdmin(
						dbCol.account,
						dbCol.model,
						data.requester
					);

					return userIsAdmin.then(projAdmin => {

						const tsAdmin = accountPerm && accountPerm.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
						const isAdmin = projAdmin || tsAdmin;
						const hasOwnerJob = oldRisk.creator_role === job;
						const hasAssignedJob = job === oldRisk.assigned_roles[0];

						return {
							isAdmin,
							hasOwnerJob,
							hasAssignedJob
						};

					});
				});
			});

			let newViewpointPromise;

			if (data["viewpoint"]) {
				if (Object.prototype.toString.call(data["viewpoint"]) === fieldTypes["viewpoint"]) {
					data.viewpoint.guid = utils.generateUUID();

					newViewpointPromise = View.clean(dbCol, data["viewpoint"], fieldTypes["viewpoint"]);
				} else {
					typeCorrect = false;
				}
			}

			return Promise.all([userPermissionsPromise, newViewpointPromise]).then(([user, newViewpoint]) => {
				const toUpdate = {};
				const attributeBlacklist = [
					"_id",
					"comments",
					"created",
					"creator_role",
					"name",
					"norm",
					"number",
					"owner",
					"position",
					"rev_id",
					"status",
					"thumbnail",
					"viewpoint",
					"viewpoints"
				];
				const ownerPrivilegeAttributes = [];
				const fieldsCanBeUpdated = Object.keys(fieldTypes).filter(attr => !attributeBlacklist.includes(attr));

				if (newViewpoint) {
					if (!newRisk["viewpoints"]) {
						newRisk.viewpoints = [];
					}

					toUpdate.viewpoints = newRisk.viewpoints.concat();

					toUpdate.viewpoints.push(newViewpoint);
					newRisk.viewpoints.push(newViewpoint);
				}

				fieldsCanBeUpdated.forEach((key) => {
					if (data[key] !== undefined &&
						(("[object Object]" !== fieldTypes[key] && "[object Array]" !== fieldTypes[key] && data[key] !== newRisk[key])
						|| !_.isEqual(newRisk[key], data[key]))) {
						if (null === data[key] || Object.prototype.toString.call(data[key]) === fieldTypes[key]) {
							if ("comment" === key || "commentIndex" === key) {
								if ("commentIndex" !== key || -1 === Object.keys(data).indexOf("comment")) {
									const updatedComments = updateTextComments(
										dbCol.account,
										dbCol.model,
										data.sessionId,
										newRisk._id,
										newRisk.comments,
										data,
										newViewpoint
									);

									toUpdate.comments = updatedComments;
									newRisk.comments = updatedComments;
								}
							} else if ("residual" === key) {
								const updatedComments = addRiskMitigationComment(
									dbCol.account,
									dbCol.model,
									data.sessionId,
									newRisk._id,
									newRisk.comments,
									data,
									newViewpoint
								);

								toUpdate.comments = updatedComments;
								newRisk.comments = updatedComments;
							} else {
								if (-1 === ownerPrivilegeAttributes.indexOf(key) || (user.isAdmin || user.hasOwnerJob)) {
									const updatedComments = addSystemComment(
										dbCol.account,
										dbCol.model,
										data.sessionId,
										newRisk._id,
										newRisk.comments,
										data.owner,
										key,
										newRisk[key],
										data[key]
									);

									toUpdate.comments = updatedComments;
									newRisk.comments = updatedComments;

									toUpdate[key] = data[key];
									newRisk[key] = data[key];
								} else {
									return Promise.reject(responseCodes.RISK_UPDATE_PERMISSION_DECLINED);
								}
							}
						} else {
							typeCorrect = false;
						}
					}
				});

				if (!typeCorrect) {
					return Promise.reject(responseCodes.INVALID_ARGUMENTS);
				} else if (0 === Object.keys(toUpdate).length) {
					return (data.comment) ?
						Promise.resolve(data) :
						Promise.resolve(oldRisk);
				} else {
					return db.getCollection(dbCol.account, dbCol.model + ".risks").then((_dbCol) => {
						return _dbCol.update({_id: uid}, {$set: toUpdate}).then(() => {
							newRisk = clean(dbCol, newRisk);

							if (data.comment) {
								if (!data.edit && !data.delete &&
									newRisk.comments && newRisk.comments.length > 0) {
									return newRisk.comments[newRisk.comments.length - 1];
								}

								return data;
							} else {
								ChatEvent.riskChanged(sessionId, dbCol.account, dbCol.model, newRisk);
								return newRisk;
							}
						});
					});
				}
			}).catch((err) => {
				if (err) {
					return Promise.reject(err);
				} else {
					return Promise.reject(responseCodes.RISK_UPDATE_FAILED);
				}
			});
		} else {
			return Promise.reject({ resCode: responseCodes.RISK_NOT_FOUND });
		}
	});
};

risk.deleteRisks = function(dbCol, sessionId, ids) {
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
};

risk.getRisksReport = function(account, model, username, rid, ids, res) {
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

	const reportGen = require("../models/report").newRisksReport(account, model, rid);
	return risk.findRisksByModelName(dbCol, username, branch, rid, projection, ids, false).then(risks => {
		reportGen.addEntries(risks);
		return reportGen.generateReport(res);
	});
};

risk.getRisksList = function(dbColOptions, user, branch, revision, ids, convertCoords) {
	const projection = {
		extras: 0,
		"comments": 0,
		"viewpoints.extras": 0,
		"viewpoints.scribble": 0,
		"viewpoints.screenshot.content": 0,
		"viewpoints.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	return risk.findRisksByModelName(
		dbColOptions,
		user,
		branch,
		revision,
		projection,
		ids,
		false
	).then((risks) => {
		if (convertCoords) {
			risks.forEach((entry) => toDirectXCoords(entry));
		}
		return risks;
	});
};

risk.findRisksByModelName = function(dbCol, username, branch, revId, projection, ids, noClean = false) {
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
			// Only retrieve risks for current and older revisions
			filter.rev_id = {"$not" : {"$in": historySearchResults.revIds}};

			return db.getCollection(account, model + ".risks").then((_dbCol) => {
				// Retrieve risks from top level model/federation
				return _dbCol.find(filter, projection).toArray();
			}).then((mainRisks) => {
				mainRisks.forEach((mainRisk) => {
					mainRisk.typePrefix = (settings.type) ? settings.type : "";
					mainRisk.modelCode = (settings.properties && settings.properties.code) ?
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
							this.findRisksByModelName(subDbCol, username, "master", null, projection, null, true).then((subRisks) => {
								subRisks.forEach((subRisk) => {
									subRisk.origin_account = subDbCol.account;
									subRisk.origin_model = subDbCol.model;
								});

								return subRisks;
							}).catch((err) => {
								// Skip sub-model errors to allow working sub-models to load
								systemLogger.logError("Error while retrieving sub-model risks",
									{
										subDbCol,
										err: err
									});
							})
						);
					});

					return Promise.all(subModelsPromises).then((subModelsRisks) => {
						if (subModelsRisks) {
							subModelsRisks.forEach((subModelRisks) => {
								if (subModelRisks) {
									// Skip concat of undefined subModelRisks
									//  e.g. from error loading sub-model risk
									mainRisks = mainRisks.concat(subModelRisks);
								}
							});
						}
						if (!noClean) {
							mainRisks = mainRisks.map(r => clean(dbCol, r));
						}

						return mainRisks;
					});
				});
			});
		});
	});
};

risk.findByUID = function(dbCol, uid, projection, noClean = false) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return db.getCollection(dbCol.account, dbCol.model + ".risks").then((_dbCol) => {
		return _dbCol.findOne({ _id: uid }, projection).then((foundRisk) => {

			if (!foundRisk) {
				return Promise.reject(responseCodes.RISK_NOT_FOUND);
			}

			if (!noClean) {
				foundRisk = clean(dbCol, foundRisk);
			}

			return foundRisk;
		});
	});
};

risk.getScreenshot = function(dbCol, uid, vid) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	if ("[object String]" === Object.prototype.toString.call(vid)) {
		vid = utils.stringToUUID(vid);
	}

	return this.findByUID(dbCol, uid, { viewpoints: { $elemMatch: { guid: vid } },
		"viewpoints.screenshot.resizedContent": 0
	}, true).then((foundRisk) => {
		if (!_.get(foundRisk, "viewpoints[0].screenshot.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return foundRisk.viewpoints[0].screenshot.content.buffer;
		}
	});
};

risk.getSmallScreenshot = function(dbCol, uid, vid) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	if ("[object String]" === Object.prototype.toString.call(vid)) {
		vid = utils.stringToUUID(vid);
	}

	return this.findByUID(dbCol, uid, { viewpoints: { $elemMatch: { guid: vid } } }, true)
		.then((foundRisk) => {
			if (_.get(foundRisk, "viewpoints[0].screenshot.resizedContent.buffer")) {
				return foundRisk.viewpoints[0].screenshot.resizedContent.buffer;
			} else if (!_.get(foundRisk, "viewpoints[0].screenshot.content.buffer")) {
				return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
			} else {
				return utils.resizeAndCropScreenshot(foundRisk.viewpoints[0].screenshot.content.buffer, 365)
					.then((resized) => {
						db.getCollection(dbCol.account, dbCol.model + ".risks").then((_dbCol) => {
							_dbCol.update({
								_id: uid,
								"viewpoints.guid": vid
							},{
								$set: {"viewpoints.$.screenshot.resizedContent": resized}
							}).catch((err) => {
								systemLogger.logError("Error while saving resized screenshot",
									{
										riskId: utils.uuidToString(uid),
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

risk.getThumbnail = function(dbCol, uid) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return this.findByUID(dbCol, uid, { thumbnail: 1 }, true).then((foundRisk) => {
		if (!_.get(foundRisk, "thumbnail.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return foundRisk.thumbnail.content.buffer;
		}
	});
};

module.exports = risk;
