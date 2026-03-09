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
