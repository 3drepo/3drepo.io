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
const { getTemplateById, updateTemplate, deleteTemplates } = require('../../../v5/models/tickets.templates');
const { removeAllTicketsWithTemplates } = require('../../../v5/models/tickets');
const { removeFilesWithMeta } = require('../../../v5/services/filesManager');
const { stringToUUID } = require('../../../v5/utils/helper/uuids');

const { logger } = require(`${v5Path}/utils/logger`);

const deprecateTemplates = async (teamspace, templateIds) => {
	logger.logInfo(`Deprecating ${templateIds.length} templates in teamspace: ${teamspace}`);
	const templatesObj = await Promise.all(
		templateIds.map((id) => getTemplateById(teamspace, id).catch(() => undefined)));
	const templates = templatesObj.filter((t) => !!t);
	if (templates.length !== templateIds.length) {
		const missingTems = templateIds.filter((id) => !templates.some((t) => t._id === id));
		throw new Error(`Templates with IDs ${missingTems.join(', ')} not found in teamspace ${teamspace}`);
	}

	await Promise.all(templates.map(async (template) => {
		if (!template.deprecated) {
			await updateTemplate(teamspace, template._id, { ...template, deprecated: true });
		}
	}));
};

const run = async (teamspace, templateIdsStr) => {
	logger.logInfo(`Removing ticket templates and their associated tickets from teamspace: ${teamspace}`);

	const templateIds = templateIdsStr.split(',').map((stringToUUID));

	/*
	 * FIXME: this should really be a function inside the processor, instead of the
	 * script calling the model functions directly.
	 * The script should not need to be aware where data is stored, and if we use additional collections
	 * in the future, the processor should handle that abstraction.
	*/
	await deprecateTemplates(teamspace, templateIds);

	logger.logInfo('Removing tickets...');

	const ticketIds = await removeAllTicketsWithTemplates(teamspace, templateIds);

	logger.logInfo(`Removed ${ticketIds.length} tickets from teamspace: ${teamspace}, removing associated files...`);
	await removeFilesWithMeta(teamspace, 'tickets.resources', { ticket: { $in: ticketIds } });

	// remove the templates themselves
	await deleteTemplates(teamspace, templateIds);
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('templateIds',
		{
			describe: 'comma separated list of template IDs that should be removed and their associated tickets',
			type: 'string',
			default: false,
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
