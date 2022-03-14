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

/**
 * since 4.20.1 bouncer, we introduced a bug that may have caused a loss of data regarding who uploaded the revision
 * This script aims to recover this data from by the EFS entry.
 * Details of the bug: https://github.com/3drepo/3drepobouncer/issues/558
 */

const { v5Path } = require('../../interop');

const { getTeamspaceList, getCollectionsEndsWith } = require('../utils');

const { logger } = require(`${v5Path}/utils/logger`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);
const { find, updateOne } = require(`${v5Path}/handler/db`);
const { cn_queue: { shared_storage: sharedDir } } = require(`${v5Path}/utils/config`);

const DayJS = require('dayjs');
const Path = require('path');
const { writeFileSync } = require('fs');

const dateToString = (date) => DayJS(date).format('DD/MM/YYYY HH:MM');

const queueDirs = [
	sharedDir,
	/* 'Y:/aws-backup-restore_2022-03-14T16-16-05-773Z/queue',
	'Y:/aws-backup-restore_2022-03-14T16-15-49-253Z/queue',
	'Y:/aws-backup-restore_2022-03-14T15-53-47-269Z/queue',
	'Y:/aws-backup-restore_2022-03-14T15-52-17-647Z/queue',
	*/
];

let recoveredCount = 0;

const attemptToFindRealOwner = (id) => {
	const filePaths = queueDirs.map((dir) => Path.join(dir, `${id}.json`));
	for (const pathToTry of filePaths) {
		try {
			// eslint-disable-next-line global-require
			const json = require(pathToTry);
			if (json) {
				return json.owner;
			}
		} catch {
			// not found, next
		}
	}
	return undefined;
};

const getAnonOwnerRecords = async (teamspace, collection) => {
	const records = await find(teamspace, collection, { author: 'ANONYMOUS USER' }, { _id: 1, timestamp: 1 });
	const res = await Promise.all(records.map(async ({ _id, timestamp }) => {
		const revId = UUIDToString(_id);
		const owner = attemptToFindRealOwner(revId);
		if (!owner) {
			return {
				teamspace,
				collection,
				revId,
				timestamp: dateToString(timestamp),
			};
		}
		logger.logInfo(`[${teamspace}][${collection}][${revId}] owner found (${owner}). recovering...`);
		++recoveredCount;
		await updateOne(teamspace, collection, { _id }, { $set: { author: owner } });
		return [];
	}));

	return res.flat();
};

const processTeamspace = async (teamspace) => {
	const histories = await getCollectionsEndsWith(teamspace, '.history');
	return Promise.all(histories.map(({ name }) => getAnonOwnerRecords(teamspace, name)));
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	const revList = [];
	for (let i = 0; i < teamspaces.length; ++i) {
		logger.logInfo(`\t\t-${teamspaces[i]}`);

		// eslint-disable-next-line no-await-in-loop
		const list = await processTeamspace(teamspaces[i]);
		if (list.length) revList.push(...list.flat());
	}
	logger.logInfo(`${revList.length + recoveredCount} records found. ${recoveredCount} owners recovered.`);
	const filePath = 'anonOwners.json';
	logger.logInfo(`Unrecoverable entries written to ${filePath}`);
	writeFileSync(filePath, JSON.stringify(revList));
};

if (process.argv.length < 1) {
	logger.logError('Not enough arguments. (???)');
} else {
	// eslint-disable-next-line no-console
	run().catch(console.log).finally(process.exit);
}
