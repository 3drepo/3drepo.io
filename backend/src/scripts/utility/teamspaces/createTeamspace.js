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

const Path = require('path');
const { v5Path } = require('../../../interop');
const { validateNewTeamspaceSchema } = require('../../../v5/schemas/teamspaces');

const { logger } = require(`${v5Path}/utils/logger`);

const { initTeamspace } = require(`${v5Path}/processors/teamspaces`);

const run = async (teamspace, user, accountId) => {
	const data = {
		name: teamspace,
		admin: user,
		accountId,
	};

	const validateData = await validateNewTeamspaceSchema(data);

	await initTeamspace(validateData.name, validateData.admin, validateData.accountId);

	logger.logInfo(`Teamspace ${teamspace} created.`);
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspace',
		{
			describe: 'name of the teamspace',
			type: 'string',
			demandOption: true,
		}).option('user',
		{
			describe: 'an email to be assigned to be an admin of this teamspace',
			type: 'string',
			demandOption: false,
		}).option('accountId', {
		describe: 'an already existing frontEgg account Id (tennant Id) for the teamspace',
		type: 'string',
		demandOption: false,
	});
	return yargs.command(commandName,
		'Create a teamspace of the name provided and gives the user specified admin privileges',
		argsSpec,
		({ teamspace, user, accountId }) => run(teamspace, user, accountId));
};

module.exports = {
	run,
	genYargs,
};
