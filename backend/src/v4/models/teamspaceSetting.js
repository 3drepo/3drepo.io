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
const db = require("../handler/db");
const responseCodes = require("../response_codes");
const utils = require("../utils");
const { v5Path } = require("../../interop");
const TeamspaceModelV5 = require(`${v5Path}/models/teamspaceSettings`);

const colName = "teamspace";

class TeamspaceSettings {
	createTeamspaceSettings(teamspace) {
		return TeamspaceModelV5.createTeamspaceSettings(teamspace);
	}

	grantAdminToUser(teamspace, username) {
		return TeamspaceModelV5.grantAdminToUser(teamspace, username);
	}

	async getTeamspaceSettings(account, projection = {}) {
		const foundSettings = await db.findOne(account, colName, {}, projection);

		if (!foundSettings) {
			return Promise.reject(responseCodes.TEAMSPACE_SETTINGS_NOT_FOUND);
		}

		return foundSettings;
	}

	async update(account, data) {
		const labelFields = ["riskCategories", "topicTypes"];

		const oldSettings = await this.getTeamspaceSettings(account);

		const toUpdate = {};

		labelFields.forEach((key) => {
			if (utils.hasField(data, key)) {
				if (Object.prototype.toString.call(data[key]) === "[object Array]") {
					const arrayUpdated = [];
					const foundKeys = {};
					for (let i = 0; i < data[key].length; ++i) {
						const entry = data[key][i];
						if (utils.isString(entry) && entry !== "") {
							const value = entry.trim();
							if (utils.hasField(foundKeys, value.toLowerCase())) {
								throw responseCodes.DUPLICATED_ENTRIES;
							}
							foundKeys[value.toLowerCase()] = 1;
							arrayUpdated.push(value);
						} else {
							throw responseCodes.INVALID_ARGUMENTS;
						}
					}
					toUpdate[key] = arrayUpdated;
				} else {
					throw responseCodes.INVALID_ARGUMENTS;
				}
			}
		});

		if (_.isEmpty(toUpdate)) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		// Update the data
		await db.updateOne(account, colName, { _id: account }, { $set: toUpdate });

		const updatedSettings = { ...oldSettings, ...toUpdate };

		return updatedSettings;
	}

	async updatePermissions(teamspace, updatedPermissions) {
		await db.updateOne(teamspace, colName, { _id: teamspace }, { $set: { permissions: updatedPermissions } });
	}

	async updateSubscriptions(teamspace, subscriptions) {
		await Promise.all(Object.keys(subscriptions).map((subType) => TeamspaceModelV5.editSubscriptions(teamspace, subType, {
			collaborators: subscriptions[subType].collaborators,
			data: subscriptions[subType].data,
			expiryDate: subscriptions[subType].expiryDate
		})));
	}
}

module.exports = new TeamspaceSettings();
