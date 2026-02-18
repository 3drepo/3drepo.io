/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { removeTicketsWithTemplates } = require(`${v5Path}/processors/teamspaces/projects/models/commons/tickets`);
const { stringToUUID } = require(`${v5Path}/utils/helper/uuids`);
const { deleteTemplates, deprecateTemplates } = require(`${v5Path}/models/tickets.templates`);
const { logger } = require(`${v5Path}/utils/logger`);

const run = async (teamspace, templateIdsStr) => {
	logger.logInfo(`Removing ticket templates and their associated tickets from teamspace: ${teamspace}`);

	const templateIds = templateIdsStr.split(',').map((stringToUUID));

	await deprecateTemplates(teamspace, templateIds);

	logger.logInfo('Removing tickets and associated files...');

	await removeTicketsWithTemplates(teamspace, templateIds);

	// remove the templates themselves
	await deleteTemplates(teamspace, templateIds);
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('templateIds',
		{
			describe: 'comma separated list of template IDs that should be removed and their associated tickets',
			type: 'string',
			demandOption: true,
		})
		.option('teamspace',
			{
				describe: 'teamspace to update',
				type: 'string',
				demandOption: true,
			});
	return yargs.command(commandName,
		'Remove ticket templates and their associated tickets from a teamspace',
		argsSpec,
		({ teamspace, templateIds }) => run(teamspace, templateIds));
};

module.exports = {
	run,
	genYargs,
};
