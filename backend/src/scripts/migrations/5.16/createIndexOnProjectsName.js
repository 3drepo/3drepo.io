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
const { v5Path } = require('../../../interop');

const { getTeamspaceList } = require('../../utils');

const { COL_NAME } = require(`${v5Path}/models/projectSettings.constants`);
const { createIndex } = require(`${v5Path}/handler/db`);

const { logger } = require(`${v5Path}/utils/logger`);

const run = async () => {
	const teamspaces = await getTeamspaceList();

	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await createIndex(teamspace, COL_NAME, { name: 1 }, { unique: true });
	}
};

module.exports = run;
