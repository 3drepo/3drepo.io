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

const { ACTIONS, ERRORS, EVENTS, SESSION_CHANNEL_PREFIX } = require('./chat.constants');
const { UUIDToString, stringToUUID } = require('../../utils/helper/uuids');
const { hasReadAccessToModel, isProjectAdmin, isTeamspaceAdmin } = require('../../utils/permissions');
const chatLabel = require('../../utils/logger').labels.chat;
const { findProjectByModelId } = require('../../models/projectSettings');
const logger = require('../../utils/logger').logWithLabel(chatLabel);

const socketIdToSocket = {};
const sessionIdToSockets = {};
const SocketsManager = {};

const getUserNameFromSocket = (socket) => socket.session?.user?.username;
const socketLogPrefix = (socket) => `[${socket.id}][${getUserNameFromSocket(socket)}][${socket.session?.id}]`;

const removeSocket = (socket) => {
	logger.logDebug(`${socketLogPrefix(socket)} disconnected`);
	delete socketIdToSocket[socket.id];
};

const emitError = (socket, error, message, action, data) => {
	socket.emit(EVENTS.ERROR, { code: error, message, details: { action, data } });
};

const joinRoom = async (socket, data) => {
	const { teamspace, model, project, notifications } = data;

	const username = getUserNameFromSocket(socket);
	let channelName;

	if (notifications) {
		channelName = `notifications::${username}`;
	} else if (teamspace && project && model) {
		channelName = `${teamspace}::${project}::${model}`;
		try {
			if (!await hasReadAccessToModel(teamspace, stringToUUID(project), model, username)) {
				throw { code: ERRORS.UNAUTHORISED, message: 'You do not have sufficient access rights to join the room requested' };
			}
		} catch (err) {
			throw { code: ERRORS.ROOM_NOT_FOUND, message: err.message };
		}
	} else if (teamspace && project) {
		channelName = `${teamspace}::${project}`;
		try {
			const isProjAdmin = await isProjectAdmin(teamspace, stringToUUID(project), username);
			if (!isProjAdmin && !await isTeamspaceAdmin(teamspace, username)) {
				throw { code: ERRORS.UNAUTHORISED, message: 'You do not have sufficient access rights to join the room requested' };
			}
		} catch (err) {
			throw { code: ERRORS.ROOM_NOT_FOUND, message: err.message };
		}
	} else {
		throw { code: ERRORS.ROOM_NOT_FOUND, message: 'Cannot identify the room indicated' };
	}

	socket.join(channelName);
	logger.logDebug(`${socketLogPrefix(socket)}  has joined ${channelName}`);
};

const joinRoomV4 = async (socket, data) => {
	const { account, model } = data;
	// connects from v4 - convert them to v5 compatible room names
	if (model) {
		try {
			const project = await findProjectByModelId(account, model, { _id: 1 });
			const projectId = UUIDToString(project._id);
			await joinRoom(socket, { teamspace: account, model, project: projectId });

			// v4 compatibility
			socket.emit('joined', data);
		} catch (err) {
			const errToThrow = { code: ERRORS.ROOM_NOT_FOUND, message: err.message };
			socket.emit('credentialError', errToThrow);
			throw errToThrow;
		}
	} else if (account === getUserNameFromSocket(socket)) {
		await joinRoom(socket, { notifications: true });
	} else {
		const error = { code: ERRORS.UNAUTHORISED, message: 'You cannot subscribe to someone else\'s notifications.' };
		socket.emit('credentialError', error);
		throw error;
	}
};

const leaveRoom = (socket, data) => {
	const { teamspace, model, project, notifications } = data;
	let channelName;
	if (notifications) {
		channelName = `notifications::${getUserNameFromSocket(socket)}`;
	} else if (teamspace && model && project) {
		channelName = `${teamspace}::${project}::${model}`;
	} else if (teamspace && project) {
		channelName = `${teamspace}::${project}`;
	} else {
		throw { code: ERRORS.ROOM_NOT_FOUND, message: 'Cannot identify the room indicated' };
	}
	socket.leave(channelName);
	logger.logDebug(`${socketLogPrefix(socket)} has left ${channelName}`);
};

const leaveRoomV4 = async (socket, data) => {
	const { account, model } = data;
	if (model) {
		try {
			const project = await findProjectByModelId(account, model, { _id: 1 });
			leaveRoom(socket, { teamspace: account, model, project: project._id });
		} catch (err) {
			throw { code: ERRORS.ROOM_NOT_FOUND, message: err.message };
		}
	} else {
		leaveRoom(socket, { notifications: true });
	}
};

const subscribeToSocketEvents = (socket) => {
	socket.onDisconnect(() => removeSocket(socket));
	socket.onJoin(async (data) => {
		try {
			const username = getUserNameFromSocket(socket);
			if (!username) {
				throw { code: ERRORS.UNAUTHORISED, message: 'You are not authenticated to the service.' };
			}
			if (data.account) {
				await joinRoomV4(socket, data);
			} else {
				await joinRoom(socket, data);
			}
			socket.emit(EVENTS.MESSAGE, { event: EVENTS.SUCCESS, data: { action: ACTIONS.JOIN, data } });
		} catch (err) {
			emitError(socket, err.code, err.message, ACTIONS.JOIN, data);
		}
	});
	socket.onLeave(async (data) => {
		try {
			if (data.account) {
				await leaveRoomV4(socket, data);
			} else {
				leaveRoom(socket, data);
			}
			socket.emit(EVENTS.MESSAGE, { event: EVENTS.SUCCESS, data: { action: ACTIONS.LEAVE, data } });
		} catch (err) {
			emitError(socket, err.code, err.message, ACTIONS.LEAVE, data);
		}
	});
};

SocketsManager.getSocketById = (id) => socketIdToSocket[id];

SocketsManager.addSocketToSession = (session, socket) => {
	socket.join(`${SESSION_CHANNEL_PREFIX}${session}`);
	sessionIdToSockets[session] = sessionIdToSockets[session] || [];
	sessionIdToSockets[session].push(socket);
};

SocketsManager.addSocket = (socket) => {
	logger.logDebug(`${socketLogPrefix(socket)}  connected`);
	socketIdToSocket[socket.id] = socket;
	subscribeToSocketEvents(socket);
	if (getUserNameFromSocket(socket)) {
		SocketsManager.addSocketToSession(socket.session.id, socket);
	}
};

SocketsManager.resetSocketsBySessionIds = (sessionIds) => {
	sessionIds.forEach((sessionId) => {
		if (sessionIdToSockets[sessionId]) {
			sessionIdToSockets[sessionId].forEach((socket) => socket.leaveAll());
			delete sessionIdToSockets[sessionId];
		}
	});
};

// Used for testing only - should not be called in real life.
SocketsManager.reset = () => {
	Object.keys(socketIdToSocket).forEach((id) => {
		delete socketIdToSocket[id];
	});
};

module.exports = SocketsManager;
