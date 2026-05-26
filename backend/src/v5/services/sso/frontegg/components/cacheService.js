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

const { loadCache, purgeCacheWithKeyContaining, saveCache } = require('../../../../models/frontegg.cache');

const CacheService = {};
const dataPromises = {};

// If data is in cache and it's hot, return it. Otherwise, fetch it using fetchFn, store it in cache, and return it.
CacheService.getCached = async (key, fetchFn) => {
	const data = await loadCache(key);

	if (data !== null) {
		return data;
	}

	if (!dataPromises[key]) {
		dataPromises[key] = fetchFn();
		const freshData = await dataPromises[key];
		await saveCache(key, freshData);
		delete dataPromises[key];
		return freshData;
	}
	return dataPromises[key];
};

CacheService.removeCache = async (key) => {
	await purgeCacheWithKeyContaining(key);
};

CacheService.generateKey = ({ accountId, userId, context }) => {
	const keyParts = [];
	if (accountId) {
		keyParts.push(`account_${accountId}`);
	}
	if (userId) {
		keyParts.push(`user_${userId}`);
	}
	if (context) {
		keyParts.push(context);
	}

	if (keyParts.length === 0) {
		throw new Error('Key cannot be empty');
	}

	return keyParts.join(':');
};
module.exports = CacheService;
