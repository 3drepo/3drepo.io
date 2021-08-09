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
const responseCodes = require("../response_codes.js");
const db = require("../handler/db");
const ChatEvent = require("./chatEvent");
const Viewpoint = require("./viewpoint");
const Groups = require("./group.js");

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
		this.viewpointType = "view";
	}

	routePrefix(account, model, id) {
		const route = ("views" === this.collName) ? "viewpoints" : this.collName;
		return `${account}/${model}/${route}/${utils.uuidToString(id)}`;
	}

	clean(account, model, viewToClean) {

		if (viewToClean._id) {
			const id = utils.uuidToString(viewToClean._id);

			viewToClean._id = id;
			const routePrefix = this.routePrefix(account, model, id);

			if (viewToClean.viewpoint) {
				viewToClean.viewpoint = Viewpoint.cleanViewpoint(routePrefix, viewToClean.viewpoint);
			}

			if (viewToClean.thumbnail) {
				viewToClean.thumbnail = `${routePrefix}/thumbnail.png`;
			}
		}

		// ===============================
		// DEPRECATED LEGACY SUPPORT START
		// ===============================
		if(this.collName === "views") {
			if (viewToClean.thumbnail) {
				viewToClean.screenshot = { thumbnail: viewToClean.thumbnail };
			}

			if (viewToClean.viewpoint && viewToClean.viewpoint.clippingPlanes) {
				viewToClean.clippingPlanes = viewToClean.viewpoint.clippingPlanes;
			}
		}
		// =============================
		// DEPRECATED LEGACY SUPPORT END
		// =============================

		return viewToClean;
	}

	async createViewpoint(account, model, id, viewpoint, createThumbnail = false) {
		return Viewpoint.createViewpoint(account, model, this.collName, this.routePrefix(account, model, id), id, viewpoint,
			this.viewpointType !== "view",this.viewpointType, createThumbnail);
	}

	getCollection(account, model) {
		return db.getCollection(account, model + "." + this.collName);
	}

	async findByUID(account, model, uid, projection, noClean = false) {
		uid = utils.stringToUUID(uid);

		const views = await this.getCollection(account, model);
		const foundView = await views.findOne({ _id: uid }, projection);

		if (!foundView) {
			return Promise.reject(this.response("NOT_FOUND"));
		}

		if (!noClean) {
			return this.clean(account, model, foundView);
		}

		return foundView;
	}

	async getList(account, model) {
		const coll = await this.getCollection(account, model);
		const views = await coll.find().toArray();
		views.forEach((foundView, index) => {
			views[index] = this.clean(account, model, foundView);
		});

		return views;
	}

	getThumbnail(account, model, uid) {
		uid = utils.stringToUUID(uid);

		return this.findByUID(account, model, uid, { "screenshot.buffer": 1, thumbnail: 1 }, true).then((foundView) => {
			// the 'content','screenshot' field is for legacy reasons
			if (!_.get(foundView, "thumbnail.buffer") &&
				!_.get(foundView, "thumbnail.content.buffer") &&
				!_.get(foundView, "screenshot.buffer")) {
				return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
			} else {
				return ((foundView.thumbnail && foundView.thumbnail.content) ||
					(foundView.screenshot && foundView.screenshot.buffer) ||
					foundView.thumbnail).buffer;
			}
		});
	}

	checkTypes(data, types) {
		data = _.pick(data, Object.keys(types));
		Object.keys(data).forEach((field) => {
			if (utils.isString(types[field]) && !utils.typeMatch(data[field], types[field])) {
				throw responseCodes.INVALID_ARGUMENTS;
			} else if (utils.isObject(types[field])) {
				data[field] = this.checkTypes(data[field], types[field]);
			}
		});

		return data;
	}

	async update(sessionId, account, model, uid, data) {
		uid = utils.stringToUUID(uid);

		// 1. Get old view
		// const oldView = await this.findByUID(account, model, uid, {}, true);

		// 2. Pick whitelisted attributes and leave proper attrs
		const attributeWhitelist = ["name"];
		data = _.pick(data, attributeWhitelist);

		if (_.isEmpty(data)) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		data = this.checkTypes(data, this.fieldTypes);

		const views = await this.getCollection(account, model);
		await views.update({ _id: uid }, { $set: data });

		ChatEvent.viewpointsChanged(sessionId, account, model, Object.assign({ _id: utils.uuidToString(uid) }, data));

		return { _id: utils.uuidToString(uid) };
	}

	async create(sessionId, account, model, newView) {
		if (!newView.name || !utils.isString(newView.name)) {
			return Promise.reject({ resCode: responseCodes.INVALID_ARGUMENTS });
		}

		// ===============================
		// DEPRECATED LEGACY SUPPORT START
		// ===============================
		if (newView.screenshot && newView.screenshot.base64) {
			const croppedScreenshot = await utils.getCroppedScreenshotFromBase64(newView.screenshot.base64, 79, 79);
			newView.thumbnail = new Buffer.from(croppedScreenshot, "base64");
		}

		if (newView.clippingPlanes && newView.viewpoint && !newView.viewpoint.clippingPlanes) {
			newView.viewpoint.clippingPlanes = newView.clippingPlanes;
		}

		delete newView.screenshot;
		delete newView.clippingPlanes;
		// =============================
		// DEPRECATED LEGACY SUPPORT END
		// =============================

		newView._id = utils.stringToUUID(newView._id || utils.generateUUID());

		if (newView.viewpoint) {
			newView.viewpoint = await this.createViewpoint(account, model, newView._id, newView.viewpoint, true);

			if (newView.viewpoint.thumbnail) {
				newView.thumbnail = newView.viewpoint.thumbnail;
				delete newView.viewpoint.thumbnail;
			}
		}

		newView = this.checkTypes(newView, this.fieldTypes);

		const coll = await this.getCollection(account, model);
		await coll.insertOne(newView);

		newView = this.clean(account, model, newView);

		if (sessionId) {
			ChatEvent.viewpointsCreated(sessionId, account, model, newView);
		}

		return newView;
	}

	async deleteViewpoint(account, model, id, sessionId) {
		id = utils.uuidToString(id);
		const { findModelSettingById } = require("./modelSetting");

		const setting = await findModelSettingById(account, model);

		if(setting.defaultView && utils.uuidToString(setting.defaultView) === id) {
			throw responseCodes.CANNOT_DELETE_DEFAULT_VIEW;
		} else {
			const uid = utils.stringToUUID(id);

			const coll = await this.getCollection(account, model);

			const  [deleteResponse] =  await Promise.all([
				coll.findOneAndDelete({ _id: uid }),
				Groups.deleteGroupsByViewId(account, model, uid)
			]);

			if (!deleteResponse.value) {
				return Promise.reject(this.response("NOT_FOUND"));
			}

			if(sessionId) {
				ChatEvent.viewpointsDeleted(sessionId, account, model, utils.uuidToString(uid));
			}
		}
	}
}

module.exports = View;
