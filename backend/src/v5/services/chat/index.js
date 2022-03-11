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

const { SESSION_CHANNEL_PREFIX, EVENTS: chatEvents } = require('./chat.constants');
const { SESSION_HEADER, session } = require('../sessions');
const { broadcastMessage, listenToExchange } = require('../../handler/queue');
const RTMsg = require('../../handler/realTimeMsging');
const SocketsManager = require('./socketsManager');
const chatLabel = require('../../utils/logger').labels.chat;
const { cn_queue: { event_exchange: eventExchange } } = require('../../utils/config');
const { events } = require('../eventsManager/eventsManager.constants');
const logger = require('../../utils/logger').logWithLabel(chatLabel);
const { subscribe } = require('../eventsManager/eventsManager');

const ChatService = {};

const broadcastToChannel = (sender, channel, event, data) => {
	logger.logDebug(`[${channel}][NEW EVENT]: ${event}${JSON.stringify(data)}`);
	sender.broadcast(channel, event, data);
};

const onMessageV4 = (service, msg) => {
	const { event, data, emitter, channel } = msg;
	const sender = SocketsManager.getSocketById(emitter) || service;
	logger.logDebug(`[${channel}][NEW EVENT]: ${event}`);
	broadcastToChannel(sender, channel, event, data);
};

const processMessage = (service, msg) => {
	const { recipients, event, data } = msg;
	if (recipients?.length) { // direct message to sessions
		recipients?.forEach((sessionId) => {
			const channelName = `${SESSION_CHANNEL_PREFIX}${sessionId}`;
			broadcastToChannel(service, channelName, event, data);

			// v4 client compatibility
			broadcastToChannel(service, channelName, chatEvents.MESSAGE, { event, data });
		});
	} else {
		logger.logError('Unrecognised event message', msg);
	}
};

const onMessage = (service) => (msg) => {
	try {
		const content = JSON.parse(msg.content);
		if (content.channel) {
			onMessageV4(service, content);
		} else {
			processMessage(service, content);
		}
	} catch (err) {
		logger.logError(`Failed to process event message ${err.messsage}`);
	}
};

const createDirectMessage = (event, data, sessionIds) => {
	const message = JSON.stringify({ event, data, recipients: sessionIds });
	broadcastMessage(eventExchange, message);
};

const subscribeToEvents = (service) => {
	subscribe(events.SESSION_CREATED, ({ sessionID, socketId }) => {
		const socket = SocketsManager.getSocketById(socketId);
		if (socket) {
			SocketsManager.addSocketToSession(sessionID, socket);
		}
	});

	subscribe(events.SESSIONS_REMOVED, ({ ids }) => {
		createDirectMessage(chatEvents.LOGGED_OUT, { reason: 'You have logged in else where' }, ids);
	});

	listenToExchange(eventExchange, onMessage(service));
};

ChatService.createApp = async (server) => {
	const { middleware, close } = await session;
	const socketServer = RTMsg.createApp(server, middleware, SESSION_HEADER, SocketsManager.addSocket);
	subscribeToEvents(socketServer);
	return {
		close: async () => {
			await socketServer.close();
			await close();
			await server.close();
		},
	};
};

module.exports = ChatService;
