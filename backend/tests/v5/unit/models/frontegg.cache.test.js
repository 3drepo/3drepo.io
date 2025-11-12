/**
 *  Copyright (C) 202 3D Repo Ltd
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
const { generateRandomString, determineTestGroup, generateRandomObject } = require('../../helper/services');

const FronteggCache = require(`${src}/models/frontegg.cache`);

jest.mock('../../../../src/v5/handler/db');
const dbMock = require(`${src}/handler/db`);
const { INTERNAL_DB } = require(`${src}/handler/db.constants`);

const CACHE_COL = 'frontegg.cache';

const testLoadCache = () => {
	describe('Load Cache', () => {
		test('Should return the data portion of the entry', async () => {
			const key = generateRandomString();
			const expectedData = generateRandomObject();

			dbMock.findOne.mockResolvedValueOnce({ data: expectedData });

			await expect(FronteggCache.loadCache(key)).resolves.toEqual(expectedData);

			expect(dbMock.findOne).toHaveBeenCalledTimes(1);
			expect(dbMock.findOne).toHaveBeenCalledWith(INTERNAL_DB, CACHE_COL,
				{ _id: key, created: { $gte: expect.any(Date) } }, { data: 1 });
		});
		test('Should return null if no entry was found', async () => {
			const key = generateRandomString();

			dbMock.findOne.mockResolvedValueOnce(null);
			await expect(FronteggCache.loadCache(key)).resolves.toEqual(null);

			expect(dbMock.findOne).toHaveBeenCalledTimes(1);
			expect(dbMock.findOne).toHaveBeenCalledWith(INTERNAL_DB, CACHE_COL,
				{ _id: key, created: { $gte: expect.any(Date) } }, { data: 1 });
		});
	});
};
const testSaveCache = () => {
	describe('Save Cache', () => {
		test('Should insert the cache entry into the database', async () => {
			const key = generateRandomString();
			const data = generateRandomObject();
			await FronteggCache.saveCache(key, data);

			expect(dbMock.updateOne).toHaveBeenCalledTimes(1);
			expect(dbMock.updateOne).toHaveBeenCalledWith(INTERNAL_DB, CACHE_COL,
				{ _id: key },
				{ $set: { data, created: expect.any(Date) } }, { upsert: true });
		});
	});
};

const testPurgeCacheWithKeyContaining = () => {
	describe('Purge Cache With Key Containing', () => {
		test('Should delete all cache entries with keys containing the given substring', async () => {
			const substring = generateRandomString();
			await FronteggCache.purgeCacheWithKeyContaining(substring);

			expect(dbMock.deleteMany).toHaveBeenCalledTimes(1);
			expect(dbMock.deleteMany).toHaveBeenCalledWith(INTERNAL_DB, CACHE_COL,
				{ _id: { $regex: substring } });
		});

		test('Should fail gracefully', async () => {
			const substring = generateRandomString();
			dbMock.deleteMany.mockRejectedValueOnce(new Error('Database error'));
			await FronteggCache.purgeCacheWithKeyContaining(substring);

			expect(dbMock.deleteMany).toHaveBeenCalledTimes(1);
			expect(dbMock.deleteMany).toHaveBeenCalledWith(INTERNAL_DB, CACHE_COL,
				{ _id: { $regex: substring } });
		});
	});
};

const testInitialise = () => {
	describe('Initialise', () => {
		test('Should create indices', async () => {
			const orgInterval = global.setInterval;
			global.setInterval = jest.fn();
			await FronteggCache.initialise();

			expect(dbMock.createIndices).toHaveBeenCalledTimes(1);
			expect(dbMock.createIndices).toHaveBeenCalledWith(INTERNAL_DB, CACHE_COL,
				[
					{ key: { _id: 1, created: -1 } },
					{ key: { created: -1 } },
				]);

			expect(global.setInterval).toHaveBeenCalledTimes(1);
			expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000);

			const intervalFn = global.setInterval.mock.calls[0][0];
			intervalFn();
			expect(dbMock.deleteMany).toHaveBeenCalledTimes(1);
			expect(dbMock.deleteMany).toHaveBeenCalledWith(INTERNAL_DB, CACHE_COL,
				{ created: { $lt: expect.any(Date) } });

			global.setInterval = orgInterval;
		});

		test('Should fail gracefully if purge cache failed', async () => {
			const orgInterval = global.setInterval;
			global.setInterval = jest.fn();
			await FronteggCache.initialise();

			expect(dbMock.createIndices).toHaveBeenCalledTimes(1);
			expect(dbMock.createIndices).toHaveBeenCalledWith(INTERNAL_DB, CACHE_COL,
				[
					{ key: { _id: 1, created: -1 } },
					{ key: { created: -1 } },
				]);

			expect(global.setInterval).toHaveBeenCalledTimes(1);
			expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000);

			dbMock.deleteMany.mockRejectedValueOnce(new Error('Database error'));

			const intervalFn = global.setInterval.mock.calls[0][0];
			intervalFn();
			expect(dbMock.deleteMany).toHaveBeenCalledTimes(1);
			expect(dbMock.deleteMany).toHaveBeenCalledWith(INTERNAL_DB, CACHE_COL,
				{ created: { $lt: expect.any(Date) } });

			global.setInterval = orgInterval;
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testLoadCache();
	testSaveCache();
	testPurgeCacheWithKeyContaining();
	testInitialise();
});
