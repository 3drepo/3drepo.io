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

const { determineTestGroup } = require('../../helper/utils');
const { src, objModel } = require('../../helper/path');
const {
	generateUUIDString,
	generateRandomString,
	generateRandomObject,
	generateUUID,
} = require('../../helper/dataGen');

const { stringToUUID } = require(`${src}/utils/helper/uuids`);

jest.mock('../../../../src/v5/handler/queue');
const Queue = require(`${src}/handler/queue`);

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);

jest.mock('../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);

jest.mock('fs', () => {
	const actualFs = jest.requireActual('fs');
	return { ...actualFs, createWriteStream: jest.fn(actualFs.createWriteStream) };
});
const { createWriteStream } = require('fs');

jest.mock('fs/promises', () => {
	const actualFs = jest.requireActual('fs/promises');
	return {
		...actualFs,
		rm: jest.fn(actualFs.rm),
		stat: jest.fn(actualFs.stat),
		access: jest.fn(actualFs.access),
	};
});

const { access, stat, rm, mkdir, writeFile } = require('fs/promises');

const { modelTypes, processStatuses } = require(`${src}/models/modelSettings.constants`);

const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { MESSAGE_TYPES } = require(`${src}/services/modelProcessing.constants`);
const config = require(`${src}/utils/config`);

const { PassThrough } = require('stream');
const path = require('path');

const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const Logger = require(`${src}/utils/logger`);

const ModelProcessing = require(`${src}/services/modelProcessing`);

Queue.listenToQueue.mockResolvedValue();
Queue.queueMessage.mockResolvedValue();

const publishFn = EventsManager.publish.mockImplementation(() => { });

const cleanupModelImportFiles = async (revId) => {
	const importPath = path.join(config.cn_queue.shared_storage, revId);
	await Promise.all([
		rm(importPath, { recursive: true, force: true }),
		rm(`${importPath}.json`, { force: true }),
	]);
};

const testProcessExternalModelUpload = () => {
	describe('Process external model upload', () => {
		let revId;

		afterEach(async () => {
			if (revId) {
				await cleanupModelImportFiles(UUIDToString(revId));
				revId = undefined;
			}
		});

		test('Should store the file and put a message on the queue', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const container = generateRandomString();
			const owner = generateRandomString();
			const revInfo = {
				owner,
				tag: generateRandomString(),
				timezone: generateRandomString(),
				units: generateRandomString(),
				lod: generateRandomString(),
				importAnimations: true,
			};
			const file = { originalname: `${generateRandomString()}.OBJ`, path: objModel, size: 1024 };
			revId = generateUUID();

			Revisions.addRevision.mockResolvedValueOnce(revId);

			await ModelProcessing.processExternalModelUpload(teamspace, project, container, revInfo, file);

			expect(Revisions.addRevision).toHaveBeenCalledTimes(1);
			expect(Revisions.addRevision).toHaveBeenCalledWith(teamspace, project, container, modelTypes.CONTAINER, {
				tag: revInfo.tag,
				timezone: revInfo.timezone,
				units: revInfo.units,
				lod: revInfo.lod,
				importAnimations: revInfo.importAnimations,
				author: owner,
				format: '.obj',
				rFile: [expect.any(String)],
			});

			const fileId = FilesManager.storeFileStream.mock.calls[0][2];
			expect(Revisions.addRevision.mock.calls[0][4].rFile).toEqual([UUIDToString(fileId)]);
			expect(FilesManager.storeFileStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFileStream).toHaveBeenCalledWith(
				teamspace,
				`${container}.history`,
				fileId,
				expect.anything(),
				{ name: file.originalname, rev_id: UUIDToString(revId), project, model: container },
			);

			expect(Queue.queueMessage).toHaveBeenCalledTimes(1);
			expect(Queue.queueMessage).toHaveBeenCalledWith(
				config.cn_queue.model_queue,
				UUIDToString(revId),
				`import $SHARED_SPACE/${UUIDToString(revId)}.json`,
			);
			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.QUEUED_TASK_UPDATE, {
				teamspace,
				model: container,
				modelType: modelTypes.CONTAINER,
				corId: UUIDToString(revId),
				status: processStatuses.QUEUED,
			});
		});

		test('Should remove the stored file if queueing the import fails', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const container = generateRandomString();
			const revInfo = { owner: generateRandomString() };
			const file = { originalname: `${generateRandomString()}.obj`, path: objModel, size: 512 };
			revId = generateUUID();

			Revisions.addRevision.mockResolvedValueOnce(revId);
			Queue.queueMessage.mockRejectedValueOnce(templates.queueConnectionError);

			await expect(ModelProcessing.processExternalModelUpload(teamspace, project, container, revInfo, file))
				.rejects.toEqual(templates.queueConnectionError);

			expect(Revisions.addRevision).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFileStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFile).toHaveBeenCalledWith(
				teamspace,
				`${container}.history`,
				FilesManager.storeFileStream.mock.calls[0][2],
			);
			expect(Queue.queueMessage).toHaveBeenCalledTimes(1);
			expect(publishFn).not.toHaveBeenCalled();
		});

		test('Should log a cleanup error if removing the import file fails', async () => {
			const cleanupError = new Error('cleanup failed');
			const logErrorSpy = jest.spyOn(Logger.logger, 'logError').mockImplementation(() => { });
			const teamspace = generateRandomString();
			const project = generateUUID();
			const container = generateRandomString();
			const file = { originalname: `${generateRandomString()}.obj`, path: objModel, size: 512 };
			revId = generateUUID();

			Revisions.addRevision.mockResolvedValueOnce(revId);
			Queue.queueMessage.mockRejectedValueOnce(new Error('queue failed'));
			rm.mockRejectedValueOnce(cleanupError);

			try {
				await expect(ModelProcessing.processExternalModelUpload(
					teamspace, project, container, { owner: generateRandomString() }, file,
				)).rejects.toEqual(templates.queueInsertionFailed);

				expect(rm).toHaveBeenCalledWith(
					`${config.cn_queue.shared_storage}/${UUIDToString(revId)}.json`,
				);
				expect(logErrorSpy).toHaveBeenCalledWith(
					`Failed to remove files (clean up on failure : ${cleanupError}`,
					undefined,
					Logger.labels.modelProcessing,
				);
			} finally {
				logErrorSpy.mockRestore();
			}
		});
	});
};

const testProcessInternalModelUpload = () => {
	describe('Process internal model upload', () => {
		let revId;

		afterEach(async () => {
			if (revId) {
				await cleanupModelImportFiles(UUIDToString(revId));
				revId = undefined;
			}
		});

		test('Should reference the file and put a message on the queue', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const container = generateRandomString();
			const owner = generateRandomString();
			const revInfo = {
				owner,
				tag: generateRandomString(),
				timezone: generateRandomString(),
				units: generateRandomString(),
				lod: generateRandomString(),
				importAnimations: true,
			};
			const file = {
				originalname: `${generateRandomString()}.ifc`,
				path: generateRandomString(),
				format: '.ifc',
				size: 2048,
			};
			revId = generateUUID();

			Revisions.addRevision.mockResolvedValueOnce(revId);

			await ModelProcessing.processInternalModelUpload(teamspace, project, container, revInfo, file);

			expect(Revisions.addRevision).toHaveBeenCalledTimes(1);
			expect(Revisions.addRevision).toHaveBeenCalledWith(teamspace, project, container, modelTypes.CONTAINER, {
				tag: revInfo.tag,
				timezone: revInfo.timezone,
				units: revInfo.units,
				lod: revInfo.lod,
				importAnimations: revInfo.importAnimations,
				author: owner,
				rFile: [expect.any(String)],
			});

			const fileId = Revisions.addRevision.mock.calls[0][4].rFile[0];
			expect(FilesManager.addExternalFileReference).toHaveBeenCalledTimes(1);
			expect(FilesManager.addExternalFileReference).toHaveBeenCalledWith(
				teamspace,
				`${container}.history.ref`,
				fileId,
				{
					_id: fileId,
					name: file.originalname,
					rev_id: UUIDToString(revId),
					project,
					model: container,
					link: file.path,
					size: file.size,
				},
			);
			expect(Queue.queueMessage).toHaveBeenCalledTimes(1);
			expect(Queue.queueMessage).toHaveBeenCalledWith(
				config.cn_queue.model_queue,
				UUIDToString(revId),
				`import $SHARED_SPACE/${UUIDToString(revId)}.json`,
			);
			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.QUEUED_TASK_UPDATE, {
				teamspace,
				model: container,
				modelType: modelTypes.CONTAINER,
				corId: UUIDToString(revId),
				status: processStatuses.QUEUED,
			});
		});

		test('Should fail if queueing the import fails', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const container = generateRandomString();
			const revInfo = { owner: generateRandomString() };
			const file = {
				originalname: `${generateRandomString()}.ifc`,
				path: generateRandomString(),
				format: '.ifc',
				size: 2048,
			};
			revId = generateUUID();

			Revisions.addRevision.mockResolvedValueOnce(revId);
			Queue.queueMessage.mockRejectedValueOnce(templates.queueConnectionError);

			await expect(ModelProcessing.processInternalModelUpload(teamspace, project, container, revInfo, file))
				.rejects.toEqual(templates.queueConnectionError);

			expect(Revisions.addRevision).toHaveBeenCalledTimes(1);
			expect(FilesManager.addExternalFileReference).toHaveBeenCalledTimes(1);
			expect(Queue.queueMessage).toHaveBeenCalledTimes(1);
			expect(publishFn).not.toHaveBeenCalled();
		});

		test('Should log a cleanup error if removing the import file fails', async () => {
			const cleanupError = new Error('cleanup failed');
			const logErrorSpy = jest.spyOn(Logger.logger, 'logError').mockImplementation(() => { });
			const teamspace = generateRandomString();
			const project = generateUUID();
			const container = generateRandomString();
			const file = {
				originalname: `${generateRandomString()}.ifc`,
				path: generateRandomString(),
				format: '.ifc',
				size: 2048,
			};
			revId = generateUUID();

			Revisions.addRevision.mockResolvedValueOnce(revId);
			Queue.queueMessage.mockRejectedValueOnce(new Error('queue failed'));
			rm.mockRejectedValueOnce(cleanupError);

			try {
				await expect(ModelProcessing.processInternalModelUpload(
					teamspace, project, container, { owner: generateRandomString() }, file,
				)).rejects.toEqual(templates.queueInsertionFailed);

				expect(rm).toHaveBeenCalledWith(
					`${config.cn_queue.shared_storage}/${UUIDToString(revId)}.json`,
				);
				expect(logErrorSpy).toHaveBeenCalledWith(
					`Failed to remove files (clean up on failure : ${cleanupError}`,
					undefined,
					Logger.labels.modelProcessing,
				);
			} finally {
				logErrorSpy.mockRestore();
			}
		});
	});
};

const testCallbackQueueConsumer = () => {
	describe('Callback queue consumption', () => {
		const getCallbackFn = async () => {
			Queue.listenToQueue.mockClear();
			await expect(ModelProcessing.init()).resolves.toBeUndefined();
			expect(Queue.listenToQueue).toHaveBeenCalled();
			return Queue.listenToQueue.mock.calls[0][1];
		};

		test(`Should trigger ${events.CLASH_RUN_UPDATE} event if there is a clash run update message`, async () => {
			const content = {
				teamspace: generateRandomString(),
				project: generateUUIDString(),
				type: MESSAGE_TYPES.CLASH,
				status: generateRandomString(),
			};
			const properties = {
				correlationId: generateUUIDString(),
			};

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: JSON.stringify(content), properties });

			const expectedData = {
				teamspace: content.teamspace,
				project: stringToUUID(content.project),
				runId: stringToUUID(properties.correlationId),
				status: content.status,
			};

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.CLASH_RUN_UPDATE, expectedData);
		});

		test(`Should trigger ${events.CLASH_RUN_COMPLETED} event if there is a clash run completed message`, async () => {
			const SHARED_SPACE_TAG = '$SHARED_SPACE';

			const content = {
				teamspace: generateRandomString(),
				project: generateUUIDString(),
				type: MESSAGE_TYPES.CLASH,
				container: generateRandomString(),
				results: `${SHARED_SPACE_TAG}/${generateRandomString()}/results.json`,
				value: 0,
			};
			const properties = {
				correlationId: generateUUIDString(),
			};

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: JSON.stringify(content), properties });

			const expectedData = {
				teamspace: content.teamspace,
				project: stringToUUID(content.project),
				runId: stringToUUID(properties.correlationId),
				results: path.resolve(config.cn_queue.shared_storage,
					content.results.slice(SHARED_SPACE_TAG.length + 1)),
				value: content.value,
			};

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.CLASH_RUN_COMPLETED, expectedData);
		});

		test.each([
			['shared space root', '$SHARED_SPACE', path.resolve(config.cn_queue.shared_storage)],
			['backslash separators', '$SHARED_SPACE\\folder\\results.json',
				path.resolve(config.cn_queue.shared_storage, 'folder', 'results.json')],
			['normalised path inside shared storage', '$SHARED_SPACE/folder/../results.json',
				path.resolve(config.cn_queue.shared_storage, 'results.json')],
		])('Should trigger %s as a safe clash run results path', async (desc, results, expectedResults) => {
			const content = {
				teamspace: generateRandomString(),
				project: generateUUIDString(),
				type: MESSAGE_TYPES.CLASH,
				container: generateRandomString(),
				results,
				value: 0,
			};
			const properties = {
				correlationId: generateUUIDString(),
			};

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: JSON.stringify(content), properties });

			const expectedData = {
				teamspace: content.teamspace,
				project: stringToUUID(content.project),
				runId: stringToUUID(properties.correlationId),
				results: expectedResults,
				value: content.value,
			};

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.CLASH_RUN_COMPLETED, expectedData);
		});

		test.each([
			['path traversal', '$SHARED_SPACE/../../etc/passwd'],
			['parent directory', '$SHARED_SPACE/..'],
			['absolute path', '/etc/passwd'],
			['windows absolute path', '$SHARED_SPACE/C:\\Windows\\system.ini'],
			['missing results', undefined],
			['missing shared space tag', 'results.json'],
			['malformed shared space tag', '$SHARED_SPACEevil/results.json'],
		])('Should not publish a %s from a clash run completed message', async (desc, results) => {
			const content = {
				teamspace: generateRandomString(),
				project: generateUUIDString(),
				type: MESSAGE_TYPES.CLASH,
				container: generateRandomString(),
				results,
				value: 0,
			};
			const properties = {
				correlationId: generateUUIDString(),
			};

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: JSON.stringify(content), properties });

			const expectedData = {
				teamspace: content.teamspace,
				project: stringToUUID(content.project),
				runId: stringToUUID(properties.correlationId),
				results: undefined,
				value: content.value,
			};

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.CLASH_RUN_COMPLETED, expectedData);
		});

		test(`Should trigger ${events.QUEUED_TASK_UPDATE} event if there is a task update message`, async () => {
			const content = {
				teamspace: generateRandomString(),
				status: generateRandomString(),
				container: generateRandomString(),
			};
			const properties = {
				correlationId: generateRandomString(),
			};

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: JSON.stringify(content), properties });

			const expectedData = {
				teamspace: content.teamspace,
				model: content.container,
				modelType: modelTypes.CONTAINER,
				corId: properties.correlationId,
				status: content.status,
			};
			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.QUEUED_TASK_UPDATE, expectedData);
		});

		test(`Should trigger ${events.QUEUED_TASK_UPDATE} event if there is a task update message (drawing)`, async () => {
			const content = {
				teamspace: generateRandomString(),
				status: generateRandomString(),
				drawing: generateRandomString(),
			};
			const properties = {
				correlationId: generateRandomString(),
			};

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: JSON.stringify(content), properties });

			const expectedData = {
				teamspace: content.teamspace,
				model: content.drawing,
				modelType: modelTypes.DRAWING,
				corId: properties.correlationId,
				status: content.status,
			};
			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.QUEUED_TASK_UPDATE, expectedData);
		});

		test(`Should trigger ${events.QUEUED_TASK_COMPLETED} event if there is a task failed message`, async () => {
			const content = {
				teamspace: generateRandomString(),
				container: generateRandomString(),
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
				teamspace: content.teamspace,
				model: content.container,
				modelType: modelTypes.CONTAINER,
				corId: properties.correlationId,
				value: content.value,
				message: content.message,
				user: content.user,
			};

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.QUEUED_TASK_COMPLETED, expectedData);
		});

		test(`Should trigger ${events.QUEUED_TASK_COMPLETED} event if there is a task failed message (drawing)`, async () => {
			const content = {
				teamspace: generateRandomString(),
				drawing: generateRandomString(),
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
				teamspace: content.teamspace,
				model: content.drawing,
				modelType: modelTypes.DRAWING,
				corId: properties.correlationId,
				value: content.value,
				message: content.message,
				user: content.user,
			};

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.QUEUED_TASK_COMPLETED, expectedData);
		});

		test('Should fail gracefully if the service failed to process the message', async () => {
			const properties = {
				correlationId: generateRandomString(),
			};

			const callbackFn = await getCallbackFn();
			await callbackFn({ content: {}, properties });

			expect(publishFn).not.toHaveBeenCalled();
		});
	});
};

const testProcessDrawingUpload = () => {
	describe('Process drawing upload', () => {
		test('Should store the file and put a message on the queue if it requires further processing', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const model = generateRandomString();
			const revInfo = generateRandomObject();
			const file = { buffer: generateRandomString(), originalname: `${generateRandomString()}.dwg` };

			const revId = generateUUID();

			Revisions.addRevision.mockResolvedValueOnce(revId);

			await ModelProcessing.processDrawingUpload(teamspace, project, model, revInfo, file);

			expect(Revisions.addRevision).toHaveBeenCalledTimes(1);
			expect(Revisions.addRevision).toHaveBeenCalledWith(teamspace, project, model, modelTypes.DRAWING,
				expect.objectContaining(revInfo));

			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`, expect.anything(), file.buffer, {
				name: file.originalname, rev_id: revId, project, model,
			});

			expect(Queue.queueMessage).toHaveBeenCalledTimes(1);
			expect(Queue.queueMessage).toHaveBeenCalledWith(config.cn_queue.drawing_queue,
				UUIDToString(revId), `processDrawing $SHARED_SPACE/${UUIDToString(revId)}/importParams.json`);

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.QUEUED_TASK_UPDATE, {
				teamspace,
				model,
				modelType: modelTypes.DRAWING,
				corId: UUIDToString(revId),
				status: processStatuses.QUEUED,
			});
		});

		test('Should fail gracefully if we failed to put the task onto the queue', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const model = generateRandomString();
			const revInfo = generateRandomObject();
			const file = { buffer: generateRandomString(), originalname: `${generateRandomString()}.dwg` };

			const revId = generateUUID();

			Revisions.addRevision.mockResolvedValueOnce(revId);
			Queue.queueMessage.mockRejectedValueOnce(new Error());

			await ModelProcessing.processDrawingUpload(teamspace, project, model, revInfo, file);

			expect(Revisions.addRevision).toHaveBeenCalledTimes(1);
			expect(Revisions.addRevision).toHaveBeenCalledWith(teamspace, project, model, modelTypes.DRAWING,
				expect.objectContaining(revInfo));

			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`, expect.anything(), file.buffer, {
				name: file.originalname, rev_id: revId, project, model,
			});

			expect(Queue.queueMessage).toHaveBeenCalledTimes(1);
			expect(Queue.queueMessage).toHaveBeenCalledWith(config.cn_queue.drawing_queue,
				UUIDToString(revId), `processDrawing $SHARED_SPACE/${UUIDToString(revId)}/importParams.json`);

			expect(publishFn).toHaveBeenCalledWith(events.QUEUED_TASK_COMPLETED, {
				teamspace,
				model,
				modelType: modelTypes.DRAWING,
				corId: UUIDToString(revId),
				value: 4,
			});
		});

		test('Should store the file and put the same reference into revision.image if no further processing is required', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const model = generateRandomString();
			const revInfo = generateRandomObject();
			const owner = generateRandomString();
			const file = { buffer: generateRandomString(), originalname: `${generateRandomString()}.pdf` };

			const revId = generateUUID();

			Revisions.addRevision.mockResolvedValueOnce(revId);

			await ModelProcessing.processDrawingUpload(teamspace, project, model, { owner, ...revInfo }, file);

			expect(Revisions.addRevision).toHaveBeenCalledTimes(1);
			expect(Revisions.addRevision).toHaveBeenCalledWith(teamspace, project, model, modelTypes.DRAWING,
				expect.objectContaining({
					author: owner,
					...revInfo,
				}),
			);
			expect(Revisions.addRevision.mock.calls[0][4].incomplete).toBeUndefined();
			expect(Revisions.addRevision.mock.calls[0][4].image).toBeDefined();

			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`, expect.anything(), file.buffer, {
				name: file.originalname, rev_id: revId, project, model,
			});

			expect(Revisions.addRevision.mock.calls[0][4].image).toEqual(FilesManager.storeFile.mock.calls[0][2]);

			expect(Queue.queueMessage).not.toHaveBeenCalled();

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.QUEUED_TASK_COMPLETED, {
				teamspace, model, modelType: modelTypes.DRAWING, corId: UUIDToString(revId), value: 0, user: owner,
			});
		});
	});
};

const testContainerGetFileName = () => {
	describe('Get container file name', () => {
		test('Should return file name if the file exists', async () => {
			const corId = generateUUIDString();
			const fileName = `${generateRandomString()}.obj`;
			const filePath = `${config.cn_queue.shared_storage}/${corId}.json`;
			await writeFile(filePath, JSON.stringify({ fileName }));

			await expect(ModelProcessing.getContainerFileName(corId)).toEqual(fileName);
		});

		test('Should fail if the file does not exist', async () => {
			const corId = generateUUIDString();
			await expect(ModelProcessing.getContainerFileName(corId)).toBeUndefined();
		});
	});
};

const testGetLogArchive = () => {
	describe('Get log archive', () => {
		test('Should return undefined if the path is not found', async () => {
			await expect(ModelProcessing.getLogArchive(generateUUIDString())).resolves.toBeUndefined();
		});

		test('Should return with zip file if path is found but no files found', async () => {
			const corId = generateUUIDString();
			const taskPath = `${config.cn_queue.shared_storage}/${corId}`;
			await mkdir(taskPath);
			await expect(ModelProcessing.getLogArchive(corId)).resolves.toEqual({
				zipPath: path.join(taskPath, 'logs.zip'),
				logPreview: undefined,
			});
		});

		test('Should return with zip file and log preview if logfiles are found', async () => {
			const corId = generateUUIDString();
			const log = generateRandomString(100);
			const taskPath = `${config.cn_queue.shared_storage}/${corId}`;
			await mkdir(taskPath);
			await writeFile(`${taskPath}/1.log`, log);
			await writeFile(`${taskPath}/2.log`, generateRandomString());
			await expect(ModelProcessing.getLogArchive(corId)).resolves.toEqual({
				zipPath: path.join(taskPath, 'logs.zip'),
				logPreview: expect.stringContaining(log),
			});
		});

		test('Should return with zip file if path is found but no log files are found', async () => {
			const corId = generateUUIDString();
			const taskPath = `${config.cn_queue.shared_storage}/${corId}`;
			await mkdir(taskPath);
			await writeFile(`${taskPath}/${generateRandomString()}.Notlog`,
				generateRandomString());
			await expect(ModelProcessing.getLogArchive(corId)).resolves.toEqual({
				zipPath: path.join(taskPath, 'logs.zip'),
				logPreview: undefined,
			});
		});
	});
};

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

			await expect(ModelProcessing.queueClashRun(teamspace, project, corId, stream))
				.rejects.toEqual(expect.objectContaining({ code: templates.queueInsertionFailed.code }));

			rm(`${config.cn_queue.shared_storage}/${corId}/clashConfig.json`).catch(() => { });

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

			await expect(ModelProcessing.queueClashRun(teamspace, project, corId, stream))
				.rejects.toEqual(expect.objectContaining({ code: templates.queueConnectionError.code }));

			rm(`${config.cn_queue.shared_storage}/${corId}/clashConfig.json`).catch(() => { });

			expect(Queue.queueMessage).toHaveBeenCalledTimes(1);
			expect(Queue.queueMessage).toHaveBeenCalledWith(config.cn_queue.clash_queue,
				corId, `processClash ${teamspace} ${project} $SHARED_SPACE/${corId}/clashConfig.json`);
		});

		test(`should fail with ${templates.queueConnectionError.code} if createWriteStream threw the error`, async () => {
			const corId = generateRandomString();
			const stream = new PassThrough();
			stream.write(data);
			stream.end();

			createWriteStream.mockImplementationOnce(() => {
				throw new Error(generateRandomString());
			});

			await expect(ModelProcessing.queueClashRun(teamspace, project, corId, stream))
				.rejects.toEqual(templates.queueInsertionFailed);

			expect(Queue.queueMessage).not.toHaveBeenCalled();
		});
	});
};

const testInit = () => {
	describe('Init', () => {
		const params = ['host', 'shared_storage', 'callback_queue', 'model_queue', 'clash_queue', 'event_exchange'];
		describe.each(params.map((param) => [param]))('Check Queue Config', (propName) => {
			test(`Should fail if cn_queue.${propName} is not set in config`, async () => {
				const originalValue = config.cn_queue[propName];
				config.cn_queue[propName] = undefined;
				await expect(ModelProcessing.init()).rejects.toThrow();
				config.cn_queue[propName] = originalValue;
				expect(Queue.listenToQueue).not.toHaveBeenCalled();
			});
		});

		test('Should fail if shared_storage path is invalid', async () => {
			stat.mockRejectedValueOnce(new Error(generateRandomString()));
			await expect(ModelProcessing.init()).rejects.toThrow();
			expect(Queue.listenToQueue).not.toHaveBeenCalled();
		});

		test('Should fail if shared_storage path is not a directory', async () => {
			stat.mockResolvedValueOnce({
				isDirectory: () => false,
			});
			await expect(ModelProcessing.init()).rejects.toThrow();
			expect(Queue.listenToQueue).not.toHaveBeenCalled();
		});

		test('Should fail if user has no access to shared_storage', async () => {
			stat.mockResolvedValueOnce({
				isDirectory: () => true,
			});
			access.mockRejectedValueOnce(new Error(generateRandomString()));
			await expect(ModelProcessing.init()).rejects.toThrow();
			expect(Queue.listenToQueue).not.toHaveBeenCalled();
		});

		test('Should succeed if the config is set correctly', async () => {
			stat.mockResolvedValueOnce({
				isDirectory: () => true,
			});
			access.mockResolvedValueOnce();
			await expect(ModelProcessing.init()).resolves.toBeUndefined();
			expect(Queue.listenToQueue).toHaveBeenCalledTimes(1);
			expect(Queue.listenToQueue).toHaveBeenCalledWith(config.cn_queue.callback_queue, expect.any(Function));
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testProcessExternalModelUpload();
	testProcessInternalModelUpload();
	testCallbackQueueConsumer();
	testProcessDrawingUpload();
	testContainerGetFileName();
	testGetLogArchive();
	testQueueClashRun();
	testInit();
});
