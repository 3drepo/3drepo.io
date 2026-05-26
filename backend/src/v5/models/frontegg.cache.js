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

const { createIndices, deleteMany, findOne, updateOne } = require('../handler/db');
const { INTERNAL_DB } = require('../handler/db.constants');
const { logger } = require('../utils/logger');

const Cache = {};

const CACHE_COL = 'frontegg.cache';

const CACHE_LIFETIME_MINUTES = 1;
const PURGE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let intervalId;

const getDateTimeWithinLifeSpan = () => {
	const date = new Date();
	date.setMinutes(date.getMinutes() - CACHE_LIFETIME_MINUTES);
	return date;
};

Cache.loadCache = async (key) => {
	const cacheEntry = await findOne(INTERNAL_DB, CACHE_COL, {
		_id: key, created: { $gte: getDateTimeWithinLifeSpan() } }, { data: 1 });
	return cacheEntry?.data ?? null;
};

Cache.saveCache = async (key, data) => {
	await updateOne(INTERNAL_DB, CACHE_COL,
		{ _id: key },
		{ $set: { data, created: new Date() } },
		{ upsert: true });
};

Cache.purgeCacheWithKeyContaining = async (key) => {
	try {
		await deleteMany(INTERNAL_DB, CACHE_COL, { _id: { $regex: key } });
	} catch (err) {
		logger.logError(`Error purging Frontegg cache: ${err.message}`);
	}
};

const purgeCache = async () => {
	try {
		await deleteMany(INTERNAL_DB, CACHE_COL, { created: { $lt: getDateTimeWithinLifeSpan() } });
	} catch (err) {
		logger.logError(`Error purging Frontegg cache: ${err.message}`);
	}
};

Cache.initialise = async () => {
	await createIndices(INTERNAL_DB, CACHE_COL, [
		{ key: { _id: 1, created: -1 } },
		{ key: { created: -1 } },
	]);

	Cache.stopPurge();

	intervalId = setInterval(purgeCache, PURGE_INTERVAL_MS); // every 5 minutes
};

// Designed to be called by tests so we can exit cleanly
/* istanbul ignore next */
Cache.stopPurge = () => {
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
	}
};

module.exports = Cache;
