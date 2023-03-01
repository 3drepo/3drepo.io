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

const http = require('http');
const { io: ioClient } = require('socket.io-client');
const { src } = require('../../helper/path');
const { determineTestGroup, generateRandomString } = require('../../helper/services');

const { session } = require(`${src}/services/sessions`);
const { disconnect } = require(`${src}/handler/db`);

const RealTime = require(`${src}/handler/realTimeMsging`);

const ip = '127.0.0.1';
const port = '3001';

const connectClient = () => new Promise((resolve, reject) => {
	const socket = ioClient(`http://${ip}:${port}`,
		{
			path: '/chat',
			transports: ['websocket'],
			reconnection: true,
			reconnectionDelay: 500,
		});

	socket.on('connect', () => {
		resolve(socket);
	});

	socket.on('connect_error', (err) => {
		reject(err);
	});
});

const startServer = async (onNewSocket) => {
	const server = http.createServer();
	server.listen(port, ip);
	const { middleware } = await session;
	const { broadcast, close: destroySocketIO } = RealTime.createApp(server, middleware, onNewSocket);

	return {
		broadcast,
		close: async () => {
			await destroySocketIO();
			await new Promise((resolve) => server.close(resolve));
		} };
};

const connectSocket = async (onNewSocket) => {
	onNewSocket.mockClear();
	const socketAtClient = await connectClient();
	expect(onNewSocket).toHaveBeenCalledTimes(1);
	const socketAtServer = onNewSocket.mock.calls[0][0];

	return { socketAtClient, socketAtServer };
};

const testSocketConnection = () => {
	describe('Socket Connection', () => {
		let cleanUpFn;
		const onNewSocket = jest.fn();
		beforeAll(async () => {
			cleanUpFn = (await startServer(onNewSocket)).close;
		});
		afterAll(async () => {
			await cleanUpFn();
		});

		test('call back function should get called when a new socket joins', async () => {
			const socket = await connectClient();
			expect(onNewSocket).toHaveBeenCalledTimes(1);
			const socketAtServ = onNewSocket.mock.calls[0][0];
			expect(socketAtServ.id).toEqual(socket.id);
			socket.disconnect();
		});

		test('disconnection should call the disconnect callback', async () => {
			const { socketAtClient, socketAtServer } = await connectSocket(onNewSocket);
			const serverDisconnect = new Promise((resolve) => {
				socketAtServer.onDisconnect(resolve);
			});

			socketAtClient.disconnect();
			await serverDisconnect;
		});
	});
};

const testSocketEmit = () => {
	describe('Socket emit', () => {
		let cleanUpFn;
		const onNewSocket = jest.fn();
		beforeAll(async () => {
			cleanUpFn = (await startServer(onNewSocket)).close;
		});
		afterAll(async () => {
			await cleanUpFn();
		});

		test('Server messages should be delivered to the client', async () => {
			const { socketAtClient, socketAtServer } = await connectSocket(onNewSocket);

			const event = generateRandomString();
			const message = { [generateRandomString()]: generateRandomString() };

			const messageProm = new Promise((resolve) => {
				socketAtClient.on(event, (msg) => {
					expect(msg).toEqual(message);
					resolve();
				});
			});

			socketAtServer.emit(event, message);

			await expect(messageProm).resolves.toBeUndefined();

			socketAtClient.disconnect();
		});

		test('Server should be able to catch join requests', async () => {
			const { socketAtClient, socketAtServer } = await connectSocket(onNewSocket);

			const message = { [generateRandomString()]: generateRandomString() };

			const messageProm = new Promise((resolve) => {
				socketAtServer.onJoin((msg) => {
					expect(msg).toEqual(message);
					resolve();
				});
			});

			socketAtClient.emit('join', message);

			await expect(messageProm);

			socketAtClient.disconnect();
		});

		test('Server should be able to catch leave requests', async () => {
			const { socketAtClient, socketAtServer } = await connectSocket(onNewSocket);

			const message = { [generateRandomString()]: generateRandomString() };

			const messageProm = new Promise((resolve) => {
				socketAtServer.onLeave((msg) => {
					expect(msg).toEqual(message);
					resolve();
				});
			});

			socketAtClient.emit('leave', message);

			await expect(messageProm);

			socketAtClient.disconnect();
		});
	});
};

const testSocketRooms = () => {
	describe('Socket rooms logic', () => {
		let cleanUpFn;
		let sendToRoom;
		const onNewSocket = jest.fn();
		beforeAll(async () => {
			const { broadcast, close } = await startServer(onNewSocket);
			cleanUpFn = close;
			sendToRoom = broadcast;
		});
		afterAll(async () => {
			await cleanUpFn();
		});

		const messageProm = (socket, event, message) => new Promise((resolve) => {
			socket.on(event, (msg) => {
				expect(msg).toEqual(message);
				resolve();
			});
		});

		const noMessageProm = (socket, event) => new Promise((resolve, reject) => {
			socket.on(event, () => { reject(new Error(`Event ${event} received at socket when it is not expected`)); });
			setTimeout(resolve, 10);
		});

		describe('Server should be able to broadcast to channels', () => {
			let socket1;
			let socket2;
			beforeEach(async () => {
				socket1 = await connectSocket(onNewSocket);
				socket2 = await connectSocket(onNewSocket);
			});

			afterEach(() => {
				socket1.socketAtClient.disconnect();
				socket2.socketAtClient.disconnect();
			});

			test('Sockets should receive the message should they have subscribed', async () => {
				const channel = generateRandomString();

				socket1.socketAtServer.join(channel);
				socket2.socketAtServer.join(channel);

				const event = generateRandomString();
				const message = generateRandomString();

				const msgProm = Promise.all([
					messageProm(socket1.socketAtClient, event, message),
					messageProm(socket2.socketAtClient, event, message),
				]);

				sendToRoom(channel, event, message);

				await msgProm;
			});

			test('Sockets should not receive the message should they have not subscribed', async () => {
				const channel = generateRandomString();

				socket1.socketAtServer.join(channel);

				const event = generateRandomString();
				const message = generateRandomString();

				const msgProm = Promise.all([
					messageProm(socket1.socketAtClient, event, message),
					noMessageProm(socket2.socketAtClient, event),
				]);

				sendToRoom(channel, event, message);

				await msgProm;
			});

			test('Sockets should not receive the message if they have left the channel', async () => {
				const channel = generateRandomString();

				socket1.socketAtServer.join(channel);
				socket2.socketAtServer.join(channel);

				const event = generateRandomString();
				const message = generateRandomString();

				socket2.socketAtServer.leave(channel);

				const msgProm = Promise.all([
					messageProm(socket1.socketAtClient, event, message),
					noMessageProm(socket2.socketAtClient, event),
				]);

				sendToRoom(channel, event, message);

				await msgProm;
			});

			test('Sockets should still get messages from other channels if they have left one', async () => {
				const channel = generateRandomString();
				const channel2 = generateRandomString();

				socket1.socketAtServer.join(channel);
				socket1.socketAtServer.join(channel2);

				const event = generateRandomString();
				const message = generateRandomString();

				const event2 = generateRandomString();
				const message2 = generateRandomString();

				socket1.socketAtServer.leave(channel);

				const msgProm = Promise.all([
					messageProm(socket1.socketAtClient, event2, message2),
					noMessageProm(socket1.socketAtClient, event),
				]);

				sendToRoom(channel, event, message);
				sendToRoom(channel2, event2, message2);

				await msgProm;
			});

			test('Sockets should not get messages from any channels if they have left all channels', async () => {
				const channel = generateRandomString();
				const channel2 = generateRandomString();

				socket1.socketAtServer.join(channel);
				socket1.socketAtServer.join(channel2);

				const event = generateRandomString();
				const message = generateRandomString();

				const event2 = generateRandomString();
				const message2 = generateRandomString();

				socket1.socketAtServer.leaveAll();

				const msgProm = Promise.all([
					noMessageProm(socket1.socketAtClient, event),
					noMessageProm(socket1.socketAtClient, event2),
				]);

				sendToRoom(channel, event, message);
				sendToRoom(channel2, event2, message2);

				await msgProm;
			});
		});

		test('Socket broadcast should be able only be received by other subscribed sockets', async () => {
			const socket1 = await connectSocket(onNewSocket);
			const socket2 = await connectSocket(onNewSocket);

			const channel = generateRandomString();

			socket1.socketAtServer.join(channel);
			socket2.socketAtServer.join(channel);

			const event = generateRandomString();
			const message = generateRandomString();

			const msgProm1 = Promise.all([
				noMessageProm(socket1.socketAtClient, event),
				messageProm(socket2.socketAtClient, event, message),
			]);

			socket1.socketAtServer.broadcast(channel, event, message);

			await msgProm1;

			const event2 = generateRandomString();
			const message2 = generateRandomString();

			const msgProm2 = Promise.all([
				messageProm(socket1.socketAtClient, event2, message2),
				noMessageProm(socket2.socketAtClient, event2),
			]);

			socket2.socketAtServer.broadcast(channel, event2, message2);
			await msgProm2;

			socket1.socketAtClient.disconnect();
			socket2.socketAtClient.disconnect();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testSocketConnection();
	testSocketEmit();
	testSocketRooms();
	afterAll(disconnect);
});
