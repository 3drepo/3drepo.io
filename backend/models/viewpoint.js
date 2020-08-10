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
			if ("[object String]" === targetType) {
				if (Array.isArray(_.get(viewpointToClean, field))) {
					_.set(viewpointToClean, field,  _.get(viewpointToClean, field).map(utils.uuidToString));
				} else {
					_.set(viewpointToClean, field, utils.uuidToString(_.get(viewpointToClean, field)));
				}

			} else if ("[object Object]" === targetType) {
				_.set(viewpointToClean, field, utils.stringToUUID(_.get(viewpointToClean, field)));
			}
		}
	});

	if (viewpointToClean.guid && (viewpointToClean.screenshot || viewpointToClean.screenshot_ref)) {
		const viewpointId = utils.uuidToString(viewpointToClean.guid);
		viewpointToClean.screenshot = `${routePrefix}/viewpoints/${viewpointId}/screenshot.png`;
	}

	return viewpointToClean;
};

module.exports = {
	clean
};
