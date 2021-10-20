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
const fs = require('fs/promises');
const path = require('path');

const { templates } = require(`${src}/utils/responseCodes`);

const Queue = require(`${src}/services/queue`);

const createFakeConnection = () => {
	const dummyFn = () => Promise.resolve();
	const dummyChannel = {
		assertQueue: dummyFn,
		sendToQueue: dummyFn,
		close: dummyFn,
	};
	return {
		createChannel: () => Promise.resolve(dummyChannel),
		on: () => {},
	};
};

const testQueueModelUpload = () => {
	const fileCreated = path.join(modelFolder, 'toRemove.obj');
	describe('queue model upload', () => {
		const teamspace = 'teamspace';
		const model = 'modelID';
		const data = { tag: '123', owner: '123' };
		const file = { originalname: 'test.obj', path: fileCreated };
		test(`should fail with ${templates.queueInsertionFailed.code} if there is some generic error`, async () => {
			const fn = jest.spyOn(AMQP, 'connect').mockResolvedValueOnce(createFakeConnection());
			expect.assertions(1);
			try {
				await Queue.queueModelUpload(teamspace, model, data, file);
			} catch (err) {
				expect(err.code).toEqual(templates.queueInsertionFailed.code);
			}

			fn.mockRestore();
		});

		// NOTE: this test needs to be at the end.
		test(`should fail with ${templates.queueConnectionError.code} if it cannot connect to queue`, async () => {
			await fs.copyFile(objModel, fileCreated);
			const fn = jest.spyOn(AMQP, 'connect').mockRejectedValue(undefined);
			expect.assertions(1);
			try {
				await Queue.queueModelUpload(teamspace, model, data, file);
			} catch (err) {
				expect(err.code).toEqual(templates.queueConnectionError.code);
			}
			fn.mockRestore();
		});
	});

	afterAll(async () => {
		fs.rm(fileCreated);
	});
};

describe('services/queue', () => {
	testQueueModelUpload();
});

// const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
// const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
