/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { SESSION_HEADER, session } = require('../sessions');
const SocketIO = require('socket.io');
const SocketsManager = require('./socketsManager');
const chatLabel = require('../../utils/logger').labels.chat;
const { cn_queue: { event_exchange: eventExchange } } = require('../../utils/config');
const { events } = require('../eventsManager/eventsManager.constants');
const { listenToExchange } = require('../../handler/queue');
const logger = require('../../utils/logger').logWithLabel(chatLabel);
const sharedSession = require('express-socket.io-session');
const { subscribe } = require('../eventsManager/eventsManager');

const ChatService = {};

const onMessageV4 = (service, msg) => {
	const { event, data, dm, recipient: sessionId, emitter, channel } = msg;
	if (dm) {
		const recipients = SocketsManager.getSocketIdsBySession(sessionId);
		if (recipients) {
			recipients.forEach((socketId) => {
				const recipientSocket = SocketsManager.getSocketById(socketId);
				if (recipientSocket) {
					recipientSocket.send({ event, data });
				}
			});
		}
	} else if (channel) {
		const sender = SocketsManager.getSocketById(emitter)?.broadcast || service;
		logger.logDebug(`[${channel}][NEW EVENT]: ${event}`);
		sender.to(channel).emit(event, data);
	} else {
		logger.logError('Unrecognised event message', msg);
	}
};

const onMessage = (service) => (data) => {
	try {
		const content = JSON.parse(data.content);
		onMessageV4(service, content);
	} catch (err) {
		logger.logError(`Failed to process event message ${err.messsage}`);
	}
};

const subscribeToEvents = (service) => {
	subscribe(events.SESSION_CREATED, ({ sessionID, socketId }) => {
		if (SocketsManager.getSocketById(socketId)) {
			SocketsManager.addSocketIdToSession(sessionID, socketId);
		}
	});

	listenToExchange(eventExchange, onMessage(service));
};

const init = (server) => {
	logger.logDebug('Initialising service');
	const service = SocketIO(server, { path: '/chat' });
	service.use(({ handshake }, next) => {
		if (handshake.query[SESSION_HEADER] && !handshake.headers.cookie) {
			// eslint-disable-next-line no-param-reassign
			handshake.headers.cookie = `${SESSION_HEADER}=${handshake.query[SESSION_HEADER]}; `;
		}
		next();
	});

	service.use(sharedSession(session, { autoSave: true }));
	service.on('connection', SocketsManager.addSocket);
	return service;
};

ChatService.createApp = (server) => {
	const service = init(server);
	subscribeToEvents(service);
};

module.exports = ChatService;
