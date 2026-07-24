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
const { templates: emailTemplates } = require('../../mailer/mailer.constants');
const { events } = require('../../eventsManager/eventsManager.constants');
const { removeOldSessions } = require('../../sessions');
const { saveSuccessfulLoginRecord } = require('../../../models/loginRecords');
const { sendSystemEmail } = require('../../mailer');
const { subscribe } = require('../../eventsManager/eventsManager');

const userLoggedIn = async (payload) => {
	const { username, sessionID, socketId, ipAddress, userAgent, referer } = payload;
	try {
		await Promise.all([
			saveSuccessfulLoginRecord(username, sessionID, ipAddress, userAgent, referer),
			removeOldSessions(username, sessionID, referer),
			...(socketId ? [createInternalMessage(chatEvents.LOGGED_IN, { sessionID, socketId })] : []),
		]);
	} catch (err) {
		if (err.status !== 404) {
			await sendSystemEmail(emailTemplates.LISTENER_ERROR_NOTIFICATION.name, {
				component: 'AuthEventsListener',
				listenerName: 'userLoggedIn',
				eventName: events.SESSION_CREATED,
				payload,
				error: { message: err.message, code: err.code, stack: err.stack },
			});
		}
	}
};

const sessionsRemoved = async (payload) => {
	const { ids, elective } = payload;
	try {
		if (!elective) {
			await createDirectMessage(chatEvents.LOGGED_OUT, { reason: 'You have logged in else where' }, ids);
		}
		await createInternalMessage(chatEvents.LOGGED_OUT, { sessionIds: ids });
	} catch (err) {
		if (err.status !== 404) {
			await sendSystemEmail(emailTemplates.LISTENER_ERROR_NOTIFICATION.name, {
				component: 'AuthEventsListener',
				listenerName: 'sessionsRemoved',
				eventName: events.SESSIONS_REMOVED,
				payload,
				error: { message: err.message, code: err.code, stack: err.stack },
			});
		}
	}
};

const AuthEventsListener = {};

AuthEventsListener.init = () => {
	subscribe(events.SESSION_CREATED, userLoggedIn);
	subscribe(events.SESSIONS_REMOVED, sessionsRemoved);
};

module.exports = AuthEventsListener;
