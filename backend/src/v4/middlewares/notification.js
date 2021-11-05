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
const issues = require("../models/issue");
const _ = require("lodash");
const utils = require("../utils");

module.exports = {
	onUpdateIssue: function (req, res, next) {
		const username = req.session.user.username;
		const teamspace = req.params.account;
		const modelId = req.params.model;
		let oldIssue = null;
		let issue = null;

		const isCommentModification = utils.hasField(req.dataModel, "comment"); // In case the update of the issue is for commenting

		if (!isCommentModification) {
			oldIssue = req.oldDataModel;
			issue = req.dataModel;
		}

		if (issues.isIssueBeingClosed(oldIssue, issue)) {
			Promise.all([
				notification.removeAssignedNotifications(username, teamspace, modelId, oldIssue),
				notification.upsertIssueClosedNotifications(username, teamspace, modelId, issue)
			]).then((notifications) => {
				notifications = _.flatten(notifications);
				req.userNotifications = notifications;
				next();
			});
			return;
		}

		if (issues.isIssueBeingReopened(oldIssue, issue)) {
			notification.removeClosedNotifications(username, teamspace, modelId, issue)
				.then((notifications) => {
					notifications = _.flatten(notifications);
					req.userNotifications = notifications;
					next();
				});
			return;
		}

		if (!isCommentModification && issues.isIssueAssignment(oldIssue, issue)) {
			Promise.all([
				notification.removeAssignedNotifications(username, teamspace, modelId, oldIssue),
				notification.upsertIssueAssignedNotifications(username, teamspace, modelId, issue)
			]).then((notifications) => {
				notifications = _.flatten(notifications);
				req.userNotifications = notifications;
				next();
			});

		} else {
			next();
		}
	},

	onNewComment: (req, res, next) => {
		const username = req.session.user.username;
		const teamspace = req.params.account;
		const modelId = req.params.model;
		const _id = req.params.issueId || req.params.riskId;
		const { type, userRefs } = req.userReferences;

		if(userRefs) {
			Promise.all(
				userRefs.map((user) =>
					notification.insertUserReferencedNotification(username, teamspace, modelId, type, _id, user)
				)
			).then((notifications) => {
				req.userNotifications = _.flatten(notifications);
				next();
			});
		} else {
			next();
		}
	}
};
