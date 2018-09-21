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

const ModelSetting = require("./modelSetting");
const History = require("./history");
const Ref = require("./ref");
const GenericObject = require("./base/repo").GenericObject;
// const middlewares = require("../middlewares/middlewares");
const _ = require("lodash");

const ChatEvent = require("./chatEvent");

const systemLogger = require("../logger.js").systemLogger;
// const Group = require("./group");
const User = require("./user");
const Job = require("./job");
const ModelHelper = require("./helper/model");

const C = require("../constants");

const risk = {};

function clean(dbCol, riskToClean) {
	const keys = ["_id", "rev_id", "parent"];
	const vpKeys = ["hidden_group_id", "highlighted_group_id", "shown_group_id", "guid"];

	riskToClean.account = dbCol.account;
	riskToClean.model = (riskToClean.origin_model) ? riskToClean.origin_model : dbCol.model;

	keys.concat(vpKeys).forEach((key) => {
		if (riskToClean[key]) {
			riskToClean[key] = utils.uuidToString(riskToClean[key]);
		}
	});

	if (riskToClean.viewpoint) {
		vpKeys.forEach((key) => {
			if (riskToClean.viewpoint && riskToClean.viewpoint[key]) {
				riskToClean.viewpoint[key] = utils.uuidToString(riskToClean.viewpoint[key]);
			}
		});

		if (riskToClean.viewpoint.screenshot) {
			riskToClean.viewpoint.screenshot = riskToClean.account + "/" + riskToClean.model + "/risks/" + riskToClean._id + "/screenshot.png";
			riskToClean.viewpoint.screenshotSmall = riskToClean.account + "/" + riskToClean.model + "/risks/" + riskToClean._id + "/screenshotSmall.png";
		}
	}

	if (riskToClean.thumbnail && riskToClean.thumbnail.flag) {
		riskToClean.thumbnail = riskToClean.account + "/" + riskToClean.model + "/risks/" + riskToClean._id + "/thumbnail.png";
	}

	return riskToClean;
}

risk.createRisk = function(dbCol, newRisk) {
	const sessionId = newRisk.sessionId;
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
			GenericObject.getSharedId(dbCol, newRisk.object_id).then((sid) => {
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
				newRisk = clean(dbCol, newRisk);
				ChatEvent.newRisks(sessionId, dbCol.account, dbCol.model, [newRisk]);

				return Promise.resolve(newRisk);
			});
		});
	});
};

risk.updateAttrs = function(dbCol, uid, data) {

	const sessionId = data.sessionId;

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return this.findByUID(dbCol, uid, {}, true).then((oldRisk) => {
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
						const hasOwnerJob = oldRisk.creator_role === job;
						const hasAssignedJob = job === oldRisk.assigned_roles[0];

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

							fieldsCanBeUpdated.forEach((key) => {
								if (data[key]) {
									toUpdate[key] = data[key];
									oldRisk[key] = data[key];
								}
							});

							return db.getCollection(dbCol.account, dbCol.model + ".risks").then((_dbCol) => {
								return _dbCol.update({_id: uid}, {$set: toUpdate}).then(() => {
									oldRisk = clean(dbCol, oldRisk);
									ChatEvent.riskChanged(sessionId, dbCol.account, dbCol.model, oldRisk);
									return oldRisk;
								});
							});
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

risk.findRisksByModelName = function(dbCol, username, branch, revId, projection, ids) {
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
							this.findRisksByModelName(subDbCol, username, "master", null, projection).then((subRisks) => {
								subRisks.forEach((subRisk) => {
									subRisk.origin_account = subDbCol.account;
									subRisk.origin_model = subDbCol.model;
								});

								return subRisks;
							})
						);
					});

					return Promise.all(subModelsPromises).then((subModelsRisks) => {
						if (subModelsRisks) {
							subModelsRisks.forEach((subModelRisks) => {
								mainRisks = mainRisks.concat(subModelRisks);
							});
						}
						mainRisks = mainRisks.map(r => clean(dbCol, r));

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

risk.getScreenshot = function(dbCol, uid) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return this.findByUID(dbCol, uid, { "viewpoint.screenshot.content": 1 }, true).then((foundRisk) => {
		if (!_.get(foundRisk, "viewpoint.screenshot.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return foundRisk.viewpoint.screenshot.content.buffer;
		}
	});
};

risk.getSmallScreenshot = function(dbCol, uid) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return this.findByUID(dbCol, uid, { viewpoint: 1 }, true)
		.then((foundRisk) => {
			if (_.get(foundRisk, "viewpoint.screenshot.resizedContent.buffer")) {
				return foundRisk.viewpoint.screenshot.resizedContent.buffer;
			} else if (!_.get(foundRisk, "viewpoint.screenshot.content.buffer")) {
				return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
			} else {
				return utils.resizeAndCropScreenshot(foundRisk.viewpoint.screenshot.content.buffer, 365)
					.then((resized) => {
						db.getCollection(dbCol.account, dbCol.model + ".risks").then((_dbCol) => {
							_dbCol.update({ _id: uid },
								{$set: {"viewpoint.screenshot.resizedContent": resized}}
							).catch((err) => {
								systemLogger.logError("Error while saving resized screenshot",
									{
										riskId: utils.uuidToString(uid),
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
