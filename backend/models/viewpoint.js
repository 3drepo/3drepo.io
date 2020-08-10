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
			if ("[object String]" === targetType) {
				if (Array.isArray(_.get(viewpointToClean, field))) {
					viewpointToClean[field] = viewpointToClean[field].map(utils.uuidToString);
				} else {
					viewpointToClean[field] = utils.uuidToString(viewpointToClean[field]);
				}
			} else if ("[object Object]" === targetType) {
				viewpointToClean[field] = utils.stringToUUID(viewpointToClean[field]);
			}
		}
	});

	if (viewpointToClean.guid && (viewpointToClean.screenshot || viewpointToClean.screenshot_ref)) {
		const viewpointId = utils.uuidToString(viewpointToClean.guid);
		viewpointToClean.screenshot = `${routePrefix}/viewpoints/${viewpointId}/screenshot.png`;
	}

	return viewpointToClean;
};

const setExternalScreenshotRef = async function(viewpoint, account, model, collName) {
	const screenshot = viewpoint.screenshot;
	const ref = await FileRef.storeFile(account, model + "." + collName + ".ref", null, null, screenshot);
	delete viewpoint.screenshot;
	viewpoint.screenshot_ref = ref._id;
	return viewpoint;
};

const setViewpointScreenshotURL = function(collName, account, model, id, viewpoint) {
	if (!viewpoint || !viewpoint.guid || (!viewpoint.screenshot && !viewpoint.screenshot_ref)) {
		return viewpoint;
	}

	id = utils.uuidToString(id);
	const viewpointId = utils.uuidToString(viewpoint.guid);

	viewpoint.screenshot = `${account}/${model}/${collName}/${id}/viewpoints/${viewpointId}/screenshot.png`;

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
	setExternalScreenshotRef,
	setViewpointScreenshotURL
};
