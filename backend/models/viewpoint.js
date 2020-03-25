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
const nodeuuid = require("uuid/v1");
const responseCodes = require("../response_codes.js");
const db = require("../handler/db");
const ChatEvent = require("./chatEvent");
const FileRef = require("./fileRef");
const { pick } = require("lodash");

const view = {};

view.clean =  function (viewToClean, targetType = "[object String]") {
	const keys = ["_id", "guid", "highlighted_group_id", "hidden_group_id", "shown_group_id"];

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

	return viewToClean;
};

view.findByUID = function (account, model, uid, projection, cleanResponse = false) {
	return db.getCollection(account, model + ".views").then((_dbCol) => {
		return _dbCol.findOne({ _id: utils.stringToUUID(uid) }, projection).then(vp => {

			if (!vp) {
				return Promise.reject(responseCodes.VIEW_NOT_FOUND);
			}

			if (cleanResponse) {
				return this.setViewpointThumbnailURL(account, model, this.clean(vp));
			}

			return vp;
		});
	});
};

view.listViewpoints = function (account, model) {

	return db.getCollection(account, model + ".views").then(_dbCol => {
		return _dbCol.find().toArray().then(results => {
			results.forEach(view.clean);
			return results;
		});
	});

};

view.setExternalScreenshotRef = async function(viewpoint, account, model, collName) {
	const screenshot = viewpoint.screenshot;
	const ref = await FileRef.storeFile(account, model, collName, screenshot);
	delete viewpoint.screenshot;
	viewpoint.screenshot_ref = ref._id;
	return viewpoint;
};

view.setViewpointScreenshotURL = function(collName, account, model, id, viewpoint) {
	if (!viewpoint || (!viewpoint.screenshot && !viewpoint.screenshot_ref)) {
		return viewpoint;
	}

	id = utils.uuidToString(id);
	const viewpointId = utils.uuidToString(viewpoint.guid);

	viewpoint.screenshot = account + "/" + model + "/" + collName + "/" + id + "/viewpoints/" + viewpointId + "/screenshot.png";

	// DEPRECATED
	viewpoint.screenshotSmall = viewpoint.screenshot;
	return viewpoint;
};

view.setViewpointThumbnailURL = function(account, model, viewpoint) {
	if (!viewpoint || (!viewpoint.screenshot && !viewpoint.screenshot_ref)) {
		return viewpoint;
	}

	const viewpointId = utils.uuidToString(viewpoint._id);
	viewpoint.screenshot = { thumbnail: account + "/" + model + "/viewpoints/" + viewpointId + "/thumbnail.png" };

	return viewpoint;
};

view.getThumbnail = function (account, model, uid) {
	return this.findByUID(account, model, uid, { "screenshot.buffer": 1 }).then(vp => {
		if (!vp.screenshot) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			// Mongo stores it as it's own binary object, so we need to do buffer.buffer!
			return vp.screenshot.buffer.buffer;
		}
	});

};

view.updateViewpoint = function (account, model, sessionId, data, id) {
	return this.updateAttrs(account, model, id, data).then((result) => {
		ChatEvent.viewpointsChanged(sessionId, account, model, Object.assign({ _id: utils.uuidToString(id) }, data));
		return result;
	});
};

view.updateAttrs = function (account, model, id, data) {
	const toUpdate = {};
	const fieldsCanBeUpdated = ["name"];

	// Set the data to be updated in Mongo
	fieldsCanBeUpdated.forEach((key) => {
		if (data[key]) {
			toUpdate[key] = data[key];
		}
	});

	return db.getCollection(account, model + ".views").then(_dbCol => {
		return _dbCol.update({ _id: id }, { $set: toUpdate }).then(() => {
			return { _id: utils.uuidToString(id) };
		});
	});
};

view.createViewpoint = async (account, model, sessionId, data) => {
	if (data.screenshot && data.screenshot.base64) {
		const croppedScreenshot = await utils.getCroppedScreenshotFromBase64(data.screenshot.base64, 79, 79);
		data.screenshot.buffer = new Buffer.from(croppedScreenshot, "base64");
	}

	data = pick(data, ["name", "clippingPlanes", "viewpoint", "screenshot"]);

	const newViewpoint = { _id:  utils.stringToUUID(nodeuuid()), ...data };
	const coll = await db.getCollection(account, model + ".views");
	await coll.insert(newViewpoint);

	const viewpoint = view.setViewpointThumbnailURL(account, model,  view.clean(newViewpoint));

	ChatEvent.viewpointsCreated(sessionId, account, model,viewpoint);
	return viewpoint;
};

view.deleteViewpoint = function (account, model, idStr, sessionId) {
	let id = idStr;
	if ("[object String]" === Object.prototype.toString.call(id)) {
		id = utils.stringToUUID(id);
	}

	return db.getCollection(account, model + ".views").then((_dbCol) => {
		return _dbCol.findOneAndDelete({ _id: id }).then((deleteResponse) => {
			if (!deleteResponse.value) {
				return Promise.reject(responseCodes.VIEW_NOT_FOUND);
			}
			if(sessionId) {
				ChatEvent.viewpointsDeleted(sessionId, account, model, idStr);
			}
		});
	});
};

module.exports = view;
