/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { times } = require('lodash');
const { src } = require('../../../../../helper/path');

const { determineTestGroup, generateRandomString, generateRandomObject } = require('../../../../../helper/services');

jest.mock('../../../../../../../src/v5/models/frontegg.cache');
const FronteggCache = require(`${src}/models/frontegg.cache`);

const CacheService = require(`${src}/services/sso/frontegg/components/cacheService`);

const testLoadCache = () => {
	describe('Load Cache', () => {
		test('Should load cache when data is present', async () => {
			const key = generateRandomString();
			const cachedData = generateRandomObject();

			const fetchFn = jest.fn();

			FronteggCache.loadCache.mockResolvedValueOnce(cachedData);

			await expect(CacheService.getCached(key, fetchFn)).resolves.toEqual(cachedData);
			expect(fetchFn).not.toHaveBeenCalled();
			expect(FronteggCache.loadCache).toHaveBeenCalledTimes(1);
			expect(FronteggCache.loadCache).toHaveBeenCalledWith(key);
		});
		test('Should call fetch fn if cache is not available', async () => {
			const key = generateRandomString();
			const cachedData = generateRandomObject();

			const fetchFn = jest.fn().mockResolvedValueOnce(cachedData);

			FronteggCache.loadCache.mockResolvedValueOnce(null);

			await expect(CacheService.getCached(key, fetchFn)).resolves.toEqual(cachedData);
			expect(fetchFn).toHaveBeenCalledTimes(1);
			expect(FronteggCache.loadCache).toHaveBeenCalledTimes(1);
			expect(FronteggCache.loadCache).toHaveBeenCalledWith(key);
		});

		test('Should only call fetch once despite multiple calls', async () => {
			const key = generateRandomString();
			const cachedData = generateRandomObject();

			const fetchFn = jest.fn().mockImplementationOnce(() => new Promise((resolve) => {
				setTimeout(() => {
					resolve(cachedData);
				}, 500);
			}),

			);

			FronteggCache.loadCache.mockResolvedValue(null);
			const nCalls = 10;

			await Promise.all(
				times(nCalls, () => expect(CacheService.getCached(key, fetchFn)).resolves.toEqual(cachedData)));
			expect(fetchFn).toHaveBeenCalledTimes(1);
			expect(FronteggCache.loadCache).toHaveBeenCalledTimes(nCalls);
			expect(FronteggCache.loadCache).toHaveBeenCalledWith(key);
		});
	});
};

const testRemoveCache = () => {
	describe('Remove Cache', () => {
		test('Should call purge cache with correct key', async () => {
			const key = generateRandomString();

			await CacheService.removeCache(key);

			expect(FronteggCache.purgeCacheWithKeyContaining).toHaveBeenCalledTimes(1);
			expect(FronteggCache.purgeCacheWithKeyContaining).toHaveBeenCalledWith(key);
		});
	});
};

const testGenerateKey = () => {
	const accountId = generateRandomString();
	const userId = generateRandomString();
	const context = generateRandomString();
	describe.each([
		['with accountId', { accountId }, `account_${accountId}:${context}`],
		['with userId', { userId }, `user_${userId}:${context}`],
		['with accountId and userId', { accountId, userId }, `account_${accountId}:user_${userId}:${context}`],
		['with just the context', {}, `${context}`],
		['with nothing', {}, 'Error'],
	])('Generate Key', (desc, input, expected) => {
		test(`Should ${expected === 'Error' ? 'throw an error when trying to' : 'successfully'} generate key ${desc}`, () => {
			if (expected === 'Error') {
				expect(() => CacheService.generateKey({ })).toThrow('Key cannot be empty');
			} else {
				expect(CacheService.generateKey({ ...input, context })).toBe(expected);
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testLoadCache();
	testRemoveCache();
	testGenerateKey();
});
