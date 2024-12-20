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

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const Revisions = require(`${src}/models/revisions`);
const { DRAWINGS_HISTORY_COL } = require(`${src}/models/revisions.constants`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);
const { determineTestGroup, generateUUID, generateRandomString, generateRandomObject, generateRandomNumber } = require('../../helper/services');

const { modelTypes, getInfoFromCode, processStatuses } = require(`${src}/models/modelSettings.constants`);
const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);

const excludeVoids = { void: { $ne: true } };
const excludeIncomplete = { incomplete: { $exists: false } };
const excludeFailed = { status: { $ne: processStatuses.FAILED } };

const testGetRevisionCount = () => {
	describe('GetRevisionCount', () => {
		const expectedData = generateRandomNumber();
		const teamspace = generateRandomString();
		const model = generateRandomString();

		test('should return the number of revision as per from the database query', async () => {
			const fn = jest.spyOn(db, 'count').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getRevisionCount(teamspace, model, modelTypes.CONTAINER);

			expect(res).toEqual(expectedData);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`, { ...excludeIncomplete, ...excludeFailed, ...excludeVoids });
		});

		test('should return the number of revision as per from the database query (drawing)', async () => {
			const fn = jest.spyOn(db, 'count').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getRevisionCount(teamspace, model, modelTypes.DRAWING);

			expect(res).toEqual(expectedData);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`,
				{ ...excludeIncomplete, ...excludeFailed, ...excludeVoids, model });
		});
	});
};

const testGetLatestRevision = () => {
	describe('GetLatestRevision', () => {
		const expectedData = generateRandomObject();
		const teamspace = generateRandomString();
		const model = generateRandomString();

		test('Should return the latest revision if there is one', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getLatestRevision(teamspace, model, modelTypes.CONTAINER);

			expect(res).toEqual(expectedData);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`, { ...excludeIncomplete, ...excludeFailed, ...excludeVoids }, {}, { timestamp: -1 });
		});

		test('Should include voids if it is specified', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getLatestRevision(teamspace, model, modelTypes.CONTAINER,
				undefined, { includeVoid: true });

			expect(res).toEqual(expectedData);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`, { ...excludeIncomplete, ...excludeFailed }, {}, { timestamp: -1 });
		});

		test('Should include failures if it is specified', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getLatestRevision(teamspace, model, modelTypes.CONTAINERR,
				undefined, { includeFailed: true });

			expect(res).toEqual(expectedData);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`, { ...excludeIncomplete, ...excludeVoids }, {}, { timestamp: -1 });
		});

		test('Should include incompletes if it is specified', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getLatestRevision(teamspace, model, modelTypes.CONTAINERR,
				undefined, { includeIncomplete: true });

			expect(res).toEqual(expectedData);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`, { ...excludeFailed, ...excludeVoids }, {}, { timestamp: -1 });
		});

		test('Should return the latest revision if there is one (drawing)', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getLatestRevision(teamspace, model, modelTypes.DRAWING);

			expect(res).toEqual(expectedData);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`,
				{ ...excludeIncomplete, ...excludeFailed, ...excludeVoids, model }, {}, { timestamp: -1 });
		});

		test('Should throw REVISION_NOT_FOUND if there is no revision', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(Revisions.getLatestRevision(teamspace, model, modelTypes.CONTAINER))
				.rejects.toEqual(templates.revisionNotFound);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`, { ...excludeIncomplete, ...excludeFailed, ...excludeVoids }, {}, { timestamp: -1 });
		});
	});
};

const testGetRevisions = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();

	const checkResults = (fn, showVoid, modelType, projection = {}, sort = { timestamp: -1 }) => {
		const query = {
			...excludeIncomplete,
			...excludeFailed,
			...(modelType === modelTypes.DRAWING ? { model, project } : {}),
		};

		if (!showVoid) {
			query.void = { $ne: true };
		}

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(teamspace, modelType === modelTypes.DRAWING ? `${modelType}s.history` : `${model}.history`,
			query, projection, sort);
	};

	const expectedData = [
		{ _id: generateRandomString(), author: generateRandomString(), timestamp: new Date() },
		{ _id: generateRandomString(), author: generateRandomString(), timestamp: new Date() },
		{ _id: generateRandomString(), author: generateRandomString(), timestamp: new Date(), void: true },
	];

	describe('GetRevisions', () => {
		test('Should return all container revisions', async () => {
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getRevisions(teamspace, project, model, modelTypes.CONTAINER, true);
			expect(res).toEqual(expectedData);
			checkResults(fn, true);
		});

		test('Should return non void container revisions (with projection and sort)', async () => {
			const nonVoidRevisions = expectedData.filter((rev) => !rev.void);
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(nonVoidRevisions);
			const projection = { _id: 1 };
			const sort = { [generateRandomString()]: -1 };
			const res = await Revisions.getRevisions(teamspace, project, model,
				modelTypes.CONTAINER, false, projection, sort);
			expect(res).toEqual(nonVoidRevisions);
			checkResults(fn, false, modelTypes.CONTAINER, projection, sort);
		});

		test('Should return an empty object if there are no revisions', async () => {
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce([]);
			const res = await Revisions.getRevisions(teamspace, project, model, modelTypes.CONTAINER, true);
			expect(res).toEqual([]);
			checkResults(fn, true);
		});

		test('Should return all container revisions (drawing)', async () => {
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getRevisions(teamspace, project, model, modelTypes.DRAWING, true);
			expect(res).toEqual(expectedData);
			checkResults(fn, true, modelTypes.DRAWING);
		});
	});
};

const testGetRevisionsByQuery = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const query = generateRandomObject();
	const projection = generateRandomObject();
	const expectedData = [generateRandomObject(), generateRandomObject()];

	describe('GetRevisionsByQuery', () => {
		test('Should return the revisions (container)', async () => {
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getRevisionsByQuery(teamspace, project, model, modelTypes.CONTAINER,
				query, projection);
			expect(res).toEqual(expectedData);

			const formattedQuery = {
				...excludeVoids,
				...excludeFailed,
				...excludeIncomplete,
				...query,
			};

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`, formattedQuery, projection, { timestamp: -1 });
		});

		test('Should return the revisions (drawing)', async () => {
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedData);
			const res = await Revisions.getRevisionsByQuery(teamspace, project, model, modelTypes.DRAWING,
				query, projection);
			expect(res).toEqual(expectedData);

			const formattedQuery = {
				...excludeVoids,
				...excludeFailed,
				...excludeIncomplete,
				...query,
				project,
				model,
			};

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL, formattedQuery,
				projection, { timestamp: -1 });
		});
	});
};

const testGetRevisionByIdOrTag = () => {
	const revision = { _id: 1, author: 'someUser', timestamp: new Date() };
	const teamspace = generateRandomString();
	const model = generateRandomString();
	const projection = generateRandomObject();

	describe('GetRevisionByIdOrTag', () => {
		describe.each([
			['includeVoid option set to true', { includeVoid: true }],
			['includeFailed option set to true', { includeFailed: true }],
			['includeIncomplete option set to true', { includeIncomplete: true }],
		])('Query options', (desc, options) => {
			test(`Should return revision with ${desc}`, async () => {
				const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(revision);

				const query = {
					$or: [{ _id: revision._id }, { tag: revision._id }],
					...(options.includeVoid ? {} : { ...excludeVoids }),
					...(options.includeFailed ? {} : { ...excludeFailed }),
					...(options.includeIncomplete ? {} : { ...excludeIncomplete }),
				};

				const res = await Revisions.getRevisionByIdOrTag(teamspace, model, modelTypes.CONTAINER,
					revision._id, projection, options);

				expect(res).toEqual(revision);
				expect(fn).toHaveBeenCalledTimes(1);
				expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`, query, projection, undefined);
			});
		});

		test('Should return revision (drawing)', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(revision);
			const res = await Revisions.getRevisionByIdOrTag(teamspace, model, modelTypes.DRAWING, revision._id);
			expect(res).toEqual(revision);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`,
				{ $or: [{ _id: revision._id }, { tag: revision._id }],
					model,
					...excludeVoids,
					...excludeFailed,
					...excludeIncomplete }, {}, undefined);
		});

		test('Should throw REVISION_NOT_FOUND if it cannot find the revision in the revisions table', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(Revisions.getRevisionByIdOrTag(teamspace, model, modelTypes.CONTAINER, revision._id))
				.rejects.toEqual(templates.revisionNotFound);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`,
				{ $or: [{ _id: revision._id }, { tag: revision._id }],
					...excludeVoids,
					...excludeFailed,
					...excludeIncomplete }, {}, undefined);
		});
	});
};

const testAddRevision = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const data = { prop: generateRandomString() };

	describe('AddRevision', () => {
		test('Should add a new revision', async () => {
			const modelType = modelTypes.CONTAINER;
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce();
			const res = await Revisions.addRevision(teamspace, project, model, modelType, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(`${model}.history`);
			expect(fn.mock.calls[0][2].prop).toEqual(data.prop);
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
			expect(isUUIDString(fn.mock.calls[0][2]._id));
			expect(fn.mock.calls[0][2]).toHaveProperty('timestamp');
			expect(res).toEqual(fn.mock.calls[0][2]._id);
		});

		test('Should add a new revision (drawing)', async () => {
			const modelType = modelTypes.DRAWING;
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce();
			const res = await Revisions.addRevision(teamspace, project, model, modelType, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(`${modelType}s.history`);
			expect(fn.mock.calls[0][2].prop).toEqual(data.prop);
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
			expect(isUUIDString(fn.mock.calls[0][2]._id));
			expect(fn.mock.calls[0][2]).toHaveProperty('timestamp');
			expect(res).toEqual(fn.mock.calls[0][2]._id);
		});
	});
};

const testDeleteModelRevisions = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();

	describe('DeleteModelRevisions', () => {
		test('Should delete revisions', async () => {
			const modelType = modelTypes.CONTAINER;
			const fn = jest.spyOn(db, 'deleteMany').mockResolvedValueOnce();
			await Revisions.deleteModelRevisions(teamspace, project, model, modelType);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`, { project, model });
		});

		test('Should delete revisions (drawing)', async () => {
			const modelType = modelTypes.DRAWING;
			const fn = jest.spyOn(db, 'deleteMany').mockResolvedValueOnce();
			await Revisions.deleteModelRevisions(teamspace, project, model, modelType);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelType}s.history`, { project, model });
		});
	});
};

const testUpdateProcessingStatus = () => {
	describe('Update processing status', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const revisionId = generateRandomString();
		const status = generateRandomString();
		test('Should update the status and trigger a model settings update', async () => {
			const modelType = modelTypes.CONTAINER;
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce({ _id: revisionId });

			await Revisions.updateProcessingStatus(teamspace, project, model, modelType, revisionId, status);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`,
				{ $or: [{ _id: revisionId }, { tag: revisionId }] }, { $set: { status } },
				{ projection: { _id: 1 } },
			);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{ teamspace, project, model, modelType, data: { status } });
		});

		test('Should not trigger a status update if the revision is not found', async () => {
			const modelType = modelTypes.DRAWING;
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce();

			await expect(Revisions.updateProcessingStatus(teamspace, project, model, modelType, revisionId,
				status)).rejects.toEqual(templates.revisionNotFound);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelType}s.history`,
				{ $or: [{ _id: revisionId }, { tag: revisionId }] }, { $set: { status } },
				{ projection: { _id: 1 } },
			);

			expect(EventsManager.publish).not.toHaveBeenCalled();
		});
	});
};

const testOnProcessingCompleted = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const revId = generateRandomString();
	const modelType = modelTypes.DRAWING;
	const author = generateRandomString();

	describe('On processing completed', () => {
		test('Should update revision and publish 3 events upon success', async () => {
			const retInfo = getInfoFromCode(0);
			retInfo.retVal = 0;

			const { success, message, userErr, retVal: errCode } = retInfo;

			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce({ _id: revId, author });

			await Revisions.onProcessingCompleted(teamspace, project, model, revId, retInfo, modelType);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelType}s.history`,
				{ $or: [{ _id: revId }, { tag: revId }] }, { $unset: { status: 1, incomplete: 1 } },
				{ projection: { author: 1 } },
			);

			const { timestamp } = EventsManager.publish.mock.calls[0][1].data;
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_IMPORT_FINISHED, {
				teamspace,
				project,
				model,
				success,
				message,
				userErr,
				revId,
				errCode,
				user: author,
				modelType,
				data: { status: processStatuses.OK, timestamp },
			});
		});

		test('Should update revision and publish 2 events upon failure', async () => {
			const retInfo = getInfoFromCode(1);
			retInfo.retVal = 1;

			const { success, message, userErr, retVal: errCode } = retInfo;

			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce({ _id: revId, author });

			await Revisions.onProcessingCompleted(teamspace, project, model, revId, retInfo, modelType);

			const setObj = { status: processStatuses.FAILED,
				errorReason: expect.objectContaining({
					message, errorCode: errCode }) };

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelType}s.history`,
				{ $or: [{ _id: revId }, { tag: revId }] }, { $unset: { incomplete: 1 }, $set: setObj },
				{ projection: { author: 1 } },
			);

			const { timestamp } = EventsManager.publish.mock.calls[0][1].data;
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_IMPORT_FINISHED, {
				teamspace,
				project,
				model,
				success,
				message,
				userErr,
				revId,
				errCode,
				user: author,
				modelType,
				data: { ...setObj, timestamp },
			});
		});

		test('Should not trigger any event if the revision is not found', async () => {
			const retInfo = getInfoFromCode(0);
			retInfo.retVal = 0;

			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce();

			await expect(Revisions.onProcessingCompleted(teamspace, project, model,
				revId, retInfo, modelType)).rejects.toEqual(templates.revisionNotFound);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelType}s.history`,
				{ $or: [{ _id: revId }, { tag: revId }] }, { $unset: { status: 1, incomplete: 1 } },
				{ projection: { author: 1 } },
			);

			expect(EventsManager.publish).not.toHaveBeenCalled();
		});
	});
};

const testUpdateRevisionStatus = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const revision = { _id: 1, author: 'someUser', timestamp: new Date(), void: true };
	const newStatus = false;

	const checkResults = (fn, modelType, voidStatus) => {
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(teamspace, modelType === modelTypes.DRAWING ? `${modelType}s.history` : `${model}.history`,
			{ $or: [{ _id: revision._id }, { tag: revision._id }] }, { $set: { void: voidStatus } },
			{ projection: { _id: 1 } },
		);
	};

	describe('UpdateRevisionStatus', () => {
		test('Should update the void status of a revision', async () => {
			const modelType = modelTypes.CONTAINER;
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockImplementationOnce(() => ({ _id: revision._id }));
			await Revisions.updateRevisionStatus(teamspace, project, model, modelType,
				revision._id, newStatus);
			checkResults(fn, modelType, newStatus);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.REVISION_UPDATED,
				{ teamspace, project, model, modelType, data: { _id: revision._id, void: newStatus } });
		});

		test('Should update the void status of a revision (drawing)', async () => {
			const modelType = modelTypes.DRAWING;
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockImplementationOnce(() => ({ _id: revision._id }));
			await Revisions.updateRevisionStatus(teamspace, project, model, modelType,
				revision._id, newStatus);
			checkResults(fn, modelType, newStatus);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.REVISION_UPDATED,
				{ teamspace, project, model, modelType, data: { _id: revision._id, void: newStatus } });
		});

		test('Should throw REVISION_NOT_FOUND if it cannot find the revision in the revisions table', async () => {
			const modelType = modelTypes.CONTAINER;
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockImplementationOnce(() => undefined);
			await expect(Revisions.updateRevisionStatus(teamspace, project, model,
				modelType, revision._id, newStatus)).rejects.toEqual(templates.revisionNotFound);
			checkResults(fn, modelType, newStatus);
			expect(EventsManager.publish).toHaveBeenCalledTimes(0);
		});
	});
};

const testIsTagUnique = () => {
	describe('Is Valid Tag', () => {
		test('Should return false if tag already exists', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce('existingTag');
			const res = await Revisions.isTagUnique('someTS', 'someModel', 'someTag');
			expect(res).toEqual(false);
			expect(fn.mock.calls.length).toBe(1);
		});

		test('Should return true if tag is unique', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			const res = await Revisions.isTagUnique('someTS', 'someModel', 'someTag');
			expect(res).toEqual(true);
			expect(fn.mock.calls.length).toBe(1);
		});
	});
};

const testIsRevAndStatusCodeUnique = () => {
	describe('Is valid Rev and Status codes combination', () => {
		const teamspace = generateRandomString();
		const model = generateRandomString();
		const revCode = generateRandomString();
		const statusCode = generateRandomString();

		test('Should return false if tag already exists', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(generateRandomString());
			const res = await Revisions.isRevAndStatusCodeUnique(teamspace, model, revCode, statusCode);
			expect(res).toEqual(false);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`, { revCode, statusCode, model },
				undefined, undefined,
			);
		});

		test('Should return false if tag already exists', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			const res = await Revisions.isRevAndStatusCodeUnique(teamspace, model, revCode, statusCode);
			expect(res).toEqual(true);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`, { revCode, statusCode, model },
				undefined, undefined,
			);
		});
	});
};

const testGetRevisionFormat = () => {
	describe('Get revision format', () => {
		test('Should return undefined if revision has no file', () => {
			const res = Revisions.getRevisionFormat(undefined);
			expect(res).toEqual(undefined);
		});

		test('Should return the format if revision has file', () => {
			const format = generateRandomString();
			const file = [`${generateRandomString()}_${generateRandomString()}_${format}`];
			const res = Revisions.getRevisionFormat(file);
			expect(res).toEqual(`.${format}`);
		});
	});
};

const testAddDrawingThumbnailRef = () => {
	describe('Add drawing thumbnail reference', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const thumbnailRef = generateUUID();
		const revId = generateUUID();
		test('Should throw REVISION_NOT_FOUND if it cannot find the revision', async () => {
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce();
			await expect(Revisions.addDrawingThumbnailRef(teamspace, project, model, revId, thumbnailRef))
				.rejects.toEqual(templates.revisionNotFound);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`,
				{ $or: [{ _id: revId }, { tag: revId }] }, { $set: { thumbnail: thumbnailRef } },
				{ projection: { _id: 1 } },
			);
		});

		test('Should add thumbnail reference as requested', async () => {
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce({ _id: generateRandomString() });
			await expect(Revisions.addDrawingThumbnailRef(teamspace, project, model, revId, thumbnailRef))
				.resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`,
				{ $or: [{ _id: revId }, { tag: revId }] }, { $set: { thumbnail: thumbnailRef } },
				{ projection: { _id: 1 } },
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetRevisionCount();
	testGetLatestRevision();
	testGetRevisions();
	testGetRevisionsByQuery();
	testAddRevision();
	testDeleteModelRevisions();
	testUpdateRevisionStatus();
	testIsTagUnique();
	testIsRevAndStatusCodeUnique();
	testGetRevisionByIdOrTag();
	testGetRevisionFormat();
	testUpdateProcessingStatus();
	testOnProcessingCompleted();
	testAddDrawingThumbnailRef();
});
