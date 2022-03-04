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

const { src } = require('../../helper/path');
const { generateRandomString } = require('../../helper/services');

const Queue = require(`${src}/handler/queue`);
const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/utils/responseCodes`);

const testQueueMessages = () => {
	describe('Queue messages', () => {
		afterEach(Queue.close);

		test('Listener should get the appropriate messages once subscribed', async () => {
			const fn = jest.fn();
			const queueName = generateRandomString();
			const messageBefore = generateRandomString();
			const corIdBefore = generateRandomString();
			await Queue.queueMessage(queueName, corIdBefore, messageBefore);

			await expect(Queue.listenToQueue(queueName, fn)).resolves.toBeUndefined();

			const messageAfter = generateRandomString();
			const corIdAfter = generateRandomString();
			await Queue.queueMessage(queueName, corIdAfter, messageAfter);

			expect(fn).toHaveBeenCalledTimes(2);

			const { content: content1, properties: properties1 } = fn.mock.calls[0][0];
			expect(content1).toEqual(Buffer.from(messageBefore));
			expect(properties1).toEqual(expect.objectContaining({ correlationId: corIdBefore }));

			const { content: content2, properties: properties2 } = fn.mock.calls[1][0];
			expect(content2).toEqual(Buffer.from(messageAfter));
			expect(properties2).toEqual(expect.objectContaining({ correlationId: corIdAfter }));
		});

		test('Handler should treat errors on callbacks gracefully', async () => {
			const fn = jest.fn().mockImplementation(() => { throw new Error(); });
			const queueName = generateRandomString();
			const messageBefore = generateRandomString();
			const corIdBefore = generateRandomString();
			await Queue.queueMessage(queueName, corIdBefore, messageBefore);

			await expect(Queue.listenToQueue(queueName, fn)).resolves.toBeUndefined();

			const messageAfter = generateRandomString();
			const corIdAfter = generateRandomString();
			await Queue.queueMessage(queueName, corIdAfter, messageAfter);

			expect(fn).toHaveBeenCalledTimes(2);

			const { content: content1, properties: properties1 } = fn.mock.calls[0][0];
			expect(content1).toEqual(Buffer.from(messageBefore));
			expect(properties1).toEqual(expect.objectContaining({ correlationId: corIdBefore }));

			const { content: content2, properties: properties2 } = fn.mock.calls[1][0];
			expect(content2).toEqual(Buffer.from(messageAfter));
			expect(properties2).toEqual(expect.objectContaining({ correlationId: corIdAfter }));
		});
	});
};

const testExchangeMessages = () => {
	describe('Exchange messages', () => {
		afterEach(Queue.close);

		test('Listener should get the appropriate messages once subscribed', async () => {
			const fn = jest.fn();
			const exchangeName = generateRandomString();
			await Queue.broadcastMessage(exchangeName, generateRandomString());

			await expect(Queue.listenToExchange(exchangeName, fn)).resolves.toBeUndefined();

			const messageAfter = generateRandomString();
			await Queue.broadcastMessage(exchangeName, messageAfter);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(expect.objectContaining({ content: Buffer.from(messageAfter) }));
		});

		test('Handler should treat errors on callbacks gracefully', async () => {
			const fn = jest.fn().mockImplementation(() => { throw new Error(); });
			const exchangeName = generateRandomString();
			await expect(Queue.listenToExchange(exchangeName, fn)).resolves.toBeUndefined();

			const messageAfter = generateRandomString();
			await Queue.broadcastMessage(exchangeName, messageAfter);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(expect.objectContaining({ content: Buffer.from(messageAfter) }));
		});
	});
};

const testConnection = () => {
	describe('Queue connection', () => {
		afterEach(Queue.close);
		test(`Handler should fail with ${templates.queueConnectionError.code} if it failed to connect to the queue`, async () => {
			const fn = jest.fn();
			const exchangeName = generateRandomString();

			const { host } = config.cn_queue;
			config.cn_queue.host = generateRandomString();
			await expect(Queue.listenToExchange(exchangeName, fn)).rejects
				.toEqual(expect.objectContaining({ code: templates.queueConnectionError.code }));

			config.cn_queue.host = host;
		});

		test('Handler should automatically hook up the listeners again after reconnection', async () => {
			const fnExchange = jest.fn();
			const fnQueue = jest.fn();
			const exchangeName = generateRandomString();
			const queueName = generateRandomString();

			await expect(Queue.listenToExchange(exchangeName, fnExchange)).resolves.toBeUndefined();
			await expect(Queue.listenToQueue(queueName, fnQueue)).resolves.toBeUndefined();

			await Queue.close(false);
			await Queue.init();

			const messageEx = generateRandomString();
			await Queue.broadcastMessage(exchangeName, messageEx);

			const messageQu = generateRandomString();
			const corId = generateRandomString();
			await Queue.queueMessage(queueName, corId, messageQu);

			expect(fnExchange).toHaveBeenCalledWith(expect.objectContaining({ content: Buffer.from(messageEx) }));

			expect(fnQueue).toHaveBeenCalled();
			const { content, properties } = fnQueue.mock.calls[0][0];
			expect(content).toEqual(Buffer.from(messageQu));
			expect(properties).toEqual(expect.objectContaining({ correlationId: corId }));
		});
	});
};

describe('handler/queue', () => {
	testQueueMessages();
	testExchangeMessages();
	testConnection();
});
