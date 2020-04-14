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
const FileRef = require("./fileRef");
const colName = "teamspace";

const fieldTypes = {
	"_id": "[object String]",
	"topicTypes": "[object Array]",
	"mitigationsUpdatedAt": "[object Number]",
	"riskCategories": "[object Array]"
};

class TeamspaceSettings {
	async createTeamspaceSettings(account) {
		const settings = {
			"_id" : account,
			"topicTypes" : [
				"Clash",
				"Diff",
				"RFI",
				"Risk",
				"H&S",
				"Design",
				"Constructibility",
				"GIS",
				"For information",
				"VR"
			],
			"riskCategories" : [
				"Commercial Issue",
				"Environmental Issue",
				"Health - Material effect",
				"Health - Mechanical effect",
				"Safety Issue - Fall",
				"Safety Issue - Trapped",
				"Safety Issue - Event",
				"Safety Issue - Handling",
				"Safety Issue - Struck",
				"Safety Issue - Public",
				"Social Issue",
				"Other Issue",
				"UNKNOWN"
			]
		};
		const settingsColl = await this.getTeamspaceSettingsCollection(account);

		return await settingsColl.insert(settings);
	}

	filterFields(data, blackList) {
		data = _.omit(data, blackList);
		return _.pick(data, Object.keys(fieldTypes));
	}

	getTeamspaceSettingsCollection(account) {
		return db.getCollection(account, colName);
	}

	async getTeamspaceSettings(account, projection = {}) {
		const settingsColl = await this.getTeamspaceSettingsCollection(account);
		const foundSettings = await settingsColl.findOne({ _id: account }, projection);

		if (!foundSettings) {
			return Promise.reject(responseCodes.TEAMSPACE_SETTINGS_NOT_FOUND);
		}

		return foundSettings;
	}

	async getRiskCategories(account) {
		const settings = await this.getTeamspaceSettings(account, { riskCategories: 1 });

		return settings.riskCategories || [];
	}

	async getTopicTypes(account) {
		const settings = await this.getTeamspaceSettings(account, { topicTypes: 1 });

		return settings.topicTypes || [];
	}

	processMitigationsFile(account, username, sessionId, filename, file) {
		const User = require("./user"); // Circular dependencies, have to import here.
		if (User.hasSufficientQuota(account, file.size)) {
			const fileSizeLimit = require("../config").uploadSizeLimit;
			if(file.size > fileSizeLimit) {
				return Promise.reject(responseCodes.SIZE_LIMIT);
			}
			const fNameArr = filename.split(".");
			if (fNameArr.length < 2 || fNameArr[fNameArr.length - 1].toLowerCase() !== "csv") {
				return Promise.reject(responseCodes.FILE_FORMAT_NOT_SUPPORTED);
			}

			const storeFileProm = FileRef.storeMitigationsFile(account, username, filename, file).then(async () => {
				const settingsCol = await this.getTeamspaceSettingsCollection(account, true);
				const updatedAt = new Date();
				await settingsCol.update({_id: account}, {$set: {"mitigationsUpdatedAt":updatedAt}});
				return updatedAt;
			});

			const Mitigation = require("./mitigation");
			const readCSVProm = Mitigation.importCSV(account, file);
			return Promise.all([storeFileProm, readCSVProm]);
		} else {
			return Promise.reject(responseCodes.SIZE_LIMIT_PAY);
		}
	}

	async getMitigationsStream(account) {
		return await FileRef.getMitigationsStream(account);
	}

	async update(account, data) {
		const attributeBlacklist = ["_id", "mitigationsUpdatedAt"];
		const labelFields = ["riskCategories", "topicTypes"];

		const oldSettings = await this.getTeamspaceSettings(account);

		// Filter out blacklisted attributes and leave proper attrs
		data = this.filterFields(data, attributeBlacklist);

		if (_.isEmpty(data)) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		labelFields.forEach((key) => {
			if (Object.prototype.toString.call(data[key]) === "[object Array]") {
				data[key] = data[key].map(label => label.trim());
			} else if (data[key]) {
				throw responseCodes.INVALID_ARGUMENTS;
			}
		});

		// Update the data
		const settingsColl = await this.getTeamspaceSettingsCollection(account, true);
		await settingsColl.update({_id: account}, {$set: data});

		const updatedSettings = {...oldSettings, ...data};

		return updatedSettings;
	}
}

module.exports = new TeamspaceSettings();
