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
const { getModelsData } = require("./modelSetting");
const { listProjects } = require("./project");
const utils = require("../utils");
const db = require("../handler/db");
const _ = require("lodash");
const User = require("./user");

const {v5Path} = require("../../interop");
const { stringToUUID } = require(`${v5Path}/utils/helper/uuids`);
const { INTERNAL_DB } = require(`${v5Path}/handler/db.constants`);

const { getRoleById, getUsersByRoles } = require(`${v5Path}/models/roles`);

const types = {
	ISSUE_ASSIGNED : "ISSUE_ASSIGNED",
	ISSUE_CLOSED: "ISSUE_CLOSED",
	MODEL_UPDATED : "MODEL_UPDATED",
	MODEL_UPDATED_FAILED : "MODEL_UPDATED_FAILED",
	USER_REFERENCED : "USER_REFERENCED"
};

const NOTIFICATIONS_COLL = "notifications";

const generateNotification = function(type, data) {
	const timestamp = new Date();
	return Object.assign({_id:utils.generateUUID(), read:false, type, timestamp}, data);
};

// if opts.duplicates == true then array values can contain duplicates.
const unionArrayMerger = opts => (objValue, srcValue) => {
	if (_.isArray(objValue)) {
		if (opts && opts.duplicates) {
			return objValue.concat(srcValue);
		}

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
const insertNotification = async (user, type, data) => {
	const insertion = await db.insertOne(INTERNAL_DB, NOTIFICATIONS_COLL, { user, ...generateNotification(type, data) });
	return utils.objectIdToString(insertion.ops[0]);
};

const deleteNotification = (user, _id) => {
	_id = utils.stringToUUID(_id);

	return db.deleteOne(INTERNAL_DB, NOTIFICATIONS_COLL, { user, _id });
};

const updateNotification = (user, _id, data) => {
	_id =  utils.stringToUUID(_id);
	return db.updateMany(INTERNAL_DB, NOTIFICATIONS_COLL, { user, _id }, { $set: data });
};

const upsertNotification = async (username, data, type, criteria, opts) => {
	const notifications = await getNotification(username, type, criteria);
	if (notifications.length === 0) {
		return await insertNotification(username, type, Object.assign(criteria, data));
	}

	const n = notifications[0];
	const timestamp = new Date();

	const mergedData = {..._.mergeWith(n, data, unionArrayMerger(opts)), read:false,timestamp};

	await updateNotification(username, n._id, mergedData);
	const notification = {...n, ...mergedData};
	return utils.objectIdToString(notification);
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

const getModelToProject = async (teamspaces) => {
	const modelToProject = {};
	await Promise.all(teamspaces.map(async teamspace => {
		modelToProject[teamspace] = {};
		const projects = await listProjects(teamspace, {}, {models : 1});

		projects.forEach(({_id, models}) => {
			const projectId = utils.uuidToString(_id);
			models.forEach((model) => {
				modelToProject[teamspace][model] = projectId;
			});
		});

	}));
	return modelToProject;
};

const fillModelData = async function(fullNotifications) {
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
	const modelsData = await getModelsData(teamSpaces);
	const modelToProject = await getModelToProject(Object.keys(teamSpaces));

	notifications.forEach (notification => {
		const teamSpace = modelsData[notification.teamSpace] || {};
		const {name, federate} = teamSpace[notification.modelId] || {};
		Object.assign(notification, {timestamp: notification.timestamp?.getTime(), modelName: name, federation: federate, project: (modelToProject[notification.teamSpace] ?? {})[notification.modelId]});
	});

	return fullNotifications;

};

const getNotification = (user, type, criteria) =>
	db.find(INTERNAL_DB, NOTIFICATIONS_COLL, { user, type, ...criteria });

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

const insertUserReferencedNotification = (referrer, teamSpace, modelId, type, id, referee) => {
	const data = { referrer, teamSpace, modelId };
	if (type === "issue") {
		data.issueId = id;
	} else {
		data.riskId = id;
	}
	return insertNotification(referee, types.USER_REFERENCED, data);
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

const upsertModelUpdatedNotification = (username, teamSpace, modelId, revision) => {
	const criteria = {teamSpace,  modelId};
	const data = {revisions: [revision]};
	return upsertNotification(username, data, types.MODEL_UPDATED, criteria, {duplicates: true});
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

		try {
			const canWrite = await hasWriteAccessToModelHelper(username, teamSpace, modelId);
			if (!canWrite) {
				return null;
			}
		} catch {
			return null;
		}

		const notification = await upsertIssueAssignedNotification(username, teamSpace, modelId, issueId);
		notifications.push({username, notification});

		return null;
	};

module.exports = {
	deleteNotification,

	updateNotification,

	updateAllNotifications: async function(user, data) {
		await db.updateMany(INTERNAL_DB, NOTIFICATIONS_COLL, { user }, { $set: data });
	},

	/**
	 * This delete all notifications for the particular user
	 */
	deleteAllNotifications: async function(user) {
		await db.deleteMany(INTERNAL_DB, NOTIFICATIONS_COLL, { user });
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
		const assignedRole = stringToUUID(issue.assigned_roles[0]);
		const rs = await getRoleById(teamSpace, assignedRole);
		if (!rs || !rs.users) {
			return [];
		}

		let notifications = [];

		await Promise.all(
			rs.users.map(createAssignedIssueNotification(username, teamSpace, modelId, issue._id, notifications))
		);

		notifications =  await fillModelData(notifications);
		return notifications;
	},

	/**
	 * This function upserts a modelUpdateNotification. If there was already a model update notification for
	 * that model it appends the revid in an array.
	 *
	 * @param {*} teamSpace
	 * @param {*} modelId
	 * @param {*} revision
	 * @returns {Promise< Array<username:string,notification:Notification> >} It contains the newly created notifications and usernames
	 *
	 */
	upsertModelUpdatedNotifications: async function(teamSpace, modelId, revision) {
		const allUsers = await User.getAllUsersInTeamspace(teamSpace);
		const users = [];
		await Promise.all(allUsers.map(async user => {
			try {
				const access = await hasReadAccessToModelHelper(user, teamSpace, modelId);
				if (access) {
					users.push(user);
				}
			} catch {
				// do nothing.
			}
		}));

		const notifications = await Promise.all(users.map(async username => {
			const notification = await upsertModelUpdatedNotification(username, teamSpace, modelId, revision);
			return ({username, notification});
		}));

		return await fillModelData(notifications);
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
		return fillModelData(notifications);
	},

	removeAssignedNotifications : function(username, teamSpace, modelId, issue) {
		if (!issue) {
			return Promise.resolve([]);
		}

		const assignedRole = stringToUUID(issue.assigned_roles[0]);

		return getRoleById(teamSpace,assignedRole)
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
						return fillModelData(usersNotifications);
					});
			});
	},

	removeClosedNotifications: async function (username, teamSpace, modelId, issue) {
		if (!issue) {
			return Promise.resolve([]);
		}

		const assignedRoles = getHistoricAssignedRoles(issue);
		const issueType = types.ISSUE_CLOSED;

		const matchedUsers = await getUsersByRoles(teamSpace, [...assignedRoles].map(stringToUUID));

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
		return await fillModelData(filterRolesToNotifications);
	},

	upsertIssueClosedNotifications: async function (username, teamSpace, modelId, issue) {
		const assignedRoles = getHistoricAssignedRoles(issue);
		const matchedUsers = await getUsersByRoles(teamSpace, [...assignedRoles].map(stringToUUID));

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

		return await fillModelData(userNotifications);
	},

	insertUserReferencedNotification: async function (referrer, teamspace, modelId, type, _id, referee) {
		try {
			await User.teamspaceMemberCheck(referee, teamspace);
			const notification = await insertUserReferencedNotification(referrer, teamspace, modelId, type, _id, referee);
			return await fillModelData([{username: referee, notification}]);
		} catch (e) {
			return [];
		}

	},

	/**
	 * This function is used for retrieving a list of notifications for a particular user
	 *
	 * @param {string} username The username of the user which the notificatons belongs to
	 * @returns {Promise<Notification[]>} It contains the notifications for the user passed through parameter
 	 */
	getNotifications: function(user, criteria = {}) {
		if (criteria._id) {
			criteria._id = utils.stringToUUID(criteria._id);
		}

		return db.find(INTERNAL_DB, NOTIFICATIONS_COLL, { user, type: {$in: Object.values(types)}, ...criteria }, undefined, {timestamp: -1}).then(fillModelData);
	}
};
