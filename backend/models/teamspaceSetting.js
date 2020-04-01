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
const User = require("./user");

const colName = "teamspace";

const fieldTypes = {
	"_id": "[object String]",
	"topicTypes": "[object Array]",
	"mitigationsUpdatedAt": "[object Number]",
	"riskCategories": "[object Array]"
};

class TeamspaceSettings {
	filterFields(data, blackList) {
		data = _.omit(data, blackList);
		return _.pick(data, Object.keys(fieldTypes));
	}

	getTeamspaceSettingsCollection(account) {
		return db.getCollection(account, colName);
	}

	async getTeamspaceSettings(account, projection = {}) {
		const settingsColl = await this.getTeamspaceSettingsCollection(account);
		let foundSettings = await settingsColl.findOne({ _id: account }, projection);

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

	async storeMitigationsFile(account, username, sessionId, filename, file) {
		const quota = await User.getQuotaInfo(account);
		const spaceLeft = ((quota.spaceLimit === null || quota.spaceLimit === undefined ? Infinity : quota.spaceLimit) - quota.spaceUsed) * 1024 * 1024;
		const spaceToBeUsed = file.size;
		const settingsColl = await this.getTeamspaceSettingsCollection(account, true);

		if (spaceLeft < spaceToBeUsed) {
			throw responseCodes.SIZE_LIMIT_PAY;
		}

		return FileRef.storeMitigationsFile(account, username, filename, file).then((storeResult) => {
			return settingsColl.update({_id: account}, {$set: {"mitigationsUpdatedAt":(new Date()).getTime()}}).then(() => {
				return storeResult;
			});
		});
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

		let updatedSettings = {...oldSettings, ...data};

		return updatedSettings;
	}
}

module.exports = new TeamspaceSettings();
