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
const { bulkWrite } = require('../../../v5/handler/db');
const { convertLegacyRules } = require('../../../v5/schemas/rules');

const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { find } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const processCollection = async (teamspace, collection) => {
	const query = {
		'rules.field': { $type: 'string' },
	};

	const projection = { rules: 1 };

	const groups = await find(teamspace, collection, query, projection);

	const groupUpdates = groups.map(({ rules, _id }) => ({
		updateOne: {
			filter: { _id },
			update: { $set: { rules: convertLegacyRules(rules) } },
		},
	}));

	if (groupUpdates.length) {
		try {
			await bulkWrite(teamspace, collection, groupUpdates);
		} catch (err) {
			logger.logError(err);
		}
	}
};

const processTeamspace = async (teamspace) => {
	const collections = await getCollectionsEndsWith(teamspace, '.groups');

	for (let i = 0; i < collections.length; ++i) {
		const { name: colName } = collections[i];
		logger.logInfo(`\t-[${teamspace}]${colName} (${i + 1}/${collections.length})`);
		// eslint-disable-next-line no-await-in-loop
		await processCollection(teamspace, colName);
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace);
	}
};

module.exports = run;
