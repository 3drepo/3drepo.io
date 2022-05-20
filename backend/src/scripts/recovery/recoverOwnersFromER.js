/**
 *  Copyright (C) 2022 3D Repo Ltd
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

/*
 * Part 2 of the owner recover for the bug described at https://github.com/3drepo/3drepobouncer/issues/558
 * This is designed to run after recoverOwnersInRev.js, which produces a json file that is an input to this
 * This process attempts to find the closest match for the model import processing base on the elastic log provided.
 */

const { v5Path } = require('../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { stringToUUID } = require(`${v5Path}/utils/helper/uuids`);
const { updateOne } = require(`${v5Path}/handler/db`);

const processLogEntries = (logs) => {
	const records = {};
	logs.forEach(({ _source: {
		DateTime: timestamp,
		Database: teamspace,
		Model: model,
		Owner: owner,
		ReturnCode: retVal,
		FileSize: size,
		FileType: ext,
		Queue: jobType,
	} }) => {
		const entry = {
			timestamp, owner, retVal, size, ext,
		};

		records[teamspace] = records[teamspace] || {};
		const collection = `${model}.history`;
		records[teamspace][collection] = records[teamspace][collection] || {};
		records[teamspace][collection][jobType] = records[teamspace][collection][jobType] || [];
		records[teamspace][collection][jobType].push(entry);
	});

	return records;
};

const updateOwner = (teamspace, collection, revId, owner) => updateOne(
	teamspace, collection, { _id: stringToUUID(revId) }, { $set: { author: owner } },
);

const matchMake = async (revs, processInfo) => {
	const res = { matched: 0, impossible: 0, ambiguous: 0 };
	await Promise.all(revs.map(async ({ teamspace, collection, revId, timestamp, size, fileName }) => {
		if (processInfo?.[teamspace]?.[collection]?.MODELQ) {
			const timeLimit = 3 * 60 * 60 * 1000; // 3 hours max
			const possibleEntries = processInfo[teamspace][collection].MODELQ.filter((
				{ timestamp: recordTS, ext, size: recordSize },
			) => {
				// we have a matching log within the time limit
				const withinTimeLimit = (timestamp - recordTS) < timeLimit;
				const matchingExt = fileName.split('_').pop() === ext;
				const fileSizeSimilar = Math.abs(size - recordSize) < 1000;
				return withinTimeLimit && matchingExt && fileSizeSimilar;
			});
			if (possibleEntries.length) {
				if (possibleEntries.length === 1) {
					++res.matched;
					await updateOwner(teamspace, collection, revId, possibleEntries[0].owner);
				} else {
					const sameOwner = possibleEntries.every(({ owner }) => owner === possibleEntries[0].owner);
					if (sameOwner) {
						++res.matched;
						await updateOwner(teamspace, collection, revId, possibleEntries[0].owner);
					} else {
						logger.logInfo(`Multiple possible matches: ${timestamp} ${size} ${JSON.stringify(possibleEntries)}`);
						++res.ambiguous;
					}
				}
			} else { ++res.impossible; }
		} else {
			++res.impossible;
		}
	}));

	return res;
};

const run = async () => {
	// eslint-disable-next-line global-require
	const revEntries = require(process.argv[2]);
	// eslint-disable-next-line global-require
	const logEntries = require(process.argv[3]);
	const processInfo = processLogEntries(logEntries);
	const { matched, impossible, ambiguous } = await matchMake(revEntries, processInfo);
	logger.logInfo(`Process finished. ${matched} recovered, ${ambiguous} has multiple possible matches, ${impossible} impossible entries`);
};

if (process.argv.length < 4) {
	logger.logError('Not enough arguments. <anon owner file> <elastic log file>');
} else {
	// eslint-disable-next-line no-console
	run().catch(console.log).finally(process.exit);
}
