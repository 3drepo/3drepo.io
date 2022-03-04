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

describe('handler/queue', () => {
	testQueueMessages();
	testExchangeMessages();
});
