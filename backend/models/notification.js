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
const { hasWriteAccessToModelHelper, hasReadAccessToModelHelper } = require("../middlewares/checkPermissions");
const modelSettings = require("../models/modelSetting");
const job = require("./job");
const utils = require("../utils");
const uuid = require("node-uuid");
const db = require("../handler/db");
const _ = require("lodash");
const User = require("./user");

const types = {
	ISSUE_ASSIGNED : "ISSUE_ASSIGNED",
	ISSUE_CLOSED: "ISSUE_CLOSED",
	MODEL_UPDATED : "MODEL_UPDATED",
	MODEL_UPDATED_FAILED : "MODEL_UPDATED_FAILED"
};

const NOTIFICATIONS_DB = "notifications";

const generateNotification = function(type, data) {
	const timestamp = (new Date()).getTime();
	return Object.assign({_id:utils.stringToUUID(uuid.v1()), read:false, type, timestamp}, data);
};

const unionArrayMerger = function(objValue, srcValue) {
	if (_.isArray(objValue)) {
		return _.uniq(objValue.concat(srcValue));
	}
};

/* ========================================= */

/**
 * Creates a notification in the database
 *
 * @param {string} username The username of the account thats's gonna receive the notification
 * @param {string} type	The type of notification: should be one of the notifications that is in the types constants
 * @param {Object} data The particular data for notification. should be relevant data for the particular type of notification.
 * @returns {Promise} Returns a promise with the recently created notification
 */
const insertNotification = async (username, type, data) => {
	const notifColl = await db.getCollection(NOTIFICATIONS_DB, username);
	const insertion = await notifColl.insertOne(generateNotification(type, data));
	return utils.objectIdToString(insertion.ops[0]);
};

const deleteNotification = (username, _id) => {
	_id = utils.stringToUUID(_id);

	return db.getCollection(NOTIFICATIONS_DB, username)
		.then(c => c.deleteOne({_id}));
};

const updateNotification = (username, _id, data) => {
	_id =  utils.stringToUUID(_id);
	return db.getCollection(NOTIFICATIONS_DB, username).then((collection) =>
		collection.update({_id}, { $set: data })
	);
};

const upsertNotification = (username, data, type, criteria) => {
	return getNotification(username, type, criteria).then(notifications => {
		if (notifications.length === 0) {
			return insertNotification(username, type, Object.assign(criteria, data));
		} else {
			const n = notifications[0];
			const timestamp = (new Date()).getTime();
			const mergedData = Object.assign(_.mergeWith(n, data, unionArrayMerger), {read:false,timestamp});
			return updateNotification(username, n._id, mergedData).then(() => {
				const notification =  Object.assign(n, mergedData);
				return utils.objectIdToString(notification);
			});
		}
	});
};

/**
 * Extract the teamspaceId/modelId info from an array of notifications
 *
 * @param {Notification[]} notifications The array of notifications which the data willl be extracted
 * @returns {{keys..:Array<string>}} An object which keys are teamspaceId and an array of modelsIds as value
 */
const extractTeamSpaceInfo = function(notifications) {
	return _.mapValues(_.groupBy(notifications, "teamSpace"), (notification) => _.map(notification, v => v.modelId));
};

const fillModelNames = function(fullNotifications) {
	let notifications = [];

	// this handles then  the fullNotifications areW
	// in the form of [{user, notification},{user, notification}...]
	// or [notification, notification...]
	if (fullNotifications.length && fullNotifications[0].notification) {
		notifications = fullNotifications.map(n => n.notification);
	} else {
		notifications = fullNotifications;
	}

	const teamSpaces = extractTeamSpaceInfo(notifications);
	return  modelSettings.getModelsName(teamSpaces).then((modelsData) => { // fills out the models name with data from the database
		notifications.forEach (notification => {
			const teamSpace = (modelsData[notification.teamSpace] || {});
			const modelName = teamSpace[notification.modelId];
			Object.assign(notification, {modelName});
		});

		return fullNotifications;
	});
};

const getNotification = (username, type, criteria) =>
	db.getCollection(NOTIFICATIONS_DB, username)
		.then((collection) => collection.find(Object.assign({type},  criteria)).toArray());

const getHistoricAssignedRoles = (issue) => {
	const comments = issue.comments;
	const rolesKey = "assigned_roles";
	const assignedRoles = new Set();

	// Add the user who created the issue.
	assignedRoles.add(issue.creator_role);

	// Add current assigned role.
	assignedRoles.add(issue.assigned_roles[0]);

	for (const item in comments) {
		const actionProperty = comments[item].action;
		// Check for additional roles that have been assigned using the issue comments.

		if (actionProperty && actionProperty.property === rolesKey) {
			assignedRoles.add(actionProperty.from);
		}
	}

	return assignedRoles;
};

const upsertIssueClosedNotification = (username, teamSpace, modelId, issueId) => {
	const criteria = { teamSpace, modelId };
	const data = { issuesId: [issueId] };
	return upsertNotification(username, data, types.ISSUE_CLOSED, criteria);
};

const upsertIssueAssignedNotification = (username, teamSpace, modelId, issueId) => {
	const criteria = {teamSpace,  modelId};
	const data = {issuesId: [issueId] };
	return upsertNotification(username,data,types.ISSUE_ASSIGNED,criteria);
};

const insertModelUpdatedNotification = (username, teamSpace, modelId, revision) => {
	const data = {teamSpace,  modelId, revision};
	return insertNotification(username, types.MODEL_UPDATED, data);
};

const removeIssueFromNotification = (username, teamSpace, modelId, issueId, issueType) => {
	const criteria = {teamSpace,  modelId, issuesId:{$in: [issueId]}};

	return getNotification(username, issueType, criteria).then(notifications => {
		if (notifications.length === 0) {
			return null;
		} else {
			const n = notifications[0];
			const index = n.issuesId.findIndex(i => i === issueId);
			n.issuesId.splice(index, 1);
			const data = {issuesId : n.issuesId};

			if (data.issuesId.length === 0) {
				return deleteNotification(username, n._id)
					.then(() => ({deleted:true , notification: {_id: utils.objectIdToString(n._id) }}));
			}
			return updateNotification(username, n._id, data).then(() => {
				return {deleted:false , notification: utils.objectIdToString(n)};
			});
		}
	});
};

const createAssignedIssueNotification = (loggedUser, teamSpace, modelId, issueId, notifications) =>
	async (username) => { // the return nulls are necessary in order to work correctly in the Promise.all
		if (username === loggedUser) {
			return null;
		}

		const canWrite = await hasWriteAccessToModelHelper(username, teamSpace, modelId);
		if (!canWrite) {
			return null;
		}

		const notification = await upsertIssueAssignedNotification(username, teamSpace, modelId, issueId);
		notifications.push({username, notification});

		return null;
	};

module.exports = {
	deleteNotification,

	updateNotification,

	updateAllNotifications: async function(username, data) {
		const notifications = await db.getCollection(NOTIFICATIONS_DB, username);
		notifications.update({}, { $set: data }, {multi: true});
	},

	/**
	 * This delete all notifications for the particular user
	 */
	deleteAllNotifications: async function(username) {
		const notifications = await db.getCollection(NOTIFICATIONS_DB, username);
		notifications.deleteMany({});
	},

	/**
	 * This function is used for upserting the assign issue notifications.
	 * When someone (username) asigns an issue to a new role this function should be
	 * called to create the new notification for every user that has that role or update the one that already exist, except
	 * for the user that is assigning it
	 * @param {string} username The username of the user that is logged in
	 * @param {string} teamSpace The teamspace corresponding to the model of the issue
	 * @param {string} modelId The model of the issue
	 * @param {Issue} issue The issue in shich the assignation is happening
	 * @returns {Promise< Array<username:string,notification:Notification> >} It contains the newly created notifications and usernames
	 */
	upsertIssueAssignedNotifications : async function(username, teamSpace, modelId, issue) {
		const assignedRole = issue.assigned_roles[0];
		const rs = await job.findByJob(teamSpace,assignedRole);
		if (!rs || !rs.users) {
			return [];
		}

		let notifications = [];

		await Promise.all(
			rs.users.map(createAssignedIssueNotification(username, teamSpace, modelId, issue._id, notifications))
		);

		notifications =  await fillModelNames(notifications);
		return notifications;
	},

	/**
	 * This function inserts a modelUpdateNotification for
	 *
	 * @param {*} teamSpace
	 * @param {*} modelId
	 * @param {*} revision
	 * @returns {Promise< Array<username:string,notification:Notification> >} It contains the newly created notifications and usernames
	 *
	 */
	insertModelUpdatedNotifications: async function(teamSpace, modelId, revision) {
		const allUsers = await User.getAllUsersInTeamspace(teamSpace);
		const users = [];
		await Promise.all(allUsers.map(async user => {
			const access = await hasReadAccessToModelHelper(user, teamSpace, modelId);
			if (access) {
				users.push(user);
			}
		}));

		const notifications = await Promise.all(users.map(async username => {
			const notification = await insertModelUpdatedNotification(username, teamSpace, modelId, revision);
			return ({username, notification});
		}));

		return await fillModelNames(notifications);
	},

	/**
	 * This function inserts model update failed notifications
	 *
	 * @param {*} teamSpace
	 * @param {*} modelId
	 * @param {*} user
	 * @returns {Promise< Array<username:string,notification:Notification> >} It contains the newly created notifications and usernames
	 *
	 */
	insertModelUpdatedFailedNotifications :  async function(teamSpace, modelId,  username, errorMessage) {
		const data = {teamSpace,  modelId, errorMessage};
		const notification = await insertNotification(username, types.MODEL_UPDATED_FAILED, data);
		const notifications = [{username, notification}];
		return fillModelNames(notifications);
	},

	removeAssignedNotifications : function(username, teamSpace, modelId, issue) {
		if (!issue) {
			return Promise.resolve([]);
		}

		const assignedRole = issue.assigned_roles[0];

		return job.findByJob(teamSpace,assignedRole)
			.then(rs => {
				if (!rs || !rs.users) {
					return [];
				}

				return rs.users.filter(m => m !== username); // Leave out the user that is assigning the issue
			})
			.then((users) => {
				return Promise.all(
					users.map(u => removeIssueFromNotification(u, teamSpace, modelId, utils.objectIdToString(issue._id), types.ISSUE_ASSIGNED).then(n =>
						Object.assign({username:u}, n))))
					.then(notifications => notifications.reduce((a,c) => ! c.notification ? a : a.concat(c), []))
					.then(usersNotifications => {
						return fillModelNames(usersNotifications);
					});
			});
	},

	removeClosedNotifications: async function (username, teamSpace, modelId, issue) {
		if (!issue) {
			return Promise.resolve([]);
		}

		const assignedRoles = getHistoricAssignedRoles(issue);
		const issueType = types.ISSUE_CLOSED;

		const matchedUsers = await job.findUsersWithJobs(teamSpace, [...assignedRoles]);

		// Leave out the current user , closing the issue.
		const users = matchedUsers.filter(m => m !== username);

		// Filter the notifications, for each user to delete.
		const filterRolesToNotifications = await Promise.all(
			users.map(u => {
				return removeIssueFromNotification(u, teamSpace, modelId, utils.objectIdToString(issue._id), issueType)
					.then((n) => {
						return Object.assign({ username: u }, n);
					});
			})).then(notifications => notifications.reduce((a, c) => !c.notification ? a : a.concat(c), []));

		// Fill model names for the deleted, issues/notifications.
		return await fillModelNames(filterRolesToNotifications);
	},

	upsertIssueClosedNotifications: async function (username, teamSpace, modelId, issue) {
		const assignedRoles = getHistoricAssignedRoles(issue);
		const matchedUsers = await job.findUsersWithJobs(teamSpace, [...assignedRoles]);

		const users = [];
		const getUserPromises = [];

		for(const user of matchedUsers) {
			if(user !== username) {
				getUserPromises.push(hasWriteAccessToModelHelper(user, teamSpace, modelId).then((canWrite) => {
					const authUsers = { user, canWrite };
					if (authUsers.canWrite) {
						users.push(authUsers.user);
					}
				}));
			}
		}

		await Promise.all(getUserPromises);

		const userNotifications = await Promise.all(users.map(u => {
			return upsertIssueClosedNotification(u, teamSpace, modelId,  issue._id)
				.then((n) => {
					return ({ username: u, notification: n });
				});
		}));

		return await fillModelNames(userNotifications);
	},

	/**
	 * This function is used for retrieving a list of notifications for a particular user
	 *
	 * @param {string} username The username of the user which the notificatons belongs to
	 * @returns {Promise<Notification[]>} It contains the notifications for the user passed through parameter
 	 */
	getNotifications: function(username, criteria = {}) {
		if (criteria._id) {
			criteria._id = utils.stringToUUID(criteria._id);
		}

		return db.getCollection(NOTIFICATIONS_DB, username).then((collection) => collection.find(criteria, {sort: {timestamp: -1}}).toArray())
			.then(fillModelNames);
	}
};
