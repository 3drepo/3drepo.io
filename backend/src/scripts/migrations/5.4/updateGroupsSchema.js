/**
 *  Copyright (C) 2023 3D Repo Ltd
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
const { castSchema } = require('../../../v5/schemas/rules');

const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { find, updateOne } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

/* eslint-disable no-await-in-loop */

const processCollection = async (teamspace, collection) => {
	const query = {
		rules: {
			$exists: true,
			$elemMatch: {
				field: { $type: 'string' },
			},
		},
	};
	const projection = { rules: 1 };

	const updatePromises = [];
	const groups = await find(teamspace, collection, query, projection);

	groups.forEach((group) => {
		const formattedRules = castSchema(group.rules);
		updatePromises.push(updateOne(teamspace, collection, { _id: group._id }, { $set: { rules: formattedRules } }));
	});

	await Promise.all(updatePromises);
};

const processTeamspace = async (teamspace) => {
	const collections = await getCollectionsEndsWith(teamspace, '.groups');

	for (let i = 0; i < collections.length; ++i) {
		const { name: colName } = collections[i];
		logger.logInfo(`\t-[${teamspace}]${colName} (${i + 1}/${collections.length})`);
		await processCollection(teamspace, colName);
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		await processTeamspace(teamspace);
	}
};

/* eslint-disable no-await-in-loop */
module.exports = run;
