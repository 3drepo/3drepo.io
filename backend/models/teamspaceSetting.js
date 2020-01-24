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

const db = require("../handler/db");
const responseCodes = require("../response_codes.js");

const colName = "teamspace";

/*const fieldTypes = {
	"_id": "[object String]",
	"topicTypes": "[object Array]",
	"riskCategories": "[object Array]"
};*/

const defaultRiskCategories = [
	{ value: 'commercial', label: 'Commercial Issue' },
	{ value: 'environmental', label: 'Environmental Issue' },
	{ value: 'health_material_effect', label: 'Health - Material effect' },
	{ value: 'health_mechanical_effect', label: 'Health - Mechanical effect' },
	{ value: 'safety_fall', label: 'Safety Issue - Fall' },
	{ value: 'safety_trapped', label: 'Safety Issue - Trapped' },
	{ value: 'safety_event', label: 'Safety Issue - Event' },
	{ value: 'safety_handling', label: 'Safety Issue - Handling' },
	{ value: 'safety_struck', label: 'Safety Issue - Struck' },
	{ value: 'safety_public', label: 'Safety Issue - Public' },
	{ value: 'social', label: 'Social Issue' },
	{ value: 'other', label: 'Other Issue' },
	{ value: 'unknown', label: 'UNKNOWN' }
];

const defaultTopicTypes = [
	{value: "clash", label: "Clash"},
	{value: "diff", label: "Diff"},
	{value: "rfi", label: "RFI"},
	{value: "risk", label: "Risk"},
	{value: "hs", label: "H&S"},
	{value: "design", label: "Design"},
	{value: "constructibility", label: "Constructibility"},
	{value: "gis", label: "GIS"},
	{value: "for_information", label: "For information"},
	{value: "vr", label: "VR"}
];

class TeamspaceSettings {
	clean(settingsToClean) {
		settingsToClean.teamspace = settingsToClean._id;
		delete settingsToClean._id;

		return settingsToClean;
	}

	getTeamspaceSettingsCollection(account) {
		return db.getCollection(account, colName);
	}

	async getTeamspaceSettings(account, noClean = false) {
		const settings = await this.getTeamspaceSettingsCollection(account);
		let foundSettings = await settings.findOne({ _id: account });

		if (!foundSettings) {
			foundSettings = { _id: account };
		}

		if (!foundSettings.riskCategories) {
			foundSettings.riskCategories = defaultRiskCategories;
		}

		if (!foundSettings.topicTypes) {
			foundSettings.topicTypes = defaultTopicTypes;
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

	async addRiskCategory(account, category) {
	}

	async removeRiskCategory(account, category) {
	}

	async getTopicTypes(account) {
		const settings = await this.getTeamspaceSettings(account, true);
		const topicTypes = Object.assign([], settings.topicTypes);

		return topicTypes;
	}

	async addTopicType(account, topicType) {
	}

	async removeTopicType(account, topicType) {
	}
};

module.exports = new TeamspaceSettings();
