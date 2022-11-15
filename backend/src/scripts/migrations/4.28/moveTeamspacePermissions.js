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

const { find, updateMany, updateOne } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const run = async () => {
	const users = await find(
		'admin',
		'system.users',
		{ 'customData.permissions': { $exists: true } },
		{ _id: 0, user: 1, 'customData.permissions': 1 },
	);
	for (let i = 0; i < users.length; ++i) {
		const db = users[i].user;
		const { permissions } = users[i].customData;

		if (permissions) {
			logger.logInfo(`\t\t-${db}`);
			// eslint-disable-next-line no-await-in-loop
			await updateOne(db, 'teamspace', {}, { $set: { permissions: users[i].customData.permissions } });
		}
	}

	await updateMany('admin', 'system.users', {}, { $unset: { 'customData.permissions': 1 } });
};

module.exports = run;
