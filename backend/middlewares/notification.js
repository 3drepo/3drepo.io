/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const hasWriteAccessToModel = require("./checkPermissions").hasWriteAccessToModelHelper;
const notification = require("../models/notification");
const job = require("../models/job");

const types = notification.types;

const isIssueAssignation = function(oldIssue, newIssue) {
	if (!oldIssue) {
		return newIssue.assigned_roles.length > 0; // In case this is a new issue with an assigned role
	}

	return oldIssue.assigned_roles[0] !== newIssue.assigned_roles[0];
};

/**
 * This function is used for creating the assign issue notifications.
 * When someone (username) asigns an issue to a new role this function should be
 * called to create the new notifications for every user that has that role, except
 * for the user that is assigning it
 * @param {string} username The username of the user that is actually asigning the issue
 * @param {string} teamSpace The teamspace corresponding to the model of the issue
 * @param {string} modelId The model of the issue
 * @param {Issue} issue The issue in shich the assignation is happening
 * @returns {Promise} It contains the newly created notifications
 */
const createIssueAssignedNotifications = function(username, teamSpace, modelId, issue) {
	const assignedRole = issue.assigned_roles[0];

	return job.findByJob(teamSpace,assignedRole)
		.then(rs => {
			const users = rs.users.filter(m => m !== username); // Leave out the user that is assigning the issue

			// For all the users with that assigned job we need
			// to find those that can modify the model
			return  Promise.all(
				users.map(user => hasWriteAccessToModel(user, teamSpace,modelId)
					.then(canWrite => ({user, canWrite}))
				)
			);
		})
		.then((users) => {
			const assignedUsers = users.filter(u => u.canWrite).map(u=> u.user);
			return Promise.all(
				assignedUsers.map(
					u =>
						notification.createNotification(u, teamSpace, modelId, types.ISSUE_ASSIGNED, {id:issue._id})
				)
			);
		});
};

module.exports = {
	onUpdateIssue: function(req, res, next) {
		const username = req.session.user.username;
		const teamspace = req.params.account;
		const modelId = req.params.model;
		const oldIssue = req.oldDataModel;
		const issue = req.dataModel;

		if (isIssueAssignation(oldIssue, issue)) {
			createIssueAssignedNotifications(username, teamspace, modelId, issue)
				.then(next);
		} else {
			next();
		}
	}
};