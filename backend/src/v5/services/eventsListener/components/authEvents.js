/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { createDirectMessage, createInternalMessage } = require('../../chat');
const { EVENTS: chatEvents } = require('../../chat/chat.constants');
const { events } = require('../../eventsManager/eventsManager.constants');
const { notifyListenerFailure } = require('../listenerErrorNotification');
const { removeOldSessions } = require('../../sessions');
const { saveSuccessfulLoginRecord } = require('../../../models/loginRecords');
const { subscribe } = require('../../eventsManager/eventsManager');

const userLoggedIn = async ({ username, sessionID, socketId, ipAddress, userAgent, referer }) => {
	try {
		await Promise.all([
			saveSuccessfulLoginRecord(username, sessionID, ipAddress, userAgent, referer),
			removeOldSessions(username, sessionID, referer),
			...(socketId ? [createInternalMessage(chatEvents.LOGGED_IN, { sessionID, socketId })] : []),
		]);
	} catch (err) {
		await notifyListenerFailure({
			eventName: events.SESSION_CREATED,
			listenerName: 'userLoggedIn',
			component: 'authEvents',
			payload: {
				username,
				sessionID,
				socketId,
				ipAddress,
				userAgent,
				referer,
			},
			error: err,
		});
	}
};

const sessionsRemoved = async ({ ids, elective }) => {
	try {
		if (!elective) {
			await createDirectMessage(chatEvents.LOGGED_OUT, { reason: 'You have logged in else where' }, ids);
		}
		await createInternalMessage(chatEvents.LOGGED_OUT, { sessionIds: ids });
	} catch (err) {
		await notifyListenerFailure({
			eventName: events.SESSIONS_REMOVED,
			listenerName: 'sessionsRemoved',
			component: 'authEvents',
			payload: { ids, elective },
			error: err,
		});
	}
};

const AuthEventsListener = {};

AuthEventsListener.init = () => {
	subscribe(events.SESSION_CREATED, userLoggedIn);
	subscribe(events.SESSIONS_REMOVED, sessionsRemoved);
};

module.exports = AuthEventsListener;
