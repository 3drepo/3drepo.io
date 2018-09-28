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
const notification = require("../models/notification");

const isIssueAssignation = function(oldIssue, newIssue) {
	if (!oldIssue) {
		return newIssue.assigned_roles.length > 0; // In case this is a new issue with an assigned role
	}

	return oldIssue.assigned_roles[0] !== newIssue.assigned_roles[0];
};

module.exports = {
	onUpdateIssue: function(req, res, next) {
		const username = req.session.user.username;
		const teamspace = req.params.account;
		const modelId = req.params.model;
		let oldIssue = null;
		let issue = null;

		const isCommentModification = req.dataModel.hasOwnProperty("comment");

		if (!isCommentModification) {
			oldIssue = req.oldDataModel;
			issue = req.dataModel;
		}

		if (!isCommentModification && isIssueAssignation(oldIssue, issue)) {
			notification.insertIssueAssignedNotifications(username, teamspace, modelId, issue)
				.then(() => next());
		} else {
			next();
		}
	}
};