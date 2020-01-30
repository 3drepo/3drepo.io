/**
 * Copyright (C) 2020 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const _ = require("lodash");
const db = require("../handler/db");
const responseCodes = require("../response_codes.js");

const colName = "teamspace";

const fieldTypes = {
	"_id": "[object String]",
	"topicTypes": "[object Array]",
	"riskCategories": "[object Array]"
};

class TeamspaceSettings {
	clean(settingsToClean) {
		settingsToClean.teamspace = settingsToClean._id;
		delete settingsToClean._id;

		return settingsToClean;
	}

	filterFields(data, blackList) {
		data = _.omit(data, blackList);
		return _.pick(data, Object.keys(fieldTypes));
	}

	getTeamspaceSettingsCollection(account) {
		return db.getCollection(account, colName);
	}

	async getTeamspaceSettings(account, noClean = false) {
		const settingsColl = await this.getTeamspaceSettingsCollection(account);
		let foundSettings = await settingsColl.findOne({ _id: account });

		if (!foundSettings) {
			return Promise.reject(responseCodes.TEAMSPACE_SETTINGS_NOT_FOUND);
		}

		if (!noClean) {
			foundSettings = this.clean(foundSettings);
		}

		return foundSettings;
	}

	async getRiskCategories(account) {
		const settings = await this.getTeamspaceSettings(account, true);
		const riskCategories = Object.assign([], settings.riskCategories);

		return riskCategories;
	}

	async getTopicTypes(account) {
		const settings = await this.getTeamspaceSettings(account, true);
		const topicTypes = Object.assign([], settings.topicTypes);

		return topicTypes;
	}

	async update(account, data, noClean = false) {
		const attributeBlacklist = ["_id"];
		const labelFields = ["riskCategories", "topicTypes"];

		const oldSettings = await this.getTeamspaceSettings(account, true);

		// Filter out blacklisted attributes and leave proper attrs
		data = this.filterFields(data, attributeBlacklist);

		if (_.isEmpty(data)) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		labelFields.forEach((key) => {
			if (Object.prototype.toString.call(data[key]) === "[object Array]") {
				const labelObject = {};
				data[key].forEach(label => {
					if (label &&
						Object.prototype.toString.call(label) === "[object String]" &&
						label.trim()) {
						// generate value from label
						const value = label.trim().toLowerCase().replace(/ /g, "_").replace(/&/g, "");

						if (labelObject[value]) {
							switch (key) {
								case "riskCategories":
									throw responseCodes.RISK_DUPLICATE_CATEGORY;
									break;
								case "topicTypes":
									throw responseCodes.ISSUE_DUPLICATE_TOPIC_TYPE;
									break;
							}
						} else {
							labelObject[value] = {
								value,
								label: label.trim()
							};
						}
					} else {
						throw responseCodes.INVALID_ARGUMENTS;
					}
				});

				data[key] = _.values(labelObject);
			} else if (data[key]) {
				throw responseCodes.INVALID_ARGUMENTS;
			}
		});

		// Update the data
		const settingsColl = await this.getTeamspaceSettingsCollection(account, true);
		await settingsColl.update({_id: account}, {$set: data});

		let updatedSettings = {...oldSettings, ...data};

		if (!noClean) {
			updatedSettings = this.clean(updatedSettings);
		}

		return updatedSettings;
	}
}

module.exports = new TeamspaceSettings();
