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
const db = require("../db/db");
const utils = require("../utils");
const uuid = require("node-uuid");

module.exports = {
	types:{
		ISSUE_ASSIGNED : "ISSUE_ASSIGNED",
		ISSUE_CREATED : "ISSUE_CREATED"
	},

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
	createNotification(username, teamSpace, modelId, type, data) {
		const _id = uuid.v1();

		return db.getCollection("notifications", username).then((collection) => {
			const notification = {_id:utils.stringToUUID(_id), read:false, teamSpace, modelId, type, data };
			return collection.insertOne(notification);
		}).then((o) => Object.assign(o.ops[0], {_id}));
	}

};