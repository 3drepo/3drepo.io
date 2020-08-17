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
const FileRef = require("./fileRef");
const Groups = require("./group");
const { systemLogger } = require("../logger.js");

const clean = function(routePrefix, viewpointToClean, serialise = true) {
	const viewpointFields = [
		"group_id",
		"guid",
		"highlighted_group_id",
		"hidden_group_id",
		"shown_group_id",
		"override_groups_id"
	];

	if (viewpointToClean) {
		viewpointFields.forEach((field) => {
			if (_.get(viewpointToClean, field)) {
				if (serialise) {
					if (Array.isArray(_.get(viewpointToClean, field))) {
						viewpointToClean[field] = viewpointToClean[field].map(utils.uuidToString);
					} else {
						viewpointToClean[field] = utils.uuidToString(viewpointToClean[field]);
					}
				} else {
					viewpointToClean[field] = utils.stringToUUID(viewpointToClean[field]);
				}
			}
		});

		if (serialise) {
			setViewpointScreenshotURL(routePrefix, viewpointToClean);
			viewpointToClean.screenshot_ref = undefined;

		}
	}

	return viewpointToClean;
};

const createViewpoint = async (account, model, collName, routePrefix, hostId, vpData, addGUID, viewpointType, createThumbnail = false) => {
	if (!vpData) {
		return;
	}
	const viewpoint = {...vpData};

	hostId = utils.uuidToString(hostId);

	if(addGUID) {
		viewpoint.guid = utils.generateUUID();
	}

	["highlighted_group_id",
		"hidden_group_id",
		"shown_group_id"
	].forEach((groupIDName) => {
		if(viewpoint[groupIDName] === "") {
			delete viewpoint[groupIDName];
		}
	});

	if (viewpoint.override_groups_id && !viewpoint.override_groups_id.length) {
		delete viewpoint.override_groups_id;
	}

	const groupPromises = [];

	const dbCol = {account, model};
	const groupIdField = viewpointType + "_id";

	["highlighted_group",
		"hidden_group",
		"shown_group"
	].forEach((group) => {
		if(viewpoint[group]) {
			groupPromises.push(
				Groups.createGroup(dbCol, null, {...viewpoint[group], [groupIdField]: utils.stringToUUID(hostId)}).then((groupResult) => {
					viewpoint[`${group}_id`] = groupResult._id;
					delete viewpoint[group];
				})
			);
		}
	});

	if (viewpoint.override_groups) {
		const overrideGroupsProms = [];
		viewpoint.override_groups.forEach((group) => {
			overrideGroupsProms.push(
				Groups.createGroup(dbCol, null, {...group, [groupIdField]: utils.stringToUUID(hostId)}).then((groupResult) => {
					return groupResult._id;
				})
			);
		});

		groupPromises.push(
			Promise.all(overrideGroupsProms).then((overrideGroups) => {
				viewpoint.override_groups_id = overrideGroups;
				delete viewpoint.override_groups;
			})
		);
	}

	await Promise.all(groupPromises);

	if (viewpoint.screenshot && viewpoint.screenshot !== "") {
		const imageBuffer = new Buffer.from(
			viewpoint.screenshot.substring(viewpoint.screenshot.indexOf(",") + 1),
			"base64"
		);

		viewpoint.screenshot = imageBuffer;

		if (createThumbnail) {
			viewpoint.thumbnail = await utils.resizeAndCropScreenshot(imageBuffer, 120, 120, true).catch((err) => {
				systemLogger.logError("Resize failed as screenshot is not a valid png, no thumbnail will be generated", {
					account,
					model,
					type: this.collName,
					id: hostId,
					err
				});
			});
		}

		await setExternalScreenshotRef(viewpoint, account, model, collName);
	} else {
		delete viewpoint.screenshot;
	}

	return clean(routePrefix, viewpoint, false);
};

const setExternalScreenshotRef = async function(viewpoint, account, model, collName) {
	const screenshot = viewpoint.screenshot;
	const ref = await FileRef.storeFile(account, model + "." + collName + ".ref", null, null, screenshot);
	delete viewpoint.screenshot;
	viewpoint.screenshot_ref = ref._id;
	return viewpoint;
};

const setViewpointScreenshotURL = function(routePrefix, viewpoint) {
	if (!viewpoint || !viewpoint.guid || (!viewpoint.screenshot && !viewpoint.screenshot_ref)) {
		return viewpoint;
	}

	const viewpointId = utils.uuidToString(viewpoint.guid);

	viewpoint.screenshot = `${routePrefix}/viewpoints/${viewpointId}/screenshot.png`;

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
};

module.exports = {
	clean,
	createViewpoint
};
