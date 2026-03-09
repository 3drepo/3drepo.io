/**
 *  Copyright (C) 2026 3D Repo Ltd
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

jest.mock('../../../../src/v5/handler/queue');
const Queue = require(`${src}/handler/queue`);

const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/utils/responseCodes`);
const ClashProcessing = require(`${src}/services/clashProcessing`);
const fs = require('fs/promises');
const { PassThrough } = require('stream');

Queue.listenToQueue.mockResolvedValue();
Queue.queueMessage.mockResolvedValue();

const testQueueClashRun = () => {
	describe('Queue clash run', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const data = generateRandomString();

		test(`should fail with ${templates.queueInsertionFailed.code} if there is some generic error`, async () => {
			Queue.queueMessage.mockRejectedValueOnce(new Error(generateRandomString()));
			const corId = generateRandomString();
			const stream = new PassThrough();
			stream.write(data);
			stream.end();

			await expect(ClashProcessing.queueClashRun(teamspace, project, corId, stream))
				.rejects.toEqual(expect.objectContaining({ code: templates.queueInsertionFailed.code }));

			fs.rm(`${config.cn_queue.shared_storage}/${corId}/clashConfig.json`).catch(() => {});

			expect(Queue.queueMessage).toHaveBeenCalledTimes(1);
			expect(Queue.queueMessage).toHaveBeenCalledWith(config.cn_queue.clash_queue,
				corId, `processClash ${teamspace} ${project} $SHARED_SPACE/${corId}/clashConfig.json`);
		});

		test(`should fail with ${templates.queueConnectionError.code} if Queue handler threw the error`, async () => {
			Queue.queueMessage.mockRejectedValueOnce(templates.queueConnectionError);
			const corId = generateRandomString();
			const stream = new PassThrough();
			stream.write(data);
			stream.end();

			await expect(ClashProcessing.queueClashRun(teamspace, project, corId, stream))
				.rejects.toEqual(expect.objectContaining({ code: templates.queueConnectionError.code }));

			fs.rm(`${config.cn_queue.shared_storage}/${corId}/clashConfig.json`).catch(() => {});

			expect(Queue.queueMessage).toHaveBeenCalledTimes(1);
			expect(Queue.queueMessage).toHaveBeenCalledWith(config.cn_queue.clash_queue,
				corId, `processClash ${teamspace} ${project} $SHARED_SPACE/${corId}/clashConfig.json`);
		});

		test('should succeed with job inserted into the queue', async () => {
			Queue.queueMessage.mockResolvedValueOnce(generateRandomString());
			const corId = generateRandomString();
			const stream = new PassThrough();
			stream.write(data);
			stream.end();

			await expect(ClashProcessing.queueClashRun(teamspace, project, corId, stream)).resolves.toBeUndefined();

			fs.rm(`${config.cn_queue.shared_storage}/${corId}/clashConfig.json`).catch(() => {});

			expect(Queue.queueMessage).toHaveBeenCalledTimes(1);
			expect(Queue.queueMessage).toHaveBeenCalledWith(config.cn_queue.clash_queue,
				corId, `processClash ${teamspace} ${project} $SHARED_SPACE/${corId}/clashConfig.json`);
		});
	});
};

describe('services/clashProcessing', () => {
	testQueueClashRun();
});
