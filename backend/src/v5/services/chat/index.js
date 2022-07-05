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
const { broadcastMessage, listenToExchange } = require('../../handler/queue');
const RTMsg = require('../../handler/realTimeMsging');
const { SESSION_CHANNEL_PREFIX } = require('./chat.constants');
const SocketsManager = require('./socketsManager');
const { UUIDToString } = require('../../utils/helper/uuids');
const chatLabel = require('../../utils/logger').labels.chat;
const { cn_queue: { event_exchange: eventExchange } } = require('../../utils/config');
const { events } = require('../eventsManager/eventsManager.constants');
const logger = require('../../utils/logger').logWithLabel(chatLabel);
const { subscribe } = require('../eventsManager/eventsManager');

const ChatService = {};

const broadcastToChannel = (sender, channel, event, data) => {
	logger.logDebug(`[${channel}][NEW EVENT]: ${event}\t${JSON.stringify(data)}`);
	sender.broadcast(channel, event, data);
};

const onMessageV4 = (service, msg) => {
	const { event, data, emitter, channel } = msg;
	const sender = SocketsManager.getSocketById(emitter) || service;
	broadcastToChannel(sender, channel, event, data);
};

const processMessage = (service, msg) => {
	const { recipients, event, data, sender } = msg;
	if (recipients?.length) { // direct message to sessions
		const socket = SocketsManager.getSocketById(sender);
		const emitter = socket || service;
		recipients?.forEach((channelName) => {
			broadcastToChannel(emitter, channelName, event, data);
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

const subscribeToEvents = (service) => {
	subscribe(events.SESSION_CREATED, ({ sessionID, socketId }) => {
		const socket = SocketsManager.getSocketById(socketId);
		if (socket) {
			SocketsManager.addSocketToSession(sessionID, socket);
		}
	});

	listenToExchange(eventExchange, onMessage(service));
};

ChatService.createDirectMessage = async (event, data, sessionIds) => {
	try {
		const recipients = sessionIds.map((sessionId) => `${SESSION_CHANNEL_PREFIX}${sessionId}`);
		const message = JSON.stringify({ event, data, recipients });
		await broadcastMessage(eventExchange, message);
	} catch (err) {
		// istanbul ignore next
		logger.logError(`Failed to create direct message: ${err.message}`);
	}
};

ChatService.createModelMessage = async (event, data, teamspace, projectId, model, sender) => {
	try {
		const project = UUIDToString(projectId);
		const recipients = [`${teamspace}::${project}::${model}`];
		const message = JSON.stringify({ event, data: { data, teamspace, project, model }, recipients, sender });
		await broadcastMessage(eventExchange, message);
	} catch (err) {
		// istanbul ignore next
		logger.logError(`Failed to send a model message: ${err?.message}`);
	}
};

ChatService.createProjectMessage = async (event, data, teamspace, projectId, sender) => {
	try {
		const project = UUIDToString(projectId);
		const recipients = [`${teamspace}::${project}`];
		const message = JSON.stringify({ event, data: { data, teamspace, project }, recipients, sender });
		await broadcastMessage(eventExchange, message);
	} catch (err) {
		// istanbul ignore next
		logger.logError(`Failed to send a project message: ${err?.message}`);
	}
};

ChatService.createApp = async (server) => {
	const { middleware } = await session;
	const socketServer = RTMsg.createApp(server, middleware, SESSION_HEADER, SocketsManager.addSocket);
	subscribeToEvents(socketServer);
	return {
		close: async () => {
			SocketsManager.reset();
			await socketServer.close();
			await server.close();
		},
	};
};

module.exports = ChatService;
