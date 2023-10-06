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
	const checkResults = (fn, showVoid) => {
		const query = { incomplete: { $exists: false } };

		if (!showVoid) {
			query.void = { $ne: true };
		}

		expect(fn.mock.calls.length).toBe(1);
		expect(fn.mock.calls[0][2]).toEqual(query);
	};

	const expectedData = [
		{ _id: 1, author: 'someUser', timestamp: new Date() },
		{ _id: 2, author: 'someUser', timestamp: new Date() },
		{ _id: 3, author: 'someUser', timestamp: new Date(), void: true },
	];

	describe('GetRevisions', () => {
		test('Should return all container revisions', async () => {
			const fn = jest.spyOn(db, 'find').mockResolvedValue(expectedData);
			const res = await Revisions.getRevisions('someTS', 'someModel', true);
			expect(res).toEqual(expectedData);
			checkResults(fn, true);
		});

		test('Should return non void container revisions', async () => {
			const nonVoidRevisions = expectedData.filter((rev) => !rev.void);
			const fn = jest.spyOn(db, 'find').mockResolvedValue(nonVoidRevisions);
			const res = await Revisions.getRevisions('someTS', 'someModel', false);
			expect(res).toEqual(nonVoidRevisions);
			checkResults(fn, false);
		});

		test('Should return an empty object if there are no revisions', async () => {
			const fn = jest.spyOn(db, 'find').mockResolvedValue([]);
			const res = await Revisions.getRevisions('someTS', 'someModel', true);
			expect(res).toEqual([]);
			checkResults(fn, true);
		});
	});
};

const testGetRevisionByIdOrTag = () => {
	const revision = { _id: 1, author: 'someUser', timestamp: new Date() };

	describe('GetRevisionByIdOrTag', () => {
		test('Should return revision', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(revision);
			const res = await Revisions.getRevisionByIdOrTag('someTS', 'someModel', 1);
			expect(res).toEqual(revision);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][2]).toEqual({ $or: [{ _id: 1 }, { tag: 1 }] });
		});

		test('Should throw REVISION_NOT_FOUND if it cannot find the revision in the revisions table', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(Revisions.getRevisionByIdOrTag('someTS', 'someModel', 1)).rejects.toEqual(templates.revisionNotFound);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][2]).toEqual({ $or: [{ _id: 1 }, { tag: 1 }] });
		});
	});
};

const testUpdateRevisionStatus = () => {
	const checkResults = (fn, revision, voidStatus) => {
		expect(fn.mock.calls.length).toBe(1);
		expect(fn.mock.calls[0][2]).toEqual({ $or: [{ _id: revision }, { tag: revision }] });
		expect(fn.mock.calls[0][3]).toEqual({ $set: { void: voidStatus } });
	};

	describe('UpdateRevisionStatus', () => {
		test('Should update the void status of a revision', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const revision = { _id: 1, author: 'someUser', timestamp: new Date(), void: true };
			const newStatus = false;
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockImplementationOnce(() => ({ _id: revision._id }));
			const publishFn = EventsManager.publish.mockImplementationOnce(() => { });
			await Revisions.updateRevisionStatus(teamspace, project, model, revision._id, newStatus);
			checkResults(fn, revision._id, newStatus);
			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.REVISION_UPDATED,
				{ teamspace, project, model, data: { _id: revision._id, void: newStatus } });
		});

		test('Should throw REVISION_NOT_FOUND if it cannot find the revision in the revisions table', async () => {
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockImplementationOnce(() => undefined);
			const publishFn = EventsManager.publish.mockImplementationOnce(() => { });
			const revisionId = generateRandomString();
			const newStatus = true;
			await expect(Revisions.updateRevisionStatus(generateRandomString(), generateRandomString(),
				generateRandomString(), revisionId, newStatus)).rejects.toEqual(templates.revisionNotFound);
			checkResults(fn, revisionId, newStatus);
			expect(publishFn).toHaveBeenCalledTimes(0);
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
	testGetRevisionByIdOrTag();
	testGetRevisionFormat();
});
