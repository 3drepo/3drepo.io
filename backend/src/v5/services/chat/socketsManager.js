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

const { UUIDToString, stringToUUID } = require('../../utils/helper/uuids');
const { EVENTS } = require('./chat.constants');
const chatLabel = require('../../utils/logger').labels.chat;
const { findProjectByModelId } = require('../../models/projects');
const { hasReadAccessToModel } = require('../../utils/permissions/permissions');
const logger = require('../../utils/logger').logWithLabel(chatLabel);

const socketIdToSocket = {};
const sessionToSocketIds = {};
const SocketsManager = {};

const getUserNameFromSocket = (socket) => socket?.handshake?.session?.user?.username;

const removeSocket = (socket) => {
	const sessionId = socket?.handshake?.session?.id;
	const socketId = socket.id;
	if (sessionToSocketIds[sessionId]) {
		if (sessionToSocketIds[sessionId].size === 1) {
			delete sessionToSocketIds[sessionId];
		} else {
			sessionToSocketIds[sessionId].delete(socketId);
		}
	}
	logger.logDebug(`[${getUserNameFromSocket(socket)}][${socketId}] disconnected`);
	delete socketIdToSocket[socketId];
};

const addSocket = (socket) => {
	socketIdToSocket[socket.id] = socket;
	const sessionId = socket?.handshake?.session?.id;
	SocketsManager.addSocketIdToSession(sessionId, socket.id);
};

const join = (socket, channelName, data) => {
	socket.join(channelName);
	socket.emit(EVENTS.JOINED, data);
	logger.logDebug(`[${getUserNameFromSocket(socket)}][${socket.id}] has joined ${channelName}`);
};

const joinRoom = async (socket, { teamspace, model, project, notifications }) => {
	const username = getUserNameFromSocket(socket);
	if (!username) {
		socket.emit(EVENTS.AUTH_ERROR, { message: 'You are not authenticated to the service' });
		return;
	}

	if (notifications) {
		join(socket, `notifications::${username}`, { notifications, username });
	} else if (teamspace && project && model) {
		const channelName = `${teamspace}::${project}::${model}`;
		if (await hasReadAccessToModel(teamspace, stringToUUID(project), model, username)) {
			join(socket, channelName, { teamspace, project, model });
		} else {
			socket.emit(EVENTS.AUTH_ERROR, { message: `You do not have sufficient access rights to join ${channelName}` });
		}
	} else {
		socket.emit(EVENTS.NOT_FOUND, { message: 'Trying to join an unindentified resource' });
	}
};

const joinRoomV4 = async (socket, { account, model }) => {
	// connects from v4 - convert them to v5 compatible room names
	if (model) {
		const project = await findProjectByModelId(account, model, { _id: 1 });
		if (!project) {
			socket.emit(EVENTS.AUTH_ERROR, { message: `Model ${model} does not belong in any project.` });
		}
		const projectId = UUIDToString(project._id);

		joinRoom(socket, { teamspace: account, model, project: projectId });
	} else if (account === getUserNameFromSocket(socket)) {
		joinRoom(socket, { notifications: true });
	} else {
		socket.emit(EVENTS.AUTH_ERROR, { message: 'You cannot subscribe to someone else\'s notifications.' });
	}
};

const leave = (socket, channelName) => {
	socket.leave(channelName);
	logger.logDebug(`[${getUserNameFromSocket(socket)}][${socket.Id}] has left ${channelName}`);
};

const leaveRoom = (socket, { teamspace, model, project, notifications }) => {
	if (notifications) {
		leave(socket, `notifications::${getUserNameFromSocket(socket)}`);
	} else if (teamspace && model && project) {
		leave(socket, `${teamspace}::${project}::${model}`);
	}
};

const leaveRoomV4 = async (socket, { account, model }) => {
	if (model) {
		const project = await findProjectByModelId(account, model, { _id: 1 });
		if (project) {
			leaveRoom(socket, { teamspace: account, model, project: project._id });
		}
	} else {
		leaveRoom(socket, { notifications: true });
	}
};

const subscribeToSocketEvents = (socket) => {
	const socketId = socket.id;
	socket.on('error', (err) => logger.logError(`[${socketId}] Socket error: ${err?.message}`));
	socket.on('disconnect', () => removeSocket(socket));
	socket.on('join', (data) => (data.account ? joinRoomV4(socket, data) : joinRoom(socket, data)));
	socket.on('leave', (data) => (data.account ? leaveRoomV4(socket, data) : leaveRoom(socket, data)));
};

SocketsManager.getSocketById = (id) => socketIdToSocket[id];

SocketsManager.addSocketIdToSession = (session, socketId) => {
	if (!sessionToSocketIds[session]) {
		sessionToSocketIds[session] = new Set();
	}
	sessionToSocketIds[session].add(socketId);
};

SocketsManager.getSocketIdsBySession = (session) => sessionToSocketIds[session];

SocketsManager.addSocket = (socket) => {
	logger.logDebug(`[${getUserNameFromSocket(socket)}][${socket.id}] connected`);
	addSocket(socket);
	subscribeToSocketEvents(socket);
};

// Used for testing only - should not be called in real life.
SocketsManager.reset = () => {
	Object.keys(sessionToSocketIds).forEach((session) => {
		delete sessionToSocketIds[session];
	});
	Object.keys(socketIdToSocket).forEach((id) => {
		delete socketIdToSocket[id];
	});
};

module.exports = SocketsManager;
