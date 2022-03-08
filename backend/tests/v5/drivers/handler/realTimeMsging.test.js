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
// const { generateRandomString } = require('../../helper/services');

const { SESSION_HEADER, session } = require(`${src}/services/sessions`);

const RealTime = require(`${src}/handler/realTimeMsging`);

const ip = '127.0.0.1';
const port = '3001';

const testSockets = () => {
	describe('Socket Connection', () => {
		let cleanUpFn;
		const onNewSocket = jest.fn();
		beforeAll(async () => {
			http.createServer();
			const server = http.createServer();
			server.listen(port, ip);
			const { middleware, deinitStore } = await session;
			const destroySocketIO = RealTime.createApp(server, middleware, SESSION_HEADER, onNewSocket);
			cleanUpFn = async () => {
				await destroySocketIO();
				await new Promise((resolve) => server.close(resolve));
				return deinitStore();
			};
		});
		afterAll(async () => {
			await cleanUpFn();
		});
		test('call back function should get called when a new socket joins', async () => {
			await new Promise((resolve, reject) => {
				const socket = ioClient(`http://${ip}:${port}`,
					{
						path: '/chat',
						transports: ['websocket'],
						reconnection: true,
						reconnectionDelay: 500,
					});

				socket.on('connect', () => {
					resolve();
					socket.disconnect();
				});

				socket.on('connect_error', (err) => {
					reject(err);
				});
			});

			expect(onNewSocket).toHaveBeenCalledTimes(1);
		});
	});
};

describe('Socket IO', () => {
	testSockets();
});
