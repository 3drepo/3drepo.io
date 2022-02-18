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

const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

const SocketsManager = require(`${src}/services/chat/socketsManager`);

const generateSocket = (session = generateRandomString()) => ({
	id: generateRandomString(),
	on: jest.fn(),
	handshake: { session: { id: session } },

});

const testSocketsCollection = () => {
	describe('Socket add/remove/get', () => {
		test('should return socket that are added into the collection', () => {
			const socket = generateSocket();
			SocketsManager.addSocket(socket);

			expect(SocketsManager.getSocketById(socket.id)).toBe(socket);

			const socketBySession = SocketsManager.getSocketIdsBySession(socket.handshake.session.id);
			expect(socketBySession.size).toBe(1);
			expect(Array.from(socketBySession)).toEqual([socket.id]);

			const socketWithSameSession = generateSocket(socket.handshake.session.id);
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

describe('services/chat/socketsManager', () => {
	testSocketsCollection();
});
