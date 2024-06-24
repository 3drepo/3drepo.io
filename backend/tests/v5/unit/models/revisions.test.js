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
const { generateRandomString } = require('../../helper/services');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { DRAWINGS_HISTORY_COL } = require(`${src}/models/revisions.constants`);

const testGetRevisionCount = () => {
	describe('GetRevisionCount', () => {
		test('should return the number of revision as per from the database query', async () => {
			const expectedData = 10;
			jest.spyOn(db, 'count').mockResolvedValue(expectedData);

			const res = await Revisions.getRevisionCount('someTS', 'someModel');
			expect(res).toEqual(expectedData);
		});
	});
};

const testGetLatestRevision = () => {
	describe('GetLatestRevision', () => {
		test('Should return the latest revision if there is one', async () => {
			const expectedData = {
				_id: 1,
				tag: 'rev1',
			};
			jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const res = await Revisions.getLatestRevision('someTS', 'someModel');
			expect(res).toEqual(expectedData);
		});

		test('Should throw REVISION_NOT_FOUND if there is no revision', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(Revisions.getLatestRevision('someTS', 'someModel')).rejects.toEqual(templates.revisionNotFound);
		});
	});
};

const testGetRevisions = () => {
	const teamspace = generateRandomString();
	const model = generateRandomString();

	const checkResults = (fn, showVoid, isDrawing) => {
		const query = { incomplete: { $exists: false } };

		if (!showVoid) {
			query.void = { $ne: true };
		}

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(teamspace, isDrawing ? DRAWINGS_HISTORY_COL : `${model}.history`,
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
			checkResults(fn, true, true);
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
			expect(fn).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL,
				{ $or: [{ _id: revision._id }, { tag: revision._id }] }, {}, undefined);
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

const testUpdateRevisionStatus = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const revision = { _id: 1, author: 'someUser', timestamp: new Date(), void: true };
	const newStatus = false;

	const checkResults = (fn, isDrawing, voidStatus) => {
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(teamspace, isDrawing ? DRAWINGS_HISTORY_COL : `${model}.history`,
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
			checkResults(fn, false, newStatus);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.REVISION_UPDATED,
				{ teamspace, project, model, modelType, data: { _id: revision._id, void: newStatus } });
		});

		test('Should update the void status of a revision (drawing)', async () => {
			const modelType = modelTypes.DRAWING;
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockImplementationOnce(() => ({ _id: revision._id }));
			await Revisions.updateRevisionStatus(teamspace, project, model, modelType,
				revision._id, newStatus);
			checkResults(fn, true, newStatus);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.REVISION_UPDATED,
				{ teamspace, project, model, modelType, data: { _id: revision._id, void: newStatus } });
		});

		test('Should throw REVISION_NOT_FOUND if it cannot find the revision in the revisions table', async () => {
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockImplementationOnce(() => undefined);
			await expect(Revisions.updateRevisionStatus(teamspace, project, model,
				modelTypes.CONTAINER, revision._id, newStatus)).rejects.toEqual(templates.revisionNotFound);
			checkResults(fn, false, newStatus);
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
			expect(fn).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL, { revCode, statusCode },
				undefined, undefined,
			);
		});

		test('Should return false if tag already exists', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			const res = await Revisions.isRevAndStatusCodeUnique(teamspace, model, revCode, statusCode);
			expect(res).toEqual(true);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL, { revCode, statusCode },
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

describe('models/revisions', () => {
	testGetRevisionCount();
	testGetLatestRevision();
	testGetRevisions();
	testUpdateRevisionStatus();
	testIsTagUnique();
	testIsRevAndStatusCodeUnique();
	testGetRevisionByIdOrTag();
	testGetRevisionFormat();
});
