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
const { ADD_ONS } = require('../../../v5/models/teamspaces.constants');

const { getTeamspaceList } = require('../../utils');

const { logger } = require(`${v5Path}/utils/logger`);
const { getAddOns, updateAddOns } = require(`${v5Path}/models/teamspaceSettings`);
const { ADD_ONS_MODULES } = require(`${v5Path}/models/teamspaces.constants`);

const processTeamspace = async (teamspace) => {
	const addOns = getAddOns(teamspace);

	if (!addOns[ADD_ONS.MODULES]) {
		const update = { modules: Object.values(ADD_ONS_MODULES) };
		await updateAddOns(teamspace, update);
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
