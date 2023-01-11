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

const Path = require('path');
const { v5Path } = require('../../../interop');
const { getTeamspaceList } = require('../../utils');

const { listCollections } = require(`${v5Path}/handler/db`);
const { createTeamspaceSettings } = require(`${v5Path}/models/teamspaceSettings`);

const run = async () => {
	const teamspaces = await getTeamspaceList();
	const tsPromises = [];
	for (const teamspace of teamspaces) {
		// eslint-disable-next-line no-await-in-loop
		const collections = (await listCollections(teamspace)).map(({ name }) => name);
		if (!collections.includes('teamspace')) {
			tsPromises.push(createTeamspaceSettings(teamspace));
		}
	}
	await Promise.all(tsPromises);
};

const genYargs = /* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	return yargs.command(commandName,
		'Create teamspace settings for databases missing teamspace collection',
		{},
		run);
};

module.exports = {
	run,
	genYargs,
};
