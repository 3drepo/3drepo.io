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

const generateNotification = function(teamSpace, modelId, type, data) {
	return {_id:utils.stringToUUID(uuid.v1()), read:false, teamSpace, modelId, type, data };
};

/**
 * Fills out the models name and extra data for the  modelids passed throigh parameter.
 * It receives and object < string as teamspaceName : < string as modelId : Object > >
 * Return an object with the format < string as teamspaceName : < string as modelId : <..., name:string> > >
 * @param {Object} teamSpaces an object witch keys are teamspaces ids and values are an object witch keys are modelids
 * @returns {Object} which contains the models data
  */
const getModelsData = function(teamSpaces) {
	return Promise.all(
		_.map(teamSpaces, (val, key) => {
			const ACCOUNT_DB = key;
			const modelsIds = _.chain(val).map("modelId").uniq().value();

			return db.getCollection(ACCOUNT_DB, MODELS_COLL)
				.then(collection => collection.find({_id: {$in:modelsIds}}).toArray())
				.then(models => {
					const obj = {};
					obj[ACCOUNT_DB] =  _.chain(models).groupBy("_id").mapValues(v => v[0]).value();
					return obj;
				});
		})
	).then((modelData)=> modelData.reduce((ac,cur) => Object.assign(ac, cur),{})); // Turns the array to an object (quick indexing)
};

module.exports = {
	types,

	/**
	 * Creates a notification in the database
	 *
	 * @param {string} username The username of the account thats's gonna receive the notification
	 * @param {string} teamSpace The teamspace that is related to this notification
	 * @param {string} modelId The modelId that is related to this notification
	 * @param {string} type	The type of notification: should be one of the notifications that is in the types constants
	 * @param {Object} data The particular data for notification. should be relevant data for the particular type of notification.
	 * @returns {Promise} Returns a promise with the recently created notification
	 */
	insertNotification: function(username, teamSpace, modelId, type, data) {
		return db.getCollection(NOTIFICATIONS_DB, username).then((collection) =>
			collection.insertOne(generateNotification(teamSpace, modelId, type, data))
		).then((o) => utils.changeObjectIdToString(o.ops[0]));
	},

	/**
	 * This function is used for creating the assign issue notifications.
	 * When someone (username) asigns an issue to a new role this function should be
	 * called to create the new notifications for every user that has that role, except
	 * for the user that is assigning it
	 * @param {string} username The username of the user that is actually asigning the issue
	 * @param {string} teamSpace The teamspace corresponding to the model of the issue
	 * @param {string} modelId The model of the issue
	 * @param {Issue} issue The issue in shich the assignation is happening
	 * @returns {Promise<Notification[]>} It contains the newly created notifications
	 */
	insertIssueAssignedNotifications : function(username, teamSpace, modelId, issue) {
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
						u => this.insertNotification(u, teamSpace, modelId, this.types.ISSUE_ASSIGNED, {id:issue._id})
					)
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
				const teamSpaces = _.groupBy(notifications, "teamSpace");

				return getModelsData(teamSpaces).then((modelsData) => { // fills out the models name with data from the database
					return _.map(notifications,(notification) => {
						const teamSpace = (modelsData[notification.teamSpace] || {});
						const modelName = (teamSpace[notification.modelId] || {}).name;

						return Object.assign(notification, {modelName});
					});
				});
			});
	}
};