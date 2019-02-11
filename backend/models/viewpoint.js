/**
 *  Copyright (C) 2018 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const utils = require("../utils");
const uuid = require("node-uuid");
const responseCodes = require("../response_codes.js");
const systemLogger = require("../logger.js").systemLogger;
const db = require("../handler/db");
const ChatEvent = require("./chatEvent");

const view = {};

view.clean = function (dbCol, viewToClean, targetType = "[object String]") {
	const keys = ["_id", "guid", "highlighted_group_id", "hidden_group_id", "shown_group_id"];
	let thumbnailPromise;

	viewToClean.account = dbCol.account;
	viewToClean.model = dbCol.model;

	keys.forEach((key) => {
		if (viewToClean[key] && "[object String]" === targetType) {
			if ("[object Object]" === Object.prototype.toString.call(viewToClean[key])) {
				viewToClean[key] = utils.uuidToString(viewToClean[key]);
			}
		} else if (viewToClean[key] && "[object Object]" === targetType) {
			if ("[object String]" === Object.prototype.toString.call(viewToClean[key])) {
				viewToClean[key] = utils.stringToUUID(viewToClean[key]);
			}
		}
	});

	// TODO FIXME - Need to unify content/buffer for buffer field name in document
	// TODO FIXME - Currently, Issues/Risks uses content
	// TODO FIXME - Currently, Viewpoints uses buffer
	if ("[object String]" === Object.prototype.toString.call(viewToClean.screenshot)) {
		viewToClean.screenshot = {
			content: new Buffer.from(viewToClean.screenshot, "base64"),
			flag: 1
		};

		thumbnailPromise = utils.resizeAndCropScreenshot(viewToClean.screenshot.content, 120, 120, true).catch((err) => {
			systemLogger.logError("Resize failed as screenshot is not a valid png, no thumbnail will be generated", {
				account: dbCol.account,
				model: dbCol.model,
				err
			});
		});
	}

	if (viewToClean.screenshot && viewToClean.screenshot.buffer) {
		delete viewToClean.screenshot.buffer;
		viewToClean.screenshot.thumbnail =
			viewToClean.account + "/" + viewToClean.model + "/viewpoints/" + viewToClean._id + "/thumbnail.png";
	}

	if (thumbnailPromise) {
		return thumbnailPromise.then((thumbnail) => {
			viewToClean.screenshot.thumbnail = thumbnail;
			return viewToClean;
		});
	} else {
		return viewToClean;
	}
};

view.findByUID = function (dbCol, uid, projection, cleanResponse = false) {

	return db.getCollection(dbCol.account, dbCol.model + ".views").then((_dbCol) => {
		return _dbCol.findOne({ _id: utils.stringToUUID(uid) }, projection).then(vp => {

			if (!vp) {
				return Promise.reject(responseCodes.VIEW_NOT_FOUND);
			}

			if (cleanResponse) {
				this.clean(dbCol, vp);
			}

			return vp;
		});
	});
};

view.listViewpoints = function (dbCol) {

	return db.getCollection(dbCol.account, dbCol.model + ".views").then(_dbCol => {
		return _dbCol.find().toArray().then(results => {
			results.forEach((result) => {
				this.clean(dbCol, result);
			});
			return results;
		});
	});

};

view.getThumbnail = function (dbColOptions, uid) {

	return this.findByUID(dbColOptions, uid, { "screenshot.buffer": 1 }).then(vp => {
		if (!vp.screenshot) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			// Mongo stores it as it's own binary object, so we need to do buffer.buffer!
			return vp.screenshot.buffer.buffer;
		}
	});

};

view.updateViewpoint = function (dbCol, sessionId, data, id) {
	return this.updateAttrs(dbCol, id, data).then((result) => {
		ChatEvent.viewpointsChanged(sessionId, dbCol.account, dbCol.model, Object.assign({ _id: utils.uuidToString(id) }, data));
		return result;
	});
};

view.updateAttrs = function (dbCol, id, data) {
	const toUpdate = {};
	const fieldsCanBeUpdated = ["name"];

	// Set the data to be updated in Mongo
	fieldsCanBeUpdated.forEach((key) => {
		if (data[key]) {
			toUpdate[key] = data[key];
		}
	});

	return db.getCollection(dbCol.account, dbCol.model + ".views").then(_dbCol => {
		return _dbCol.update({ _id: id }, { $set: toUpdate }).then(() => {
			return { _id: utils.uuidToString(id) };
		});
	});
};

view.createViewpoint = function (dbCol, sessionId, data) {
	return db.getCollection(dbCol.account, dbCol.model + ".views").then((_dbCol) => {
		let cropped;

		if (data.screenshot && data.screenshot.base64) {
			cropped = utils.getCroppedScreenshotFromBase64(data.screenshot.base64, 79, 79);
		} else {
			cropped = Promise.resolve();
		}

		return cropped.then((croppedScreenshot) => {

			const id = utils.stringToUUID(uuid.v1());

			if (croppedScreenshot) {
				// Remove the base64 version of the screenshotgetViewpointThumbnail
				delete data.screenshot.base64;
				data.screenshot.buffer = new Buffer.from(croppedScreenshot, "base64");
			}

			const newViewpoint = {
				_id: id,
				clippingPlanes: data.clippingPlanes,
				viewpoint: data.viewpoint,
				screenshot: data.screenshot
			};

			return _dbCol.insert(newViewpoint).then(() => {
				return this.updateAttrs(dbCol, id, data).then((result) => {
					data._id = id;
					ChatEvent.viewpointsCreated(sessionId, dbCol.account, dbCol.model, this.clean(dbCol, data));
					return result;
				}).catch((err) => {
					// remove the recently saved new view as update attributes failed
					return this.deleteViewpoint(dbCol, id).then(() => {
						return Promise.reject(err);
					});
				});
			});
		});
	});
};

view.deleteViewpoint = function (dbCol, idStr, sessionId) {
	let id = idStr;
	if ("[object String]" === Object.prototype.toString.call(id)) {
		id = utils.stringToUUID(id);
	}

	return db.getCollection(dbCol.account, dbCol.model + ".views").then((_dbCol) => {
		return _dbCol.findOneAndDelete({ _id: id }).then((deleteResponse) => {
			if (!deleteResponse.value) {
				return Promise.reject(responseCodes.VIEW_NOT_FOUND);
			}
			if(sessionId) {
				ChatEvent.viewpointsDeleted(sessionId, dbCol.account, dbCol.model, idStr);
			}
		});
	});
};

module.exports = view;
