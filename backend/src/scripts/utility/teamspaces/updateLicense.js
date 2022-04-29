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

const { isValidType, validateSchema } = require(`${v5Path}/middleware/dataConverter/schemas/subscriptions`);
const { getSubscriptions, editSubscriptions, removeSubscription } = require(`${v5Path}/models/teamspaces`);

const run = async (teamspace, remove, type, collaborators, data, expiryDate) => {
	const subs = await getSubscriptions(teamspace);
	logger.logInfo(`${teamspace} currently has the following subscription(s): ${JSON.stringify(subs)}`);

	if (remove) {
		if (isValidType(type)) {
			await removeSubscription(teamspace, type);
		} else {
			throw new Error(`Unrecognised license type: ${type}`);
		}
	} else {
		const changes = await validateSchema(type, { collaborators, data, expiryDate });
		await editSubscriptions(teamspace, type, changes);
	}
	const subsUpdated = await getSubscriptions(teamspace);
	logger.logInfo(`${teamspace} has been updated. Current subscription(s): ${JSON.stringify(subsUpdated)}`);
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('users', {
		describe: 'number of users on the license',
		type: 'string',
	}).option('data', {
		describe: 'data quota on the license(in MiB)',
		type: 'number',
	}).option('expiryDate', {
		describe: 'expiry date on the license',
		type: 'string',
	}).option('type', {
		describe: 'type of license',
		type: 'string',
	})
		.option('teamspace', {
			describe: 'teamspace to update',
			type: 'string',
			demandOption: true,
		})
		.option('remove', {
			describe: 'remove license from user',
			type: 'boolean',
			default: false,
		});
	return yargs.command(commandName,
		'Update the license on a teamspace',
		argsSpec,
		(argv) => run(argv.teamspace, argv.remove, argv.type, argv.users, argv.data, argv.expiryDate === 'null' ? null : argv.expiryDate));
};

module.exports = {
	run,
	genYargs,
};
