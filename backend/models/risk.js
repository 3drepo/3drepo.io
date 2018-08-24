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
const C = require("../constants");

const risk = {};

risk.createRisk = function() {
};

risk.findById = function() {
};

risk.findBySharedId = function() {
};

risk.findRisksByModelName = function(dbCol, username, branch, revId, projection, noClean, ids, sortBy) {
	const account = dbCol.account;
	const model = dbCol.model;

	console.log(model);
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

			return db.getCollection(account, model + ".issues").then((_dbCol) => {
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
						}
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

	return db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
		return _dbCol.findOne({ _id: uid }, projection).then((risk) => {

			if (!risk) {
				return Promise.reject(responseCodes.RISK_NOT_FOUND);
			}

			return risk;
		});
	});
};

risk.update = function() {
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
						db.getCollection(dbCol.account, dbCol.model + ".issues").then((_dbCol) => {
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
