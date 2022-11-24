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

const { find, updateOne } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const flags = ['testEnabled']; // 'vrEnabled', 'srcEnabled', 'hereEnabled'];

const run = async () => {
	const oldFields = {};
	flags.map((f) => {
		oldFields[`customData.${f}`] = 1;
		return f;
	});

	const users = await find(
		'admin',
		'system.users',
		{ $or: flags.map((f) => ({ [`customData.${f}`]: { $exists: true } })) },
		{ user: 1, 'customData.addOns': 1, ...oldFields },
	);

	for (let i = 0; i < users.length; ++i) {
		logger.logInfo(`\t\t-${users[i].user}`);
		const updatedAddOns = users[i].customData.addOns || {};

		flags.forEach((f) => {
			if (users[i].customData[f]) {
				updatedAddOns[f] = users[i].customData[f];
			}
		});

		// eslint-disable-next-line no-await-in-loop
		await updateOne('admin', 'system.users', { _id: users[i]._id }, {
			$set: { 'customData.addOns': updatedAddOns },
			$unset: oldFields,
		});
	}
};

module.exports = run;
