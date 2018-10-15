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
const Queue = require("../services/queue");
const C = require("../constants");

const queueUpsertNotification = function(session, notification) {
	const msg = {
		event : notification.username + "::notificationUpserted",
		channel : notification.username,
		emitter : session,
		data : notification.notification
	};

	return Queue.insertEventMessage(msg);
};

const queueDeleteNotification = function(session, notification) {
	const msg = {
		event : notification.username + "::notificationDeleted",
		channel : notification.username,
		emitter : session,
		data : {_id:notification.notification._id}
	};

	return Queue.insertEventMessage(msg);
};

module.exports = {
	onNotification: function(req, res, next) {
		const sessionId = req.headers[C.HEADER_SOCKET_ID];
		const notifications = (req.userNotifications  || []);

		const deletedNotifications = notifications.filter(n => n.deleted);
		const upsertedNotifications = notifications.filter(n => !n.deleted);

		deletedNotifications.forEach(queueDeleteNotification.bind(null,sessionId));
		upsertedNotifications.forEach(queueUpsertNotification.bind(null,sessionId));
		next();
	}
};