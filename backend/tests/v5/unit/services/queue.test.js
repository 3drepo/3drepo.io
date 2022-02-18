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

const { src, modelFolder, objModel } = require('../../helper/path');
const { generateRandomString } = require('../../helper/services');

jest.mock('amqplib');
const AMQP = require('amqplib');

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const config = require(`${src}/utils/config`);
const fs = require('fs/promises');
const path = require('path');

const { templates } = require(`${src}/utils/responseCodes`);

const Queue = require(`${src}/services/queue`);

const createFakeConnection = (sendToQueue, callbackConsume, eventConsume) => {
	const dummyFn = () => Promise.resolve();
	const consumeFn = ({ queue }, msg) => {
		if (queue === config.cn_queue.callback_queue) (callbackConsume || dummyFn)(queue, msg);
		else (eventConsume || dummyFn)(queue, msg);
	};
	const dummyChannel = {
		assertQueue: (qName) => Promise.resolve({
			queue: { queue: qName },
		}),
		sendToQueue: sendToQueue || dummyFn,
		consume: consumeFn,
		close: dummyFn,
		assertExchange: dummyFn,
		bindQueue: dummyFn,
	};
	return {
		createChannel: () => Promise.resolve(dummyChannel),
		on: () => {},
		close: dummyFn,
	};
};

const publishFn = EventsManager.publish.mockImplementation(() => { });
AMQP.connect.mockRejectedValue(undefined);

const testQueueModelUpload = () => {
	const fileCreated = path.join(modelFolder, 'queueObjectTest.obj');
	describe('queue model upload', () => {
		const teamspace = 'teamspace';
		const model = 'modelID';
		const data = { tag: '123', owner: '123' };
		const file = { originalname: 'test.obj', path: fileCreated };

		test(`should fail with ${templates.queueInsertionFailed.code} if there is some generic error`, async () => {
			expect.assertions(1);
			try {
				await Queue.queueModelUpload(teamspace, model, data, file);
			} catch (err) {
				expect(err.code).toEqual(templates.queueInsertionFailed.code);
			}
		});

		test(`should fail with ${templates.queueConnectionError.code} if it cannot connect to queue`, async () => {
			await fs.copyFile(objModel, fileCreated);
			expect.assertions(1);
			try {
				await Queue.queueModelUpload(teamspace, model, data, file);
			} catch (err) {
				expect(err.code).toEqual(templates.queueConnectionError.code);
			}
		});

		test('should succeed with job inserted into the queue', async () => {
			await fs.copyFile(objModel, fileCreated);
			const sendToQueueFn = jest.fn(() => {});
			AMQP.connect.mockResolvedValueOnce(createFakeConnection(sendToQueueFn));

			await expect(Queue.queueModelUpload(teamspace, model, data, file)).resolves.toBe(undefined);

			expect(sendToQueueFn.mock.calls.length).toBe(1);
			const { correlationId: corId } = sendToQueueFn.mock.calls[0][2];

			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.QUEUED_TASK_UPDATE);
			expect(publishFn.mock.calls[0][1]).toEqual({ teamspace, model, corId, status: 'queued' });
		});
	});

	afterAll(() => fs.rm(fileCreated).catch(() => {}));
	afterEach(Queue.close);
};

const testQueueFederationUpdate = () => {
	describe('queue federation update', () => {
		const teamspace = generateRandomString();
		const federation = generateRandomString();
		const data = {
			containers: [generateRandomString(), generateRandomString(), generateRandomString()],
			owner: generateRandomString(),
		};

		test(`should fail with ${templates.queueInsertionFailed.code} if there is some generic error`, async () => {
			expect.assertions(1);
			try {
				await Queue.queueFederationUpdate(teamspace, federation, {});
			} catch (err) {
				expect(err.code).toEqual(templates.queueInsertionFailed.code);
			}
		});
		test(`should fail with ${templates.queueConnectionError.code} if it cannot connect to queue`, async () => {
			expect.assertions(1);
			try {
				await Queue.queueFederationUpdate(teamspace, federation, data);
			} catch (err) {
				expect(err.code).toEqual(templates.queueConnectionError.code);
			}
		});

		test('should succeed with job inserted into the queue', async () => {
			const sendToQueueFn = jest.fn(() => {});
			AMQP.connect.mockResolvedValueOnce(createFakeConnection(sendToQueueFn));

			await expect(Queue.queueFederationUpdate(teamspace, federation, data)).resolves.toBe(undefined);

			expect(sendToQueueFn.mock.calls.length).toBe(1);
			const { correlationId: corId } = sendToQueueFn.mock.calls[0][2];

			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.QUEUED_TASK_UPDATE);
			expect(publishFn.mock.calls[0][1]).toEqual({ teamspace, model: federation, corId, status: 'queued' });
		});
	});

	afterEach(Queue.close);
};

const testCallbackQueueConsumer = () => {
	describe('Callback queue consumption', () => {
		let callbackFn;
		test(`Should trigger ${events.QUEUED_TASK_UPDATE} event if there is a task update message`, async () => {
			publishFn.mockClear();
			const waitForConsume = new Promise((resolve) => {
				AMQP.connect.mockResolvedValueOnce(createFakeConnection(undefined, (a, cb) => {
					callbackFn = cb;
					resolve();
				}));
				Queue.init();
			});

			await waitForConsume;

			expect(callbackFn).not.toBe(undefined);
			const content = {
				database: generateRandomString(),
				status: generateRandomString(),
				project: generateRandomString(),
				user: generateRandomString(),
			};
			const properties = {
				correlationId: generateRandomString(),
			};
			await callbackFn({ content: JSON.stringify(content), properties });

			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.QUEUED_TASK_UPDATE);
			expect(publishFn.mock.calls[0][1]).toEqual({
				teamspace: content.database,
				model: content.project,
				corId: properties.correlationId,
				status: content.status,
				user: content.user,
			});
		});

		test(`Should trigger ${events.QUEUED_TASK_COMPLETED} event if there is a task failed message`, async () => {
			publishFn.mockClear();
			const waitForConsume = new Promise((resolve) => {
				AMQP.connect.mockResolvedValueOnce(createFakeConnection(undefined, (a, cb) => {
					callbackFn = cb;
					resolve();
				}));
				Queue.init();
			});

			await waitForConsume;

			expect(callbackFn).not.toBe(undefined);
			const content = {
				database: generateRandomString(),
				project: generateRandomString(),
				user: generateRandomString(),
				message: generateRandomString(),
				value: 1,
			};
			const properties = {
				correlationId: generateRandomString(),
			};
			await callbackFn({ content: JSON.stringify(content), properties });

			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.QUEUED_TASK_COMPLETED);
			expect(publishFn.mock.calls[0][1]).toEqual({
				teamspace: content.database,
				model: content.project,
				corId: properties.correlationId,
				value: content.value,
				message: content.message,
				user: content.user,
			});
		});

		test(`Should trigger ${events.QUEUED_TASK_COMPLETED} event with container information if the task was a federation`, async () => {
			publishFn.mockClear();
			const waitForConsume = new Promise((resolve) => {
				AMQP.connect.mockResolvedValueOnce(createFakeConnection(undefined, (a, cb) => {
					callbackFn = cb;
					resolve();
				}));
				Queue.init();
			});

			await waitForConsume;

			expect(callbackFn).not.toBe(undefined);
			const content = {
				database: generateRandomString(),
				value: 0,
				project: generateRandomString(),
				user: generateRandomString(),
			};
			const properties = {
				correlationId: generateRandomString(),
			};

			const containers = [
				generateRandomString(),
				generateRandomString(),
				generateRandomString(),
			];

			await fs.mkdir(`${config.cn_queue.shared_storage}/${properties.correlationId}`);
			await fs.writeFile(`${config.cn_queue.shared_storage}/${properties.correlationId}/obj.json`,
				JSON.stringify({ subProjects: containers }));
			await callbackFn({ content: JSON.stringify(content), properties });

			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.QUEUED_TASK_COMPLETED);
			expect(publishFn.mock.calls[0][1]).toEqual({
				teamspace: content.database,
				model: content.project,
				corId: properties.correlationId,
				value: content.value,
				message: content.message,
				user: content.user,
				containers,
			});
		});

		test('Should fail gracefully if the service failed to process the message', async () => {
			publishFn.mockClear();
			const waitForConsume = new Promise((resolve) => {
				AMQP.connect.mockResolvedValueOnce(createFakeConnection(undefined, (a, cb) => {
					callbackFn = cb;
					resolve();
				}));
				Queue.init();
			});

			await waitForConsume;

			expect(callbackFn).not.toBe(undefined);

			const properties = {
				correlationId: generateRandomString(),
			};
			await callbackFn({ content: {}, properties });

			expect(publishFn.mock.calls.length).toBe(0);
		});
	});

	afterEach(Queue.close);
};

describe('services/queue', () => {
	testQueueModelUpload();
	testQueueFederationUpdate();
	testCallbackQueueConsumer();
});
