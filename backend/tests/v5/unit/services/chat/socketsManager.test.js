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

const _ = require('lodash');
const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v5/models/projectSettings');
const Projects = require(`${src}/models/projectSettings`);

jest.mock('../../../../../src/v5/utils/permissions');
const Permissions = require(`${src}/utils/permissions`);

const { templates } = require(`${src}/utils/responseCodes`);

const SocketsManager = require(`${src}/services/chat/socketsManager`);
const { ACTIONS, ERRORS, EVENTS, SESSION_CHANNEL_PREFIX } = require(`${src}/services/chat/chat.constants`);

const generateSocket = (session = generateRandomString()) => {
	const socket = {
		id: generateRandomString(),
		session: {
			id: session,
			user: { username: generateRandomString() },
		},
	};

	const functions = ['onDisconnect', 'onLeave', 'onJoin', 'emit', 'leave', 'join', 'broadcast', 'leaveAll'];

	functions.forEach((fnName) => {
		socket[fnName] = jest.fn();
	});

	return socket;
};

const createSocketWithEvents = () => {
	const socket = generateSocket();

	const eventFns = {
		leave: (msg) => socket.onLeave.mock.calls[0][0](msg),
		join: (msg) => socket.onJoin.mock.calls[0][0](msg),
		disconnect: () => socket.onDisconnect.mock.calls[0][0](),
	};

	return { eventFns, socket };
};

const getSessionFromSocket = (socket) => socket.session?.id;
const getUserNameFromSocket = (socket) => socket?.session?.user?.username;
const checkErrorCall = (fn, code, action, data) => {
	const messageData = { code, details: { action, data } };
	expect(fn).toHaveBeenCalled();
	const lastCall = fn.mock.calls.length - 1;
	expect(fn.mock.calls[lastCall][0]).toEqual(EVENTS.ERROR);
	expect(_.omit(fn.mock.calls[lastCall][1], ['message'])).toEqual(messageData);
};

const checkMessageCall = (fn, action, data) => {
	const messageData = { event: EVENTS.SUCCESS, data: { action, data } };
	expect(fn).toHaveBeenCalledWith(EVENTS.MESSAGE, messageData);
};

const testSocketsCollection = () => {
	describe('Socket add/remove/get', () => {
		test('should return socket that are added into the collection', () => {
			const socket = generateSocket();
			SocketsManager.addSocket(socket);

			expect(SocketsManager.getSocketById(socket.id)).toBe(socket);

			const socket2 = generateSocket();
			SocketsManager.addSocket(socket2);

			expect(SocketsManager.getSocketById(socket2.id)).toBe(socket2);

			expect(SocketsManager.getSocketById(socket.id)).toBe(socket);
		});

		test('should return undefined with unknown socket id', () => {
			expect(SocketsManager.getSocketById(generateRandomString())).toBe(undefined);
		});

		test('should subscribe to the relevant events when socket is being added ', () => {
			const socket = generateSocket();
			SocketsManager.addSocket(socket);

			expect(socket.onJoin).toHaveBeenCalledTimes(1);
			expect(socket.onLeave).toHaveBeenCalledTimes(1);
			expect(socket.onDisconnect).toHaveBeenCalledTimes(1);
		});
		test('should join the session channel if the user is authenticated', () => {
			const socket = generateSocket();
			SocketsManager.addSocket(socket);
			expect(socket.join).toHaveBeenCalledTimes(1);
			expect(socket.join).toHaveBeenCalledWith(`${SESSION_CHANNEL_PREFIX}${getSessionFromSocket(socket)}`);
		});

		test('should not join the session channel if the user is not authenticated', () => {
			const socket = generateSocket();
			delete socket.session.user;
			SocketsManager.addSocket(socket);
			expect(socket.join).not.toHaveBeenCalled();
		});
	});
	afterEach(SocketsManager.reset);
};

const testSocketsEvents = () => {
	describe('Socket events', () => {
		describe('On Disconnect', () => {
			afterEach(SocketsManager.reset);
			test('should disconnect the socket gracefully', () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);
				eventFns.disconnect();

				expect(SocketsManager.getSocketById(socket.id)).toBeUndefined();

				// disconnect called twice should not run into errors
				eventFns.disconnect();
			});
		});

		describe('On Leave', () => {
			afterEach(SocketsManager.reset);
			test('should process the leave function appropriately', () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const teamspace = generateRandomString();
				const project = generateRandomString();
				const model = generateRandomString();

				const data = { teamspace, project };
				eventFns.leave(data);
				expect(socket.leave).toHaveBeenCalledWith(`${teamspace}::${project}`);
				checkMessageCall(socket.emit, ACTIONS.LEAVE, data);

				const data2 = { teamspace, model, project };
				eventFns.leave(data2);
				expect(socket.leave).toHaveBeenCalledWith(`${teamspace}::${project}::${model}`);
				checkMessageCall(socket.emit, ACTIONS.LEAVE, data2);

				const data3 = { notifications: true };
				eventFns.leave(data3);
				expect(socket.leave).toHaveBeenCalledWith(`notifications::${getUserNameFromSocket(socket)}`);
				checkMessageCall(socket.emit, ACTIONS.LEAVE, data3);
			});

			test('should process the leave function appropriately (v4)', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const account = getUserNameFromSocket(socket);
				const project = generateRandomString();
				const model = generateRandomString();

				Projects.findProjectByModelId.mockResolvedValueOnce({ _id: project });

				const data = { account, model };
				await eventFns.leave(data);
				expect(socket.leave).toHaveBeenCalledWith(`${account}::${project}::${model}`);
				checkMessageCall(socket.emit, ACTIONS.LEAVE, data);

				const data2 = { account };
				await eventFns.leave(data2);
				expect(socket.leave).toHaveBeenCalledWith(`notifications::${account}`);
				checkMessageCall(socket.emit, ACTIONS.LEAVE, data2);
			});

			test('should message the socket with error if the parameters do not match', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const data = { [generateRandomString()]: generateRandomString() };
				await eventFns.leave(data);
				expect(socket.leave).not.toHaveBeenCalled();
				checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.LEAVE, data);
			});

			test('should fail to leave model room if project was not found (v4)', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const account = generateRandomString();
				const model = generateRandomString();

				Projects.findProjectByModelId.mockRejectedValueOnce(templates.projectNotFound);

				const data = { account, model };
				await eventFns.leave(data);
				expect(socket.leave).not.toHaveBeenCalled();
				checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.LEAVE, data);
			});

			test('should fail to leave model room if findProjectByModelId failed with generic error (v4)', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const account = generateRandomString();
				const model = generateRandomString();

				Projects.findProjectByModelId.mockRejectedValueOnce(templates.unknown);

				const data = { account, model };
				await eventFns.leave(data);
				expect(socket.leave).not.toHaveBeenCalled();
				checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.LEAVE, data);
			});
		});

		describe('On Join', () => {
			afterEach(SocketsManager.reset);

			describe('Project room', () => {
				afterEach(SocketsManager.reset);

				test('should join successfully if the user is authorised to do so', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					const teamspace = generateRandomString();
					const project = generateRandomString();

					Permissions.isProjectAdmin.mockResolvedValueOnce(true);

					const data = { teamspace, project };
					await eventFns.join(data);
					expect(socket.join).toHaveBeenCalledWith(`${teamspace}::${project}`);
					checkMessageCall(socket.emit, ACTIONS.JOIN, data);
				});

				test('should fail to join the room if the user is not project admin', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					socket.join.mockClear();
					const teamspace = generateRandomString();
					const project = generateRandomString();

					Permissions.isProjectAdmin.mockResolvedValueOnce(false);

					const data = { teamspace, project };
					await eventFns.join(data);
					expect(socket.join).not.toHaveBeenCalled();
					checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.JOIN, data);
				});

				test('should fail gracefully if isProjectAdmin() threw an error', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					socket.join.mockClear();
					const teamspace = generateRandomString();
					const project = generateRandomString();

					Permissions.isProjectAdmin.mockRejectedValueOnce(templates.projectNotFound);

					const data = { teamspace, project };
					await eventFns.join(data);
					expect(socket.join).not.toHaveBeenCalled();
					checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.JOIN, data);
				});
			});

			describe('Model room', () => {
				afterEach(SocketsManager.reset);

				test('should join successfully if the user is authorised to do so', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					const teamspace = generateRandomString();
					const project = generateRandomString();
					const model = generateRandomString();

					Permissions.hasReadAccessToModel.mockResolvedValueOnce(true);

					const data = { teamspace, model, project };
					await eventFns.join(data);
					expect(socket.join).toHaveBeenCalledWith(`${teamspace}::${project}::${model}`);
					checkMessageCall(socket.emit, ACTIONS.JOIN, data);
				});

				test('should join successfully if the user is authorised to do so (v4)', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					const account = generateRandomString();
					const project = generateRandomString();
					const model = generateRandomString();

					Permissions.hasReadAccessToModel.mockResolvedValueOnce(true);
					Projects.findProjectByModelId.mockResolvedValueOnce({ _id: project });

					const data = { account, model };
					await eventFns.join(data);
					expect(socket.join).toHaveBeenCalledWith(`${account}::${project}::${model}`);
					checkMessageCall(socket.emit, ACTIONS.JOIN, data);
				});
				test('should fail to join the room if the user does not have read access', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					socket.join.mockClear();
					const teamspace = generateRandomString();
					const project = generateRandomString();
					const model = generateRandomString();

					Permissions.hasReadAccessToModel.mockResolvedValueOnce(false);

					const data = { teamspace, model, project };
					await eventFns.join(data);
					expect(socket.join).not.toHaveBeenCalled();
					checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.JOIN, data);
				});

				test('should fail gracefully if hasReadAccessToModel() threw an error', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					socket.join.mockClear();
					const teamspace = generateRandomString();
					const project = generateRandomString();
					const model = generateRandomString();

					Permissions.hasReadAccessToModel.mockRejectedValueOnce(templates.projectNotFound);

					const data = { teamspace, model, project };
					await eventFns.join(data);
					expect(socket.join).not.toHaveBeenCalled();
					checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.JOIN, data);
				});

				test('should fail gracefully if project was not found (v4)', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					socket.join.mockClear();
					const account = generateRandomString();
					const model = generateRandomString();

					Projects.findProjectByModelId.mockRejectedValueOnce(templates.projectNotFound);

					const data = { account, model };
					await eventFns.join(data);
					expect(socket.join).not.toHaveBeenCalled();
					checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.JOIN, data);
				});

				test('should fail gracefully if findProjectByModelId failed with generic error (v4)', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					socket.join.mockClear();
					const account = generateRandomString();
					const model = generateRandomString();

					Projects.findProjectByModelId.mockRejectedValueOnce(templates.unknown);

					const data = { account, model };
					await eventFns.join(data);
					expect(socket.join).not.toHaveBeenCalled();
					checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.JOIN, data);
				});
			});

			describe('Notification room', () => {
				afterEach(SocketsManager.reset);
				test('should join successfully if the user is authorised to do so', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					socket.join.mockClear();
					const data = { notifications: true };
					await eventFns.join(data);
					expect(socket.join).toHaveBeenCalledWith(`notifications::${getUserNameFromSocket(socket)}`);
					checkMessageCall(socket.emit, ACTIONS.JOIN, data);
				});
				test('should join the notification room successfully if the user is authorised to do so (v4)', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					socket.join.mockClear();
					const username = getUserNameFromSocket(socket);
					const data = { account: username };
					await eventFns.join(data);
					expect(socket.join).toHaveBeenCalledWith(`notifications::${username}`);
					checkMessageCall(socket.emit, ACTIONS.JOIN, data);
				});
				test('should fail to join notification room if the username does not match (v4)', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					SocketsManager.addSocket(socket);

					socket.join.mockClear();
					const data = { account: generateRandomString() };
					await eventFns.join(data);
					expect(socket.join).not.toHaveBeenCalled();
					checkErrorCall(socket.emit, ERRORS.UNAUTHORISED, ACTIONS.JOIN, data);
				});

				test('should fail to join the notification room if the user is not authenticated', async () => {
					const { eventFns, socket } = createSocketWithEvents();
					delete socket.session.user;
					SocketsManager.addSocket(socket);

					socket.join.mockClear();
					const username = getUserNameFromSocket(socket);
					const data = { account: username };
					await eventFns.join(data);
					expect(socket.join).not.toHaveBeenCalled();
					checkErrorCall(socket.emit, ERRORS.UNAUTHORISED, ACTIONS.JOIN, data);
				});
			});

			test('should message the socket with error if the parameters do not match', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				socket.join.mockClear();
				const data = { [generateRandomString()]: generateRandomString() };
				await eventFns.join(data);
				expect(socket.join).not.toHaveBeenCalled();
				checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.JOIN, data);
			});
		});
	});
};

const testResetSocketsBySessionIds = () => {
	describe('Reset sockets by session Ids', () => {
		beforeEach(SocketsManager.reset);

		test('Should do nothing and return gracefully if sessions are empty', () => {
			const socket = generateSocket();
			SocketsManager.addSocket(socket);
			SocketsManager.resetSocketsBySessionIds([]);
			expect(socket.leaveAll).not.toHaveBeenCalled();
		});

		test('Socket with the given session should be forced to leave all rooms subscribed', () => {
			const session1 = generateRandomString();
			const session2 = generateRandomString();

			const sess1Soc1 = generateSocket(session1);
			SocketsManager.addSocket(sess1Soc1);

			const sess1Soc2 = generateSocket(session1);
			SocketsManager.addSocket(sess1Soc2);

			const sess2Soc1 = generateSocket(session2);
			SocketsManager.addSocket(sess2Soc1);

			const otherSoc = generateSocket();
			SocketsManager.addSocket(otherSoc);

			SocketsManager.resetSocketsBySessionIds([session1, session2, generateRandomString()]);

			[sess1Soc1, sess1Soc2, sess2Soc1].forEach((soc) => {
				expect(soc.leaveAll).toHaveBeenCalledTimes(1);
			});

			expect(otherSoc.leaveAll).not.toHaveBeenCalled();
		});
	});
};

describe('services/chat/socketsManager', () => {
	testSocketsCollection();
	testSocketsEvents();
	testResetSocketsBySessionIds();
});
