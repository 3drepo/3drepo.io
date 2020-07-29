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

const clean = function(routePrefix, viewpointToClean, targetType = "[object String]") {
	const viewpointFields = [
		"group_id",
		"guid",
		"highlighted_group_id",
		"hidden_group_id",
		"shown_group_id",
		"override_groups_id"
	];

	viewpointFields.forEach((field) => {
		if (_.get(viewpointToClean, field)) {
			if ("[object String]" === targetType && utils.isObject(_.get(viewpointToClean, field))) {
				_.set(viewpointToClean, field, utils.uuidToString(_.get(viewpointToClean, field)));
<<<<<<< HEAD
			} else if ("[object Object]" === targetType && utils.isString(_.get(viewpointToClean, field))) {
=======

				if (Array.isArray(_.get(viewpointToClean, field))) {
					_.set(viewpointToClean, field,  _.get(viewpointToClean, field).map(utils.uuidToString));
				}
<<<<<<< HEAD
			} else if ("[object Object]" === targetType) {
>>>>>>> ISSUE #2116 - When an issue with overrid colour has been selected it
				_.set(viewpointToClean, field, utils.stringToUUID(_.get(viewpointToClean, field)));
=======
			}
		});

		if (viewToClean.viewpoint &&
			viewToClean.viewpoint._id &&
			viewToClean.viewpoint.guid &&
			(viewToClean.viewpoint.screenshot || viewToClean.viewpoint.screenshot_ref)) {
			const id = utils.uuidToString(viewToClean._id);
			const viewpointId = utils.uuidToString(viewToClean.viewpoint.guid);
			viewToClean.viewpoint.screenshot = account + "/" + model + "/" + collName + "/" + id + "/viewpoints/" + viewpointId + "/screenshot.png";
		}

		if (viewToClean.thumbnail) {
			const id = utils.uuidToString(viewToClean._id);
			viewToClean.thumbnail = account + "/" + model + "/" + collName + "/" + id + "/thumbnail.png";
		} else {
			viewToClean.thumbnail = undefined;
		}

		// ===============================
		// DEPRECATED LEGACY SUPPORT START
		// ===============================
		if (viewToClean.thumbnail) {
			viewToClean.screenshot = { thumbnail: viewToClean.thumbnail };
		}

		if (viewToClean.viewpoint) {
			if (viewToClean.viewpoint.clippingPlanes) {
				viewToClean.clippingPlanes = viewToClean.viewpoint.clippingPlanes;
			}
		}
		// =============================
		// DEPRECATED LEGACY SUPPORT END
		// =============================

		return viewToClean;
	}

	getCollection(account, model) {
		return db.getCollection(account, model + "." + this.collName);
	}

	async findByUID(account, model, uid, projection, noClean = false) {
		if (utils.isString(uid)) {
			uid = utils.stringToUUID(uid);
		}

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

	async setExternalScreenshotRef(viewpoint, account, model, collName) {
		const screenshot = viewpoint.screenshot;
		const ref = await FileRef.storeFile(account, model + "." + collName + ".ref", null, null, screenshot);
		delete viewpoint.screenshot;
		viewpoint.screenshot_ref = ref._id;
		return viewpoint;
	}

	setViewpointScreenshotURL(collName, account, model, id, viewpoint) {
		if (!viewpoint || !viewpoint.guid || (!viewpoint.screenshot && !viewpoint.screenshot_ref)) {
			return viewpoint;
		}

		id = utils.uuidToString(id);
		const viewpointId = utils.uuidToString(viewpoint.guid);

		viewpoint.screenshot = account + "/" + model + "/" + collName + "/" + id + "/viewpoints/" + viewpointId + "/screenshot.png";

		// ===============================
		// DEPRECATED LEGACY SUPPORT START
		// ===============================
		if (!viewpoint.screenshotSmall) {
			viewpoint.screenshotSmall = viewpoint.screenshot;
		}
		// =============================
		// DEPRECATED LEGACY SUPPORT END
		// =============================

		return viewpoint;
	}

	getThumbnail(account, model, uid) {
		if (utils.isString(uid)) {
			uid = utils.stringToUUID(uid);
		}

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
				this.checkTypes(data[field], types[field]);
			}
		});
	}

	async update(sessionId, account, model, uid, data) {
		if (utils.isString(uid)) {
			uid = utils.stringToUUID(uid);
		}

		// 1. Get old view
		// const oldView = await this.findByUID(account, model, uid, {}, true);

		// 2. Pick whitelisted attributes and leave proper attrs
		const attributeWhitelist = ["name"];
		data = _.pick(data, attributeWhitelist);

		if (_.isEmpty(data)) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		this.checkTypes(data, this.fieldTypes);

		const views = await this.getCollection(account, model);
		await views.update({ _id: uid }, { $set: data });

		ChatEvent.viewpointsChanged(sessionId, account, model, Object.assign({ _id: utils.uuidToString(uid) }, data));

		return { _id: utils.uuidToString(uid) };
	}

	async handleViewpoint(account, model, id, viewpoint, viewpointType = "view") {
		viewpoint = viewpoint || {};

		const viewpointId = (viewpoint.guid) ? utils.uuidToString(viewpoint.guid) : undefined;

		if (viewpoint.highlighted_group_id) {
			viewpoint.highlighted_group_id = utils.stringToUUID(viewpoint.highlighted_group_id);
		} else if ("" === viewpoint.highlighted_group_id) {
			delete viewpoint.highlighted_group_id;
		}

		if (viewpoint.hidden_group_id) {
			viewpoint.hidden_group_id = utils.stringToUUID(viewpoint.hidden_group_id);
		} else if ("" === viewpoint.hidden_group_id) {
			delete viewpoint.hidden_group_id;
		}

		if (viewpoint.shown_group_id) {
			viewpoint.shown_group_id = utils.stringToUUID(viewpoint.shown_group_id);
		} else if ("" === viewpoint.shown_group_id) {
			delete viewpoint.shown_group_id;
		}

		if (viewpoint.override_groups_id) {
			viewpoint.override_groups_id = viewpoint.override_groups_id.map(utils.stringToUUID);
		} else if ("" === viewpoint.override_groups_id) {
			delete viewpoint.override_groups_id;
		}

		const dbCol = {account, model};
		const groupIdField = viewpointType + "_id";

		if (viewpoint.highlighted_group) {
			viewpoint.highlighted_group_id = (await Groups.createGroup(dbCol, null, {...viewpoint.highlighted_group, [groupIdField]: id}))._id;
			delete viewpoint.highlighted_group;
		}

		if (viewpoint.hidden_group) {
			viewpoint.hidden_group_id = (await Groups.createGroup(dbCol, null, {...viewpoint.hidden_group, [groupIdField]: id}))._id;
			delete viewpoint.hidden_group;
		}

		if (viewpoint.shown_group) {
			viewpoint.shown_group_id = (await Groups.createGroup(dbCol, null, {...viewpoint.shown_group, [groupIdField]: id}))._id;
			delete viewpoint.shown_group;
		}

		if (viewpoint.override_groups) {
			viewpoint.override_groups_id = (await Promise.all(viewpoint.override_groups.map(data => Groups.createGroup(dbCol, null, {...data, [groupIdField]: id})))).map(({_id}) => _id);
			delete viewpoint.override_groups;
		}

		if (viewpoint.screenshot) {
			const imageBuffer = new Buffer.from(
				viewpoint.screenshot.substring(viewpoint.screenshot.indexOf(",") + 1),
				"base64"
			);

			viewpoint.screenshot = imageBuffer;

			viewpoint.thumbnail = await utils.resizeAndCropScreenshot(imageBuffer, 120, 120, true).catch((err) => {
				systemLogger.logError("Resize failed as screenshot is not a valid png, no thumbnail will be generated", {
					account,
					model,
					type: this.collName,
					id: utils.uuidToString(id),
					viewpointId,
					err
				});
			});
		}

		return viewpoint;
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

		newView._id = utils.stringToUUID(newView._id || nodeuuid());

		if (newView.viewpoint) {
			newView.viewpoint = await this.handleViewpoint(account, model, newView._id, newView.viewpoint);

			if (newView.viewpoint.thumbnail) {
				newView.thumbnail = newView.viewpoint.thumbnail;
				delete newView.viewpoint.thumbnail;
>>>>>>> ISSUE #2116 - storing groups ids instead of an embedded groups in views, minor refactor of tickets to use the viewpoints groups function
			}
		}
	});

	if (viewpointToClean._id && viewpointToClean.guid && (viewpointToClean.screenshot || viewpointToClean.screenshot_ref)) {
		const viewpointId = utils.uuidToString(viewpointToClean.guid);
		viewpointToClean.screenshot = `${routePrefix}/viewpoints/${viewpointId}/screenshot.png`;
	}

	return viewpointToClean;
};

module.exports = {
	clean
};
