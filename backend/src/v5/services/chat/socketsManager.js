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

const { ACTIONS, ERRORS, EVENTS } = require('./chat.constants');
const { UUIDToString, stringToUUID } = require('../../utils/helper/uuids');
const chatLabel = require('../../utils/logger').labels.chat;
const { findProjectByModelId } = require('../../models/projects');
const { hasReadAccessToModel } = require('../../utils/permissions/permissions');
const logger = require('../../utils/logger').logWithLabel(chatLabel);
const { templates } = require('../../utils/responseCodes');

const socketIdToSocket = {};
const sessionToSocketIds = {};
const SocketsManager = {};

const getUserNameFromSocket = (socket) => socket.session?.user?.username;

const removeSocket = (socket) => {
	const sessionId = socket.session?.id;
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

const emitError = (socket, error, message, action, data) => {
	socket.emit(EVENTS.ERROR, { code: error, message, details: { action, data } });
};

const addSocket = (socket) => {
	socketIdToSocket[socket.id] = socket;
	const sessionId = socket.session?.id;
	SocketsManager.addSocketIdToSession(sessionId, socket.id);
};

const joinRoom = async (socket, data) => {
	const { teamspace, model, project, notifications } = data;
	const username = getUserNameFromSocket(socket);
	if (!username) {
		throw { code: ERRORS.UNAUTHORISED, message: 'You are not authenticated to the service.' };
	}

	let channelName;

	if (notifications) {
		channelName = `notifications::${username}`;
	} else if (teamspace && project && model) {
		channelName = `${teamspace}::${project}::${model}`;
		if (!await hasReadAccessToModel(teamspace, stringToUUID(project), model, username)) {
			throw { code: ERRORS.UNAUTHORISED, message: 'You do not have sufficient access rights to join the room requested' };
		}
	} else {
		throw { code: ERRORS.ROOM_NOT_FOUND, message: 'Cannot identify the room indicated' };
	}

	socket.join(channelName);
	logger.logDebug(`[${socket.id}][${getUserNameFromSocket(socket)}][${socket.session?.id}]  has joined ${channelName}`);
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
			const errToThrow = err.code === templates.projectNotFound.code
				? { code: ERRORS.ROOM_NOT_FOUND, message: `Model ${model} does not belong in any project.` }
				: err;

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
	} else {
		throw { code: ERRORS.ROOM_NOT_FOUND, message: 'Cannot identify the room indicated' };
	}
	socket.leave(channelName);
	logger.logDebug(`[${socket.id}][${getUserNameFromSocket(socket)}][${socket.session?.id}] has left ${channelName}`);
};

const leaveRoomV4 = async (socket, data) => {
	const { account, model } = data;
	if (model) {
		try {
			const project = await findProjectByModelId(account, model, { _id: 1 });
			leaveRoom(socket, { teamspace: account, model, project: project._id });
		} catch (err) {
			if (err.code === templates.projectNotFound.code) {
				throw { code: ERRORS.ROOM_NOT_FOUND, message: `Model ${model} does not belong in any project.` };
			}
			throw err;
		}
	} else {
		leaveRoom(socket, { notifications: true });
	}
};

const subscribeToSocketEvents = (socket) => {
	socket.onDisconnect(() => removeSocket(socket));
	socket.onJoin(async (data) => {
		try {
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

SocketsManager.addSocketIdToSession = (session, socketId) => {
	if (!sessionToSocketIds[session]) {
		sessionToSocketIds[session] = new Set();
	}
	sessionToSocketIds[session].add(socketId);
};

SocketsManager.getSocketIdsBySession = (session) => (sessionToSocketIds[session]
	? Array.from(sessionToSocketIds[session]) : undefined);

SocketsManager.addSocket = (socket) => {
	logger.logDebug(`[${socket.id}][${getUserNameFromSocket(socket)}][${socket.session?.id}]  connected`);
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
