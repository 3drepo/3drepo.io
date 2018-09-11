/**
 *	Copyright (C) 2018 3D Repo Ltd
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
const db = require("../db/db");

const ModelFactory = require("./factory/modelFactory");
const ModelSetting = require("./modelSetting");
const stringToUUID = utils.stringToUUID;
const uuidToString = utils.uuidToString;
const History = require("./history");
const Ref = require("./ref");
const GenericObject = require("./base/repo").GenericObject;
const middlewares = require("../middlewares/middlewares");
const _ = require("lodash");

const ChatEvent = require("./chatEvent");

const moment = require("moment");
const archiver = require("archiver");
const yauzl = require("yauzl");
const xml2js = require("xml2js");
const systemLogger = require("../logger.js").systemLogger;
const Group = require("./group");
const Meta = require("./meta");
const User = require("./user");
const Job = require("./job");
const ModelHelper = require("./helper/model");

const C = require("../constants");

const risk = {};

risk.createRisk = function(dbCol, newRisk) {
	const riskAttributes = [
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

	if (newRisk.object_id) {
		riskAttrPromises.push(
			GenericObject.getSharedId(dbCol, data.object_id).then((sid) => {
				newRisk.parent = utils.stringToUUID(sid);
			})
		);
		newRisk.object_id = utils.stringToUUID(newRisk.object_id);
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

			if (newRisk.viewpoint.scribble) {
				newRisk.viewpoint.scribble = {
					content: new Buffer.from(newRisk.viewpoint.scribble, "base64"),
					flag: 1
				};
			}

			if (newRisk.viewpoint.screenshot) {
				newRisk.viewpoint.screenshot = {
					content: new Buffer.from(newRisk.viewpoint.screenshot, "base64"),
					flag: 1
				};

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

		Object.keys(newRisk).forEach((key) => {
			if (!riskAttributes.includes(key)) {
				delete newRisk[key];
			}
		});

		return db.getCollection(dbCol.account, dbCol.model + ".risks").then((_dbCol) => {
			return _dbCol.insert(newRisk).then(() => {
				return Promise.resolve(newRisk);
			})
		});
	});
};

risk.updateAttrs = function(dbCol, uid, data) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return this.findByUID(dbCol, uid).then((oldRisk) => {
		if (oldRisk) {
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
						const hasOwnerJob = oldRisk.creator_role === job && oldRisk.creator_role && job;
						const hasAssignedJob = job === oldRisk.assigned_roles[0];

						return {
							isAdmin,
							hasOwnerJob,
							hasAssignedJob
						};

					}).then((user) => {
						console.log(user.isAdmin);
						console.log(user.hasOwnerJob);
						console.log(user.hasAssignedJob);
						return oldRisk;
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

risk.findBySharedId = function() {
};

risk.findRisksByModelName = function(dbCol, username, branch, revId, projection, ids) {
	const account = dbCol.account;
	const model = dbCol.model;

	let filter = {};
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
				return History.find(dbCol, {timestamp: {"$lte": history.timestamp}}, {_id: 1, current: 1})
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
			filter.rev_id = {"$in": historySearchResults.revIds};

			return db.getCollection(account, model + ".risks").then((_dbCol) => {
				// Retrieve risks from top level model/federation
				return _dbCol.find(filter, projection).toArray();
			}).then((mainRisks) => {
				mainRisks.forEach((risk) => {
					risk.typePrefix = (settings.type) ? settings.type : "";
					risk.modelCode = (settings.properties && settings.properties.code) ?
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
							this.findRisksByModelName(subDbCol, username, "master", null, projection).then((risks) => {
								risks.forEach((risk) => {
									risk.origin_account = subDbCol.account;
									risk.origin_model = subDbCol.model;
								});

								return risks;
							})
						);
					});

					return Promise.all(subModelsPromises).then((subModelsRisks) => {
						if (subModelsRisks) {
							subModelsRisks.forEach((subModelRisks) => {
								mainRisks = mainRisks.concat(subModelRisks);
							});
						}
						return mainRisks;
					});
				});
			});
		});
	});
};

risk.findByUID = function(dbCol, uid, projection) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return db.getCollection(dbCol.account, dbCol.model + ".risks").then((_dbCol) => {
		return _dbCol.findOne({ _id: uid }, projection).then((risk) => {

			if (!risk) {
				return Promise.reject(responseCodes.RISK_NOT_FOUND);
			}

			return risk;
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
	}).then((risk) => {
		if (!_.get(risk, "viewpoints[0].screenshot.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return risk.viewpoints[0].screenshot.content.buffer;
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

	return this.findByUID(dbCol, uid, { viewpoints: { $elemMatch: { guid: vid } } })
		.then((risk) => {
			if (_.get(risk, "viewpoints[0].screenshot.resizedContent.buffer")) {
				return risk.viewpoints[0].screenshot.resizedContent.buffer;
			} else if (!_.get(risk, "viewpoints[0].screenshot.content.buffer")) {
				return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
			} else {
				return utils.resizeAndCropScreenshot(risk.viewpoints[0].screenshot.content.buffer, 365)
					.then((resized) => {
						db.getCollection(dbCol.account, dbCol.model + ".risks").then((_dbCol) => {
							_dbCol.update({
								_id: uid,
								"viewpoints.guid": vid},
								{$set: {"viewpoints.$.screenshot.resizedContent": resized}}
								).catch((err) => {
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

	return this.findByUID(dbCol, uid, { thumbnail: 1 }).then((risk) => {
		if (!_.get(risk, "thumbnail.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return risk.thumbnail.content.buffer;
		}
	});
};

module.exports = risk;
