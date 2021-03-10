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
const responseCodes = require("../response_codes.js");
const { systemLogger } = require("../logger.js");
const C = require("../constants");
const FileType = require("file-type");

const checkCameraValues = (output, input) => {
	// Check vectors/points
	["right", "up", "view_dir", "position", "look_at"].forEach((key) => {
		if (input[key]) {
			if (!Array.isArray(input[key])) {
				systemLogger.logError(`invalid type ${key}`);
				throw responseCodes.INVALID_ARGUMENTS;
			}

			if (input[key].length === 3) {
				output[key] = input[key];
			}
		}

	});

	["near", "far", "fov", "aspect_ratio"].forEach((key) => {
		if(utils.hasField(input, key)) {
			if(!utils.isNumber(input[key])) {
				systemLogger.logError(`invalid type ${key}`);
				throw responseCodes.INVALID_ARGUMENTS;
			}

			output[key] = input[key];
		}
	});
	if(input.type && utils.isString(input.type)) {
		if(input.type === "orthographic") {
			if(utils.hasField(input, "orthographicSize") && utils.isNumber(input.orthographicSize)) {
				output.type = input.type;
				output.orthographicSize = input.orthographicSize;
			} else {
				systemLogger.logError("invalid type orthographicSize or missing data");
				throw responseCodes.INVALID_ARGUMENTS;
			}
		} else if(input.type === "perspective") {
			output.type = input.type;
		} else {
			throw responseCodes.INVALID_ARGUMENTS;
		}
	}

	if (input.clippingPlanes && Array.isArray(input.clippingPlanes) && input.clippingPlanes.length) {
		output.clippingPlanes = [];
		input.clippingPlanes.forEach((clip) => {
			if(Array.isArray(clip.normal) && clip.normal.length === 3 &&
				utils.isNumber(clip.distance) &&
				utils.isNumber(clip.clipDirection)) {
				output.clippingPlanes.push({
					normal: clip.normal,
					distance: clip.distance,
					clipDirection: clip.clipDirection
				});
			} else {
				systemLogger.logError("invalid type on clipping plane data");
				throw responseCodes.INVALID_ARGUMENTS;
			}
		});
	}

	if(input.extra) {
		output.extra = input.extra;
	}

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

const Viewpoint = {};

Viewpoint.cleanViewpoint = function(routePrefix, viewpointToClean, serialise = true) {
	const viewpointFields = [
		"group_id",
		"guid",
		"highlighted_group_id",
		"hidden_group_id",
		"override_group_ids",
		"shown_group_id",
		"transformation_group_ids"
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

		if (serialise && routePrefix) {
			setViewpointScreenshotURL(routePrefix, viewpointToClean);
			// viewpointToClean.screenshot_ref = undefined;
		}
	}

	return viewpointToClean;
};

Viewpoint.createViewpoint = async (account, model, collName, routePrefix, hostId, vpData, addGUID, viewpointType, createThumbnail = false) => {
	if (!vpData) {
		return;
	}
	const viewpoint = {};
	hostId = utils.uuidToString(hostId);

	checkCameraValues(viewpoint, vpData);

	if(addGUID) {
		viewpoint.guid = utils.generateUUID();
	}

	if (utils.hasField(vpData, "hideIfc")) {
		viewpoint.hideIfc = !!vpData.hideIfc;
	}

	["highlighted_group_id",
		"hidden_group_id",
		"shown_group_id"
	].forEach((groupIDName) => {
		if(vpData[groupIDName]) {
			if(!utils.isString(vpData[groupIDName])) {
				systemLogger.logError(`invalid type ${groupIDName}`);
				throw responseCodes.INVALID_ARGUMENTS;
			} else if(vpData[groupIDName] !== "") {
				viewpoint[groupIDName] = vpData[groupIDName];
			}
		}

	});

	["override_group_ids", "transformation_group_ids"].forEach((groupIdName) => {
		if (vpData[groupIdName]) {
			if (Array.isArray(vpData[groupIdName])) {
				if (vpData[groupIdName].length) {
					viewpoint[groupIdName] = vpData[groupIdName];
				}
			} else {
				systemLogger.logError("invalid type " + groupIdName);
				throw responseCodes.INVALID_ARGUMENTS;
			}
		}
	});

	const groupPromises = [];

	const groupIdField = viewpointType + "_id";

	["highlighted_group",
		"hidden_group",
		"shown_group"
	].forEach((group) => {
		if(vpData[group]) {
			groupPromises.push(
				Groups.create(account, model, undefined, undefined, null, undefined, {...vpData[group], [groupIdField]: utils.stringToUUID(hostId)}).then((groupResult) => {
					viewpoint[`${group}_id`] = groupResult._id;
				})
			);
		}
	});

	["override_groups", "transformation_groups"].forEach((groups) => {
		if (vpData[groups]) {
			const groupsProms = [];
			vpData[groups].forEach((group) => {
				if ("transformation_groups" === groups &&
					!(group.transformation && 16 === group.transformation.length && group.objects)) {
					systemLogger.logError("invalid transformation group");
					throw responseCodes.INVALID_ARGUMENTS;
				}

				groupsProms.push(
					Groups.create(account, model, undefined, undefined, null, undefined, {...group, [groupIdField]: utils.stringToUUID(hostId)}).then((groupResult) => {
						return groupResult._id;
					})
				);
			});

			groupPromises.push(
				Promise.all(groupsProms).then((groupIds) => {
					switch (groups) {
						case "override_groups":
							viewpoint.override_group_ids = groupIds;
							break;
						case "transformation_groups":
							viewpoint.transformation_group_ids = groupIds;
							break;
						default:
							systemLogger.logError("unrecognised group name: " + groups);
							throw responseCodes.INVALID_ARGUMENTS;
					}
				})
			);
		}
	});

	await Promise.all(groupPromises);

	if (vpData.screenshot && vpData.screenshot !== "") {
		if (!utils.isString(vpData.screenshot)) {
			throw responseCodes.INVALID_ARGUMENTS;
		}
		const imageBuffer = new Buffer.from(
			vpData.screenshot.substring(vpData.screenshot.indexOf(",") + 1),
			"base64"
		);

		try {
			const type = await FileType.fromBuffer(imageBuffer);

			if (!C.ACCEPTED_IMAGE_FORMATS.includes(type.ext)) {
				throw responseCodes.FILE_FORMAT_NOT_SUPPORTED;
			}
		} catch(e) {
			throw responseCodes.FILE_FORMAT_NOT_SUPPORTED;
		}

		viewpoint.screenshot = imageBuffer;

		if (createThumbnail) {
			viewpoint.thumbnail = await utils.resizeAndCropScreenshot(imageBuffer, 120, 120, true).catch((err) => {
				systemLogger.logError("Resize failed as screenshot is not a valid png, no thumbnail will be generated", {
					account,
					model,
					type: collName,
					id: hostId,
					err
				});
			});
		}

		if (collName) {
			await Viewpoint.setExternalScreenshotRef(viewpoint, account, model, collName);
		}
	}

	return Viewpoint.cleanViewpoint(routePrefix, viewpoint, false);
};

Viewpoint.setExternalScreenshotRef = async function(viewpoint, account, model, collName) {
	const screenshot = viewpoint.screenshot;
	const ref = await FileRef.storeFile(account, model + "." + collName + ".ref", null, null, screenshot);
	delete viewpoint.screenshot;
	viewpoint.screenshot_ref = ref._id;
	return viewpoint;
};

module.exports = Viewpoint;
