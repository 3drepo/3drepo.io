/**
 *  Copyright (C) 2024 3D Repo Ltd
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
const Mongo = require('mongodb');
const UUIDParse = require('uuid-parse');
const { templates } = require('../../../../src/v5/utils/responseCodes');
const { src } = require('../../helper/path');

const History = require(`${src}/models/history`);
const ServiceHelper = require('../../helper/services');

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);

const stringToUUID = (string) => {
	const bytes = UUIDParse.parse(string);
	// eslint-disable-next-line new-cap
	return Mongo.Binary(new Buffer.from(bytes), 3);
};

const testFindByUID = () => {
	describe('Find a history entry by UID', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const modelId = ServiceHelper.generateUUIDString();
		const revIdStr = ServiceHelper.generateUUIDString();
		const revId = stringToUUID(revIdStr);

		const mockProjection = {
			id: 1,
		};

		const mockQuery = {
			_id: revId,
		};

		const mockEntry = {
			data: 'mock',
		};

		test('should get entry from db while using a projection', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.findByUID(teamspace, modelId, revIdStr, mockProjection);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				mockQuery,
				mockProjection,
				undefined,
			);

			expect(resultEntry).toEqual(mockEntry);
		});

		test('should get entry from db without using a projection', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.findByUID(teamspace, modelId, revIdStr);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				mockQuery,
				{},
				undefined,
			);

			expect(resultEntry).toEqual(mockEntry);
		});
	});
};

const testFindByTag = () => {
	describe('Find a history entry by tag', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const modelId = ServiceHelper.generateUUIDString();
		const tag = ServiceHelper.generateRandomString();

		const mockProjection = {
			id: 1,
		};

		const mockQuery = {
			tag,
			incomplete: { $exists: false },
		};

		const mockEntry = {
			data: 'mock',
		};

		test('should get entry from db while using a projection', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.findByTag(teamspace, modelId, tag, mockProjection);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				mockQuery,
				mockProjection,
				undefined,
			);

			expect(resultEntry).toEqual(mockEntry);
		});

		test('should get entry from db without using a projection', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.findByTag(teamspace, modelId, tag);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				mockQuery,
				{},
				undefined,
			);

			expect(resultEntry).toEqual(mockEntry);
		});
	});
};

const testFindByBranch = () => {
	describe('Find a history entry by branch', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const modelId = ServiceHelper.generateUUIDString();

		const branchStr = ServiceHelper.generateUUIDString();
		const branch = stringToUUID(branchStr);

		const masterBranchStr = '00000000-0000-0000-0000-000000000000';
		const masterBranch = stringToUUID(masterBranchStr);
		const masterBranchName = 'master';

		const mockProjection = {
			id: 1,
		};

		const mockEntry = {
			data: 'mock',
		};

		const expSort = { timestamp: -1 };

		test('should get entry from db while using a projection and showing void entries', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.findByBranch(teamspace, modelId, branchStr, mockProjection, true);

			const expQuery = {
				incomplete: { $exists: false },
				shared_id: branch,
			};

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				expQuery,
				mockProjection,
				expSort,
			);

			expect(resultEntry).toEqual(mockEntry);
		});

		test('should get entry from db without using a projection and not showing void entries', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.findByBranch(teamspace, modelId, branchStr);

			const expQuery = {
				incomplete: { $exists: false },
				void: { $ne: true },
				shared_id: branch,
			};

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				expQuery,
				{},
				expSort,
			);

			expect(resultEntry).toEqual(mockEntry);
		});

		test('should use the master branch UID if the master branch name is supplied as branch name', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.findByBranch(teamspace, modelId, masterBranchName);

			const expQuery = {
				incomplete: { $exists: false },
				void: { $ne: true },
				shared_id: masterBranch,
			};

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				expQuery,
				{},
				expSort,
			);

			expect(resultEntry).toEqual(mockEntry);
		});

		test('should fall back on the master branch UID if no branch is supplied', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.findByBranch(teamspace, modelId);

			const expQuery = {
				incomplete: { $exists: false },
				void: { $ne: true },
				shared_id: masterBranch,
			};

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				expQuery,
				{},
				expSort,
			);

			expect(resultEntry).toEqual(mockEntry);
		});
	});
};

const testGetHistory = () => {
	describe('Find a history entry by revision ID or branch', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const modelId = ServiceHelper.generateUUIDString();

		const revIdStr = ServiceHelper.generateUUIDString();
		const revId = stringToUUID(revIdStr);

		const branchStr = ServiceHelper.generateUUIDString();
		const branch = stringToUUID(branchStr);

		const tag = ServiceHelper.generateRandomString();

		const mockProjection = {
			id: 1,
		};

		const mockEntry = {
			data: 'mock',
		};

		const expSort = { timestamp: -1 };

		test('should get entry from db using the revId (string)', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.getHistory(teamspace, modelId, branchStr, revIdStr, mockProjection);

			const mockQuery = {
				_id: revId,
			};

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				mockQuery,
				mockProjection,
				undefined,
			);

			expect(resultEntry).toEqual(mockEntry);
		});

		test('should get entry from db using the revId (binary)', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.getHistory(teamspace, modelId, branchStr, revId, mockProjection);

			const mockQuery = {
				_id: revId,
			};

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				mockQuery,
				mockProjection,
				undefined,
			);

			expect(resultEntry).toEqual(mockEntry);
		});

		test('should get entry from db using the revId (tag)', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.getHistory(teamspace, modelId, branchStr, tag, mockProjection);

			const mockQuery = {
				tag,
				incomplete: { $exists: false },
			};

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				mockQuery,
				mockProjection,
				undefined,
			);

			expect(resultEntry).toEqual(mockEntry);
		});

		test('should get entry from db using the branch', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.getHistory(teamspace, modelId, branchStr, undefined, mockProjection);

			const mockQuery = {
				incomplete: { $exists: false },
				void: { $ne: true },
				shared_id: branch,
			};

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				mockQuery,
				mockProjection,
				expSort,
			);

			expect(resultEntry).toEqual(mockEntry);
		});

		test('should throw revisionNotFoundError if no history entry is found for any reason', async () => {
			await expect(History.getHistory(teamspace, modelId, undefined, undefined, mockProjection))
				.rejects.toEqual(templates.revisionNotFound);
		});
	});
};

const testFindLatest = () => {
	describe('Find the history entry that is the head of the master branch', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const modelId = ServiceHelper.generateUUIDString();

		const masterBranchStr = '00000000-0000-0000-0000-000000000000';
		const masterBranch = stringToUUID(masterBranchStr);

		const mockProjection = {
			id: 1,
		};

		const mockEntry = {
			data: 'mock',
		};

		const expSort = { timestamp: -1 };

		test('should return the entry that is the head of the default branch', async () => {
			db.findOne.mockResolvedValueOnce(mockEntry);

			const resultEntry = await History.findLatest(teamspace, modelId, mockProjection);

			const expQuery = {
				incomplete: { $exists: false },
				void: { $ne: true },
				shared_id: masterBranch,
			};

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.history`,
				expQuery,
				mockProjection,
				expSort,
			);

			expect(resultEntry).toEqual(mockEntry);
		});
	});
};

describe('models/history', () => {
	testFindByUID();
	testFindByTag();
	testFindByBranch();
	testGetHistory();
	testFindLatest();
});
