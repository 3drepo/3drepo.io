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

const { logger } = require(`${v5Path}/utils/logger`);

const { getAllUsersInAccount } = require(`${v5Path}/services/sso/frontegg`);
const { getMemberInfoFromId } = require(`${v5Path}/models/users`);
const { removeSubscription, removeAddOns, getTeamspaceSetting } = require(`${v5Path}/models/teamspaceSettings`);
const { revokeTeamspaceRoleFromUser } = require(`${v5Path}/models/roles`);
const { deleteProject } = require(`${v5Path}/processors/teamspaces/projects`);
const { getProjectList } = require(`${v5Path}/models/projectSettings`);

const removeAllProjects = async (teamspace) => {
	const projects = await getProjectList(teamspace);
	return Promise.all(projects.map(({ _id }) => deleteProject(teamspace, _id)));
};

const removeAllUsersFromTS = async (teamspace) => {
	const { refId: tenantId } = await getTeamspaceSetting(teamspace, { refId: 1 });
	const frontEggUsers = await getAllUsersInAccount(tenantId);
	const membersList = await Promise.all(frontEggUsers.map((user) => getMemberInfoFromId(user.id)));
	return Promise.all(
		membersList.map(({ user }) => ((user !== teamspace)
			? revokeTeamspaceRoleFromUser(teamspace, user) : Promise.resolve())),
	);
};

const run = async (teamspaces) => {
	if (!teamspaces?.length) throw new Error('A list of teamspaces must be provided');
	const teamspaceArr = teamspaces.split(',');

	for (const teamspace of teamspaceArr) {
		logger.logInfo(`-${teamspace}`);
		const opsProms = [

			removeSubscription(teamspace),
			removeAddOns(teamspace),
			removeAllProjects(teamspace),
			removeAllUsersFromTS(teamspace),
		];

		try {
			// eslint-disable-next-line no-await-in-loop
			await Promise.all(opsProms);
		} catch (err) {
			/* istanbul ignore next */
			logger.logError(`\tFailed to remove data from ${teamspace}: ${err?.message}`);
		}
	}

	logger.logInfo('done');
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspaces',
		{
			describe: 'teamspaces to remove data from (comma separated)',
			type: 'string',
			demandOption: true,
		});
	return yargs.command(commandName,
		'Remove Teamspace data, reset permissions and licenses',
		argsSpec,
		(argv) => run(argv.teamspaces));
};

module.exports = {
	run,
	genYargs,
};
