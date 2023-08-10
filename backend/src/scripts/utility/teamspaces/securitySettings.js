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

const { updateSecurityRestrictions, getSecurityRestrictions } = require(`${v5Path}/models/teamspaceSettings`);
const { SECURITY_SETTINGS } = require(`${v5Path}/models/teamspaces.constants`);

const determineMessage = (teamspace, config) => {
	const message = `SSO only - ${!!config[SECURITY_SETTINGS.SSO_RESTRICTED]}, Domains allowed: ${config[SECURITY_SETTINGS.DOMAIN_WHITELIST] ?? 'Any'}`;
	return `${teamspace}: ${message}`;
};

const run = async (teamspace, update, ssoRestricted, whiteList) => {
	const currRes = await getSecurityRestrictions(teamspace);
	logger.logInfo(determineMessage(teamspace, currRes));

	if (!update) return;

	const domainArr = whiteList === 'null' ? null : (whiteList || '').toLowerCase().split(',');
	await updateSecurityRestrictions(teamspace, ssoRestricted, whiteList ? domainArr : undefined);

	const updatedRes = await getSecurityRestrictions(teamspace);
	logger.logInfo(`${teamspace} has been updated. ${determineMessage(teamspace, updatedRes)}`);
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('update',
		{
			describe: 'update the restrictions',
			type: 'boolean',
			default: false,
		}).option('ssoRestricted',
		{
			describe: 'If enabled, only users who are SSO authenticated can access the data',
			type: 'boolean',
			default: undefined,
		}).option('whiteList',
		{
			describe: 'Specify the list of domains, comma separated, allowed within the teamspace (set to null to reset the list)',
			type: 'string',
		})
		.option('teamspace',
			{
				describe: 'teamspace to update',
				type: 'string',
				demandOption: true,
			});
	return yargs.command(commandName,
		'View/Update the Security restrictions on a teamspace',
		argsSpec,
		({ teamspace, update, ssoRestricted, whiteList }) => run(teamspace, update, ssoRestricted, whiteList));
};

module.exports = {
	run,
	genYargs,
};
