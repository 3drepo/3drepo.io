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
const hasWriteAccessToModel = require("../middlewares/checkPermissions").hasWriteAccessToModelHelper;
const job = require("../models/job");
const utils = require("../utils");
const uuid = require("node-uuid");
const db = require("../db/db");
const _ = require("lodash");

const types = {
	ISSUE_ASSIGNED : "ISSUE_ASSIGNED",
	ISSUE_CREATED : "ISSUE_CREATED"
};

const NOTIFICATIONS_DB = "notifications";
const MODELS_COLL = "settings";

const generateNotification = function(type, data) {
	const timestamp = (new Date()).getTime();
	return Object.assign({_id:utils.stringToUUID(uuid.v1()), read:false, type, timestamp}, data);
};

const uniqArrayMerger = function(objValue, srcValue) {
	if (_.isArray(objValue)) {
		return _.uniq(objValue.concat(srcValue));
	}
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

/**
 * Fills out the models name and extra data for the  modelids passed through parameter.
 * @param {Object} teamSpaces an object which keys are teamspaces ids and values are an object witch keys are modelids
 * @returns {Object} which contains the models data
  */
const getModelsData = function(teamSpaces) {
	return Promise.all(
		Object.keys(teamSpaces).map(ACCOUNT_DB => {
			const modelsIds = teamSpaces[ACCOUNT_DB];

			return db.getCollection(ACCOUNT_DB, MODELS_COLL)
				.then(collection => collection.find({_id: {$in:modelsIds}}).toArray())
				.then(models => {
					const res = {};
					const indexedModels = models.reduce((ac,c) => {
						const obj = {}; obj[c._id] = c; return Object.assign(ac,obj); // indexing by model._id
					} ,{});
					res[ACCOUNT_DB] = indexedModels;
					return res;
				});
		})
	).then((modelData)=> modelData.reduce((ac,cur) => Object.assign(ac, cur),{})); // Turns the array to an object (quick indexing);
};

module.exports = {
	types,

	/**
	 * Creates a notification in the database
	 *
	 * @param {string} username The username of the account thats's gonna receive the notification
	 * @param {string} type	The type of notification: should be one of the notifications that is in the types constants
	 * @param {Object} data The particular data for notification. should be relevant data for the particular type of notification.
	 * @returns {Promise} Returns a promise with the recently created notification
	 */
	insertNotification: function(username, type, data) {
		return db.getCollection(NOTIFICATIONS_DB, username).then((collection) =>
			collection.insertOne(generateNotification(type, data))
		).then((o) => utils.changeObjectIdToString(o.ops[0]));
	},

	updateNotification: function(username, _id, data) {
		const timestamp = (new Date()).getTime();
		return db.getCollection(NOTIFICATIONS_DB, username).then((collection) =>
			collection.update({ _id }, { $set: Object.assign(data,{read:false,timestamp})})
		).then(() => timestamp);
	},

	upsertNotification: function(username, data, type, criteria) {
		return db.getCollection(NOTIFICATIONS_DB, username).then((collection) =>
			collection.find(Object.assign({type},  criteria)).toArray()
		).then(notifications => {
			if (notifications.length === 0) {
				return this.insertNotification(username, type, Object.assign(criteria, data));
			} else {
				const n = notifications[0];
				const mergedData = Object.assign(_.mergeWith(n, data, uniqArrayMerger));
				return this.updateNotification(username, n._id, mergedData).then((timestamp) => {
					const notification =  Object.assign(n, mergedData, {read:false,timestamp});
					return utils.changeObjectIdToString(notification);
				});
			}
		});
	},

	upsertIssueAssignedtNotification: function(username, teamSpace, modelId, issueId) {
		const criteria = {teamSpace,  modelId};
		const data = {issuesId: [issueId] };
		return this.upsertNotification(username,data,types.ISSUE_ASSIGNED,criteria);
	},

	/**
	 * This function is used for upserting the assign issue notifications.
	 * When someone (username) asigns an issue to a new role this function should be
	 * called to create the new notification for every user that has that role or update the one that already exist, except
	 * for the user that is assigning it
	 * @param {string} username The username of the user that is actually asigning the issue
	 * @param {string} teamSpace The teamspace corresponding to the model of the issue
	 * @param {string} modelId The model of the issue
	 * @param {Issue} issue The issue in shich the assignation is happening
	 * @returns {Promise< Array<username:string,notification:Notification> >} It contains the newly created notifications and usernames
	 */
	upsertIssueAssignedNotifications : function(username, teamSpace, modelId, issue) {
		const assignedRole = issue.assigned_roles[0];

		return job.findByJob(teamSpace,assignedRole)
			.then(rs => {
				if (!rs || !rs.users) {
					return [];
				}

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
					assignedUsers.map(u => this.upsertIssueAssignedtNotification(u, teamSpace, modelId, issue._id).then(n=>({username:u, notification:n})))
				);
			});
	},

	/**
	 * This function is used for retrieving a list of notifications for a particular user
	 *
	 * @param {string} username The username of the user which the notificatons belongs to
	 * @returns {Promise<Notification[]>} It contains the notifications for the user passed through parameter
 	 */
	getNotifications: function(username) {
		return db.getCollection(NOTIFICATIONS_DB, username).then((collection) => collection.find().toArray())
			.then((notifications) => {
				const teamSpaces = extractTeamSpaceInfo(notifications);
				return getModelsData(teamSpaces).then((modelsData) => { // fills out the models name with data from the database

					return notifications.map(notification => {
						const teamSpace = (modelsData[notification.teamSpace] || {});
						const modelName = (teamSpace[notification.modelId] || {}).name;

						return Object.assign(notification, {modelName});
					});
				});
			});
	}
};