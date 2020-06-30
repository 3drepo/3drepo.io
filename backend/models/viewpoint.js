/**
 *  Copyright (C) 2020 3D Repo Ltd
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
const _ = require("lodash");

const utils = require("../utils");
const nodeuuid = require("uuid/v1");
const responseCodes = require("../response_codes.js");
const db = require("../handler/db");
const ChatEvent = require("./chatEvent");
const FileRef = require("./fileRef");

const fieldTypes = {
	"_id": "[object Object]",
	"name": "[object String]",
	"thumbnail": ["[object String]", "[object Object]"],
	"viewpoint": "[object Object]"
};

const getResponse = (responseCodeType) => (type) => responseCodes[responseCodeType + "_" + type];

class View {
	constructor() {
		this.collName = "views";
		this.response = getResponse("VIEW");
		this.fieldTypes = fieldTypes;
	}

	// TODO v2
	clean(account, model, viewToClean, targetType = "[object String]") {
		const keys = ["_id", "guid", "highlighted_group_id", "hidden_group_id", "shown_group_id"];
		const id = utils.uuidToString(viewToClean._id);

		keys.forEach((key) => {
			if (viewToClean[key] && "[object String]" === targetType) {
				if (utils.isObject(viewToClean[key])) {
					viewToClean[key] = utils.uuidToString(viewToClean[key]);
				}
			} else if (viewToClean[key] && "[object Object]" === targetType) {
				if (utils.isString(viewToClean[key])) {
					viewToClean[key] = utils.stringToUUID(viewToClean[key]);
				}
			}
		});

		if (viewToClean.thumbnail) {
			viewToClean.thumbnail = account + "/" + model + "/" + this.collName + "/" + id + "/thumbnail.png";
		} else {
			viewToClean.thumbnail = undefined;
		}

		return viewToClean;
	}

	getViewsCollection(account, model) {
		return db.getCollection(account, model + "." + this.collName);
	}

	// NOTE: noClean changed - flipped
	async findByUID(account, model, uid, projection, noClean = true) {
		if (utils.isString(uid)) {
			uid = utils.stringToUUID(uid);
		}

		const views = await this.getViewsCollection(account, model);
		const foundView = await views.findOne({ _id: uid }, projection);

		if (!foundView) {
			return Promise.reject(this.response("NOT_FOUND"));
		}

		if (!noClean) {
			return this.setViewpointThumbnailURL(account, model, this.clean(account, model, foundView));
		}

		return foundView;
	}

	// similar to findByModelName
	async listViewpoints(account, model, noClean = true) {
		const coll = await this.getViewsCollection(account, model);
		const views = await coll.find().toArray();
		views.forEach((foundView, index) => {
			if (!noClean) {
				views[index] = this.clean(account, model, foundView);
			}
		});

		return views;
	}

	async setExternalScreenshotRef(viewpoint, account, model, collName) {
		const screenshot = viewpoint.screenshot;
		const ref = await FileRef.storeFile(account, model + "." + collName + ".ref", null, null, screenshot);
		delete viewpoint.screenshot;
		viewpoint.screenshot_ref = ref._id;
		return viewpoint;
	}

	setViewpointScreenshotURL(collName, account, model, id, viewpoint) {
		if (!viewpoint || (!viewpoint.screenshot && !viewpoint.screenshot_ref)) {
			return viewpoint;
		}

		id = utils.uuidToString(id);
		const viewpointId = utils.uuidToString(viewpoint.guid);

		viewpoint.screenshot = account + "/" + model + "/" + collName + "/" + id + "/viewpoints/" + viewpointId + "/screenshot.png";

		// DEPRECATED
		viewpoint.screenshotSmall = viewpoint.screenshot;
		return viewpoint;
	}

	// DEPRECATED
	setViewpointThumbnailURL(account, model, viewpoint) {
		if (!viewpoint || (!viewpoint.screenshot && !viewpoint.screenshot_ref)) {
			return viewpoint;
		}

		const viewpointId = utils.uuidToString(viewpoint._id);
		viewpoint.screenshot = { thumbnail: account + "/" + model + "/viewpoints/" + viewpointId + "/thumbnail.png" };

		return viewpoint;
	}

	getThumbnail(account, model, uid) {
		if (utils.isString(uid)) {
			uid = utils.stringToUUID(uid);
		}

		return this.findByUID(account, model, uid, { "screenshot.buffer": 1 }).then((foundView) => {
			// the 'screenshot' field is for legacy reasons
			if (!_.get(foundView, "thumbnail.buffer") && !_.get(foundView, "screenshot.buffer")) {
				return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
			} else {
				// Mongo stores it as it's own binary object, so we need to do buffer.buffer!
				return (foundView.screenshot.buffer || foundView.thumbnail).buffer;
			}
		});
	}

	updateViewpoint(account, model, sessionId, data, id) {
		return this.updateAttrs(account, model, id, data).then((result) => {
			ChatEvent.viewpointsChanged(sessionId, account, model, Object.assign({ _id: utils.uuidToString(id) }, data));
			return result;
		});
	}

	async updateAttrs(account, model, id, data) {
		const toUpdate = {};
		// We can only update the name of a viewpoint
		const name = data["name"];
		if (name && utils.isString(name) && name !== "") {
			toUpdate["name"] = name;
		} else {
			return Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}

		const coll = await this.getViewsCollection(account, model);
		return coll.update({ _id: id }, { $set: toUpdate }).then(() => {
			return { _id: utils.uuidToString(id) };
		});
	}

	async createViewpoint(account, model, sessionId, newView) {
		if (newView.screenshot && newView.screenshot.base64) {
			const croppedScreenshot = await utils.getCroppedScreenshotFromBase64(newView.screenshot.base64, 79, 79);
			newView.screenshot.buffer = new Buffer.from(croppedScreenshot, "base64");
		}

		newView = _.pick(newView, ["name", "clippingPlanes", "viewpoint", "screenshot"]);

		newView._id = utils.stringToUUID(newView._id || nodeuuid());
		const coll = await this.getViewsCollection(account, model);
		await coll.insert(newView);

		newView = this.setViewpointThumbnailURL(account, model, this.clean(account, model, newView));

		ChatEvent.viewpointsCreated(sessionId, account, model, newView);
		return newView;
	}

	async deleteViewpoint(account, model, uid, sessionId) {
		if (utils.isString(uid)) {
			uid = utils.stringToUUID(uid);
		}

		const coll = await this.getViewsCollection(account, model);
		return coll.findOneAndDelete({ _id: uid }).then((deleteResponse) => {
			if (!deleteResponse.value) {
				return Promise.reject(this.response("NOT_FOUND"));
			}
			if(sessionId) {
				ChatEvent.viewpointsDeleted(sessionId, account, model, utils.uuidToString(uid));
			}
		});
	}
}

module.exports = new View();
