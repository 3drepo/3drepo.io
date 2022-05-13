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
const { generateRandomString, sleepMS } = require('../../helper/services');

const Queue = require(`${src}/handler/queue`);
const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/utils/responseCodes`);

const sendQueueMessage = async (queueName) => {
	const message = generateRandomString();
	const corId = generateRandomString();
	await Queue.queueMessage(queueName, corId, message);
	return { message, corId };
};

const checkQueueData = (dataSent, dataReceived) => {
	expect(dataReceived.content).toEqual(Buffer.from(dataSent.message));
	expect(dataReceived.properties).toEqual(expect.objectContaining({ correlationId: dataSent.corId }));
};

const sendExchangeMessage = async (exName) => {
	const message = generateRandomString();
	await Queue.broadcastMessage(exName, message);
	return message;
};

const checkExchangeMessage = (fn, message) => {
	expect(fn).toHaveBeenCalledWith(expect.objectContaining({ content: Buffer.from(message) }));
};

const testQueueMessages = () => {
	describe('Queue messages', () => {
		afterEach(Queue.close);

		test('Listener should get the appropriate messages once subscribed', async () => {
			const fn = jest.fn();
			const queueName = generateRandomString();
			const msgBefore = await sendQueueMessage(queueName);

			await expect(Queue.listenToQueue(queueName, fn)).resolves.toBeUndefined();

			const msgAfter = await sendQueueMessage(queueName);
			// ensure msg is consumed
			await sleepMS(10);

			expect(fn).toHaveBeenCalledTimes(2);

			checkQueueData(msgBefore, fn.mock.calls[0][0]);
			checkQueueData(msgAfter, fn.mock.calls[1][0]);
		});

		test('Handler should treat errors on callbacks gracefully', async () => {
			const fn = jest.fn().mockImplementation(() => { throw new Error(); });
			const queueName = generateRandomString();
			const msgBefore = await sendQueueMessage(queueName);

			await expect(Queue.listenToQueue(queueName, fn)).resolves.toBeUndefined();

			const msgAfter = await sendQueueMessage(queueName);

			// ensure msg is consumed
			await sleepMS(10);

			expect(fn).toHaveBeenCalledTimes(2);

			checkQueueData(msgBefore, fn.mock.calls[0][0]);
			checkQueueData(msgAfter, fn.mock.calls[1][0]);
		});
	});
};

const testExchangeMessages = () => {
	describe('Exchange messages', () => {
		afterEach(Queue.close);

		test('Listener should get the appropriate messages once subscribed', async () => {
			const fn = jest.fn();
			const exchangeName = generateRandomString();
			await sendExchangeMessage(exchangeName);

			await expect(Queue.listenToExchange(exchangeName, fn)).resolves.toBeUndefined();

			const messageAfter = await sendExchangeMessage(exchangeName);

			// ensure msg is consumed
			await sleepMS(10);

			expect(fn).toHaveBeenCalledTimes(1);
			checkExchangeMessage(fn, messageAfter);
		});

		test('Handler should treat errors on callbacks gracefully', async () => {
			const fn = jest.fn().mockImplementation(() => { throw new Error(); });
			const exchangeName = generateRandomString();
			await expect(Queue.listenToExchange(exchangeName, fn)).resolves.toBeUndefined();

			const messageAfter = await sendExchangeMessage(exchangeName);

			// ensure msg is consumed
			await sleepMS(10);

			expect(fn).toHaveBeenCalledTimes(1);
			checkExchangeMessage(fn, messageAfter);
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

			const messageEx = await sendExchangeMessage(exchangeName);
			const messageQu = await sendQueueMessage(queueName);

			checkExchangeMessage(fnExchange, messageEx);

			// ensure msg is consumed
			await sleepMS(10);

			expect(fnQueue).toHaveBeenCalledTimes(1);
			checkQueueData(messageQu, fnQueue.mock.calls[0][0]);
		});
	});
};

describe('AMQP', () => {
	testQueueMessages();
	testExchangeMessages();
	testConnection();
});
