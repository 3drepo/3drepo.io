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

const testListenToQueue = () => {
	describe('Processing queue messages', () => {
		afterEach(Queue.close);

		test('Should get the appropriate messages once subscribed', async () => {
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

		test('Should fail gracefully if the function callback fails', async () => {
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

describe('handler/queue', () => {
	testListenToQueue();
});
