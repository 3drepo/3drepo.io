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

jest.mock('../../../../src/v5/handler/queue');
const Queue = require(`${src}/handler/queue`);

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const config = require(`${src}/utils/config`);
const fs = require('fs/promises');
const path = require('path');

const { templates } = require(`${src}/utils/responseCodes`);

const ModelProcessing = require(`${src}/services/modelProcessing`);

Queue.listenToQueue.mockResolvedValue();
Queue.queueMessage.mockResolvedValue();

const publishFn = EventsManager.publish.mockImplementation(() => { });

const testQueueModelUpload = () => {
	const fileCreated = path.join(modelFolder, 'queueObjectTest.obj');
	describe('queue model upload', () => {
		const teamspace = 'teamspace';
		const model = 'modelID';
		const data = { tag: '123', owner: '123' };
		const file = { originalname: 'test.obj', path: fileCreated };

		test(`should fail with ${templates.queueInsertionFailed.code} if there is some generic error`, async () => {
			await expect(ModelProcessing.queueModelUpload(
				teamspace, model, data, file,
			)).rejects.toEqual(expect.objectContaining({ code: templates.queueInsertionFailed.code }));
		});

		test(`should fail with ${templates.queueConnectionError.code} if Queue handler threw the error`, async () => {
			await fs.copyFile(objModel, fileCreated);

			Queue.queueMessage.mockRejectedValueOnce(templates.queueConnectionError);

			await expect(ModelProcessing.queueModelUpload(
				teamspace, model, data, file,
			)).rejects.toEqual(expect.objectContaining({ code: templates.queueConnectionError.code }));
		});

		test('should succeed with job inserted into the queue', async () => {
			await fs.copyFile(objModel, fileCreated);
			await expect(ModelProcessing.queueModelUpload(teamspace, model, data, file)).resolves.toBeUndefined();

			expect(Queue.queueMessage).toBeCalledTimes(1);

			const corId = Queue.queueMessage.mock.calls[0][1];

			expect(publishFn).toBeCalledTimes(1);
			expect(publishFn).toBeCalledWith(events.QUEUED_TASK_UPDATE, { teamspace, model, corId, status: 'queued' });
		});
	});

	afterAll(() => fs.rm(fileCreated).catch(() => {}));
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
			await expect(ModelProcessing.queueFederationUpdate(teamspace, federation, {}))
				.rejects.toEqual(expect.objectContaining({ code: templates.queueInsertionFailed.code }));
		});
		test(`should fail with ${templates.queueConnectionError.code} if Queue handler threw the error`, async () => {
			Queue.queueMessage.mockRejectedValueOnce(templates.queueConnectionError);
			await expect(ModelProcessing.queueFederationUpdate(teamspace, federation, data))
				.rejects.toEqual(expect.objectContaining({ code: templates.queueConnectionError.code }));
		});

		test('should succeed with job inserted into the queue', async () => {
			await expect(ModelProcessing.queueFederationUpdate(teamspace, federation, data)).resolves.toBeUndefined();

			expect(Queue.queueMessage).toBeCalledTimes(1);
			const corId = Queue.queueMessage.mock.calls[0][1];

			expect(publishFn).toBeCalledTimes(1);
			expect(publishFn).toBeCalledWith(events.QUEUED_TASK_UPDATE, { teamspace, model: federation, corId, status: 'queued' });
		});
	});

	afterEach(Queue.close);
};

const testCallbackQueueConsumer = () => {
	describe('Callback queue consumption', () => {
		const getCallbackFn = async () => {
			Queue.listenToQueue.mockClear();
			await expect(ModelProcessing.init()).resolves.toBeUndefined();
			expect(Queue.listenToQueue).toHaveBeenCalled();
			return Queue.listenToQueue.mock.calls[0][1];
		};

		test(`Should trigger ${events.QUEUED_TASK_UPDATE} event if there is a task update message`, async () => {
			const content = {
				database: generateRandomString(),
				status: generateRandomString(),
				project: generateRandomString(),
				user: generateRandomString(),
			};
			const properties = {
				correlationId: generateRandomString(),
			};

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: JSON.stringify(content), properties });

			const expectedData = {
				teamspace: content.database,
				model: content.project,
				corId: properties.correlationId,
				status: content.status,
				user: content.user,
			};
			expect(publishFn).toBeCalledTimes(1);
			expect(publishFn).toBeCalledWith(events.QUEUED_TASK_UPDATE, expectedData);
		});

		test(`Should trigger ${events.QUEUED_TASK_COMPLETED} event if there is a task failed message`, async () => {
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

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: JSON.stringify(content), properties });

			const expectedData = {
				teamspace: content.database,
				model: content.project,
				corId: properties.correlationId,
				value: content.value,
				message: content.message,
				user: content.user,
			};

			expect(publishFn).toBeCalledTimes(1);
			expect(publishFn).toBeCalledWith(events.QUEUED_TASK_COMPLETED, expectedData);
		});

		test(`Should trigger ${events.QUEUED_TASK_COMPLETED} event with container information if the task was a federation`, async () => {
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

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: JSON.stringify(content), properties });

			const expectedData = {
				teamspace: content.database,
				model: content.project,
				corId: properties.correlationId,
				value: content.value,
				message: content.message,
				user: content.user,
				containers,
			};

			expect(publishFn).toBeCalledTimes(1);
			expect(publishFn).toBeCalledWith(events.QUEUED_TASK_COMPLETED, expectedData);
		});

		test('Should fail gracefully if the service failed to process the message', async () => {
			const properties = {
				correlationId: generateRandomString(),
			};

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: {}, properties });

			expect(publishFn).not.toBeCalled();
		});
	});
};

describe('services/modelProcessing', () => {
	testQueueModelUpload();
	testQueueFederationUpdate();
	testCallbackQueueConsumer();
});
