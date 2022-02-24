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

jest.mock('../../../../../src/v5/models/projects');
const Projects = require(`${src}/models/projects`);

jest.mock('../../../../../src/v5/utils/permissions/permissions');
const Permissions = require(`${src}/utils/permissions/permissions`);

const SocketsManager = require(`${src}/services/chat/socketsManager`);
const { ACTIONS, ERRORS, EVENTS } = require(`${src}/services/chat/chat.constants`);

const generateSocket = (session = generateRandomString()) => ({
	id: generateRandomString(),
	on: jest.fn(),
	handshake: { session: { id: session, user: { username: generateRandomString() } } },
	emit: jest.fn(),
	leave: jest.fn(),
	join: jest.fn(),

});

const createSocketWithEvents = () => {
	const eventFns = {};
	const socket = generateSocket();
	socket.on.mockImplementation((event, fn) => { eventFns[event] = fn; });
	return { eventFns, socket };
};

const getSessionFromSocket = (socket) => socket?.handshake?.session?.id;
const getUserNameFromSocket = (socket) => socket?.handshake?.session?.user?.username;
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

			const socketBySession = SocketsManager.getSocketIdsBySession(getSessionFromSocket(socket));
			expect(socketBySession.size).toBe(1);
			expect(Array.from(socketBySession)).toEqual([socket.id]);

			const socketWithSameSession = generateSocket(getSessionFromSocket(socket));
			SocketsManager.addSocket(socketWithSameSession);

			expect(socketBySession.size).toBe(2);
			expect(Array.from(socketBySession)).toEqual(expect.arrayContaining([socket.id, socketWithSameSession.id]));

			const socketWithDiffSession = generateSocket();
			SocketsManager.addSocket(socketWithDiffSession);

			expect(socketBySession.size).toBe(2);
			expect(Array.from(socketBySession)).toEqual(expect.arrayContaining([socket.id, socketWithSameSession.id]));

			const otherSessionSockets = SocketsManager.getSocketIdsBySession(
				socketWithDiffSession.handshake.session.id,
			);
			expect(otherSessionSockets.size).toBe(1);
			expect(Array.from(otherSessionSockets)).toEqual([socketWithDiffSession.id]);
		});

		test('should return undefined with unknown socket id', () => {
			expect(SocketsManager.getSocketById(generateRandomString())).toBe(undefined);
		});

		test('should return undefined with unknown session id', () => {
			expect(SocketsManager.getSocketIdsBySession(generateRandomString())).toBe(undefined);
		});

		test('should subscribe to the relevant events when socket is being added ', () => {
			const socket = generateSocket();
			SocketsManager.addSocket(socket);

			expect(socket.on.mock.calls.length).toBe(4);
			const events = socket.on.mock.calls.map((args) => args[0]);
			expect(events).toEqual(expect.arrayContaining(['error', 'disconnect', 'join', 'leave']));
		});
	});
	afterEach(SocketsManager.reset);
};

const testSocketsEvents = () => {
	describe('Socket events', () => {
		describe('On Error', () => {
			afterEach(SocketsManager.reset);
			test('should handle errors gracefully', () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);
				eventFns.error();
				eventFns.error({});
				eventFns.error(generateRandomString());
			});
		});

		describe('On Disconnect', () => {
			afterEach(SocketsManager.reset);
			test('should disconnect the socket gracefully', () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);
				eventFns.disconnect();

				expect(SocketsManager.getSocketById(socket.id)).toBeUndefined();
				expect(SocketsManager.getSocketIdsBySession(getSessionFromSocket(socket))).toBeUndefined();

				// disconnect called twice should not run into errors
				eventFns.disconnect();
			});

			test('when there is 2 sockets to 1 session, the other socket should still be available', () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const otherSocket = generateSocket(getSessionFromSocket(socket));
				SocketsManager.addSocket(otherSocket);
				expect(Array.from(SocketsManager.getSocketIdsBySession(getSessionFromSocket(socket))))
					.toEqual(expect.arrayContaining([socket.id, otherSocket.id]));

				eventFns.disconnect();

				expect(SocketsManager.getSocketById(socket.id)).toBeUndefined();
				expect(SocketsManager.getSocketById(otherSocket.id)).toBe(otherSocket);
				expect(Array.from(SocketsManager.getSocketIdsBySession(getSessionFromSocket(socket))))
					.toEqual(expect.arrayContaining([otherSocket.id]));
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

				const data = { teamspace, model, project };
				eventFns.leave(data);
				expect(socket.leave).toHaveBeenCalledWith(`${teamspace}::${project}::${model}`);
				checkMessageCall(socket.emit, ACTIONS.LEAVE, data);

				const data2 = { notifications: true };
				eventFns.leave(data2);
				expect(socket.leave).toHaveBeenCalledWith(`notifications::${getUserNameFromSocket(socket)}`);
				checkMessageCall(socket.emit, ACTIONS.LEAVE, data2);
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

			test('should message the socket with error if the project is not found (v4)', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const account = getUserNameFromSocket(socket);
				const model = generateRandomString();

				Projects.findProjectByModelId.mockResolvedValueOnce(undefined);

				const data = { account, model };
				await eventFns.leave(data);
				expect(socket.leave).not.toHaveBeenCalled();
				checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.LEAVE, data);
			});
		});

		describe('On Join', () => {
			afterEach(SocketsManager.reset);
			test('should join the model room successfully if the user is authorised to do so', async () => {
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

			test('should join the notification room successfully if the user is authorised to do so', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				Permissions.hasReadAccessToModel.mockResolvedValueOnce(true);

				const data = { notifications: true };
				await eventFns.join(data);
				expect(socket.join).toHaveBeenCalledWith(`notifications::${getUserNameFromSocket(socket)}`);
				checkMessageCall(socket.emit, ACTIONS.JOIN, data);
			});

			test('should join the model room successfully if the user is authorised to do so (v4)', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const account = generateRandomString();
				const project = generateRandomString();
				const model = generateRandomString();

				Permissions.hasReadAccessToModel.mockResolvedValueOnce(true);
				Projects.findProjectByModelId.mockResolvedValueOnce({ _id: project });

				const data = { account, model, project };
				await eventFns.join(data);
				console.log(socket.emit.mock.calls);
				expect(socket.join).toHaveBeenCalledWith(`${account}::${project}::${model}`);
				checkMessageCall(socket.emit, ACTIONS.JOIN, data);
			});

			test('should join the notification room successfully if the user is authorised to do so (v4)', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const username = getUserNameFromSocket(socket);
				const data = { account: username };
				await eventFns.join(data);
				expect(socket.join).toHaveBeenCalledWith(`notifications::${username}`);
				checkMessageCall(socket.emit, ACTIONS.JOIN, data);
			});
			/*
			test('should process the leave function appropriately (v4)', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const account = getUserNameFromSocket(socket);
				const project = generateRandomString();
				const model = generateRandomString();

				Projects.findyyProjectByModelId.mockImplementationOnce(() => ({ _id: project }));

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

			test('should message the socket with error if the project is not found (v4)', async () => {
				const { eventFns, socket } = createSocketWithEvents();
				SocketsManager.addSocket(socket);

				const account = getUserNameFromSocket(socket);
				const model = generateRandomString();

				Projects.findProjectByModelId.mockImplementationOnce(() => {});

				const data = { account, model };
				await eventFns.leave(data);
				expect(socket.leave).not.toHaveBeenCalled();
				checkErrorCall(socket.emit, ERRORS.ROOM_NOT_FOUND, ACTIONS.LEAVE, data);
			}); */
		});
	});
};

describe('services/chat/socketsManager', () => {
	testSocketsCollection();
	testSocketsEvents();
});
