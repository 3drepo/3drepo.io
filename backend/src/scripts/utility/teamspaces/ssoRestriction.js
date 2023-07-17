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

const { updateSSORestriction, getSSORestriction } = require(`${v5Path}/models/teamspaceSettings`);

const determineMessage = (teamspace, restriction) => {
	let message = 'is not enforcing any authentication restriction';

	if (restriction) {
		message = restriction?.length ? `only allow SSO authenticated users from the following domain(s): ${restriction.join(',')}` : 'allow any users who is SSO authenticated';
	}
	return `${teamspace} ${message}`;
};

const run = async (teamspace, view, update, enabled, whiteList) => {
	if (update && !enabled && whiteList) {
		throw new Error('Inconsistent options: cannot define a whitelist whilst trying to disable SSO restriction.');
	}

	const currRes = await getSSORestriction(teamspace);
	logger.logInfo(determineMessage(teamspace, currRes));

	if (!update) return;

	const domainArr = whiteList ? whiteList.toLowerCase().split(',') : undefined;
	await updateSSORestriction(teamspace, enabled, domainArr);

	const updatedRes = await getSSORestriction(teamspace);
	logger.logInfo(`${teamspace} has been updated. ${determineMessage(teamspace, updatedRes)}`);
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('view',
		{
			describe: 'View the current SSO restriction on the teamspace',
			type: 'boolean',
			default: true,
		}).option('update',
		{
			describe: 'update the SSO restriction',
			type: 'boolean',
			default: false,
		}).option('enabled',
		{
			describe: 'If enabled, only users who are SSO authenticated can access the data',
			type: 'boolean',
		}).option('whiteList',
		{
			describe: 'Specify the list of domains, comma separated, allowed within the teamspace (if none specified, there is no restriction)',
			type: 'string',
		})
		.option('teamspace',
			{
				describe: 'teamspace to update',
				type: 'string',
				demandOption: true,
			});
	return yargs.command(commandName,
		'View/Update the SSO restriction on a teamspace (Whether users needs to be SSO authenticated to access the data)',
		argsSpec,
		({ teamspace, view, update, enabled, whiteList }) => run(teamspace, view, update, enabled, whiteList));
};

module.exports = {
	run,
	genYargs,
};
