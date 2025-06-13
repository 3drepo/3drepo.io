/**
 *  Copyright (C) 2019 3D Repo Ltd
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

const moment = require("moment");
const { findModelSettingById } = require("./modelSetting");
const User = require ("./user");
const config = require("../config");
const C = require("../constants");
const Role = require("./role");
const utils = require("../utils");

const ReportType = {
	ISSUES : "Issues",
	RISKS: "Risks"
};

const riskLevelMapping = ["Very Low", "Low", "Moderate", "High", "Very High"];

const attributes = {};
attributes[ReportType.ISSUES] = [
	{label: "Assigned", field: "assigned_roles"},
	{label: "Priority", field: "priority"},
	{label: "Status", field: "status"},
	{label: "Type", field: "topic_type"},
	{label: "Due Date", field: "due_date", isDate: true}
];
attributes[ReportType.RISKS] = [
	{ label: "Safetibase ID", field: "safetibase_id"},
	{ label: "Risk Likelihood", field: "likelihood", mapping: riskLevelMapping},
	{ label: "Risk Consequence", field: "consequence", mapping: riskLevelMapping},
	{ label: "Level of Risk", field: "level_of_risk", mapping: riskLevelMapping},
	{ label: "Assigned", field: "assigned_roles"},
	{ label: "Category", field: "category"},
	{ label: "Associated Activity", field: "associated_activity"},
	{ label: "Element Type", field: "element"},
	{ label: "Risk Factor", field: "risk_factor"},
	{ label: "Construction Scope", field: "scope"},
	{ label: "Location", field: "location_desc"},
	{label: "Due Date", field: "due_date", isDate: true},
	{ label: "Treatment", field: "mitigation_desc"},
	{ label: "Treatment Details", field: "mitigation_detail"},
	{ label: "Treatment Stage", field: "mitigation_stage"},
	{ label: "Treatment Type", field: "mitigation_type"},
	{ label: "Treatment Status", field: "mitigation_status", default: "Unmitigated"},
	{ label: "Treatment Likelihood", field: "residual_likelihood", mapping: riskLevelMapping},
	{ label: "Treatment Consequence", field: "residual_consequence", mapping: riskLevelMapping},
	{ label: "Level of Treated Risk", field: "residual_level_of_risk", mapping: riskLevelMapping},
	{ label: "Residual Risk", field: "residual_risk", default: "None"}
];

const hiddenAttributes = [
	{label: "Pin", field: "position"}
];

const urlQS = {};
urlQS[ReportType.RISKS] = "riskId";
urlQS[ReportType.ISSUES] = "issueId";

const singularLabel = {};
singularLabel[ReportType.RISKS] = "risk";
singularLabel[ReportType.ISSUES] = "issue";

/**
 *
 * @param {Date} dateToFormat
 *
 * Format date by providing a date object
 * @return returns a string date
 */

function formatDate(date, printTime = true) {
	const formatToUse = printTime ? "Do MMM YYYY kk:mm" : "Do MMM YYYY";
	return moment(date).format(formatToUse);
}

class ReportGenerator {
	constructor(type, teamspace, project, model, rev) {
		this.userFullName = [];
		this.promises = [];
		this.type = type;
		this.typeSingular = singularLabel[type];
		this.teamspace = teamspace;
		this.modelID = model;
		this.projectID = project;
		this.rev = rev || this.getRevisionID(teamspace, model);
		this.reportDate = formatDate(new Date(), false);

		this.getModelName();
		this.getUsersToRoles();
	}

	getModelName() {
		this.promises.push(
			findModelSettingById(this.teamspace, this.modelID).then((setting) => {
				this.modelName = setting.name;
			})
		);
	}

	getRevisionID() {
		this.promises.push(
			require("./history").findLatest(this.teamspace, this.modelID, {timestamp: 1, tag: 1}).then((entry) => {
				if(entry) {
					this.rev = entry.tag ? entry.tag : "uploaded at " + formatDate(entry.timestamp);
				} else{
					this.rev = "not uploaded";
				}
			})
		);
	}

	getUsersToRoles() {
		this.promises.push(
			Role.usersWithRole(this.teamspace).then((usersToRole) => {
				this.userToRole = usersToRole;
			})
		);
	}

	getUserRole(user) {
		return utils.hasField(this.userToRole, user) ? this.userToRole[user] : "Unknown";
	}

	addEntries(entries) {
		this.entries = this.entries || [];
		const usersToQuery = new Set();
		entries.forEach((entry) => {
			const newEntry = {
				attributes: [],
				comments: []
			};
			entry.owner && usersToQuery.add(entry.owner);
			newEntry.owner = entry.owner || "Unknown";
			newEntry.created = formatDate(entry.created);
			newEntry.createdTS = entry.created;
			newEntry.number = entry.number || "";
			newEntry.screenshot = entry.viewpoint.screenshot;
			newEntry.screenshotURL = `${config.getBaseURL()}/v5/viewer/${this.teamspace}/${this.projectID}/${this.modelID}?${urlQS[this.type]}=${entry._id}`;
			newEntry.name = entry.name;

			newEntry.desc = entry.desc;

			attributes[this.type].forEach((field) => {
				const attri = { label: field.label };
				if (utils.hasField(entry, field.field)) {
					const value = entry[field.field];

					if(value === "" || value === undefined || value === null) {
						attri.value = field.default ? field.default : "Unknown";
					} else {
						if(field.mapping) {
							attri.value = field.mapping[value];
						} else if (field.isDate) {
							attri.value = formatDate(value, false);
						} else {
							attri.value =  Array.isArray(entry[field.field]) ?
								entry[field.field].join(", ") : entry[field.field];
						}

					}
					newEntry.attributes.push(attri);
				} else if (field.default) {
					attri.value = field.default;
					newEntry.attributes.push(attri);
				}
			});

			if (entry.comments) {
				entry.comments.forEach((comment) => {
					comment.owner || usersToQuery.add(comment.owner);
					comment.created = formatDate(comment.created);
					if (comment.viewpoint && comment.viewpoint.screenshot) {
						comment.screenshot = comment.viewpoint.screenshot;
					}
					if(comment.action) {
						if(comment.action.property === "due_date") {
							comment.action.to = formatDate(parseInt(comment.action.to), false);
							comment.action.from = comment.action.from ? formatDate(parseInt(comment.action.from), false) : undefined;
						}
						if(!comment.action.propertyText) {
							comment.action.propertyText = this.getPropertyLabel(comment.action.property);
						}
						if(comment.action.property === "position" || comment.action.property === "viewpoint" || comment.action.property === "screenshot") {
							comment.action.to = comment.action.from = "";
						} else if(!comment.action.to || comment.action.to === "") {
							comment.action.to = "(empty)";
						}
					}

					newEntry.comments.push(comment);
				});
			}
			this.entries.push(newEntry);
		});

		this.addUsersToNameMap(Array.from(usersToQuery));
	}

	addUsersToNameMap(users) {
		users.forEach((user) => {
			if(!this.userFullName[user]) {
				this.promises.push(
					User.findByUserName(user).then(username => {
						if (username) {
							this.userFullName[user] = username.customData.firstName + " " + username.customData.lastName;
						} else {
							this.userFullName[user] = "Unknown";
						}
					})
				);
			}
		});
	}

	getPropertyLabel(property) {
		const found = attributes[this.type].find((entry) => property === entry.field) ||
			hiddenAttributes.find((entry) => property === entry.field);
		return found ? found.label : property;
	}

	generateReport(res) {
		this.entries.sort((a, b) => a.createdTS < b.createdTS ? 1 : -1);
		return Promise.all(this.promises).then(() => {
			res.render(utils.getPugPath("report.pug"), {
				baseURL: config.getBaseURL(),
				url: function (path) {
					return config.apiAlgorithm.apiUrl(C.GET_API, path);
				},
				reportData: this
			});
		});
	}
}

module.exports = {
	newIssuesReport :  (teamspace, project, model, rev) =>  new ReportGenerator(ReportType.ISSUES, teamspace, project, model, rev),
	newRisksReport :  (teamspace, project, model, rev) =>  new ReportGenerator(ReportType.RISKS, teamspace, project, model, rev)
};
