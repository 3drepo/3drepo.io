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

const { initTeamspace } = require(`${v5Path}/processors/teamspaces`);
const { addUser, getUserByUsernameOrEmail } = require(`${v5Path}/models/users`);
const { getTeamspaceSetting } = require(`${v5Path}/models/teamspaceSettings`);
const { getUserById, doesUserExist } = require(`${v5Path}/services/sso/frontegg`);
const { templates } = require(`${v5Path}/utils/responseCodes`);

const run = async (teamspace, user, accountId) => {
	logger.logInfo(`Checking ${user} information...`);
	const userMetaData = { user, createUser: false };
	try {
		const userInformation = await getUserByUsernameOrEmail(user);
		userMetaData.user = userInformation.user;
	} catch (error) {
		if (error.message !== templates.userNotFound.message) throw error;

		const frontEggUserId = await doesUserExist(user);
		if (frontEggUserId) {
			const frontEggUserData = await getUserById(frontEggUserId);
			logger.logInfo(`Creating ${user} from existing information...`);
			await addUser(frontEggUserData);
			const userInformation = await getUserByUsernameOrEmail(user);
			userMetaData.user = userInformation.user;
		} else {
			userMetaData.createUser = true;
		}
	}

	logger.logInfo(`Checking if teamspace ${teamspace} already exists...`);
	const teamspaceExists = await getTeamspaceSetting(teamspace, { _id: 1 }).catch(() => false);

	if (teamspaceExists) {
		throw new Error('Teamspace already exists');
	}

	await initTeamspace(teamspace, userMetaData.user, accountId, userMetaData.createUser);
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
			describe: 'a user to be assigned to be an admin of this teamspace',
			type: 'string',
			demandOption: true,
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
