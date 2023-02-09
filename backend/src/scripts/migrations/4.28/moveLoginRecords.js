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

const { v5Path } = require('../../../interop');

const { listCollections, dropDatabase, dropCollection, find, insertMany } = require(`${v5Path}/handler/db`);
const { INTERNAL_DB } = require(`${v5Path}/handler/db.constants`);
const { logger } = require(`${v5Path}/utils/logger`);
const { initialise } = require(`${v5Path}/models/loginRecords`);

const loginRecordsCol = 'loginRecords';

const processUser = async (user) => {
	const records = await find(loginRecordsCol, user, {});
	const formattedRecs = records.map((data) => ({ ...data, user }));

	await insertMany(INTERNAL_DB, loginRecordsCol, formattedRecs);
	await dropCollection(loginRecordsCol, user);
};

const run = async () => {
	const [users] = await Promise.all([
		listCollections(loginRecordsCol),
		initialise(),
	]);
	for (let i = 0; i < users.length; ++i) {
		logger.logInfo(`\t\t-${users[i].name}`);
		// eslint-disable-next-line no-await-in-loop
		await processUser(users[i].name);
	}

	await dropDatabase(loginRecordsCol);
};

module.exports = run;
