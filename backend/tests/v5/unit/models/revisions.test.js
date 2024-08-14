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
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);
const { determineTestGroup, generateRandomString, generateRandomObject, generateRandomNumber } = require('../../helper/services');

const { modelTypes, getInfoFromCode, STATUSES } = require(`${src}/models/modelSettings.constants`);
const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);

const excludeVoids = { void: { $ne: true } };
const excludeIncomplete = { incomplete: { $exists: false } };
const excludeFailed = { status: { $ne: STATUSES.FAILED } };

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
	const model = generateRandomString();

	const checkResults = (fn, showVoid, modelType) => {
		const query = { ...excludeIncomplete,
			...excludeFailed,
			...(modelType === modelTypes.DRAWING ? { model } : {}) };

		if (!showVoid) {
			query.void = { $ne: true };
		}

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(teamspace, modelType === modelTypes.DRAWING ? `${modelType}s.history` : `${model}.history`,
			query, {}, { timestamp: -1 });
	};

	const expectedData = [
		{ _id: 1, author: 'someUser', timestamp: new Date() },
		{ _id: 2, author: 'someUser', timestamp: new Date() },
		{ _id: 3, author: 'someUser', timestamp: new Date(), void: true },
	];

	describe('GetRevisions', () => {
		test('Should return all container revisions', async () => {
			const fn = jest.spyOn(db, 'find').mockResolvedValue(expectedData);
			const res = await Revisions.getRevisions(teamspace, model, modelTypes.CONTAINER, true);
			expect(res).toEqual(expectedData);
			checkResults(fn, true);
		});

		test('Should return non void container revisions', async () => {
			const nonVoidRevisions = expectedData.filter((rev) => !rev.void);
			const fn = jest.spyOn(db, 'find').mockResolvedValue(nonVoidRevisions);
			const res = await Revisions.getRevisions(teamspace, model, modelTypes.CONTAINER, false);
			expect(res).toEqual(nonVoidRevisions);
			checkResults(fn, false);
		});

		test('Should return an empty object if there are no revisions', async () => {
			const fn = jest.spyOn(db, 'find').mockResolvedValue([]);
			const res = await Revisions.getRevisions(teamspace, model, modelTypes.CONTAINER, true);
			expect(res).toEqual([]);
			checkResults(fn, true);
		});

		test('Should return all container revisions (drawing)', async () => {
			const fn = jest.spyOn(db, 'find').mockResolvedValue(expectedData);
			const res = await Revisions.getRevisions(teamspace, model, modelTypes.DRAWING, true);
			expect(res).toEqual(expectedData);
			checkResults(fn, true, modelTypes.DRAWING);
		});
	});
};

const testGetRevisionByIdOrTag = () => {
	const revision = { _id: 1, author: 'someUser', timestamp: new Date() };
	const teamspace = generateRandomString();
	const model = generateRandomString();

	describe('GetRevisionByIdOrTag', () => {
		test('Should return revision', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(revision);
			const res = await Revisions.getRevisionByIdOrTag(teamspace, model, modelTypes.CONTAINER, revision._id);
			expect(res).toEqual(revision);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`,
				{ $or: [{ _id: revision._id }, { tag: revision._id }] }, {}, undefined);
		});

		test('Should return revision (drawing)', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(revision);
			const res = await Revisions.getRevisionByIdOrTag(teamspace, model, modelTypes.DRAWING, revision._id);
			expect(res).toEqual(revision);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`,
				{ $or: [{ _id: revision._id }, { tag: revision._id }], model }, {}, undefined);
		});

		test('Should throw REVISION_NOT_FOUND if it cannot find the revision in the revisions table', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(Revisions.getRevisionByIdOrTag(teamspace, model, modelTypes.CONTAINER, revision._id))
				.rejects.toEqual(templates.revisionNotFound);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.history`,
				{ $or: [{ _id: revision._id }, { tag: revision._id }] }, {}, undefined);
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

			expect(EventsManager.publish).toHaveBeenCalledTimes(3);
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
			});

			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{ teamspace, project, model, modelType, data: { status: STATUSES.OK } });

			expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_REVISION,
				{ teamspace, project, model, modelType, revision: revId });
		});

		test('Should update revision and publish 2 events upon failure', async () => {
			const retInfo = getInfoFromCode(1);
			retInfo.retVal = 1;

			const { success, message, userErr, retVal: errCode } = retInfo;

			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce({ _id: revId, author });

			await Revisions.onProcessingCompleted(teamspace, project, model, revId, retInfo, modelType);

			const setObj = { status: STATUSES.FAILED,
				errorReason: {
					message, timestamp: expect.anything(), errorCode: errCode } };

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelType}s.history`,
				{ $or: [{ _id: revId }, { tag: revId }] }, { $unset: { incomplete: 1 }, $set: setObj },
				{ projection: { author: 1 } },
			);

			expect(EventsManager.publish).toHaveBeenCalledTimes(2);
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
			});

			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{ teamspace, project, model, modelType, data: setObj });
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
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue('existingTag');
			const res = await Revisions.isTagUnique('someTS', 'someModel', 'someTag');
			expect(res).toEqual(false);
			expect(fn.mock.calls.length).toBe(1);
		});

		test('Should return true if tag is unique', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
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
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(generateRandomString());
			const res = await Revisions.isRevAndStatusCodeUnique(teamspace, model, revCode, statusCode);
			expect(res).toEqual(false);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${modelTypes.DRAWING}s.history`, { revCode, statusCode, model },
				undefined, undefined,
			);
		});

		test('Should return false if tag already exists', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
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

describe(determineTestGroup(__filename), () => {
	testGetRevisionCount();
	testGetLatestRevision();
	testGetRevisions();
	testAddRevision();
	testDeleteModelRevisions();
	testUpdateRevisionStatus();
	testIsTagUnique();
	testIsRevAndStatusCodeUnique();
	testGetRevisionByIdOrTag();
	testGetRevisionFormat();
	testUpdateProcessingStatus();
	testOnProcessingCompleted();
});
