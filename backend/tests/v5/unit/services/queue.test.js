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
const AMQP = require('amqplib');

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const fs = require('fs/promises');
const path = require('path');

const { templates } = require(`${src}/utils/responseCodes`);

const Queue = require(`${src}/services/queue`);

const createFakeConnection = (sendToQueue) => {
	const dummyFn = () => Promise.resolve();
	const dummyChannel = {
		assertQueue: dummyFn,
		sendToQueue: sendToQueue || dummyFn,
		close: dummyFn,
	};
	return {
		createChannel: () => Promise.resolve(dummyChannel),
		on: () => {},
	};
};

const publishFn = EventsManager.publish.mockImplementation(() => {});

const testQueueModelUpload = () => {
	const fileCreated = path.join(modelFolder, 'queueObjectTest.obj');
	describe('queue model upload', () => {
		const teamspace = 'teamspace';
		const model = 'modelID';
		const data = { tag: '123', owner: '123' };
		const file = { originalname: 'test.obj', path: fileCreated };
		const fn = jest.spyOn(AMQP, 'connect').mockRejectedValue(undefined);

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
			fn.mockResolvedValueOnce(createFakeConnection(sendToQueueFn));

			await expect(Queue.queueModelUpload(teamspace, model, data, file)).resolves.toBe(undefined);

			expect(sendToQueueFn.mock.calls.length).toBe(1);
			const { correlationId: corId } = sendToQueueFn.mock.calls[0][2];

			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.QUEUE_ITEM_UPDATE);
			expect(publishFn.mock.calls[0][1]).toEqual({ teamspace, model, corId, status: 'queued' });
		});
	});

	afterAll(() => fs.rm(fileCreated).catch(() => {}));
};

describe('services/queue', () => {
	testQueueModelUpload();
});
