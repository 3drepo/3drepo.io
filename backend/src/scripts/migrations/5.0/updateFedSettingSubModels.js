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
const { getTeamspaceList } = require('../../utils');

const { find, bulkWrite } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const SETTINGS_COLL = 'settings';

const processTeamspace = async (teamspace) => {
	const oldSchemaFedSettings = await find(teamspace, SETTINGS_COLL, { 'subModels.model': { $exists: true } }, { subModels: 1 });
	const settingsUpdates = oldSchemaFedSettings.map(({ _id, subModels }) => ({ updateOne: {
		filter: { _id },
		update: { $set: { subModels: subModels.map((subModel) => (subModel.model ? subModel.model : subModel)) } },
	} }));

	if (settingsUpdates.length) {
		logger.logInfo(`\t\t\t-Updating ${settingsUpdates.length} documents in ${teamspace}`);
		await bulkWrite(teamspace, SETTINGS_COLL, settingsUpdates);
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (let i = 0; i < teamspaces.length; ++i) {
		logger.logInfo(`\t\t-${teamspaces[i]}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspaces[i]);
	}
};

module.exports = run;
