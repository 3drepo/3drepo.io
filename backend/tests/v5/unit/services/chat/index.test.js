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

const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v5/handler/realTimeMsging');
const RTM = require(`${src}/handler/realTimeMsging`);

jest.mock('../../../../../src/v5/services/sessions', () => ({
	session: Promise.resolve({ middleware: jest.fn(), close: jest.fn() }),
	SESSION_HEADER: 'sessionHeader',
}));
const SessionService = require(`${src}/services/sessions`);

jest.mock('../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

jest.mock('../../../../../src/v5/services/chat/socketsManager');
const SocketsManager = require(`${src}/services/chat/socketsManager`);

jest.mock('../../../../../src/v5/handler/queue');
const QueueService = require(`${src}/handler/queue`);

const ChatService = require(`${src}/services/chat`);
const { cn_queue: { event_exchange: eventExchange } } = require(`${src}/utils/config`);

const socketCloseFn = jest.fn();
const broadcastFn = jest.fn();

RTM.createApp.mockReturnValue({ close: socketCloseFn, broadcastFn });

const testInit = () => {
	describe('Init', () => {
		test('create App should create a socket io server and subscribe to messages', async () => {
			const server = { close: jest.fn() };
			await ChatService.createApp(server);

			expect(RTM.createApp).toHaveBeenCalledTimes(1);

			const { middleware } = await SessionService.session;

			expect(RTM.createApp).toHaveBeenCalledWith(
				server, middleware, SessionService.SESSION_HEADER, SocketsManager.addSocket,
			);

			expect(EventsManager.subscribe).toHaveBeenCalledTimes(1);
			expect(EventsManager.subscribe.mock.calls[0][0]).toEqual(events.SESSION_CREATED);

			expect(QueueService.listenToExchange).toHaveBeenCalledTimes(1);
			expect(QueueService.listenToExchange.mock.calls[0][0]).toEqual(eventExchange);
		});

		test('should call the appriopriate functions if close() is called', async () => {
			const server = { close: jest.fn() };
			const { close: chatServiceClose } = await ChatService.createApp(server);

			await expect(chatServiceClose()).resolves.toBeUndefined();
			expect(server.close).toHaveBeenCalledTimes(1);
			expect(socketCloseFn).toHaveBeenCalledTimes(1);
			expect((await SessionService.session).close).toHaveBeenCalledTimes(1);
		});
	});
};

const testOnNewSessions = () => {
	describe('On new session event', () => {
		let subscribeCallBack;
		beforeAll(async () => {
			EventsManager.subscribe.mockClear();
			await ChatService.createApp({});
			[[, subscribeCallBack]] = EventsManager.subscribe.mock.calls;
		});

		test('Should try to update session on the socket if it is within its management', () => {
			const socketId = generateRandomString();
			const sessionID = generateRandomString();
			SocketsManager.getSocketById.mockReturnValueOnce(true);
			subscribeCallBack({ sessionID, socketId });

			expect(SocketsManager.getSocketById).toHaveBeenCalledTimes(1);
			expect(SocketsManager.getSocketById).toHaveBeenCalledWith(socketId);

			expect(SocketsManager.addSocketIdToSession).toHaveBeenCalledTimes(1);
			expect(SocketsManager.addSocketIdToSession).toHaveBeenCalledWith(sessionID, socketId);
		});

		test('Should ignore the event if the socket is not within its management', () => {
			const socketId = generateRandomString();
			const sessionID = generateRandomString();
			SocketsManager.getSocketById.mockReturnValueOnce(false);
			subscribeCallBack({ sessionID, socketId });

			expect(SocketsManager.getSocketById).toHaveBeenCalledTimes(1);
			expect(SocketsManager.getSocketById).toHaveBeenCalledWith(socketId);

			expect(SocketsManager.addSocketIdToSession).not.toHaveBeenCalled();
		});
	});
};

const testOnNewMsg = () => {
	describe('On new message from exchange', () => {
		let subscribeCallBack;
		beforeAll(async () => {
			QueueService.listenToExchange.mockClear();
			await ChatService.createApp({});
			[[, subscribeCallBack]] = QueueService.listenToExchange.mock.calls;
		});

		test('Should fail gracefully if there is an unforseen error on processing the message', () => {
			// an undefined data packet should cause a JSON parse error.
			expect(subscribeCallBack).not.toThrow();
		});

		test('process send the recipients the messages if it is a direct message', () => {
			const recipient = generateRandomString();
			const event = generateRandomString();
			const data = generateRandomString();
			const message = { dm: true, recipient, event, data };

			const socketIds = [generateRandomString(), generateRandomString(), generateRandomString()];
			SocketsManager.getSocketIdsBySession.mockReturnValueOnce(socketIds);

			const sockets = {
				[socketIds[0]]: { send: jest.fn() },
				// socketIds[1] is undefined on purpose
				[socketIds[2]]: { send: jest.fn() },
			};

			SocketsManager.getSocketById.mockImplementation((id) => sockets[id]);

			expect(subscribeCallBack({ content: Buffer.from(JSON.stringify(message)) })).toBeUndefined();

			Object.keys(sockets).forEach((id) => {
				expect(sockets[id].send).toHaveBeenCalledTimes(1);
				expect(sockets[id].send).toHaveBeenCalledWith(event, data);
			});
		});
	});
};
describe('services/chat/index', () => {
	testInit();
	testOnNewSessions();
	testOnNewMsg();
});
