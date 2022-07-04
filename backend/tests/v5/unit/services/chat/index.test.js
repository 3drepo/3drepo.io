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
	session: Promise.resolve({ middleware: jest.fn() }),
}));
const SessionService = require(`${src}/services/sessions`);

jest.mock('../../../../../src/v5/services/chat/socketsManager');
const SocketsManager = require(`${src}/services/chat/socketsManager`);

jest.mock('../../../../../src/v5/handler/queue');
const QueueService = require(`${src}/handler/queue`);

const ChatService = require(`${src}/services/chat`);
const { EVENTS: chatEvents, SESSION_CHANNEL_PREFIX } = require(`${src}/services/chat/chat.constants`);
const { cn_queue: { event_exchange: eventExchange } } = require(`${src}/utils/config`);

const socketCloseFn = jest.fn();
const broadcastFn = jest.fn();

RTM.createApp.mockReturnValue({ close: socketCloseFn, broadcast: broadcastFn });

const testInit = () => {
	describe('Init', () => {
		test('create App should create a socket io server and subscribe to messages', async () => {
			const server = { close: jest.fn() };
			await ChatService.createApp(server);

			expect(RTM.createApp).toHaveBeenCalledTimes(1);

			const { middleware } = await SessionService.session;

			expect(RTM.createApp).toHaveBeenCalledWith(
				server, middleware, SocketsManager.addSocket,
			);

			expect(QueueService.listenToExchange).toHaveBeenCalledTimes(1);
			expect(QueueService.listenToExchange.mock.calls[0][0]).toEqual(eventExchange);
		});

		test('should call the appriopriate functions if close() is called', async () => {
			const server = { close: jest.fn() };
			const { close: chatServiceClose } = await ChatService.createApp(server);

			await expect(chatServiceClose()).resolves.toBeUndefined();
			expect(server.close).toHaveBeenCalledTimes(1);
			expect(socketCloseFn).toHaveBeenCalledTimes(1);
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

		test('Should fail gracefully if the message format is not anticipated', () => {
			expect(subscribeCallBack({
				content: Buffer.from(JSON.stringify({ [generateRandomString()]: generateRandomString(),
				})) })).toBeUndefined();
		});

		describe('Direct message', () => {
			test('should process and broadcast it to the sessions channels', () => {
				const recipients = [generateRandomString(), generateRandomString(), generateRandomString()];
				const event = generateRandomString();
				const data = generateRandomString();
				const message = { recipients, event, data };

				expect(subscribeCallBack({ content: Buffer.from(JSON.stringify(message)) })).toBeUndefined();

				expect(broadcastFn).toHaveBeenCalledTimes(recipients.length);
				for (let i = 0; i < recipients.length; ++i) {
					expect(broadcastFn).toHaveBeenNthCalledWith(i + 1, recipients[i], event, data);
				}
			});
		});

		describe('Internal message', () => {
			describe(`${chatEvents.LOGGED_IN}`, () => {
				test('Should try to update session on the socket if it is within its management', () => {
					const socketId = generateRandomString();
					const sessionID = generateRandomString();
					SocketsManager.getSocketById.mockReturnValueOnce(true);

					const data = { sessionID, socketId };

					subscribeCallBack({
						content: Buffer.from(
							JSON.stringify({ internal: true, event: chatEvents.LOGGED_IN, data }),
						),
					});

					expect(SocketsManager.getSocketById).toHaveBeenCalledTimes(1);
					expect(SocketsManager.getSocketById).toHaveBeenCalledWith(socketId);
				});

				test('Should ignore the event if the socket is not within its management', () => {
					const socketId = generateRandomString();
					const sessionID = generateRandomString();
					SocketsManager.getSocketById.mockReturnValueOnce(false);
					const data = { sessionID, socketId };

					subscribeCallBack({
						content: Buffer.from(
							JSON.stringify({ internal: true, event: chatEvents.LOGGED_IN, data }),
						),
					});

					expect(SocketsManager.getSocketById).toHaveBeenCalledTimes(1);
					expect(SocketsManager.getSocketById).toHaveBeenCalledWith(socketId);

					expect(SocketsManager.addSocketToSession).not.toHaveBeenCalled();
				});
			});

			describe(`${chatEvents.LOGGED_OUT}`, () => {
				test('Should try call socketManager to reset the sockets associated with the sessions', () => {
					const sessionIds = [generateRandomString(), generateRandomString()];
					const data = { sessionIds };

					subscribeCallBack({
						content: Buffer.from(
							JSON.stringify({ internal: true, event: chatEvents.LOGGED_OUT, data }),
						),
					});

					expect(SocketsManager.resetSocketsBySessionIds).toHaveBeenCalledTimes(1);
					expect(SocketsManager.resetSocketsBySessionIds).toHaveBeenCalledWith(sessionIds);
				});
			});

			test('Should ignore the event and not crash if it is not recognised', () => {
				const data = { [generateRandomString()]: generateRandomString() };

				subscribeCallBack({
					content: Buffer.from(
						JSON.stringify({ internal: true, event: generateRandomString(), data }),
					),
				});
			});
		});

		describe('Channel Broadcast', () => {
			test('should process and broadcast on behalf of the sender', () => {
				const event = generateRandomString();
				const data = generateRandomString();
				const channel = generateRandomString();
				const emitter = generateRandomString();
				const message = { channel, event, data, emitter };

				SocketsManager.getSocketById.mockReturnValueOnce(undefined);

				expect(subscribeCallBack({ content: Buffer.from(JSON.stringify(message)) })).toBeUndefined();

				expect(broadcastFn).toHaveBeenCalledTimes(1);
				expect(broadcastFn).toHaveBeenCalledWith(channel, event, data);
			});

			test('should process and send using sender\'s socket if found', () => {
				const event = generateRandomString();
				const data = generateRandomString();
				const channel = generateRandomString();
				const emitter = generateRandomString();
				const message = { channel, event, data, emitter };

				const socket = { broadcast: jest.fn() };
				SocketsManager.getSocketById.mockReturnValueOnce(socket);

				expect(subscribeCallBack({ content: Buffer.from(JSON.stringify(message)) })).toBeUndefined();

				expect(broadcastFn).not.toHaveBeenCalled();

				expect(socket.broadcast).toHaveBeenCalledTimes(1);
				expect(socket.broadcast).toHaveBeenCalledWith(channel, event, data);
			});
		});
	});
};

const testCreateDirectMessage = () => {
	describe('CreateDirectMessage', () => {
		test('Should broadcast to event exchange', () => {
			const event = generateRandomString();
			const data = generateRandomString();
			const recipients = [generateRandomString(), generateRandomString(), generateRandomString()];

			ChatService.createDirectMessage(event, data, recipients);
			expect(QueueService.broadcastMessage).toHaveBeenCalledTimes(1);

			const expectedMsg = JSON.stringify({ event, data, recipients: recipients.map((id) => `${SESSION_CHANNEL_PREFIX}${id}`) });
			expect(QueueService.broadcastMessage).toHaveBeenCalledWith(eventExchange, expectedMsg);
		});
	});
};

const testCreateModelMessage = () => {
	describe('CreateModelMessage', () => {
		test('Should broadcast to event exchange', () => {
			const event = generateRandomString();
			const data = generateRandomString();
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			ChatService.createModelMessage(event, data, teamspace, project, model);
			expect(QueueService.broadcastMessage).toHaveBeenCalledTimes(1);

			const expectedMsg = JSON.stringify({ event, data: { data, teamspace, project, model }, recipients: [`${teamspace}::${project}::${model}`], sender: undefined });
			expect(QueueService.broadcastMessage).toHaveBeenCalledWith(eventExchange, expectedMsg);
		});
	});
};

const testCreateInternalMessage = () => {
	describe('CreateInternalMessage', () => {
		test('Should broadcast to event exchange', () => {
			const event = generateRandomString();
			const data = generateRandomString();

			ChatService.createInternalMessage(event, data);
			expect(QueueService.broadcastMessage).toHaveBeenCalledTimes(1);

			const expectedMsg = JSON.stringify({ internal: true, event, data });
			expect(QueueService.broadcastMessage).toHaveBeenCalledWith(eventExchange, expectedMsg);
		});
	});
};

describe('services/chat/index', () => {
	testInit();
	testOnNewMsg();
	testCreateDirectMessage();
	testCreateModelMessage();
	testCreateInternalMessage();
});
